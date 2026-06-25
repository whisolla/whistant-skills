/**
 * Book of the Day — Daily book oracle
 * API: https://book-of-the-day.vercel.app
 *
 * Usage:
 *   /code: var botd = require("/skills/book-of-the-day/scripts/book-of-the-day.js");
 *   /cmd:  book-of-the-day --date 2026-05-26
 */

var API_BASE = "https://book-of-the-day.vercel.app";
var ARCHETYPES = {
  "The Explorer": { emoji: "🧭", energy: "Curiosity, discovery, adventure" },
  "The Sage": { emoji: "🦉", energy: "Wisdom, reflection, depth" },
  "The Creator": { emoji: "🎨", energy: "Imagination, expression, beauty" },
  "The Hero": { emoji: "⚡", energy: "Courage, action, resilience" },
  "The Dreamer": { emoji: "✨", energy: "Vision, possibility, wonder" },
  "The Healer": { emoji: "🌿", energy: "Nurture, connection, renewal" }
};

/**
 * Fetch today's book or a specific date.
 * @param {string} [date] — YYYY-MM-DD, defaults to today
 * @returns {object} { ok, book, error? }
 */
async function getBook(date) {
  try {
    var url = API_BASE + "/";
    if (date) { url += "?date=" + encodeURIComponent(date); }
    var opts = { headers: { "Accept": "application/json" }, timeout: 10000 };
    var res = await fetch(url, opts);
    if (!res.ok) { return { ok: false, error: "HTTP " + res.status }; }
    var data = await res.json();
    return { ok: true, book: data };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

/**
 * Get all archetypes and their info.
 * @returns {object} archetype map
 */
function getArchetypes() {
  return ARCHETYPES;
}

/**
 * Get info for a specific archetype.
 * @param {string} name — archetype name
 * @returns {object|null}
 */
function getArchetype(name) {
  return ARCHETYPES[name] || null;
}

/**
 * Format a book for display.
 * @param {object} book — raw API book object
 * @returns {string} formatted output
 */
function formatBook(book) {
  var lines = [];
  var arch = ARCHETYPES[book.archetype];
  lines.push("🔮 Today's Book");
  lines.push("");
  if (arch) { lines.push(arch.emoji + " " + book.archetype); }
  lines.push("");
  lines.push("### *" + book.title + "* — " + book.author);
  lines.push("");
  if (book.topics && book.topics.length) { lines.push("Topics: " + book.topics.join(", ")); }
  lines.push("Rating: " + Math.round(book.rating * 100) / 100 + "/5");
  lines.push("");
  if (book.description) { lines.push(book.description); }
  if (book.cover_url) { lines.push(""); lines.push("Cover: " + book.cover_url); }
  return lines.join("\n");
}

/**
 * Format a full fortune reading (for AI consumption).
 * @param {object} book — raw API book object
 * @returns {string} fortune reading prompt context
 */
function formatFortuneContext(book) {
  var lines = [];
  var arch = ARCHETYPES[book.archetype];
  lines.push("Book: " + book.title + " by " + book.author);
  if (arch) { lines.push("Archetype: " + arch.emoji + " " + book.archetype + " (" + arch.energy + ")"); }
  if (book.topics && book.topics.length) { lines.push("Topics: " + book.topics.join(", ")); }
  lines.push("Description: " + book.description);
  return lines.join("\n");
}

// ─── handler ───────────────────────────────────────────────────────────────────

function handler(event, context) {
  var action = (event && event.action) || "get";
  if (action === "archetypes") {
    return Promise.resolve({ archetypes: getArchetypes(), formatted: Object.keys(getArchetypes()).map(function(k) { var a = getArchetypes()[k]; return a.emoji + " " + k + " — " + a.energy; }).join("\n") });
  }
  if (action === "archetype") {
    var info = getArchetype(event && event.archetype);
    if (!info) { return Promise.resolve({ error: "Archetype not found: " + (event && event.archetype) }); }
    return Promise.resolve({ archetype: event && event.archetype, emoji: info.emoji, energy: info.energy });
  }
  if (action === "context") {
    return getBook(event && event.date).then(function(r) {
      if (!r.ok) { return r; }
      return { ok: true, context: formatFortuneContext(r.book), book: r.book };
    });
  }
  // default: get
  return getBook(event && event.date).then(function(r) {
    if (!r.ok) { return r; }
    return { ok: true, book: r.book, formatted: formatBook(r.book) };
  });
}

// ─── exports ────────────────────────────────────────────────────────────────────

var exports = {
  handler: handler,
  getBook: getBook,
  getArchetypes: getArchetypes,
  getArchetype: getArchetype,
  formatBook: formatBook,
  formatFortuneContext: formatFortuneContext,
  runFromParams: runFromParams,
  parseCommand: parseCommand,
  tokenize: tokenize
};

// ─── command parsing ────────────────────────────────────────────────────────────

/**
 * Tokenize a command string, respecting quoted strings.
 */
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

/**
 * Parse command tokens into named parameters.
 */
function parseCommand(rawCmd) {
  var tokens = tokenize(rawCmd || "");
  var params = {};
  params.action = "get";
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t === "--date" || t === "-d") { if (i + 1 < tokens.length) { params.date = tokens[++i]; } }
    else if (t === "--archetypes") { params.action = "archetypes"; }
    else if (t === "--archetype" || t === "-a") { if (i + 1 < tokens.length) { params.action = "archetype"; params.archetype = tokens[++i]; } }
    else if (t === "--context") { params.action = "context"; }
  }
  return params;
}

// ─── runFromParams ──────────────────────────────────────────────────────────────

async function runFromParams(params) {
  if (!params || typeof params !== "object") { params = {}; }
  var action = params.action || "get";
  if (action === "archetypes") {
    var archs = getArchetypes();
    var lines = ["📋 Archetypes:"];
    var keys = Object.keys(archs);
    for (var i = 0; i < keys.length; i++) {
      var a = archs[keys[i]];
      lines.push("  " + a.emoji + " " + keys[i] + " — " + a.energy);
    }
    console.log(lines.join("\n"));
    return lines;
  }
  if (action === "archetype") {
    var info = getArchetype(params.archetype);
    if (!info) { console.log("Archetype not found: " + params.archetype); return null; }
    console.log(info.emoji + " " + params.archetype + " — " + info.energy);
    return info;
  }
  if (action === "context") {
    var result = await getBook(params.date);
    if (!result.ok) { console.log("Error: " + result.error); return result; }
    console.log(formatFortuneContext(result.book));
    return result;
  }
  // default: get
  var result = await getBook(params.date);
  if (!result.ok) { console.log("Error: " + result.error); return result; }
  console.log(formatBook(result.book));
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
  if (typeof globalThis !== 'undefined') {
    globalThis.book_of_the_day = exports;
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
