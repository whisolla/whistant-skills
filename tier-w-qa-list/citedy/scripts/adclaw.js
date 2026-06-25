'use strict';

// ── Citedy SEO Agent — API client ───────────────────────────────────────────
// Base URL: https://www.citedy.com
// Auth: Authorization: Bearer <api_key>
// API key prefix: citedy_agent_
// ─────────────────────────────────────────────────────────────────────────────

var BASE = 'https://www.citedy.com';
var TIMEOUT_DEFAULT = 30;
var TIMEOUT_AUTOPILOT = 120;

// ── Credential resolution ───────────────────────────────────────────────────

var _apiKey = null;

async function _getApiKey() {
  if (_apiKey) return _apiKey;
  // 1. globalThis (set by TerminalManager on app launch)
  if (typeof globalThis !== 'undefined' && globalThis.CITEDY_API_KEY) {
    _apiKey = globalThis.CITEDY_API_KEY;
    return _apiKey;
  }
  if (typeof globalThis !== 'undefined' && globalThis.ADCLAW_API_KEY) {
    _apiKey = globalThis.ADCLAW_API_KEY;
    return _apiKey;
  }
  // 2. Keychain (Whistant TerminalManager global)
  if (typeof keychain !== 'undefined') {
    try {
      var stored = await keychain.get('CITEDY_API_KEY') || await keychain.get('ADCLAW_API_KEY');
      if (stored) {
        _apiKey = stored;
        return _apiKey;
      }
    } catch (e) { /* keychain unavailable */ }
  }
  // 3. Env fallback
  if (typeof process !== 'undefined' && process.env && process.env.CITEDY_API_KEY) {
    _apiKey = process.env.CITEDY_API_KEY;
    return _apiKey;
  }
  if (typeof process !== 'undefined' && process.env && process.env.ADCLAW_API_KEY) {
    _apiKey = process.env.ADCLAW_API_KEY;
    return _apiKey;
  }
  return null;
}

/**
 * Configure API key persistently via keychain (survives /cmd calls).
 */
function configure(apiKey) {
  if (typeof keychain !== 'undefined') {
    try {
      keychain.set('CITEDY_API_KEY', apiKey);
    } catch (e) { /* ignore */ }
  }
  _apiKey = apiKey;
  if (typeof globalThis !== 'undefined') globalThis.CITEDY_API_KEY = apiKey;
  return { ok: true };
}

function init(apiKey) {
  _apiKey = apiKey;
  if (typeof globalThis !== 'undefined') globalThis.CITEDY_API_KEY = apiKey;
  return { ok: true };
}

async function hasKey() {
  return !!(await _getApiKey());
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

function _authHeaders(key) {
  if (!key) throw new Error('CITEDY_API_KEY not configured');
  return {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  };
}

async function _fetch(method, path, body, timeoutSec) {
  var key = await _getApiKey();
  if (!key) throw new Error('CITEDY_API_KEY not configured');
  var t = timeoutSec || TIMEOUT_DEFAULT;
  var opts = {
    method: method,
    headers: _authHeaders(key),
    timeout: t
  };
  if (body) opts.body = JSON.stringify(body);
  var res = await fetch(BASE + path, opts);
  var data;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    var msg = data && data.error ? data.error : ('HTTP ' + res.status);
    if (data && data.message) msg = data.message;
    return { ok: false, status: res.status, error: msg, _data: data };
  }
  return { ok: true, status: res.status, data: data };
}

async function _get(path, timeoutSec) {
  return _fetch('GET', path, null, timeoutSec);
}

async function _post(path, body, timeoutSec) {
  return _fetch('POST', path, body, timeoutSec);
}

async function _put(path, body) {
  return _fetch('PUT', path, body);
}

async function _del(path) {
  return _fetch('DELETE', path, null);
}

// ── Format helpers ──────────────────────────────────────────────────────────

function formatCredits(n) {
  if (n == null) return 'N/A';
  return n.toLocaleString ? n.toLocaleString() : String(n);
}

function formatDollars(credits) {
  if (credits == null) return 'N/A';
  return '$' + (credits / 100).toFixed(2);
}

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  try { return new Date(ts).toLocaleString(); } catch (e) { return ts; }
}

// ── API: Free endpoints ─────────────────────────────────────────────────────

/**
 * GET /api/agent/me — agent info, balance, rate limits, connected platforms
 */
async function getMe() {
  var r = await _get('/api/agent/me');
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    agentId: d.agent_id,
    agentName: d.agent_name,
    status: d.status,
    credits: d.tenant_balance ? d.tenant_balance.credits : 0,
    balanceStatus: d.tenant_balance ? d.tenant_balance.status : 'unknown',
    blogUrl: d.blog_url,
    rateLimits: d.rate_limits,
    connectedPlatforms: d.connected_platforms,
    referral: d.referral,
    _raw: d
  };
}

/**
 * GET /api/agent/status — operational readiness snapshot
 */
async function getStatus() {
  var r = await _get('/api/agent/status');
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    operationalStatus: d.summary ? d.summary.operational_status : 'unknown',
    readyToCreate: d.summary ? d.summary.ready_to_create : false,
    readyToPublish: d.summary ? d.summary.ready_to_publish : false,
    billing: d.billing,
    social: d.social,
    schedule: d.schedule,
    actions: d.actions || [],
    _raw: d
  };
}

/**
 * GET /api/agent/personas — available writing personas
 */
async function getPersonas() {
  var r = await _get('/api/agent/personas');
  if (!r.ok) return r;
  var d = r.data;
  var personas = (d.personas || d || []);
  return {
    ok: true,
    personas: personas,
    count: personas.length,
    groups: personas.reduce(function(acc, p) {
      var g = p.group || 'Other';
      if (!acc[g]) acc[g] = [];
      acc[g].push(p.slug);
      return acc;
    }, {})
  };
}

/**
 * GET /api/agent/articles — list articles
 * @param {Object} [opts] - { status, limit, offset }
 */
async function listArticles(opts) {
  opts = opts || {};
  var qs = '?limit=' + (opts.limit || 20) + '&offset=' + (opts.offset || 0);
  if (opts.status) qs += '&status=' + opts.status;
  var r = await _get('/api/agent/articles' + qs);
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    articles: d.articles || [],
    total: d.total_articles || 0
  };
}

/**
 * GET /api/agent/settings — agent settings
 */
async function getSettings() {
  var r = await _get('/api/agent/settings');
  if (!r.ok) return r;
  return { ok: true, settings: r.data, _raw: r.data };
}

/**
 * GET /api/agent/schedule — schedule timeline
 * @param {Object} [opts] - { from, to, type }
 */
async function getSchedule(opts) {
  opts = opts || {};
  var qs = '?from=' + (opts.from || '') + '&to=' + (opts.to || '') + '&type=' + (opts.type || 'all');
  var r = await _get('/api/agent/schedule' + qs);
  if (!r.ok) return r;
  return { ok: true, schedule: r.data, _raw: r.data };
}

/**
 * GET /api/agent/schedule/gaps — find schedule gaps
 */
async function getScheduleGaps(opts) {
  opts = opts || {};
  var qs = '?days=' + (opts.days || 7) + '&timezone=' + (opts.timezone || 'America/New_York');
  var r = await _get('/api/agent/schedule/gaps' + qs);
  if (!r.ok) return r;
  return { ok: true, gaps: r.data, _raw: r.data };
}

// ── API: Paid endpoints ─────────────────────────────────────────────────────

/**
 * POST /api/agent/scan — trend scan
 * @param {Object} opts - { query, mode, limit }
 * mode: fast(2cr) | deep(4cr) | ultra(6cr) | ultra+(8cr)
 */
async function scanTrends(opts) {
  opts = opts || {};
  var body = {
    query: opts.query || 'AI marketing trends',
    mode: opts.mode || 'fast',
    limit: opts.limit || 10
  };
  var r = await _post('/api/agent/scan', body);
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    results: d.results || [],
    count: (d.results || []).length,
    mode: d.mode,
    cost: d.cost,
    _raw: d
  };
}

/**
 * POST /api/agent/autopilot — generate article
 * @param {Object} opts - { topic, source_urls, language, size, mode, persona, ... }
 * size: mini(15cr) | standard(20cr) | full(33cr) | pillar(48cr)
 * mode: standard | turbo(2cr) | turbo+(4cr, enable_search:true)
 */
async function createArticle(opts) {
  opts = opts || {};
  var body = {};
  if (opts.topic) body.topic = opts.topic;
  if (opts.source_urls) body.source_urls = opts.source_urls;
  if (opts.language) body.language = opts.language;
  if (opts.size) body.size = opts.size;
  if (opts.mode) body.mode = opts.mode;
  if (opts.enable_search) body.enable_search = opts.enable_search;
  if (opts.persona) body.persona = opts.persona;
  if (opts.illustrations) body.illustrations = opts.illustrations;
  if (opts.audio) body.audio = opts.audio;
  if (opts.disable_competition) body.disable_competition = opts.disable_competition;
  if (opts.auto_publish !== undefined) body.auto_publish = opts.auto_publish;

  if (!body.topic && (!body.source_urls || !body.source_urls.length)) {
    return { ok: false, error: 'Either "topic" or "source_urls" is required' };
  }
  if (!body.mode) body.mode = 'turbo'; // default to cheap turbo for testing

  var r = await _post('/api/agent/autopilot', body, TIMEOUT_AUTOPILOT);
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    articleId: d.article_id || d.id,
    title: d.title,
    articleUrl: d.article_url,
    wordCount: d.word_count,
    creditsUsed: d.credits_used,
    status: d.status,
    _raw: d
  };
}

/**
 * POST /api/agent/adapt — create social adaptations
 * @param {Object} opts - { article_id, platforms, include_ref_link }
 */
async function adaptArticle(opts) {
  opts = opts || {};
  var body = {
    article_id: opts.article_id || opts.articleId,
    platforms: opts.platforms || ['linkedin']
  };
  if (opts.include_ref_link !== undefined) body.include_ref_link = opts.include_ref_link;
  var r = await _post('/api/agent/adapt', body, 60);
  if (!r.ok) return r;
  var d = r.data;
  return {
    ok: true,
    adaptations: d.adaptations || [],
    totalCredits: d.total_credits,
    _raw: d
  };
}

// ── handler ─────────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  return runFromParams(params);
}

// ── Exports ─────────────────────────────────────────────────────────────────

try {
  module.exports = {
    // handler
    handler: handler,

    // credential
    init: init,
    configure: configure,
    hasKey: hasKey,
    _getApiKey: _getApiKey,

    // free API
    getMe: getMe,
    getStatus: getStatus,
    getPersonas: getPersonas,
    listArticles: listArticles,
    getSettings: getSettings,
    getSchedule: getSchedule,
    getScheduleGaps: getScheduleGaps,

    // paid API
    scanTrends: scanTrends,
    createArticle: createArticle,
    adaptArticle: adaptArticle,

    // command
    tokenize: tokenize,
    parseCommand: parseCommand,
    runFromParams: runFromParams,

    // helpers
    formatCredits: formatCredits,
    formatDollars: formatDollars,
    formatTimestamp: formatTimestamp,
    formatResult: formatResult
  };
} catch (e) {
  // JSC environment — exports handled by PARAMS block or require()
}

// ── Command parsing ─────────────────────────────────────────────────────────

/**
 * Tokenize a command string into { action, ...flags }
 */
function tokenize(cmd) {
  if (!cmd) return {};
  // Tokenize respecting quoted strings
  var tokens = [];
  var i = 0;
  var s = cmd.trim();
  while (i < s.length) {
    // skip whitespace
    while (i < s.length && s[i] === ' ') i++;
    if (i >= s.length) break;
    if (s[i] === '"' || s[i] === "'") {
      var quote = s[i];
      i++;
      var start = i;
      while (i < s.length && s[i] !== quote) i++;
      tokens.push(s.substring(start, i));
      i++; // skip closing quote
    } else {
      var start = i;
      while (i < s.length && s[i] !== ' ') i++;
      tokens.push(s.substring(start, i));
    }
  }
  var parsed = {};
  var positional = [];
  for (var j = 0; j < tokens.length; j++) {
    var p = tokens[j];
    if (p.indexOf('--') === 0) {
      var key = p.replace(/^--/, '');
      var next = tokens[j + 1];
      if (next && next.indexOf('--') !== 0) {
        parsed[key] = next;
        j++;
      } else {
        parsed[key] = true;
      }
    } else {
      positional.push(p);
    }
  }
  if (positional.length > 0) parsed.action = positional[0];
  if (positional.length > 1) parsed.args = positional.slice(1);
  return parsed;
}

/**
 * Parse tokens into typed parameters
 */
function parseCommand(tokens) {
  tokens = tokens || {};
  var cmd = { action: tokens.action || 'status' };

  switch (cmd.action) {
    case 'status':
    case 'me':
      cmd.action = 'me';
      break;
    case 'personas':
      cmd.action = 'personas';
      break;
    case 'articles':
      cmd.action = 'articles';
      cmd.status = tokens.status;
      cmd.limit = tokens.limit ? parseInt(tokens.limit, 10) : 20;
      break;
    case 'scan':
      cmd.action = 'scan';
      cmd.query = tokens.query || (tokens.args ? tokens.args.join(' ') : '');
      cmd.mode = tokens.mode || 'fast';
      cmd.limit = tokens.limit ? parseInt(tokens.limit, 10) : 10;
      break;
    case 'article':
    case 'create':
    case 'autopilot':
      cmd.action = 'article';
      cmd.topic = tokens.topic || (tokens.args ? tokens.args.join(' ') : '');
      cmd.mode = tokens.mode || 'turbo';
      cmd.size = tokens.size;
      cmd.language = tokens.language || 'en';
      cmd.persona = tokens.persona;
      break;
    case 'adapt':
      cmd.action = 'adapt';
      cmd.articleId = tokens.article || tokens.id || tokens.articleId;
      cmd.platforms = tokens.platforms ? tokens.platforms.split(',') : ['linkedin'];
      break;
    case 'settings':
      cmd.action = 'settings';
      break;
    case 'schedule':
      cmd.action = 'schedule';
      break;
    case 'gaps':
      cmd.action = 'gaps';
      cmd.days = tokens.days ? parseInt(tokens.days, 10) : 7;
      break;
    default:
      // unknown action, keep as-is
      break;
  }
  return cmd;
}

// ── runFromParams ───────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var p = inputParams;
  // if called without params from /cmd path, try global PARAMS
  if (!p && typeof PARAMS !== 'undefined' && PARAMS) p = PARAMS;
  if (!p && typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) {
    try { p = JSON.parse(PARAMS_JSON); } catch (e) { /* ignore */ }
  }
  if (!p) return { ok: false, error: 'No parameters provided' };

  var cmd = parseCommand(p);
  var result;

  switch (cmd.action) {
    case 'me':
      result = await getMe();
      break;
    case 'status':
      result = await getStatus();
      break;
    case 'personas':
      result = await getPersonas();
      break;
    case 'articles':
      result = await listArticles({ status: cmd.status, limit: cmd.limit });
      break;
    case 'scan':
      result = await scanTrends({ query: cmd.query, mode: cmd.mode, limit: cmd.limit });
      break;
    case 'article':
      result = await createArticle({ topic: cmd.topic, mode: cmd.mode, size: cmd.size, language: cmd.language, persona: cmd.persona });
      break;
    case 'adapt':
      result = await adaptArticle({ article_id: cmd.articleId, platforms: cmd.platforms });
      break;
    case 'settings':
      result = await getSettings();
      break;
    case 'schedule':
      result = await getSchedule();
      break;
    case 'gaps':
      result = await getScheduleGaps({ days: cmd.days });
      break;
    default:
      result = { ok: false, error: 'Unknown action: ' + cmd.action + '. Try: status, personas, articles, scan, article, settings, schedule, gaps' };
  }

  // format result for display
  if (result && result.ok) {
    result.formatted = formatResult(cmd.action, result);
  }
  return result;
}

function formatResult(action, r) {
  switch (action) {
    case 'me': {
      var lines = [];
      lines.push('🤖 ' + (r.agentName || 'Agent') + ' — ' + (r.status || 'unknown'));
      lines.push('💰 Credits: ' + formatCredits(r.credits) + ' (' + formatDollars(r.credits) + ') — ' + r.balanceStatus);
      lines.push('📝 Blog: ' + (r.blogUrl || 'N/A'));
      if (r.rateLimits) {
        Object.keys(r.rateLimits).forEach(function(k) {
          var rl = r.rateLimits[k];
          lines.push('⏱ ' + k + ': ' + rl.remaining + ' remaining, resets ' + formatTimestamp(rl.resetAt));
        });
      }
      if (r.connectedPlatforms) {
        var connected = r.connectedPlatforms.filter(function(p) { return p.connected; });
        if (connected.length > 0) {
          lines.push('🔗 Connected: ' + connected.map(function(p) { return p.platform; }).join(', '));
        }
      }
      return lines.join('\n');
    }
    case 'personas': {
      var lines = ['🎭 ' + r.count + ' writing personas:'];
      Object.keys(r.groups).forEach(function(g) {
        lines.push('  ' + g + ': ' + r.groups[g].join(', '));
      });
      return lines.join('\n');
    }
    case 'articles': {
      if (r.total === 0) return '📄 No articles yet.';
      var lines = ['📄 ' + r.total + ' articles:'];
      (r.articles || []).slice(0, 10).forEach(function(a) {
        lines.push('  • ' + (a.title || a.slug || a.id) + ' [' + (a.status || '?') + ']');
      });
      return lines.join('\n');
    }
    case 'scan': {
      if (!r.count) return '🔍 No trends found for this query.';
      var lines = ['🔍 ' + r.count + ' trends (mode: ' + r.mode + ', cost: ' + r.cost + 'cr):'];
      (r.results || []).forEach(function(t, i) {
        lines.push('  ' + (i + 1) + '. ' + (t.title || 'Untitled'));
        if (t.summary) lines.push('     ' + t.summary.substring(0, 120));
      });
      return lines.join('\n');
    }
    case 'article': {
      return '📝 Article generated!\n' +
        '  Title: ' + (r.title || 'N/A') + '\n' +
        '  URL: ' + (r.articleUrl || 'N/A') + '\n' +
        '  Words: ' + (r.wordCount || 'N/A') + '\n' +
        '  Credits: ' + (r.creditsUsed || 'N/A') + '\n' +
        '  Status: ' + (r.status || 'N/A');
    }
    case 'adapt': {
      var lines = ['📱 Social adaptations (' + r.totalCredits + ' credits):'];
      (r.adaptations || []).forEach(function(a) {
        lines.push('  ' + a.platform + ': ' + (a.published ? '✅ published' : '📝 text only') + ' (' + a.credits_used + 'cr)');
      });
      return lines.join('\n');
    }
    case 'settings': {
      return '⚙️ Settings loaded';
    }
    default:
      return JSON.stringify(r, null, 2);
  }
}

// ── Node CLI block ──────────────────────────────────────────────────────────

try {
  if (typeof require !== 'undefined' && require.main === module) {
  (async function() {
    var args = process.argv.slice(2);
    var cmd = args.length > 0 ? args.join(' ') : 'status';
    var tokens = tokenize(cmd);
    var parsed = parseCommand(tokens);
    console.log('Action:', parsed.action);
    var r = await runFromParams(parsed);
    if (r && r.formatted) {
      console.log(r.formatted);
    } else if (r) {
      console.log(JSON.stringify(r, null, 2));
    } else {
      console.log('null');
    }
  })().catch(function(err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  });
  }
} catch (e) {
  // JSC environment — CLI not available
}

// ── PARAMS auto-run block ───────────────────────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
