// investor-memo-generator.js — Investor memo/document generator v1.0
// Local compute: formats financial data into investor-ready documents.
// No API key required. Pure text formatting + financial math.
// Template-compliant

// ─── 1. SKILL LOGIC ───────────────────────────────────────────────────────────

function fmtMoney(val) {
  if (val === null || val === undefined) return '—';
  var abs = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K';
  return sign + '$' + abs.toFixed(0);
}

function pct(val) {
  if (val === null || val === undefined) return '—';
  return (val >= 0 ? '+' : '') + val.toFixed(1) + '%';
}

/**
 * Generate an executive summary / one-pager.
 */
function generateOnePager(data) {
  var d = data || {};
  var lines = [];

  lines.push('# ' + (d.companyName || 'Company') + ' — Executive Summary');
  lines.push('');
  lines.push('**Date:** ' + (d.date || new Date().toISOString().substring(0, 10)));
  if (d.stage) lines.push('**Stage:** ' + d.stage);
  if (d.sector) lines.push('**Sector:** ' + d.sector);
  lines.push('');

  // Derived metrics
  if (d.currentMRR && !d.arr) d.arr = d.currentMRR * 12;
  if (d.currentMRR && d.customers && !d.arpu) d.arpu = d.currentMRR / d.customers;
  if (d.cashBalance && d.burnRate && d.burnRate > 0 && !d.runwayMonths) d.runwayMonths = d.cashBalance / d.burnRate;

  // Traction highlights
  lines.push('## Traction Highlights');
  lines.push('');
  if (d.currentMRR) lines.push('- **MRR:** ' + fmtMoney(d.currentMRR) + (d.mrrGrowth ? ' (growing ' + pct(d.mrrGrowth) + ' MoM)' : ''));
  if (d.arr) lines.push('- **ARR:** ' + fmtMoney(d.arr));
  if (d.arpu) lines.push('- **ARPU:** $' + Math.round(d.arpu) + '/month');
  if (d.customers) lines.push('- **Customers:** ' + d.customers.toLocaleString());
  if (d.totalRevenue) lines.push('- **TTM Revenue:** ' + fmtMoney(d.totalRevenue));
  if (d.grossMargin !== undefined) lines.push('- **Gross Margin:** ' + d.grossMargin.toFixed(1) + '%');
  if (d.netDollarRetention !== undefined) lines.push('- **Net Dollar Retention:** ' + d.netDollarRetention.toFixed(0) + '%');
  lines.push('');

  // Financial Snapshot
  lines.push('## Financial Snapshot');
  lines.push('');
  lines.push('| Metric | Current |');
  lines.push('|--------|---------|');
  if (d.cashBalance) lines.push('| Cash Balance | ' + fmtMoney(d.cashBalance) + ' |');
  if (d.burnRate) lines.push('| Monthly Burn | ' + fmtMoney(d.burnRate) + ' |');
  if (d.runwayMonths) lines.push('| Runway | ' + d.runwayMonths.toFixed(1) + ' months (~' + (d.runwayMonths / 12).toFixed(1) + ' years) |');
  if (d.revenue) lines.push('| Revenue | ' + fmtMoney(d.revenue) + ' |');
  if (d.grossProfit) lines.push('| Gross Profit | ' + fmtMoney(d.grossProfit) + ' |');
  if (d.ebitda) lines.push('| EBITDA | ' + fmtMoney(d.ebitda) + ' |');
  if (d.netIncome) lines.push('| Net Income | ' + fmtMoney(d.netIncome) + ' |');
  lines.push('');

  // Use of Funds
  if (d.useOfFunds) {
    lines.push('## Use of Funds');
    lines.push('');
    if (Array.isArray(d.useOfFunds)) {
      for (var i = 0; i < d.useOfFunds.length; i++) {
        lines.push('- ' + d.useOfFunds[i]);
      }
    } else {
      lines.push(d.useOfFunds);
    }
    lines.push('');
  }

  // Key risks
  if (d.risks && d.risks.length) {
    lines.push('## Key Risks');
    lines.push('');
    for (i = 0; i < d.risks.length; i++) lines.push('- ' + d.risks[i]);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate a board update memo.
 */
function generateBoardUpdate(data) {
  var d = data || {};
  var lines = [];

  lines.push('# Board Update — ' + (d.companyName || 'Company'));
  lines.push('');
  lines.push('**Period:** ' + (d.period || 'Current Month') + ' | **Date:** ' + (d.date || new Date().toISOString().substring(0, 10)));
  lines.push('');

  // CEO Summary
  lines.push('## CEO Summary');
  lines.push('');
  lines.push(d.ceoSummary || '*(Provide a brief narrative of the month\'s key developments.)*');
  lines.push('');

  // KPIs
  lines.push('## Key Metrics');
  lines.push('');
  lines.push('| Metric | Current | Previous | Change |');
  lines.push('|--------|---------|----------|--------|');
  if (d.metrics) {
    for (var i = 0; i < d.metrics.length; i++) {
      var m = d.metrics[i];
      var chg = m.current && m.previous ? ((m.current - m.previous) / Math.abs(m.previous) * 100).toFixed(1) + '%' : '—';
      var curr = typeof m.current === 'number' && m.current >= 1000 ? fmtMoney(m.current) : (m.current || '—');
      var prev = typeof m.previous === 'number' && m.previous >= 1000 ? fmtMoney(m.previous) : (m.previous || '—');
      lines.push('| ' + m.name + ' | ' + curr + ' | ' + prev + ' | ' + chg + ' |');
    }
  }
  lines.push('');

  // Financials
  lines.push('## Financials');
  lines.push('');
  lines.push('| Item | Budget | Actual | Variance |');
  lines.push('|------|--------|--------|----------|');
  if (d.financials) {
    for (i = 0; i < d.financials.length; i++) {
      var f = d.financials[i];
      var v = f.budget !== undefined && f.actual !== undefined ? fmtMoney(f.actual - f.budget) : '—';
      lines.push('| ' + f.name + ' | ' + fmtMoney(f.budget) + ' | ' + fmtMoney(f.actual) + ' | ' + v + ' |');
    }
  }
  lines.push('');
  lines.push('**Cash:** ' + fmtMoney(d.cashBalance) + ' | **Runway:** ' + (d.runwayMonths ? d.runwayMonths.toFixed(1) + ' months' : '—'));
  lines.push('');

  // Highlights/Lowlights
  if (d.highlights && d.highlights.length) {
    lines.push('## Highlights');
    lines.push('');
    for (i = 0; i < d.highlights.length; i++) lines.push('- ✅ ' + d.highlights[i]);
    lines.push('');
  }
  if (d.lowlights && d.lowlights.length) {
    lines.push('## Attention Needed');
    lines.push('');
    for (i = 0; i < d.lowlights.length; i++) lines.push('- ⚠ ' + d.lowlights[i]);
    lines.push('');
  }

  // Asks
  if (d.asks && d.asks.length) {
    lines.push('## Asks of the Board');
    lines.push('');
    for (i = 0; i < d.asks.length; i++) lines.push((i + 1) + '. ' + d.asks[i]);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate an LP update letter.
 */
function generateLPUpdate(data) {
  var d = data || {};
  var lines = [];

  lines.push('# LP Update — ' + (d.fundName || 'Fund') + ' | ' + (d.period || 'Q1 2026'));
  lines.push('');
  lines.push('Dear Limited Partners,');
  lines.push('');
  lines.push(d.openingLetter || '*(Provide a narrative update on fund performance and portfolio developments.)*');
  lines.push('');

  // Performance
  lines.push('## Performance Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  if (d.nav !== undefined) lines.push('| NAV | ' + fmtMoney(d.nav) + ' |');
  if (d.grossIRR !== undefined) lines.push('| Gross IRR | ' + d.grossIRR.toFixed(1) + '% |');
  if (d.netIRR !== undefined) lines.push('| Net IRR | ' + d.netIRR.toFixed(1) + '% |');
  if (d.tvpi !== undefined) lines.push('| TVPI | ' + d.tvpi.toFixed(2) + 'x |');
  if (d.dpi !== undefined) lines.push('| DPI | ' + d.dpi.toFixed(2) + 'x |');
  if (d.calledCapital) lines.push('| Called Capital | ' + fmtMoney(d.calledCapital) + ' |');
  if (d.distributedCapital) lines.push('| Distributed | ' + fmtMoney(d.distributedCapital) + ' |');
  lines.push('');

  // Portfolio companies
  if (d.portfolio && d.portfolio.length) {
    lines.push('## Portfolio Highlights');
    lines.push('');
    for (var i = 0; i < d.portfolio.length; i++) {
      var p = d.portfolio[i];
      lines.push('### ' + p.name);
      if (p.status) lines.push('**Status:** ' + p.status);
      if (p.update) lines.push(p.update);
      lines.push('');
    }
  }

  // Capital account
  lines.push('## Capital Account');
  lines.push('');
  lines.push('| Item | Amount |');
  lines.push('|------|--------|');
  if (d.commitment) lines.push('| Commitment | ' + fmtMoney(d.commitment) + ' |');
  if (d.calledCapital) lines.push('| Called | ' + fmtMoney(d.calledCapital) + ' |');
  if (d.distributedCapital) lines.push('| Distributed | ' + fmtMoney(d.distributedCapital) + ' |');
  if (d.uncalledCapital !== undefined) lines.push('| Uncalled | ' + fmtMoney(d.uncalledCapital) + ' |');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a term sheet summary from structured data.
 */
function generateTermSheetSummary(data) {
  var d = data || {};
  var lines = [];

  lines.push('# Term Sheet Summary — ' + (d.companyName || 'Company'));
  lines.push('');
  lines.push('| Term | Details |');
  lines.push('|------|---------|');
  if (d.roundType) lines.push('| Round | ' + d.roundType + ' |');
  if (d.amountRaised) lines.push('| Amount Raising | ' + fmtMoney(d.amountRaised) + ' |');
  if (d.preMoney) lines.push('| Pre-Money Valuation | ' + fmtMoney(d.preMoney) + ' |');
  if (d.postMoney) lines.push('| Post-Money Valuation | ' + fmtMoney(d.postMoney) + ' |');
  if (d.leadInvestor) lines.push('| Lead Investor | ' + d.leadInvestor + ' |');
  if (d.instrument) lines.push('| Instrument | ' + d.instrument + ' |');
  if (d.liquidationPreference) lines.push('| Liquidation Preference | ' + d.liquidationPreference + ' |');
  if (d.dividendRate) lines.push('| Dividend Rate | ' + d.dividendRate + ' |');
  if (d.antiDilution) lines.push('| Anti-Dilution | ' + d.antiDilution + ' |');
  if (d.boardSeats) lines.push('| Board Seats | ' + d.boardSeats + ' |');
  if (d.optionPool) lines.push('| Option Pool | ' + d.optionPool + ' |');
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
  generateOnePager, generateBoardUpdate, generateLPUpdate, generateTermSheetSummary,
  fmtMoney, pct
};

if (typeof module !== 'undefined' && module.exports) module.exports = skillApi;
if (typeof globalThis !== 'undefined') globalThis.investorMemoGenerator = skillApi;

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
    if ((t === '--type' || t === '-t') && i + 1 < tokens.length) { out.docType = tokens[i + 1]; i += 2; continue; }
    if ((t === '--name' || t === '-n') && i + 1 < tokens.length) { out.companyName = tokens[i + 1]; i += 2; continue; }
    if (t === '--json' && i + 1 < tokens.length) { out.jsonData = tokens[i + 1]; i += 2; continue; }
    if (t === '--mrr' && i + 1 < tokens.length) { out.mrr = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--burn' && i + 1 < tokens.length) { out.burnRate = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--cash' && i + 1 < tokens.length) { out.cashBalance = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--customers' && i + 1 < tokens.length) { out.customers = parseInt(tokens[i + 1]) || 0; i += 2; continue; }
    if (t === '--margin' && i + 1 < tokens.length) { out.grossMargin = parseFloat(tokens[i + 1]) || 0; i += 2; continue; }
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

  var docType = params.docType || params.type || 'onePager';
  var data = { companyName: params.companyName || params.name || 'Acme Corp', date: params.date };

  // Parse JSON data if provided
  if (params.jsonData) {
    try { Object.assign(data, typeof params.jsonData === 'string' ? JSON.parse(params.jsonData) : params.jsonData); }
    catch (e) {}
  }

  // Surface-level params
  var simpleKeys = ['mrr','arr','totalRevenue','currentMRR','customers','grossMargin','netDollarRetention',
    'revenue','revenueYoY','grossProfit','ebitda','netIncome','cashBalance','burnRate','runwayMonths',
    'stage','sector','useOfFunds','risks','ceoSummary','highlights','lowlights','asks','period',
    'fundName','nav','grossIRR','netIRR','tvpi','dpi','calledCapital','distributedCapital','commitment',
    'uncalledCapital','roundType','amountRaised','preMoney','postMoney','leadInvestor','instrument',
    'liquidationPreference','dividendRate','antiDilution','boardSeats','optionPool'];
  for (var k = 0; k < simpleKeys.length; k++) {
    var key = simpleKeys[k];
    if (params[key] !== undefined) data[key] = params[key];
  }

  if (params.mrr !== undefined) data.currentMRR = parseInt(params.mrr);
  if (params.arr !== undefined) data.arr = parseInt(params.arr);

  try {
    switch (docType) {
      case 'boardUpdate':
      case 'board':   return generateBoardUpdate(data);
      case 'lpUpdate':
      case 'lp':      return generateLPUpdate(data);
      case 'termSheet':
      case 'terms':   return generateTermSheetSummary(data);
      default:        return generateOnePager(data);
    }
  } catch (err) {
    return { error: 'Generation failed: ' + (err && err.message ? err.message : String(err)) };
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
