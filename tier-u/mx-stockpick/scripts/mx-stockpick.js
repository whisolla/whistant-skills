/**
 * mx-stockpick — Natural language stock screener via EastMoney mxClaw API.
 * Requires EM_API_KEY — get one at https://ai.eastmoney.com/mxClaw
 */

const ENDPOINT = 'https://ai-saas.eastmoney.com/proxy/b/mcp/tool/selectSecurity';

const SELECT_TYPES = ['A股', '港股', '美股', '基金', 'ETF', '可转债', '板块'];

// ---------------------------------------------------------------------------
// _getApiKey — load from global var (devenv) or keychain (device)
// ---------------------------------------------------------------------------
async function _getApiKey() {
  if (typeof EM_API_KEY !== 'undefined' && EM_API_KEY) return EM_API_KEY;
  if (typeof process !== 'undefined' && process.env && process.env.EM_API_KEY) return process.env.EM_API_KEY;
  if (typeof keychain !== 'undefined') {
    try { var v = await keychain.get('EM_API_KEY'); if (v) return v; } catch (e) {}
  }
  return null;
}

function makeCtx() {
  return {
    callId: 'call_' + Math.random().toString(36).slice(2, 10),
    userId: 'user_' + Math.random().toString(36).slice(2, 10),
  };
}

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC
// ---------------------------------------------------------------------------

/**
 * Screen stocks/ETFs/funds using natural language.
 * @param {string} apiKey
 * @param {string} query
 * @param {string} selectType
 * @returns {Promise<object>}
 */
async function screenStocks(apiKey, query, selectType) {
  const ctx = makeCtx();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'em_api_key': apiKey,
    },
    body: JSON.stringify({ query, selectType: selectType || 'A股', toolContext: ctx }),
    timeout: 15,
  });
  return res.json();
}

/**
 * Parse screened results from API response.
 * @param {object} data
 * @returns {object}
 */
function parseResults(data) {
  return data?.data ?? {};
}

/**
 * Format screened stocks for display.
 * Header/sep/data columns vary per query (e.g. 19 vs 20 cols, 成交额 at col 9 vs 17).
 * Parses header dynamically to locate name/price/change/volume columns.
 * @param {object} results
 * @returns {string}
 */
function formatStocks(results) {
  if (!results || !results.securityCount) return 'No results found.';
  var partial = results.partialResults;
  if (!partial || !partial.length) return 'No results found.';
  var parts = partial.split('|');
  // Find stride from header (columns + 1 for trailing newline cell)
  var stride = 0;
  for (var i = 1; i < parts.length; i++) {
    if (parts[i] === '\n' && i > 2) { stride = i; break; }
  }
  if (!stride) return partial;
  // Map column positions from header names
  var cols = { name: -1, price: -1, change: -1, vol: -1 };
  for (var j = 1; j < stride; j++) {
    var h = parts[j];
    if (h === '名称') { cols.name = j - 1; }
    else if (h.indexOf('最新价') >= 0) { cols.price = j - 1; }
    else if (h.indexOf('涨跌幅') >= 0) { cols.change = j - 1; }
    else if (h.indexOf('成交额') >= 0) { cols.vol = j - 1; }
  }
  var dataStart = 2 * stride + 1;
  var rows = [];
  for (var r = 0; r < 10; r++) {
    var base = dataStart + r * stride;
    var name = parts[base + cols.name];
    if (!name) break;
    var price = parts[base + cols.price] || '?';
    var change = parts[base + cols.change] || '?';
    var amount = parts[base + cols.vol] || '?';
    rows.push(name + ' | ' + price + ' | ' + change + '% | Vol: ' + amount);
  }
  return 'Found ' + results.securityCount + ' matches:\n\n' + rows.join('\n');
}

// ---------------------------------------------------------------------------
// 2. HANDLER
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS
// ---------------------------------------------------------------------------

var mxStockpick = { handler, runFromParams, pick, screenStocks, parseResults, formatStocks, SELECT_TYPES };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mxStockpick;
}
if (typeof globalThis !== 'undefined') {
  globalThis.mxStockpick = mxStockpick;
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; if (cur) tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = { input: undefined, type: 'A股' };
  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();
  var i = 0, parts = [];
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--input' || t === '-i') && i + 1 < tokens.length) {
      out.input = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--type' || t === '-t') && i + 1 < tokens.length) {
      out.type = tokens[i + 1]; i += 2; continue;
    }
    if (t.startsWith('-')) { i += 1; continue; }
    parts.push(t);
    i += 1;
  }
  if (!out.input && parts.length) out.input = parts.join(' ');
  return out;
}

// ---------------------------------------------------------------------------
// 5. runFromParams
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  var input = params.input || params.query || params.text || '';
  var selectType = params.type || params.selectType || 'A股';
  if (!input && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.input) input = parsed.input;
    if (parsed.type) selectType = parsed.type;
  }
  if (!input && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.input) input = parsed.input;
    if (parsed.type) selectType = parsed.type;
  }

  if (!input) {
    return 'Usage: run /skills/mx-stockpick/scripts/mx-stockpick.js <query> [--type A股]\nExample: run /skills/mx-stockpick/scripts/mx-stockpick.js 股价大于100元，主力流入，成交额排名前50';
  }

  var apiKey = await _getApiKey();
  if (!apiKey) {
    return 'EM_API_KEY not found. Set it via keychain.set("EM_API_KEY", "<your-key>") or in credentials.env';
  }

  var data = await screenStocks(apiKey, input, selectType);
  var results = parseResults(data);
  return formatStocks(results);
}

/**
 * Primary exported action — natural language stock screening.
 * @param {string} input
 * @param {string} selectType
 * @returns {Promise<string>}
 */
async function pick(input, selectType) {
  return await runFromParams({ input: input, type: selectType || 'A股' });
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
