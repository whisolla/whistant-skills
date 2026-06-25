// clawhub.js — search and install pre-vetted OpenClaw skills compatible with Whistant JS runtime
// Usage (top-level await is supported):
//   const clawhub = require('/skills/clawhub/scripts/clawhub.js');
//   console.log(JSON.stringify(await clawhub.search('meeting notes'), null, 2));
//   console.log(await clawhub.install('jeffjhunter/ai-meeting-notes'));

// Catalog and status tiers are defined in catalog.js (canonical source)
// Update CATALOG_VERSION whenever the catalog is regenerated so the vector cache auto-invalidates.
var _catalog = require('/skills/clawhub/scripts/catalog.js');
const CATALOG_VERSION = _catalog.CATALOG_VERSION;
const CATALOG = _catalog.CATALOG;
const COMPATIBLE_INSTALLED = _catalog.COMPATIBLE_INSTALLED;
const COMPATIBLE = _catalog.COMPATIBLE;
const NOT_COMPATIBLE = _catalog.NOT_COMPATIBLE;
const getSkillStatus = _catalog.getSkillStatus;
const SEARCH_TEXT_VERSION = 'category-before-desc-v1';
const VEC_CACHE_VERSION = CATALOG_VERSION + ':' + SEARCH_TEXT_VERSION;
var fs = require('fs');

// Backend API base for skill installs (both local and community skills)
const API_BASE = typeof __whistantServerUrl !== 'undefined' ? __whistantServerUrl : 'https://example.com';

function _apiUrl(path) {
  return API_BASE.replace(/\/$/, '') + path;
}

// Debounced sync — coalesces rapid install/uninstall bursts into one reload + header push.
// If multiple operations fire within 3s, only the last one triggers both __reloadSkills() and __syncSkillsHeader().
var _reloadTimer = null;
function _scheduleSync() {
  if (_reloadTimer) clearTimeout(_reloadTimer);
  _reloadTimer = setTimeout(function() {
    _reloadTimer = null;
    if (typeof __reloadSkills === 'function') __reloadSkills();
    if (typeof __syncSkillsHeader === 'function') __syncSkillsHeader();
  }, 3000);
}

// Catalog texts for semantic search — built once at require() time
var _catalogTexts = (CATALOG || []).map(function(e) {
  // Replace "/" with space so both author and skill-name are searchable tokens.
  // "jeffjhunter/ai-meeting-notes" embeds as "jeffjhunter ai-meeting-notes Description..."
  // "a-stock-analysis" embeds as "a-stock-analysis Description..."
  // Author queries ("jeffjhunter"), bare-name queries ("ai-meeting-notes"), and
  // combined queries ("jeffjhunter meeting notes") all work correctly.
  var embedText = (e && e[0] !== undefined) ? String(e[0]).replace('/', ' ') : '';
  return embedText + ' ' + (e[3] || '') + ' ' + (e[2] || '');
});
if (!CATALOG) console.log('[clawhub] WARNING: CATALOG failed to load from catalog.js — search/list will not work');

// ── Catalog vector cache (disk-persisted) ───────────────────────────────────
// Catalog texts are embedded once via nlEmbed.embed(text) and saved to disk.
// On each search only the query is embedded; cosine similarity is computed in JS.
// Cache auto-invalidates when CATALOG_VERSION changes.
var _vecCache = null;          // array of number[] (one vector per catalog entry)
var _vecCacheVersion = null;
var _vecCacheFile = '/db/clawhub_vec_cache.json';

function _cosine(a, b) {
  var dot = 0, na = 0, nb = 0, n = Math.min(a.length, b.length);
  for (var i = 0; i < n; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  var denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

async function _ensureVecCache() {
  if (_vecCache && _vecCacheVersion === VEC_CACHE_VERSION) return true;
  if (typeof nlEmbed === 'undefined' || !nlEmbed.embed) return false;

  // Load from disk if version matches
  if (fs.existsSync(_vecCacheFile)) {
    try {
      var raw = fs.readFileSync(_vecCacheFile, 'utf8');
      var cached = JSON.parse(raw);
      if (cached.version === VEC_CACHE_VERSION && Array.isArray(cached.vectors) && cached.vectors.length === CATALOG.length) {
        _vecCache = cached.vectors;
        _vecCacheVersion = VEC_CACHE_VERSION;
        console.log('[clawhub] Loaded vector cache from disk (' + _vecCache.length + ' vectors).');
        return true;
      }
      console.log('[clawhub] Stale vector cache (v' + cached.version + ' ≠ v' + VEC_CACHE_VERSION + '), rebuilding...');
    } catch (e) {
      console.log('[clawhub] Vector cache read error: ' + e.message + ', rebuilding...');
    }
  }

  // Build: embed each catalog text (Swift bridge caches internally, so restart is the only cost)
  console.log('[clawhub] Building vector cache (' + _catalogTexts.length + ' entries)...');
  var vectors = [];
  for (var i = 0; i < _catalogTexts.length; i++) {
    try {
      var vec = await nlEmbed.embed(_catalogTexts[i]);
      vectors.push(Array.isArray(vec) ? vec : []);
    } catch (e) {
      vectors.push([]);
    }
  }
  _vecCache = vectors;
  _vecCacheVersion = VEC_CACHE_VERSION;
  try {
    fs.writeFileSync(_vecCacheFile, JSON.stringify({ version: VEC_CACHE_VERSION, vectors: _vecCache }), 'utf8');
    console.log('[clawhub] Vector cache saved to disk (' + _vecCache.length + ' vectors).');
  } catch (e) {
    console.log('[clawhub] Vector cache write error: ' + e.message);
  }
  return true;
}

async function _getSemanticScores(query) {
  if (!await _ensureVecCache()) return null;
  try {
    var qVec = await nlEmbed.embed(query);
    if (!Array.isArray(qVec) || qVec.length === 0) return null;
    return _vecCache.map(function(v) { return v.length ? _cosine(qVec, v) : 0; });
  } catch (e) {
    console.log('[clawhub] nlEmbed.embed query error: ' + e.message);
    return null;
  }
}

/**
 * Search the catalog.
 * Blends semantic (nlEmbed.semanticRank) + keyword + popularity scores.
 * Falls back to keyword-only when nlEmbed is unavailable.
 * @param {string} query
 * @param {number} [limit=10]
 * @returns {Promise<Array<{slug, downloads, category, desc, status, score}>>}
 *
 * Status meanings:
 *   "compatible_installed" — pre-installed, always available
 *   "compatible" — L3-tested, whistant-compatible
 *   "not_compatible" — deep screened, non-JS runtime
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

  // --- Rank lists ---
  var ranked = CATALOG.map(function(e, i) {
    return { index: i, kwScore: kwScores[i], slug: e[0] };
  });

  // --- RRF constant (controls keyword vs semantic balance) ---
  // k=40: balanced fusion. Rank-1 gets ~2.3× more weight than rank-10,
  // so strong signals surface without either keyword or semantic dominating.
  var RRF_K = 40;

  // --- Keyword rank (desc: highest score = rank 1) ---
  ranked.sort(function(a, b) { return b.kwScore - a.kwScore; });
  var kwRanks = new Array(CATALOG.length);
  for (var r = 0; r < ranked.length; r++) kwRanks[ranked[r].index] = r + 1;

  // --- Semantic rank (nlEmbed.semanticRank per search) ---
  var semScores = await _getSemanticScores(query);
  if (semScores) {
    ranked.sort(function(a, b) {
      var sa = semScores[a.index] || 0, sb = semScores[b.index] || 0;
      return sb - sa;
    });
    var semRanks = new Array(CATALOG.length);
    for (var r2 = 0; r2 < ranked.length; r2++) semRanks[ranked[r2].index] = r2 + 1;
  }

  // --- Fuse: RRF = 1/(k+kwRank) + 1/(k+semRank), then sort by fused score ---
  // kwScore^4 boost: near-perfect keyword matches get an additive boost so they rank
  // above skills with better semantic rank but weaker keyword match.
  var results = [];
  for (var i = 0; i < CATALOG.length; i++) {
    if (kwScores[i] === 0 && (!semRanks || semRanks[i] === 0)) continue;
    var kwTerm = kwRanks[i] > 0 ? 1.0 / (RRF_K + kwRanks[i]) : 0;
    var semTerm = (semRanks && semRanks[i] > 0) ? 1.0 / (RRF_K + semRanks[i]) : 0;
    var fused = kwTerm + semTerm;
    if (fused === 0) continue;
    results.push({ slug: CATALOG[i][0], downloads: CATALOG[i][1], category: CATALOG[i][3] || '', desc: CATALOG[i][2] || '', status: getSkillStatus(CATALOG[i]), score: fused, kwScore: kwScores[i] });
  }
  for (var bi = 0; bi < results.length; bi++) {
    delete results[bi].kwScore;  // don't leak internal scoring data
  }
  results.sort(function(a, b) { return b.score - a.score; });
  var top = results.slice(0, limit);
  if (top.length === 0 || (top[0] && top[0].score < 0.01)) _logUnmetSearch(query);
  return JSON.stringify(top, null, 2);
}

/**
 * Install a skill.
 * - Local skill (no /): fetches file manifest from Whistant backend API.
 *   Backend returns all skill files (SKILL.md + scripts/, icons, etc.) in one call.
 * - Community skill (creator/slug): fetches all files from Whistant backend API (same as local).
 * @param {string} skillId - local skill name (e.g. 'hacker-news') or 'creator/slug' (e.g. 'jeffjhunter/ai-meeting-notes')
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
    // Local/backend skill — fetch file manifest from backend API.
    // API returns: { files: [{ path, content, encoding? }, ...] }
    // encoding='base64' for binary files; plain text otherwise.
    var apiUrl = _apiUrl('/api/skills/install/' + encodeURIComponent(skillId));
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

    _scheduleSync();
    return 'Installed ' + skillId + ' (' + data.files.length + ' files) -> ' + destDir;
  }

  // Community skill (creator/slug) — fetch all files from backend API (same as local skills)
  var apiUrl = _apiUrl('/api/skills/install/' + encodeURIComponent(skillId));
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
      var binary = atob(f.content);
      var bytes = new Uint8Array(binary.length);
      for (var j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
      fs.writeFileSync(filePath, bytes);
    } else {
      fs.writeFileSync(filePath, f.content);
    }
  }

  _scheduleSync();
  return 'Installed ' + skillId + ' (' + data.files.length + ' files) -> ' + destDir;
}

/**
 * List installed skills on this device.
 * Scans /skills/ for directories with SKILL.md.
 * @returns {string} JSON array of installed skill slugs
 */
function list() {
  var installed = [];
  try {
    var top = fs.readdirSync('/skills/');
    for (var i = 0; i < top.length; i++) {
      var name = top[i];
      if (name.startsWith('.')) continue;
      // Bare slug skill: /skills/<name>/SKILL.md
      if (fs.existsSync('/skills/' + name + '/SKILL.md')) {
        installed.push(name);
      } else {
        // Community skill: /skills/<author>/<slug>/SKILL.md
        try {
          var sub = fs.readdirSync('/skills/' + name + '/');
          for (var j = 0; j < sub.length; j++) {
            var slug = sub[j];
            if (slug.startsWith('.')) continue;
            if (fs.existsSync('/skills/' + name + '/' + slug + '/SKILL.md')) {
              installed.push(name + '/' + slug);
            }
          }
        } catch (e2) {}
      }
    }
  } catch (e) {}
  return JSON.stringify(installed, null, 2);
}

/**
 * Browse the skill catalog — top N by downloads.
 * This is the "store", not installed skills. Use list() for installed.
 * @param {number} [limit=20]
 * @returns {string} JSON array of {slug, downloads, category, desc, status}
 */
function browse(limit) {
  limit = limit || 20;
  var results = CATALOG.slice(0, limit).map(function(e) {
    return { slug: e[0], downloads: e[1], category: e[3] || '', desc: e[2] || '', status: getSkillStatus(e) };
  });
  return JSON.stringify(results, null, 2);
}

/**
 * Uninstall a skill by removing its directory.
 * Uninstall is now handled by the frontend sending its skill list in skills.status.
 * The backend prunes skills that the frontend doesn't report.
 * This function is kept for compatibility but does nothing server-side.
 * @param {string} creatorSlug
 */
// Uninstall: remove skill from local sandbox via fs bridge, then hot-reload.
// The backend also prunes User.skills[] when it sees the skill missing from skills.header.
// @param {string} skillId - plain "slug" (e.g. "weather") or "author/slug" (e.g. "nickfiorani/fundamental-stock-analysis")
function uninstall(skillId) {
  if (typeof fs === 'undefined' || typeof fs.existsSync !== 'function') {
    throw new Error('fs bridge not available. Try TerminalManager pkg remove instead.');
  }
  // Community skills are stored as /skills/<author>/<slug>/ — keep full path
  // Local/bare skills are stored as /skills/<slug>/
  var destDir = '/skills/' + skillId;
  var slug = skillId;
  if (!fs.existsSync(destDir)) {
    throw new Error(slug + ' is not installed — directory ' + destDir + ' not found.');
  }
  // Recursive delete: remove all files, then empty dirs
  function removeDir(dir) {
    var entries = fs.readdirSync(dir);
    for (var i = 0; i < entries.length; i++) {
      var full = dir + '/' + entries[i];
      try {
        fs.readdirSync(full); // if this succeeds it's a dir
        removeDir(full);
      } catch(e) {
        // It's a file — delete it
        try { fs.unlinkSync(full); } catch(e2) {}
      }
    }
    // Dir is now empty — remove it
    try { fs.rmdirSync(dir); } catch(e) {}
  }
  removeDir(destDir);
  // Clean up parent author dir if empty (community skills with author/slug path)
  if (skillId.indexOf('/') !== -1) {
    var parentDir = destDir.substring(0, destDir.lastIndexOf('/'));
    try {
      var remaining = fs.readdirSync(parentDir);
      if (remaining.length === 0) {
        fs.rmdirSync(parentDir);
      }
    } catch(e) {}
  }
  _scheduleSync();
  return 'Uninstalled ' + slug + ' from local sandbox.';
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
  return JSON.stringify(result.sort(function(a, b) { return b.total - a.total; }), null, 2);
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

  return JSON.stringify({
    installed: installed.length,
    installedSkills: installed,
    recentlyUsed: recentlyUsed,
    neverUsed: neverUsed,
    recentFailures: recentFailures.slice(-10),
    unmetSearches: unmetSearches
  }, null, 2);
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
    var resp = await fetch(_apiUrl('/api/skills/catalog-sync'));
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var info = await resp.json();
    var backendVersion = info.version;

    if (!backendVersion || backendVersion <= CATALOG_VERSION) {
      return { synced: false, oldVersion: CATALOG_VERSION, newVersion: backendVersion, note: 'Already up to date.' };
    }

    // Write new catalog.js
    fs.mkdirSync('/skills/clawhub/scripts', { recursive: true });
    fs.writeFileSync('/skills/clawhub/scripts/catalog.js', info.catalog.content, 'utf8');
    if (info.notFeasible) {
      fs.writeFileSync('/skills/clawhub/scripts/not_feasible.js', info.notFeasible.content, 'utf8');
    }

    // Invalidate vector cache so next search rebuilds with new catalog
    try { fs.unlinkSync(_vecCacheFile); } catch (e) {}
    _vecCache = null;
    _vecCacheVersion = null;

    console.log('[clawhub] Catalog updated ' + CATALOG_VERSION + ' \u2192 ' + backendVersion + '. Reloading...');

    // Reload the skill module so catalog.js re-requires fresh content
    if (typeof __reloadSkills === 'function') __reloadSkills();

    return { synced: true, oldVersion: CATALOG_VERSION, newVersion: backendVersion };
  } catch (e) {
    console.log('[clawhub] Catalog sync error: ' + e.message);
    return { synced: false, oldVersion: CATALOG_VERSION, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 2. HANDLER — standard AI entry point: await mod.handler({ parameters: {...} })
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  // Fallback: if called with no parameters but PARAMS was injected by Swift
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS — synchronous, before any await
// ---------------------------------------------------------------------------

var clawhubApi = { search: search, install: install, run: run, list: list, browse: browse, uninstall: uninstall, logUsage: logUsage, logUnmetSearch: logUnmetSearch, usageSummary: usageSummary, annotate: annotate, getNotes: getNotes, status: status, syncCatalogFromBackend: syncCatalogFromBackend, tokenize: tokenize, parseClawhubCommand: parseClawhubCommand, runFromParams: runFromParams, handler: handler };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clawhubApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.clawhub = clawhubApi;
}

// Pre-warm vector cache only when the cache file is absent (first launch or after
// a catalog version update — syncCatalogFromBackend() deletes it on version bump).
// Skill install/uninstall reloads leave the cache file intact, so no pre-warm fires.
if (typeof process === 'undefined' && !fs.existsSync(_vecCacheFile)) {
  _ensureVecCache().catch(function(e) { console.log('[clawhub] Pre-warm failed: ' + e.message); });
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING — skill-specific parser first, generic tokenize second
//    parseClawhubCommand: maps action + flags + args for this skill
//    tokenize: generic quoted-string tokenizer, reusable across all skills
// ---------------------------------------------------------------------------

function parseClawhubCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = { action: '', args: [], flags: {} };
  if (tokens.length === 0) return out;

  if (tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /clawhub(\.js)?$/i.test(tokens[0])) tokens.shift();
  if (tokens[0] && (tokens[0] === 'clawhub' || /\/clawhub\.js$/i.test(tokens[0]))) tokens.shift();
  if (!tokens.length) return out;

  out.action = tokens.shift();
  var i = 0;
  while (i < tokens.length) {
    var token = tokens[i];
    if (token.indexOf('--') === 0) {
      var key = token.slice(2);
      var value = 'true';
      if (i + 1 < tokens.length && tokens[i + 1].indexOf('-') !== 0) {
        value = tokens[i + 1];
        i += 1;
      }
      out.flags[key] = value;
    } else if (token.indexOf('-') === 0 && token.length > 1) {
      var shortKey = token.slice(1);
      var shortValue = 'true';
      if (i + 1 < tokens.length && tokens[i + 1].indexOf('-') !== 0) {
        shortValue = tokens[i + 1];
        i += 1;
      }
      out.flags[shortKey] = shortValue;
    } else {
      out.args.push(token);
    }
    i += 1;
  }

  return out;
}

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [];
  var i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) {
        inQuotes = false;
        quoteChar = '';
        if (cur) tokens.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inQuotes = true;
        quoteChar = ch;
        if (cur) {
          tokens.push(cur);
          cur = '';
        }
      } else if (/\s/.test(ch)) {
        if (cur) {
          tokens.push(cur);
          cur = '';
        }
      } else {
        cur += ch;
      }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// ---------------------------------------------------------------------------
// 5. runFromParams — reads PARAMS injected by Swift or accepts a params object
//    Shared by both handler() and the PARAMS auto-run block below.
// ---------------------------------------------------------------------------

function _firstDefined(values) {
  for (var i = 0; i < values.length; i++) {
    if (values[i] !== undefined && values[i] !== null && values[i] !== '') return values[i];
  }
  return undefined;
}

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) {
        params = PARAMS;
      } else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) {
        params = JSON.parse(PARAMS_JSON);
      }
    } catch (e) {
      params = {};
    }
  }

  var parsed = parseClawhubCommand(params.command || '');
  var action = _firstDefined([params.action, params.method, parsed.action]);
  var flags = params.flags || parsed.flags || {};
  var argv = params.argv || [];
  var args = params.args || parsed.args || argv;
  var isDirectCommand = !!(params.command || argv.length);

  if (!action) {
    return usageSummary();
  }

  if (action === 'list' || action === 'installed') return list();
  if (action === 'browse') return browse(Number(_firstDefined([params.limit, flags.limit, flags.n, args[0]])) || 20);
  if (action === 'search') {
    var searchQuery = _firstDefined([params.query, params.q, args.join(' ')]);
    var searchLimit = Number(_firstDefined([params.limit, flags.limit, flags.n])) || 10;
    if (isDirectCommand) console.log('[clawhub] search ' + searchQuery + ' (limit ' + searchLimit + ')');
    return await search(searchQuery, searchLimit);
  }
  if (action === 'install') {
    var installTarget = _firstDefined([params.skill, params.slug, params.skillId, args[0]]);
    if (isDirectCommand) console.log('[clawhub] install ' + installTarget);
    return await install(installTarget);
  }
  if (action === 'uninstall' || action === 'remove' || action === 'rm') return uninstall(_firstDefined([params.skill, params.slug, params.skillId, args[0]]));
  if (action === 'status') return status();
  if (action === 'usageSummary' || action === 'usage') return usageSummary(_firstDefined([params.skill, params.slug, args[0]]));
  if (action === 'annotate') return annotate(_firstDefined([params.skill, params.slug, args[0]]), _firstDefined([params.note, args.slice(1).join(' ')]));
  if (action === 'getNotes' || action === 'notes') return getNotes(_firstDefined([params.skill, params.slug, args[0]]));
  if (action === 'logUsage' || action === 'log') return logUsage(_firstDefined([params.skill, params.slug, args[0]]), _firstDefined([params.outcome, args[1]]), _firstDefined([params.note, args.slice(2).join(' ')]));
  if (action === 'logUnmetSearch') return logUnmetSearch(_firstDefined([params.query, args.join(' ')]));
  if (action === 'run') {
    var runTarget = _firstDefined([params.skill, params.slug, args[0]]);
    if (isDirectCommand) console.log('[clawhub] run ' + runTarget);
    return await run(runTarget, params.runArgs || params.argsObject || {});
  }
  if (action === 'syncCatalogFromBackend' || action === 'syncCatalog') {
    if (isDirectCommand) console.log('[clawhub] syncCatalogFromBackend');
    return await syncCatalogFromBackend();
  }

  if (action === 'help' || action === '--help' || action === '-h') {
    return 'clawhub actions: list | browse | search | install | uninstall | status | usageSummary | logUsage | log | annotate | getNotes | logUnmetSearch | run | help\n'
      + 'Examples:\n'
      + '  run /skills/clawhub/scripts/clawhub.js list\n'
      + '  run /skills/clawhub/scripts/clawhub.js search discord\n'
      + '  run /skills/clawhub/scripts/clawhub.js install discord\n'
      + '  run /skills/clawhub/scripts/clawhub.js logUsage weather success "wttr.in worked"';
  }

  throw new Error('Unknown clawhub action: ' + action + '. Run with "help" to see available actions.');
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry (local dev / testing only — never fires on device)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block — device /cmd path (run clawhub.js search weather)
//    `return` is REQUIRED — makes TerminalManager's outer IIFE await this.
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
