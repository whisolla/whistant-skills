'use strict';

// ── Memory Manager: Episodic / Semantic / Procedural tier ───────────────────
// Creates and manages a structured memory directory:
//   memory/
//   ├── episodic/     (time-based event logs, YYYY-MM-DD.md)
//   ├── semantic/      (facts, concepts, knowledge)
//   ├── procedural/   (workflows, how-to guides)
//   └── snapshots/    (compression backups)
// ─────────────────────────────────────────────────────────────────────────────

var fs = require('fs');
var path = require('path');

var MEMORY_BASE = 'memory/';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content || '');
  }
}

// ── Initialization ───────────────────────────────────────────────────────────

function init() {
  ensureDir(MEMORY_BASE + 'episodic/');
  ensureDir(MEMORY_BASE + 'semantic/');
  ensureDir(MEMORY_BASE + 'procedural/');
  ensureDir(MEMORY_BASE + 'snapshots/');
  return { ok: true, message: '✅ Memory structure initialized.' };
}

// ── Detect compression risk ─────────────────────────────────────────────────

function detectRisk() {
  // In Whistant, we estimate context usage by counting total lines
  var totalLines = countDirLines(MEMORY_BASE);
  var maxLines = 18000; // rough context limit
  var pct = Math.round((totalLines / maxLines) * 100);
  if (pct >= 85) return { risk: 'critical', pct: pct, message: '🚨 CRITICAL: Context ' + pct + '% full. Snapshot now!' };
  if (pct >= 70) return { risk: 'warning', pct: pct, message: '⚠️ WARNING: Context ' + pct + '% full. Organize recommended.' };
  return { risk: 'safe', pct: pct, message: '✅ Safe: Context ' + pct + '% full.' };
}

function countDirLines(dir) {
  var count = 0;
  try {
    var files = fs.readdirSync(dir);
    files.forEach(function(f) {
      var fullPath = dir + f;
      try {
        var stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          count += countDirLines(fullPath + '/');
        } else if (f.endsWith('.md')) {
          var content = fs.readFileSync(fullPath, 'utf8');
          count += content.split('\n').length;
        }
      } catch (e) {}
    });
  } catch (e) {}
  return count;
}

// ── Snapshot ─────────────────────────────────────────────────────────────────

function snapshot() {
  var now = new Date();
  var timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  var snapDir = MEMORY_BASE + 'snapshots/';
  ensureDir(snapDir);

  var snapFile = snapDir + 'snapshot-' + timestamp + '.md';
  var content = '# Snapshot ' + timestamp + '\n\n';
  content += '## Episodic\n\n';
  try {
    var episodic = fs.readdirSync(MEMORY_BASE + 'episodic/');
    episodic.forEach(function(f) {
      if (f.endsWith('.md')) content += fs.readFileSync(MEMORY_BASE + 'episodic/' + f, 'utf8') + '\n\n';
    });
  } catch (e) {}

  fs.writeFileSync(snapFile, content);
  return { ok: true, file: snapFile, message: '✅ Snapshot saved to ' + snapFile };
}

// ── Organize ─────────────────────────────────────────────────────────────────

function organize() {
  // Migrate flat memory/*.md files to proper episodic/semantic/procedural structure
  // In Whistant, this means checking files and moving them to the right tier
  var results = { moved: [], skipped: [], errors: [] };
  try {
    var files = fs.readdirSync(MEMORY_BASE);
    files.forEach(function(f) {
      if (!f.endsWith('.md')) return;
      if (['episodic', 'semantic', 'procedural', 'snapshots'].indexOf(f) !== -1) return;
      var fullPath = MEMORY_BASE + f;
      var content = fs.readFileSync(fullPath, 'utf8');
      // Detect type by content heuristics
      var dest;
      if (f.match(/^\d{4}-\d{2}-\d{2}/)) {
        dest = MEMORY_BASE + 'episodic/' + f;
      } else if (content.includes('## How') || content.includes('## Step')) {
        dest = MEMORY_BASE + 'procedural/' + f;
      } else if (content.includes('## Fact') || content.includes('## Knowledge')) {
        dest = MEMORY_BASE + 'semantic/' + f;
      } else {
        dest = MEMORY_BASE + 'episodic/' + f;
      }
      try {
        fs.writeFileSync(dest, content);
        if (dest !== fullPath) {
          fs.unlinkSync(fullPath);
          results.moved.push(f + ' → ' + dest);
        }
      } catch (e) {
        results.errors.push(f + ': ' + e.message);
      }
    });
  } catch (e) {
    return { ok: false, message: 'Organize failed: ' + e.message };
  }
  return { ok: true, results: results };
}

// ── Search ──────────────────────────────────────────────────────────────────

function search(type, query) {
  // type: 'episodic' | 'semantic' | 'procedural' | 'all'
  var results = [];
  var dirs = type === 'all'
    ? ['episodic', 'semantic', 'procedural']
    : [type];

  dirs.forEach(function(d) {
    var dir = MEMORY_BASE + d + '/';
    try {
      var files = fs.readdirSync(dir);
      files.forEach(function(f) {
        if (!f.endsWith('.md')) return;
        var content = fs.readFileSync(dir + f, 'utf8');
        var lines = content.split('\n');
        lines.forEach(function(line, i) {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({ tier: d, file: f, line: i + 1, text: line.trim() });
          }
        });
      });
    } catch (e) {}
  });

  return { ok: true, query: query, type: type, results: results, count: results.length };
}

// ── Stats ───────────────────────────────────────────────────────────────────

function stats() {
  function count(dir) {
    var c = 0;
    try {
      fs.readdirSync(dir).forEach(function(f) {
        if (f.endsWith('.md')) c++;
      });
    } catch (e) {}
    return c;
  }

  return {
    ok: true,
    episodic: count(MEMORY_BASE + 'episodic/'),
    semantic: count(MEMORY_BASE + 'semantic/'),
    procedural: count(MEMORY_BASE + 'procedural/'),
    snapshots: count(MEMORY_BASE + 'snapshots/'),
    risk: detectRisk(),
  };
}

// ── Categorize ───────────────────────────────────────────────────────────────

function categorize(tier, title, content) {
  var dir = MEMORY_BASE + tier + '/';
  ensureDir(dir);
  var safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  var file = dir + safeName + '.md';
  var now = new Date().toISOString().slice(0, 10);
  var body = '# ' + title + '\n\n' + (content || '') + '\n\n*Logged: ' + now + '*\n';
  fs.writeFileSync(file, body);
  return { ok: true, file: file };
}

module.exports = { init, detectRisk, snapshot, organize, search, stats, categorize };
