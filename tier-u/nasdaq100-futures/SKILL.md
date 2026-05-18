---
name: nasdaq100-futures
description: Fetch the latest Nasdaq-100 futures quote (default NQ=F) via Yahoo Finance chart API and return price, change, percent change, and timestamp. Use when the user asks for Nasdaq-100 futures, NQ futures, NQ=F, 纳指100期货, or wants the latest quote and change metrics.
version: 1.2
---

> **Runtime:** Use `handler()` from `scripts/main.js` — fetches data via Yahoo Finance using `fetch()`. The exported function is `handler` (aliased as `get_nasdaq100_futures` in manifest). Do NOT use iOS Shortcuts or runShortcut — use terminal JS execution.

# Nasdaq-100 Futures Quote

> **Runtime:** Always await the handler — do NOT use .then(). Do NOT write fetch code manually.

Use this skill when you need the **latest** quote for Nasdaq-100 futures (or another Yahoo Finance symbol), including:
- **regularMarketPrice**
- **previousClose**
- **change** and **changePercent**
- **timestamp** (formatted)

## How to Call

> **Runtime:** Primary: `run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --symbol <sym>`. Code mode: `await s.runFromParams(...)` — do NOT use .then(). Do NOT write fetch code manually.

### /cmd — Terminal (preferred, fewer tokens)

```sh
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js --symbol NQ=F
run /skills/nasdaq100-futures/scripts/nasdaq100-futures.js -s ES=F
```

### /code — JavaScript (require)

```js
var s = require('/skills/nasdaq100-futures/scripts/nasdaq100-futures.js');
var result = await s.runFromParams();
var result = await s.runFromParams({ symbol: 'ES=F' });
console.log(result.message);
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
