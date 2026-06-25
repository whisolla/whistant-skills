/**
 * skill-goldprice — Real-time precious metal prices
 * 
 * Uses the free api.gold-api.com JSON API (no API key required).
 * Supports: Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD).
 * 
 * Evolved from 108518/skill-goldprice — original used Playwright to scrape
 * jzj9999.com HTML. Replaced with clean JSON API for Whistant JSC compat.
 */

// ── Metal definitions ──────────────────────────────────────────

var METALS = {
  "XAU": { name: "Gold", symbol: "XAU", emoji: "🥇" },
  "XAG": { name: "Silver", symbol: "XAG", emoji: "🥈" },
  "XPT": { name: "Platinum", symbol: "XPT", emoji: "🔹" },
  "XPD": { name: "Palladium", symbol: "XPD", emoji: "🔸" }
};

var METAL_ALIASES = {
  "gold": "XAU", "au": "XAU", "xau": "XAU",
  "silver": "XAG", "ag": "XAG", "xag": "XAG",
  "platinum": "XPT", "pt": "XPT", "xpt": "XPT",
  "palladium": "XPD", "pd": "XPD", "xpd": "XPD"
};

var ALL_SYMBOLS = ["XAU", "XAG", "XPT", "XPD"];

// ── API ────────────────────────────────────────────────────────

var API_BASE = "https://api.gold-api.com/price/";

/**
 * Fetch price for a single metal symbol.
 * @param {string} symbol - XAU, XAG, XPT, or XPD
 * @returns {object} { symbol, name, emoji, price, currency, updatedAt, error? }
 */
async function _fetchMetal(symbol) {
  var sym = symbol.toUpperCase();
  try {
    var resp = await fetch(API_BASE + sym, { timeout: 10000 });
    if (!resp.ok) {
      return { symbol: sym, error: "HTTP " + resp.status };
    }
    var data = JSON.parse(await resp.text());
    return {
      symbol: sym,
      name: data.name || METALS[sym] ? METALS[sym].name : sym,
      emoji: METALS[sym] ? METALS[sym].emoji : "🔘",
      price: data.price,
      currency: data.currency || "USD",
      updatedAt: data.updatedAt || null
    };
  } catch (e) {
    return { symbol: sym, error: e.message || String(e) };
  }
}

/**
 * Fetch prices for all supported metals.
 * @returns {array} Array of metal price objects.
 */
async function getAllPrices() {
  var results = [];
  for (var i = 0; i < ALL_SYMBOLS.length; i++) {
    results.push(await _fetchMetal(ALL_SYMBOLS[i]));
  }
  return results;
}

/**
 * Fetch price for a single metal by symbol or alias.
 * @param {string} query - Symbol (XAU) or alias (gold, silver, etc.)
 * @returns {object} Metal price object.
 */
async function getPrice(query) {
  var q = (query || "").trim();
  var symbol = METAL_ALIASES[q.toLowerCase()] || q.toUpperCase();
  return await _fetchMetal(symbol);
}

// ── Formatting ─────────────────────────────────────────────────

/**
 * Format a single metal price for display.
 */
function formatPrice(metal) {
  if (metal.error) {
    return "  " + metal.symbol + ": Error — " + metal.error;
  }
  var priceStr = metal.price != null
    ? metal.currency + " " + Number(metal.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "N/A";
  var timeStr = metal.updatedAt
    ? " (updated " + new Date(metal.updatedAt).toLocaleString() + ")"
    : "";
  return "  " + metal.emoji + " " + metal.name + " (" + metal.symbol + "): " + priceStr + timeStr;
}

/**
 * Format all metal prices as a Markdown report.
 */
function formatAllPrices(metals) {
  var lines = [];
  lines.push("## 💰 Precious Metal Prices");
  lines.push("");
  var now = new Date().toLocaleString();
  lines.push("> Retrieved: " + now);
  lines.push("");
  lines.push("| Metal | Symbol | Price (USD) |");
  lines.push("|-------|--------|-------------|");
  for (var i = 0; i < metals.length; i++) {
    var m = metals[i];
    if (m.error) {
      lines.push("| " + m.emoji + " " + m.name + " | " + m.symbol + " | Error: " + m.error + " |");
    } else {
      var price = m.price != null ? "$" + Number(m.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A";
      lines.push("| " + m.emoji + " " + m.name + " | " + m.symbol + " | " + price + " |");
    }
  }
  lines.push("");
  lines.push("Data from [gold-api.com](https://api.gold-api.com) — free, no API key required.");
  return lines.join("\n");
}

// ── Handler ────────────────────────────────────────────────────

/**
 * Handler for Whistant agent dispatching.
 */
async function handler(event, context) {
  var action = (event && event.action) ? event.action : "all";
  var metal = (event && event.metal) ? event.metal : null;

  switch (action) {
    case "all":
      var prices = await getAllPrices();
      return { text: formatAllPrices(prices), prices: prices };
    case "get":
      if (!metal) {
        return { text: "⚠️  Please specify a metal: gold, silver, platinum, or palladium.", prices: [] };
      }
      var result = await getPrice(metal);
      return { text: formatPrice(result), prices: [result] };
    default:
      return { text: "⚠️  Unknown action: " + action + ". Use 'all' or 'get'.", prices: [] };
  }
}

// ── Exports ────────────────────────────────────────────────────

var goldPriceApi = {
  getAllPrices: getAllPrices,
  getPrice: getPrice,
  formatPrice: formatPrice,
  formatAllPrices: formatAllPrices,
  handler: handler,
  METALS: METALS,
  METAL_ALIASES: METAL_ALIASES
};

// ── Command parsing ────────────────────────────────────────────

/**
 * Parse /cmd arguments into action + params.
 * Supports: --metal (or positional), --action
 */
function parseCommand(args) {
  var params = { action: "all", metal: null };
  if (!args || args.length === 0) return params;

  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--metal" && i + 1 < args.length) {
      params.metal = args[i + 1];
      params.action = "get";
      i++;
    } else if (args[i] === "--action" && i + 1 < args.length) {
      params.action = args[i + 1];
      i++;
    } else if (args[i] === "--help" || args[i] === "-h") {
      params.action = "help";
    } else if (!args[i].startsWith("--") && !params.metal && params.action === "all") {
      // Positional: treat first positional as metal
      params.metal = args[i];
      params.action = "get";
    }
  }
  return params;
}

// ── runFromParams ──────────────────────────────────────────────

/**
 * Auto-run entry point for /cmd path.
 * Reads global PARAMS injected by TerminalManager.
 */
async function runFromParams(inputParams) {
  var p = inputParams;
  if (!p && typeof PARAMS !== "undefined" && PARAMS !== null) p = PARAMS;
  if (!p && typeof PARAMS_JSON !== "undefined" && PARAMS_JSON) p = JSON.parse(PARAMS_JSON);
  if (!p) p = {};

  // Parse command string from PARAMS.command (TerminalManager format)
  var cmdStr = p.command || "";
  var args = cmdStr ? cmdStr.trim().split(/\s+/) : [];
  
  // Also check --metal from PARAMS directly
  if (p.metal && !args.includes("--metal")) {
    args.push("--metal", p.metal);
  }
  
  var cmd = parseCommand(args);

  if (cmd.action === "help") {
    return "## skill-goldprice — Precious Metal Prices\n\n" +
      "**Data:** Free JSON API from api.gold-api.com — no API key required.\n\n" +
      "### `/cmd` Usage\n\n" +
      "| Command | Description |\n" +
      "|---------|-------------|\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js` | Show all 4 metals |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js gold` | Gold price |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js silver` | Silver price |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js platinum` | Platinum price |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js palladium` | Palladium price |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js --metal XAU` | By symbol |\n" +
      "| `run /skills/skill-goldprice/scripts/skill-goldprice.js --help` | This help |\n\n" +
      "### `/code` Usage\n\n" +
      "```js\n" +
      "var g = require(\"/skills/skill-goldprice/scripts/skill-goldprice.js\");\n" +
      "console.log(await g.getAllPrices());\n" +
      "console.log(g.formatAllPrices(await g.getAllPrices()));\n" +
      "console.log(g.formatPrice(await g.getPrice(\"gold\")));\n" +
      "```\n\n" +
      "### Supported Metals\n\n" +
      "| Symbol | Name | Alias |\n" +
      "|--------|------|-------|\n" +
      "| XAU | Gold 🥇 | gold, au |\n" +
      "| XAG | Silver 🥈 | silver, ag |\n" +
      "| XPT | Platinum 🔹 | platinum, pt |\n" +
      "| XPD | Palladium 🔸 | palladium, pd |";
  }

  var result = await handler({ action: cmd.action, metal: cmd.metal }, {});
  return result.text;
}

// ── Node CLI ────────────────────────────────────────────────────

if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var cliArgs = process.argv.slice(2);
  runFromParams({ _: cliArgs }).then(function (output) {
    console.log(output);
  }).catch(function (err) {
    console.error(err.message || String(err));
    if (typeof process !== "undefined" && process.exit) process.exit(1);
  });
}

// ── Module exports ──────────────────────────────────────────────

if (typeof module !== "undefined" && module.exports) {
  module.exports = goldPriceApi;
}

// ── PARAMS auto-run for /cmd ────────────────────────────────────

if (typeof module === "undefined" &&
    ((typeof PARAMS !== "undefined" && PARAMS !== null) ||
     (typeof PARAMS_JSON !== "undefined" && PARAMS_JSON))) {
  return (async function () {
    var result = await runFromParams();
    if (typeof console !== "undefined" && console.log) {
      console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function (err) {
    if (typeof console !== "undefined" && console.error) {
      console.error(err && err.message ? err.message : String(err));
    }
    throw err;
  });
}
