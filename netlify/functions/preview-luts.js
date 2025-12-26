const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { applyLUT } = require('./lut-processor');

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
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Thumbnail menor para preview rápido
    const maxSize = 600;
    if (metadata.width > maxSize || metadata.height > maxSize) {
      image = image.resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true });
    }

    // Obter TODOS os LUTs disponíveis
    const lutsDir = path.join(__dirname, '../../luts');
    const allLutFiles = fs.readdirSync(lutsDir)
      .filter(file => file.endsWith('.cube'))
      .map(file => path.basename(file, '.cube'))
      .sort();

    // Para evitar estouro de payload e timeout, processar apenas 30 LUTs principais
    const maxPreviews = 30;
    const mainLuts = [
      'fuji_400h', 'kodak_portra_400', 'kodak_ektar_100',
      'fuji_provia_100f', 'kodak_portra_160', 'fuji_velvia_50',
      'ilford_hp_5_plus_400', 'kodak_portra_800', 'fuji_astia_100f',
      'ilford_delta_400', 'fuji_superia_100', 'kodak_portra_160_vc',
      'fuji_160c', 'ilford_delta_3200', 'kodak_portra_400_vc',
      'fuji_velvia_100', 'agfa_vista_200', 'fuji_800z',
      'ilford_hp_5', 'fuji_provia_400f', 'kodak_portra_160_nc',
      'agfa_apx_100', 'fuji_superia_1600', 'ilford_pan_f_plus_50',
      'kodak_portra_400_nc', 'ilford_delta_100', 'fuji_provia_400x',
      'agfa_precisa_100', 'polaroid_polablue', 'kodak_portra_800_++'
    ];
    
    const previewLuts = mainLuts.filter(lut => allLutFiles.includes(lut)).slice(0, maxPreviews);
    
    // Processar cada LUT
    const previews = {};
    for (const lutName of previewLuts) {
      const lutPath = path.join(lutsDir, `${lutName}.cube`);
      
      try {
        // Aplicar LUT na imagem
        const processedImage = await applyLUT(image.clone(), lutPath);
        const buffer = await processedImage.jpeg({ quality: 85 }).toBuffer();
        previews[lutName] = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      } catch (error) {
        console.error(`Erro ao processar LUT ${lutName}:`, error.message);
        // Em caso de erro, usar imagem original
        const buffer = await image.clone().jpeg({ quality: 85 }).toBuffer();
        previews[lutName] = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      }
    }

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
        message: `Mostrando ${previewLuts.length} previews processados de ${allLutFiles.length} filtros disponíveis`
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
