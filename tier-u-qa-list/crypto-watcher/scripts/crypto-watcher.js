// ============================================================================
// crypto-watcher — CoinGecko free tier: price, 24h change, market cap
// JSC compat: pure fetch, no AbortController
// CoinGecko free API: no key required, rate limit 10-30 calls/min
// ============================================================================

var COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC
// ---------------------------------------------------------------------------

async function getPrice(coinId) {
  if (!coinId || typeof coinId !== 'string') {
    throw new Error('coin ID is required (e.g. "bitcoin", "ethereum").');
  }
  var url = COINGECKO_BASE + '/simple/price?ids=' + encodeURIComponent(coinId.toLowerCase().trim())
    + '&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true';
  var res = await fetch(url, { timeout: 12 });
  if (!res.ok) {
    if (res.status === 429) throw new Error('CoinGecko rate limit exceeded. Wait a minute and try again.');
    throw new Error('CoinGecko HTTP ' + res.status);
  }
  var data = await res.json();
  var coinData = data[coinId.toLowerCase().trim()];
  if (!coinData) {
    throw new Error('Coin "' + coinId + '" not found. Use getPrice("bitcoin"), getPrice("ethereum"), etc.');
  }
  var price = coinData.usd;
  var change = coinData.usd_24h_change;
  var updated = coinData.last_updated_at;
  var changeStr = (change !== undefined && change !== null)
    ? (change >= 0 ? '+' : '') + change.toFixed(2) + '%'
    : 'N/A';
  var timeStr = updated ? new Date(updated * 1000).toISOString() : 'N/A';
  return coinId.toUpperCase() + ' — $' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
    + ' | 24h: ' + changeStr + ' | Updated: ' + timeStr;
}

async function getMarket(coinId) {
  if (!coinId || typeof coinId !== 'string') {
    throw new Error('coin ID is required.');
  }
  var url = COINGECKO_BASE + '/coins/' + encodeURIComponent(coinId.toLowerCase().trim())
    + '?localization=false&tickers=false&community_data=false&developer_data=false'
    + '&sparkline=false';
  var res = await fetch(url, { timeout: 15 });
  if (!res.ok) {
    if (res.status === 429) throw new Error('CoinGecko rate limit exceeded. Wait a minute and try again.');
    throw new Error('CoinGecko HTTP ' + res.status);
  }
  var data = await res.json();
  var mkt = data.market_data || {};
  var price = mkt.current_price && mkt.current_price.usd;
  var mcap = mkt.market_cap && mkt.market_cap.usd;
  var vol = mkt.total_volume && mkt.total_volume.usd;
  var circ = mkt.circulating_supply || 0;
  var ath = mkt.ath && mkt.ath.usd;
  var athDate = mkt.ath_date && mkt.ath_date.usd;
  var change1h = mkt.price_change_percentage_1h_in_currency && mkt.price_change_percentage_1h_in_currency.usd;
  var change24h = mkt.price_change_percentage_24h;
  var change7d = mkt.price_change_percentage_7d;
  var change30d = mkt.price_change_percentage_30d;

  var lines = [];
  lines.push('\uD83D\uDCC8 ' + data.name + ' (' + data.symbol.toUpperCase() + ')');
  if (price) lines.push('Price: $' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
  if (mcap) lines.push('MCap: $' + mcap.toLocaleString('en-US', { maximumFractionDigits: 0 }));
  if (vol) lines.push('Vol: $' + vol.toLocaleString('en-US', { maximumFractionDigits: 0 }));
  if (circ) lines.push('Circ: ' + circ.toLocaleString('en-US', { maximumFractionDigits: 0 }));
  var changes = [];
  if (change1h !== null && change1h !== undefined) changes.push('1h:' + fmtPct(change1h));
  if (change24h !== null && change24h !== undefined) changes.push('24h:' + fmtPct(change24h));
  if (change7d !== null && change7d !== undefined) changes.push('7d:' + fmtPct(change7d));
  if (change30d !== null && change30d !== undefined) changes.push('30d:' + fmtPct(change30d));
  if (changes.length) lines.push('Changes: ' + changes.join(' | '));
  if (ath) lines.push('ATH: $' + ath.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
  if (athDate) lines.push('ATH Date: ' + athDate.substring(0, 10));
  lines.push('Rank: #' + ((data.market_cap_rank || data.coingecko_rank) || '?'));
  return lines.join('\n');
}

async function getWatchlist(coinIds) {
  if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
    throw new Error('watchlist requires an array of coin IDs, e.g. ["bitcoin","ethereum","solana"]');
  }
  var ids = coinIds.map(function(id) { return id.toLowerCase().trim(); }).join(',');
  var url = COINGECKO_BASE + '/simple/price?ids=' + encodeURIComponent(ids)
    + '&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true';
  var res = await fetch(url, { timeout: 15 });
  if (!res.ok) {
    if (res.status === 429) throw new Error('CoinGecko rate limit exceeded. Wait a minute and try again.');
    throw new Error('CoinGecko HTTP ' + res.status);
  }
  var data = await res.json();
  var lines = ['\uD83D\uDCCA CRYPTO WATCHLIST\n'];
  var keys = Object.keys(data);
  if (keys.length === 0) {
    return 'No data returned. Check coin IDs.';
  }
  keys.forEach(function(id) {
    var cd = data[id];
    var price = cd.usd;
    var change = cd.usd_24h_change;
    var mcap = cd.usd_market_cap;
    var changeStr = (change !== undefined && change !== null)
      ? (change >= 0 ? '+' : '') + change.toFixed(2) + '%'
      : 'N/A';
    var mcapStr = mcap ? '$' + (mcap >= 1e12 ? (mcap/1e12).toFixed(2) + 'T' : mcap >= 1e9 ? (mcap/1e9).toFixed(2) + 'B' : mcap >= 1e6 ? (mcap/1e6).toFixed(2) + 'M' : mcap.toLocaleString()) : '';
    lines.push(id.toUpperCase() + ' | $' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) + ' | 24h ' + changeStr + (mcapStr ? ' | MCap ' + mcapStr : ''));
  });
  return lines.join('\n');
}

async function lookupCoin(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('lookup requires a search term, e.g. lookupCoin("dogecoin")');
  }
  var url = COINGECKO_BASE + '/search?query=' + encodeURIComponent(query.trim());
  var res = await fetch(url, { timeout: 12 });
  if (!res.ok) throw new Error('CoinGecko HTTP ' + res.status);
  var data = await res.json();
  var coins = (data.coins || []).slice(0, 8);
  if (coins.length === 0) return 'No results for "' + query + '".';
  var lines = ['\uD83D\uDD0D Results for "' + query + '":\n'];
  coins.forEach(function(coin) {
    var thumb = coin.thumb ? ' [' + coin.thumb + ']' : '';
    lines.push(coin.name + ' (' + coin.symbol.toUpperCase() + ')' + thumb + ' — id: ' + coin.id);
  });
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

var skillApi = { getPrice, getMarket, getWatchlist, lookupCoin, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.crypto_watcher = skillApi;
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
  var out = { action: undefined, coin: undefined, coins: undefined };
  if (!tokens.length) return out;

  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--action' || t === '-a') && i + 1 < tokens.length) {
      out.action = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--coin' || t === '-c') && i + 1 < tokens.length) {
      out.coin = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--coins') && i + 1 < tokens.length) {
      // comma-separated list
      out.coins = tokens[i + 1].split(',').map(function(s) { return s.trim(); }); i += 2; continue;
    }
    if ((t === '--lookup') && i + 1 < tokens.length) {
      out.action = 'lookup'; out.coin = tokens[i + 1]; i += 2; continue;
    }
    if (t.startsWith('-')) { i += 1; continue; }
    // First non-flag token is the action or coin
    if (!out.action) out.action = t;
    else if (!out.coin) out.coin = t;
    i += 1;
  }
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

  var action = params.action || '';
  var coin = params.coin || params.id || params.input || '';
  var coins = params.coins || params.watchlist || [];

  if (!action && params.command) {
    var parsed = parseCommand(params.command);
    action = parsed.action || action;
    coin = parsed.coin || coin;
    coins = parsed.coins || coins;
  }
  if (!action && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    action = parsed.action || action;
    coin = parsed.coin || coin;
    coins = parsed.coins || coins;
  }

  if (!action || action === 'price') {
    if (!coin) return 'Usage: crypto-watcher price <coin-id>\nExample: crypto-watcher price bitcoin\nSupported coins: bitcoin, ethereum, solana, dogecoin, etc.';
    return await getPrice(coin);
  }
  if (action === 'market') {
    if (!coin) return 'Usage: crypto-watcher market <coin-id>\nExample: crypto-watcher market bitcoin';
    return await getMarket(coin);
  }
  if (action === 'watch' || action === 'watchlist') {
    if (!coins || coins.length === 0) {
      // coin may be a comma-separated string from parseCommand
      if (coin && typeof coin === 'string' && coin.indexOf(',') !== -1) {
        coins = coin.split(',').map(function(s) { return s.trim(); });
      }
    }
    if (!coins || coins.length === 0) {
      return 'Usage: crypto-watcher watch bitcoin,ethereum,solana\nExample: crypto-watcher watch bitcoin,ethereum,solana --action watch';
    }
    return await getWatchlist(coins);
  }
  if (action === 'lookup') {
    if (!coin) return 'Usage: crypto-watcher lookup "search term"\nExample: crypto-watcher lookup dogecoin';
    return await lookupCoin(coin);
  }
  return 'Usage: crypto-watcher <price|market|watch|lookup> [args]\n'
    + '  price <coin>     — current price + 24h change\n'
    + '  market <coin>    — full market data (MCap, volume, ATH, etc.)\n'
    + '  watch <a,b,c>    — watchlist for multiple coins\n'
    + '  lookup "query"   — search CoinGecko for coin ID\n'
    + 'Examples:\n'
    + '  crypto-watcher price bitcoin\n'
    + '  crypto-watcher market ethereum\n'
    + '  crypto-watcher watch bitcoin,ethereum,solana\n'
    + '  crypto-watcher lookup dogecoin';
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
// 7. PARAMS auto-run
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

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function fmtPct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}
