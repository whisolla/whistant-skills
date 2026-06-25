// olo-sec-scanner.js — SEC EDGAR M&A due diligence scanner v1.0
// Data sources: SEC EDGAR XBRL companyfacts, submissions API (free, no API key)
// Pure fetch(), 10 req/sec rate limit.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

var API_BASE = 'https://data.sec.gov/api/xbrl/companyfacts';
var SUBMISSIONS_BASE = 'https://data.sec.gov/submissions';
var TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
var UA = 'Whistant-Dev contact@whisolla.com';

// ─── Cache ─────────────────────────────────────────────────────────────────────
var _tickerMap = null;

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

/**
 * Load ticker→CIK mapping from SEC company_tickers.json.
 */
function _loadTickerMap() {
  return new Promise(function(resolve, reject) {
    if (_tickerMap) { resolve(_tickerMap); return; }
    fetch(TICKERS_URL, { headers: { 'User-Agent': UA }, timeout: 15 })
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load company tickers: HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        _tickerMap = {};
        for (var key in data) {
          if (!data.hasOwnProperty(key)) continue;
          var entry = data[key];
          var ticker = (entry.ticker || '').toUpperCase();
          if (ticker) _tickerMap[ticker] = { cik: entry.cik_str, title: entry.title };
        }
        resolve(_tickerMap);
      })
      .catch(reject);
  });
}

/**
 * Lookup ticker → CIK.
 */
function lookupTicker(ticker) {
  return _loadTickerMap().then(function(map) {
    var t = ticker.toUpperCase();
    var entry = map[t];
    if (!entry) return { error: 'Ticker "' + ticker + '" not found in SEC company tickers.' };
    var cikStr = String(entry.cik);
    while (cikStr.length < 10) cikStr = '0' + cikStr;
    return { cik: entry.cik, title: entry.title, cikStr: cikStr };
  });
}

/**
 * Get the latest value for an XBRL fact (annual 10-K, fp='FY').
 */
function _getLatestFact(facts, mode) {
  if (!facts || !facts.units) return null;
  var unitKey = facts.units.USD ? 'USD' : Object.keys(facts.units)[0];
  if (!unitKey) return null;
  var entries = facts.units[unitKey];
  if (!entries || !entries.length) return null;

  var form = mode === 'annual' ? '10-K' : '10-Q';
  var fps = mode === 'annual' ? ['FY'] : ['Q1', 'Q2', 'Q3', 'Q4'];

  var candidates = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.form !== form) continue;
    if (fps.indexOf(e.fp) === -1) continue;
    candidates.push(e);
  }

  if (!candidates.length) return null;
  candidates.sort(function(a, b) {
    var da = a.end || a.filed || '';
    var db = b.end || b.filed || '';
    if (da > db) return -1;
    if (da < db) return 1;
    return 0;
  });

  return { val: candidates[0].val, fy: candidates[0].fy, endDate: candidates[0].end || candidates[0].filed };
}

/**
 * Get N recent annual values sorted chronologically.
 */
function _getAnnualHistory(facts, count) {
  if (!facts || !facts.units) return [];
  var unitKey = facts.units.USD ? 'USD' : Object.keys(facts.units)[0];
  if (!unitKey) return [];
  var entries = facts.units[unitKey] || [];

  var annual = [];
  var seenFy = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.form !== '10-K') continue;
    if (e.fp !== 'FY') continue;
    if (seenFy[e.fy]) continue;
    seenFy[e.fy] = true;
    annual.push({ val: e.val, fy: e.fy, endDate: e.end });
  }
  annual.sort(function(a, b) { return a.fy - b.fy; });
  if (annual.length > count) annual = annual.slice(-count);
  return annual;
}

/**
 * Format large numbers for readability.
 */
function fmt(val) {
  if (val === null || val === undefined) return 'N/A';
  var abs = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
  return sign + abs.toFixed(1);
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

/**
 * Extract financial metrics from SEC company facts.
 */
function fetchCompanyFacts(cikStr) {
  return fetch(API_BASE + '/CIK' + cikStr + '.json', {
    headers: { 'User-Agent': UA },
    timeout: 20
  }).then(function(res) {
    if (!res.ok) throw new Error('SEC facts request failed: HTTP ' + res.status);
    return res.json();
  }).then(function(data) {
    var usgaap = (data.facts && data.facts['us-gaap']) || {};
    var eName = data.entityName || '';

    function v(key) { return _getLatestFact(usgaap[key], 'annual'); }
    function vq(key) { return _getLatestFact(usgaap[key], 'quarterly'); }

    var revenue = v('Revenues') || v('RevenueFromContractWithCustomerExcludingAssessedTax');
    var costOfRevenue = v('CostOfGoodsAndServicesSold') || v('CostOfRevenue');
    var grossProfit = v('GrossProfit');
    var operatingIncome = v('OperatingIncomeLoss');
    var depreciation = v('DepreciationDepletionAndAmortization') || v('DepreciationAndAmortization');
    var netIncome = v('NetIncomeLoss');
    var epsDiluted = v('EarningsPerShareDiluted');
    var totalAssets = v('Assets');
    var totalLiabilities = v('Liabilities');
    var shareholdersEquity = v('StockholdersEquity');
    var cash = v('CashAndCashEquivalentsAtCarryingValue');
    var longTermDebt = v('LongTermDebt') || v('LongTermDebtNoncurrent');
    var currentAssets = v('AssetsCurrent');
    var currentLiabilities = v('LiabilitiesCurrent');
    var ocf = v('NetCashProvidedByUsedInOperatingActivities');
    var capex = v('PaymentsToAcquirePropertyPlantAndEquipment');
    var interestExpense = v('InterestExpense');

    // Computed
    var ebitda = null;
    if (operatingIncome && depreciation) ebitda = { val: operatingIncome.val + depreciation.val, fy: operatingIncome.fy };
    else if (operatingIncome) ebitda = operatingIncome;

    var fcf = null;
    if (ocf && capex) fcf = { val: ocf.val - Math.abs(capex.val), fy: ocf.fy };

    var grossMargin = grossProfit && revenue ? (grossProfit.val / revenue.val) * 100 : null;
    var operatingMargin = operatingIncome && revenue ? (operatingIncome.val / revenue.val) * 100 : null;
    var netMargin = netIncome && revenue ? (netIncome.val / revenue.val) * 100 : null;

    // Balance sheet ratios
    var debtToEquity = longTermDebt && shareholdersEquity ? longTermDebt.val / shareholdersEquity.val : null;
    var netDebt = longTermDebt && cash ? longTermDebt.val - cash.val : null;
    var currentRatio = currentAssets && currentLiabilities ? currentAssets.val / currentLiabilities.val : null;

    // Revenue history for trend
    var revenuesHistory = _getAnnualHistory(
      usgaap['Revenues'] || usgaap['RevenueFromContractWithCustomerExcludingAssessedTax'] || null, 4
    );
    var ocfHistory = _getAnnualHistory(
      usgaap['NetCashProvidedByUsedInOperatingActivities'] || null, 4
    );

    return {
      entityName: eName,
      cikStr: cikStr,
      income: {
        revenue: revenue ? revenue.val : null,
        costOfRevenue: costOfRevenue ? costOfRevenue.val : null,
        grossProfit: grossProfit ? grossProfit.val : null,
        grossMargin: grossMargin,
        operatingIncome: operatingIncome ? operatingIncome.val : null,
        operatingMargin: operatingMargin,
        ebitda: ebitda ? ebitda.val : null,
        depreciation: depreciation ? depreciation.val : null,
        netIncome: netIncome ? netIncome.val : null,
        netMargin: netMargin,
        epsDiluted: epsDiluted ? epsDiluted.val : null,
        interestExpense: interestExpense ? interestExpense.val : null,
        fy: revenue ? revenue.fy : (netIncome ? netIncome.fy : null)
      },
      balanceSheet: {
        totalAssets: totalAssets ? totalAssets.val : null,
        totalLiabilities: totalLiabilities ? totalLiabilities.val : null,
        shareholdersEquity: shareholdersEquity ? shareholdersEquity.val : null,
        cash: cash ? cash.val : null,
        longTermDebt: longTermDebt ? longTermDebt.val : null,
        currentAssets: currentAssets ? currentAssets.val : null,
        currentLiabilities: currentLiabilities ? currentLiabilities.val : null,
        netDebt: netDebt,
        debtToEquity: debtToEquity,
        currentRatio: currentRatio
      },
      cashFlow: {
        operatingCashFlow: ocf ? ocf.val : null,
        capex: capex ? Math.abs(capex.val) : null,
        freeCashFlow: fcf ? fcf.val : null,
        fy: ocf ? ocf.fy : null
      },
      history: {
        revenues: revenuesHistory,
        ocf: ocfHistory
      }
    };
  });
}

/**
 * Fetch recent filings from SEC submissions API.
 */
function fetchSubmissions(cikStr) {
  return fetch(SUBMISSIONS_BASE + '/CIK' + cikStr + '.json', {
    headers: { 'User-Agent': UA },
    timeout: 15
  }).then(function(res) {
    if (!res.ok) throw new Error('SEC submissions request failed: HTTP ' + res.status);
    return res.json();
  }).then(function(data) {
    var filings = data.filings || {};
    var recent = filings.recent || {};
    var count = recent.form ? recent.form.length : 0;

    // Categorize filings
    var annual = [];    // 10-K
    var quarterly = []; // 10-Q
    var material = [];  // 8-K
    var proxy = [];     // DEF 14A
    var beneficial = [];// SC 13D, SC 13G
    var insider = [];   // Form 3, 4, 5
    var other = [];

    for (var i = 0; i < count; i++) {
      var form = (recent.form || [])[i] || '';
      var filing = {
        form: form,
        filingDate: (recent.filingDate || [])[i] || '',
        reportDate: (recent.reportDate || [])[i] || '',
        accessionNumber: (recent.accessionNumber || [])[i] || '',
        primaryDocument: (recent.primaryDocument || [])[i] || ''
      };

      if (form === '10-K') annual.push(filing);
      else if (form === '10-Q') quarterly.push(filing);
      else if (form === '8-K') material.push(filing);
      else if (form === 'DEF 14A') proxy.push(filing);
      else if (form === 'SC 13D' || form === 'SC 13G' || form === 'SC 13D/A' || form === 'SC 13G/A') beneficial.push(filing);
      else if (form === '3' || form === '4' || form === '5') insider.push(filing);
      else other.push(form);
    }

    return {
      annual: annual.slice(0, 5),
      quarterly: quarterly.slice(0, 5),
      material: material.slice(0, 10),
      proxy: proxy.slice(0, 3),
      beneficial: beneficial.slice(0, 5),
      insider: insider.slice(0, 10),
      totalFilings: count,
      otherForms: other.slice(0, 20)
    };
  });
}

/**
 * Detect risk flags from financial data.
 */
function detectRiskFlags(financials, filings) {
  var flags = [];

  // Revenue concentration check
  var revHistory = financials.history.revenues || [];
  if (revHistory.length >= 3) {
    var latest = revHistory[revHistory.length - 1];
    var prev = revHistory[revHistory.length - 2];
    var chg = pctChange(latest.val, prev.val);
    if (chg !== null && chg < -10) {
      flags.push({ severity: '⚠', category: 'Financial', text: 'Revenue declined ' + Math.abs(chg).toFixed(1) + '% YoY' });
    }
    if (chg !== null && chg > 50) {
      flags.push({ severity: 'ℹ', category: 'Financial', text: 'Revenue grew ' + chg.toFixed(1) + '% YoY — verify sustainability' });
    }
  }

  // Profitability check
  var inc = financials.income;
  if (inc.netIncome !== null && inc.netIncome < 0) {
    flags.push({ severity: '⚠', category: 'Financial', text: 'Net loss: ' + fmt(inc.netIncome) + ' (FY' + inc.fy + ')' });
  }

  // Debt check
  var bs = financials.balanceSheet;
  if (bs.debtToEquity !== null && bs.debtToEquity > 2) {
    flags.push({ severity: '⚠', category: 'Financial', text: 'High leverage: D/E = ' + bs.debtToEquity.toFixed(1) + 'x' });
  }
  if (bs.netDebt !== null && bs.netDebt > 0 && financials.income.ebitda) {
    var ndEbitda = bs.netDebt / financials.income.ebitda;
    if (ndEbitda > 4) {
      flags.push({ severity: '⚠', category: 'Financial', text: 'Net Debt/EBITDA = ' + ndEbitda.toFixed(1) + 'x (elevated)' });
    }
  }

  // Cash flow check
  var cf = financials.cashFlow;
  if (cf.freeCashFlow !== null && cf.freeCashFlow < 0) {
    flags.push({ severity: '⚠', category: 'Financial', text: 'Negative free cash flow: ' + fmt(cf.freeCashFlow) });
  }
  if (cf.operatingCashFlow !== null && cf.operatingCashFlow < 0) {
    flags.push({ severity: '⚠', category: 'Financial', text: 'Negative operating cash flow' });
  }

  // Liquidity check
  if (bs.currentRatio !== null && bs.currentRatio < 1) {
    flags.push({ severity: '⚠', category: 'Financial', text: 'Current ratio < 1.0 (' + bs.currentRatio.toFixed(2) + ') — potential liquidity concern' });
  }

  // Margin compression check
  if (revHistory.length >= 2) {
    var revLatest = revHistory[revHistory.length - 1];
    var revPrev2 = revHistory[revHistory.length - 2];
    if (inc.grossMargin !== null && revLatest && revPrev2 && revLatest.val < revPrev2.val * 0.95 && inc.netIncome < 0) {
      flags.push({ severity: '⚠', category: 'Financial', text: 'Revenue declining with negative earnings — going concern risk' });
    }
  }

  // Material event flags from filings
  var matFilings = filings.material || [];
  var hasCFOChange = false;
  var hasAuditorChange = false;
  for (var i = 0; i < matFilings.length; i++) {
    var f = matFilings[i];
    // We can't parse 8-K content without downloading each, but flag recent 8-Ks as needing review
  }

  // Audit/accounting flags
  if (filings.totalFilings === 0) {
    flags.push({ severity: '⚠', category: 'Regulatory', text: 'No recent SEC filings found — possible filing delinquency' });
  }

  // Many 8-Ks in short period = potential red flag
  if (matFilings.length >= 5) {
    flags.push({ severity: 'ℹ', category: 'Governance', text: matFilings.length + ' recent 8-K filings — review for material events' });
  }

  // 13D/G filings
  if (filings.beneficial.length > 0) {
    flags.push({ severity: 'ℹ', category: 'Ownership', text: filings.beneficial.length + ' recent SC 13D/G filings — activist or ownership changes' });
  }

  return flags;
}

/**
 * Format the full scan result as a markdown report.
 */
function formatScanResult(ticker, company, financials, filings) {
  var lines = [];
  var inc = financials.income;
  var bs = financials.balanceSheet;
  var cf = financials.cashFlow;

  lines.push('# SEC Filing Analysis: ' + company.title + ' (' + ticker + ')');
  lines.push('');
  lines.push('**CIK:** ' + company.cikStr + ' | **Entity:** ' + financials.entityName);
  lines.push('');
  lines.push('**Filings Scanned:** ' + (filings.annual.length + filings.quarterly.length + filings.material.length) +
    ' (' + filings.annual.length + 'x 10-K, ' + filings.quarterly.length + 'x 10-Q, ' + filings.material.length + 'x 8-K)');
  if (filings.annual.length > 0) {
    lines.push('**Date Range:** ' + filings.annual[filings.annual.length - 1].filingDate + ' to ' + filings.annual[0].filingDate);
  }
  lines.push('');

  // Financial Summary
  lines.push('## Financial Summary (from XBRL, FY' + (inc.fy || 'N/A') + ')');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push('| Revenue | ' + fmt(inc.revenue) + ' |');
  if (inc.grossMargin !== null) lines.push('| Gross Margin | ' + inc.grossMargin.toFixed(1) + '% |');
  if (inc.operatingMargin !== null) lines.push('| Operating Margin | ' + inc.operatingMargin.toFixed(1) + '% |');
  if (inc.ebitda !== null) lines.push('| EBITDA | ' + fmt(inc.ebitda) + (inc.revenue ? ' (' + (inc.ebitda / inc.revenue * 100).toFixed(1) + '% margin)' : '') + ' |');
  lines.push('| Net Income | ' + fmt(inc.netIncome) + ' |');
  if (inc.netMargin !== null) lines.push('| Net Margin | ' + inc.netMargin.toFixed(1) + '% |');
  if (inc.epsDiluted !== null) lines.push('| Diluted EPS | $' + inc.epsDiluted.toFixed(2) + ' |');
  lines.push('');
  lines.push('| Total Assets | ' + fmt(bs.totalAssets) + ' |');
  lines.push('| Total Liabilities | ' + fmt(bs.totalLiabilities) + ' |');
  lines.push('| Shareholders\' Equity | ' + fmt(bs.shareholdersEquity) + ' |');
  lines.push('| Cash | ' + fmt(bs.cash) + ' |');
  if (bs.longTermDebt !== null) lines.push('| Long-Term Debt | ' + fmt(bs.longTermDebt) + ' |');
  if (bs.netDebt !== null) lines.push('| Net Debt | ' + fmt(bs.netDebt) + ' |');
  if (bs.debtToEquity !== null) lines.push('| D/E Ratio | ' + bs.debtToEquity.toFixed(2) + 'x |');
  if (bs.currentRatio !== null) lines.push('| Current Ratio | ' + bs.currentRatio.toFixed(2) + 'x |');
  lines.push('');
  lines.push('| Operating Cash Flow | ' + fmt(cf.operatingCashFlow) + ' |');
  lines.push('| CapEx | ' + fmt(cf.capex) + ' |');
  lines.push('| Free Cash Flow | ' + fmt(cf.freeCashFlow) + ' |');

  // Revenue trend
  var revHistory = financials.history.revenues;
  if (revHistory.length >= 2) {
    lines.push('');
    lines.push('### Revenue Trend');
    lines.push('');
    lines.push('| Fiscal Year | Revenue | YoY Change |');
    lines.push('|-------------|---------|------------|');
    for (var j = 0; j < revHistory.length; j++) {
      var r = revHistory[j];
      var chg = j > 0 ? pctChange(r.val, revHistory[j - 1].val) : null;
      lines.push('| FY' + r.fy + ' | ' + fmt(r.val) + ' | ' + (chg !== null ? (chg >= 0 ? '↑ ' : '↓ ') + Math.abs(chg).toFixed(1) + '%' : '—') + ' |');
    }
  }

  // Risk Flags
  var flags = detectRiskFlags(financials, filings);
  if (flags.length > 0) {
    lines.push('');
    lines.push('## Risk Flags');
    lines.push('');
    for (var k = 0; k < flags.length; k++) {
      lines.push(flags[k].severity + ' **[' + flags[k].category + ']** ' + flags[k].text);
    }
  } else {
    lines.push('');
    lines.push('## Risk Flags');
    lines.push('');
    lines.push('✓ No significant risk flags detected from financial data.');
  }

  // Recent Material Events
  if (filings.material.length > 0) {
    lines.push('');
    lines.push('## Recent 8-K Filings (Material Events)');
    lines.push('');
    lines.push('| Date | Accession |');
    lines.push('|------|-----------|');
    for (var m = 0; m < filings.material.length; m++) {
      var f8k = filings.material[m];
      lines.push('| ' + f8k.filingDate + ' | `' + f8k.accessionNumber + '` |');
    }
    lines.push('');
    lines.push('> ⚠ Review each 8-K for Item triggers: 1.01 (material agreement), 2.01 (acquisition), 4.01 (auditor change), 5.02 (officer departure)');
  }

  // Ownership/Beneficial filings
  if (filings.beneficial.length > 0) {
    lines.push('');
    lines.push('## Ownership Filings (SC 13D/G)');
    lines.push('');
    lines.push('| Date | Filing | Accession |');
    lines.push('|------|--------|-----------|');
    for (var b = 0; b < filings.beneficial.length; b++) {
      var f13 = filings.beneficial[b];
      lines.push('| ' + f13.filingDate + ' | ' + f13.form + ' | `' + f13.accessionNumber + '` |');
    }
  }

  // Proxy
  if (filings.proxy.length > 0) {
    lines.push('');
    lines.push('## Proxy Statements (DEF 14A)');
    lines.push('');
    for (var p = 0; p < filings.proxy.length; p++) {
      lines.push('- ' + filings.proxy[p].filingDate + ' — `' + filings.proxy[p].accessionNumber + '`');
    }
  }

  // M&A-Specific Checks
  lines.push('');
  lines.push('## M&A Due Diligence Checklist');
  lines.push('');
  lines.push('| Check | Status | Notes |');
  lines.push('|-------|--------|-------|');
  lines.push('| Financial trend (3+ years) | ' + (revHistory.length >= 2 ? '✅ ' + revHistory.length + ' years' : '⚠ Insufficient data') + ' | Revenue history extracted from XBRL |');
  lines.push('| Profitability | ' + (inc.netIncome !== null ? (inc.netIncome > 0 ? '✅ Profitable' : '⚠ Net loss') : '⚠ No data') + ' | FY' + (inc.fy || '?') + ' net income: ' + fmt(inc.netIncome) + ' |');
  lines.push('| Cash flow health | ' + (cf.freeCashFlow !== null ? (cf.freeCashFlow > 0 ? '✅ Positive FCF' : '⚠ Negative FCF') : '⚠ No data') + ' | FCF: ' + fmt(cf.freeCashFlow) + ' |');
  lines.push('| Leverage | ' + (bs.debtToEquity !== null ? (bs.debtToEquity < 2 ? '✅ Low' : '⚠ High') : '⚠ No data') + ' | D/E: ' + (bs.debtToEquity !== null ? bs.debtToEquity.toFixed(1) + 'x' : 'N/A') + ' |');
  lines.push('| Liquidity | ' + (bs.currentRatio !== null ? (bs.currentRatio >= 1 ? '✅ Adequate' : '⚠ Tight') : '⚠ No data') + ' | Current ratio: ' + (bs.currentRatio !== null ? bs.currentRatio.toFixed(2) : 'N/A') + ' |');
  lines.push('| Recent material events (8-K) | ' + (filings.material.length > 0 ? '⚠ ' + filings.material.length + ' to review' : '✅ None recent') + ' | |');
  lines.push('| Beneficial ownership filings | ' + (filings.beneficial.length > 0 ? '⚠ ' + filings.beneficial.length + ' filings' : '✅ None') + ' | |');
  lines.push('| Proxy statements | ' + (filings.proxy.length > 0 ? '📋 ' + filings.proxy.length + ' available' : '⚠ None') + ' | Review for exec comp, related-party transactions |');
  lines.push('');
  lines.push('> **Next steps:** Review individual 8-K items, proxy statements (DEF 14A) for exec comp/change-of-control, and search 10-K text for "change of control", "golden parachute", "material weakness", and "going concern".');

  return lines.join('\n');
}

/**
 * Main scan entry point.
 */
async function scanTicker(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    return { error: 'Ticker symbol is required.' };
  }

  var lookup = await lookupTicker(ticker);
  if (lookup.error) return lookup;

  try {
    var financials = await fetchCompanyFacts(lookup.cikStr);
    var filings = await fetchSubmissions(lookup.cikStr);
    return {
      ticker: ticker.toUpperCase(),
      company: lookup,
      financials: financials,
      filings: filings,
      formatted: formatScanResult(ticker.toUpperCase(), lookup, financials, filings)
    };
  } catch (e) {
    return { error: 'Scan failed: ' + (e && e.message ? e.message : String(e)) };
  }
}

// ─── 2. HANDLER ───────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ─── 3. EXPORTS ───────────────────────────────────────────────────────────────

var skillApi = { handler, runFromParams, parseCommand, scanTicker, lookupTicker, fetchCompanyFacts, fetchSubmissions, detectRiskFlags, formatScanResult };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.oloSecScanner = skillApi;
}

// ─── 4. CMD PARSING ───────────────────────────────────────────────────────────

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; if (cur) tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = {};

  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--ticker' || t === '-t') && i + 1 < tokens.length) {
      out.ticker = tokens[i + 1]; i += 2; continue;
    }
    i += 1;
  }

  // If no ticker from flags, treat first non-flag token as ticker
  if (!out.ticker) {
    for (var j = 0; j < tokens.length; j++) {
      if (!tokens[j].startsWith('-')) {
        out.ticker = tokens[j];
        break;
      }
    }
  }

  return out;
}

// ─── 5. runFromParams ─────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var ticker = params.ticker || params.symbol || '';

  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.ticker) ticker = parsed.ticker;
  }

  if (!ticker) {
    return 'Usage: oloSecScanner.scanTicker("AAPL") — M&A due diligence scan\n' +
           'Cmd:  run /skills/olo-sec-scanner/scripts/olo-sec-scanner.js --ticker AAPL';
  }

  try {
    var result = await scanTicker(ticker);
    if (result.error) return result;
    return result.formatted;
  } catch (err) {
    return { error: 'Scan failed: ' + (err && err.message ? err.message : String(err)) };
  }
}

// ─── 6. Node.js CLI entry ─────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ─── 7. PARAMS auto-run block ─────────────────────────────────────────────────

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
