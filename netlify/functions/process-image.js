const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse body
    const body = JSON.parse(event.body);
    const imageData = body.image_data;

    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'image_data é obrigatório' })
      };
    }

    // Verificar se existem LUTs
    const lutDir = path.join(__dirname, '../../luts');
    
    if (!fs.existsSync(lutDir)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Pasta de LUTs não encontrada' })
      };
    }

    const lutFiles = fs.readdirSync(lutDir)
      .filter(file => file.endsWith('.cube'))
      .sort();

    if (lutFiles.length === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Nenhum LUT encontrado' })
      };
    }

    // Tentar usar o script Python para processamento real
    try {
      const pythonScript = path.join(__dirname, '../../process_luts.py');
      const venvPython = path.join(__dirname, '../../.venv/bin/python');
      
      const result = await new Promise((resolve, reject) => {
        const pythonProcess = spawn(venvPython, [pythonScript], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve(result);
            } catch (e) {
              reject(new Error(`Erro ao parsear output Python: ${e.message}`));
            }
          } else {
            reject(new Error(`Python script falhou: ${errorOutput}`));
          }
        });
        
        // Enviar dados para o script Python
        pythonProcess.stdin.write(JSON.stringify({
          httpMethod: 'POST',
          body: JSON.stringify(body)
        }));
        pythonProcess.stdin.end();
        
        // Timeout de 30 segundos
        setTimeout(() => {
          pythonProcess.kill();
          reject(new Error('Timeout no processamento Python'));
        }, 30000);
      });
      
      return result;
      
    } catch (pythonError) {
      console.log('Erro Python, usando fallback JavaScript:', pythonError.message);
      
      // Fallback: usar JavaScript (modo demo)
      const lutNames = lutFiles.map(file => path.basename(file, '.cube'));
      const processedImages = {};
      
      // Para demo, usar a imagem original para todos os LUTs
      let cleanImageData = imageData;
      if (imageData.includes(',')) {
        cleanImageData = imageData.split(',')[1];
      }

      // Carregar todos os LUTs (demo mode - usando imagem original)
      lutNames.forEach(lutName => {
        processedImages[lutName] = cleanImageData;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          luts: lutNames,
          processed_images: processedImages,
          message: `Modo demo JavaScript - ${lutNames.length} LUTs carregados (processamento Python falhou)`
        })
      };
    }

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Erro interno: ${error.message}` })
    };
  }
};
