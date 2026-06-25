// ethereum-history.js — Ethereum mainnet contract history v1.0
// Primary: ethereumhistory.com REST API (GET-only, no auth)
// Pure fetch(), no API key required.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

var BASE_URL = 'https://ethereumhistory.com';

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

/**
 * Fetch full factual data for one Ethereum contract address.
 * @param {string} address - 0x-prefixed 40-char hex address
 * @returns {object} { data, meta } or { error }
 */
async function getContract(address) {
  if (!address || typeof address !== 'string') {
    return { error: 'Ethereum address is required (0x + 40 hex chars).' };
  }
  address = address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { error: 'Invalid Ethereum address format. Must be 0x followed by 40 hex characters.' };
  }

  try {
    var url = BASE_URL + '/api/agent/contracts/' + address;
    var res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'Whistant-Dev' },
      timeout: 15
    });

    if (!res.ok) {
      var body = '';
      try { body = await res.text(); } catch (e) {}
      var msg = body;
      try { var errObj = JSON.parse(body); msg = errObj.error || body; } catch (e) {}
      return { error: 'HTTP ' + res.status + ': ' + (msg || res.statusText) };
    }

    var json = await res.json();
    return json; // { data: {...}, meta: {...} }
  } catch (e) {
    return { error: 'Request failed: ' + (e && e.message ? e.message : String(e)) };
  }
}

/**
 * Discover contracts with optional filters.
 * @param {object} opts - { era_id, featured, undocumented_only, from_timestamp, to_timestamp, limit, offset }
 * @returns {object} { data: [...], meta: {...} } or { error }
 */
async function discoverContracts(opts) {
  var params = [];
  var o = opts || {};

  if (o.era_id) params.push('era_id=' + encodeURIComponent(o.era_id));
  if (o.featured) params.push('featured=' + (o.featured === 'true' || o.featured === true ? 'true' : 'false'));
  if (o.undocumented_only) params.push('undocumented_only=' + (o.undocumented_only === 'true' || o.undocumented_only === true ? 'true' : 'false'));
  if (o.from_timestamp) params.push('from_timestamp=' + encodeURIComponent(o.from_timestamp));
  if (o.to_timestamp) params.push('to_timestamp=' + encodeURIComponent(o.to_timestamp));
  if (o.limit) params.push('limit=' + Math.min(200, Math.max(1, parseInt(o.limit) || 50)));
  if (o.offset) params.push('offset=' + Math.max(0, parseInt(o.offset) || 0));

  var url = BASE_URL + '/api/agent/contracts';
  if (params.length) url += '?' + params.join('&');

  try {
    var res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'Whistant-Dev' },
      timeout: 15
    });

    if (!res.ok) {
      var body = '';
      try { body = await res.text(); } catch (e) {}
      return { error: 'HTTP ' + res.status + ': ' + (body || res.statusText) };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Request failed: ' + (e && e.message ? e.message : String(e)) };
  }
}

/**
 * Get the API manifest.
 * @returns {object} manifest JSON or { error }
 */
async function getManifest() {
  try {
    var res = await fetch(BASE_URL + '/api/agent/manifest', {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'Whistant-Dev' },
      timeout: 10
    });

    if (!res.ok) {
      return { error: 'HTTP ' + res.status + ' ' + res.statusText };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Request failed: ' + (e && e.message ? e.message : String(e)) };
  }
}

// ─── FORMATTERS ───────────────────────────────────────────────────────────────

function formatContract(contract) {
  var lines = [];
  var d = contract;

  lines.push('## ' + (d.etherscan_contract_name || d.token_name || d.address));
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push('| **Address** | `' + d.address + '` |');

  if (d.era) {
    lines.push('| **Era** | ' + d.era.name + ' (' + d.era_id + ', blocks ' + d.era.start_block + '–' + (d.era.end_block || 'present') + ') |');
  } else if (d.era_id) {
    lines.push('| **Era** | ' + d.era_id + ' |');
  }

  if (d.deployer_address) lines.push('| **Deployer** | `' + d.deployer_address + '` |');
  if (d.deployment_timestamp) lines.push('| **Deployed** | ' + d.deployment_timestamp + ' |');
  if (d.deployment_block) lines.push('| **Block** | ' + d.deployment_block.toLocaleString() + ' |');
  if (d.deployment_tx_hash) lines.push('| **Tx** | `' + d.deployment_tx_hash + '` |');
  if (d.code_size_bytes) lines.push('| **Code Size** | ' + d.code_size_bytes.toLocaleString() + ' bytes |');
  if (d.gas_used) lines.push('| **Gas Used** | ' + d.gas_used.toLocaleString() + ' |');

  // Heuristics
  if (d.heuristics) {
    var h = [];
    if (d.heuristics.contract_type) h.push('Type: ' + d.heuristics.contract_type);
    if (d.heuristics.is_proxy) h.push('Proxy');
    if (d.heuristics.is_erc20_like) h.push('ERC-20 like');
    if (d.heuristics.has_selfdestruct) h.push('Has SELFDESTRUCT');
    if (h.length) lines.push('| **Heuristics** | ' + h.join(', ') + ' |');
  }

  if (d.etherscan_verified) lines.push('| **Verified** | ✅ Etherscan verified |');
  if (d.decompilation_success) lines.push('| **Decompiled** | ✅ Decompilation available |');

  // Token info
  if (d.token_name) lines.push('| **Token** | ' + d.token_name + (d.token_symbol ? ' (' + d.token_symbol + ')' : '') + ' |');
  if (d.token_decimals !== null && d.token_decimals !== undefined) lines.push('| **Decimals** | ' + d.token_decimals + ' |');

  // Description
  if (d.short_description) {
    lines.push('');
    lines.push('### Description');
    lines.push(d.short_description);
  }
  if (d.description) {
    lines.push('');
    lines.push(d.description);
  }

  // Historical context
  if (d.historical_summary || d.historical_significance || d.historical_context) {
    lines.push('');
    lines.push('### Historical Context');
    if (d.historical_summary) lines.push(d.historical_summary);
    if (d.historical_significance) lines.push('');
    if (d.historical_significance) lines.push('**Significance:** ' + d.historical_significance);
    if (d.historical_context) lines.push('');
    if (d.historical_context) lines.push('**Context:** ' + d.historical_context);
  }

  // Links
  if (d.links && d.links.length) {
    lines.push('');
    lines.push('### Links');
    for (var i = 0; i < d.links.length; i++) {
      var link = d.links[i];
      lines.push('- [' + (link.title || link.url) + '](' + link.url + ')' + (link.note ? ' — ' + link.note : ''));
    }
  }

  return lines.join('\n');
}

function formatContractList(result) {
  var lines = [];
  var data = result.data || [];
  var meta = result.meta || {};

  lines.push('## Contract Discovery (' + (meta.count || data.length) + ' contracts)');
  lines.push('');
  lines.push('| Address | Name/Token | Era | Deployer | Deployed |');
  lines.push('|---------|------------|-----|----------|----------|');

  for (var i = 0; i < data.length; i++) {
    var c = data[i];
    var name = c.etherscan_contract_name || c.token_name || '';
    if (c.token_symbol) name += ' (' + c.token_symbol + ')';
    var deployer = c.deployer_address ? c.deployer_address.substring(0, 10) + '...' : '';
    var deployed = c.deployment_timestamp ? c.deployment_timestamp.substring(0, 10) : '';

    lines.push('| `' + c.address.substring(0, 10) + '...` | ' + (name || '—') + ' | ' + (c.era_id || '—') + ' | ' + (deployer || '—') + ' | ' + (deployed || '—') + ' |');
  }

  if (meta.limit && meta.offset !== undefined && meta.count !== undefined) {
    var page = Math.floor(meta.offset / meta.limit) + 1;
    var totalPages = Math.ceil(meta.count / meta.limit);
    lines.push('');
    lines.push('*Page ' + page + ' of ' + totalPages + ' (showing ' + data.length + ' of ' + meta.count + ')*');
  }

  return lines.join('\n');
}

// ─── 2. HANDLER ───────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ─── 3. EXPORTS ───────────────────────────────────────────────────────────────

var skillApi = { handler, runFromParams, parseCommand, getContract, discoverContracts, getManifest, formatContract, formatContractList };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.ethereumHistory = skillApi;
}

// ─── 4. CMD PARSING ───────────────────────────────────────────────────────────

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
  var out = {};

  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--address' || t === '-a') && i + 1 < tokens.length) {
      out.address = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--action' || t === '-act') && i + 1 < tokens.length) {
      out.action = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--era') && i + 1 < tokens.length) {
      out.era_id = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--from') && i + 1 < tokens.length) {
      out.from_timestamp = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--to') && i + 1 < tokens.length) {
      out.to_timestamp = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--limit' || t === '-l') && i + 1 < tokens.length) {
      out.limit = parseInt(tokens[i + 1]) || 50; i += 2; continue;
    }
    if ((t === '--offset' || t === '-o') && i + 1 < tokens.length) {
      out.offset = parseInt(tokens[i + 1]) || 0; i += 2; continue;
    }
    if (t === '--featured') { out.featured = 'true'; i += 1; continue; }
    if (t === '--undocumented') { out.undocumented_only = 'true'; i += 1; continue; }
    i += 1;
  }

  // If no address from flags, treat first non-flag token as address
  if (!out.address && !out.action) {
    for (var j = 0; j < tokens.length; j++) {
      if (!tokens[j].startsWith('-')) {
        if (/^0x[a-fA-F0-9]{40}$/.test(tokens[j])) {
          out.address = tokens[j];
        } else if (['discover','list','manifest'].indexOf(tokens[j].toLowerCase()) !== -1) {
          out.action = tokens[j];
        }
        break;
      }
    }
  }

  return out;
}

// ─── 5. runFromParams ─────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var address = params.address || '';
  var action = params.action || '';

  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.address) address = parsed.address;
    if (parsed.action) action = parsed.action;
    // Merge discovery params
    if (parsed.era_id) params.era_id = parsed.era_id;
    if (parsed.from_timestamp) params.from_timestamp = parsed.from_timestamp;
    if (parsed.to_timestamp) params.to_timestamp = parsed.to_timestamp;
    if (parsed.limit) params.limit = parsed.limit;
    if (parsed.offset) params.offset = parsed.offset;
    if (parsed.featured) params.featured = parsed.featured;
    if (parsed.undocumented_only) params.undocumented_only = parsed.undocumented_only;
  }

  // Default: discover featured contracts (no args needed)
  if (!address && !action) {
    var defaultResult = await discoverContracts({ featured: true, limit: 10 });
    if (defaultResult.error) return defaultResult;
    return formatContractList(defaultResult);
  }

  try {
    if (action === 'manifest') {
      var manifest = await getManifest();
      if (manifest.error) return manifest;
      return JSON.stringify(manifest, null, 2);
    }

    if (action === 'discover' || action === 'list') {
      var opts = {
        era_id: params.era_id,
        featured: params.featured,
        undocumented_only: params.undocumented_only,
        from_timestamp: params.from_timestamp,
        to_timestamp: params.to_timestamp,
        limit: params.limit || 10,
        offset: params.offset || 0
      };
      var result = await discoverContracts(opts);
      if (result.error) return result;
      return formatContractList(result);
    }

    // Default: get contract facts
    if (address) {
      var contract = await getContract(address);
      if (contract.error) return contract;
      if (!contract.data) return { error: 'No contract data returned.' };
      return formatContract(contract.data);
    }

    return { error: 'No action specified. Use --address, --action discover, or --action manifest.' };
  } catch (err) {
    return { error: 'Failed: ' + (err && err.message ? err.message : String(err)) };
  }
}

// ─── 6. Node.js CLI entry ─────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ─── 7. PARAMS auto-run block ─────────────────────────────────────────────────

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
