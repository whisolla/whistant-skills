---
name: startup-financial-model
description: Build investor-ready 3-statement financial models for startups with revenue forecasting (SaaS/subscription, marketplace, services, e-commerce), expense modeling (COGS, S&M, R&D, G&A), balance sheet projections, cash flow statements, burn rate analysis, runway calculation, and base/bull/bear scenario modeling. Use when a founder or CFO needs a from-scratch financial model, projections, runway analysis, or scenario stress-testing. No API key required — pure financial math. Evolved from samledger67-dotcom/startup-financial-model version 1.0.0 at 2026-06-02. v1.1 adds formatCashFlow and revenue/opex fields to balance sheet monthly data.
version: 1.2
---

> **Runtime — `/cmd` only:** The `/code` (require) path causes SyntaxErrors with CLI flags. ALWAYS use `/cmd` terminal path: `run /skills/startup-financial-model/scripts/startup-financial-model.js --type saas --mrr N --customers N --arpu N --margin N --sales N --rd N --ga N`. Pure local computation, no external API needed.

# Startup Financial Model

Build complete 3-statement financial models for startups. Revenue forecasting, expense modeling, balance sheet projections, cash flow, burn/runway analysis, and scenario modeling — all computed locally.

## How to Call

### /cmd — Terminal (preferred)

```sh
# Full model with all key params (one-line /cmd)
run /skills/startup-financial-model/scripts/startup-financial-model.js --type saas --mrr 100000 --customers 10 --arpu 500 --margin 80 --sales 30000 --rd 50000 --ga 15000

# Scenario analysis (base/bull/bear)
run /skills/startup-financial-model/scripts/startup-financial-model.js --scenario --mrr 100000 --growth 8

# Runway analysis only
run /skills/startup-financial-model/scripts/startup-financial-model.js --runway --mrr 30000 --cash 200000

# Cash flow statement
run /skills/startup-financial-model/scripts/startup-financial-model.js --cashflow --mrr 50000 --growth 10
```

### /code — JavaScript (require)

```js
var s = require('/skills/startup-financial-model/scripts/startup-financial-model.js');

// Full model
var pl = s.buildPandL({ businessType: 'saas', currentMRR: 100000, monthlyGrowthPct: 5, months: 36 });
var bs = s.projectBalanceSheet(pl, { startingCash: 500000 });
console.log(s.formatModel(pl, bs));

// Runway
var runway = s.calculateRunway(500000, 45000);
console.log(runway.runwayMonthsFormatted, runway.status);

// Scenarios
var sc = s.runScenarios({ currentMRR: 50000, monthlyGrowthPct: 5, months: 24 });
console.log(s.formatScenarios(sc));

// Cash flow statement
var bs = s.projectBalanceSheet(pl, { startingCash: 500000 });
console.log(s.formatCashFlow(bs));
```

## Functions

| Function | Description |
|----------|-------------|
| `forecastRevenue(input)` | Revenue model by business type (saas, marketplace, services, ecommerce) |
| `buildPandL(input)` | Full P&L: revenue, COGS, OpEx, EBITDA, net income |
| `projectBalanceSheet(pl, assumptions)` | Balance sheet + cash flow projections (monthly objects include revenue/cogs/opex/netIncome) |
| `calculateRunway(cash, monthlyBurn)` | Runway in months with status (Comfortable → Critical) |
| `runScenarios(input, multipliers)` | Base/bull/bear scenario analysis |
| `formatModel(pl, bs, assumptions)` | Markdown-formatted model output |
| `formatCashFlow(bs, maxRows)` | Markdown cash flow table: revenue, COGS, OpEx, CapEx, net CF, cash balance |
| `formatScenarios(scenarios)` | Markdown-formatted scenario comparison |

## Parameters

| Flag | Description | Default |
|------|-------------|---------|
| `--type` | Business type: saas, marketplace, services, ecommerce | saas |
| `--mrr` | Starting monthly recurring revenue ($) | 100000 |
| `--growth` | Monthly growth rate (%) | 5 |
| `--churn` | Monthly churn rate (%) | 2 |
| `--arpu` | Average revenue per user ($) | 500 |
| `--customers` | New customers per month | 10 |
| `--cash` | Starting cash balance ($) | 500000 |
| `--months` | Projection period (months) | 36 |
| `--margin` | Gross margin percentage | — |
| `--sales` | Monthly sales & marketing ($) | 30000 |
| `--rd` | Monthly R&D ($) | 50000 |
| `--ga` | Monthly G&A ($) | 15000 |
| `--scenario` | Run base/bull/bear scenarios | — |
| `--runway` | Runway analysis only | — |
| `--cashflow` | Full model + cash flow statement | — |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/startup-financial-model.js --type saas --mrr 50000 --growth 8
```
