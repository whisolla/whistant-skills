// ============================================================================
// aistatus v2.2 — Real-time AI provider status via aistatus.cc
// /cmd run /skills/aistatus/scripts/aistatus.js --endpoint all
// /code: var s = require('/skills/aistatus/scripts/aistatus.js'); await s.runFromParams({endpoint:'status'})
// ============================================================================

const BASE = 'https://aistatus.cc';

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC — core API call + formatting
// ---------------------------------------------------------------------------

async function _execute(params) {
  var query = params.query || params.q || '';
  var endpoint = params.endpoint || 'all';

  try {
    var url;
    if (endpoint === 'model' && query) {
      url = BASE + '/api/model?q=' + encodeURIComponent(query);
    } else if (endpoint === 'status') {
      url = BASE + '/api/status';
    } else if (endpoint === 'trending') {
      url = BASE + '/api/trending';
    } else if (endpoint === 'mmlu') {
      url = BASE + '/api/mmlu';
    } else if (endpoint === 'incidents') {
      url = BASE + '/api/incidents';
    } else {
      url = BASE + '/api/all';
    }

    var res = await fetch(url, { timeout: 10 });
    if (!res.ok) throw new Error('aistatus.cc API error: ' + res.status);
    var data = await res.json();

    var out = [];
    var statusEmoji = { operational: '✅', degraded: '⚠️', down: '🔴', unknown: '❓' };

    // Model search results — /api/model endpoint returns {query, count, models:[...]}
    var searchModels = data.models || [];
    if (searchModels.length > 0 && endpoint === 'model') {
      out.push('## Model Search: "' + (data.query || query) + '" (' + searchModels.length + ' results)');
      out.push('');
      out.push('| Model | Provider | Status | Context |');
      out.push('|-------|----------|--------|---------|');
      for (var s = 0; s < searchModels.length; s++) {
        var sm = searchModels[s];
        var ctx = sm.context_length ? (sm.context_length >= 1048576 ? Math.round(sm.context_length / 1048576) + 'M' : Math.round(sm.context_length / 1024) + 'K') : 'N/A';
        out.push('| ' + (sm.id || sm.name) + ' | ' + (sm.provider?.name || '?') + ' | ' + (sm.provider?.status || '?') + ' | ' + ctx + ' |');
      }
    }

    // Provider status — only for 'all' and 'status' endpoints
    var providerStatus = data.status?.providerStatus || data.providerStatus || [];
    if (providerStatus.length > 0 && (endpoint === 'all' || endpoint === 'status')) {
      var totalModels = data.status?.totalModels || data.totalModels || 'N/A';
      out.push('## AI Provider Status (' + totalModels + ' models tracked)');
      out.push('');
      out.push('| Provider | Status | Models |');
      out.push('|----------|--------|--------|');
      for (var i = 0; i < providerStatus.length; i++) {
        var p = providerStatus[i];
        var emoji = statusEmoji[p.status] || '❓';
        var detail = p.statusDetail ? ' — ' + p.statusDetail : '';
        out.push('| ' + emoji + ' ' + p.name + ' | ' + p.status + ' | ' + p.modelCount + ' |' + detail);
      }
    }

    // Trending models — only for 'all' and 'trending' endpoints
    if (endpoint === 'all' || endpoint === 'trending') {
      var trendingData = data.trending || data;
      var trendingModels = trendingData.models || [];
      if (trendingModels.length > 0) {
        out.push('');
        out.push('## Trending Models (week of ' + (trendingData.week || 'N/A') + ')');
        out.push('');
        for (var j = 0; j < Math.min(trendingModels.length, 10); j++) {
          var m = trendingModels[j];
          out.push((m.rank || '') + '. ' + (m.id || m.name) + ' by ' + (m.provider || '?') + ' — ' + (m.tokensFormatted || m.tokens || 'N/A'));
        }
      }
    }

    // LLM Leaderboard — only for 'all' and 'mmlu' endpoints
    if (endpoint === 'all' || endpoint === 'mmlu') {
      var mmlu = data.mmlu || data.models || [];
      if (mmlu.length > 0) {
        out.push('');
        out.push('## LLM Leaderboard (MMLU)');
        out.push('');
        out.push('| Rank | Model | Avg Score | Params |');
        out.push('|------|-------|-----------|--------|');
        for (var k = 0; k < Math.min(mmlu.length, 10); k++) {
          var mm = mmlu[k];
          out.push('| ' + mm.rank + ' | ' + mm.name + ' | ' + (mm.avgScore || 'N/A') + ' | ' + (mm.params || 'N/A') + 'B |');
        }
      }
    }

    // Recent incidents — only for 'all' and 'incidents' endpoints
    if (endpoint === 'all' || endpoint === 'incidents') {
      var incidents = data.incidents || [];
      if (incidents.length > 0) {
        out.push('');
        out.push('## Recent Incidents');
        out.push('');
        var recent = incidents.slice(0, 5);
        for (var n = 0; n < recent.length; n++) {
          var inc = recent[n];
          var ts = inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'Unknown';
          out.push('- ' + ts + ': ' + inc.name + ' ' + inc.from + ' → ' + inc.to + (inc.detail ? ' (' + inc.detail + ')' : ''));
        }
      }
    }

    if (data.lastUpdated) {
      var updated = new Date(data.lastUpdated).toLocaleString();
      out.push('');
      out.push('*Last updated: ' + updated + '*');
    }

    return { ok: true, formatted: out.join('\n'), data: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// 2. HANDLER — standard AI entry point: await mod.handler({ parameters: {...} })
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || event || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS — must be synchronous, before any await
// ---------------------------------------------------------------------------

var skillApi = { handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.aistatus = skillApi;
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING — tokenize + parseCommand for /cmd path
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
  var out = { endpoint: undefined, query: undefined };
  if (!tokens.length) return out;

  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--endpoint' || t === '-e') && i + 1 < tokens.length) {
      out.endpoint = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--query' || t === '-q') && i + 1 < tokens.length) {
      out.query = tokens[i + 1]; i += 2; continue;
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

  var endpoint = params.endpoint || 'all';
  var query = params.query || params.q || '';

  // Resolve from parsed command string
  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.endpoint) endpoint = parsed.endpoint;
    if (parsed.query) query = parsed.query;
  }
  if (params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.endpoint) endpoint = parsed.endpoint;
    if (parsed.query) query = parsed.query;
  }

  return await _execute({ endpoint: endpoint, query: query });
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry (local dev / testing only — never fires on device)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block — device /cmd path
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (result && result.formatted) { console.log(result.formatted); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
