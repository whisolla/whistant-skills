---
name: investor-memo-generator
description: Generate investor-ready memos, executive summaries, board updates, LP letters, and term sheet summaries from structured financial data. Auto-calculates derived metrics (ARR, ARPU, runway). Formats one-pagers with traction highlights, financial snapshots, use of funds, and risk sections. Use when a founder needs to turn financial data into a polished investor document. No API key required — pure formatting. Evolved from samledger67-dotcom/investor-memo-generator version 1.0.0 at 2026-06-02.
version: 1.2
---

> **Runtime — `/cmd` only:** Always use `/cmd` terminal path: `run /skills/investor-memo-generator/scripts/investor-memo-generator.js --name "Company" --mrr N --burn N --cash N [--customers N] [--margin N]`. Auto-calculates ARR = MRR×12, ARPU = MRR/customers, runway = cash/burn. Pure local computation, no external API needed.

# Investor Memo Generator

Transform financial data into polished investor-ready documents: one-pagers, board updates, LP letters, and term sheet summaries.

## How to Call

### /cmd — Terminal (preferred)

```sh
# Executive one-pager
run /skills/investor-memo-generator/scripts/investor-memo-generator.js --name "FinTech Co" --mrr 150000 --burn 45000 --cash 1200000

# Board update
run /skills/investor-memo-generator/scripts/investor-memo-generator.js --type boardUpdate --name "SaaS Inc" --period "May 2026"

# Term sheet summary
run /skills/investor-memo-generator/scripts/investor-memo-generator.js --type termSheet --name "StartupX" --roundType "Series A" --amountRaised 5000000 --preMoney 20000000
```

### /code — JavaScript (require)

```js
var s = require('/skills/investor-memo-generator/scripts/investor-memo-generator.js');

// One-pager
var op = s.generateOnePager({
  companyName: 'FinTech Co', currentMRR: 150000, customers: 1200,
  grossMargin: 78, burnRate: 45000, cashBalance: 1200000
});
console.log(op);

// Board update
var bu = s.generateBoardUpdate({
  companyName: 'SaaS Inc', period: 'May 2026',
  ceoSummary: 'Strong growth month...',
  metrics: [{ name: 'MRR', current: 245000, previous: 230000 }],
  financials: [{ name: 'Revenue', budget: 250000, actual: 248000 }],
  highlights: ['Launched in 3 new markets'], asks: ['Approve Series B term sheet']
});
console.log(bu);

// LP update
var lp = s.generateLPUpdate({ fundName: 'Alpha Ventures', nav: 50000000, netIRR: 22.5, tvpi: 1.8 });
console.log(lp);
```

## Document Types

| Type | Flag | Description |
|------|------|-------------|
| One-Pager | `--type onePager` (default) | Traction highlights, financial snapshot, use of funds, risks |
| Board Update | `--type boardUpdate` | CEO summary, KPIs, financials vs budget, highlights/lowlights, board asks |
| LP Update | `--type lpUpdate` | Fund performance, portfolio highlights, capital account |
| Term Sheet | `--type termSheet` | Round details, valuation, instrument, key terms |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/investor-memo-generator.js --name "Acme" --mrr 150000 --burn 45000 --cash 1200000
```
