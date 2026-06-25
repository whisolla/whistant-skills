/**
 * crypto-levels — Crypto support/resistance level analyzer
 *
 * Fetches live CoinGecko price data (free, no API key) and calculates:
 * - Support/resistance levels (local maxima/minima from 30-day history)
 * - Fibonacci retracement levels (0.236 / 0.382 / 0.5 / 0.618)
 * - Moving averages (MA50, MA100, MA200)
 * - RSI(14)
 * - 24h change + trading insights
 *
 * Evolved from 362224222/crypto-levels — original Python used requests lib + CoinGecko.
 * Replaced with fetch()-based JSC-compatible implementation.
 */

// ── CoinGecko symbol mapping ───────────────────────────────────

var COIN_IDS = {
  "BTC": "bitcoin", "ETH": "ethereum", "BNB": "binancecoin",
  "SOL": "solana", "XRP": "ripple", "ADA": "cardano",
  "DOGE": "dogecoin", "DOT": "polkadot", "AVAX": "avalanche-2",
  "MATIC": "matic-network", "LINK": "chainlink", "UNI": "uniswap",
  "ATOM": "cosmos", "LTC": "litecoin", "BCH": "bitcoin-cash",
  "XLM": "stellar", "SHIB": "shiba-inu", "TRX": "tron",
  "ETC": "ethereum-classic", "FIL": "filecoin", "AAVE": "aave",
  "COMP": "compound-governance-token", "MKR": "maker",
  "SNX": "havven", "SUSHI": "sushi", "YFI": "yearn-finance",
  "CRV": "curve-dao-token", "OP": "optimism", "ARB": "arbitrum",
  "FET": "fetch-ai", "RNDR": "render-token", "GRT": "the-graph",
  "NEAR": "near", "APT": "aptos", "SUI": "sui", "TON": "toncoin",
  "INJ": "injective-protocol", "XMR": "monero",
  "PEPE": "pepe", "BONK": "bonk", "WIF": "dogwifhat",
  "FLOKI": "floki", "SAND": "the-sandbox", "MANA": "decentraland",
  "AXS": "axie-infinity", "GALA": "gala", "ENJ": "enjincoin",
  "EGLD": "elrond-erd-2", "VET": "vechain", "ALGO": "algorand",
  "FTM": "fantom", "ICP": "internet-computer", "HBAR": "hedera-hashgraph",
  "KAS": "kaspa", "STX": "blockstack", "IMX": "immutable-x",
  "TAO": "bittensor", "RUNE": "thorchain", "TIA": "celestia"
};

// ── Pair normalization ─────────────────────────────────────────

function normalizePair(raw) {
  var pair = (raw || "").replace(/\s/g, "").toUpperCase();
  var base, quote;

  if (pair.indexOf("-") !== -1) {
    var parts = pair.split("-");
    base = parts[0]; quote = parts[1] || "USDT";
  } else if (pair.indexOf("/") !== -1) {
    var p2 = pair.split("/");
    base = p2[0]; quote = p2[1] || "USDT";
  } else if (pair.length > 4 && pair.slice(-4) === "USDT") {
    base = pair.slice(0, -4);
    quote = "USDT";
  } else {
    base = pair;
    quote = "USDT";
  }

  return { base: base, quote: quote, pair: base + "-" + quote };
}

function getCoinId(symbol) {
  return COIN_IDS[symbol.toUpperCase()] || null;
}

// ── API calls ──────────────────────────────────────────────────

var CG_BASE = "https://api.coingecko.com/api/v3";

async function fetchCurrentPrice(symbol) {
  var coinId = getCoinId(symbol);
  if (!coinId) return null;
  try {
    var url = CG_BASE + "/simple/price?ids=" + encodeURIComponent(coinId) + "&vs_currencies=usd";
    var resp = await fetch(url, { timeout: 10000 });
    if (!resp.ok) return null;
    var data = JSON.parse(await resp.text());
    return (data[coinId] && data[coinId].usd) ? data[coinId].usd : null;
  } catch (e) {
    return null;
  }
}

async function fetchPriceHistory(symbol, days) {
  var coinId = getCoinId(symbol);
  if (!coinId) return null;
  try {
    var url = CG_BASE + "/coins/" + encodeURIComponent(coinId) + "/market_chart?vs_currency=usd&days=" + (days || 30);
    var resp = await fetch(url, { timeout: 15000 });
    if (!resp.ok) return null;
    var data = JSON.parse(await resp.text());
    return {
      prices: data.prices || [],
      volumes: data.total_volumes || []
    };
  } catch (e) {
    return null;
  }
}

// ── Math helpers ───────────────────────────────────────────────

function calcMA(prices, period) {
  if (prices.length < period) return null;
  var sum = 0;
  for (var i = prices.length - period; i < prices.length; i++) {
    sum += prices[i];
  }
  return sum / period;
}

function calcRSI(prices, period) {
  period = period || 14;
  if (prices.length < period + 1) return null;

  var gains = 0, losses = 0, count = 0;
  for (var i = prices.length - period; i < prices.length; i++) {
    var delta = prices[i] - prices[i - 1];
    if (delta > 0) gains += delta;
    else losses += Math.abs(delta);
    count++;
  }

  if (count === 0) return 50;
  var avgGain = gains / count;
  var avgLoss = losses / count;
  if (avgLoss === 0) return 100;

  var rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100;
}

function calcFibo(high, low) {
  var diff = high - low;
  return {
    support: [
      round2(high - diff * 0.236),
      round2(high - diff * 0.382),
      round2(high - diff * 0.5),
      round2(high - diff * 0.618)
    ],
    resistance: [
      round2(low + diff * 0.236),
      round2(low + diff * 0.382),
      round2(low + diff * 0.5),
      round2(low + diff * 0.618)
    ]
  };
}

function round2(n) { return Math.round(n * 100) / 100; }

function findLocalExtrema(prices) {
  var recent = prices.slice(-50);
  var maxima = [];
  var minima = [];

  for (var i = 5; i < recent.length - 5; i++) {
    // Local max
    if (recent[i] > recent[i - 1] && recent[i] > recent[i + 1]) {
      var higher = true;
      for (var j = i - 5; j < i; j++) { if (recent[j] >= recent[i]) higher = false; }
      for (var k = i + 1; k <= i + 5; k++) { if (recent[k] >= recent[i]) higher = false; }
      if (higher) maxima.push(round2(recent[i]));
    }
    // Local min
    if (recent[i] < recent[i - 1] && recent[i] < recent[i + 1]) {
      var lower = true;
      for (var j2 = i - 5; j2 < i; j2++) { if (recent[j2] <= recent[i]) lower = false; }
      for (var k2 = i + 1; k2 <= i + 5; k2++) { if (recent[k2] <= recent[i]) lower = false; }
      if (lower) minima.push(round2(recent[i]));
    }
  }

  // Deduplicate
  var uniqMax = [], uniqMin = [];
  maxima.sort(function(a,b){return a-b;}).forEach(function(v){if(uniqMax.indexOf(v)===-1)uniqMax.push(v);});
  minima.sort(function(a,b){return a-b;}).forEach(function(v){if(uniqMin.indexOf(v)===-1)uniqMin.push(v);});

  return { maxima: uniqMax, minima: uniqMin };
}

// ── Core analysis ──────────────────────────────────────────────

async function analyze(symbol) {
  var norm = normalizePair(symbol || "BTC");
  var base = norm.base;

  var result = {
    symbol: base,
    pair: norm.pair,
    currentPrice: null,
    change24h: null,
    resistance: [],
    support: [],
    rsi: null,
    ma50: null,
    ma100: null,
    ma200: null,
    recentHigh: null,
    recentLow: null,
    mode: "live",
    error: null
  };

  // Fetch current price
  var price = await fetchCurrentPrice(base);
  if (!price) {
    // Fallback to %-based levels
    result.mode = "estimate";
    result.error = "Could not fetch live price from CoinGecko";
    return fallbackAnalysis(base, result);
  }
  result.currentPrice = price;

  // Fetch historical data (30 days, hourly)
  var hist = await fetchPriceHistory(base, 30);
  if (!hist || !hist.prices || hist.prices.length < 20) {
    result.mode = "estimate";
    result.error = "Could not fetch historical data";
    return fallbackAnalysis(base, result);
  }

  var rawPrices = hist.prices.map(function(p) { return p[1]; });

  // 24h change
  if (rawPrices.length >= 24) {
    result.change24h = round2((price - rawPrices[rawPrices.length - 24]) / rawPrices[rawPrices.length - 24] * 100);
  }

  // Local extrema
  var extrema = findLocalExtrema(rawPrices);

  // Moving averages
  result.ma50 = round2(calcMA(rawPrices, Math.min(50, rawPrices.length)) || 0) || null;
  result.ma100 = round2(calcMA(rawPrices, Math.min(100, rawPrices.length)) || 0) || null;
  result.ma200 = round2(calcMA(rawPrices, Math.min(200, rawPrices.length)) || 0) || null;

  // RSI
  result.rsi = calcRSI(rawPrices.slice(-50), 14);

  // Recent high/low
  var recentSlice = rawPrices.slice(-50);
  result.recentHigh = round2(Math.max.apply(null, recentSlice));
  result.recentLow = round2(Math.min.apply(null, recentSlice));

  // Fibonacci
  var fibo = calcFibo(result.recentHigh, result.recentLow);

  // Build resistance levels
  var resistance = [];
  extrema.maxima.slice(-3).forEach(function(v) { resistance.push(v); });
  if (result.ma50 && price < result.ma50) resistance.push(result.ma50);
  if (result.ma100 && price < result.ma100) resistance.push(result.ma100);
  fibo.resistance.slice(0, 2).forEach(function(v) { resistance.push(v); });

  // Build support levels
  var support = [];
  extrema.minima.slice(-3).forEach(function(v) { support.push(v); });
  if (result.ma50 && price > result.ma50) support.push(result.ma50);
  if (result.ma100 && price > result.ma100) support.push(result.ma100);
  fibo.support.slice(0, 2).forEach(function(v) { support.push(v); });

  // Filter + sort + deduplicate
  function dedup(arr) {
    var seen = {};
    return arr.filter(function(v) { return seen.hasOwnProperty(v) ? false : (seen[v] = true); });
  }

  resistance = dedup(resistance).sort(function(a,b){return a-b;}).filter(function(r){return r > price;}).slice(0, 3);
  support = dedup(support).sort(function(a,b){return b-a;}).filter(function(s){return s < price;}).slice(0, 3);

  // Fallback: if no levels found from historical data, use %-based estimates
  if (resistance.length === 0) {
    resistance = [round2(price * 1.03), round2(price * 1.05), round2(price * 1.08)];
  }
  if (support.length === 0) {
    support = [round2(price * 0.97), round2(price * 0.95), round2(price * 0.92)];
  }

  result.resistance = resistance;
  result.support = support;

  return result;
}

function fallbackAnalysis(base, result) {
  var price = result.currentPrice;
  // If no price at all, use defaults
  if (!price) {
    var defaults = {
      "BTC": 60000, "ETH": 3000, "SOL": 170, "BNB": 580,
      "XRP": 0.5, "ADA": 0.45, "DOGE": 0.08, "DOT": 7,
      "AVAX": 35, "MATIC": 0.55, "LINK": 14, "UNI": 7,
      "ATOM": 8, "LTC": 70, "BCH": 350, "XLM": 0.1
    };
    price = defaults[base] || 100;
    result.currentPrice = price;
  }

  result.resistance = [
    round2(price * 1.03),
    round2(price * 1.05),
    round2(price * 1.08)
  ];
  result.support = [
    round2(price * 0.97),
    round2(price * 0.95),
    round2(price * 0.92)
  ];
  result.rsi = 50;
  result.ma50 = round2(price * 0.98);
  result.ma100 = round2(price * 0.96);
  result.change24h = 0;
  result.recentHigh = round2(price * 1.05);
  result.recentLow = round2(price * 0.95);
  return result;
}

// ── Formatting ─────────────────────────────────────────────────

function formatAnalysis(result) {
  if (!result) return "❌ Analysis failed — no data available.";

  var lines = [];
  var symbol = result.symbol || "Unknown";
  var price = result.currentPrice;
  var change = result.change24h;

  lines.push("## 📊 " + symbol + "-USDT Technical Analysis");
  lines.push("");

  if (result.mode === "estimate") {
    lines.push("> ⚠️  " + (result.error || "Using estimated levels — live CoinGecko data unavailable."));
    lines.push("");
  }

  // Price
  lines.push("| Metric | Value |");
  lines.push("|------|------|");
  lines.push("| 💰 Current Price | $" + fmtNum(price) + " |");

  if (change !== null) {
    var changeEmoji = change >= 0 ? "🟢" : "🔴";
    var changeSign = change >= 0 ? "+" : "";
    lines.push("| 📈 24h Change | " + changeEmoji + " " + changeSign + fmtNum(change) + "% |");
  }

  // Resistance
  lines.push("");
  lines.push("### 🔴 Resistance");
  if (result.resistance && result.resistance.length > 0) {
    lines.push("| Level | Price | Distance |");
    lines.push("|-------|-------|--------|");
    result.resistance.forEach(function(level, i) {
      var pct = round2((level - price) / price * 100);
      lines.push("| R" + (i + 1) + " | $" + fmtNum(level) + " | +" + fmtNum(pct) + "% |");
    });
  } else {
    lines.push("No clear resistance levels");
  }

  // Support
  lines.push("");
  lines.push("### 🟢 Support");
  if (result.support && result.support.length > 0) {
    lines.push("| Level | Price | Distance |");
    lines.push("|-------|-------|--------|");
    result.support.forEach(function(level, i) {
      var pct = round2((price - level) / price * 100);
      lines.push("| S" + (i + 1) + " | $" + fmtNum(level) + " | -" + fmtNum(pct) + "% |");
    });
  } else {
    lines.push("No clear support levels");
  }

  // Technical indicators
  lines.push("");
  lines.push("### 📊 Technical Indicators");
  lines.push("| Indicator | Value | Status |");
  lines.push("|------|------|------|");

  if (result.rsi !== null) {
    var rsiStatus = result.rsi > 70 ? "🔴 Overbought" : (result.rsi < 30 ? "🟢 Oversold" : "🟡 Neutral");
    lines.push("| RSI(14) | " + result.rsi + " | " + rsiStatus + " |");
  }
  if (result.ma50 !== null) {
    var ma50Status = price > result.ma50 ? "Support" : "Resistance";
    lines.push("| MA50 | $" + fmtNum(result.ma50) + " | " + ma50Status + " |");
  }
  if (result.ma100 !== null) {
    var ma100Status = price > result.ma100 ? "Support" : "Resistance";
    lines.push("| MA100 | $" + fmtNum(result.ma100) + " | " + ma100Status + " |");
  }
  if (result.ma200 !== null) {
    var ma200Status = price > result.ma200 ? "Support" : "Resistance";
    lines.push("| MA200 | $" + fmtNum(result.ma200) + " | " + ma200Status + " |");
  }

  // Range
  if (result.recentHigh && result.recentLow) {
    lines.push("| 30d High | $" + fmtNum(result.recentHigh) + " | — |");
    lines.push("| 30d Low | $" + fmtNum(result.recentLow) + " | — |");
  }

  // Trading insights
  lines.push("");
  lines.push("### 💡 Trading Insights");
  lines.push("");

  if (result.rsi !== null && result.rsi < 30) {
    lines.push("- 🟢 RSI oversold — watch for bounce near support");
    lines.push("- Buy signal possible near S1 ($" + fmtNum(result.support[0] || price * 0.97) + ")");
  } else if (result.rsi !== null && result.rsi > 70) {
    lines.push("- 🔴 RSI overbought — watch for pullback risk");
    lines.push("- Sell signal possible near R1 ($" + fmtNum(result.resistance[0] || price * 1.03) + ")");
  } else {
    lines.push("- 🟡 Market in neutral zone — wait for clear breakout signal");
  }

  if (change !== null) {
    if (change > 5) lines.push("- 📈 Sentiment: Bullish (+" + fmtNum(change) + "%)");
    else if (change < -5) lines.push("- 📉 Sentiment: Bearish (" + fmtNum(change) + "%)");
    else lines.push("- ➡️ Sentiment: Neutral");
  }

  if (result.mode === "live") {
    lines.push("- Data source: CoinGecko (free, no API key)");
  }

  lines.push("");
  lines.push("> ⚠️ **Disclaimer**: This analysis is for informational purposes only, not financial advice. Crypto trading carries extreme risk.");

  return lines.join("\n");
}

function fmtNum(n) {
  if (n === null || n === undefined) return "N/A";
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

// ── Handler ────────────────────────────────────────────────────

async function handler(event, context) {
  var symbol = (event && event.symbol) || "BTC";
  var result = await analyze(symbol);
  return {
    text: formatAnalysis(result),
    data: result
  };
}

// ── Exports ────────────────────────────────────────────────────

var cryptoLevels = {
  analyze: analyze,
  formatAnalysis: formatAnalysis,
  normalizePair: normalizePair,
  getCoinId: getCoinId,
  runFromParams: runFromParams,
  parseCommand: parseCommand,
  handler: handler,
  COIN_IDS: COIN_IDS
};

// ── Command parsing ────────────────────────────────────────────

function parseCommand(args) {
  var params = { symbol: "BTC" };
  if (!args || args.length === 0) return params;

  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--symbol" && i + 1 < args.length) {
      params.symbol = args[i + 1];
      i++;
    } else if (args[i] === "--help" || args[i] === "-h") {
      params.symbol = "--help";
    } else if (!args[i].startsWith("--") && params.symbol === "BTC") {
      // First positional arg = symbol
      params.symbol = args[i];
    }
  }
  return params;
}

// ── runFromParams ──────────────────────────────────────────────

async function runFromParams(inputParams) {
  var p = inputParams;
  if (!p && typeof PARAMS !== "undefined" && PARAMS !== null) p = PARAMS;
  if (!p && typeof PARAMS_JSON !== "undefined" && PARAMS_JSON) p = JSON.parse(PARAMS_JSON);
  if (!p) p = {};

  // Parse command string from PARAMS.command (TerminalManager format)
  var cmdStr = p.command || "";
  var args = cmdStr ? cmdStr.trim().split(/\s+/) : [];
  var cmd = parseCommand(args);

  // Allow explicit overrides from PARAMS
  if (p.symbol) cmd.symbol = p.symbol;

  if (cmd.symbol === "--help") {
    return "## crypto-levels — S/R Level Analyzer\n\n" +
      "Live CoinGecko price data + support/resistance level analysis.\n\n" +
      "### `/cmd` Usage\n\n" +
      "| Command | Description |\n" +
      "|---------|-------------|\n" +
      "| `run /skills/crypto-levels/scripts/crypto-levels.js` | Analyze BTC (default) |\n" +
      "| `run /skills/crypto-levels/scripts/crypto-levels.js ETH` | Analyze ETH |\n" +
      "| `run /skills/crypto-levels/scripts/crypto-levels.js SOL` | Analyze SOL |\n" +
      "| `run /skills/crypto-levels/scripts/crypto-levels.js --symbol BTC` | Explicit symbol |\n\n" +
      "### Supported Symbols\n" +
      "BTC ETH SOL BNB XRP ADA DOGE DOT AVAX MATIC LINK UNI ATOM LTC BCH XLM " +
      "SHIB TRX ETC FIL AAVE COMP MKR SNX SUSHI YFI CRV OP ARB FET RNDR GRT " +
      "NEAR APT SUI TON INJ PEPE BONK WIF FLOKI SAND MANA AXS GALA ENJ " +
      "EGLD VET ALGO FTM ICP HBAR KAS STX IMX TAO RUNE TIA\n\n" +
      "### `/code` Usage\n\n" +
      "```js\n" +
      "var c = require(\"/skills/crypto-levels/scripts/crypto-levels.js\");\n" +
      "console.log(c.formatAnalysis(await c.analyze(\"ETH\")));\n" +
      "console.log(JSON.stringify(await c.analyze(\"SOL\"), null, 2));\n" +
      "```\n\n" +
      "**Data:** CoinGecko free API — no key required.";
  }

  var result = await analyze(cmd.symbol);
  return formatAnalysis(result);
}

// ── Node CLI ────────────────────────────────────────────────────

if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var cliArgs = process.argv.slice(2);
  runFromParams({ command: cliArgs.join(" ") }).then(function(output) {
    console.log(output);
  }).catch(function(err) {
    console.error(err.message || String(err));
  });
}

// ── Module exports ──────────────────────────────────────────────

if (typeof module !== "undefined" && module.exports) {
  module.exports = cryptoLevels;
}

// ── PARAMS auto-run for /cmd ────────────────────────────────────

if (typeof module === "undefined" &&
    ((typeof PARAMS !== "undefined" && PARAMS !== null) ||
     (typeof PARAMS_JSON !== "undefined" && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== "undefined" && console.log) {
      console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== "undefined" && console.error) {
      console.error(err && err.message ? err.message : String(err));
    }
    throw err;
  });
}
