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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Carregar lista de LUTs
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

    const lutNames = lutFiles.map(file => path.basename(file, '.cube'));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        luts: lutNames,
        total: lutNames.length,
        message: `${lutNames.length} LUTs disponíveis`
      })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Erro interno: ${error.message}` })
    };
  }
};
