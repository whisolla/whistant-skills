/**
 * Letterboxd Watchlist Scraper
 * Scrape a public Letterboxd user's watchlist.
 *
 * Usage:
 *   /code: var lb = require("/skills/letterboxd-watchlist/scripts/letterboxd-watchlist.js");
 *   /cmd:  letterboxd-watchlist --user david
 */

var BASE_URL = "https://letterboxd.com";
var USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

/**
 * Validate a Letterboxd username.
 * @param {string} username
 * @returns {string} cleaned username
 */
function validateUsername(username) {
  if (!username || typeof username !== "string") {
    throw new Error("username is required");
  }
  var cleaned = username.trim().replace(/\/+$/, "").replace(/^\//, "");
  if (!cleaned) { throw new Error("username is required"); }
  if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) {
    throw new Error("username contains invalid characters");
  }
  return cleaned;
}

/**
 * Fetch a URL with retries.
 * @param {string} url
 * @param {number} [timeout=30]
 * @param {number} [retries=1]
 * @returns {string} HTML body
 */
async function fetchPage(url, timeout, retries) {
  timeout = timeout || 30;
  retries = retries || 1;
  var lastErr;
  for (var attempt = 0; attempt <= retries; attempt++) {
    try {
      var controller;
      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
      }
      var opts = {
        headers: { "User-Agent": USER_AGENT },
        signal: controller ? controller.signal : undefined
      };
      var timer = null;
      if (controller) {
        timer = setTimeout(function () { controller.abort(); }, timeout * 1000);
      } else {
        timer = setTimeout(function () { lastErr = new Error("timeout"); }, timeout * 1000);
      }
      try {
        var res = await fetch(url, opts);
        if (!res.ok) {
          if (res.status === 404) { return ""; }
          throw new Error("HTTP " + res.status);
        }
        var html = await res.text();
        return html;
      } finally {
        if (timer) { clearTimeout(timer); }
      }
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        await sleep(500 * (attempt + 1));
      }
    }
  }
  throw lastErr || new Error("fetch failed");
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

/**
 * Decode HTML entities in a string.
 * Uses a regex approach that handles the common cases.
 */
function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, function (_, dec) { return String.fromCharCode(parseInt(dec, 10)); });
}

/**
 * Scrape a public Letterboxd watchlist.
 * @param {string} username
 * @param {object} [opts] — {maxPages, delayMs, timeout, retries}
 * @returns {object} { ok, items: [{title, link}], count, pages }
 */
async function scrapeWatchlist(username, opts) {
  opts = opts || {};
  var maxPages = opts.maxPages || 500;
  var delayMs = opts.delayMs || 0;
  var timeout = opts.timeout || 30;
  var retries = opts.retries || 1;

  try {
    username = validateUsername(username);
  } catch (e) {
    return { ok: false, error: e.message };
  }

  var seen = {};
  var items = [];
  var totalPages = 0;

  for (var page = 1; page <= maxPages; page++) {
    var url = BASE_URL + "/" + username + "/watchlist/page/" + page + "/";
    var html;
    try {
      html = await fetchPage(url, timeout, retries);
    } catch (e) {
      return { ok: false, error: "fetch page " + page + ": " + (e.message || String(e)), items: items };
    }

    // Extract film entries: data-item-name + data-target-link
    var found = extractFilms(html);

    if (found.length === 0) {
      break; // no more pages
    }

    for (var i = 0; i < found.length; i++) {
      var film = found[i];
      var key = film.title + "|" + film.link;
      if (seen[key]) { continue; }
      seen[key] = true;
      items.push(film);
    }

    totalPages = page;

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    ok: true,
    username: username,
    items: items,
    count: items.length,
    pages: totalPages
  };
}

/**
 * Extract film entries from a watchlist page HTML.
 * Uses data-item-name and data-target-link attributes.
 */
function extractFilms(html) {
  var films = [];
  if (!html) { return films; }

  // Pattern: data-item-name="Title (Year)" ... data-target-link="/film/slug/"
  // These appear together in the same react-component div
  var blocks = html.split('<li class="griditem">');
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var nameMatch = block.match(/data-item-name="([^"]*)"/);
    var linkMatch = block.match(/data-target-link="([^"]*)"/);
    if (nameMatch && linkMatch) {
      var title = decodeHTMLEntities(nameMatch[1]).trim();
      var link = BASE_URL + linkMatch[1];
      films.push({ title: title, link: link });
    }
  }
  return films;
}

/**
 * Format watchlist results as CSV.
 */
function formatCSV(items) {
  var lines = ["title,link"];
  for (var i = 0; i < items.length; i++) {
    var title = items[i].title.replace(/"/g, '""');
    lines.push('"' + title + '","' + items[i].link + '"');
  }
  return lines.join("\n");
}

/**
 * Format watchlist results as JSONL.
 */
function formatJSONL(items) {
  var lines = [];
  for (var i = 0; i < items.length; i++) {
    lines.push(JSON.stringify(items[i]));
  }
  return lines.join("\n");
}

/**
 * Format a summary of the watchlist.
 */
function formatSummary(result) {
  if (!result.ok) {
    return "Error: " + (result.error || "unknown");
  }
  var lines = [];
  lines.push("📽️ " + result.username + "'s Watchlist");
  lines.push("Films: " + result.count + " (across " + result.pages + " pages)");
  lines.push("");
  for (var i = 0; i < result.items.length; i++) {
    lines.push((i + 1) + ". " + result.items[i].title);
    lines.push("   " + result.items[i].link);
  }
  return lines.join("\n");
}

// ─── handler ───────────────────────────────────────────────────────────────────

function handler(event, context) {
  var username = (event && event.username) || (event && event.user);
  var action = (event && event.action) || "scrape";
  if (!username) {
    return Promise.resolve({ ok: false, error: "username is required", usage: "letterboxd-watchlist --user <username> [--format csv|jsonl|summary] [--max-pages 10]" });
  }
  var opts = {
    maxPages: (event && event.maxPages) || (event && event["max-pages"]) || 500,
    delayMs: (event && event.delayMs) || (event && event["delay-ms"]) || 250,
    timeout: (event && event.timeout) || 30,
    retries: (event && event.retries) || 1
  };
  return scrapeWatchlist(username, opts).then(function (result) {
    if (!result.ok) { return result; }
    var format = (event && event.format) || "summary";
    if (format === "csv") {
      return { ok: true, username: result.username, count: result.count, pages: result.pages, csv: formatCSV(result.items), items: result.items };
    }
    if (format === "jsonl") {
      return { ok: true, username: result.username, count: result.count, pages: result.pages, jsonl: formatJSONL(result.items), items: result.items };
    }
    // default: summary
    result.formatted = formatSummary(result);
    return result;
  });
}

// ─── exports ────────────────────────────────────────────────────────────────────

var exports = {
  handler: handler,
  scrapeWatchlist: scrapeWatchlist,
  validateUsername: validateUsername,
  extractFilms: extractFilms,
  formatCSV: formatCSV,
  formatJSONL: formatJSONL,
  formatSummary: formatSummary,
  runFromParams: runFromParams,
  parseCommand: parseCommand,
  tokenize: tokenize
};

// ─── command parsing ────────────────────────────────────────────────────────────

function tokenize(cmd) {
  var tokens = [];
  var current = "";
  var inQuote = false;
  var quoteChar = "";
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if (inQuote) {
      if (ch === quoteChar) { inQuote = false; quoteChar = ""; }
      else { current += ch; }
    } else if (ch === "\"" || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) { tokens.push(current); }
  return tokens;
}

function parseCommand(rawCmd) {
  var tokens = tokenize(rawCmd || "");
  var params = {};
  params.action = "scrape";
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t === "--user" || t === "-u") { if (i + 1 < tokens.length) { params.username = tokens[++i]; } }
    else if (t === "--format" || t === "-f") { if (i + 1 < tokens.length) { params.format = tokens[++i]; } }
    else if (t === "--max-pages") { if (i + 1 < tokens.length) { params.maxPages = parseInt(tokens[++i], 10); } }
    else if (t === "--delay-ms") { if (i + 1 < tokens.length) { params.delayMs = parseInt(tokens[++i], 10); } }
    else if (t === "--timeout") { if (i + 1 < tokens.length) { params.timeout = parseInt(tokens[++i], 10); } }
    else if (!t.match(/^-/) && !params.username) { params.username = t; }
  }
  return params;
}

// ─── runFromParams ──────────────────────────────────────────────────────────────

async function runFromParams(params) {
  if (!params || typeof params !== "object") { params = {}; }
  // Fall back to PARAMS global when called from /cmd auto-run block
  if (Object.keys(params).length === 0 && typeof PARAMS !== 'undefined' && PARAMS) {
    var rawCmd = typeof PARAMS === 'string' ? PARAMS : (PARAMS.command || PARAMS.text || '');
    if (rawCmd) { params = parseCommand(rawCmd); }
  }
  var username = params.username || params.user;
  if (!username) {
    console.log("Usage: letterboxd-watchlist --user <username> [--format csv|jsonl|summary] [--max-pages 10]");
    return { ok: false, error: "username is required" };
  }
  var opts = {
    maxPages: params.maxPages || params["max-pages"] || 500,
    delayMs: params.delayMs || params["delay-ms"] || 0,
    timeout: params.timeout || 30,
    retries: params.retries || 1
  };
  var result = await scrapeWatchlist(username, opts);
  if (!result.ok) {
    console.log("Error: " + (result.error || "unknown"));
    return result;
  }
  var format = params.format || "summary";
  if (format === "csv") {
    var csv = formatCSV(result.items);
    console.log(csv);
    result.formatted = csv;
    return result;
  }
  if (format === "jsonl") {
    var jsonl = formatJSONL(result.items);
    console.log(jsonl);
    result.formatted = jsonl;
    return result;
  }
  console.log(formatSummary(result));
  return result;
}

// ─── Node CLI ───────────────────────────────────────────────────────────────────

try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exports;
  }
  if (typeof process !== "undefined" && process.argv && process.argv.length > 2) {
    var args = process.argv.slice(2).join(" ");
    var p = parseCommand(args);
    runFromParams(p).catch(function (e) { console.error(e); });
  }
} catch (_) { /* JSC — no module */ }

// module undefined in JSC terminal — use globalThis
try {
  if (typeof globalThis !== "undefined") {
    globalThis.letterboxd_watchlist = exports;
  }
} catch (_) {}

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
