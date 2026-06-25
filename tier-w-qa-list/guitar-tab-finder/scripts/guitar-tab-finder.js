/**
 * Guitar Tab Finder — Search for guitar tabs/chords/sheet music
 * Uses Brave Search API to find tabs, ranks by source reputation.
 *
 * Usage:
 *   /code: var gtf = require("/skills/guitar-tab-finder/scripts/guitar-tab-finder.js");
 *   /cmd:  guitar-tab-finder --song "Blackbird" --artist "Beatles"
 */

var BRAVE_API = "https://api.search.brave.com/res/v1/web/search";

// Source reputation → confidence mapping
var SOURCE_REPUTATION = {
  "ultimate-guitar.com": { confidence: "high", note: "Ultimate Guitar — most comprehensive tab archive" },
  "tabs.ultimate-guitar.com": { confidence: "high", note: "Ultimate Guitar" },
  "songsterr.com": { confidence: "high", note: "Songsterr — interactive tab player" },
  "musescore.com": { confidence: "medium", note: "MuseScore — community sheet music" },
  "guitartabs.cc": { confidence: "high", note: "Guitar Tabs — large community database" },
  "e-chords.com": { confidence: "medium", note: "E-Chords — chords and tabs" },
  "chordify.net": { confidence: "medium", note: "Chordify — chords from any song" },
  "chords-and-tabs.com": { confidence: "medium", note: "Chords & Tabs" },
  "yourchords.com": { confidence: "medium", note: "YourChords" },
  "guitartabsexplorer.com": { confidence: "medium", note: "Guitar Tabs Explorer" },
  "guitaretab.com": { confidence: "medium", note: "GuitareTab" },
  "911tabs.com": { confidence: "medium", note: "911Tabs — tab aggregator" },
  "jamplay.com": { confidence: "medium", note: "JamPlay — premium lessons" }
};

/**
 * Get the API key from available sources.
 */
function _getApiKey() {
  if (typeof globalThis !== "undefined" && globalThis.BRAVE_SEARCH_API_KEY) {
    return globalThis.BRAVE_SEARCH_API_KEY;
  }
  if (typeof process !== "undefined" && process.env && process.env.BRAVE_SEARCH_API_KEY) {
    return process.env.BRAVE_SEARCH_API_KEY;
  }
  if (typeof keychain !== "undefined") {
    try {
      var k = keychain.get("BRAVE_SEARCH_API_KEY");
      if (k) { return k; }
    } catch (_) {}
  }
  return null;
}

/**
 * Search Brave for tabs.
 * @param {string} query — search query
 * @param {number} [count=10] — max results
 * @returns {object} { ok, results: [{title, url, description}], error? }
 */
async function searchBrave(query, count) {
  count = count || 10;
  var apiKey = _getApiKey();
  if (!apiKey) {
    return { ok: false, error: "Brave Search API key not configured. Set BRAVE_SEARCH_API_KEY in keychain or globalThis." };
  }
  try {
    var url = BRAVE_API + "?q=" + encodeURIComponent(query) + "&count=" + count;
    var opts = {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey
      },
      timeout: 15000
    };
    var res = await fetch(url, opts);
      if (!res.ok) { return { ok: false, error: "Brave API HTTP " + res.status }; }
      var data = await res.json();
      var web = data.web;
      if (!web || !web.results) { return { ok: true, results: [] }; }
      var results = [];
      for (var i = 0; i < web.results.length; i++) {
        var r = web.results[i];
        results.push({
          title: r.title || "",
          url: r.url || "",
          description: r.description || ""
        });
      }
      return { ok: true, results: results };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

/**
 * Resolve a YouTube URL to song info via oEmbed.
 */
async function resolveYouTube(url) {
  try {
    var oembedUrl = "https://www.youtube.com/oembed?url=" + encodeURIComponent(url) + "&format=json";
    var opts = { timeout: 8000 };
    var res = await fetch(oembedUrl, opts);
    if (!res.ok) { return null; }
    var data = await res.json();
    return { title: data.title || "", channel: data.author_name || "" };
  } catch (_) {
    return null;
  }
}

/**
 * Assess source reputation for a URL.
 */
function assessSource(url) {
  var u = (url || "").toLowerCase();
  var keys = Object.keys(SOURCE_REPUTATION);
  for (var i = 0; i < keys.length; i++) {
    if (u.indexOf(keys[i]) !== -1) {
      return SOURCE_REPUTATION[keys[i]];
    }
  }
  return { confidence: "low", note: "Community/personal site — verify accuracy" };
}

/**
 * Detect if URL is likely paywalled.
 */
function isPaywalled(url, title) {
  var combined = ((url || "") + " " + (title || "")).toLowerCase();
  var paywalled = ["subscription", "premium", "pro only", "paid", "unlock"];
  for (var i = 0; i < paywalled.length; i++) {
    if (combined.indexOf(paywalled[i]) !== -1) { return true; }
  }
  return false;
}

/**
 * Main: Find guitar tabs for a song.
 * @param {string|object} input — song title, "Artist - Song", or YouTube URL
 * @param {object} [opts] — {count: 10, arrangement: "fingerstyle"|"drop d"|etc}
 * @returns {object} { ok, song, artist, tabs: [{source, url, confidence, reason, paywalled}], error? }
 */
async function findTabs(input, opts) {
  opts = opts || {};
  var count = opts.count || 10;
  var arrangement = opts.arrangement || "";

  if (!input) {
    return { ok: false, error: "Song title, artist, or YouTube URL required" };
  }

  var song = "";
  var artist = "";
  var isUrl = typeof input === "string" && (input.indexOf("youtube.com") !== -1 || input.indexOf("youtu.be") !== -1);

  if (isUrl) {
    var yt = await resolveYouTube(input);
    if (!yt || !yt.title) {
      return { ok: false, error: "Could not resolve YouTube URL" };
    }
    song = yt.title;
    if (yt.channel) { artist = yt.channel; }
  } else if (typeof input === "string" && input.indexOf(" - ") !== -1) {
    var parts = input.split(" - ");
    artist = parts[0].trim();
    song = parts.slice(1).join(" - ").trim();
  } else if (typeof input === "object") {
    song = input.song || input.title || "";
    artist = input.artist || "";
  } else {
    song = input;
  }

  if (!song) {
    return { ok: false, error: "Could not determine song" };
  }

  // Build search queries
  var queries = [];
  var base = "";
  if (artist) { base = artist + " "; }
  base += song;

  if (arrangement && arrangement.toLowerCase() !== "standard") {
    queries.push(base + " " + arrangement + " tab");
    queries.push(base + " " + arrangement + " guitar tab");
  }
  queries.push(base + " guitar tab");
  queries.push(base + " chords");

  // Search and collect
  var allResults = [];
  var seenUrls = {};
  for (var q = 0; q < queries.length; q++) {
    if (allResults.length >= count * 2) { break; }
    var sr = await searchBrave(queries[q], count);
    if (!sr.ok || !sr.results) { continue; }
    for (var i = 0; i < sr.results.length; i++) {
      var r = sr.results[i];
      var normUrl = r.url.replace(/\/$/, "").toLowerCase();
      if (seenUrls[normUrl]) { continue; }
      seenUrls[normUrl] = true;
      allResults.push(r);
    }
  }

  // Rank and annotate
  var tabs = [];
  for (var j = 0; j < allResults.length; j++) {
    var r = allResults[j];
    var source = assessSource(r.url);
    var baseTitle = r.title || "";
    // Try to extract source name from URL
    var urlMatch = r.url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    var sourceName = urlMatch ? urlMatch[1] : "unknown";
    tabs.push({
      source: sourceName,
      title: baseTitle,
      url: r.url,
      description: r.description || "",
      confidence: source.confidence,
      reason: source.note + (r.description ? " — " + r.description.substring(0, 120) : ""),
      paywalled: isPaywalled(r.url, r.title)
    });
  }

  // Sort: high > medium > low confidence
  var confOrder = { "high": 0, "medium": 1, "low": 2 };
  tabs.sort(function (a, b) {
    var ca = confOrder[a.confidence] || 2;
    var cb = confOrder[b.confidence] || 2;
    return ca - cb;
  });

  // Limit results
  var topTabs = tabs.slice(0, count);

  return {
    ok: true,
    song: song,
    artist: artist || "unknown",
    arrangement: arrangement || "standard",
    totalFound: tabs.length,
    tabs: topTabs
  };
}

/**
 * Format results as a practice note (markdown, for AI to present).
 */
function formatPracticeNote(result) {
  if (!result.ok) { return "Error: " + (result.error || "unknown"); }
  var lines = [];
  lines.push("- status: to learn");
  lines.push("- song: " + result.song);
  lines.push("- artist: " + (result.artist || "unknown"));
  lines.push("- arrangement: " + (result.arrangement || "standard"));
  var highest = result.tabs[0];
  if (highest) {
    var tuningHint = highest.description && highest.description.toLowerCase();
    if (tuningHint && tuningHint.indexOf("tuning") !== -1) {
      var m = tuningHint.match(/tuning[:\s]+([A-Ga-g#b\s]+)/);
      if (m) { lines.push("- tuning: " + m[1].trim()); }
    }
  }
  lines.push("- capo: <if known>");
  lines.push("- difficulty: <beginner/intermediate/advanced/unknown>");
  lines.push("");
  lines.push("- best tab links:");
  for (var i = 0; i < result.tabs.length; i++) {
    var t = result.tabs[i];
    var conf = t.confidence.toUpperCase();
    var pw = t.paywalled ? " ⚠️PAYWALLED" : "";
    lines.push("  - " + t.source + " — " + t.url + " (" + conf + pw + "; " + t.reason + ")");
  }
  lines.push("");
  lines.push("- next practice step: <single concrete step>");
  return lines.join("\n");
}

// ─── handler ───────────────────────────────────────────────────────────────────

function handler(event, context) {
  var input = (event && event.song) || (event && event.url) || (event && event.query) || (event && event.input);
  if (!input) {
    return Promise.resolve({ ok: false, error: "song or url required", usage: "guitar-tab-finder --song \"Blackbird\" --artist \"Beatles\"" });
  }
  // If artist provided separately, build combined input
  if (event && event.artist) {
    input = { song: input, artist: event.artist };
  }
  var opts = {
    count: (event && event.count) || 10,
    arrangement: (event && event.arrangement) || ""
  };
  return findTabs(input, opts).then(function (result) {
    if (result.ok) {
      result.formatted = formatPracticeNote(result);
    }
    return result;
  });
}

// ─── exports ────────────────────────────────────────────────────────────────────

var exports = {
  handler: handler,
  findTabs: findTabs,
  searchBrave: searchBrave,
  resolveYouTube: resolveYouTube,
  assessSource: assessSource,
  formatPracticeNote: formatPracticeNote,
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
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t === "--song" || t === "-s") { if (i + 1 < tokens.length) { params.song = tokens[++i]; } }
    else if (t === "--artist" || t === "-a") { if (i + 1 < tokens.length) { params.artist = tokens[++i]; } }
    else if (t === "--url") { if (i + 1 < tokens.length) { params.url = tokens[++i]; } }
    else if (t === "--arrangement") { if (i + 1 < tokens.length) { params.arrangement = tokens[++i]; } }
    else if (t === "--count" || t === "-c") { if (i + 1 < tokens.length) { params.count = parseInt(tokens[++i], 10); } }
    else if (!t.match(/^-/)) { params.song = (params.song ? params.song + " " : "") + t; }
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
  var input;
  if (params.url) {
    input = params.url;
  } else if (params.song && params.artist) {
    input = { song: params.song, artist: params.artist };
  } else if (params.song) {
    input = params.song;
  } else {
    console.log("Usage: guitar-tab-finder --song \"title\" --artist \"name\" [--arrangement fingerstyle] [--count 5]");
    console.log("       guitar-tab-finder --url \"https://www.youtube.com/watch?v=...\"");
    return { ok: false, error: "song or url required" };
  }
  var opts = {
    count: params.count || 5,
    arrangement: params.arrangement || ""
  };
  var result = await findTabs(input, opts);
  if (!result.ok) {
    console.log("Error: " + (result.error || "unknown"));
    return result;
  }
  console.log(formatPracticeNote(result));
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

try {
  if (typeof globalThis !== "undefined") {
    globalThis.guitar_tab_finder = exports;
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
