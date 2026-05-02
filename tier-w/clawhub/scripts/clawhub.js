// clawhub.js — search and install pre-vetted OpenClaw skills compatible with Whistant JS runtime
// Usage (top-level await is supported):
//   const clawhub = require('/skills/clawhub/scripts/clawhub.js');
//   console.log(JSON.stringify(await clawhub.search('meeting notes'), null, 2));
//   console.log(await clawhub.install('jeffjhunter/ai-meeting-notes'));

// Catalog: 735 skills (5 pre-installed + 60 compatible + 46 not_compatible + 650+ may_work + 40k+ excluded)
// Format: ["creator/slug", downloads, "description"]
// Status tiers: compatible_installed (5), compatible (60), not_compatible (46), may_work_directly (650+)
// Update CATALOG_VERSION whenever the catalog is regenerated so the vector cache auto-invalidates.
var _catalog = require('/skills/clawhub/scripts/catalog.js');
const CATALOG_VERSION = _catalog.CATALOG_VERSION;
const CATALOG = _catalog.CATALOG;
const COMPATIBLE_INSTALLED = _catalog.COMPATIBLE_INSTALLED;
const COMPATIBLE = _catalog.COMPATIBLE;
const NOT_COMPATIBLE = _catalog.NOT_COMPATIBLE;
const getSkillStatus = _catalog.getSkillStatus;
var fs = require('fs');

// Base URL for fetching SKILL.md from the clawdbot/skills GitHub mirror
const RAW_BASE = 'https://raw.githubusercontent.com/clawdbot/skills/main/skills';

// Catalog texts for semantic search — built once at require() time
var _catalogTexts = CATALOG.map(function(e) { return e[0] + ' ' + (e[2] || ''); });

/**
 * Search the catalog.
 * Blends semantic (nlEmbed.semanticRank) + keyword + popularity scores.
 * Falls back to keyword-only when nlEmbed is unavailable.
 * @param {string} query
 * @param {number} [limit=10]
 * @returns {Promise<Array<{slug, downloads, desc, status, score}>>}
 *
 * Status meanings:
 *   "compatible_installed" — pre-installed (5 default: clawhub, skill-creator, weather, google, microsoft)
 *   "compatible" — locally available, whistant-compatible, not pre-installed (60 skills)
 *   "not_compatible" — deep screened, requires Python/shell/binaries (45 skills)
 *   "may_work_directly" — JS-only code found, simple screened (625+ skills)
 */
async function search(query, limit) {
  limit = limit || 10;
  if (!query || !query.trim()) return [];

  var maxDl = CATALOG[0][1] || 1;
  var normDl = function(dl) { return Math.log2(Math.max(dl, 1)) / Math.log2(maxDl); };

  // --- Keyword scoring (always computed) ---
  var words = query.toLowerCase().split(/[\s\-\/]+/).filter(Boolean);
  var kwScores = new Array(CATALOG.length);
  for (var i = 0; i < CATALOG.length; i++) {
    var slug = CATALOG[i][0].toLowerCase();
    var desc = (CATALOG[i][2] || '').toLowerCase();
    var hits = 0;
    for (var w = 0; w < words.length; w++) {
      if (slug.indexOf(words[w]) !== -1) hits += 3;
      if (desc.indexOf(words[w]) !== -1) hits += 1;
    }
    kwScores[i] = Math.min(hits / (4 * words.length), 1);
  }

  // --- Blended path: semantic (via native semanticRank) + keyword + downloads ---
  if (typeof nlEmbed !== 'undefined' && nlEmbed.semanticRank) {
    var semScores = await nlEmbed.semanticRank(query, _catalogTexts);
    var results = [];
    for (var i = 0; i < CATALOG.length; i++) {
      var sem = semScores[i] || 0;
      var kw = kwScores[i];
      if (sem < 0.35 && kw === 0) continue;
      var combined = Math.max(sem, 0) * 0.4 + kw * 0.4 + normDl(CATALOG[i][1]) * 0.2;
      results.push({ slug: CATALOG[i][0], downloads: CATALOG[i][1], desc: CATALOG[i][2] || '', status: getSkillStatus(CATALOG[i]), score: combined });
    }
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, limit);
  }

  // --- Keyword-only fallback (no nlEmbed bridge) ---
  var results = [];
  for (var i = 0; i < CATALOG.length; i++) {
    if (kwScores[i] === 0) continue;
    results.push({ slug: CATALOG[i][0], downloads: CATALOG[i][1], desc: CATALOG[i][2] || '', status: getSkillStatus(CATALOG[i]), score: kwScores[i] * 0.7 + normDl(CATALOG[i][1]) * 0.3 });
  }
  results.sort(function(a, b) { return b.score - a.score; });
  var top = results.slice(0, limit);
  if (top.length === 0 || (top[0] && top[0].score < 0.3)) _logUnmetSearch(query);
  return top;
}

/**
 * Install a skill by fetching its SKILL.md from the clawdbot/skills repo.
 * Writes to skills/<creator>/<slug>/SKILL.md in app Documents.
 * @param {string} creatorSlug - e.g. 'jeffjhunter/ai-meeting-notes'
 * @returns {Promise<string>} status message
 */
async function install(skillId) {
  if (!skillId) throw new Error('Skill name or creator/slug required');
  var isLocal = skillId.indexOf('/') === -1; // local skill (no creator prefix)

  var destDir = '/skills/' + skillId;
  var destFile = destDir + '/SKILL.md';

  if (fs.existsSync(destFile)) {
    return skillId + ' is already installed at ' + destFile;
  }

  if (isLocal) {
    // Local/backend skill — fetch file manifest from backend API
    var apiUrl = 'https://whisolla.com:2083/api/skills/install/' + encodeURIComponent(skillId);
    var resp = await fetch(apiUrl);
    if (!resp.ok) {
      throw new Error('Backend skill not found: ' + skillId + ' (HTTP ' + resp.status + ')');
    }
    var data = await resp.json();
    if (!data.files || data.files.length === 0) {
      throw new Error('No files found for skill: ' + skillId);
    }
    // Write all files from the manifest
    fs.mkdirSync(destDir, { recursive: true });
    for (var i = 0; i < data.files.length; i++) {
      var f = data.files[i];
      var filePath = destDir + '/' + f.path;
      var fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (fileDir && !fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
      if (f.encoding === 'base64') {
        // Binary file — decode base64
        var binary = atob(f.content);
        var bytes = new Uint8Array(binary.length);
        for (var j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
        fs.writeFileSync(filePath, bytes);
      } else {
        fs.writeFileSync(filePath, f.content);
      }
    }
    if (typeof __reloadSkills === 'function') __reloadSkills();
    return 'Installed ' + skillId + ' (' + data.files.length + ' files) -> ' + destDir;
  }

  // Community skill (creator/slug) — fetch from GitHub
  var parts = skillId.split('/');
  var creator = parts[0], slug = parts[1];

  var inCatalog = CATALOG.some(function(e) { return e[0] === skillId; });
  if (!inCatalog) {
    console.log('Warning: ' + skillId + ' is not in the vetted catalog. Attempting install anyway.');
  }

  var url = RAW_BASE + '/' + creator + '/' + slug + '/SKILL.md';
  var resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch SKILL.md for ' + skillId + ' (HTTP ' + resp.status + '). Check the creator/slug spelling.');
  }
  var content = await resp.text();
  if (!content.trim()) {
    throw new Error('SKILL.md is empty for ' + skillId);
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destFile, content);
  if (typeof __reloadSkills === 'function') __reloadSkills();
  return 'Installed ' + skillId + ' -> ' + destFile + '.';
}

/**
 * List top skills by downloads.
 * @param {number} [limit=20]
 * Returns: { slug, downloads, desc, status }
 * Status: "compatible_installed" (5 default), "compatible" (60 available), "not_compatible" (46 blocked), "may_work_directly" (650+ JS-only)
 */
function list(limit) {
  limit = limit || 20;
  return CATALOG.slice(0, limit).map(function(e) {
    return { slug: e[0], downloads: e[1], desc: e[2] || '', status: getSkillStatus(e) };
  });
}

/**
 * Uninstall a skill by removing its directory.
 * Only works for community (creator/slug) skills, not built-in skills.
 * @param {string} creatorSlug
 */
function uninstall(creatorSlug) {
  if (!creatorSlug || creatorSlug.split('/').length !== 2) {
    throw new Error('Expected format: creator/slug');
  }
  var destDir = '/skills/' + creatorSlug;
  if (!fs.existsSync(destDir)) {
    throw new Error(creatorSlug + ' is not installed.');
  }
  // remove dir recursively using readdirSync + unlinkSync (no rmdir recursive in sandbox)
  function removeDir(dir) {
    var entries = fs.readdirSync(dir);
    for (var i = 0; i < entries.length; i++) {
      var full = dir + '/' + entries[i];
      try {
        fs.readdirSync(full); // if this succeeds it's a dir
        removeDir(full);
      } catch(e) {
        // it's a file
        fs.unlinkSync ? fs.unlinkSync(full) : fs.writeFileSync(full, ''); // fallback: zero it
      }
    }
    fs.rmdirSync ? fs.rmdirSync(dir) : null;
  }
  removeDir(destDir);
  if (typeof __reloadSkills === 'function') __reloadSkills();
  return 'Uninstalled ' + creatorSlug;
}

// --- Usage log ---
// usage_log.json  — append-only raw events: { slug, outcome, note, ts }
// usage_stats.json — pre-aggregated summary: { [slug]: { total, success, lastUsed } }
const USAGE_LOG_PATH = '/skills/clawhub/usage_log.json';
const USAGE_STATS_PATH = '/skills/clawhub/usage_stats.json';

function _readUsageLog() {
  try {
    if (!fs.existsSync(USAGE_LOG_PATH)) return [];
    return JSON.parse(fs.readFileSync(USAGE_LOG_PATH, 'utf8'));
  } catch (e) { return []; }
}

function _readUsageStats() {
  try {
    if (!fs.existsSync(USAGE_STATS_PATH)) return {};
    return JSON.parse(fs.readFileSync(USAGE_STATS_PATH, 'utf8'));
  } catch (e) { return {}; }
}

function _writeUsageStats(stats) {
  try { fs.writeFileSync(USAGE_STATS_PATH, JSON.stringify(stats)); } catch (e) {}
}

/**
 * Log a skill usage event.
 * @param {string} slug - skill name or creator/slug
 * @param {"success"|"fail"|"partial"} outcome
 * @param {string} [note] - optional context
 */
function logUsage(slug, outcome, note) {
  if (!slug || !outcome) throw new Error('logUsage requires slug and outcome');
  var ts = new Date().toISOString();

  // Append to raw log
  var log = [];
  try {
    if (fs.existsSync(USAGE_LOG_PATH)) log = JSON.parse(fs.readFileSync(USAGE_LOG_PATH, 'utf8'));
  } catch (e) {}
  log.push({ slug: slug, outcome: outcome, note: note || '', ts: ts });
  if (log.length > 500) log = log.slice(log.length - 500);
  try { fs.writeFileSync(USAGE_LOG_PATH, JSON.stringify(log)); } catch (e) {}

  // Update pre-aggregated stats incrementally
  var stats = _readUsageStats();
  var s = stats[slug] || { total: 0, success: 0, lastUsed: '' };
  s.total += 1;
  if (outcome === 'success') s.success += 1;
  if (ts > s.lastUsed) s.lastUsed = ts;
  stats[slug] = s;
  _writeUsageStats(stats);

  if (typeof __syncSkillsHeader === 'function') __syncSkillsHeader();
  var msg = 'Logged ' + outcome + ' for ' + slug;
  console.log(msg);
  return msg;
}

/**
 * Get usage summary for a skill (or all skills if slug omitted).
 * @param {string} [slug]
 * @returns {{ slug: string, total: number, lastUsed: string, successRate: number }[]}
 */
function usageSummary(slug) {
  var log = _readUsageLog();
  var bySlug = {};
  for (var i = 0; i < log.length; i++) {
    var e = log[i];
    if (slug && e.slug !== slug && !e.slug.startsWith(slug + '/')) continue;
    if (!bySlug[e.slug]) bySlug[e.slug] = { total: 0, success: 0, lastUsed: e.ts };
    bySlug[e.slug].total++;
    if (e.outcome === 'success') bySlug[e.slug].success++;
    if (e.ts > bySlug[e.slug].lastUsed) bySlug[e.slug].lastUsed = e.ts;
  }

  // Build result with sub-slug grouping: if a slug like "weather/wttr.in" exists,
  // also synthesize a parent "weather" entry that aggregates sub-slugs.
  var subSlugs = {};  // parentSlug -> [childSlug, ...]
  for (var s in bySlug) {
    var slashIdx = s.lastIndexOf('/');
    // Only treat as sub-slug if parent segment looks like a skill name (no dots)
    if (slashIdx > 0) {
      var parent = s.slice(0, slashIdx);
      var child = s.slice(slashIdx + 1);
      // Heuristic: if child looks like a provider (no path separator), treat as sub-slug
      if (child.indexOf('/') === -1 && parent.indexOf('/') === -1) {
        if (!subSlugs[parent]) subSlugs[parent] = [];
        subSlugs[parent].push(s);
      }
    }
  }

  // Synthesize parent entries for sub-slug groups (only if parent not already explicitly logged)
  for (var parent in subSlugs) {
    if (!bySlug[parent]) {
      var children = subSlugs[parent];
      var pTotal = 0, pSuccess = 0, pLastUsed = '';
      for (var ci = 0; ci < children.length; ci++) {
        var cd = bySlug[children[ci]];
        pTotal += cd.total; pSuccess += cd.success;
        if (cd.lastUsed > pLastUsed) pLastUsed = cd.lastUsed;
      }
      bySlug[parent] = { total: pTotal, success: pSuccess, lastUsed: pLastUsed, synthetic: true };
    }
  }

  var result = [];
  for (var s in bySlug) {
    var d = bySlug[s];
    var entry = { slug: s, total: d.total, lastUsed: d.lastUsed, successRate: Math.round((d.success / d.total) * 100) / 100 };
    if (d.synthetic) entry.note = 'aggregated from sub-slugs: ' + subSlugs[s].join(', ');
    // Attach provider breakdown if this slug has sub-slugs
    if (subSlugs[s]) {
      entry.providers = subSlugs[s].map(function(cs) {
        var cd = bySlug[cs];
        return { slug: cs, total: cd.total, successRate: Math.round((cd.success / cd.total) * 100) / 100 };
      }).sort(function(a, b) { return b.successRate - a.successRate; });
    }
    result.push(entry);
  }
  return result.sort(function(a, b) { return b.total - a.total; });
}

// --- Annotations / notes ---

/**
 * Append a usage note to a skill's _notes.md file.
 * Notes accumulate over time — the LLM's learned knowledge about using a skill.
 * @param {string} slug - skill name (e.g. "weather") or creator/slug (e.g. "creator/skill")
 * @param {string} note - what was learned
 */
function annotate(slug, note) {
  if (!slug || !note) throw new Error('annotate requires slug and note');
  var dir = '/skills/' + slug;
  if (!fs.existsSync(dir)) throw new Error(slug + ' is not installed at ' + dir);
  var notesFile = dir + '/_notes.md';
  var existing = '';
  try { existing = fs.readFileSync(notesFile, 'utf8'); } catch (e) {}
  var timestamp = new Date().toISOString().slice(0, 10);
  var entry = '\n- [' + timestamp + '] ' + note;
  if (!existing) {
    existing = '# Usage Notes\n\nLearned knowledge from prior usage of this skill.\n';
  }
  fs.writeFileSync(notesFile, existing + entry + '\n');
  return 'Note added to ' + notesFile;
}

/**
 * Read annotations for a skill.
 * @param {string} slug
 * @returns {string|null}
 */
function getNotes(slug) {
  var notesFile = '/skills/' + slug + '/_notes.md';
  try { return fs.readFileSync(notesFile, 'utf8'); } catch (e) { return null; }
}

// --- Self-diagnostic / status ---
// Tracks unmet searches — queries where no good result was found.
const UNMET_SEARCHES_PATH = '/skills/clawhub/unmet_searches.json';

function _logUnmetSearch(query) {
  try {
    var list = [];
    try { list = JSON.parse(fs.readFileSync(UNMET_SEARCHES_PATH, 'utf8')); } catch (e) {}
    list.push({ query: query, ts: new Date().toISOString() });
    if (list.length > 100) list = list.slice(list.length - 100);
    fs.writeFileSync(UNMET_SEARCHES_PATH, JSON.stringify(list));
  } catch (e) {}
}

/**
 * Self-diagnostic: overview of the skill ecosystem health.
 * @returns {{ installed: number, recentlyUsed: string[], neverUsed: string[], recentFailures: object[], unmetSearches: string[] }}
 */
function status() {
  // Installed skills: scan /skills/ for SKILL.md
  var installed = [];
  try {
    var top = fs.readdirSync('/skills/');
    for (var i = 0; i < top.length; i++) {
      var name = top[i];
      if (name.startsWith('.')) continue;
      var skillPath = '/skills/' + name + '/SKILL.md';
      if (fs.existsSync(skillPath)) {
        installed.push(name);
        continue;
      }
      // Check creator/slug pattern
      try {
        var subs = fs.readdirSync('/skills/' + name);
        for (var j = 0; j < subs.length; j++) {
          if (fs.existsSync('/skills/' + name + '/' + subs[j] + '/SKILL.md')) {
            installed.push(name + '/' + subs[j]);
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  // Usage log analysis
  var log = _readUsageLog();
  var sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  var usedSlugs = {};
  var recentFailures = [];
  for (var k = 0; k < log.length; k++) {
    var entry = log[k];
    if (entry.ts >= sevenDaysAgo) {
      usedSlugs[entry.slug] = true;
      if (entry.outcome === 'fail') {
        recentFailures.push({ slug: entry.slug, note: entry.note, when: entry.ts });
      }
    }
  }

  var recentlyUsed = Object.keys(usedSlugs);
  var neverUsed = installed.filter(function(s) {
    // Never appears in any log entry at all
    return !log.some(function(e) { return e.slug === s; });
  });

  // Unmet searches
  var unmetSearches = [];
  try {
    var raw = JSON.parse(fs.readFileSync(UNMET_SEARCHES_PATH, 'utf8'));
    // Deduplicate, show recent unique queries
    var seen = {};
    for (var m = raw.length - 1; m >= 0 && unmetSearches.length < 10; m--) {
      var q = raw[m].query;
      if (!seen[q]) { seen[q] = true; unmetSearches.push(q); }
    }
  } catch (e) {}

  return {
    installed: installed.length,
    installedSkills: installed,
    recentlyUsed: recentlyUsed,
    neverUsed: neverUsed,
    recentFailures: recentFailures.slice(-10),
    unmetSearches: unmetSearches
  };
}


/**
 * Run an installed skill by finding its main script and invoking it.
 * Looks for `main:` frontmatter in SKILL.md, falls back to scripts/<slug>.js or scripts/index.js.
 * @param {string} slug - e.g. "weather" or "jeffjhunter/ai-meeting-notes"
 * @param {object} [args] - key/value args passed as globalThis properties before execution
 * @returns {Promise<any>} result from the skill's exports
 */
async function run(slug, args) {
  if (!slug) throw new Error('run requires a skill slug');

  // Resolve skill directory
  var skillDir;
  if (slug.indexOf('/') !== -1) {
    skillDir = '/skills/' + slug;
  } else {
    if (fs.existsSync('/skills/' + slug + '/SKILL.md')) {
      skillDir = '/skills/' + slug;
    } else {
      throw new Error('Skill "' + slug + '" not found. Install it first with clawhub.install()');
    }
  }

  var skillMdPath = skillDir + '/SKILL.md';
  if (!fs.existsSync(skillMdPath)) {
    throw new Error('Skill "' + slug + '" is not installed (no SKILL.md at ' + skillMdPath + ')');
  }

  // Extract skill name (last segment of slug)
  var skillName = slug.split('/').pop();

  // Find main script: check SKILL.md frontmatter for `main:`, then fallback
  var mainScript = null;
  try {
    var md = fs.readFileSync(skillMdPath, 'utf8');
    var mainMatch = md.match(/^main:\s*(.+)$/m);
    if (mainMatch) {
      var rel = mainMatch[1].trim();
      mainScript = skillDir + '/' + rel;
    }
  } catch (e) {}

  if (!mainScript) {
    var candidates = [
      skillDir + '/scripts/' + skillName + '.js',
      skillDir + '/scripts/index.js',
      skillDir + '/index.js',
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (fs.existsSync(candidates[i])) { mainScript = candidates[i]; break; }
    }
  }

  if (!mainScript) {
    throw new Error(
      'Skill "' + slug + '" has no runnable script. ' +
      'It may be a SKILL.md-only (instruction) skill — read its SKILL.md for manual instructions. ' +
      'Checked: ' + skillDir + '/scripts/'
    );
  }

  // Inject args as globalThis properties
  if (args && typeof args === 'object') {
    var keys = Object.keys(args);
    for (var k = 0; k < keys.length; k++) {
      globalThis[keys[k]] = args[keys[k]];
    }
  }

  return require(mainScript);
}

/**
 * Log a query that had no useful skill match. Populates status().unmetSearches.
 * @param {string} query
 */
function logUnmetSearch(query) {
  if (!query) throw new Error('logUnmetSearch requires a query string');
  _logUnmetSearch(query);
  return 'Logged unmet search: ' + query;
}

/**
 * Sync catalog from backend if newer version available.
 * Called at app startup or on-demand to check for catalog updates.
 * Backend controls the catalog — includes skill list, status tiers, and metadata.
 *
 * Version Check: Only syncs if backend version > current version.
 * Skip if versions match (no unnecessary file writes).
 *
 * When backend version > frontend version:
 *   1. Download latest catalog.js and not_feasible.js
 *   2. Save to skills/clawhub/scripts/ (Whistant sandbox path)
 *   3. Vector cache auto-invalidates (CATALOG_VERSION mismatch)
 *   4. Next search regenerates embeddings
 *
 * Returns: { synced: boolean, oldVersion: string, newVersion: string, note: string }
 */
async function syncCatalogFromBackend() {
  try {
    // In production, this would call backend API: /api/skills/catalog-sync
    // Example:
    // const syncInfo = await fetch('/api/skills/catalog-sync').then(r => r.json());
    //
    // Response:
    // {
    //   version: "20260414-736",
    //   catalog: { path: "...", content: "const CATALOG = ...", hash: "abc123" },
    //   notFeasible: { path: "...", content: "const NOT_FEASIBLE = ...", hash: "def456" }
    // }

    console.log('[clawhub] syncCatalogFromBackend: Feature requires backend API integration');
    console.log('[clawhub] Current catalog version:', CATALOG_VERSION);
    console.log('[clawhub] TODO: Implement GET /api/skills/catalog-sync endpoint');
    console.log('[clawhub] TODO: Save to skills/clawhub/scripts/catalog.js when version differs');

    return {
      synced: false,
      oldVersion: CATALOG_VERSION,
      newVersion: null,
      note: 'Backend API integration required',
      implementation: {
        endpoint: 'GET /api/skills/catalog-sync',
        savePath: 'skills/clawhub/scripts/catalog.js',
        logic: 'if (backendVersion > currentVersion) { fs.writeFileSync(savePath, content); }'
      }
    };
  } catch (e) {
    console.error('[clawhub] Catalog sync error:', e.message);
    return {
      synced: false,
      oldVersion: CATALOG_VERSION,
      error: e.message
    };
  }
}

module.exports = { search: search, install: install, run: run, list: list, uninstall: uninstall, logUsage: logUsage, logUnmetSearch: logUnmetSearch, usageSummary: usageSummary, annotate: annotate, getNotes: getNotes, status: status, syncCatalogFromBackend: syncCatalogFromBackend };
globalThis.clawhub = module.exports;
