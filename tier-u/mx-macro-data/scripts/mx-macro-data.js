/**
 * mx-macro-data helper
 * Query EastMoney mxClaw API for global macroeconomic data.
 * Requires EM_API_KEY — get one at https://ai.eastmoney.com/mxClaw
 */

const ENDPOINT = 'https://ai-saas.eastmoney.com/proxy/b/mcp/tool/searchMacroData';

function makeCtx() {
  return {
    callId: 'call_' + Math.random().toString(36).slice(2, 10),
    userId: 'user_' + Math.random().toString(36).slice(2, 10),
  };
}

/**
 * Query macroeconomic data with natural language.
 * @param {string} apiKey - EastMoney API key
 * @param {string} query - Natural language query
 * @returns {Promise<object>} Raw API response
 */
async function query(apiKey, query) {
  const ctx = makeCtx();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'em_api_key': apiKey,
    },
    body: JSON.stringify({ query, toolContext: ctx }),
  });
  return res.json();
}

/**
 * Parse rows from macro data response.
 */
function parseRows(data) {
  const result = data?.data ?? {};
  return result?.dataList ?? result?.macroDataResultDTO?.dataList ?? [];
}

module.exports = { query, parseRows };
