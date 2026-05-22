/**
 * polymarket-trade skill — Whistant-compatible handler
 * Browse/monitor Polymarket prediction markets via free Gamma API.
 * No API key required.
 *
 * > **Runtime:** Primary: run /skills/polymarket-trade/scripts/polymarket-trade.js <args>
 *               Code mode: await s.runFromParams({input:"..."}) or await s.handler({...})
 */

const BASE = 'https://gamma-api.polymarket.com';

// ---------------------------------------------------------------------------
// SKILL LOGIC
// ---------------------------------------------------------------------------

async function getTrending(limit = 10) {
  const url = `${BASE}/events?order=volume24hr&ascending=false&closed=false&limit=${limit}`;
  const res = await fetch(url, { timeout: 10 });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

async function search(query, limit = 10) {
  const url = `${BASE}/events?q=${encodeURIComponent(query)}&closed=false&limit=${limit}`;
  const res = await fetch(url, { timeout: 10 });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

async function getMovers(limit = 10) {
  const url = `${BASE}/markets?order=oneDayPriceChange&ascending=false&closed=false&limit=${limit}`;
  const res = await fetch(url, { timeout: 10 });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

function parseMarket(market) {
  const outcomes = market.outcomes ?? [];
  const prices = (market.outcomePrices ?? []).map(function(p) { return parseFloat(p); });
  return {
    question: market.question,
    volume: parseFloat(market.volume ?? 0),
    volume24hr: parseFloat(market.volume24hr ?? 0),
    endDate: market.endDate,
    closed: market.closed ?? false,
    outcomes: outcomes.map(function(name, i) {
      return {
        name: name,
        probability: prices[i] ?? 0,
        percentage: ((prices[i] ?? 0) * 100).toFixed(1) + '%',
      };
    }),
  };
}

function formatEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return 'No markets found.';
  return events.map(function(e, i) {
    var lines = [(i + 1) + '. ' + (e.title || e.question), '   Volume: $' + parseFloat(e.volume24hr || e.volume || 0).toLocaleString()];
    if (e.markets && e.markets.length > 0) {
      e.markets.slice(0, 2).forEach(function(m) {
        if (Array.isArray(m.outcomes)) {
          m.outcomes.forEach(function(outcome, j) {
            var prob = parseFloat(m.outcomePrices && m.outcomePrices[j] ? m.outcomePrices[j] : 0) * 100;
            if (prob > 0) lines.push('   ' + outcome + ': ' + prob.toFixed(1) + '%');
          });
        }
      });
    }
    return lines.join('\n');
  }).join('\n\n');
}

function formatMarkets(markets) {
  if (!Array.isArray(markets) || markets.length === 0) return 'No markets found.';
  return markets.map(function(m, i) {
    var lines = [(i + 1) + '. ' + (m.question || m.title), '   24h Volume: $' + parseFloat(m.volume24hr || 0).toLocaleString()];
    if (Array.isArray(m.outcomes)) {
      m.outcomes.forEach(function(outcome, j) {
        var prob = parseFloat(m.outcomePrices && m.outcomePrices[j] ? m.outcomePrices[j] : 0) * 100;
        if (prob > 0) lines.push('   ' + outcome + ': ' + prob.toFixed(1) + '%');
      });
    }
    return lines.join('\n');
  }).join('\n\n');
}

// ---------------------------------------------------------------------------
// HANDLER
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

var myApi = {
  getTrending: getTrending,
  search: search,
  getMovers: getMovers,
  formatEvents: formatEvents,
  formatMarkets: formatMarkets,
  parseMarket: parseMarket,
};

if (typeof module !== 'undefined' && module.exports) { module.exports = myApi; }
if (typeof globalThis !== 'undefined') { globalThis.polymarkettrade = myApi; }

// ---------------------------------------------------------------------------
// CMD PARSING
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string') return [];
  var tokens = [];
  var buf = '';
  var inStr = false;
  var quote = '';
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if (inStr) {
      if (ch === quote) { inStr = false; quote = ''; }
      else { buf += ch; }
    } else {
      if (ch === '"' || ch === "'") { inStr = true; quote = ch; }
      else if (ch === ' ') { if (buf) { tokens.push(buf); buf = ''; } }
      else { buf += ch; }
    }
  }
  if (buf) tokens.push(buf);
  // Strip "run /skills/.../" prefix if present
  var runIdx = -1;
  for (var j = 0; j < tokens.length; j++) {
    if (tokens[j] === 'run' && j + 1 < tokens.length && tokens[j+1].indexOf('/skills/') >= 0) {
      runIdx = j; break;
    }
  }
  if (runIdx >= 0) tokens = tokens.slice(runIdx + 2);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = typeof cmd === 'string' ? tokenize(cmd) : cmd;
  var out = { action: '', query: '', limit: 10, flags: {}, args: [] };
  if (!tokens || !tokens.length) return out;
  out.action = tokens[0] || 'trending';
  // Parse flags
  for (var i = 1; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var eqIdx = t.indexOf('=');
      if (eqIdx > 2) {
        var key = t.slice(2, eqIdx);
        var val = t.slice(eqIdx + 1);
        if (key === 'limit') val = parseInt(val, 10) || 10;
        out.flags[key] = val;
        if (key === 'limit') out.limit = val;
        if (key === 'query') out.query = val;
      } else {
        var flagKey = t.slice(2);
        out.flags[flagKey] = true;
      }
    } else if (t.indexOf('--') !== 0 && !out.query) {
      out.query = t;
    }
  }
  // Second positional = query (e.g. "search bitcoin")
  if (tokens.length > 1 && tokens[1] && tokens[1].indexOf('--') !== 0) {
    out.query = tokens[1];
  }
  return out;
}

// ---------------------------------------------------------------------------
// runFromParams
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  // Support both action-based and command-string input
  var action = params.action || '';
  var query = params.query || params.q || '';
  var limit = parseInt(params.limit, 10) || 10;

  // Parse from .command string (PARAMS from /cmd) or .input string (/code path)
  var cmdStr = params.command || params.input || '';
  if (cmdStr) {
    var parsed = parseCommand(cmdStr);
    if (parsed.action) action = parsed.action;
    if (parsed.query) query = parsed.query;
    if (parsed.limit) limit = parsed.limit;
  }

  // Support action=search and q=... style
  if (params.q) query = params.q;

  try {
    var data, formatted;
    if (action === 'search') {
      if (!query) return 'Error: search requires --query=<term> or a keyword argument.';
      data = await search(query, limit);
      formatted = formatEvents(data);
    } else if (action === 'movers') {
      data = await getMovers(limit);
      formatted = formatMarkets(data);
    } else {
      // Default: trending
      data = await getTrending(limit);
      formatted = formatEvents(data);
    }
    return formatted || 'No markets found.';
  } catch (err) {
    return 'Error: ' + (err.message || String(err));
  }
}

// ---------------------------------------------------------------------------
// Node.js CLI (local dev only — never fires on device)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  (function() {
    var args = process.argv.slice(2);
    var cmdStr = args.join(' ');
    runFromParams({ command: cmdStr })
      .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
      .catch(function(err) { console.error((err && err.message) ? err.message : String(err)); process.exitCode = 1; });
  })();
}

// ---------------------------------------------------------------------------
// PARAMS auto-run block — device /cmd path ONLY
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (function() {
    return runFromParams()
      .then(function(result) {
        if (typeof console !== 'undefined' && console.log) {
          console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
        }
        return result;
      })
      .catch(function(err) {
        if (typeof console !== 'undefined' && console.error) console.error((err && err.message) ? err.message : String(err));
        throw err;
      });
  })();
}
