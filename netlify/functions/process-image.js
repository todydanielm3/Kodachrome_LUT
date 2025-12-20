const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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

    // Obter lista de LUTs
    const lutsDir = path.join(__dirname, '../../luts');
    const lutFiles = fs.readdirSync(lutsDir)
      .filter(file => file.endsWith('.cube'))
      .sort();

    const lutNames = lutFiles.map(file => path.basename(file, '.cube'));

    // Parse da imagem
    let imageBuffer;
    if (imageData.includes(',')) {
      const base64Data = imageData.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      imageBuffer = Buffer.from(imageData, 'base64');
    }

    // Processar imagem com Sharp (redimensionar se necessário)
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Redimensionar se muito grande
    const maxSize = 1200;
    if (metadata.width > maxSize || metadata.height > maxSize) {
      image.resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true });
    }

    const processedBuffer = await image.jpeg({ quality: 90 }).toBuffer();
    const processedBase64 = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    // Por enquanto, retornar a mesma imagem para todas as LUTs (modo demo rápido)
    // Em produção, aqui seria aplicado cada LUT
    const processedImages = {};
    lutNames.forEach(lutName => {
      processedImages[lutName] = processedBase64;
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        luts: lutNames,
        processed_images: processedImages,
        count: lutNames.length
      })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao processar imagem',
        details: error.message 
      })
    };
  }
};
