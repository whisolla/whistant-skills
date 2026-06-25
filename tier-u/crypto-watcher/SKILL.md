---
name: crypto-watcher
description: Monitor crypto prices, 24h changes, market cap, and watchlists via CoinGecko free API. Triggers on: (1) User asks about crypto price, (2) User asks "比特币价格", "crypto price", "btc price", (3) User wants to track a set of coins Evolved from 0xraini/crypto-watcher version 1.0.0 at 2026-05-15.
version: 1.2
---

# Crypto Watcher

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.

CoinGecko free tier — no API key required.

## JS API

```js
const s = require('/skills/crypto-watcher/scripts/crypto-watcher.js');
// Single coin price
console.log(await s.getPrice('bitcoin'));
// Full market data
console.log(await s.getMarket('ethereum'));
// Watchlist
console.log(await s.getWatchlist(['bitcoin', 'ethereum', 'solana']));
// Search for coin ID
console.log(await s.lookupCoin('dogecoin'));
// Via runFromParams
console.log(await s.runFromParams({action:'price', coin:'bitcoin'}));
```

## Actions

| Action | Args | Description |
|--------|------|-------------|
| `price` | `coin` (coin ID) | Current USD price + 24h change |
| `market` | `coin` (coin ID) | Full market data: MCap, volume, ATH, all timeframe changes |
| `watch` | `coins` (array) | Watchlist: prices + 24h for multiple coins |
| `lookup` | `coin` (search term) | Search CoinGecko for coin ID by name/symbol |

## Supported Coins

All coins on CoinGecko — common IDs: `bitcoin`, `ethereum`, `solana`, `dogecoin`, `ripple`, `cardano`, `polkadot`, `avalanche-2`, `chainlink`, `polygon`.

## Output Format (price)

```
BITCOIN — $67,432.10 | 24h: +2.34% | Updated: 2026-05-13T00:30:00Z
```

## Output Format (market)

```
📈 Bitcoin (BTC)
Price: $67,432.10
MCap: $1,320,000,000,000
Vol: $28,500,000,000
Circ: 19,500,000
Changes: 1h:+0.12% | 24h:+2.34% | 7d:+5.67% | 30d:+12.34%
ATH: $73,750.00
ATH Date: 2024-03-14
Rank: #1
```

## /cmd Usage

```bash
# Single coin price
run /skills/crypto-watcher/scripts/crypto-watcher.js price bitcoin

# Full market data
run /skills/crypto-watcher/scripts/crypto-watcher.js market ethereum

# Watchlist (comma-separated)
run /skills/crypto-watcher/scripts/crypto-watcher.js watch bitcoin,ethereum,solana

# Search for coin ID
run /skills/crypto-watcher/scripts/crypto-watcher.js lookup dogecoin

# Explicit action flag
run /skills/crypto-watcher/scripts/crypto-watcher.js --action price --coin bitcoin

# Explicit --coins flag
run /skills/crypto-watcher/scripts/crypto-watcher.js --coins bitcoin,solana,cardano
```

## Notes

- **Rate limit**: 10-30 calls/min on CoinGecko free tier — use watchlist for bulk requests
- Coin IDs are lowercase: `bitcoin`, not `Bitcoin`
- Use `lookupCoin("name")` to find the correct coin ID

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/crypto-watcher.js price bitcoin
```
