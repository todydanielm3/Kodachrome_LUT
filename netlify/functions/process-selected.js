const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const archiver = require('archiver');
const { applyLUT } = require('./lut-processor');

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
    const selectedLuts = body.selected_luts;

    if (!imageData || !selectedLuts || !Array.isArray(selectedLuts) || selectedLuts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'image_data e selected_luts são obrigatórios',
          example: { image_data: 'base64...', selected_luts: ['kodak_portra_400', 'fuji_400h'] }
        })
      };
    }

    // Limite de segurança para não estourar timeout
    if (selectedLuts.length > 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Máximo de 50 LUTs por vez para evitar timeout'
        })
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

    // Processar imagem (tamanho máximo para qualidade final)
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Redimensionar se muito grande (max 1920px para output final)
    const maxSize = 1920;
    if (metadata.width > maxSize || metadata.height > maxSize) {
      image = image.resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true });
    }

    // Processar cada LUT selecionado
    const lutsDir = path.join(__dirname, '../../luts');
    const processedImages = {};

    for (const lutName of selectedLuts) {
      const lutPath = path.join(lutsDir, `${lutName}.cube`);
      
      if (!fs.existsSync(lutPath)) {
        console.warn(`LUT não encontrado: ${lutName}`);
        continue;
      }

      try {
        // Aplicar LUT na imagem
        const processedImage = await applyLUT(image.clone(), lutPath);
        const buffer = await processedImage.jpeg({ quality: 92 }).toBuffer();
        const imageBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        processedImages[lutName] = imageBase64;
      } catch (error) {
        console.error(`Erro ao processar LUT ${lutName}:`, error.message);
      }
    }

    // Criar ZIP com as imagens
    const zipBuffer = await createZipBuffer(processedImages);
    const zipBase64 = zipBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        processed_count: Object.keys(processedImages).length,
        zip_data: zipBase64,
        zip_size: zipBuffer.length,
        luts_processed: Object.keys(processedImages)
      })
    };

  } catch (error) {
    console.error('Erro ao processar LUTs selecionados:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao processar LUTs selecionados',
        details: error.message 
      })
    };
  }
};

// Função auxiliar para criar ZIP
function createZipBuffer(images) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', {
      zlib: { level: 6 } // Compressão balanceada
    });

    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Adicionar cada imagem ao ZIP
    Object.entries(images).forEach(([lutName, imageBase64]) => {
      // Converter base64 para buffer
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      archive.append(imageBuffer, { name: `${lutName}.jpg` });
    });

    archive.finalize();
  });
}
