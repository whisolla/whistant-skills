// a-stock-analysis.js — A股实时行情 via EastMoney API
// Pure fetch(), no API key required.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

const BASE = 'https://push2.eastmoney.com/api/qt';
const REFERER_BASE = 'https://quote.eastmoney.com/';

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

function init() {}

async function getQuote(code) {
  var secid = getSecId(code);
  var res = await fetch(
    BASE + '/stock/get?secid=' + secid + '&fields=f43,f57,f58,f169,f170,f60,f44,f45,f46,f47&ut=bd1d9ddb04089700cf9c27f6f7426281',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  var d = data.data;
  if (!d) return { error: 'No data — check code or market hours' };
  return {
    name:      d.f58,
    code:      d.f57,
    price:     d.f43 / 100,
    prevClose: d.f60 / 100,
    open:      d.f46 / 100,
    high:      d.f44 / 100,
    low:       d.f45 / 100,
    changeAmt: d.f169 / 100,
    changePct: (d.f170 / 100).toFixed(2) + '%',
    volume:    d.f47,
  };
}

async function getTopGainers(n) {
  n = n || 10;
  var res = await fetch(
    BASE + '/clist/get?pn=1&pz=' + n + '&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  return (data && data.data && data.data.diff || []).map(function(s) {
    return {
      code:      s.f12,
      name:      s.f14,
      changePct: s.f3 + '%',
      price:     s.f43 === '-' ? null : s.f43 / 100,
      volume:    s.f5,
      amount:    s.f62,
    };
  });
}

async function getTopLosers(n) {
  n = n || 10;
  var res = await fetch(
    BASE + '/clist/get?pn=1&pz=' + n + '&po=0&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  return (data && data.data && data.data.diff || []).map(function(s) {
    return {
      code:      s.f12,
      name:      s.f14,
      changePct: s.f3 + '%',
      price:     s.f43 === '-' ? null : s.f43 / 100,
      volume:    s.f5,
      amount:    s.f62,
    };
  });
}

async function getMostActive(n) {
  n = n || 10;
  var res = await fetch(
    BASE + '/clist/get?pn=1&pz=' + n + '&po=1&np=1&fltt=2&invt=2&fid=f6&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  return (data && data.data && data.data.diff || []).map(function(s) {
    return {
      code:   s.f12,
      name:   s.f14,
      price:  s.f43 === '-' ? null : s.f43 / 100,
      volume: s.f5,
      amount: s.f62,
    };
  });
}

async function getKline(code, days) {
  days = days || 30;
  var secid = getSecId(code);
  var res = await fetch(
    'https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=' + secid + '&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=1&lmt=' + days + '&end=20500101',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  return (data && data.data && data.data.klines || []).map(function(k) {
    var parts = k.split(',');
    return {
      date:  parts[0],
      open:  +parts[1],
      close: +parts[2],
      high:  +parts[3],
      low:   +parts[4],
      vol:   +parts[5],
      amount: +parts[6],
    };
  });
}

async function getMinKline(code, days) {
  days = days || 5;
  var secid = getSecId(code);
  var res = await fetch(
    'https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=' + secid + '&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=1&fqt=1&lmt=' + (days * 240) + '&end=20500101',
    { headers: { 'Referer': REFERER_BASE }, timeout: 10 }
  );
  var data = await res.json();
  return (data && data.data && data.data.klines || []).map(function(k) {
    var parts = k.split(',');
    return {
      date:  parts[0],
      open:  +parts[1],
      close: +parts[2],
      high:  +parts[3],
      low:   +parts[4],
      vol:   +parts[5],
      amount: +parts[6],
    };
  });
}

async function analyzeVolume(code) {
  var klines = await getKline(code, 30);
  if (!klines || !klines.length) return { error: 'No data' };
  var avg = 0, recentAvg = 0;
  for (var i = 0; i < klines.length; i++) avg += klines[i].vol;
  avg = avg / klines.length;
  var recent = klines.slice(-5);
  for (var j = 0; j < recent.length; j++) recentAvg += recent[j].vol;
  recentAvg = recentAvg / recent.length;
  var ratio = recentAvg / avg;
  var trend = ratio > 1.2 ? '放量' : ratio < 0.8 ? '缩量' : '平量';
  var todayMin = await getMinKline(code, 1);
  var morningVol = 0, afternoonVol = 0;
  for (var k = 0; k < todayMin.length; k++) {
    var h = parseInt((todayMin[k].date.split(' ')[1] || '0:0').split(':')[0], 10);
    if (h < 12) morningVol += todayMin[k].vol;
    else afternoonVol += todayMin[k].vol;
  }
  return {
    code: code,
    avgVolume: Math.round(avg),
    recentAvgVolume: Math.round(recentAvg),
    volumeRatio: ratio.toFixed(2),
    trend: trend,
    morningVol: morningVol,
    afternoonVol: afternoonVol,
    signal: ratio > 1.3 ? '主力吸筹' : ratio > 1.1 ? '温和放量' : ratio < 0.7 ? '主力出货' : '正常',
  };
}

async function portfolioPnL(portfolio) {
  var results = [];
  for (var idx = 0; idx < portfolio.length; idx++) {
    var pos = portfolio[idx];
    var c = pos[0], lots = pos[1], cost = pos[2];
    var q = await getQuote(c);
    if (q.error) { results.push({ code: c, error: q.error }); continue; }
    var invested = lots * cost;
    var current  = lots * q.price;
    var pnl      = current - invested;
    var pct      = ((pnl / invested) * 100).toFixed(2);
    results.push({
      code: c, lots: lots, cost: cost,
      current: q.price,
      invested: invested.toFixed(2),
      currentValue: current.toFixed(2),
      pnl: pnl.toFixed(2),
      pnlPct: pct + '%',
      changePct: q.changePct,
    });
  }
  var totalInvested = 0, totalValue = 0;
  for (var t = 0; t < results.length; t++) {
    totalInvested += parseFloat(results[t].invested) || 0;
    totalValue += parseFloat(results[t].currentValue) || 0;
  }
  var totalPnl = totalValue - totalInvested;
  var totalPct = ((totalPnl / totalInvested) * 100).toFixed(2);
  return {
    positions: results,
    totalInvested: totalInvested.toFixed(2),
    totalValue: totalValue.toFixed(2),
    totalPnl: totalPnl.toFixed(2),
    totalPnlPct: totalPct + '%',
  };
}

// EMA helper
function calcEMA(data, period) {
  var k = 2 / (period + 1);
  var ema = data[0];
  for (var i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

// Helper: resolve secid for EastMoney
function getSecId(code) {
  if (code.charAt(0) === '6') return '1.' + code;
  if (code.charAt(0) === '8' || code.charAt(0) === '4') return '2.' + code;
  return '0.' + code;
}

// ─── 2. HANDLER ────────────────────────────────────────────────────────────────
async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ─── 3. EXPORTS ───────────────────────────────────────────────────────────────
var aStockApi = {
  handler:     handler,
  runFromParams: runFromParams,
  init:        init,
  getQuote:    getQuote,
  getTopGainers: getTopGainers,
  getTopLosers: getTopLosers,
  getMostActive: getMostActive,
  getKline:    getKline,
  getMinKline:  getMinKline,
  analyzeVolume: analyzeVolume,
  portfolioPnL: portfolioPnL,
};

if (typeof module !== 'undefined' && module.exports) { module.exports = aStockApi; }
if (typeof globalThis !== 'undefined') { globalThis.aStockApi = aStockApi; }

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
  var out = { code: undefined, action: undefined, count: undefined, days: undefined };
  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();
  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--code' || t === '-c') && i + 1 < tokens.length) {
      out.code = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--action' || t === '-a') && i + 1 < tokens.length) {
      out.action = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--count' || t === '-n') && i + 1 < tokens.length) {
      out.count = parseInt(tokens[i + 1], 10); i += 2; continue;
    }
    if ((t === '--days' || t === '-d') && i + 1 < tokens.length) {
      out.days = parseInt(tokens[i + 1], 10); i += 2; continue;
    }
    i += 1;
  }
  if (!out.code && tokens.length) out.code = tokens[0];
  return out;
}

// ─── 5. runFromParams ────────────────────────────────────────────────────────
async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var code = params.code || params.symbol || params.input || '';
  var action = params.action || 'analyze';

  if (!code && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.code) code = parsed.code;
    if (parsed.action) action = parsed.action;
    if (parsed.count) params.count = parsed.count;
    if (parsed.days) params.days = parsed.days;
  }

  if (!code && action === 'analyze') {
    // Still run analyze if no code but action is gainers/losers/mostActive/portfolio
    if (['gainers', 'losers', 'mostActive', 'portfolio'].indexOf(action) === -1) {
      return 'Usage:\n  aStockApi.getQuote("600036")\n  aStockApi.runFromParams({code:"600036", action:"analyze"})\n  aStockApi.runFromParams({action:"gainers", count:10})\n  aStockApi.runFromParams({action:"losers", count:10})';
    }
  }

  try {
    if (action === 'quote' || action === 'getQuote') {
      return await getQuote(code);
    }
    if (action === 'kline' || action === 'getKline') {
      return await getKline(code, params.days || 30);
    }
    if (action === 'gainers') {
      return await getTopGainers(params.count || 10);
    }
    if (action === 'losers') {
      return await getTopLosers(params.count || 10);
    }
    if (action === 'mostActive' || action === 'active') {
      return await getMostActive(params.count || 10);
    }
    if (action === 'volume' || action === 'analyzeVolume') {
      return await analyzeVolume(code);
    }
    if (action === 'minKline' || action === 'getMinKline') {
      return await getMinKline(code, params.days || 5);
    }
    if (action === 'portfolio') {
      return await portfolioPnL(params.portfolio || []);
    }
    // Default: full analyze
    var quote = await getQuote(code);
    if (quote.error) return { error: true, message: '查询失败：' + quote.error };
    var klines = await getKline(code, 30);
    if (!klines || !klines.length) return { error: true, message: '未能获取 ' + code + ' 的K线数据' };

    // Technical indicators
    var closes = [];
    for (var ci = 0; ci < klines.length; ci++) closes.push(klines[ci].close);
    var ma5 = 0, ma10 = 0, ma20 = 0;
    for (var m5 = closes.length - 5; m5 < closes.length; m5++) ma5 += closes[m5];
    ma5 = ma5 / 5;
    for (var m10 = closes.length - 10; m10 < closes.length; m10++) ma10 += closes[m10];
    ma10 = ma10 / 10;
    for (var m20 = 0; m20 < closes.length; m20++) ma20 += closes[m20];
    ma20 = ma20 / klines.length;

    // RSI-14
    var gains = 0, losses = 0;
    for (var ri = closes.length - 14; ri < closes.length - 1; ri++) {
      var diff = closes[ri + 1] - closes[ri];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    var avgGain = gains / 14;
    var avgLoss = losses / 14;
    var rsi = avgLoss === 0 ? 100 : parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(1));

    // MACD
    var ema12 = calcEMA(closes, 12);
    var ema26 = calcEMA(closes, 26);
    var dif = ema12 - ema26;
    var dea = calcEMA([dif], 9);
    var macd = 2 * (dif - dea);

    // Bollinger
    var sma20 = ma20;
    var variance = 0;
    for (var vi = 0; vi < closes.length; vi++) variance += Math.pow(closes[vi] - sma20, 2);
    variance = variance / klines.length;
    var stdDev = Math.sqrt(variance);
    var bbUpper = sma20 + 2 * stdDev;
    var bbLower = sma20 - 2 * stdDev;
    var bbPosition = stdDev === 0 ? 0 : ((quote.price - sma20) / (2 * stdDev)) * 100;

    // Volume ratio
    var avgVol = 0;
    for (var vi2 = 0; vi2 < klines.length; vi2++) avgVol += klines[vi2].vol;
    avgVol = avgVol / klines.length;
    var recent5 = klines.slice(-5);
    var recentAvg = 0;
    for (var vi3 = 0; vi3 < recent5.length; vi3++) recentAvg += recent5[vi3].vol;
    recentAvg = recentAvg / 5;
    var volRatio = recentAvg / avgVol;
    var volTrend = volRatio > 1.2 ? '放量' : volRatio < 0.8 ? '缩量' : '平量';

    // 30-day change
    var priceChange30 = ((closes[closes.length - 1] - closes[0]) / closes[0] * 100).toFixed(2);

    // Signal
    var signal = '观望';
    if (rsi < 30 && macd < 0) signal = '超卖区域，谨慎买入';
    else if (rsi > 70 && macd > 0) signal = '超买区域，注意风险';
    else if (quote.changeAmt < 0 && volRatio > 1.3) signal = '价跌量增，注意风险';
    else if (quote.changeAmt > 0 && volRatio > 1.3) signal = '价升量增，强势信号';

    var signalText = '趋势不明，保持观望';
    if (rsi < 30 && macd < 0) signalText = 'RSI超卖，MACD显示下行压力，谨慎观望';
    else if (rsi > 70 && macd > 0) signalText = 'RSI超买，注意回调风险';
    else if (quote.changeAmt < 0 && volRatio > 1.3) signalText = '下跌放量，可能继续调整';
    else if (quote.changeAmt > 0 && volRatio > 1.3) signalText = '上涨放量，强势信号，可适当关注';
    else if (rsi >= 40 && rsi <= 60) signalText = '区间震荡，高抛低吸';

    return {
      code: quote.code,
      name: quote.name,
      price: quote.price,
      changeAmt: quote.changeAmt,
      changePct: quote.changePct,
      ma5: ma5, ma10: ma10, ma20: ma20,
      rsi: rsi,
      macd: { dif: dif, dea: dea, macd: macd },
      bollinger: { upper: bbUpper, middle: sma20, lower: bbLower },
      volRatio: volRatio,
      volTrend: volTrend,
      priceChange30: parseFloat(priceChange30),
      message: 'Code: ' + quote.code + ' | Price: ¥' + quote.price.toFixed(2) + ' | Change: ' + quote.changeAmt + ' (' + quote.changePct + ') | RSI: ' + rsi + ' | MACD: ' + (macd >= 0 ? 'bullish' : 'bearish') + ' | Signal: ' + signalText,
    };
  } catch (e) {
    return { error: true, message: '分析失败：' + (e && e.message ? e.message : String(e)) };
  }
}

// ─── 6. Node.js CLI entry (local dev only — never fires on device) ───────────
if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ─── 7. PARAMS auto-run block — device /cmd path ONLY ───────────────────────
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
