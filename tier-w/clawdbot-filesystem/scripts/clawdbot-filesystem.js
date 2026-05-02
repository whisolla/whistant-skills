/**
 * clawdbot-filesystem.js — Advanced filesystem operations for Whistant iOS JS runtime
 * 
 * Listing, search, batch ops, tree view, and stats — all with Node.js fs.
 * 
 * Usage:
 *   const fsUtil = require('./clawdbot-filesystem.js');
 *   const files = fsUtil.listFiles('./src', { filter: /\.js$/ });
 */

const fs = require('fs');
const path = require('path');

/**
 * List all files in a directory tree
 * @param {string} dir
 * @param {{ recursive?: boolean, filter?: RegExp|string, maxDepth?: number, depth?: number }} opts
 * @returns {{ path: string, name: string, size: number }[]}
 */
function listFiles(dir, { recursive = true, filter = null, maxDepth = 10, depth = 0 } = {}) {
  if (depth > maxDepth) return [];
  const results = [];
  let names;
  try { names = fs.readdirSync(dir); } catch (e) { return []; }

  for (const name of names) {
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.statSync(full); } catch (e) { continue; }
    if (stat.isDirectory && recursive) {
      results.push(...listFiles(full, { recursive, filter, maxDepth, depth: depth + 1 }));
    } else if (stat.isFile) {
      if (!filter || (typeof filter === 'string' ? name.includes(filter) : filter.test(name))) {
        results.push({ path: full, name, size: stat.size });
      }
    }
  }
  return results;
}

/**
 * Search file content (grep-like)
 * @param {string} dir
 * @param {string|RegExp} pattern
 * @param {{ context?: number, filter?: RegExp|string }} opts
 * @returns {{ file: string, line: number, match: string, context: string }[]}
 */
function searchContent(dir, pattern, { context = 2, filter = /\.(js|ts|md|txt|json)$/ } = {}) {
  const re = typeof pattern === 'string' ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : pattern;
  const files = listFiles(dir, { filter });
  const results = [];

  for (const { path: filePath } of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch (e) { continue; }
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line)) {
        const ln = i + 1;
        const start = Math.max(0, i - context);
        const end = Math.min(lines.length - 1, i + context);
        results.push({
          file: filePath,
          line: ln,
          match: line.trim(),
          context: lines.slice(start, end + 1).map((l, j) => `${start + j + 1}: ${l}`).join('\n'),
        });
      }
    });
  }
  return results;
}

/**
 * ASCII directory tree
 * @param {string} dir
 * @param {{ depth?: number, current?: number, prefix?: string }} opts
 */
function dirTree(dir, { depth = 3, current = 0, prefix = '' } = {}) {
  if (current > depth) return '';
  let out = '';
  let names;
  try { names = fs.readdirSync(dir); } catch (e) { return ''; }

  names.forEach((name, i) => {
    const isLast = i === names.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.statSync(full); } catch (e) { return; }
    out += prefix + connector + name + (stat.isDirectory ? '/' : '') + '\n';
    if (stat.isDirectory && current < depth) {
      out += dirTree(full, { depth, current: current + 1, prefix: prefix + childPrefix });
    }
  });
  return out;
}

/**
 * Directory statistics by extension
 * @param {string} dir
 * @returns {{ totalFiles: number, totalSizeKB: string, byExtension: [string, { count: number, size: number }][] }}
 */
function analyzeDir(dir) {
  const files = listFiles(dir);
  const byExt = {};
  let totalSize = 0;

  for (const f of files) {
    const ext = path.extname(f.name) || '(no ext)';
    if (!byExt[ext]) byExt[ext] = { count: 0, size: 0 };
    byExt[ext].count++;
    byExt[ext].size += f.size;
    totalSize += f.size;
  }

  const sorted = Object.entries(byExt).sort((a, b) => b[1].size - a[1].size);
  return { totalFiles: files.length, totalSizeKB: (totalSize / 1024).toFixed(1), byExtension: sorted };
}

/**
 * Batch copy with optional dry-run
 * @param {string} srcDir
 * @param {string} destDir
 * @param {RegExp|string} pattern
 * @param {{ dryRun?: boolean }} opts
 */
function batchCopy(srcDir, destDir, pattern, { dryRun = true } = {}) {
  const files = listFiles(srcDir, { filter: pattern });
  const ops = files.map(f => ({
    from: f.path,
    to: path.join(destDir, path.relative(srcDir, f.path)),
  }));

  if (dryRun) {
    console.log(`[DRY RUN] Would copy ${ops.length} files:`);
    ops.slice(0, 20).forEach(op => console.log(`  ${op.from} → ${op.to}`));
    if (ops.length > 20) console.log(`  ... and ${ops.length - 20} more`);
    return ops;
  }

  for (const { from, to } of ops) {
    try {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      console.log(`Copied: ${from} → ${to}`);
    } catch (e) {
      console.error(`Error copying ${from}: ${e.message}`);
    }
  }
  return ops;
}

/**
 * Find large files
 * @param {string} dir
 * @param {number} minSizeKB
 * @returns {{ path: string, sizeKB: string }[]
 */
function findLargeFiles(dir, minSizeKB = 100) {
  return listFiles(dir)
    .filter(f => f.size >= minSizeKB * 1024)
    .sort((a, b) => b.size - a.size)
    .map(f => ({ path: f.path, sizeKB: (f.size / 1024).toFixed(1) }));
}

/**
 * Read file as lines (lazy — for very large files)
 * @param {string} filePath
 * @param {{ offset?: number, limit?: number }} opts
 */
function readLines(filePath, { offset = 0, limit = 100 } = {}) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  return {
    lines: lines.slice(offset, offset + limit),
    total: lines.length,
    hasMore: offset + limit < lines.length,
  };
}

module.exports = {
  listFiles,
  searchContent,
  dirTree,
  analyzeDir,
  batchCopy,
  findLargeFiles,
  readLines,
};
