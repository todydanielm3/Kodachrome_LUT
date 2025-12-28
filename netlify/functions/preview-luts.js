const fs = require('fs');
const path = require('path');
// Sharp removido temporariamente para evitar problemas de build no Netlify
// const sharp = require('sharp');
// const { applyLUT } = require('./lut-processor'); // Desabilitado temporariamente por timeout

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

    console.log('Processando preview de LUTs...');

    // Parse da imagem - apenas para validação, não processamos
    let imageBuffer;
    if (imageData.includes(',')) {
      const base64Data = imageData.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      imageBuffer = Buffer.from(imageData, 'base64');
    }

    console.log(`Imagem recebida: ${imageBuffer.length} bytes`);

    // Usar a imagem original como base para todos os previews (modo demo ultra-rápido)
    // Sem processamento Sharp para evitar problemas de compatibilidade no Netlify
    const thumbnailBase64 = imageData.includes(',') ? imageData : `data:image/jpeg;base64,${imageData}`;

    // Obter TODOS os LUTs disponíveis - buscar na raiz do projeto
    // Usar process.cwd() que sempre aponta para a raiz do projeto
    const lutsDir = path.join(process.cwd(), 'luts');
    
    console.log(`Procurando LUTs em: ${lutsDir}`);
    
    // Verificar se o diretório existe
    if (!fs.existsSync(lutsDir)) {
      console.error(`Diretório de LUTs não encontrado: ${lutsDir}`);
      console.error(`process.cwd(): ${process.cwd()}`);
      console.error(`__dirname: ${__dirname}`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Diretório de LUTs não encontrado',
          path: lutsDir,
          cwd: process.cwd(),
          dirname: __dirname
        })
      };
    }
    
    const allLutFiles = fs.readdirSync(lutsDir)
      .filter(file => file.endsWith('.cube'))
      .map(file => path.basename(file, '.cube'))
      .sort();

    console.log(`Total de LUTs disponíveis: ${allLutFiles.length}`);

    // Selecionar apenas 30 LUTs principais para preview
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
    
    const previewLuts = mainLuts.filter(lut => allLutFiles.includes(lut)).slice(0, 30);
    
    console.log(`Processando ${previewLuts.length} previews...`);

    // MODO DEMO: Por enquanto retornar a mesma imagem para todos os previews
    // Processamento real de LUT é muito lento para ambiente serverless (timeout)
    // TODO: Implementar processamento em background ou cache
    const previews = {};
    for (const lutName of previewLuts) {
      // Usar mesma thumbnail para todos (modo demo rápido)
      previews[lutName] = thumbnailBase64;
    }

    console.log(`Preview concluído: ${Object.keys(previews).length} imagens`);

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
        message: `Mostrando ${previewLuts.length} previews de ${allLutFiles.length} filtros disponíveis`,
        mode: 'demo'
      })
    };

  } catch (error) {
    console.error('Erro ao gerar previews:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao gerar previews',
        details: error.message,
        stack: error.stack
      })
    };
  }
};
