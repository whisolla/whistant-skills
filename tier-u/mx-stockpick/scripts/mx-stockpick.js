/**
 * mx-stockpick helper
 * Natural language stock screener via EastMoney mxClaw API.
 * Requires EM_API_KEY — get one at https://ai.eastmoney.com/mxClaw
 */

const ENDPOINT = 'https://ai-saas.eastmoney.com/proxy/b/mcp/tool/selectSecurity';

const SELECT_TYPES = ['A股', '港股', '美股', '基金', 'ETF', '可转债', '板块'];

function makeCtx() {
  return {
    callId: 'call_' + Math.random().toString(36).slice(2, 10),
    userId: 'user_' + Math.random().toString(36).slice(2, 10),
  };
}

/**
 * Screen stocks/ETFs/funds using natural language.
 * @param {string} apiKey - EastMoney API key
 * @param {string} query - Natural language screening criteria
 * @param {string} selectType - Asset type (default: 'A股')
 * @returns {Promise<object>} Raw API response
 */
async function screen(apiKey, query, selectType = 'A股') {
  const ctx = makeCtx();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'em_api_key': apiKey,
    },
    body: JSON.stringify({ query, selectType, toolContext: ctx }),
  });
  return res.json();
}

/**
 * Parse screened results from API response.
 */
function parseResults(data) {
  return data?.data ?? {};
}

module.exports = { screen, parseResults, SELECT_TYPES };
