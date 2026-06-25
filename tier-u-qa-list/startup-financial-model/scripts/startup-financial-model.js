// startup-financial-model.js — 3-statement startup financial model v1.1
// Local compute: P&L, Balance Sheet, Cash Flow, burn/runway, scenario analysis.
// No API key required. Pure financial math.
// Template-compliant: LOGIC → HANDLER → EXPORTS → CMD_PARSING → runFromParams → Node CLI → PARAMS

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

/**
 * Build a revenue forecast based on business type.
 * @param {object} input — { businessType, currentMRR, monthlyGrowthPct, churnRate, newCustomersPerMonth, arpu, months }
 */
function forecastRevenue(input) {
  var i = input || {};
  var type = i.businessType || 'saas';
  var months = i.months || 36;
  var revenue = [];
  var mrr = i.currentMRR || 0;
  var growthPct = (i.monthlyGrowthPct || i.growthPct || 0) / 100;
  var churn = (i.churnRate || 0) / 100;
  var newCust = i.newCustomersPerMonth || 0;
  var arpu = i.arpu || 0;
  var seasonality = i.seasonality || [];
  var totalRevenue = 0;

  for (var m = 0; m < months; m++) {
    var monthNum = m + 1;
    var rev = 0;

    if (type === 'saas' || type === 'subscription') {
      var newMRR = newCust * arpu;
      var churnedMRR = mrr * churn;
      var expansionMRR = i.expansionRate ? mrr * (i.expansionRate / 100) : 0;
      mrr = mrr + newMRR + expansionMRR - churnedMRR;
      if (mrr < 0) mrr = 0;
      rev = mrr;
    } else if (type === 'marketplace') {
      var gmv = (i.initialGMV || 0) * Math.pow(1 + growthPct, m);
      rev = gmv * ((i.takeRate || 0) / 100);
    } else if (type === 'services' || type === 'agency') {
      var fte = i.headcount || 0;
      var utilization = i.utilization || 80;
      var billableHours = fte * (utilization / 100) * 160; // 160 hrs/mo
      rev = billableHours * (i.hourlyRate || 0);
      if (i.headcountGrowth) fte *= 1 + (i.headcountGrowth / 100);
    } else if (type === 'ecommerce') {
      var orders = (i.initialOrders || 0) * Math.pow(1 + growthPct, m);
      rev = orders * (i.aov || 0);
    } else {
      rev = (i.initialRevenue || 0) * Math.pow(1 + growthPct, m);
    }

    // Apply seasonality
    var seasonalFactor = 1.0;
    if (seasonality && seasonality.length > 0) {
      seasonalFactor = seasonality[monthNum % 12] || 1.0;
    }
    rev *= seasonalFactor;

    revenue.push({
      month: monthNum,
      year: Math.floor((monthNum - 1) / 12) + 1,
      label: 'M' + monthNum,
      revenue: Math.round(rev),
      mrr: type === 'saas' ? Math.round(mrr) : undefined
    });
    totalRevenue += rev;
  }

  return { monthly: revenue, totalRevenue: Math.round(totalRevenue), type: type, months: months };
}

/**
 * Build the expense (P&L) model.
 */
function buildPandL(input) {
  var i = input || {};
  var months = i.months || 36;
  var revenue = forecastRevenue(i);

  // COGS assumptions
  var cogsVarPct = (i.cogsVariablePct || 0) / 100;     // e.g. hosting, processing
  var cogsFixed = i.cogsFixed || 0;                      // e.g. minimum infrastructure

  // OpEx assumptions
  var salesMarketing = i.salesMarketing || 0;            // monthly
  var rd = i.rd || 0;                                    // monthly (engineering)
  var ga = i.ga || 0;                                    // monthly (G&A)
  var otherOpex = i.otherOpex || 0;

  // Headcount-based growth for OpEx
  var smGrowth = i.smMonthlyGrowth || 0;                 // e.g. 5 = 5%/mo
  var rdGrowth = i.rdMonthlyGrowth || 0;
  var gaGrowth = i.gaMonthlyGrowth || 0;

  var monthly = [];
  var totalGrossProfit = 0, totalOpex = 0, totalNetIncome = 0;

  for (var m = 0; m < months; m++) {
    var monthNum = m + 1;
    var rev = revenue.monthly[m].revenue;
    var cogs = cogsFixed + rev * cogsVarPct;
    var grossProfit = rev - cogs;

    var sm = salesMarketing * Math.pow(1 + smGrowth / 100, m);
    var rdCost = rd * Math.pow(1 + rdGrowth / 100, m);
    var gaCost = ga * Math.pow(1 + gaGrowth / 100, m);
    var totalMonthlyOpex = sm + rdCost + gaCost + otherOpex;

    var ebitda = grossProfit - totalMonthlyOpex;
    var depreciation = (i.monthlyDepreciation || 0);
    var operatingIncome = ebitda - depreciation;
    var interestExpense = (i.monthlyInterest || 0);
    var taxRate = i.taxRate ? i.taxRate / 100 : 0;
    var pretaxIncome = operatingIncome - interestExpense;
    var tax = pretaxIncome > 0 ? pretaxIncome * taxRate : 0;
    var netIncome = pretaxIncome - tax;

    monthly.push({
      month: monthNum, label: 'M' + monthNum,
      revenue: Math.round(rev), cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit), grossMargin: rev > 0 ? (grossProfit / rev * 100).toFixed(1) : '0.0',
      sm: Math.round(sm), rd: Math.round(rdCost), ga: Math.round(gaCost),
      totalOpex: Math.round(totalMonthlyOpex),
      ebitda: Math.round(ebitda), ebitdaMargin: rev > 0 ? (ebitda / rev * 100).toFixed(1) : '0.0',
      operatingIncome: Math.round(operatingIncome),
      netIncome: Math.round(netIncome), netMargin: rev > 0 ? (netIncome / rev * 100).toFixed(1) : '0.0'
    });

    totalGrossProfit += grossProfit;
    totalOpex += totalMonthlyOpex;
    totalNetIncome += netIncome;
  }

  return {
    revenue: revenue,
    monthly: monthly,
    summary: {
      totalRevenue: revenue.totalRevenue,
      totalGrossProfit: Math.round(totalGrossProfit),
      totalOpex: Math.round(totalOpex),
      totalNetIncome: Math.round(totalNetIncome),
      overallMargin: revenue.totalRevenue > 0 ? (totalNetIncome / revenue.totalRevenue * 100).toFixed(1) : '0.0'
    }
  };
}

/**
 * Simplified balance sheet projections.
 */
function projectBalanceSheet(pl, assumptions) {
  var a = assumptions || {};
  var months = pl.revenue.months;
  var startingCash = a.startingCash || 0;
  var startingDebt = a.startingDebt || 0;
  var startingEquity = a.startingEquity || startingCash; // simple: equity = initial funding
  var accountsReceivableDays = a.arDays || 30;
  var accountsPayableDays = a.apDays || 30;

  var cash = startingCash;
  var debt = startingDebt;
  var cumulativeNetIncome = 0;
  var monthly = [];

  for (var m = 0; m < months; m++) {
    var rev = pl.revenue.monthly[m].revenue;
    var ni = pl.monthly[m].netIncome;
    cumulativeNetIncome += ni;

    // Simple AR/AP
    var ar = rev * (accountsReceivableDays / 30);
    var ap = pl.monthly[m].cogs * (accountsPayableDays / 30);

    // Cash flow: net income + back out non-cash
    var operatingCF = ni + (a.monthlyDepreciation || 0) - (ar - (m > 0 ? pl.revenue.monthly[m-1].revenue * (accountsReceivableDays / 30) : 0));

    // Investing (CapEx)
    var capex = a.monthlyCapex || 0;

    // Financing
    var newDebt = a.newDebtMonthly || 0;
    var debtRepayment = a.debtRepaymentMonthly || 0;
    var newEquity = a.newEquityMonthly || 0;

    var netCF = operatingCF - capex - debtRepayment + newDebt + newEquity;
    cash += netCF;
    debt = debt + newDebt - debtRepayment;

    monthly.push({
      month: m + 1, label: 'M' + (m + 1),
      revenue: Math.round(rev),
      cogs: pl.monthly[m].cogs,
      grossProfit: pl.monthly[m].grossProfit,
      totalOpex: pl.monthly[m].totalOpex,
      netIncome: ni,
      cash: Math.round(cash),
      ar: Math.round(ar), ap: Math.round(ap),
      debt: Math.round(Math.max(0, debt)),
      operatingCF: Math.round(operatingCF),
      investingCF: Math.round(-capex),
      financingCF: Math.round(newDebt + newEquity - debtRepayment),
      netCF: Math.round(netCF)
    });
  }

  return {
    monthly: monthly,
    endingCash: Math.round(cash),
    endingDebt: Math.round(Math.max(0, debt)),
    cumulativeNetIncome: Math.round(cumulativeNetIncome)
  };
}

/**
 * Calculate burn rate and runway.
 */
function calculateRunway(cashBalance, monthlyBurn) {
  if (monthlyBurn <= 0) return { runwayMonths: Infinity, runwayMonthsFormatted: '∞ (profitable)', status: 'Profitable', burnRate: 0 };
  var runway = cashBalance / monthlyBurn;
  var status;
  if (runway > 18) status = 'Comfortable';
  else if (runway > 12) status = 'Adequate';
  else if (runway > 6) status = '⚠ Monitor';
  else if (runway > 3) status = '⚠ Raise soon';
  else status = '🔴 Critical';
  return {
    runwayMonths: runway,
    runwayMonthsFormatted: runway.toFixed(1) + ' months',
    status: status,
    burnRate: Math.round(monthlyBurn),
    monthlyBurnFormatted: '$' + Math.round(monthlyBurn).toLocaleString() + '/mo'
  };
}

/**
 * Run scenario analysis (base, bull, bear).
 */
function runScenarios(input, multipliers) {
  var m = multipliers || { base: 1.0, bull: 1.3, bear: 0.7 };
  var scenarios = {};

  for (var key in m) {
    if (!m.hasOwnProperty(key)) continue;
    var s = JSON.parse(JSON.stringify(input));
    s.monthlyGrowthPct = (input.monthlyGrowthPct || 0) * m[key];
    s.newCustomersPerMonth = Math.round((input.newCustomersPerMonth || 0) * m[key]);
    s.currentMRR = input.currentMRR || 0;
    var pl = buildPandL(s);
    var bs = projectBalanceSheet(pl, s);
    var lastMonth = pl.monthly[pl.monthly.length - 1];
    var avgBurn = 0;
    var burnMonths = 0;
    for (var i = 0; i < pl.monthly.length; i++) {
      if (pl.monthly[i].netIncome < 0) {
        avgBurn += Math.abs(pl.monthly[i].netIncome);
        burnMonths++;
      }
    }
    avgBurn = burnMonths > 0 ? avgBurn / burnMonths : 0;
    var runway = calculateRunway(bs.monthly[bs.monthly.length - 1].cash, avgBurn);

    scenarios[key] = {
      multiplier: m[key],
      endingMonthlyRevenue: lastMonth.revenue,
      endingMonthlyNetIncome: lastMonth.netIncome,
      endingCash: bs.endingCash,
      totalRevenue: pl.summary.totalRevenue,
      totalNetIncome: pl.summary.totalNetIncome,
      overallMargin: pl.summary.overallMargin,
      runway: runway,
      monthly: pl.monthly,
      balanceSheet: bs.monthly
    };
  }

  return scenarios;
}

// ─── FORMATTERS ───────────────────────────────────────────────────────────────

function fmtMoney(val) {
  if (val === null || val === undefined) return '—';
  var abs = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K';
  return sign + '$' + abs.toFixed(0);
}

function formatMonthlyRows(monthly, cols, maxRows) {
  var lines = [];
  maxRows = maxRows || 12;
  var show = monthly.slice(0, Math.min(maxRows, monthly.length));

  // Header
  var header = '| Month |';
  for (var c = 0; c < cols.length; c++) header += ' ' + cols[c].label + ' |';
  lines.push(header);

  // Separator
  var sep = '|-------|';
  for (c = 0; c < cols.length; c++) sep += '-------|';
  lines.push(sep);

  // Rows
  for (var i = 0; i < show.length; i++) {
    var row = show[i];
    var line = '| ' + row.label + ' |';
    for (c = 0; c < cols.length; c++) {
      var val = row[cols[c].key];
      if (cols[c].format === 'money') val = fmtMoney(val);
      else if (cols[c].format === 'pct') val = (typeof val === 'number' ? val.toFixed(1) + '%' : val);
      else if (typeof val === 'number') val = val.toLocaleString();
      line += ' ' + (val !== undefined ? val : '—') + ' |';
    }
    lines.push(line);
  }

  if (monthly.length > maxRows) {
    lines.push('| ... |' + ' ... |'.repeat(cols.length));
  }

  return lines.join('\n');
}

function formatModel(pl, bs, assumptions) {
  var lines = [];
  var a = assumptions || {};
  var typeName = { saas: 'SaaS/Subscription', marketplace: 'Marketplace', services: 'Services/Agency', ecommerce: 'E-commerce', generic: 'Generic' };

  lines.push('# Startup Financial Model');
  lines.push('');
  lines.push('**Type:** ' + (typeName[pl.revenue.type] || pl.revenue.type) + ' | **Period:** ' + pl.revenue.months + ' months');
  lines.push('');

  // Key assumptions
  lines.push('## Key Assumptions');
  lines.push('');
  lines.push('| Assumption | Value |');
  lines.push('|-----------|-------|');
  if (a.currentMRR !== undefined) lines.push('| Starting MRR | ' + fmtMoney(a.currentMRR) + ' |');
  if (a.monthlyGrowthPct !== undefined) lines.push('| Monthly Growth | ' + a.monthlyGrowthPct + '% |');
  if (a.churnRate !== undefined) lines.push('| Monthly Churn | ' + a.churnRate + '% |');
  if (a.newCustomersPerMonth) lines.push('| New Customers/Mo | ' + a.newCustomersPerMonth + ' |');
  if (a.arpu) lines.push('| ARPU | ' + fmtMoney(a.arpu) + ' |');
  if (a.startingCash) lines.push('| Starting Cash | ' + fmtMoney(a.startingCash) + ' |');
  if (a.startingDebt) lines.push('| Starting Debt | ' + fmtMoney(a.startingDebt) + ' |');
  lines.push('');

  // Monthly P&L
  lines.push('## Monthly P&L (first 12 months)');
  lines.push('');
  lines.push(formatMonthlyRows(pl.monthly, [
    { key: 'revenue', label: 'Revenue', format: 'money' },
    { key: 'cogs', label: 'COGS', format: 'money' },
    { key: 'grossProfit', label: 'Gross Profit', format: 'money' },
    { key: 'totalOpex', label: 'OpEx', format: 'money' },
    { key: 'ebitda', label: 'EBITDA', format: 'money' },
    { key: 'netIncome', label: 'Net Income', format: 'money' }
  ], 12));
  lines.push('');

  // Summary
  lines.push('## Model Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push('| Total Revenue (' + pl.revenue.months + 'mo) | ' + fmtMoney(pl.summary.totalRevenue) + ' |');
  lines.push('| Total Net Income | ' + fmtMoney(pl.summary.totalNetIncome) + ' |');
  lines.push('| Overall Margin | ' + pl.summary.overallMargin + '% |');

  // Last month snapshot
  var last = pl.monthly[pl.monthly.length - 1];
  lines.push('| Final Month Revenue | ' + fmtMoney(last.revenue) + ' |');
  lines.push('| Final Month Net Income | ' + fmtMoney(last.netIncome) + ' |');

  if (bs) {
    var lastBS = bs.monthly[bs.monthly.length - 1];
    lines.push('| Ending Cash | ' + fmtMoney(lastBS.cash) + ' |');
    lines.push('| Ending Debt | ' + fmtMoney(lastBS.debt) + ' |');
  }

  // Runway
  var burnMonths = 0, totalBurn = 0;
  for (var i = 0; i < pl.monthly.length; i++) {
    if (pl.monthly[i].netIncome < 0) { totalBurn += Math.abs(pl.monthly[i].netIncome); burnMonths++; }
  }
  var avgBurn = burnMonths > 0 ? totalBurn / burnMonths : 0;
  if (bs && avgBurn > 0) {
    var runway = calculateRunway(lastBS.cash, avgBurn);
    lines.push('| Monthly Burn | ' + fmtMoney(avgBurn) + ' |');
    lines.push('| Runway | ' + runway.runwayMonthsFormatted + ' (' + runway.status + ') |');
  }
  lines.push('');

  return lines.join('\n');
}

function formatCashFlow(bs, maxRows) {
  maxRows = maxRows || 36;
  var lines = [];
  lines.push('# Detailed Monthly Cash Flow Statement');
  lines.push('');
  lines.push('| Mo | Revenue | COGS | OpEx | CapEx | Net CF | Cash Balance |');
  lines.push('|---|---------|------|------|-------|--------|-------------|');
  var show = bs.monthly.slice(0, Math.min(maxRows, bs.monthly.length));
  for (var i = 0; i < show.length; i++) {
    var r = show[i];
    var capex = r.investingCF !== undefined ? Math.abs(r.investingCF) : 0;
    lines.push(
      '| ' + r.label.padEnd(2) + ' | ' +
      fmtMoney(r.revenue) + ' | ' +
      fmtMoney(r.cogs) + ' | ' +
      fmtMoney(r.totalOpex) + ' | ' +
      fmtMoney(capex) + ' | ' +
      fmtMoney(r.netCF) + ' | ' +
      fmtMoney(r.cash) + ' |'
    );
  }
  lines.push('');
  return lines.join('\n');
}

function formatScenarios(scenarios) {
  var lines = [];
  lines.push('# Scenario Analysis');
  lines.push('');
  lines.push('| Metric | Base | Bull (' + (scenarios.bull ? scenarios.bull.multiplier : 1.3).toFixed(1) + 'x) | Bear (' + (scenarios.bear ? scenarios.bear.multiplier : 0.7).toFixed(1) + 'x) |');
  lines.push('|--------|------|-----------|-----------|');

  var keys = ['base', 'bull', 'bear'];
  var rows = [];
  for (var k = 0; k < keys.length; k++) {
    var s = scenarios[keys[k]];
    if (!s) continue;
    if (k === 0) {
      lines.push('| Total Revenue | ' + fmtMoney(s.totalRevenue) + ' | ' + fmtMoney(scenarios.bull ? scenarios.bull.totalRevenue : 0) + ' | ' + fmtMoney(scenarios.bear ? scenarios.bear.totalRevenue : 0) + ' |');
      lines.push('| Total Net Income | ' + fmtMoney(s.totalNetIncome) + ' | ' + fmtMoney(scenarios.bull ? scenarios.bull.totalNetIncome : 0) + ' | ' + fmtMoney(scenarios.bear ? scenarios.bear.totalNetIncome : 0) + ' |');
      lines.push('| Overall Margin | ' + s.overallMargin + '% | ' + (scenarios.bull ? scenarios.bull.overallMargin : '—') + '% | ' + (scenarios.bear ? scenarios.bear.overallMargin : '—') + '% |');
      lines.push('| Ending Cash | ' + fmtMoney(s.endingCash) + ' | ' + fmtMoney(scenarios.bull ? scenarios.bull.endingCash : 0) + ' | ' + fmtMoney(scenarios.bear ? scenarios.bear.endingCash : 0) + ' |');
      lines.push('| Runway | ' + s.runway.runwayMonthsFormatted + ' | ' + (scenarios.bull ? scenarios.bull.runway.runwayMonthsFormatted : '—') + ' | ' + (scenarios.bear ? scenarios.bear.runway.runwayMonthsFormatted : '—') + ' |');
    }
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
  forecastRevenue, buildPandL, projectBalanceSheet, calculateRunway, runScenarios,
  formatModel, formatCashFlow, formatScenarios, fmtMoney
};

if (typeof module !== 'undefined' && module.exports) module.exports = skillApi;
if (typeof globalThis !== 'undefined') globalThis.startupFinancialModel = skillApi;

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
    if (t === '--type' && i + 1 < tokens.length) { out.businessType = tokens[i + 1]; i += 2; continue; }
    if (t === '--mrr' && i + 1 < tokens.length) { out.currentMRR = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--growth' && i + 1 < tokens.length) { out.monthlyGrowthPct = parseFloat(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--churn' && i + 1 < tokens.length) { out.churnRate = parseFloat(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--arpu' && i + 1 < tokens.length) { out.arpu = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--customers' && i + 1 < tokens.length) { out.newCustomersPerMonth = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--cash' && i + 1 < tokens.length) { out.startingCash = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--months' && i + 1 < tokens.length) { out.months = parseInt(tokens[i + 1]) || 36; i += 2; continue; }
    if (t === '--margin' && i + 1 < tokens.length) { out.grossMargin = parseFloat(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--sales' && i + 1 < tokens.length) { out.salesMarketing = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--rd' && i + 1 < tokens.length) { out.rd = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--ga' && i + 1 < tokens.length) { out.ga = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--scenario') { out.action = 'scenarios'; i++; continue; }
    if (t === '--runway') { out.action = 'runway'; i++; continue; }
    if (t === '--cashflow') { out.action = 'cashflow'; i++; continue; }
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

  var action = params.action || params.command || 'model';
  var defaults = {
    businessType: 'saas', currentMRR: 100000, monthlyGrowthPct: 5, churnRate: 2,
    newCustomersPerMonth: 10, arpu: 500, months: 36, startingCash: 500000,
    salesMarketing: 30000, rd: 50000, ga: 15000,
    monthlyDepreciation: 2000, cogsVariablePct: 10
  };
  for (var key in defaults) {
    if (!defaults.hasOwnProperty(key)) continue;
    if (!(key in params)) params[key] = defaults[key];
  }

  // Map grossMargin to cogsVariablePct (e.g., 80% margin → 20% COGS)
  if (params.grossMargin && !params.cogsVariablePct) {
    params.cogsVariablePct = 100 - params.grossMargin;
  }

  try {
    if (action === 'scenarios') {
      var pl = buildPandL(params);
      var bs = projectBalanceSheet(pl, params);
      var sc = runScenarios(params);
      return formatModel(pl, bs, params) + '\n' + formatScenarios(sc);
    }

    if (action === 'runway') {
      pl = buildPandL(params);
      bs = projectBalanceSheet(pl, params);
      var burnMonths = 0, totalBurn = 0;
      for (var i = 0; i < pl.monthly.length; i++) {
        if (pl.monthly[i].netIncome < 0) { totalBurn += Math.abs(pl.monthly[i].netIncome); burnMonths++; }
      }
      var avgBurn = burnMonths > 0 ? totalBurn / burnMonths : 0;
      var runway = calculateRunway(bs.endingCash, avgBurn);
      return '# Runway Analysis\n\n' +
        '**Cash:** ' + fmtMoney(bs.endingCash) + ' | **Burn:** ' + fmtMoney(avgBurn) + '/mo | **Runway:** ' + runway.runwayMonthsFormatted + ' | **Status:** ' + runway.status;
    }

    if (action === 'cashflow') {
      pl = buildPandL(params);
      bs = projectBalanceSheet(pl, params);
      return formatModel(pl, bs, params) + '\n' + formatCashFlow(bs, params.months || 36);
    }

    // Default: full model
    pl = buildPandL(params);
    bs = projectBalanceSheet(pl, params);
    return formatModel(pl, bs, params);
  } catch (err) {
    return { error: 'Model build failed: ' + (err && err.message ? err.message : String(err)) };
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
