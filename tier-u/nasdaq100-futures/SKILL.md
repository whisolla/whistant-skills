---
name: nasdaq100-futures
description: Fetch the latest Nasdaq-100 futures quote (default NQ=F) via Yahoo Finance chart API. Returns human-readable formatted output with price, change, percent change, and timestamp. Use `/cmd` path for single-line dashboard-style output. Use when the user asks for Nasdaq-100 futures, NQ futures, NQ=F, 纳指100期货, or wants the latest quote and change metrics. Evolved from lbl581581/nasdaq100-futures version 1.0.4 at 2026-05-15.
version: 1.5
---

> **Runtime — `/cmd` preferred:** `run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js [--symbol SYM] [--compare]`. The `/cmd` terminal path is the first choice. `/code` (require) is available as a secondary path. The exported function is `handler`.

Use this skill when you need the **latest** quote for Nasdaq-100 futures (or another Yahoo Finance symbol), including:
- **regularMarketPrice**
- **previousClose**
- **change** and **changePercent**
- **timestamp** (formatted)

## How to Call

> **`/cmd` first (preferred), `/code` second.**

### /cmd — Terminal

```sh
# Default: Nasdaq-100 futures (NQ=F)
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js

# Compare all three major futures in one call
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --compare

# Any single Yahoo Finance symbol
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --symbol ES=F
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js -s YM=F

# Multiple symbols at once
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --symbol NQ=F,ES=F,YM=F
```

### /code — JavaScript (require)

```js
var s = require('/skills/nasdaq100-futures/scripts/nasdaq100-futures.js');
var result = await s.runFromParams();
console.log(result.message);
var result2 = await s.runFromParams({ symbol: 'ES=F' });
console.log(result2.message);
```

## Output

On success, returns a JSON object with these keys:
- **symbol**: the requested symbol (e.g. `NQ=F`)
- **price**: latest price (string, 2 decimals)
- **change**: price change vs previous close (string, signed, 2 decimals)
- **changePercent**: percent change vs previous close (string, signed, 2 decimals)
- **time**: formatted timestamp string
- **message**: human-readable Chinese summary

On failure, returns:
- **error**: true
- **message**: error message

## Examples

### Example: Default Nasdaq-100 futures

Input:

```json
{
  "parameters": {}
}
```

Output (example):

```json
{
  "symbol": "NQ=F",
  "price": "15780.50",
  "change": "+120.25",
  "changePercent": "+0.77",
  "time": "2025-06-10 14:30:00",
  "message": "纳斯达克100期货最新价: $15780.50 (+120.25 / +0.77%) 数据时间: 2025-06-10 14:30:00"
}
```

### Example: Custom symbol

Input:

```json
{
  "parameters": {
    "symbol": "ES=F"
  }
}
```

## Notes

- Data source is Yahoo Finance chart API (`query1.finance.yahoo.com`). Results depend on market hours and network availability.
- Requires Node.js **>= 18** (uses built-in `fetch`).
- If you need a different data provider, adjust `scripts/main.js` accordingly.

## Additional resources

- OpenClaw runtime details: [references/openclaw.md](references/openclaw.md)

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/nasdaq100-futures.js --symbol NQ=F
```
