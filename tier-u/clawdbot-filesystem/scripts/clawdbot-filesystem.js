/**
 * clawdbot-filesystem.js — Advanced filesystem operations for Whistant iOS JS runtime
 *
 * Listing, search, batch ops, tree view, and stats — all with Node.js fs.
 *
 * Usage:
 *   const fsUtil = require('./clawdbot-filesystem.js');
 *   const files = fsUtil.listFiles('./src', { filter: /\.js$/ });
 */

var fs, path;
try {
  fs = require('fs');
  path = require('path');
} catch (e) {
  // fs/path not available in direct eval (/cmd path)
  fs = null;
  path = null;
}

/**
 * List all files in a directory tree
 */
function listFiles(dir, opts) {
  if (!fs || !path) throw new Error('fs module not available — use /code path to require this skill');
  opts = opts || {};
  var recursive = opts.recursive !== false;
  var filter = opts.filter || null;
  var maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : 10;
  var depth = opts.depth || 0;

  if (depth > maxDepth) return [];
  var results = [];
  var names;
  try { names = fs.readdirSync(dir); } catch (e) { return []; }

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.statSync(full); } catch (e) { continue; }
    if (stat.isDirectory && recursive) {
      var children = listFiles(full, { recursive: recursive, filter: filter, maxDepth: maxDepth, depth: depth + 1 });
      for (var j = 0; j < children.length; j++) results.push(children[j]);
    } else if (stat.isFile) {
      if (!filter || (typeof filter === 'string' ? name.indexOf(filter) >= 0 : filter.test(name))) {
        results.push({ path: full, name: name, size: stat.size });
      }
    }
  }
  return results;
}

/**
 * Search file content (grep-like)
 */
function searchContent(dir, pattern, opts) {
  if (!fs || !path) throw new Error('fs module not available');
  opts = opts || {};
  var context = opts.context !== undefined ? opts.context : 2;
  var filter = opts.filter || /\.(js|ts|md|txt|json)$/;

  var re;
  if (typeof pattern === 'string') {
    // Escape regex metacharacters except | (so alternation patterns like TODO|FIXME work)
    try { re = new RegExp(pattern.replace(/[.*+?^${}()\[\\]/g, '\\$&'), 'gi'); }
    catch (e) { re = new RegExp(pattern, 'gi'); }
  } else {
    re = pattern;
  }

  var files = listFiles(dir, { filter: filter });
  var results = [];

  for (var fi = 0; fi < files.length; fi++) {
    var filePath = files[fi].path;
    var content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch (e) { continue; }
    var lines = content.split('\n');
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      re.lastIndex = 0;
      if (re.test(line)) {
        var ln = li + 1;
        var start = Math.max(0, li - context);
        var end = Math.min(lines.length - 1, li + context);
        results.push({
          file: filePath,
          line: ln,
          match: line.trim(),
          context: lines.slice(start, end + 1).map(function(l, j) { return (start + j + 1) + ': ' + l; }).join('\n'),
        });
      }
    }
  }
  return results;
}

/**
 * ASCII directory tree
 */
function dirTree(dir, opts) {
  if (!fs || !path) throw new Error('fs module not available');
  opts = opts || {};
  var depth = opts.depth !== undefined ? opts.depth : 3;
  var current = opts.current || 0;
  var prefix = opts.prefix || '';

  if (current > depth) return '';
  var out = '';
  var names;
  try { names = fs.readdirSync(dir); } catch (e) { return ''; }

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var isLast = i === names.length - 1;
    var connector = isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ';
    var childPrefix = isLast ? '    ' : '\u2502   ';
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.statSync(full); } catch (e) { continue; }
    out += prefix + connector + name + (stat.isDirectory ? '/' : '') + '\n';
    if (stat.isDirectory && current < depth) {
      out += dirTree(full, { depth: depth, current: current + 1, prefix: prefix + childPrefix });
    }
  }
  return out;
}

/**
 * Directory statistics by extension
 */
function analyzeDir(dir) {
  var files = listFiles(dir);
  var byExt = {};
  var totalSize = 0;

  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var ext = path ? (path.extname(f.name) || '(no ext)') : f.name.split('.').pop() || '(no ext)';
    if (!byExt[ext]) byExt[ext] = { count: 0, size: 0 };
    byExt[ext].count++;
    byExt[ext].size += f.size;
    totalSize += f.size;
  }

  var sorted = [];
  var keys = Object.keys(byExt);
  for (var k = 0; k < keys.length; k++) {
    sorted.push([keys[k], byExt[keys[k]]]);
  }
  sorted.sort(function(a, b) { return b[1].size - a[1].size; });
  return { totalFiles: files.length, totalSizeKB: (totalSize / 1024).toFixed(1), byExtension: sorted };
}

/**
 * Batch copy with optional dry-run
 */
function batchCopy(srcDir, destDir, pattern, opts) {
  if (!fs || !path) throw new Error('fs module not available');
  opts = opts || {};
  var dryRun = opts.dryRun !== false;
  var files = listFiles(srcDir, { filter: pattern });
  var ops = files.map(function(f) {
    return { from: f.path, to: path.join(destDir, path.relative(srcDir, f.path)) };
  });

  if (dryRun) {
    console.log('[DRY RUN] Would copy ' + ops.length + ' files:');
    for (var i = 0; i < Math.min(ops.length, 20); i++) {
      console.log('  ' + ops[i].from + ' \u2192 ' + ops[i].to);
    }
    if (ops.length > 20) console.log('  ... and ' + (ops.length - 20) + ' more');
    return ops;
  }

  for (var j = 0; j < ops.length; j++) {
    var op = ops[j];
    try {
      fs.mkdirSync(path.dirname(op.to), { recursive: true });
      fs.copyFileSync(op.from, op.to);
      console.log('Copied: ' + op.from + ' \u2192 ' + op.to);
    } catch (e) {
      console.error('Error copying ' + op.from + ': ' + e.message);
    }
  }
  return ops;
}

/**
 * Find large files
 */
function findLargeFiles(dir, minSizeKB) {
  minSizeKB = minSizeKB !== undefined ? minSizeKB : 100;
  var files = listFiles(dir);
  var filtered = [];
  for (var i = 0; i < files.length; i++) {
    if (files[i].size >= minSizeKB * 1024) filtered.push(files[i]);
  }
  filtered.sort(function(a, b) { return b.size - a.size; });
  return filtered.map(function(f) { return { path: f.path, sizeKB: (f.size / 1024).toFixed(1) }; });
}

/**
 * Read file as lines
 */
function readLines(filePath, opts) {
  if (!fs) throw new Error('fs module not available');
  opts = opts || {};
  var offset = opts.offset || 0;
  var limit = opts.limit !== undefined ? opts.limit : 100;
  var content = fs.readFileSync(filePath, 'utf8');
  var lines = content.split('\n');
  return {
    lines: lines.slice(offset, offset + limit),
    total: lines.length,
    hasMore: offset + limit < lines.length,
  };
}

// ─── Template compliance: handler, runFromParams, parseCommand, tokenize ────

function handler(event, context) {
  return runFromParams(event);
}

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (typeof params === 'string') params = parseCommand(params);

  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  if (!params.action && params.argv && params.argv.length > 0) {
    params.action = params.argv[0];
  }

  var action = params.action || 'listFiles';

  if (!fs || !path) {
    return { error: 'clawdbot-filesystem requires /code path (fs/path require not available in /cmd). Use via require() in /code.' };
  }

  switch (action) {
    case 'listFiles':
      return listFiles(params.dir || '/skills', { recursive: params.recursive !== 'false', maxDepth: parseInt(params.maxDepth || '3') });
    case 'dirTree':
      return dirTree(params.dir || '/skills', { depth: parseInt(params.depth || '3') });
    case 'analyzeDir':
      return analyzeDir(params.dir || '/skills');
    case 'findLargeFiles':
      return findLargeFiles(params.dir || '/skills', parseInt(params.minSizeKB || '100'));
    case 'readLines':
      return readLines(params.file, { offset: parseInt(params.offset || '0'), limit: parseInt(params.limit || '50') });
    case 'searchContent':
      return searchContent(params.dir || '/skills', params.pattern || /./, { context: parseInt(params.context || '1'), filter: params.filter ? new RegExp(params.filter) : undefined });
    default:
      return {
        availableActions: ['listFiles', 'dirTree', 'analyzeDir', 'findLargeFiles', 'readLines', 'searchContent'],
        usage: 'run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js <action> [--dir /path]',
      };
  }
}

function tokenize(input) {
  var tokens = [];
  var re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  var m;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[0]);
  }
  return tokens;
}

function parseCommand(input) {
  var tokens = tokenize(input);
  if (!tokens.length) return {};
  var action = tokens[0];
  var result = { action: action };
  var i = 1;
  while (i < tokens.length) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var key = t.slice(2);
      result[key] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else if (t.indexOf('-') === 0) {
      var key2 = t.slice(1);
      result[key2] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    }
    i++;
  }
  return result;
}

// ─── Node CLI block ──────────────────────────────────────────────────────────
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var cliArgs = process.argv.slice(2);
  var input = cliArgs.join(' ');
  if (!input) {
    console.log('Usage: node clawdbot-filesystem.js <action> [--dir /path]');
    console.log('Actions: listFiles, dirTree, analyzeDir, findLargeFiles, readLines, searchContent');
    process.exit(0);
  }
  var parsed = parseCommand(input);
  runFromParams(parsed).then(function(r) { console.log(JSON.stringify(r, null, 2)); }).catch(function(e) { console.error(e.message); process.exit(1); });
}

// ─── CommonJS / globalThis exports ──────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    listFiles: listFiles,
    searchContent: searchContent,
    dirTree: dirTree,
    analyzeDir: analyzeDir,
    batchCopy: batchCopy,
    findLargeFiles: findLargeFiles,
    readLines: readLines,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
  };
}
if (typeof globalThis !== 'undefined') {
  globalThis.clawdbotfs = {
    listFiles: listFiles,
    searchContent: searchContent,
    dirTree: dirTree,
    analyzeDir: analyzeDir,
    batchCopy: batchCopy,
    findLargeFiles: findLargeFiles,
    readLines: readLines,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
  };
}

// ─── PARAMS auto-run block ──────────────────────────────────────────────────
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    try {
      var result = await runFromParams();
      if (typeof console !== 'undefined' && console.log) {
        console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      }
      return result;
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
      throw err;
    }
  })();
}
