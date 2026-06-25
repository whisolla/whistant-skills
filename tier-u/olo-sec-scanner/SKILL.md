---
name: olo-sec-scanner
description: M&A due diligence scanner using SEC EDGAR XBRL companyfacts API. Extracts income statement, balance sheet, and cash flow data for a ticker, detects risk flags (revenue decline, negative earnings, high leverage, negative FCF, liquidity concerns), catalogs recent 8-K material events, SC 13D/G ownership filings, and DEF 14A proxy statements. Use when the user asks for SEC filing analysis, M&A due diligence, 10-K/10-Q/8-K review, financial extraction, or company risk assessment. No API key required. Evolved from aniebyl/olo-sec-scanner version 1.0.0 at 2026-06-02.
version: 1.1
---

> **Runtime — `/cmd` preferred:** `run /skills/olo-sec-scanner/scripts/olo-sec-scanner.js --ticker AAPL`. `/code` (require) is available as a secondary path. All endpoints are free, no API key required (10 req/sec rate limit).

# SEC Filing Scanner for M&A Due Diligence

Extract and analyze SEC EDGAR filings for acquisition due diligence. Produces a structured report with financial summary, risk flags, material events, ownership filings, and M&A checklist.

## How to Call

### /cmd — Terminal (preferred)

```sh
run /skills/olo-sec-scanner/scripts/olo-sec-scanner.js --ticker AAPL
run /skills/olo-sec-scanner/scripts/olo-sec-scanner.js -t MSFT
```

### /code — JavaScript (require)

```js
var s = require('/skills/olo-sec-scanner/scripts/olo-sec-scanner.js');

// Full scan with formatted report
var result = await s.runFromParams({ ticker: 'AAPL' });
console.log(result);

// Raw data access
var scan = await s.scanTicker('MSFT');
console.log(scan.financials);  // XBRL financial data
console.log(scan.filings);     // Filing history
console.log(scan.formatted);   // Formatted report
```

## What It Extracts

### From XBRL Company Facts (data.sec.gov)
- **Income Statement**: Revenue, gross/operating/net margins, EBITDA, net income, EPS
- **Balance Sheet**: Total assets/liabilities, equity, cash, long-term debt, D/E, current ratio
- **Cash Flow**: Operating CF, CapEx, free cash flow
- **Revenue Trend**: Multi-year revenue history with YoY changes

### From Submissions API (data.sec.gov/submissions)
- **10-K** — Annual reports (up to 5 recent)
- **10-Q** — Quarterly reports (up to 5 recent)
- **8-K** — Material events (up to 10 recent)
- **SC 13D/G** — Beneficial ownership reports
- **DEF 14A** — Proxy statements

### Risk Flag Detection
- Revenue decline >10% YoY
- Net losses
- High leverage (D/E > 2x)
- Net Debt/EBITDA > 4x
- Negative operating/free cash flow
- Current ratio < 1.0
- Revenue decline + negative earnings (going concern)
- High 8-K frequency
- Activist/ownership filings

## Output Format

The `formatScanResult()` function produces a complete M&A due diligence report with:
1. Company header with CIK and filing summary
2. Financial summary table (income + balance sheet + cash flow)
3. Revenue trend table with YoY changes
4. Risk flags with severity indicators
5. Recent 8-K material events
6. Ownership filings (SC 13D/G)
7. Proxy statements
8. M&A Due Diligence Checklist (8 checks with status)

## Notes

- Data source is SEC EDGAR (free, no API key, 10 req/sec rate limit)
- User-Agent header required by SEC (set to `Whistant-Dev contact@whisolla.com`)
- Full-text 8-K content analysis requires downloading individual filings (not included; flagged for manual review)
- The submissions API provides filing metadata; 8-K content items (1.01, 2.01, etc.) are noted for manual review

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/olo-sec-scanner.js --ticker AAPL
```
