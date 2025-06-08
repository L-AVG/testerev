// Usamos o 'node-fetch' v2 que é compatível com CommonJS
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Permite apenas requisições POST para esta função
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: 'A chave da API da OpenAI não foi configurada no ambiente.' }}) };
  }

  try {
    const { endpoint, method, body } = JSON.parse(event.body);

    const options = {
      method: method, // Usará 'GET' ou 'POST' conforme enviado pelo frontend
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Header necessário para a API
      }
    };
    
    // Adiciona o body apenas para requisições que não sejam GET
    if (method.toUpperCase() !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.openai.com/v1/${endpoint}`, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};