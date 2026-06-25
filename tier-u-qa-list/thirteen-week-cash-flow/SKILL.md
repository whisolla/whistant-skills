---
name: thirteen-week-cash-flow
description: Build and maintain a rolling 13-week cash flow forecast — the gold standard for short-term liquidity management. Produces week-by-week cash receipts and disbursements, variance tracking against actuals, borrowing base calculations, covenant monitoring, and ASCII cash balance trend charts. Use when managing tight liquidity, preparing for a credit facility, or when the board/lender demands weekly cash visibility. No API key required — pure treasury math. Evolved from samledger67-dotcom/thirteen-week-cash-flow version 1.0.0 at 2026-06-02.
version: 1.1
---

> **Runtime — `/cmd` preferred:** `run /skills/thirteen-week-cash-flow/scripts/thirteen-week-cash-flow.js [--cash N] [--receipts N] [--disbursements N] [--variance]`. `/code` (require) is available as a secondary path. Pure local computation, no external API needed.

# 13-Week Cash Flow Forecast

The 13-week cash flow (13WCF) is the operating room monitor of finance — it tells you exactly how much cash you have left, week by week.

## How to Call

### /cmd — Terminal (preferred)

```sh
# Default forecast
run /skills/thirteen-week-cash-flow/scripts/thirteen-week-cash-flow.js

# Custom parameters
run /skills/thirteen-week-cash-flow/scripts/thirteen-week-cash-flow.js --cash 250000 --receipts 75000 --payroll 25000 --rent 8000

# With borrowing base
run /skills/thirteen-week-cash-flow/scripts/thirteen-week-cash-flow.js --cash 100000 --ar 500000 --loan 300000
```

### /code — JavaScript (require)

```js
var s = require('/skills/thirteen-week-cash-flow/scripts/thirteen-week-cash-flow.js');

var f = s.buildForecast({ openingCash: 250000, weeklyReceipts: 75000, payroll: 25000, rent: 8000 });
console.log(s.formatForecast(f));

// Track variances
var vars = s.trackVariance(f, actuals);
console.log(s.formatVariance(vars));
```

## Functions

| Function | Description |
|----------|-------------|
| `buildForecast(input)` | Build 13-week cash flow with receipts, disbursements, payroll, rent, debt service, capex |
| `trackVariance(forecast, actuals)` | Compare forecast to actuals, flag favorable/unfavorable |
| `checkCovenants(forecast, covenants)` | Check liquidity and leverage covenants |

## Parameters

| Flag | Description | Default |
|------|-------------|---------|
| `--cash` | Opening cash balance ($) | 100000 |
| `--receipts` | Weekly receipts or comma-separated list ($) | 50000 |
| `--disbursements` | Weekly disbursements ($) | 20000 |
| `--payroll` | Weekly payroll ($) | 15000 |
| `--rent` | Weekly rent ($) | 5000 |
| `--debt` | Weekly debt service ($) | 0 |
| `--capex` | Weekly CapEx or comma-separated list ($) | 0 |
| `--ar` | Accounts receivable for borrowing base ($) | — |
| `--loan` | Outstanding loan ($) | — |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/thirteen-week-cash-flow.js --cash 250000 --receipts 75000 --payroll 25000
```
