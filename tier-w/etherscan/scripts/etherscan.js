// etherscan.js — Etherscan API v2 skill
// Key actions: balance, txlist, gasoracle
// Etherscan v2 API: https://api.etherscan.io/v2/api?module=...&action=...&chainid=...

// ── Helpers ──────────────────────────────────────────────────────────────────

async function _getApiKey() {
  // Try global var (devenv / credentials load)
  if (typeof ETHERSCAN_API_KEY !== 'undefined' && ETHERSCAN_API_KEY) {
    return ETHERSCAN_API_KEY;
  }
  // Try keychain (device runtime)
  if (typeof keychain !== 'undefined') {
    try {
      var val = await keychain.get('ETHERSCAN_API_KEY');
      if (val) return val;
    } catch (e) { /* fall through */ }
  }
  return null;
}

async function _fetchChainList() {
  const res = await fetch('https://api.etherscan.io/v2/chainlist', { timeout: 10 });
  if (!res.ok) throw new Error('Failed to fetch chainlist: HTTP ' + res.status);
  const data = await res.json();
  return data.result || [];
}

function _resolveChainId(chainList, chainName) {
  const lc = String(chainName || '').toLowerCase();
  if (lc === 'ethereum' || lc === 'eth' || lc === 'mainnet') return '1';
  if (lc === 'bsc' || lc === 'bnb' || lc === 'binance') return '56';
  if (lc === 'polygon' || lc === 'matic') return '137';
  if (lc === 'arbitrum' || lc === 'arb') return '42161';
  if (lc === 'base') return '8453';
  if (lc === 'optimism' || lc === 'op') return '10';
  if (lc === 'avalanche' || lc === 'avax') return '43114';
  if (lc === 'fantom' || lc === 'ftm') return '250';
  if (lc === 'celo') return '42220';
  // Try to find in chain list
  for (var i = 0; i < chainList.length; i++) {
    var c = chainList[i];
    if (c.name && c.name.toLowerCase() === lc) return c.chainid;
    if (c.name && c.name.toLowerCase().includes(lc)) return c.chainid;
  }
  return String(chainName || '1'); // default to Ethereum
}

async function _apiCall(module, action, chainid, extraParams, apiKey) {
  var url = 'https://api.etherscan.io/v2/api?module=' + module +
    '&action=' + action +
    '&chainid=' + chainid +
    '&apikey=' + (apiKey || 'free');
  for (var k in extraParams) {
    if (extraParams[k] !== null && extraParams[k] !== undefined && extraParams[k] !== '') {
      url += '&' + k + '=' + encodeURIComponent(extraParams[k]);
    }
  }
  var res = await fetch(url, { timeout: 15 });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var data = await res.json();
  if (data.message === 'NOTOK') {
    if (data.result && data.result.indexOf && data.result.indexOf('rate limit') !== -1) {
      throw new Error('Rate limited by Etherscan. Wait and retry.');
    }
    throw new Error('Etherscan API error: ' + (data.result || data.message));
  }
  if (data.status === '0' && data.result && typeof data.result === 'string') {
    throw new Error('Etherscan: ' + data.result);
  }
  return data;
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function getBalance(address, chainid) {
  var apiKey = await _getApiKey();
  var chainList = await _fetchChainList();
  var cid = _resolveChainId(chainList, chainid || 'ethereum');
  var data = await _apiCall('account', 'balance', cid, {
    address: address,
    tag: 'latest'
  }, apiKey);
  var balance = data.result || '0';
  // Convert wei to ETH (assuming 18 decimals — correct for Ethereum, BSC, Polygon, Arbitrum, Optimism, Base)
  var eth = (parseInt(balance) / 1e18).toFixed(6);
  return 'Balance: ' + eth + ' ETH\nAddress: ' + address + '\nChain ID: ' + cid;
}

async function getTxList(address, chainid, page, offset, sort) {
  var apiKey = await _getApiKey();
  var chainList = await _fetchChainList();
  var cid = _resolveChainId(chainList, chainid || 'ethereum');
  var data = await _apiCall('account', 'txlist', cid, {
    address: address,
    startblock: '0',
    endblock: '99999999',
    page: String(page || 1),
    offset: String(offset || 20),
    sort: sort || 'desc'
  }, apiKey);
  var txs = data.result || [];
  if (!Array.isArray(txs)) return 'Error: ' + txs;
  if (txs.length === 0) return 'No transactions found for ' + address;
  var out = 'Transactions for ' + address + ' (Chain ' + cid + '):\n';
  var shown = txs.slice(0, 10);
  for (var i = 0; i < shown.length; i++) {
    var tx = shown[i];
    out += '\n[' + (i + 1) + '] Hash: ' + tx.hash + '\n';
    out += '    From: ' + tx.from + '\n';
    out += '    To: ' + (tx.to || '(contract)') + '\n';
    out += '    Value: ' + (parseInt(tx.value) / 1e18).toFixed(6) + ' ETH\n';
    out += '    Gas Used: ' + tx.gasUsed + ' | Gas Price: ' + (parseInt(tx.gasPrice || tx.gasprice) / 1e9).toFixed(2) + ' Gwei\n';
    out += '    Status: ' + (tx.isError === '1' || tx.txreceipt_status === '0' ? 'FAILED ❌' : 'Success ✅') + '\n';
    out += '    Block: ' + tx.blockNumber + ' | Time: ' + tx.timeStamp + '\n';
  }
  if (txs.length > 10) out += '\n... and ' + (txs.length - 10) + ' more transactions';
  out += '\n\nPowered by Etherscan';
  return out;
}

async function getGasOracle(chainid) {
  var apiKey = await _getApiKey();
  var chainList = await _fetchChainList();
  var cid = _resolveChainId(chainList, chainid || 'ethereum');
  var data = await _apiCall('gastracker', 'gasoracle', cid, {}, apiKey);
  var r = data.result || {};
  return 'Gas Oracle — Chain ' + cid + ':\n' +
    '  Safe Gas Price:    ' + r.SafeGasPrice + ' Gwei\n' +
    '  Propose Gas Price: ' + r.ProposeGasPrice + ' Gwei\n' +
    '  Fast Gas Price:    ' + r.FastGasPrice + ' Gwei\n\n' +
    'Powered by Etherscan';
}

// ── Handler ────────────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ── Exports ────────────────────────────────────────────────────────────────────

var myApi = {
  handler: handler,
  runFromParams: runFromParams,
  getBalance: getBalance,
  getTxList: getTxList,
  getGasOracle: getGasOracle,
  parseCommand: parseCommand
};
if (typeof module !== 'undefined' && module.exports) { module.exports = myApi; }
if (typeof globalThis !== 'undefined') { globalThis.etherscan = myApi; }

// ── CMD Parsing ────────────────────────────────────────────────────────────────

function tokenize(cmd) {
  var tokens = [];
  var current = '';
  var inQuote = false;
  var quoteChar = '';
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if ((ch === '"' || ch === "'") && !inQuote) {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
    } else if (ch === ' ' && !inQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var action = '';
  var address = '';
  var chainid = '';
  var page = 1;
  var offset = 20;
  var sort = 'desc';
  var i = 0;
  while (i < tokens.length) {
    var tok = tokens[i];
    if (tok === 'balance') action = 'balance';
    else if (tok === 'txlist') action = 'txlist';
    else if (tok === 'gasoracle') action = 'gasoracle';
    else if (tok === '--action' || tok === '-a') { i++; if (i < tokens.length) action = tokens[i]; }
    else if (tok === '--address' || tok === '-addr') { i++; if (i < tokens.length) address = tokens[i]; }
    else if (tok === '--chain' || tok === '-c') { i++; if (i < tokens.length) chainid = tokens[i]; }
    else if (tok === '--page') { i++; if (i < tokens.length) page = parseInt(tokens[i]) || 1; }
    else if (tok === '--offset') { i++; if (i < tokens.length) offset = parseInt(tokens[i]) || 20; }
    else if (tok === '--sort') { i++; if (i < tokens.length) sort = tokens[i]; }
    else if (!tok.startsWith('--') && !tok.startsWith('-') && tok.length > 0 && !action) {
      // First positional arg could be action or address
      if (tok === 'balance' || tok === 'txlist' || tok === 'gasoracle') action = tok;
      else address = tok;
    }
    i++;
  }
  return { action: action, address: address, chainid: chainid, page: page, offset: offset, sort: sort };
}

// ── runFromParams ─────────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var action = params.action || '';
  var address = params.address || '';
  var chainid = params.chainid || params.chain || 'ethereum';
  var page = parseInt(params.page || 1);
  var offset = parseInt(params.offset || 20);
  var sort = params.sort || 'desc';

  // Parse from command string if provided (overrides positional defaults)
  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.action && !params.action) action = parsed.action;
    if (parsed.address) address = parsed.address;
    if (parsed.chainid) chainid = parsed.chainid;
    if (parsed.page) page = parsed.page;
    if (parsed.offset) offset = parsed.offset;
    if (parsed.sort) sort = parsed.sort;
  }

  if (!action) {
    return 'Etherscan Skill\n\nUsage:\n' +
      '  await s.getBalance(address, chainid)   — Check ETH/native token balance\n' +
      '  await s.getTxList(address, chainid, page, offset) — List transactions\n' +
      '  await s.getGasOracle(chainid)           — Current gas prices\n' +
      '\nAPI: https://api.etherscan.io/v2/api\n' +
      'Chains: ethereum, bsc, polygon, arbitrum, base, optimism, avalanche, fantom\n' +
      '\nPowered by Etherscan';
  }

  try {
    if (action === 'balance') {
      if (!address) return 'Error: balance action requires --address parameter';
      return await getBalance(address, chainid);
    } else if (action === 'txlist') {
      if (!address) return 'Error: txlist action requires --address parameter';
      return await getTxList(address, chainid, page, offset, sort);
    } else if (action === 'gasoracle') {
      return await getGasOracle(chainid);
    } else {
      return 'Unknown action: ' + action + '. Use: balance, txlist, gasoracle.';
    }
  } catch (e) {
    return 'Error: ' + (e.message || String(e));
  }
}

// ── Node.js CLI ───────────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var args = process.argv.slice(2);
  var cmdStr = args.join(' ');
  if (cmdStr) {
    runFromParams({ command: cmdStr })
      .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
      .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
  } else {
    runFromParams({})
      .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
      .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
  }
}

// ── PARAMS auto-run ────────────────────────────────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
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
