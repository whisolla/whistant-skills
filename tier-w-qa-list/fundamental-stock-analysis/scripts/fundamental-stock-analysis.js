// fundamental-stock-analysis.js — US fundamental equity analysis v1.6
// Primary: Yahoo Finance fundamentalsTimeseries for fundamentals (current data, no auth)
// Secondary: Yahoo Finance chart API for price/market data
// Fallback: SEC EDGAR XBRL if Yahoo returns empty/errors
// Pure fetch(), no API key required.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

var API_BASE = 'https://data.sec.gov/api/xbrl/companyfacts';
var FRAMES_BASE = 'https://data.sec.gov/api/xbrl/frames/us-gaap';
var TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
var YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';
var YAHOO_FUND = 'https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries';
var UA = 'Wistant-Dev contact@whisolla.com';
var YAHOO_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
// Timestamp range: cover 1985 to far future (covers all filings)
var FUND_PERIOD2 = '1780342846'; // far future

// ─── Cache ─────────────────────────────────────────────────────────────────────
var _tickerMap = null; // ticker → {cik, title} map, lazily loaded

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

/**
 * Load ticker→CIK mapping. Returns a map of uppercase ticker → { cik, title }.
 * Downloads ~790KB JSON on first call, cached in memory for the session.
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
        // SEC returns {"0":{"cik_str":1045810,"ticker":"NVDA","title":"NVIDIA CORP"}, ...}
        for (var key in data) {
          if (!data.hasOwnProperty(key)) continue;
          var entry = data[key];
          var ticker = (entry.ticker || '').toUpperCase();
          if (ticker) {
            _tickerMap[ticker] = { cik: entry.cik_str, title: entry.title };
          }
        }
        resolve(_tickerMap);
      })
      .catch(reject);
  });
}

/**
 * Lookup a ticker in the SEC company tickers map.
 * Returns { cik, title, cikStr } or { error: '...' }.
 */
function lookupTicker(ticker) {
  return _loadTickerMap().then(function(map) {
    var t = ticker.toUpperCase();
    var entry = map[t];
    if (!entry) return { error: 'Ticker "' + ticker + '" not found in SEC company tickers. Check the symbol.' };
    // CIK is always 10 digits, zero-padded
    var cikStr = String(entry.cik);
    while (cikStr.length < 10) cikStr = '0' + cikStr;
    return { cik: entry.cik, title: entry.title, cikStr: cikStr };
  });
}

/**
 * Find the latest value for a given XBRL fact.
 * For `annual` mode: picks the latest 10-K entry with fp='FY' and no frame (filing's own data, not derived).
 * For `quarterly` mode: picks the latest 10-Q entry.
 * Returns { val, fy, endDate } or null if not found.
 */
function _getLatestFact(facts, mode) {
  if (!facts || !facts.units) return null;
  // Prefer USD unit, fall back to shares
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

  // Sort by end date descending (most recent period first)
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
 * Get the N most recent annual values (10-K, fp='FY') sorted chronologically.
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

  // Sort by fiscal year ascending
  annual.sort(function(a, b) { return a.fy - b.fy; });

  // Take last N
  if (annual.length > count) annual = annual.slice(-count);
  return annual;
}

/**
 * Pull company facts from SEC EDGAR and extract fundamental metrics.
 * If key facts are missing or the latest data is older than `staleThreshold` years,
 * falls back to the SEC Frames API for the most recent calendar year.
 * Returns structured data object with all extracted fields.
 */
function fetchCompanyData(cikStr) {
  return fetch(API_BASE + '/CIK' + cikStr + '.json', {
    headers: { 'User-Agent': UA },
    timeout: 20
  }).then(function(res) {
    if (!res.ok) throw new Error('SEC request failed: HTTP ' + res.status);
    return res.json();
  }).then(function(data) {
    var usgaap = (data.facts && data.facts['us-gaap']) || {};
    var eName = data.entityName || '';
    var cik = data.cik || 0;

    // Helper to get latest annual value
    function v(key) {
      var f = _getLatestFact(usgaap[key], 'annual');
      return f ? f.val : null;
    }
    // Helper to get latest quarterly value
    function vq(key) {
      var f = _getLatestFact(usgaap[key], 'quarterly');
      return f ? f.val : null;
    }

    var revenue = v('Revenues') || v('RevenueFromContractWithCustomerExcludingAssessedTax');
    var costOfRevenue = v('CostOfGoodsAndServicesSold') || v('CostOfRevenue');
    var grossProfit = v('GrossProfit');
    var operatingIncome = v('OperatingIncomeLoss');
    var netIncome = v('NetIncomeLoss');
    var epsDiluted = v('EarningsPerShareDiluted');
    var totalAssets = v('Assets');
    var totalLiabilities = v('Liabilities');
    var shareholdersEquity = v('StockholdersEquity');
    var cash = v('CashAndCashEquivalentsAtCarryingValue');
    var longTermDebt = v('LongTermDebt') || v('LongTermDebtNoncurrent');
    var currentDebt = v('LongTermDebtCurrent');
    var currentAssets = v('AssetsCurrent');
    var currentLiabilities = v('LiabilitiesCurrent');
    var inventory = v('InventoryNet');
    var ocf = v('NetCashProvidedByUsedInOperatingActivities');
    var capex = v('PaymentsToAcquirePropertyPlantAndEquipment');
    var interestExpense = v('InterestExpense');
    // Shares outstanding — multiple XBRL tags depending on filer convention
    var sharesOutstanding = v('CommonStockSharesOutstanding')
      || v('EntityCommonStockSharesOutstanding')
      || v('WeightedAverageNumberOfSharesOutstandingBasic')
      || v('WeightedAverageNumberOfDilutedSharesOutstanding');

    // For FCF: OCF - capex (capex is usually negative in practice, but SEC stores it as absolute value)
    var fcf = null;
    if (ocf !== null && capex !== null) fcf = ocf - Math.abs(capex);

    // Get historical revenues for CAGR
    var revenuesHistory = _getAnnualHistory(
      usgaap['Revenues'] || usgaap['RevenueFromContractWithCustomerExcludingAssessedTax'] || null, 5
    );

    // Get historical EPS for trend
    var epsHistory = _getAnnualHistory(usgaap['EarningsPerShareDiluted'] || null, 10);

    // Get historical OCF for trend
    var ocfHistory = _getAnnualHistory(
      usgaap['NetCashProvidedByUsedInOperatingActivities'] || null, 10
    );

    return {
      entityName: eName,
      cik: cik,
      cikStr: cikStr,
      // Income statement
      revenue: revenue,
      costOfRevenue: costOfRevenue,
      grossProfit: grossProfit || (revenue !== null && costOfRevenue !== null ? revenue - costOfRevenue : null),
      operatingIncome: operatingIncome,
      netIncome: netIncome,
      epsDiluted: epsDiluted,
      // Balance sheet
      totalAssets: totalAssets,
      totalLiabilities: totalLiabilities,
      shareholdersEquity: shareholdersEquity,
      cash: cash,
      longTermDebt: longTermDebt,
      currentDebt: currentDebt,
      currentAssets: currentAssets,
      currentLiabilities: currentLiabilities,
      inventory: inventory,
      sharesOutstanding: sharesOutstanding,
      // Cash flow
      operatingCashFlow: ocf,
      capex: capex,
      freeCashFlow: fcf,
      interestExpense: interestExpense,
      // Historical
      revenuesHistory: revenuesHistory,
      epsHistory: epsHistory,
      ocfHistory: ocfHistory,
    };
  }).then(function(result) {
    // If data is stale (>2 years old) or key facts are missing,
    // supplement with Frames API. Frames has data for calendar-year filers
    // (Jan-Dec fiscal year) — most US mega-caps except Apple.
    var cik = result.cik;
    var needsFrames = false;
    if (result.revenuesHistory && result.revenuesHistory.length > 0) {
      var latestEnd = result.revenuesHistory[result.revenuesHistory.length - 1].endDate;
      if (latestEnd) {
        var daysOld = (Date.now() - new Date(latestEnd).getTime()) / (24 * 60 * 60 * 1000);
        if (daysOld > 365 * 2) needsFrames = true; // older than 2 years
      }
    }
    if (result.revenue === null) needsFrames = true;
    if (result.netIncome === null) needsFrames = true;

    if (!needsFrames) return result;

    // Fetch frames in parallel for missing key facts
    var framesToFetch = [];
    if (result.revenue === null) framesToFetch.push('Revenues');
    if (result.netIncome === null) framesToFetch.push('NetIncomeLoss');
    if (result.grossProfit === null) framesToFetch.push('GrossProfit');
    if (result.operatingIncome === null) framesToFetch.push('OperatingIncomeLoss');
    if (result.epsDiluted === null) framesToFetch.push('EarningsPerShareDiluted');
    if (result.totalAssets === null) framesToFetch.push('Assets');
    if (result.shareholdersEquity === null) framesToFetch.push('StockholdersEquity');
    if (result.operatingCashFlow === null) framesToFetch.push('NetCashProvidedByUsedInOperatingActivities');

    if (framesToFetch.length === 0) return result;

    var promises = framesToFetch.map(function(factName) {
      return fetchFromFrames(cik, factName).then(function(frameResult) {
        if (!frameResult) return null;
        return { factName: factName, val: frameResult.val, year: frameResult.year };
      });
    });

    return Promise.all(promises).then(function(frameResults) {
      var framesUsed = [];
      for (var i = 0; i < frameResults.length; i++) {
        var fr = frameResults[i];
        if (!fr) continue;
        // Map fact names to result fields
        if (fr.factName === 'Revenues' && result.revenue === null) { result.revenue = fr.val; framesUsed.push({fact:'Revenues', year:fr.year, val:fr.val}); }
        if (fr.factName === 'NetIncomeLoss' && result.netIncome === null) { result.netIncome = fr.val; framesUsed.push({fact:'NetIncomeLoss', year:fr.year, val:fr.val}); }
        if (fr.factName === 'GrossProfit' && result.grossProfit === null) { result.grossProfit = fr.val; framesUsed.push({fact:'GrossProfit', year:fr.year, val:fr.val}); }
        if (fr.factName === 'OperatingIncomeLoss' && result.operatingIncome === null) { result.operatingIncome = fr.val; framesUsed.push({fact:'OperatingIncomeLoss', year:fr.year, val:fr.val}); }
        if (fr.factName === 'EarningsPerShareDiluted' && result.epsDiluted === null) { result.epsDiluted = fr.val; framesUsed.push({fact:'EPS', year:fr.year, val:fr.val}); }
        if (fr.factName === 'Assets' && result.totalAssets === null) { result.totalAssets = fr.val; framesUsed.push({fact:'Assets', year:fr.year, val:fr.val}); }
        if (fr.factName === 'StockholdersEquity' && result.shareholdersEquity === null) { result.shareholdersEquity = fr.val; framesUsed.push({fact:'Equity', year:fr.year, val:fr.val}); }
        if (fr.factName === 'NetCashProvidedByUsedInOperatingActivities' && result.operatingCashFlow === null) { result.operatingCashFlow = fr.val; framesUsed.push({fact:'OCF', year:fr.year, val:fr.val}); }
      }
      result.framesUsed = framesUsed.length > 0 ? framesUsed : undefined;
      // Update dataDate if we got newer data from frames
      if (framesUsed.length > 0) {
        var maxYear = 0;
        for (var j = 0; j < framesUsed.length; j++) {
          if (framesUsed[j].year > maxYear) maxYear = framesUsed[j].year;
        }
        if (maxYear > 0) {
          result.dataAsOfYear = maxYear;
        }
      }
      return result;
    });
  });
}

/**
 * Fetch a single fact from SEC Frames API as fallback when companyfacts is stale.
 * Tries the most recent 3 calendar years and returns the latest non-null value.
 * Returns { val, year } or null.
 */
function fetchFromFrames(cik, factName) {
  var currentYear = new Date().getFullYear();
  // Try most recent years first (current and previous)
  var years = [currentYear, currentYear - 1, currentYear - 2];

  // Chain of promises, try each year in order
  var promise = Promise.resolve(null);
  for (var i = 0; i < years.length; i++) {
    promise = promise.then(function(prevResult) {
      if (prevResult) return prevResult;
      var yr = years[i];
      var url = FRAMES_BASE + '/' + factName + '/USD/CY' + yr + '.json';
      return fetch(url, { headers: { 'User-Agent': UA }, timeout: 15 })
        .then(function(res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function(data) {
          if (!data || !data.data) return null;
          // Find this company
          var entry = null;
          for (var j = 0; j < data.data.length; j++) {
            if (String(data.data[j].cik) === String(cik)) {
              entry = data.data[j];
              break;
            }
          }
          if (!entry) return null;
          return { val: entry.val, year: yr };
        })
        .catch(function() { return null; });
    });
  }
  return promise;
}

/**
 * Fetch price/market data from Yahoo Finance chart API.
 * Returns { price, currency, fiftyTwoWeekHigh, fiftyTwoWeekLow, marketCap, name, exchange, regularMarketVolume, time }.
 * marketCap is null because chart API doesn't return it directly (would need shares * price).
 */
function fetchPriceData(ticker) {
  // Use 1d range — chartPreviousClose is before the chart window starts,
  // so 5d gives the close from 5+ days ago, not the previous trading day.
  // All meta fields (52w, name, exchange, volume) are still present with 1d.
  var url = YAHOO_CHART + '/' + encodeURIComponent(ticker) + '?interval=1d&range=1d';
  return fetch(url, {
    headers: {
      'User-Agent': YAHOO_UA,
      'Accept': 'application/json'
    },
    timeout: 10
  })
    .then(function(res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function(data) {
      if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) return null;
      var meta = data.chart.result[0].meta;
      if (!meta) return null;
      return {
        price: meta.regularMarketPrice || null,
        previousClose: meta.chartPreviousClose || meta.previousClose || null,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
        regularMarketDayHigh: meta.regularMarketDayHigh || null,
        regularMarketDayLow: meta.regularMarketDayLow || null,
        regularMarketVolume: meta.regularMarketVolume || null,
        currency: meta.currency || 'USD',
        exchange: meta.fullExchangeName || meta.exchangeName || null,
        name: meta.longName || meta.shortName || ticker,
        time: meta.regularMarketTime || null
      };
    })
    .catch(function() { return null; });
}

// ─── Yahoo fundamentalsTimeseries ───────────────────────────────────────────

/** Mapping of metric keys → Yahoo fundamentalsTimeseries type names */
var YAHOO_FUND_METRICS = [
  { key: 'revenue',              type: 'annualTotalRevenue' },
  { key: 'grossProfit',          type: 'annualGrossProfit' },
  { key: 'ebit',                 type: 'annualEBIT' },
  { key: 'netIncome',            type: 'annualNetIncome' },
  { key: 'epsDiluted',           type: 'annualDilutedEPS' },
  { key: 'totalAssets',          type: 'annualTotalAssets' },
  { key: 'totalEquity',          type: 'annualTotalEquityGrossMinorityInterest' },
  { key: 'cash',                 type: 'annualCashAndCashEquivalents' },
  { key: 'longTermDebt',         type: 'annualLongTermDebt' },
  { key: 'currentAssets',        type: 'annualCurrentAssets' },
  { key: 'currentLiabilities',   type: 'annualCurrentLiabilities' },
  { key: 'operatingCashFlow',    type: 'annualOperatingCashFlow' },
  { key: 'capex',                type: 'annualCapitalExpenditure' },
  { key: 'freeCashFlow',         type: 'annualFreeCashFlow' },
  { key: 'interestExpense',      type: 'annualInterestExpense' }
];

/**
 * Fetch a single metric from Yahoo fundamentalsTimeseries.
 * Returns the full series array [{asOfDate, reportedValue:{raw,fmt}, periodType}, ...]
 * or null on failure.
 */
function _fetchYahooMetric(ticker, metricType) {
  var url = YAHOO_FUND + '/' + encodeURIComponent(ticker)
    + '?type=' + metricType + '&period1=0&period2=' + FUND_PERIOD2;
  return fetch(url, {
    headers: { 'User-Agent': YAHOO_UA, 'Accept': 'application/json' },
    timeout: 10
  })
    .then(function(res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function(data) {
      if (!data || !data.timeseries || !data.timeseries.result) return null;
      var r = data.timeseries.result[0];
      if (!r) return null;
      var items = r[metricType];
      if (!items || !items.length) return null;
      return items;
    })
    .catch(function() { return null; });
}

/**
 * Extract the latest annual (12M) value from a fundamentalsTimeseries array.
 * Returns { val: number, asOfDate: string } or null.
 */
function _latestAnnual(series) {
  if (!series || !series.length) return null;
  // Filter 12M period, sort by asOfDate desc
  var annual = [];
  for (var i = 0; i < series.length; i++) {
    if (series[i].periodType === '12M') {
      annual.push(series[i]);
    }
  }
  if (!annual.length) return null;
  annual.sort(function(a, b) {
    return (b.asOfDate || '').localeCompare(a.asOfDate || '');
  });
  return { val: annual[0].reportedValue.raw, asOfDate: annual[0].asOfDate };
}

/**
 * Convert Yahoo fundamentals data to the same structure fetchCompanyData() returns.
 * This allows computeAnalysis() to work unchanged regardless of data source.
 */
function _yahooToCompanyData(metrics, ticker, yahooName) {
  // Compute totalLiabilities = totalAssets - totalEquity
  var totalLiabilities = null;
  if (metrics.totalAssets !== null && metrics.totalEquity !== null) {
    totalLiabilities = metrics.totalAssets - metrics.totalEquity;
  }
  // Compute grossProfit if missing but we have revenue and ebit has cost data...
  // Actually ebit doesn't give us COGS. grossProfit is already fetched.

  // freeCashFlow from Yahoo is already correct (after capex)
  // capex from Yahoo comes as negative, make it absolute for consistency
  var capexAbs = metrics.capex !== null ? Math.abs(metrics.capex) : null;

  // Build CAGR histories from the 4-year series
  // Helper: parse FY year from asOfDate
  function getFY(asOfDate) {
    if (!asOfDate) return null;
    var parts = asOfDate.split('-');
    return parseInt(parts[0], 10);
  }

  var revenuesHistory = [];
  if (metrics._revSeries && metrics._revSeries.length) {
    var sorted = metrics._revSeries.slice().filter(function(s){return s.periodType==='12M';}).sort(function(a,b){return (a.asOfDate||'').localeCompare(b.asOfDate||'');});
    for (var i = 0; i < sorted.length; i++) {
      revenuesHistory.push({ val: sorted[i].reportedValue.raw, endDate: sorted[i].asOfDate, fy: getFY(sorted[i].asOfDate) });
    }
  }
  var epsHistory = [];
  if (metrics._epsSeries && metrics._epsSeries.length) {
    var sorted = metrics._epsSeries.slice().filter(function(s){return s.periodType==='12M';}).sort(function(a,b){return (a.asOfDate||'').localeCompare(b.asOfDate||'');});
    for (var i = 0; i < sorted.length; i++) {
      epsHistory.push({ val: sorted[i].reportedValue.raw, endDate: sorted[i].asOfDate, fy: getFY(sorted[i].asOfDate) });
    }
  }
  var ocfHistory = [];
  if (metrics._ocfSeries && metrics._ocfSeries.length) {
    var sorted = metrics._ocfSeries.slice().filter(function(s){return s.periodType==='12M';}).sort(function(a,b){return (a.asOfDate||'').localeCompare(b.asOfDate||'');});
    for (var i = 0; i < sorted.length; i++) {
      ocfHistory.push({ val: sorted[i].reportedValue.raw, endDate: sorted[i].asOfDate, fy: getFY(sorted[i].asOfDate) });
    }
  }

  return {
    entityName: yahooName || ticker,
    cik: 0,
    cikStr: '',
    revenue: metrics.revenue,
    costOfRevenue: null,
    grossProfit: metrics.grossProfit,
    operatingIncome: metrics.ebit,
    netIncome: metrics.netIncome,
    epsDiluted: metrics.epsDiluted,
    totalAssets: metrics.totalAssets,
    totalLiabilities: totalLiabilities,
    shareholdersEquity: metrics.totalEquity,
    cash: metrics.cash,
    longTermDebt: metrics.longTermDebt,
    currentDebt: null,
    currentAssets: metrics.currentAssets,
    currentLiabilities: metrics.currentLiabilities,
    inventory: null,
    sharesOutstanding: null,
    operatingCashFlow: metrics.operatingCashFlow,
    capex: capexAbs,
    freeCashFlow: metrics.freeCashFlow,
    interestExpense: metrics.interestExpense,
    revenuesHistory: revenuesHistory,
    epsHistory: epsHistory,
    ocfHistory: ocfHistory,
    dataSource: 'Yahoo Finance',
    dataAsOfYear: metrics._latestDate ? new Date(metrics._latestDate).getFullYear() : null
  };
}

/**
 * Fetch all fundamental data from Yahoo Finance fundamentalsTimeseries.
 * Returns structured object matching fetchCompanyData() shape, or null on failure.
 */
function fetchYahooFundamentals(ticker) {
  // Fetch all metrics in parallel (use map with IIFE to avoid closure bugs)
  var metricPromises = YAHOO_FUND_METRICS.map(function(m) {
    return _fetchYahooMetric(ticker, m.type).then(function(series) {
      return { key: m.key, series: series, latest: _latestAnnual(series) };
    });
  });

  return Promise.all(metricPromises).then(function(results) {
    var metrics = {};
    var latestDate = '';
    var coverage = 0;

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (r && r.latest) {
        metrics[r.key] = r.latest.val;
        if (r.latest.asOfDate > latestDate) latestDate = r.latest.asOfDate;
        coverage++;
      } else {
        metrics[r.key] = null;
      }
      // Save raw series for CAGR computation
      if (r && r.series) {
        if (r.key === 'revenue') metrics._revSeries = r.series;
        if (r.key === 'epsDiluted') metrics._epsSeries = r.series;
        if (r.key === 'operatingCashFlow') metrics._ocfSeries = r.series;
      }
    }

    metrics._latestDate = latestDate;

    // Need at least revenue + 3 other metrics to be useful
    if (metrics.revenue === null || coverage < 3) {
      return null;
    }

    // Also try to get company name from chart API
    var namePromise = fetchPriceData(ticker).then(function(pd) {
      return (pd && pd.name) ? pd.name : ticker;
    }).catch(function() { return ticker; });

    return namePromise.then(function(name) {
      return _yahooToCompanyData(metrics, ticker, name);
    });
  });
}

/**
 * Format a large number to human-readable string.
 */
function fmtNum(val) {
  if (val === null || val === undefined) return 'NA';
  var n = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (n >= 1e12) return sign + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return sign + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return sign + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return sign + (n / 1e3).toFixed(2) + 'K';
  return sign + n.toFixed(2);
}

/**
 * Format a percentage with 1 decimal.
 */
function fmtPct(val) {
  if (val === null || val === undefined) return 'NA';
  return val.toFixed(1) + '%';
}

/**
 * Compute CAGR from a history array sorted by fy ascending.
 */
function computeCAGR(history) {
  if (!history || history.length < 2) return null;
  var first = history[0].val;
  var last = history[history.length - 1].val;
  if (first <= 0 || last <= 0) return null;
  // Get year from fy field or parse from endDate
  function getYear(h) {
    if (typeof h.fy === 'number') return h.fy;
    if (h.endDate) {
      var d = new Date(h.endDate);
      return d.getFullYear();
    }
    return null;
  }
  var startYear = getYear(history[0]);
  var endYear = getYear(history[history.length - 1]);
  if (startYear === null || endYear === null) return null;
  var years = endYear - startYear;
  if (years <= 0) return null;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

/**
 * Count loss years in a history array.
 */
function countLossYears(history) {
  if (!history) return null;
  var count = 0;
  for (var i = 0; i < history.length; i++) {
    if (history[i].val < 0) count++;
  }
  return count;
}

/**
 * Compute fundamental analysis for a single ticker.
 * Called by analyzeTicker() after data is fetched.
 */
function computeAnalysis(lookupResult, companyData, priceData) {
  var d = companyData;
  var name = lookupResult.title || d.entityName;
  var price = (priceData && priceData.price) || null;
  var peRatio = (priceData && priceData.peRatio) || null;
  var psRatio = (priceData && priceData.psRatio) || null;
  var marketCap = (priceData && priceData.marketCap) || null;
  var fiftyTwoWeekHigh = (priceData && priceData.fiftyTwoWeekHigh) || null;
  var fiftyTwoWeekLow = (priceData && priceData.fiftyTwoWeekLow) || null;

  // ── Ratios ──────────────────────────────────────────────────────────────────
  var ratios = {};

  // Margins
  if (d.revenue !== null && d.revenue > 0) {
    ratios.grossMargin = d.grossProfit !== null ? (d.grossProfit / d.revenue) * 100 : null;
    ratios.operatingMargin = d.operatingIncome !== null ? (d.operatingIncome / d.revenue) * 100 : null;
    ratios.netMargin = d.netIncome !== null ? (d.netIncome / d.revenue) * 100 : null;
  } else {
    ratios.grossMargin = null;
    ratios.operatingMargin = null;
    ratios.netMargin = null;
  }

  // ROE
  ratios.roe = (d.netIncome !== null && d.shareholdersEquity !== null && d.shareholdersEquity > 0)
    ? (d.netIncome / d.shareholdersEquity) * 100 : null;

  // ROIC (simplified: NetIncome / (Equity + LongTermDebt))
  var investedCapital = null;
  if (d.shareholdersEquity !== null && d.longTermDebt !== null) {
    investedCapital = d.shareholdersEquity + d.longTermDebt;
  }
  ratios.roic = (d.netIncome !== null && investedCapital !== null && investedCapital > 0)
    ? (d.netIncome / investedCapital) * 100 : null;

  // Liquidity
  ratios.currentRatio = (d.currentAssets !== null && d.currentLiabilities !== null && d.currentLiabilities > 0)
    ? d.currentAssets / d.currentLiabilities : null;
  var quickAssets = (d.currentAssets !== null && d.inventory !== null) ? d.currentAssets - d.inventory : null;
  ratios.quickRatio = (quickAssets !== null && d.currentLiabilities !== null && d.currentLiabilities > 0)
    ? quickAssets / d.currentLiabilities : null;

  // Leverage
  var totalDebt = null;
  if (d.longTermDebt !== null && d.currentDebt !== null) totalDebt = d.longTermDebt + d.currentDebt;
  else if (d.longTermDebt !== null) totalDebt = d.longTermDebt;
  ratios.totalDebt = totalDebt;

  ratios.debtToEquity = (totalDebt !== null && d.shareholdersEquity !== null && d.shareholdersEquity > 0)
    ? totalDebt / d.shareholdersEquity : null;

  var netDebt = (totalDebt !== null && d.cash !== null) ? totalDebt - d.cash : null;
  ratios.netDebt = netDebt;

  // Interest coverage
  ratios.interestCoverage = (d.operatingIncome !== null && d.interestExpense !== null && d.interestExpense > 0)
    ? d.operatingIncome / d.interestExpense : null;

  // Cash flow
  ratios.fcfMargin = (d.freeCashFlow !== null && d.revenue !== null && d.revenue > 0)
    ? (d.freeCashFlow / d.revenue) * 100 : null;

  // Cash conversion: FCF / NetIncome
  ratios.cashConversion = (d.freeCashFlow !== null && d.netIncome !== null && d.netIncome !== 0)
    ? d.freeCashFlow / d.netIncome : null;

  // EPS CAGR and stability
  ratios.revenueCagr5 = computeCAGR(d.revenuesHistory);

  ratios.epsCagr5 = computeCAGR(d.epsHistory);

  var epsLossYears = countLossYears(d.epsHistory);
  ratios.epsLossYears = epsLossYears;

  // OCF trend
  ratios.ocfCagr5 = computeCAGR(d.ocfHistory);

  // ── Data Quality Scorecard ──────────────────────────────────────────────────
  var coreMetrics = [d.revenue, d.netIncome, d.totalAssets, d.shareholdersEquity,
                     d.operatingCashFlow, d.operatingIncome, d.totalLiabilities, d.cash];
  var available = 0;
  for (var ci = 0; ci < coreMetrics.length; ci++) { if (coreMetrics[ci] !== null) available++; }
  var coverage = Math.round((available / coreMetrics.length) * 100);

  // ── Quick Screen ────────────────────────────────────────────────────────────
  var quick = {};

  // 1. Size: requires market cap, which we compute from shares * price
  quick.size = null; // market cap from shares * price, filled in later
  quick.sizePass = false;

  // 2. Liquidity
  quick.liquidityPass = (ratios.currentRatio !== null && ratios.currentRatio >= 1.5) ||
    (ratios.quickRatio !== null && ratios.quickRatio >= 1.5);

  // 3. Debt
  quick.debtPass = ratios.debtToEquity !== null && ratios.debtToEquity <= 2.0;

  // 4. Earnings trend
  quick.earningsTrend = true;
  if (epsLossYears !== null && epsLossYears > 0) quick.earningsTrend = false;
  if (ratios.epsCagr5 !== null && ratios.epsCagr5 < 0) quick.earningsTrend = false;

  // 5. Cash flow trend
  quick.cashFlowTrend = true;
  if (d.freeCashFlow !== null && d.freeCashFlow < 0) quick.cashFlowTrend = false;
  if (ratios.ocfCagr5 !== null && ratios.ocfCagr5 < 0) quick.cashFlowTrend = false;

  // 6. Return quality
  quick.returnQuality = ratios.roe !== null && ratios.roe >= 10;

  // 7. Valuation — deferred (needs price)

  // ── Scoring helpers (avoid nested ternaries for JSC compat) ─────────────────
  function score3(v, t1, t2) { return v >= t1 ? 5 : v >= t2 ? 3 : 1; }
  function score3r(v, t1, t2) { return v <= t1 ? 7 : v <= t2 ? 5 : 2; }
  function score3cagr(v) { return v >= 10 ? 5 : v >= 5 ? 3 : v >= 0 ? 1 : 0; }
  function score4(v, t1, t2, t3) {
    if (v >= t1) return 5;
    if (v >= t2) return 4;
    if (v >= t3) return 2;
    return 1;
  }
  function score4r(v, t1, t2, t3) {
    if (v >= t1) return 7;
    if (v >= t2) return 5;
    if (v >= t3) return 2;
    return 0;
  }
  function scoreDtc(v) { return v >= 0.8 ? 5 : v >= 0.5 ? 3 : 1; }
  function scoreNd(v) { return v < 0 ? 3 : v === 0 ? 2 : 1; }

  // ── Scoring (blend default) ─────────────────────────────────────────────────
  // Business Quality (max 30)
  var scoreQuality = 0;
  if (ratios.grossMargin !== null) { scoreQuality += score3(ratios.grossMargin, 40, 20); }
  if (ratios.operatingMargin !== null) { scoreQuality += score3(ratios.operatingMargin, 20, 10); }
  if (ratios.netMargin !== null) { scoreQuality += score3(ratios.netMargin, 15, 5); }
  // Margin trends
  if (ratios.revenueCagr5 !== null) { scoreQuality += score3cagr(ratios.revenueCagr5); }
  // ROE/ROIC quality
  if (ratios.roe !== null) { scoreQuality += score4(ratios.roe, 25, 15, 10); }
  if (ratios.roic !== null) { scoreQuality += score3cagr(ratios.roic); }

  // Balance Sheet (max 25)
  var scoreBS = 0;
  if (ratios.currentRatio !== null) { scoreBS += score3(ratios.currentRatio, 2, 1.2); }
  else if (ratios.quickRatio !== null) { scoreBS += score3(ratios.quickRatio, 1.5, 1); }
  // Leverage (inverse: lower is better)
  if (ratios.debtToEquity !== null) { scoreBS += score3r(ratios.debtToEquity, 0.5, 1); }
  else { scoreBS += 3; } // unknown, neutral
  // Distress
  if (ratios.interestCoverage !== null) { scoreBS += score3cagr(ratios.interestCoverage); }
  else { scoreBS += 2; }
  // Cash position
  if (netDebt !== null) { scoreBS += scoreNd(netDebt); }
  else { scoreBS += 1.5; }

  // Cash Flow (max 20)
  var scoreCF = 0;
  if (d.freeCashFlow !== null && d.freeCashFlow > 0) { scoreCF += 5; }
  else if (d.freeCashFlow !== null) { scoreCF += 1; }
  else { scoreCF += 2.5; }
  if (ratios.fcfMargin !== null) { scoreCF += score3cagr(ratios.fcfMargin); }
  else { scoreCF += 2; }
  if (ratios.cashConversion !== null) { scoreCF += scoreDtc(ratios.cashConversion); }
  else { scoreCF += 2; }
  if (ratios.ocfCagr5 !== null) { scoreCF += score3cagr(ratios.ocfCagr5); }

  // Valuation (max 20) — now real since we have price from Yahoo
  var scoreValuation = 10; // default neutral
  if (typeof peRatio === 'number' && peRatio > 0) {
    if (peRatio < 0) scoreValuation = 0; // negative earnings
    else if (peRatio < 15) scoreValuation = 20;
    else if (peRatio < 20) scoreValuation = 18;
    else if (peRatio < 25) scoreValuation = 15;
    else if (peRatio < 30) scoreValuation = 12;
    else if (peRatio < 40) scoreValuation = 9;
    else if (peRatio < 60) scoreValuation = 6;
    else scoreValuation = 3;
  } else if (typeof psRatio === 'number' && psRatio > 0) {
    // Fall back to P/S when no positive EPS
    if (psRatio < 1) scoreValuation = 18;
    else if (psRatio < 2) scoreValuation = 16;
    else if (psRatio < 4) scoreValuation = 14;
    else if (psRatio < 6) scoreValuation = 12;
    else if (psRatio < 10) scoreValuation = 9;
    else if (psRatio < 15) scoreValuation = 6;
    else scoreValuation = 3;
  }

  // Capital Allocation (max 5) — 52w range as a price-context signal.
  // A stock at 20-40% of its 52w range is potentially undervalued; near 52w high may be priced in.
  // This is a noisy proxy without buyback/dividend data, so keep range tight.
  var scoreCapital = 2.5; // neutral default
  if (typeof fiftyTwoWeekHigh === 'number' && typeof fiftyTwoWeekLow === 'number'
      && fiftyTwoWeekHigh > fiftyTwoWeekLow && typeof price === 'number') {
    var posInRange = (price - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow);
    if (posInRange < 0.30) scoreCapital = 4; // near 52w low — potentially cheap
    else if (posInRange < 0.55) scoreCapital = 3.2;
    else if (posInRange < 0.80) scoreCapital = 2.5;
    else if (posInRange < 0.95) scoreCapital = 2;
    else scoreCapital = 1.5; // near 52w high — priced in
  }

  var baseScore = scoreQuality + scoreBS + scoreCF + scoreValuation + scoreCapital;

  // Confidence modifier
  var confidenceMod = 0;
  if (coverage < 90) confidenceMod -= 3;
  if (coverage < 70) confidenceMod -= 5;
  var conflictCount = 0;
  if (d.grossProfit !== null && d.revenue !== null && d.costOfRevenue !== null) {
    var computedGP = d.revenue - d.costOfRevenue;
    if (Math.abs(computedGP - d.grossProfit) / Math.abs(d.grossProfit) > 0.1) conflictCount++;
  }
  if (conflictCount >= 2) confidenceMod -= 4;
  if (conflictCount >= 3) confidenceMod -= 6;

  var finalScore = Math.max(0, Math.min(100, baseScore + confidenceMod));

  // Rating
  var rating;
  if (finalScore >= 85) rating = 'Exceptional';
  else if (finalScore >= 75) rating = 'Strong';
  else if (finalScore >= 65) rating = 'Acceptable';
  else if (finalScore >= 50) rating = 'Weak';
  else rating = 'Avoid';

  // Confidence
  var confidence;
  var dataAge = null;
  if (d.revenuesHistory.length > 0) {
    var latestEnd = d.revenuesHistory[d.revenuesHistory.length - 1].endDate;
    if (latestEnd) {
      var now = new Date();
      var endDate = new Date(latestEnd);
      dataAge = Math.round((now - endDate) / (365.25 * 24 * 60 * 60 * 1000));
    }
  }

  var staleConfidenceCap = null;
  if (dataAge !== null && dataAge > 4) { staleConfidenceCap = 'Low'; }
  else if (dataAge !== null && dataAge > 2) { staleConfidenceCap = 'Medium'; }

  var baseConfidence;
  if (coverage >= 90 && conflictCount === 0) baseConfidence = 'High';
  else if (coverage >= 70 && conflictCount < 2) baseConfidence = 'Medium';
  else baseConfidence = 'Low';

  // Apply staleness cap
  if (staleConfidenceCap && baseConfidence === 'High' && staleConfidenceCap === 'Low') confidence = 'Low';
  else if (staleConfidenceCap && baseConfidence === 'High' && staleConfidenceCap === 'Medium') confidence = 'Medium';
  else if (staleConfidenceCap && staleConfidenceCap === 'Low' && baseConfidence !== 'Low') confidence = 'Low';
  else confidence = baseConfidence;

  return {
    ticker: lookupResult.title ? lookupResult.title.split(' ')[0] : 'NA',
    entityName: name,
    cik: d.cik,
    score: finalScore,
    rating: rating,
    confidence: confidence,
    coverage: coverage,
    conflictCount: conflictCount,
    dataDate: d.revenuesHistory.length ? d.revenuesHistory[d.revenuesHistory.length - 1].endDate : (d.dataAsOfYear ? d.dataAsOfYear + '-12-31' : null),
    // Key metrics for display
    revenue: d.revenue,
    grossProfit: d.grossProfit,
    operatingIncome: d.operatingIncome,
    netIncome: d.netIncome,
    epsDiluted: d.epsDiluted,
    totalAssets: d.totalAssets,
    totalLiabilities: d.totalLiabilities,
    shareholdersEquity: d.shareholdersEquity,
    cash: d.cash,
    totalDebt: totalDebt,
    freeCashFlow: d.freeCashFlow,
    operatingCashFlow: d.operatingCashFlow,
    interestExpense: d.interestExpense,
    // Ratios
    grossMargin: ratios.grossMargin,
    operatingMargin: ratios.operatingMargin,
    netMargin: ratios.netMargin,
    roe: ratios.roe,
    roic: ratios.roic,
    currentRatio: ratios.currentRatio,
    quickRatio: ratios.quickRatio,
    debtToEquity: ratios.debtToEquity,
    netDebt: netDebt,
    interestCoverage: ratios.interestCoverage,
    fcfMargin: ratios.fcfMargin,
    cashConversion: ratios.cashConversion,
    revenueCagr5: ratios.revenueCagr5,
    epsCagr5: ratios.epsCagr5,
    epsLossYears: ratios.epsLossYears,
    ocfCagr5: ratios.ocfCagr5,
    // Price/market data (from Yahoo Finance, may be null if unavailable)
    price: price,
    marketCap: marketCap,
    peRatio: peRatio,
    psRatio: psRatio,
    fiftyTwoWeekHigh: fiftyTwoWeekHigh,
    fiftyTwoWeekLow: fiftyTwoWeekLow,
    // Scores
    scoreBreakdown: {
      quality: scoreQuality,
      balanceSheet: scoreBS,
      cashFlow: scoreCF,
      valuation: scoreValuation,
      capitalAllocation: scoreCapital,
    },
    quickScreen: quick,
    // Formatted summary for display
    summary: 'Score: ' + finalScore + '/100 (' + rating + ', ' + confidence + ' confidence) | Coverage: ' + coverage + '%',
  };
}

/**
 * Analyze a single ticker. The main entry point.
 * Returns a structured object with all ratios, scores, and a human-readable summary.
 */
async function analyzeTicker(ticker) {
  try {
    // Try Yahoo Finance fundamentals first (current data, no CIK needed)
    var data = await fetchYahooFundamentals(ticker);
    var dataSource = 'Yahoo Finance';

    // Fall back to SEC EDGAR if Yahoo returned nothing
    if (!data) {
      var lookup = await lookupTicker(ticker);
      if (lookup.error) return { error: lookup.error };
      data = await fetchCompanyData(lookup.cikStr);
      dataSource = 'SEC EDGAR';
    }

    // Always fetch price in parallel with whatever fundamentals we got
    var price = await fetchPriceData(ticker);

    // For computeAnalysis, use lookup if SEC, otherwise construct one from ticker
    var lookupObj = data.cik ? { title: data.entityName, cik: data.cik, cikStr: data.cikStr } : { title: data.entityName || ticker };
    var result = computeAnalysis(lookupObj, data, price);

    // Enrich with price/market data
    if (price && result && !result.error) {
      result.price = price.price;
      result.priceChange = price.previousClose !== null && price.price !== null
        ? ((price.price - price.previousClose) / price.previousClose) * 100 : null;
      result.fiftyTwoWeekHigh = price.fiftyTwoWeekHigh;
      result.fiftyTwoWeekLow = price.fiftyTwoWeekLow;
      result.regularMarketDayHigh = price.regularMarketDayHigh;
      result.regularMarketDayLow = price.regularMarketDayLow;
      result.regularMarketVolume = price.regularMarketVolume;
      result.exchange = price.exchange;
      result.currency = price.currency;
      result.priceAsOf = price.time ? new Date(price.time * 1000).toISOString().slice(0, 10) : null;

      // Compute market cap and P/E, P/S if we have shares & earnings
      if (price.price !== null && data.sharesOutstanding !== null) {
        result.marketCap = price.price * data.sharesOutstanding;
      }
      if (price.price !== null && data.epsDiluted !== null && data.epsDiluted > 0) {
        result.peRatio = price.price / data.epsDiluted;
      }
      if (price.price !== null && data.sharesOutstanding !== null && data.revenue !== null) {
        result.marketCap = result.marketCap || price.price * data.sharesOutstanding;
        result.psRatio = (price.price * data.sharesOutstanding) / data.revenue;
      }
      // P/S without shares: estimate from price * (shares placeholder) / revenue
      // With Yahoo, shares aren't available directly — use P/E from EPS instead
      if (result.peRatio !== null && data.revenue !== null && data.netIncome !== null && data.netIncome > 0) {
        // P/S = P/E * net_margin / 100
        var netMargin = (data.netIncome / data.revenue) * 100;
        result.psRatio = result.peRatio * netMargin / 100;
      }
    }

    result.dataSource = dataSource;

    return result;
  } catch (err) {
    return { error: 'Analysis failed: ' + (err && err.message ? err.message : String(err)), ticker: ticker };
  }
}

/**
 * Compare multiple tickers. Returns individual analyses plus a peer ranking with best pick.
 */
async function compareTickers(tickers) {
  // Allow comma-separated string
  if (typeof tickers === 'string') tickers = tickers.split(/[,;\s]+/).filter(Boolean);

  var results = [];
  var errors = [];

  for (var i = 0; i < tickers.length; i++) {
    var t = tickers[i].trim().toUpperCase();
    if (!t) continue;
    try {
      var res = await analyzeTicker(t);
      if (res.error) {
        errors.push({ ticker: t, error: res.error });
      } else {
        results.push(res);
      }
    } catch (err) {
      errors.push({ ticker: t, error: err && err.message ? String(err.message) : String(err) });
    }
  }

  if (results.length === 0) return { error: 'No tickers could be analyzed.', details: errors };

  // Sort by score descending
  results.sort(function(a, b) { return b.score - a.score; });

  // Build ranking
  var ranking = [];
  for (var r = 0; r < results.length; r++) {
    var rankObj = {
      rank: r + 1,
      ticker: results[r].ticker,
      entityName: results[r].entityName,
      score: results[r].score,
      rating: results[r].rating,
      confidence: results[r].confidence,
    };

    if (r === 0) {
      rankObj.comment = 'Highest fundamental score — strongest combination of quality, balance sheet safety, and cash flow.';
    } else {
      var gap = results[0].score - results[r].score;
      rankObj.scoreGap = gap;
      rankObj.comment = (gap <= 3 ? 'Close to #1 — check valuation and confidence for tie-breaking.'
        : gap <= 10 ? 'Moderate gap to #1 — quality or balance sheet differences likely.'
        : results[r].score >= 65 ? 'Decent fundamentals but meaningful gap to leader.' : 'Fundamentals are weak relative to peers.');
    }
    ranking.push(rankObj);
  }

  return {
    type: 'peer-comparison',
    count: results.length,
    ranking: ranking,
    results: results,
    errors: errors.length ? errors : undefined,
  };
}

/**
 * Format analysis result as a human-readable markdown string.
 * This is what the AI can present to users.
 */
function formatAnalysis(result) {
  if (result.error) return '❌ ' + result.error;

  var lines = [];

  // Peer comparison mode
  if (result.type === 'peer-comparison') {
    lines.push('## Peer Ranking\n');
    var ranking = result.ranking || [];
    for (var ri = 0; ri < ranking.length; ri++) {
      var r = ranking[ri];
      var badge = '';
      if (r.rank === 1) badge = ' 🥇';
      else if (r.rank === 2) badge = ' 🥈';
      else if (r.rank === 3) badge = ' 🥉';
      lines.push(r.rank + '. **' + r.ticker + '** (' + r.entityName + ') — ' + r.score + '/100' + badge);
      lines.push('   Rating: ' + r.rating + ' | Confidence: ' + r.confidence + (r.scoreGap !== undefined ? ' | Gap to #1: ' + r.scoreGap + ' pts' : ''));
      lines.push('   ' + r.comment);
      lines.push('');
    }

    // Best pick
    if (ranking.length > 0) {
      lines.push('### Best Pick: ' + ranking[0].ticker);
      lines.push('Score: ' + ranking[0].score + '/100 (' + ranking[0].rating + ', ' + ranking[0].confidence + ' confidence)');
      lines.push('');
    }

    // Individual analyses
    for (var ai = 0; ai < result.results.length; ai++) {
      lines.push(formatSingleAnalysis(result.results[ai]));
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Errors
    if (result.errors && result.errors.length > 0) {
      lines.push('### Errors');
      for (var ei = 0; ei < result.errors.length; ei++) {
        lines.push('- ' + result.errors[ei].ticker + ': ' + result.errors[ei].error);
      }
    }
  } else {
    // Single ticker analysis
    lines.push(formatSingleAnalysis(result));
  }

  return lines.join('\n');
}

/**
 * Format a single ticker analysis result.
 */
function formatSingleAnalysis(r) {
  var lines = [];

  lines.push('## ' + r.ticker + ' — Fundamental Verdict');
  lines.push('');
  var cikInfo = r.cik && r.cik !== 0 ? ' (CIK: ' + r.cik + ')' : ' (via Yahoo Finance)';
  lines.push('- **Entity:** ' + r.entityName + cikInfo);
  var verdict;
  if (r.score >= 75) verdict = 'Bullish';
  else if (r.score >= 65) verdict = 'Neutral';
  else verdict = 'Bearish';
  lines.push('- **Verdict:** ' + verdict);
  lines.push('- **Score:** ' + r.score + '/100');
  lines.push('- **Rating:** ' + r.rating);
  lines.push('- **Confidence:** ' + r.confidence);
  if (r.dataDate) lines.push('- **Data as of:** ' + r.dataDate.slice(0, 10));

  lines.push('');

  var sb = r.scoreBreakdown || {};
  lines.push('### Score Breakdown (100 pts, blend)');
  lines.push('| Category | Score | Max |');
  lines.push('|----------|-------|-----|');
  lines.push('| Business Quality | ' + sb.quality + ' | 30 |');
  lines.push('| Balance Sheet & Solvency | ' + sb.balanceSheet + ' | 25 |');
  lines.push('| Cash-Flow Strength | ' + sb.cashFlow + ' | 20 |');
  lines.push('| Valuation | ' + sb.valuation + ' | 20 |');
  lines.push('| Capital Allocation | ' + sb.capitalAllocation + ' | 5 |');

  lines.push('');
  lines.push('### Key Metrics');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push('| Revenue | ' + fmtNum(r.revenue) + ' |');
  if (r.netIncome !== null) lines.push('| Net Income | ' + fmtNum(r.netIncome) + ' |');
  if (r.epsDiluted !== null) lines.push('| EPS (Diluted) | $' + (r.epsDiluted || 0).toFixed(2) + ' |');
  if (r.totalAssets !== null) lines.push('| Total Assets | ' + fmtNum(r.totalAssets) + ' |');
  if (r.shareholdersEquity !== null) lines.push('| Shareholders\' Equity | ' + fmtNum(r.shareholdersEquity) + ' |');
  if (r.cash !== null) lines.push('| Cash & Equivalents | ' + fmtNum(r.cash) + ' |');
  if (r.totalDebt !== null) lines.push('| Total Debt | ' + fmtNum(r.totalDebt) + ' |');
  if (r.freeCashFlow !== null) lines.push('| Free Cash Flow | ' + fmtNum(r.freeCashFlow) + ' |');

  lines.push('');
  lines.push('### Ratios');
  lines.push('| Ratio | Value |');
  lines.push('|-------|-------|');
  if (r.grossMargin !== null) lines.push('| Gross Margin | ' + fmtPct(r.grossMargin) + ' |');
  if (r.operatingMargin !== null) lines.push('| Operating Margin | ' + fmtPct(r.operatingMargin) + ' |');
  if (r.netMargin !== null) lines.push('| Net Margin | ' + fmtPct(r.netMargin) + ' |');
  if (r.roe !== null) lines.push('| ROE | ' + fmtPct(r.roe) + ' |');
  if (r.roic !== null) lines.push('| ROIC | ' + fmtPct(r.roic) + ' |');
  if (r.currentRatio !== null) lines.push('| Current Ratio | ' + r.currentRatio.toFixed(2) + ' |');
  if (r.debtToEquity !== null) lines.push('| Debt/Equity | ' + r.debtToEquity.toFixed(2) + ' |');
  if (r.interestCoverage !== null) lines.push('| Interest Coverage | ' + r.interestCoverage.toFixed(1) + 'x |');
  if (r.fcfMargin !== null) lines.push('| FCF Margin | ' + fmtPct(r.fcfMargin) + ' |');

  if (r.revenueCagr5 !== null || r.epsCagr5 !== null) {
    lines.push('');
    lines.push('### Growth');
    if (r.revenueCagr5 !== null) lines.push('- **Revenue CAGR (5Y):** ' + fmtPct(r.revenueCagr5));
    if (r.epsCagr5 !== null) lines.push('- **EPS CAGR (5Y):** ' + fmtPct(r.epsCagr5));
    if (r.epsLossYears !== null) lines.push('- **Loss years (10Y):** ' + r.epsLossYears);
    if (r.ocfCagr5 !== null) lines.push('- **OCF CAGR (5Y):** ' + fmtPct(r.ocfCagr5));
  }

  // Market Data — from Yahoo Finance, real-time
  if (r.price !== null) {
    lines.push('');
    lines.push('### Market Data (Yahoo Finance)');
    if (r.price !== null) {
      var priceLine = '| **Price** | $' + r.price.toFixed(2);
      if (r.currency && r.currency !== 'USD') priceLine += ' ' + r.currency;
      if (r.priceChange !== null && r.priceChange !== undefined) {
        var sign = r.priceChange >= 0 ? '+' : '';
        priceLine += ' (' + sign + r.priceChange.toFixed(2) + '% vs prev close)';
      }
      priceLine += ' |';
      lines.push('| Metric | Value |');
      lines.push('|--------|-------|');
      lines.push(priceLine);
    }
    if (r.marketCap !== null) lines.push('| Market Cap | ' + fmtNum(r.marketCap) + ' |');
    if (r.fiftyTwoWeekHigh !== null) lines.push('| 52-Week High | $' + r.fiftyTwoWeekHigh.toFixed(2) + ' |');
    if (r.fiftyTwoWeekLow !== null) lines.push('| 52-Week Low | $' + r.fiftyTwoWeekLow.toFixed(2) + ' |');
    if (r.peRatio !== null) lines.push('| P/E (Price/Earnings) | ' + r.peRatio.toFixed(1) + 'x |');
    if (r.psRatio !== null) lines.push('| P/S (Price/Sales) | ' + r.psRatio.toFixed(1) + 'x |');
    if (r.regularMarketVolume !== null) {
      var vol = r.regularMarketVolume;
      var volStr = vol > 1e6 ? (vol/1e6).toFixed(1) + 'M' : vol > 1e3 ? (vol/1e3).toFixed(1) + 'K' : String(vol);
      lines.push('| Volume (today) | ' + volStr + ' |');
    }
    if (r.exchange) lines.push('| Exchange | ' + r.exchange + ' |');
    if (r.priceAsOf) lines.push('| Price as of | ' + r.priceAsOf + ' |');
  }

  lines.push('');
  lines.push('### Data Quality');
  lines.push('- Fundamental coverage: ' + r.coverage + '% of core metrics');
  lines.push('- Conflicts: ' + r.conflictCount);
  lines.push('- Confidence: ' + r.confidence);
  if (r.framesUsed && r.framesUsed.length > 0) {
    var fuList = r.framesUsed.map(function(f) { return f.fact + ' (CY' + f.year + ')'; }).join(', ');
    lines.push('- Frames fallback used for: ' + fuList);
  }

  lines.push('');
  lines.push('> Fundamentals: ' + (r.dataSource || 'Yahoo Finance') + ' (current data). Price/market data: Yahoo Finance (real-time).');
  lines.push('> Confidence is auto-capped when fundamental data is stale or coverage is low.');
  lines.push('> This is educational/informational content, not investment advice.');

  return lines.join('\n');
}

// ─── 2. HANDLER ────────────────────────────────────────────────────────────────
async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ─── 3. EXPORTS ───────────────────────────────────────────────────────────────
var fundApi = {
  handler: handler,
  runFromParams: runFromParams,
  lookupTicker: lookupTicker,
  fetchCompanyData: fetchCompanyData,
  fetchYahooFundamentals: fetchYahooFundamentals,
  analyzeTicker: analyzeTicker,
  compareTickers: compareTickers,
  formatAnalysis: formatAnalysis,
};

if (typeof module !== 'undefined' && module.exports) { module.exports = fundApi; }
if (typeof globalThis !== 'undefined') { globalThis.fundamentalStock = fundApi; }

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
  var out = { ticker: undefined, action: undefined, tickers: undefined };
  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--ticker' || t === '-t') && i + 1 < tokens.length) {
      out.ticker = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--action' || t === '-a') && i + 1 < tokens.length) {
      out.action = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--tickers') && i + 1 < tokens.length) {
      out.tickers = tokens[i + 1]; i += 2; continue;
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
  var action = params.action || 'analyze';
  var tickersStr = params.tickers || params.symbols || '';

  if (!ticker && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.ticker) ticker = parsed.ticker;
    if (parsed.action) action = parsed.action;
    if (parsed.tickers) tickersStr = parsed.tickers;
  }

  // No ticker at all — show usage
  if (!ticker && !tickersStr) {
    return 'Usage: fundamentalStock.analyzeTicker("AAPL") — analyze a single ticker\n' +
           '       fundamentalStock.compareTickers("AAPL,MSFT,GOOGL") — compare peers\n' +
           'Cmd:  run /skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js --ticker AAPL\n' +
           '      run /skills/fundamental-stock-analysis/scripts/fundamental-stock-analysis.js --tickers AAPL,MSFT,GOOGL';
  }

  try {
    if (action === 'compare' || tickersStr) {
      var tickersList = tickersStr ? tickersStr.split(/[,;\s]+/).filter(Boolean) : ticker.split(/[,;\s]+/).filter(Boolean);
      if (tickersList.length < 2) tickersList = [ticker, tickersStr].filter(Boolean);
      var compareResult = await compareTickers(tickersList);
      return formatAnalysis(compareResult);
    }

    // Analyze single ticker
    var result = await analyzeTicker(ticker);
    if (result.error) return result;

    return formatAnalysis(result);
  } catch (err) {
    return { error: 'Analysis failed: ' + (err && err.message ? err.message : String(err)) };
  }
}

// ─── 6. Node.js CLI entry (local dev only — never fires on device) ────────────
if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ─── 7. PARAMS auto-run block — device /cmd path ONLY ────────────────────────
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
