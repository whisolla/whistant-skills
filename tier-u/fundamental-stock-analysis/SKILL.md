---
name: fundamental-stock-analysis
description: Fundamental equity analysis and peer ranking using Yahoo Finance fundamentalsTimeseries for fundamentals plus Yahoo Finance chart API for real-time price/market data. Computes 15+ ratios (gross/operating/net margin, ROE, ROIC, current/quick ratio, D/E, interest coverage, FCF margin, CAGR) with a 100-point scoring system (blend: 30 quality + 25 balance-sheet + 20 cash-flow + 20 valuation + 5 capital allocation). Outputs include current price, market cap, 52-week range, P/E and P/S ratios. Use when a user asks to analyze one or more stock tickers, compare peers, choose a best pick, or produce a fundamentals-based verdict. No API key required. Evolved from nickfiorani/fundamental-stock-analysis version 1.0 at 2026-06-01.
version: 1.6
---

> **Runtime — `/cmd` preferred:** `run /skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js --ticker AAPL` or `--tickers NVDA,GOOGL`. `/code` (require) is available as a secondary path. Always `await` — do NOT use `.then()`.

# fundamental-stock-analysis

Pulls real fundamental data from Yahoo Finance fundamentalsTimeseries (current annual data, no API key required) and real-time price/market data from Yahoo Finance chart API, then applies a structured 100-point scoring system. Falls back to SEC EDGAR XBRL if Yahoo is unavailable.

**Data sources (in priority order):**
- **Yahoo Finance fundamentalsTimeseries** — primary source for fundamentals (revenue, net income, assets, cash flow, etc.). 15 annual metrics, current data for all tickers. No API key required.
- **Yahoo Finance chart API** — current price, 52-week high/low, volume, P/E, P/S
- **SEC EDGAR XBRL** (fallback) — if Yahoo returns empty/errors, falls back to SEC EDGAR

When SEC `companyfacts` data is used as fallback and stale (>2 years old) or missing, the skill also tries the SEC Frames API for the most recent calendar year.

## How to Call

> **`/cmd` first (preferred), `/code` second.**

### /cmd — Terminal

```sh
# Analyze a single ticker
run /skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js --ticker AAPL

# Compare peers (comma-separated)
run /skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js --tickers NVDA,GOOGL,TSLA
```

### /code — JavaScript (require)

```js
var fundamentalStock = require('/skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js');

// Analyze a single ticker
var result = await fundamentalStock.analyzeTicker("AAPL");
console.log(fundamentalStock.formatAnalysis(result));

// Compare peers
var result = await fundamentalStock.compareTickers("NVDA,GOOGL,TSLA");
console.log(result);

// Via runFromParams
console.log(await fundamentalStock.runFromParams({ticker: "AAPL"}));
```

### JS API

```js
// Analyze a single ticker
console.log(await fundamentalStock.analyzeTicker("AAPL"));
console.log(await fundamentalStock.analyzeTicker("NVDA"));

// Compare peers (comma-separated or array)
console.log(await fundamentalStock.compareTickers("NVDA,GOOGL,TSLA"));
console.log(await fundamentalStock.compareTickers(["MSFT", "AAPL", "META"]));

// Via runFromParams
console.log(await fundamentalStock.runFromParams({ticker: "AAPL"}));
console.log(await fundamentalStock.runFromParams({tickers: "NVDA,GOOGL"}));

// Format results for display
var result = await fundamentalStock.analyzeTicker("AAPL");
console.log(fundamentalStock.formatAnalysis(result));

// Fetch Yahoo fundamentals directly (returns companyData shape or null)
var data = await fundamentalStock.fetchYahooFundamentals("AAPL");
console.log(data);
```

### Output Fields

- `entityName` — Company full name
- `score` — 100-point score (blend weights)
- `rating` — Exceptional/Strong/Acceptable/Weak/Avoid
- `confidence` — High/Medium/Low (based on data coverage and recency)
- `revenue`, `netIncome`, `epsDiluted`, `totalAssets`, `shareholdersEquity`, `cash`, `totalDebt`, `freeCashFlow`, `operatingCashFlow`
- `grossMargin`, `operatingMargin`, `netMargin`, `roe`, `roic`, `currentRatio`, `quickRatio`, `debtToEquity`, `netDebt`, `interestCoverage`, `fcfMargin`, `cashConversion`
- `revenueCagr5`, `epsCagr5`, `epsLossYears`, `ocfCagr5`
- `price`, `marketCap`, `peRatio`, `psRatio`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, `regularMarketVolume`, `exchange`, `priceAsOf` (from Yahoo Finance)
- `scoreBreakdown` — Detailed scores across five dimensions
- `framesUsed` — (if applicable) which facts came from SEC Frames API fallback
- `summary` — Scoring summary text

### Data Sources (in priority order)

- **Yahoo Finance fundamentalsTimeseries** (primary): `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/{ticker}`
  - Free public data, no API key required
  - Covers all listed companies with current annual data
  - 15 metrics fetched in parallel: `totalRevenue, grossProfit, ebit, netIncome, dilutedEPS, totalAssets, totalLiabilities, totalEquity, workingCapital, totalDebt, cashAndCashEquivalents, operatingCashFlow, freeCashFlow, sharesOutstanding, interestExpense`
- **Yahoo Finance chart API** (market data): `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}`
  - Free public data, no API key required
  - Current price, 52-week high/low, volume, market cap, P/E, P/S
- **SEC EDGAR XBRL API** (fallback): `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json`
  - Free public data, no API key required
  - Covers all SEC-registered companies
  - May be stale for some companies; confidence drops when data >2 years old
- **SEC EDGAR Frames API** (fallback): `https://data.sec.gov/api/xbrl/frames/us-gaap/{fact}/USD/CY{year}.json`
  - Automatically called when companyfacts data is stale (>2 years) or key facts are missing
  - Covers 2000-2800 companies for recent calendar years

### Score Calculation

**Blend weights (default):**
| Dimension | Max | Description |
|-----------|-----|-------------|
| Business Quality | 30 | Profit margins, ROE/ROIC, revenue growth |
| Balance Sheet & Solvency | 25 | Current ratio, D/E, interest coverage, net debt |
| Cash-Flow Strength | 20 | FCF, FCF margin, cash conversion |
| Valuation | 20 | P/E (primary) or P/S (fallback) |
| Capital Allocation | 5 | Price position within 52-week range (proxy) |

### Notes

- Tickers must be US equity symbols (e.g. AAPL, MSFT, NVDA, GOOGL)
- Companies with fiscal years not ending in December (Apple Sep, Walmart Jan, etc.) may have stale SEC data as fallback
  - Confidence automatically drops to Low/Medium
  - Analysis is still provided but should be interpreted with caution
- Yahoo Finance may be rate-limited in some regions; market data fields will be null in that case
- Analysis is for educational/informational purposes only, not investment advice
- For deeper analysis, use `references/playbook.md` after obtaining the base data

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/fundamental-stock-analysis.js --ticker AAPL
node scripts/fundamental-stock-analysis.js --tickers NVDA,GOOGL
```
