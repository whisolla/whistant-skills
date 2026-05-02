// a-stock-analysis.js — A股实时行情 via EastMoney API
// Pure fetch(), no API key required.

const BASE = 'https://push2.eastmoney.com/api/qt';
const REFERER = { headers: { 'Referer': 'https://quote.eastmoney.com/' } };

// ─── init ──────────────────────────────────────────────────────────────────────
function init() {}

// ─── handler ───────────────────────────────────────────────────────────────────
async function handler(event, context) {
  try {
    const params = (event && event.parameters) || {};
    const code = (params.code || '').toString().trim();

    if (!code) {
      return { error: true, message: '请提供股票代码，例如：600036、000001、300750' };
    }

    // Fetch quote + K-line in parallel
    const [quote, klines] = await Promise.all([
      getQuote(code),
      getKline(code, 30),
    ]);

    if (quote.error) {
      return { error: true, message: `查询失败：${quote.error}` };
    }

    if (!klines || klines.length === 0) {
      return { error: true, message: `未能获取 ${code} 的K线数据，可能已停牌或代码错误` };
    }

    // Technical indicators
    const closes = klines.map(k => k.close);
    const ma5    = closes.slice(-5).reduce((s, v) => s + v, 0) / 5;
    const ma10   = closes.slice(-10).reduce((s, v) => s + v, 0) / 10;
    const ma20   = closes.reduce((s, v) => s + v, 0) / klines.length;

    // RSI-14
    let gains = 0, losses = 0;
    for (let i = closes.length - 14; i < closes.length - 1; i++) {
      const diff = closes[i + 1] - closes[i];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rsi = avgLoss === 0 ? 100 : parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(1));

    // MACD (12,26,9)
    const ema12 = calcEMA(closes, 12);
    const ema26 = calcEMA(closes, 26);
    const dif = ema12 - ema26;
    const dea = calcEMA([dif], 9);
    const macd = 2 * (dif - dea);

    // Bollinger Bands
    const sma20 = ma20;
    const variance = closes.reduce((s, v) => s + Math.pow(v - sma20, 2), 0) / klines.length;
    const stdDev = Math.sqrt(variance);
    const bbUpper = sma20 + 2 * stdDev;
    const bbLower = sma20 - 2 * stdDev;
    const bbPosition = stdDev === 0 ? 0 : ((quote.price - sma20) / (2 * stdDev)) * 100;

    // Volume ratio
    const avgVol  = klines.reduce((s, k) => s + k.vol, 0) / klines.length;
    const recent5  = klines.slice(-5);
    const recentAvg = recent5.reduce((s, k) => s + k.vol, 0) / 5;
    const volRatio = recentAvg / avgVol;
    const volTrend = volRatio > 1.2 ? '放量' : volRatio < 0.8 ? '缩量' : '平量';

    // 30-day change
    const priceChange30 = ((closes[closes.length - 1] - closes[0]) / closes[0] * 100).toFixed(2);

    // Recent trend
    const last5 = klines.slice(-5);
    const upCount = last5.filter((k, i) => i > 0 && k.close > klines[last5.indexOf(k) - 1].close).length;
    const trendText = upCount >= 4 ? '上升趋势' : upCount <= 1 ? '下降趋势' : '震荡';

    // Signal
    let signal = '观望';
    if (rsi < 30 && macd < 0) signal = '超卖区域，谨慎买入';
    else if (rsi > 70 && macd > 0) signal = '超买区域，注意风险';
    else if (quote.changeAmt < 0 && volRatio > 1.3) signal = '价跌量增，注意风险';
    else if (quote.changeAmt > 0 && volRatio > 1.3) signal = '价升量增，强势信号';

    const message =
`📊 **${quote.name} (${quote.code}) 个股分析**

**▎实时行情**
| 项目 | 数值 |
|------|------|
| 最新价 | ¥${quote.price.toFixed(2)} |
| 涨跌 | ${quote.changeAmt >= 0 ? '+' : ''}¥${quote.changeAmt.toFixed(2)} (${quote.changePct}) |
| 今开/昨收 | ¥${quote.open.toFixed(2)} / ¥${quote.prevClose.toFixed(2)} |
| 最高/最低 | ¥${quote.high.toFixed(2)} / ¥${quote.low.toFixed(2)} |
| 成交量 | ${(quote.volume / 10000).toFixed(2)}万手 |

**▎技术指标**
| 指标 | 数值 | 信号 |
|------|------|------|
| MA5 | ¥${ma5.toFixed(2)} | ${quote.price > ma5 ? '✅ 价格之上' : '🔴 价格之下'} |
| MA10 | ¥${ma10.toFixed(2)} | ${quote.price > ma10 ? '✅ 价格之上' : '🔴 价格之下'} |
| MA20 | ¥${ma20.toFixed(2)} | ${quote.price > ma20 ? '✅ 价格之上' : '🔴 价格之下'} |
| RSI(14) | ${rsi} | ${rsi < 30 ? '🟢 超卖' : rsi > 70 ? '🔴 超买' : '正常'} |
| MACD | DIF=${dif.toFixed(3)} DEA=${dea.toFixed(3)} | ${macd >= 0 ? '🟢 金叉' : '🔴 死叉'} |
| 布林带 | 上¥${bbUpper.toFixed(2)} 中¥${sma20.toFixed(2)} 下¥${bbLower.toFixed(2)} | ${bbPosition >= 0 ? '中上轨' : '中下轨'} |
| 量比 | ${volRatio.toFixed(2)} | ${volTrend} |
| 30日涨跌 | ${priceChange30 >= 0 ? '+' : ''}${priceChange30}% | ${priceChange30 >= 0 ? '🟢' : '🔴'} |

**▎近期K线（近5日）**
${klines.slice(-5).map(k => {
  const pct = ((k.close - k.open) / k.open * 100).toFixed(2);
  const arrow = k.close >= k.open ? '▲' : '▼';
  return `- ${k.date}  收:¥${k.close}  开:¥${k.open}  高:¥${k.high}  低:¥${k.low}  量:${(k.vol/10000).toFixed(0)}万手  ${arrow}${pct}%`;
}).join('\n')}

**▎综合研判**
- 短期趋势：${trendText}
- 量能状态：${volTrend}（量比${volRatio.toFixed(2)}）
- 当前信号：${signal}
- 建议：${signalText(signal, rsi, macd, volRatio, quote.changeAmt)}`;

    return {
      code: quote.code,
      name: quote.name,
      price: quote.price,
      changeAmt: quote.changeAmt,
      changePct: quote.changePct,
      ma5, ma10, ma20,
      rsi,
      macd: { dif, dea, macd },
      bollinger: { upper: bbUpper, middle: sma20, lower: bbLower },
      volRatio,
      volTrend,
      priceChange30: parseFloat(priceChange30),
      message,
    };
  } catch (e) {
    return { error: true, message: `分析失败：${e && e.message ? e.message : String(e)}` };
  }
}

function signalText(signal, rsi, macd, volRatio, changeAmt) {
  if (rsi < 30 && macd < 0) return 'RSI超卖，MACD显示下行压力，谨慎观望';
  if (rsi > 70 && macd > 0) return 'RSI超买，注意回调风险';
  if (changeAmt < 0 && volRatio > 1.3) return '下跌放量，可能继续调整';
  if (changeAmt > 0 && volRatio > 1.3) return '上涨放量，强势信号，可适当关注';
  if (rsi >= 40 && rsi <= 60) return '区间震荡，高抛低吸';
  return '趋势不明，保持观望';
}

// EMA helper
function calcEMA(data, period) {
  const k = 2 / (period + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

// ─── helpers ───────────────────────────────────────────────────────────────────
function getSecId(code) {
  if (code.startsWith('6')) return '1.' + code;
  if (code.startsWith('8') || code.startsWith('4')) return '2.' + code;
  return '0.' + code;
}

// ─── 1. Real-time quote ──────────────────────────────────────────────────────
async function getQuote(code) {
  const secid = getSecId(code);
  const res = await fetch(
    `${BASE}/stock/get?secid=${secid}&fields=f43,f57,f58,f169,f170,f60,f44,f45,f46,f47&ut=bd1d9ddb04089700cf9c27f6f7426281`,
    REFERER
  );
  const data = await res.json();
  const d = data.data;
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

// ─── 2. Screener: top gainers ─────────────────────────────────────────────────
async function getTopGainers(n = 10) {
  const res = await fetch(
    `${BASE}/clist/get?pn=1&pz=${n}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62`,
    REFERER
  );
  const data = await res.json();
  return (data?.data?.diff ?? []).map(s => ({
    code:      s.f12,
    name:      s.f14,
    changePct: s.f3 + '%',
    price:     s.f43 === '-' ? null : s.f43 / 100,
    volume:    s.f5,
    amount:    s.f62,
  }));
}

// ─── 3. Screener: top losers ──────────────────────────────────────────────────
async function getTopLosers(n = 10) {
  const res = await fetch(
    `${BASE}/clist/get?pn=1&pz=${n}&po=0&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62`,
    REFERER
  );
  const data = await res.json();
  return (data?.data?.diff ?? []).map(s => ({
    code:      s.f12,
    name:      s.f14,
    changePct: s.f3 + '%',
    price:     s.f43 === '-' ? null : s.f43 / 100,
    volume:    s.f5,
    amount:    s.f62,
  }));
}

// ─── 4. Screener: most active by turnover ───────────────────────────────────
async function getMostActive(n = 10) {
  const res = await fetch(
    `${BASE}/clist/get?pn=1&pz=${n}&po=1&np=1&fltt=2&invt=2&fid=f6&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f43,f9,f5,f62`,
    REFERER
  );
  const data = await res.json();
  return (data?.data?.diff ?? []).map(s => ({
    code:    s.f12,
    name:    s.f14,
    price:   s.f43 === '-' ? null : s.f43 / 100,
    volume:  s.f5,
    amount:  s.f62,
  }));
}

// ─── 5. K-line historical data ───────────────────────────────────────────────
async function getKline(code, days = 30) {
  const secid = getSecId(code);
  const res = await fetch(
    `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=1&lmt=${days}&end=20500101`,
    REFERER
  );
  const data = await res.json();
  return (data?.data?.klines ?? []).map(k => {
    const [date, open, close, high, low, vol, amount] = k.split(',');
    return { date, open: +open, close: +close, high: +high, low: +low, vol: +vol, amount: +amount };
  });
}

// ─── 6. Minute K-line (分时) ──────────────────────────────────────────────────
async function getMinKline(code, days = 5) {
  const secid = getSecId(code);
  const res = await fetch(
    `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=1&fqt=1&lmt=${days * 240}&end=20500101`,
    REFERER
  );
  const data = await res.json();
  return (data?.data?.klines ?? []).map(k => {
    const [date, open, close, high, low, vol, amount] = k.split(',');
    return { date, open: +open, close: +close, high: +high, low: +low, vol: +vol, amount: +amount };
  });
}

// ─── 7. Volume profile analysis ──────────────────────────────────────────────
async function analyzeVolume(code) {
  const klines = await getKline(code, 30);
  if (!klines.length) return { error: 'No data' };

  const avg    = klines.reduce((s, k) => s + k.vol, 0) / klines.length;
  const recent = klines.slice(-5);
  const recentAvg = recent.reduce((s, k) => s + k.vol, 0) / recent.length;

  const ratio = recentAvg / avg;
  const trend  = ratio > 1.2 ? '放量' : ratio < 0.8 ? '缩量' : '平量';

  const todayMin = await getMinKline(code, 1);
  let morningVol = 0, afternoonVol = 0;
  for (const m of todayMin) {
    const h = parseInt(m.date.split(' ')[1]?.split(':')[0] ?? '0');
    if (h < 12) morningVol += m.vol;
    else afternoonVol += m.vol;
  }

  return {
    code,
    avgVolume:    Math.round(avg),
    recentAvgVolume: Math.round(recentAvg),
    volumeRatio:  ratio.toFixed(2),
    trend,
    morningVol,
    afternoonVol,
    signal: ratio > 1.3 ? '主力吸筹' : ratio > 1.1 ? '温和放量' : ratio < 0.7 ? '主力出货' : '正常',
  };
}

// ─── 8. Portfolio P&L ────────────────────────────────────────────────────────
async function portfolioPnL(portfolio) {
  const results = [];
  for (const [code, lots, cost] of portfolio) {
    const q = await getQuote(code);
    if (q.error) { results.push({ code, error: q.error }); continue; }
    const invested = lots * cost;
    const current  = lots * q.price;
    const pnl      = current - invested;
    const pct      = ((pnl / invested) * 100).toFixed(2);
    results.push({
      code, lots, cost,
      current: q.price,
      invested: invested.toFixed(2),
      currentValue: current.toFixed(2),
      pnl: pnl.toFixed(2),
      pnlPct: pct + '%',
      changePct: q.changePct,
    });
  }
  const totalInvested = results.reduce((s, r) => s + (parseFloat(r.invested) || 0), 0);
  const totalValue    = results.reduce((s, r) => s + (parseFloat(r.currentValue) || 0), 0);
  const totalPnl     = totalValue - totalInvested;
  const totalPct     = ((totalPnl / totalInvested) * 100).toFixed(2);
  return { positions: results, totalInvested: totalInvested.toFixed(2), totalValue: totalValue.toFixed(2), totalPnl: totalPnl.toFixed(2), totalPnlPct: totalPct + '%' };
}

module.exports = {
  handler,
  init,
  getQuote,
  getTopGainers,
  getTopLosers,
  getMostActive,
  getKline,
  getMinKline,
  analyzeVolume,
  portfolioPnL,
};
