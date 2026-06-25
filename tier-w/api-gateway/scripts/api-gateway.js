/**
 * api-gateway skill v2.0 — Whistant/JSC edition
 * Maton.ai managed OAuth gateway — call 100+ services via native APIs.
 *
 * /cmd: run /skills/api-gateway/scripts/api-gateway.js <action> [--flags]
 * /code: var gw = require("/skills/api-gateway/scripts/api-gateway.js");
 *         var result = await gw.getUser();
 */

var BASE = "https://gateway.maton.ai";
var CTRL = "https://ctrl.maton.ai";
var _apiKey = null;
var _config = { timeout: 30 };

// ── Credential resolution ────────────────────────────────────────────────

function _getTimeout() {
  return (_config && _config.timeout) || 30;
}

async function _getApiKey() {
  if (_apiKey) return _apiKey;
  if (typeof globalThis !== "undefined" && globalThis.MATON_API_KEY) {
    _apiKey = globalThis.MATON_API_KEY;
    return _apiKey;
  }
  if (typeof process !== "undefined" && process.env && process.env.MATON_API_KEY) {
    _apiKey = process.env.MATON_API_KEY;
    return _apiKey;
  }
  try {
    if (typeof keychain !== "undefined") {
      var stored = await keychain.get("MATON_API_KEY");
      if (stored) { _apiKey = stored; return _apiKey; }
    }
  } catch (e) { /* keychain not available */ }
  return null;
}

function init(cfg) {
  if (!cfg) return;
  if (cfg.apiKey) _apiKey = cfg.apiKey;
  if (cfg.timeout) _config.timeout = cfg.timeout;
}

function configure(cfg) {
  if (!cfg) return;
  if (cfg.apiKey !== undefined) _apiKey = cfg.apiKey;
  if (cfg.timeout !== undefined) _config.timeout = cfg.timeout;
}

async function hasKey() {
  return !!(await _getApiKey());
}

// ── HTTP helpers ─────────────────────────────────────────────────────────

async function _headers(apiKey, extra) {
  var h = {
    "Authorization": "Bearer " + (apiKey || await _getApiKey()),
    "Content-Type": "application/json"
  };
  if (extra) {
    var keys = Object.keys(extra);
    for (var i = 0; i < keys.length; i++) {
      h[keys[i]] = extra[keys[i]];
    }
  }
  return h;
}

async function _checkKey() {
  var key = await _getApiKey();
  if (!key) {
    throw new Error(
      "MATON_API_KEY not configured. " +
      "Get a key at https://maton.ai, then:\n" +
      "  gw.init({ apiKey: 'your-key' })\n" +
      "  or: keychain.set('MATON_API_KEY', 'your-key')"
    );
  }
  return key;
}

async function _fetchJson(url, opts) {
  var fetchOpts = Object.assign({}, opts);
  // Set timeout via Whistant-native fetch option
  if (fetchOpts.timeout === undefined) {
    fetchOpts.timeout = (_getTimeout() || 30) * 1000;
  }
  try {
    var res = await fetch(url, fetchOpts);
    var text = await res.text();
    try { return JSON.parse(text); } catch (e) { return { _raw: text, _status: res.status }; }
  } catch (e) {
    return { _error: e.message || String(e) };
  }
}

// ── API Actions ──────────────────────────────────────────────────────────

/**
 * Get authenticated user / account info.
 */
async function getUser() {
  var key = await _checkKey();
  return _fetchJson(CTRL + "/user", { headers: await _headers(key) });
}

/**
 * List all connections (active or all).
 * @param {string} [status] — "ACTIVE", "INACTIVE", or omit for all
 */
async function listConnections(status) {
  var key = await _checkKey();
  var url = CTRL + "/connections";
  if (status) url += "?status=" + encodeURIComponent(status);
  return _fetchJson(url, { headers: await _headers(key) });
}

/**
 * Call a service via Maton gateway.
 * @param {string} app — Service name (e.g. 'slack', 'notion', 'github')
 * @param {string} path — Native API path (e.g. '/api/chat.postMessage')
 * @param {object} [body] — Request body (for POST/PATCH/PUT)
 * @param {string} [method] — HTTP method (default: 'GET')
 * @param {object} [extraHeaders] — Additional headers
 * @param {string} [connectionId] — Specific connection ID for multi-account
 */
async function call(app, path, body, method, extraHeaders, connectionId) {
  var key = await _checkKey();
  var url = BASE + "/" + app + path;
  var hdrs = await _headers(key, extraHeaders);
  if (connectionId) hdrs["Maton-Connection"] = connectionId;
  var opts = { method: (method || "GET").toUpperCase(), headers: hdrs };
  if (body !== undefined && body !== null) {
    opts.body = JSON.stringify(body);
  }
  return _fetchJson(url, opts);
}

// ── Template: handler (Whistant terminal entry) ─────────────────────────

async function handler(input) {
  var params;
  if (typeof input === "string") {
    params = parseCommand(input);
  } else if (input && typeof input === "object") {
    params = input.parameters || input.params || input;
  } else {
    params = { action: "user" };
  }
  return runFromParams(params);
}

// ── Template: Exports ───────────────────────────────────────────────────

var EXPORTS = {
  // Credential management
  init: init,
  configure: configure,
  hasKey: hasKey,
  _getApiKey: _getApiKey,

  // Account
  getUser: getUser,
  listConnections: listConnections,

  // Passthrough
  call: call,

  // Template
  handler: handler,
  parseCommand: parseCommand,
  tokenize: tokenize,
  runFromParams: runFromParams,

  // Config
  BASE: BASE,
  CTRL: CTRL,
};

// JSC-compatible export (try-catch for debug server)
try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = EXPORTS;
  }
} catch (e) {
  /* module.exports not available in debug server JSC */
}

// ── Template: command parsing ───────────────────────────────────────────

function tokenize(input) {
  if (typeof input !== "string") return [];
  var tokens = [];
  var current = "";
  var inQuote = false;
  var quoteChar = "";
  for (var i = 0; i < input.length; i++) {
    var ch = input[i];
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false;
        if (current) tokens.push(current);
        current = "";
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseCommand(input, opts) {
  if (!input) return { action: "user" };
  var tokens = tokenize(input);
  var result = { action: tokens[0] || "user" };
  opts = opts || {};
  var flagMap = opts.flags || {};

  for (var i = 1; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.indexOf("--") === 0) {
      var key = t.slice(2);
      if (key.indexOf("=") !== -1) {
        var parts = key.split("=", 2);
        result[parts[0]] = parts[1];
      } else {
        result[key] = "true";
      }
    } else if (i === 1 && result.action === "call") {
      result.app = t;
    } else if (i === 2 && result.action === "call") {
      result.path = t;
    } else if (i === 3 && result.action === "call") {
      result.body = t;
    }
  }

  for (var fk in flagMap) {
    if (result[fk] === undefined) result[fk] = flagMap[fk];
  }
  return result;
}

// ── Template: runFromParams ─────────────────────────────────────────────

async function runFromParams(params) {
  if (!params) params = {};
  var action = params.action || params._action || "user";
  var app = params.app || params.service;
  var path = params.path || params.endpoint;
  var body = params.body;
  var method = params.method || params.httpMethod;
  var extraHeaders = params.headers;
  var connectionId = params.connectionId || params.connection;
  var status = params.status;

  try {
    if (body && typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { /* keep as string */ }
    }
    if (extraHeaders && typeof extraHeaders === "string") {
      try { extraHeaders = JSON.parse(extraHeaders); } catch (e) { /* keep as string */ }
    }
  } catch (e) { /* ignore parse errors */ }

  switch (action) {
    case "user":
    case "me":
      return getUser();
    case "connections":
    case "list":
      return listConnections(status);
    case "call":
      if (!app) throw new Error("Missing --app (service name, e.g. slack, notion)");
      if (!path) throw new Error("Missing --path (API endpoint, e.g. /api/chat.postMessage)");
      return call(app, path, body, method, extraHeaders, connectionId);
    default:
      throw new Error("Unknown action: " + action + ". Valid: user, connections, call");
  }
}

// ── Node.js CLI ─────────────────────────────────────────────────────────

try {
  if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
    (async function () {
      var args = process.argv.slice(2);
      var action = args[0];
      var params = {};
      for (var i = 1; i < args.length; i++) {
        var arg = args[i];
        if (arg.indexOf("--") === 0) {
          var kv = arg.slice(2);
          if (kv.indexOf("=") !== -1) {
            var parts = kv.split("=", 2);
            params[parts[0]] = parts[1];
          } else {
            params[kv] = "true";
          }
        }
      }
      if (action) params.action = action;
      try {
        var result = await runFromParams(params);
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
      }
    })();
  }
} catch (e) {
  /* not in Node.js */
}

// ── PARAMS auto-run ─────────────────────────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams(PARAMS || PARAMS_JSON);
    if (typeof console !== 'undefined' && console.log) {
      console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
