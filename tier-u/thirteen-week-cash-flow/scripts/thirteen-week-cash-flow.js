// thirteen-week-cash-flow.js — 13-week rolling cash flow forecast v1.0
// Local compute: week-by-week cash receipts & disbursements, variance tracking, borrowing base, covenants.
// No API key required. Pure treasury/finance math.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

// Week day names for labeling
var WEEK_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getWeekLabel(weekNum, startDate) {
  var d = startDate ? new Date(startDate) : new Date();
  d.setDate(d.getDate() + (weekNum - 1) * 7);
  return 'W' + weekNum + ' (' + d.toISOString().substring(5, 10) + ')';
}

/**
 * Build a 13-week cash flow forecast.
 * @param {object} input — { openingCash, weeklyReceipts, weeklyDisbursements, arCollections, apPayments, payroll, rent, debtService, capex, otherInflows, otherOutflows }
 */
function buildForecast(input) {
  var i = input || {};
  var openingCash = i.openingCash || 0;
  var weeks = 13;
  var startDate = i.startDate || new Date().toISOString().substring(0, 10);

  // Weekly data arrays (can be custom per week, or single value repeated)
  var receipts = normalizeArray(i.weeklyReceipts || i.receipts || 0, weeks);
  var disbursements = normalizeArray(i.weeklyDisbursements || i.disbursements || 0, weeks);
  var payroll = normalizeArray(i.payroll || 0, weeks);
  var rent = normalizeArray(i.rent || 0, weeks);
  var debtService = normalizeArray(i.debtService || 0, weeks);
  var capex = normalizeArray(i.capex || 0, weeks);
  var otherIn = normalizeArray(i.otherInflows || 0, weeks);
  var otherOut = normalizeArray(i.otherOutflows || 0, weeks);

  var weekly = [];
  var cash = openingCash;
  var totalReceipts = 0, totalDisbursements = 0;
  var minCash = cash, maxCash = cash;
  var minCashWeek = 0, maxCashWeek = 0;

  for (var w = 0; w < weeks; w++) {
    var weekNum = w + 1;
    var totalIn = (Array.isArray(receipts) ? receipts[w] : receipts)
                + (Array.isArray(otherIn) ? otherIn[w] : otherIn);
    var totalOut = (Array.isArray(disbursements) ? disbursements[w] : disbursements)
                 + (Array.isArray(payroll) ? payroll[w] : payroll)
                 + (Array.isArray(rent) ? rent[w] : rent)
                 + (Array.isArray(debtService) ? debtService[w] : debtService)
                 + (Array.isArray(capex) ? capex[w] : capex)
                 + (Array.isArray(otherOut) ? otherOut[w] : otherOut);

    var netFlow = totalIn - totalOut;
    var endingCash = cash + netFlow;

    var entry = {
      week: weekNum,
      label: getWeekLabel(weekNum, startDate),
      openingCash: Math.round(cash),
      receipts: Math.round(totalIn),
      disbursements: Math.round(totalOut),
      netFlow: Math.round(netFlow),
      endingCash: Math.round(endingCash)
    };

    weekly.push(entry);
    totalReceipts += totalIn;
    totalDisbursements += totalOut;

    if (endingCash < minCash) { minCash = endingCash; minCashWeek = weekNum; }
    if (endingCash > maxCash) { maxCash = endingCash; maxCashWeek = weekNum; }

    cash = endingCash;
  }

  // Calculate key metrics
  var netChange = cash - openingCash;
  var avgWeeklyBurn = 0;
  var burnWeeks = 0;
  for (w = 0; w < weekly.length; w++) {
    if (weekly[w].netFlow < 0) { avgWeeklyBurn += Math.abs(weekly[w].netFlow); burnWeeks++; }
  }
  avgWeeklyBurn = burnWeeks > 0 ? avgWeeklyBurn / burnWeeks : 0;

  // Borrowing base (simplified: 80% of AR)
  var ar = i.accountsReceivable || 0;
  var borrowingBase = ar * ((i.advanceRate || 80) / 100);
  var availability = borrowingBase - (i.outstandingLoan || 0);

  return {
    weekly: weekly,
    summary: {
      openingCash: Math.round(openingCash),
      endingCash: Math.round(cash),
      netChange: Math.round(netChange),
      totalReceipts: Math.round(totalReceipts),
      totalDisbursements: Math.round(totalDisbursements),
      minCash: Math.round(minCash),
      minCashWeek: minCashWeek,
      maxCash: Math.round(maxCash),
      maxCashWeek: maxCashWeek,
      avgWeeklyBurn: Math.round(avgWeeklyBurn),
      weeksOfCash: avgWeeklyBurn > 0 ? (cash / avgWeeklyBurn) : Infinity,
      borrowingBase: Math.round(borrowingBase),
      availability: Math.round(availability)
    }
  };
}

/**
 * Track variances: compare forecast to actuals.
 */
function trackVariance(forecast, actuals) {
  var variances = [];
  for (var w = 0; w < forecast.weekly.length; w++) {
    var f = forecast.weekly[w];
    var a = (actuals && actuals[w]) || {};
    var endingCashActual = a.endingCash !== undefined ? a.endingCash : f.endingCash;
    var variance = endingCashActual - f.endingCash;
    variances.push({
      week: f.week, label: f.label,
      forecast: f.endingCash, actual: Math.round(endingCashActual),
      variance: Math.round(variance),
      variancePct: f.endingCash !== 0 ? (variance / Math.abs(f.endingCash) * 100).toFixed(1) : '0.0',
      status: variance >= 0 ? '✓ Favorable' : '⚠ Unfavorable'
    });
  }
  return variances;
}

/**
 * Check covenant compliance.
 */
function checkCovenants(forecast, covenants) {
  var c = covenants || {};
  var results = [];
  var sum = forecast.summary;

  if (c.minCash) {
    var minOk = sum.minCash >= c.minCash;
    results.push({ covenant: 'Minimum Cash > ' + fmtMoney(c.minCash), actual: fmtMoney(sum.minCash), status: minOk ? '✓ OK' : '⚠ BREACH' });
  }
  if (c.minLiquidity) {
    var liqOk = sum.endingCash >= c.minLiquidity;
    results.push({ covenant: 'Minimum Liquidity > ' + fmtMoney(c.minLiquidity), actual: fmtMoney(sum.endingCash), status: liqOk ? '✓ OK' : '⚠ BREACH' });
  }
  if (c.maxLeverage && sum.endingCash) {
    var lev = 0; // simplified
    results.push({ covenant: 'Max Leverage < ' + c.maxLeverage.toFixed(1) + 'x', actual: '—', status: 'ℹ Monitor' });
  }

  return results;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalizeArray(val, weeks) {
  if (Array.isArray(val)) {
    var arr = val.slice(0, weeks);
    while (arr.length < weeks) arr.push(val[val.length - 1] || 0);
    return arr;
  }
  return val;
}

function fmtMoney(val) {
  if (val === null || val === undefined) return '—';
  var abs = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K';
  return sign + '$' + abs.toFixed(0);
}

// ─── FORMATTERS ───────────────────────────────────────────────────────────────

function formatForecast(forecast, title) {
  var lines = [];
  title = title || '13-Week Cash Flow Forecast';

  lines.push('# ' + title);
  lines.push('');

  // Weekly detail table
  lines.push('## Weekly Cash Flow');
  lines.push('');
  lines.push('| Week | Opening | Receipts | Disbursements | Net Flow | Ending Cash |');
  lines.push('|------|---------|----------|---------------|----------|-------------|');

  for (var w = 0; w < forecast.weekly.length; w++) {
    var e = forecast.weekly[w];
    lines.push('| ' + e.label + ' | ' + fmtMoney(e.openingCash) + ' | ' + fmtMoney(e.receipts) + ' | ' + fmtMoney(e.disbursements) + ' | ' + (e.netFlow >= 0 ? '+' : '') + fmtMoney(e.netFlow) + ' | ' + fmtMoney(e.endingCash) + ' |');
  }
  lines.push('');

  // Summary
  var s = forecast.summary;
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push('| Opening Cash | ' + fmtMoney(s.openingCash) + ' |');
  lines.push('| Ending Cash | ' + fmtMoney(s.endingCash) + ' |');
  lines.push('| Net Change | ' + (s.netChange >= 0 ? '+' : '') + fmtMoney(s.netChange) + ' |');
  lines.push('| Total Receipts | ' + fmtMoney(s.totalReceipts) + ' |');
  lines.push('| Total Disbursements | ' + fmtMoney(s.totalDisbursements) + ' |');
  lines.push('| Min Cash (W' + s.minCashWeek + ') | ' + fmtMoney(s.minCash) + ' |');
  lines.push('| Max Cash (W' + s.maxCashWeek + ') | ' + fmtMoney(s.maxCash) + ' |');

  if (s.avgWeeklyBurn > 0) {
    lines.push('| Avg Weekly Burn | ' + fmtMoney(s.avgWeeklyBurn) + ' |');
    var weeksCash = s.weeksOfCash;
    lines.push('| Weeks of Cash | ' + (weeksCash === Infinity ? '∞ (no burn)' : weeksCash.toFixed(1)) + ' |');
  }

  if (s.borrowingBase > 0) {
    lines.push('| Borrowing Base | ' + fmtMoney(s.borrowingBase) + ' |');
    lines.push('| Availability | ' + fmtMoney(s.availability) + ' |');
  }
  lines.push('');

  // Cash flow chart (ASCII)
  lines.push('## Cash Balance Trend');
  lines.push('');
  lines.push('```');
  var maxVal = Math.max(Math.abs(s.maxCash), Math.abs(s.minCash), 1);
  var chartWidth = 60;
  for (w = 0; w < forecast.weekly.length; w++) {
    e = forecast.weekly[w];
    var bar = '';
    if (e.endingCash >= 0) {
      var len = Math.round((e.endingCash / maxVal) * chartWidth);
      bar = ' '.repeat(Math.min(chartWidth, Math.max(1, len))) + '█';
    } else {
      len = Math.round((Math.abs(e.endingCash) / maxVal) * chartWidth);
      bar = '█' + ' '.repeat(Math.min(chartWidth, Math.max(1, len)));
    }
    lines.push('W' + String(e.week).padStart(2, ' ') + ' ' + fmtMoney(e.endingCash).padStart(8) + ' |' + bar);
  }
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function formatVariance(variances) {
  var lines = [];
  lines.push('## Variance Analysis');
  lines.push('');
  lines.push('| Week | Forecast | Actual | Variance | % | Status |');
  lines.push('|------|----------|--------|----------|---|--------|');

  for (var i = 0; i < variances.length; i++) {
    var v = variances[i];
    lines.push('| ' + v.label + ' | ' + fmtMoney(v.forecast) + ' | ' + fmtMoney(v.actual) + ' | ' + (v.variance >= 0 ? '+' : '') + fmtMoney(v.variance) + ' | ' + v.variancePct + '% | ' + v.status + ' |');
  }
  lines.push('');
  return lines.join('\n');
}

// ─── 2. HANDLER ───────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || (typeof PARAMS !== 'undefined' ? PARAMS : {});
  return await runFromParams(params);
}

// ─── 3. EXPORTS ───────────────────────────────────────────────────────────────

var skillApi = {
  handler, runFromParams, parseCommand,
  buildForecast, trackVariance, checkCovenants,
  formatForecast, formatVariance, fmtMoney
};

if (typeof module !== 'undefined' && module.exports) module.exports = skillApi;
if (typeof globalThis !== 'undefined') globalThis.thirteenWeekCashFlow = skillApi;

// ─── 4. CMD PARSING ───────────────────────────────────────────────────────────

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQ = false, q = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQ) { if (ch === q) { inQ = false; q = ''; if (cur) tokens.push(cur); cur = ''; } else cur += ch; }
    else { if (ch === '"' || ch === "'") { inQ = true; q = ch; if (cur) { tokens.push(cur); cur = ''; } } else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } } else cur += ch; }
    i++;
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
    if (t === '--action' && i + 1 < tokens.length) { out.action = tokens[i + 1]; i += 2; continue; }
    if (t === '--cash' && i + 1 < tokens.length) { out.openingCash = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--receipts' && i + 1 < tokens.length) { out.weeklyReceipts = tokens[i + 1].split(',').map(Number); i += 2; continue; }
    if (t === '--disbursements' && i + 1 < tokens.length) { out.weeklyDisbursements = tokens[i + 1].split(',').map(Number); i += 2; continue; }
    if (t === '--payroll' && i + 1 < tokens.length) { out.payroll = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--rent' && i + 1 < tokens.length) { out.rent = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--debt' && i + 1 < tokens.length) { out.debtService = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--capex' && i + 1 < tokens.length) {
      var cx = tokens[i + 1].split(',').map(Number);
      out.capex = cx.length === 1 ? cx[0] : cx;
      i += 2; continue;
    }
    if (t === '--ar' && i + 1 < tokens.length) { out.accountsReceivable = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--loan' && i + 1 < tokens.length) { out.outstandingLoan = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    i++;
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
  if (params.command) Object.assign(params, parseCommand(params.command));

  var defaults = {
    openingCash: 100000,
    weeklyReceipts: 50000,
    weeklyDisbursements: 20000,
    payroll: 15000,
    rent: 5000,
    debtService: 0,
    capex: 0
  };
  for (var key in defaults) {
    if (!defaults.hasOwnProperty(key)) continue;
    if (!(key in params)) params[key] = defaults[key];
  }

  try {
    var forecast = buildForecast(params);
    var result = formatForecast(forecast);

    // Add covenants if loan/AR specified
    if (params.accountsReceivable || params.outstandingLoan) {
      result += '\n## Borrowing Base\n\n';
      result += '| Metric | Value |\n|--------|-------|\n';
      result += '| Accounts Receivable | ' + fmtMoney(params.accountsReceivable || 0) + ' |\n';
      result += '| Advance Rate | ' + (params.advanceRate || 80) + '% |\n';
      result += '| Borrowing Base | ' + fmtMoney(forecast.summary.borrowingBase) + ' |\n';
      result += '| Outstanding Loan | ' + fmtMoney(params.outstandingLoan || 0) + ' |\n';
      result += '| Availability | ' + fmtMoney(forecast.summary.availability) + ' |\n\n';
    }

    if (params.covenants) {
      var covenants = typeof params.covenants === 'string' ? JSON.parse(params.covenants) : params.covenants;
      var covResults = checkCovenants(forecast, covenants);
      result += '## Covenant Checks\n\n| Covenant | Actual | Status |\n|----------|--------|--------|\n';
      for (var c = 0; c < covResults.length; c++) {
        result += '| ' + covResults[c].covenant + ' | ' + covResults[c].actual + ' | ' + covResults[c].status + ' |\n';
      }
      result += '\n';
    }

    return result;
  } catch (err) {
    return { error: 'Forecast failed: ' + (err && err.message ? err.message : String(err)) };
  }
}

// ─── 6. Node.js CLI ───────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(r) { console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 2)); })
    .catch(function(e) { console.error(e.message); process.exitCode = 1; });
}

// ─── 7. PARAMS auto-run ───────────────────────────────────────────────────────

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') console.log(result);
      else console.log(JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
