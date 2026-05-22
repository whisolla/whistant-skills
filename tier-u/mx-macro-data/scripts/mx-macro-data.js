/**
 * mx-macro-data — Global macroeconomic data via EastMoney mxClaw API.
 * Requires EM_API_KEY — get one at https://ai.eastmoney.com/mxClaw
 */

const ENDPOINT = 'https://ai-saas.eastmoney.com/proxy/b/mcp/tool/searchMacroData';

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
 * Query macroeconomic data with natural language.
 * @param {string} apiKey
 * @param {string} query
 * @returns {Promise<object>}
 */
async function queryMacro(apiKey, query) {
  const ctx = makeCtx();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'em_api_key': apiKey,
    },
    body: JSON.stringify({ query, toolContext: ctx }),
    timeout: 15,
  });
  return res.json();
}

/**
 * Parse macro data tables from response.
 * @param {object} data
 * @returns {Array<object>}
 */
function parseTables(data) {
  return data?.data?.dataTables ?? [];
}

/**
 * Format macro data for display.
 * @param {Array<object>} tables
 * @returns {string}
 */
function formatMacro(tables) {
  if (!tables || !tables.length) return 'No data found.';
  var lines = [];
  for (var i = 0; i < tables.length; i++) {
    var t = tables[i];
    var title = t.title || t.entityName || 'Macro Data';
    var heads = t.table && t.table.headName || [];
    var nameMap = t.nameMap || {};
    // Each key in table (except headName) is an indicator ID
    var ids = Object.keys(t.table || {}).filter(function(k) { return k !== 'headName'; });
    for (var j = 0; j < ids.length; j++) {
      var id = ids[j];
      var vals = t.table[id];
      var name = nameMap[id] || id;
      if (!vals || !Array.isArray(vals)) continue;
      var parts = [];
      for (var k = 1; k < vals.length && k < heads.length; k++) {
        parts.push(heads[k] + ': ' + vals[k]);
      }
      lines.push(name + '\n  ' + parts.join(' | '));
    }
    if (ids.length === 0) {
      lines.push(title + ': no data');
    }
    if (i < tables.length - 1) lines.push('');
  }
  return lines.join('\n');
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

var mxMacroData = { handler, runFromParams, search, queryMacro, parseTables, formatMacro };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mxMacroData;
}
if (typeof globalThis !== 'undefined') {
  globalThis.mxMacroData = mxMacroData;
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
  var out = { input: undefined };
  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();
  var i = 0, parts = [];
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--input' || t === '-i') && i + 1 < tokens.length) {
      out.input = tokens[i + 1]; i += 2; continue;
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
  if (!input && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.input) input = parsed.input;
  }
  if (!input && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.input) input = parsed.input;
  }

  if (!input) {
    return 'Usage: run /skills/mx-macro-data/scripts/mx-macro-data.js <query>\nExample: run /skills/mx-macro-data/scripts/mx-macro-data.js 中国近三年GDP增速';
  }

  var apiKey = await _getApiKey();
  if (!apiKey) {
    return 'EM_API_KEY not found. Set it via keychain.set("EM_API_KEY", "<your-key>") or in credentials.env';
  }

  var data = await queryMacro(apiKey, input);
  var tables = parseTables(data);
  return formatMacro(tables);
}

/**
 * Primary exported action — natural language macro data query.
 * @param {string} input - Natural language query
 * @returns {Promise<string>} Formatted results
 */
async function search(input) {
  return await runFromParams({ input: input });
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
