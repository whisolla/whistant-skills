---
name: crypto-levels
description: Analyze cryptocurrency support and resistance levels with live CoinGecko data. Calculates local extrema, Fibonacci retracement, MA/RSI, and trading insights for 60+ crypto pairs (BTC, ETH, SOL, etc.). No API key required. Evolved from 362224222/crypto-levels version 1.0.0 at 2026-06-05.
version: 1.0
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.
>
> **Two ways to call:**
> - **Terminal (`/cmd`)**: `run /skills/crypto-levels/scripts/crypto-levels.js [symbol]`
> - **JS (`/code`)**: `var c = require("/skills/crypto-levels/scripts/crypto-levels.js"); console.log(c.formatAnalysis(await c.analyze("ETH")));`

## `/cmd` — Terminal Usage

| Command | Description |
|---------|-------------|
| `run /skills/crypto-levels/scripts/crypto-levels.js` | Analyze BTC (default) |
| `run /skills/crypto-levels/scripts/crypto-levels.js ETH` | Analyze ETH |
| `run /skills/crypto-levels/scripts/crypto-levels.js SOL` | Analyze SOL |
| `run /skills/crypto-levels/scripts/crypto-levels.js BTC-USDT` | Pair format also works |
| `run /skills/crypto-levels/scripts/crypto-levels.js --symbol DOGE` | Explicit symbol flag |
| `run /skills/crypto-levels/scripts/crypto-levels.js --help` | Help & supported symbols |

## `/code` — JS Usage

```js
var c = require("/skills/crypto-levels/scripts/crypto-levels.js");

// Full analysis with formatted Markdown output
console.log(c.formatAnalysis(await c.analyze("ETH")));

// Raw data object
console.log(JSON.stringify(await c.analyze("SOL"), null, 2));

// Just the data (no formatting)
var result = await c.analyze("BTC");
console.log("Price:", result.currentPrice);
console.log("RSI:", result.rsi);
console.log("Resistance:", result.resistance);
console.log("Support:", result.support);

// Check supported coins
console.log(Object.keys(c.COIN_IDS).length + " coins supported");
```

## What You Get

| Output | Description |
|--------|-------------|
| 💰 Current Price | Live CoinGecko USD price |
| 📈 24h Change | Percentage change over 24h |
| 🔴 Resistance | Top 3 resistance levels (local highs + MAs + Fibo) |
| 🟢 Support | Top 3 support levels (local lows + MAs + Fibo) |
| 📊 RSI(14) | With status (超买/超卖/中性) |
| 📈 MA50/MA100/MA200 | With support/resistance status |
| 💡 Trading Insights | Based on RSI + trend + 24h change |

## How It Works

1. Fetches current price from CoinGecko `/simple/price`
2. Fetches 30-day hourly OHLCV from `/coins/{id}/market_chart`
3. Finds local maxima/minima from price history
4. Calculates Fibonacci retracement levels (0.236/0.382/0.5/0.618)
5. Computes SMA(50/100/200) and RSI(14)
6. Merges all levels, filters duplicates, keeps top 3 above/below price

**Fallback**: If CoinGecko is unavailable, uses %-based estimates (±3%/5%/8%).

## Supported Symbols (60+)

BTC ETH SOL BNB XRP ADA DOGE DOT AVAX MATIC LINK UNI ATOM LTC BCH XLM SHIB TRX ETC FIL AAVE COMP MKR SNX SUSHI YFI CRV OP ARB FET RNDR GRT NEAR APT SUI TON INJ PEPE BONK WIF FLOKI SAND MANA AXS GALA ENJ EGLD VET ALGO FTM ICP HBAR KAS STX IMX TAO RUNE TIA

## Handler Actions

| Action | Description | Params |
|--------|-------------|--------|
| `analyze` | Run full analysis | `symbol` (BTC, ETH, SOL...) |

## Data Source

CoinGecko free API — no API key required. Rate limit: ~10-30 calls/min.

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/crypto-levels.js BTC
node scripts/crypto-levels.js ETH
node scripts/crypto-levels.js SOL
```
