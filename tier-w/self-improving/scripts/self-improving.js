'use strict';

// ── Self-Improving: Hot/Warm/Cold Tiered Memory System ───────────────────────
// Uses fs polyfill to manage a tiered memory system:
//   HOT:    memory.md (≤100 lines, always loaded)
//   WARM:   projects/, domains/ (load on context match)
//   COLD:   archive/ (load on explicit query)
// ─────────────────────────────────────────────────────────────────────────────

var fs = require('fs');
var path = require('path');

var BASE = 'self-improving/';

var TEMPLATES = {
  memory_md: '# Memory\n\nHot memory — high-value learnings, always loaded.\n\n---\n',
  corrections_md: '# Corrections Log\n\nLast 50 corrections from user feedback.\n\n---\n',
  index_md: '# Index\n\nTopic index for warm/cold tier search.\n\n---\n',
  heartbeat_state_md: '# Heartbeat State\n\nLast run: null\nReviewed change: none\nAction notes: -\n\n---\n',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureFile(filePath, template) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template || '');
  }
}

function init() {
  ensureDir(BASE);
  ensureDir(BASE + 'projects/');
  ensureDir(BASE + 'domains/');
  ensureDir(BASE + 'archive/');
  ensureFile(BASE + 'memory.md', TEMPLATES.memory_md);
  ensureFile(BASE + 'index.md', TEMPLATES.index_md);
  ensureFile(BASE + 'corrections.md', TEMPLATES.corrections_md);
  ensureFile(BASE + 'heartbeat-state.md', TEMPLATES.heartbeat_state_md);
  return { ok: true, message: '✅ Self-improving memory initialized.' };
}

// ── Core operations ──────────────────────────────────────────────────────────

function readFile(relPath) {
  var fullPath = BASE + relPath;
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFile(relPath, content) {
  var fullPath = BASE + relPath;
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content);
  return { ok: true };
}

function appendEntry(filePath, entry) {
  var fullPath = BASE + filePath;
  ensureFile(fullPath);
  fs.appendFileSync(fullPath, entry + '\n---\n');
}

function countLines(text) {
  if (!text) return 0;
  return text.split('\n').length;
}

// ── HOT tier operations ──────────────────────────────────────────────────────

/**
 * Log a learning entry to memory.md (HOT tier).
 * Entry: { type: 'correction'|'insight'|'knowledge_gap'|'best_practice', summary, details, priority }
 */
function logLearning(entry) {
  init();
  var now = new Date().toISOString();
  var id = 'LRN-' + now.slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  var priority = entry.priority || 'medium';
  var block = '## [' + id + '] ' + (entry.type || 'insight') + '\n\n' +
    '**Logged**: ' + now + '\n' +
    '**Priority**: ' + priority + '\n' +
    '**Status**: pending\n\n' +
    '### Summary\n' + (entry.summary || 'No summary') + '\n\n' +
    '### Details\n' + (entry.details || 'No details') + '\n\n' +
    '### Suggested Action\n' + (entry.action || 'None') + '\n';

  appendEntry('memory.md', block);

  // Also append to corrections if it's a correction type
  if (entry.type === 'correction') {
    appendEntry('corrections.md', block);
  }

  return { ok: true, id, message: '✅ Learning logged as ' + id };
}

/**
 * Log an error entry.
 */
function logError(entry) {
  init();
  var now = new Date().toISOString();
  var id = 'ERR-' + now.slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  var block = '## [' + id + '] ' + (entry.command || 'unknown') + '\n\n' +
    '**Logged**: ' + now + '\n' +
    '**Priority**: high\n' +
    '**Status**: pending\n\n' +
    '### Summary\n' + (entry.summary || 'Error occurred') + '\n\n' +
    '### Error\n' + (entry.error || 'Unknown error') + '\n\n' +
    '### Context\n' + (entry.context || '') + '\n\n' +
    '### Suggested Fix\n' + (entry.fix || 'Investigate') + '\n';

  appendEntry('memory.md', block);
  return { ok: true, id, message: '✅ Error logged as ' + id };
}

/**
 * Search all tiers for a keyword.
 * Returns matching lines.
 */
function search(query) {
  init();
  var results = [];
  var files = ['memory.md', 'corrections.md'];
  var extraFiles = [];

  try { extraFiles = fs.readdirSync(BASE + 'projects/'); }
  catch (e) { try { extraFiles = fs.readdirSync(BASE + 'domains/'); } catch (e2) {} }

  files.forEach(function(file) {
    var content = readFile(file);
    if (!content) return;
    var lines = content.split('\n');
    lines.forEach(function(line, i) {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        results.push({ file: file, line: i + 1, text: line.trim() });
      }
    });
  });

  return { ok: true, query: query, results: results, count: results.length };
}

/**
 * Get memory stats.
 */
function stats() {
  init();
  var memory = readFile('memory.md') || '';
  var corrections = readFile('corrections.md') || '';
  var projects = [];
  var domains = [];
  var archive = [];

  try { projects = fs.readdirSync(BASE + 'projects/'); } catch (e) {}
  try { domains = fs.readdirSync(BASE + 'domains/'); } catch (e) {}
  try { archive = fs.readdirSync(BASE + 'archive/'); } catch (e) {}

  return {
    ok: true,
    stats: {
      hot: { file: 'memory.md', lines: countLines(memory) },
      warm: { projects: projects.length, domains: domains.length },
      cold: { archive: archive.length },
      corrections: { lines: countLines(corrections) },
    },
  };
}

/**
 * Promote an entry from HOT to WARM or WARM to COLD.
 */
function promote(entryId, targetTier) {
  // For Whistant, promotion is done by rewriting the memory.md file
  // This is a simplified version
  return { ok: false, message: 'Promote requires file rewrite — not yet implemented. Log as WARM/COLD directly.' };
}

/**
 * Update heartbeat state.
 */
function updateHeartbeat(notes) {
  var fullPath = BASE + 'heartbeat-state.md';
  ensureFile(fullPath, TEMPLATES.heartbeat_state_md);
  var now = new Date().toISOString();
  var content = '# Heartbeat State\n\n' +
    'Last run: ' + now + '\n' +
    'Reviewed change: ' + (notes || 'none') + '\n' +
    'Action notes: -\n\n---\n';
  fs.writeFileSync(fullPath, content);
  return { ok: true };
}

module.exports = {
  init, logLearning, logError, search, stats, promote, updateHeartbeat,
  readFile, writeFile,
};
