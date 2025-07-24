const archiver = require('archiver');
const { Readable } = require('stream');

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
    const body = JSON.parse(event.body);
    const selectedLuts = body.selected_luts || [];
    const filename = body.filename || 'image';

    if (selectedLuts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nenhum LUT selecionado' })
      };
    }

    // Para esta demonstração, retornar erro pedindo para reprocessar
    // Em produção, você teria as imagens armazenadas temporariamente
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Funcionalidade de download em desenvolvimento. Por favor, processe a imagem novamente.'
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
