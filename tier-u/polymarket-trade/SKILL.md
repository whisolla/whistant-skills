---
name: polymarket-trade
description: Get real-time Polymarket prediction market data. Use fetch() via the handler — NOT the search tool.
version: 2.3
---
# polymarket-trade

**USE THIS SKILL when asked about Polymarket, prediction markets, or trading odds.**

**RULE: The handler returns a plain-text formatted string. Print it directly. Do NOT dump JSON.**

## How to use

**Step 1 — Load the handler:**
```
var pm = require('./scripts/polymarket-trade.js');
```

**Step 2 — Call handler() with an action:**
```
var result = await pm.handler({ action: 'trending', limit: 10 });
// OR
var result = await pm.handler({ action: 'search', query: 'bitcoin', limit: 5 });
// OR
var result = await pm.handler({ action: 'movers', limit: 5 });
```

**Step 3 — Print the result directly:**
The handler returns a plain-text string like:
```
1. Will there be a US-Iran ceasefire by May 2026?
   Volume: $102,082,006
   Yes: 64.2%
   No: 35.8%

2. 2026 FIFA World Cup Winner
   Volume: $857,184,336
   Yes: 72.4%
   No: 27.6%
```
**Print `result` directly. Do NOT return JSON. Do NOT use JSON.stringify.**

## API Actions

- `action: 'trending'` → Top 10 markets by 24h volume (default)
- `action: 'search'` → Search markets by keyword (provide `query`)
- `action: 'movers'` → Biggest 24h price movers (provide `limit`)

## IMPORTANT

- Base API: `https://gamma-api.polymarket.com` — free, no auth needed
- The handler returns a plain string — PRINT IT DIRECTLY
- Do NOT use the `search` tool for Polymarket data
- Do NOT use createTask/updateTask workflow
- Do NOT open a browser
- Close any browser window before giving the final answer
