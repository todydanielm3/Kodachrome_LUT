const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Lista de LUTs principais para preview rápido (30 primeiros)
const PREVIEW_LUTS = [
  'agfa_apx_100',
  'agfa_precisa_100',
  'agfa_vista_200',
  'fuji_160c',
  'fuji_400h',
  'fuji_800z',
  'fuji_astia_100f',
  'fuji_provia_100f',
  'fuji_provia_400f',
  'fuji_superia_100',
  'fuji_superia_1600',
  'fuji_velvia_50',
  'fuji_velvia_100',
  'kodak_ektar_100',
  'kodak_portra_160',
  'kodak_portra_160_nc',
  'kodak_portra_160_vc',
  'kodak_portra_400',
  'kodak_portra_400_nc',
  'kodak_portra_400_vc',
  'kodak_portra_800',
  'kodak_portra_800_++',
  'ilford_delta_100',
  'ilford_delta_400',
  'ilford_delta_3200',
  'ilford_hp_5_plus_400',
  'ilford_hp_5',
  'ilford_pan_f_plus_50',
  'ilford_xp_2',
  'polaroid_polablue'
];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const imageData = body.image_data;

    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'image_data é obrigatório' })
      };
    }

    // Parse da imagem
    let imageBuffer;
    if (imageData.includes(',')) {
      const base64Data = imageData.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      imageBuffer = Buffer.from(imageData, 'base64');
    }

    // Processar imagem - criar thumbnail menor para preview (600px max)
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Thumbnail menor para preview rápido
    const maxSize = 600;
    if (metadata.width > maxSize || metadata.height > maxSize) {
      image.resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true });
    }

    const thumbnailBuffer = await image.jpeg({ quality: 85 }).toBuffer();
    const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

    // Obter TODOS os LUTs disponíveis
    const lutsDir = path.join(__dirname, '../../luts');
    const allLutFiles = fs.readdirSync(lutsDir)
      .filter(file => file.endsWith('.cube'))
      .map(file => path.basename(file, '.cube'))
      .sort();

    // Para evitar estouro de payload, retornar apenas 50 previews por vez
    // com a mesma imagem (modo demo rápido)
    const maxPreviews = 50;
    const previewLuts = allLutFiles.slice(0, maxPreviews);
    
    const previews = {};
    previewLuts.forEach(lutName => {
      previews[lutName] = thumbnailBase64;
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        previews: previews,
        preview_count: previewLuts.length,
        all_luts: allLutFiles,
        total_luts: allLutFiles.length,
        message: `Mostrando ${previewLuts.length} de ${allLutFiles.length} previews`
      })
    };

  } catch (error) {
    console.error('Erro ao gerar previews:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao gerar previews',
        details: error.message 
      })
    };
  }
};
