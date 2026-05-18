// ============================================================================
// nasdaq100-futures v1.2 — Yahoo Finance futures quote
// /cmd run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --symbol NQ=F
// /code: var s = require('/skills/nasdaq100-futures/scripts/nasdaq100-futures.js'); await s.runFromParams({symbol:'ES=F'})
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC — fetch + format
// ---------------------------------------------------------------------------

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTime(tsSeconds) {
  var d = new Date(tsSeconds * 1000);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
    pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

async function _fetchQuote(symbol) {
  var sym = symbol || 'NQ=F';
  var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym);

  var res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    },
    timeout: 10
  });

  if (!res.ok) {
    var text = await res.text().catch(function() { return ''; });
    throw new Error('HTTP ' + res.status + ' ' + res.statusText + (text ? ': ' + text : ''));
  }

  var data = await res.json();
  var result = data?.chart?.result?.[0];
  var meta = result?.meta;

  var regularPrice = meta?.regularMarketPrice;
  var previousClose = meta?.previousClose;

  if (typeof regularPrice !== 'number' || typeof previousClose !== 'number') {
    throw new Error('Parse failed: missing regularMarketPrice or previousClose');
  }

  var change = regularPrice - previousClose;
  var changePercent = previousClose === 0 ? 0 : (change / previousClose) * 100;
  var ts = meta?.regularMarketTime || result?.timestamp?.[0];
  var timeStr = typeof ts === 'number' ? formatTime(ts) : '';

  return {
    symbol: sym,
    price: regularPrice.toFixed(2),
    change: (change >= 0 ? '+' : '') + change.toFixed(2),
    changePercent: (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2),
    time: timeStr,
    message: sym + ' Futures: $' + regularPrice.toFixed(2) + ' (' + (change >= 0 ? '+' : '') + change.toFixed(2) + ' / ' + (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%) ' + timeStr
  };
}

// ---------------------------------------------------------------------------
// 2. HANDLER — standard AI entry point
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS — must be synchronous
// ---------------------------------------------------------------------------

var skillApi = { handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.nasdaq100Futures = skillApi;
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
  var out = { symbol: undefined };
  if (!tokens.length) return out;

  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--symbol' || t === '-s') && i + 1 < tokens.length) {
      out.symbol = tokens[i + 1]; i += 2; continue;
    }
    i += 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 5. runFromParams — bridges /cmd and /code paths
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  var symbol = params.symbol || 'NQ=F';

  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.symbol) symbol = parsed.symbol;
  }
  if (params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.symbol) symbol = parsed.symbol;
  }

  try {
    return await _fetchQuote(symbol);
  } catch (e) {
    return { error: true, message: 'Query failed: ' + (e && e.message ? e.message : String(e)) };
  }
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(JSON.stringify(result, null, 2)); })
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
      console.log(JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
