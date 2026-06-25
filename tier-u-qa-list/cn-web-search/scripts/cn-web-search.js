// cn-web-search v1.0 — Lightweight multi-engine search coordinator
// Fetches 11 search engines in parallel, parses JSON APIs, strips HTML for text engines.

// ─── Skill Logic ───────────────────────────────────────────────────────────

var ENGINE_LIST = [
  // JSON APIs — structured, fast, reliable
  { id: "hn",         name: "Hacker News",   type: "json",
    url: "https://hn.algolia.com/api/v1/search?query=QUERY&tags=story&hitsPerPage=COUNT",
    resultsKey: "hits",
    fields: { title: "title", url: "url", snippet: "points" },
    formatter: function(item) { return item.title + " (" + item.points + " pts) — " + (item.url || "https://news.ycombinator.com/item?id=" + item.objectID); }
  },
  { id: "reddit",     name: "Reddit",         type: "json",
    url: "https://www.reddit.com/search.json?q=QUERY&limit=COUNT",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Whistant/1.0)" },
    resultsKey: "data.children",
    fields: { title: "data.title", url: "data.url", snippet: "data.selftext" },
    formatter: function(item) {
      var d = item.data || item;
      var text = (d.selftext || "").substring(0, 120).replace(/\n/g, " ");
      return "r/" + d.subreddit + " — " + d.title + (text ? " | " + text : "");
    }
  },

  // Text/HTML engines — lightweight fetch, strip tags, return first text
  { id: "bing",       name: "Bing CN",        type: "text",
    url: "https://cn.bing.com/search?q=QUERY&count=COUNT",
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  },
  { id: "ddg",        name: "DuckDuckGo",     type: "text",
    url: "https://lite.duckduckgo.com/lite/?q=QUERY"
  },
  { id: "weixin",     name: "WeChat (搜狗)",   type: "text",
    url: "https://weixin.sogou.com/weixin?type=2&query=QUERY&page=1",
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  },
  { id: "qwant",      name: "Qwant",          type: "text",
    url: "https://www.qwant.com/?q=QUERY&t=web"
  },
  { id: "startpage",  name: "Startpage",      type: "text",
    url: "https://www.startpage.com/do/search?q=QUERY&cluster=web"
  },
  { id: "caixin",     name: "Caixin (财新)",   type: "text",
    url: "https://search.caixin.com/search/?keyword=QUERY",
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  },
  { id: "stackoverflow", name: "Stack Overflow", type: "text",
    url: "https://stackoverflow.com/search?q=QUERY"
  },
  { id: "wolfram",    name: "Wolfram Alpha",  type: "text",
    url: "https://www.wolframalpha.com/input?i=QUERY"
  },
  { id: "arxiv",      name: "arXiv",          type: "text",
    url: "http://export.arxiv.org/api/query?search_query=all:QUERY&max_results=COUNT"
  }
];

// Skipped (too heavy or blocked):
// - m.so.com (360): 457KB HTML, too heavy for JSC
// - sogou.com: 555KB HTML, too heavy
// - eastmoney.com: redirect, investment-specific
// - github trending: no query param, not a search engine

var DEFAULT_ENGINES = ["hn", "reddit", "bing", "ddg", "weixin"];
var DEFAULT_COUNT = 5;
var TIMEOUT_MS = 10000;

// ─── Engine Lookup ──────────────────────────────────────────────────────────

function getEngine(id) {
  for (var i = 0; i < ENGINE_LIST.length; i++) {
    if (ENGINE_LIST[i].id === id) return ENGINE_LIST[i];
  }
  return null;
}

function buildUrl(engine, query, count) {
  var c = count || DEFAULT_COUNT;
  return engine.url.replace(/QUERY/g, encodeURIComponent(query)).replace(/COUNT/g, String(c));
}

// ─── HTML/Text Stripping ───────────────────────────────────────────────────

function stripHtml(html) {
  // Remove scripts, styles, head
  var text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  // Replace block elements with newlines
  text = text.replace(/<\/(div|p|h[1-6]|li|tr|br|article|section)[^>]*>/gi, "\n");
  text = text.replace(/<br[^>]*>/gi, "\n");
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, "");
  // Decode entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  // Collapse whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  // Return first 3000 chars
  return text.substring(0, 3000);
}

// ─── Fetch Helpers ──────────────────────────────────────────────────────────

function fetchOne(engine, query, count) {
  var url = buildUrl(engine, query, count);
  var opts = { timeout: TIMEOUT_MS };
  if (engine.headers) {
    opts.headers = {};
    var keys = Object.keys(engine.headers);
    for (var i = 0; i < keys.length; i++) {
      opts.headers[keys[i]] = engine.headers[keys[i]];
    }
  }
  return fetch(url, opts).then(function(res) {
    if (!res.ok) {
      return { engine: engine.id, error: "HTTP " + res.status, url: url };
    }
    if (engine.type === "json") {
      return res.json().then(function(data) {
        return { engine: engine.id, data: data, url: url };
      });
    }
    return res.text().then(function(text) {
      return { engine: engine.id, text: text, url: url };
    });
  }).catch(function(err) {
    return { engine: engine.id, error: err.message || String(err), url: url };
  });
}

// ─── Result Formatting ──────────────────────────────────────────────────────

function formatJsonResult(engine, data, count) {
  var items = data;
  if (engine.resultsKey) {
    items = data;
    var keys = engine.resultsKey.split(".");
    for (var i = 0; i < keys.length; i++) {
      items = items && items[keys[i]];
    }
  }
  if (!items || !Array.isArray(items)) {
    return "  (no results)";
  }
  var lines = [];
  var limit = Math.min(count || DEFAULT_COUNT, items.length);
  for (var i = 0; i < limit; i++) {
    if (engine.formatter && typeof engine.formatter === "function") {
      lines.push("  " + (i + 1) + ". " + engine.formatter(items[i]));
    } else {
      lines.push("  " + (i + 1) + ". " + JSON.stringify(items[i]).substring(0, 200));
    }
  }
  return lines.join("\n");
}

function formatTextResult(engine, text) {
  if (!text || text.length < 20) return "  (empty response)";
  var stripped = stripHtml(text);
  // Try to extract meaningful lines
  var lines = stripped.split("\n").filter(function(l) {
    return l.trim().length > 20;
  });
  if (lines.length === 0) {
    return "  (no text content extracted, " + text.length + " bytes raw)";
  }
  var out = lines.slice(0, 10);
  return out.map(function(l) { return "  " + l.trim().substring(0, 200); }).join("\n");
}

function formatResults(results, query, count) {
  var out = [];
  out.push("## Search: \"" + query + "\"");
  out.push("");

  var total = 0;
  var errors = 0;
  var engineNames = {};

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var eng = getEngine(r.engine);
    var name = eng ? eng.name : r.engine;
    engineNames[r.engine] = name;

    if (r.error) {
      out.push("### " + name + " ❌ " + r.error);
      errors++;
      continue;
    }

    if (eng && eng.type === "json") {
      var formatted = formatJsonResult(eng, r.data, count);
      var itemCount = formatted.split("\n").filter(function(l) { return /^\s+\d+\./.test(l); }).length;
      total += itemCount;
      out.push("### " + name + " (" + itemCount + " results)");
      out.push(formatted);
    } else {
      var textFormatted = formatTextResult(eng, r.text);
      out.push("### " + name + " (text)");
      out.push(textFormatted);
    }
    out.push("");
  }

  out.push("---");
  out.push("Fetched " + results.length + " engines, " + errors + " errors");
  return out.join("\n");
}

// ─── Core Actions ────────────────────────────────────────────────────────────

/**
 * Search across engines.
 * @param {string} query - search query (required)
 * @param {string[]} engines - engine IDs (default: hn, reddit, bing, ddg, weixin)
 * @param {number} count - results per engine (default: 5)
 * @returns {Promise<object>} { query, results, formatted }
 */
function search(params) {
  var query = params.query || params.q || "";
  if (!query) return Promise.resolve({ error: "query is required" });

  var engineIds;
  if (params.engines) {
    if (typeof params.engines === "string") {
      engineIds = params.engines.split(",").map(function(s) { return s.trim(); });
    } else {
      engineIds = params.engines;
    }
  } else {
    engineIds = DEFAULT_ENGINES;
  }

  var count = parseInt(params.count || DEFAULT_COUNT, 10);
  if (isNaN(count) || count < 1) count = DEFAULT_COUNT;
  if (count > 20) count = 20;

  // Build fetch promises
  var engineObjs = [];
  for (var i = 0; i < engineIds.length; i++) {
    var eng = getEngine(engineIds[i]);
    if (eng) engineObjs.push(eng);
  }

  if (engineObjs.length === 0) {
    return Promise.resolve({ error: "no valid engines specified. Available: " + getEngineIds().join(", ") });
  }

  var promises = [];
  for (var i = 0; i < engineObjs.length; i++) {
    promises.push(fetchOne(engineObjs[i], query, count));
  }

  return Promise.all(promises).then(function(results) {
    var formatted = formatResults(results, query, count);
    return { query: query, engineCount: results.length, results: results, formatted: formatted };
  });
}

/**
 * List available engines.
 */
function listEngines() {
  var out = [];
  for (var i = 0; i < ENGINE_LIST.length; i++) {
    var e = ENGINE_LIST[i];
    var skipped = (DEFAULT_ENGINES.indexOf(e.id) === -1) ? "" : " [default]";
    out.push(e.id + " — " + e.name + " (" + e.type + ")" + skipped);
  }
  return out.join("\n");
}

function getEngineIds() {
  return ENGINE_LIST.map(function(e) { return e.id; });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

/**
 * Whistant handler(event, context)
 * event.action: "search" | "engines" | "help"
 */
function handler(event, context) {
  var action = (event && event.action) || "help";
  if (action === "search" || action === "query") {
    return search(event || {});
  }
  if (action === "engines" || action === "list") {
    return Promise.resolve({ engines: ENGINE_LIST.map(function(e) {
      return { id: e.id, name: e.name, type: e.type };
    }), formatted: listEngines() });
  }
  return Promise.resolve({
    usage: "cn-web-search: multi-engine search coordinator",
    actions: ["search", "engines"],
    examples: [
      'runFromParams({action:"search", query:"AI news"})',
      'runFromParams({action:"search", query:"AI news", engines:"hn,reddit,bing"})',
      'runFromParams({action:"engines"})'
    ]
  });
}

// ─── Exports ─────────────────────────────────────────────────────────────────

var exportsObj = {
  // Engine management
  listEngines: listEngines,
  getEngineIds: getEngineIds,
  getEngine: getEngine,
  ENGINE_LIST: ENGINE_LIST,

  // Core
  search: search,
  handler: handler,

  // Utilities
  buildUrl: buildUrl,
  stripHtml: stripHtml,
  fetchOne: fetchOne,
  formatResults: formatResults,

  // Command parsing
  parseCommand: parseCommand,
  tokenize: tokenize,
  runFromParams: runFromParams
};

try {
  module.exports = exportsObj;
} catch (e) {
  // module undefined in JSC terminal — use globalThis
}
try {
  if (typeof globalThis !== 'undefined') {
    globalThis.cn_web_search = exportsObj;
  }
} catch (e) {}

// ─── Command Parsing ─────────────────────────────────────────────────────────

function tokenize(input) {
  if (!input) return [];
  var tokens = [];
  var current = "";
  var inQuote = false;
  var quoteChar = "";

  for (var i = 0; i < input.length; i++) {
    var ch = input[i];
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false;
        quoteChar = "";
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === " ") {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function parseCommand(tokens) {
  if (!tokens || tokens.length === 0) return { action: "help" };
  var parsed = { action: "search", query: "", engines: DEFAULT_ENGINES.join(","), count: DEFAULT_COUNT };
  var positional = [];

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t === "--query" || t === "-q") {
      parsed.query = tokens[++i] || "";
    } else if (t === "--engines" || t === "-e") {
      parsed.engines = tokens[++i] || DEFAULT_ENGINES.join(",");
    } else if (t === "--count" || t === "-n") {
      parsed.count = parseInt(tokens[++i] || DEFAULT_COUNT, 10);
    } else if (t === "engines" || t === "list") {
      parsed.action = "engines";
    } else if (t === "help" || t === "--help") {
      parsed.action = "help";
    } else if (!t.startsWith("--")) {
      positional.push(t);
    }
  }

  // Positional first arg = query if not already set
  if (positional.length > 0 && !parsed.query) {
    parsed.query = positional.join(" ");
  }

  return parsed;
}

// ─── runFromParams ───────────────────────────────────────────────────────────

function runFromParams(inputParams) {
  var params;
  if (inputParams) {
    params = inputParams;
  } else if (typeof PARAMS !== 'undefined' && PARAMS !== null) {
    params = PARAMS;
  } else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) {
    try { params = JSON.parse(PARAMS_JSON); } catch (e) { params = {}; }
  } else {
    params = {};
  }

  if (params.action === "engines" || params.action === "list") {
    return Promise.resolve(listEngines());
  }
  if (params.action === "help" || (!params.query && !params.q && params.action !== "search")) {
    return Promise.resolve("cn-web-search v1.0\n" +
      "Usage: run /skills/cn-web-search/scripts/cn-web-search.js --query \"QUERY\" [--engines hn,reddit,bing] [--count 5]\n" +
      "Commands: engines (list engines), help (this message)\n" +
      "Flags: --query/-q TEXT, --engines/-e IDS, --count/-n N\n" +
      "Default engines: " + DEFAULT_ENGINES.join(", "));
  }

  return search(params).then(function(result) {
    return result.formatted || JSON.stringify(result, null, 2);
  });
}

// ─── Node CLI ────────────────────────────────────────────────────────────────

try {
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    var args = process.argv.slice(2);
    var cliParams = parseCommand(args);
    runFromParams(cliParams).then(function(output) {
      console.log(output);
    }).catch(function(err) {
      console.error(err.message || err);
      process.exit(1);
    });
  }
} catch (e) {
  // JSC: module undefined or require.main not available
}

// ─── PARAMS Auto-Run ─────────────────────────────────────────────────────────

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
