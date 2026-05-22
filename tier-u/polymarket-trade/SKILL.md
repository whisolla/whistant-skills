---
name: polymarket-trade
description: Get real-time Polymarket prediction market data. Use fetch() via the handler — NOT the search tool.
version: 2.5
---

# polymarket-trade

> **Runtime:** Terminal: `run /skills/polymarket-trade/scripts/polymarket-trade.js <args>`
> Code mode: `await s.getTrending(10)` / `s.search("bitcoin", 5)` / `s.getMovers(5)`

**USE THIS SKILL when asked about Polymarket, prediction markets, or trading odds.**

**⚠️ CRITICAL: Never `console.log()` a raw API response.** Raw Polymarket JSON arrays
are 600KB+ — serialization through the bridge will freeze the app.
Always wrap output in `formatEvents()` or `formatMarkets()` before logging.

**RULE: The handler returns a plain-text formatted string. Print it directly. Do NOT dump JSON.**

## How to use

### Terminal /cmd

```bash
# Trending markets (default — top 10 by 24h volume)
run /skills/polymarket-trade/scripts/polymarket-trade.js trending

# Trending with custom limit
run /skills/polymarket-trade/scripts/polymarket-trade.js trending --limit=5

# Search markets by keyword
run /skills/polymarket-trade/scripts/polymarket-trade.js search bitcoin --limit=5

# Biggest 24h price movers
run /skills/polymarket-trade/scripts/polymarket-trade.js movers --limit=5
```

### JavaScript /code

```js
var s = require('/skills/polymarket-trade/scripts/polymarket-trade.js');

// Trending (default action)
var trending = await s.getTrending(10);
console.log(s.formatEvents(trending));

// Search by keyword
var results = await s.search('bitcoin', 5);
console.log(s.formatEvents(results));

// Biggest movers
var movers = await s.getMovers(5);
console.log(s.formatMarkets(movers));
```

## Actions

- `trending` → Top markets by 24h volume (default, `--limit=N`)
- `search <keyword>` → Search markets by keyword (`--query=<term>` or positional, `--limit=N`)
- `movers` → Biggest 24h price movers (`--limit=N`)

## API

- Base: `https://gamma-api.polymarket.com` — free, no auth needed

## Rules

- The handler returns a plain string — PRINT IT DIRECTLY
- Do NOT use the `search` tool for Polymarket data
- Do NOT use createTask/updateTask workflow
- Do NOT open a browser

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/polymarket-trade.js trending --limit=3
node scripts/polymarket-trade.js search bitcoin --limit=3
node scripts/polymarket-trade.js movers --limit=3
```
