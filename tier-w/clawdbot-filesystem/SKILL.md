---
name: clawdbot-filesystem
description: Advanced filesystem operations — list, search, batch process, analyze directories. Pure JS using Node fs module. No CLI required.
version: 1.0
---
# clawdbot-filesystem

Advanced file and directory operations using Node.js `fs` module. Listing, search, batch ops, tree view, and stats.

## Smart file listing with filters

```js
const fs = require('fs');
const path = require('path');

// Note: Whistant's fs.readdirSync returns plain strings (filenames only, no Dirent).
// Use fs.statSync(fullPath) to check isDirectory/isFile — returns { size, isFile, isDirectory }.
function listFiles(dir, { recursive = true, filter = null, maxDepth = 10, depth = 0 } = {}) {
  if (depth > maxDepth) return [];
  const results = [];
  const names = fs.readdirSync(dir); // returns string[]
  for (const name of names) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full); // { size, isFile, isDirectory }
    if (stat.isDirectory && recursive) {
      results.push(...listFiles(full, { recursive, filter, maxDepth, depth: depth + 1 }));
    } else if (stat.isFile) {
      if (!filter || name.match(filter)) {
        results.push({ path: full, name, size: stat.size });
      }
    }
  }
  return results;
}

// List all JS files in ./src
const files = listFiles('./src', { filter: /\.js$/ });
files.forEach(f => console.log(f.path, `(${(f.size / 1024).toFixed(1)}KB)`));
```

## Content search (grep-like)

```js
function searchContent(dir, pattern, { context = 2, filter = /\.(js|ts|md|txt|json)$/ } = {}) {
  const re = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
  const files = listFiles(dir, { filter });
  const results = [];

  for (const { path: filePath } of files) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (re.test(line)) {
        const start = Math.max(0, i - context);
        const end = Math.min(lines.length - 1, i + context);
        results.push({
          file: filePath,
          line: i + 1,
          match: line.trim(),
          context: lines.slice(start, end + 1).map((l, j) => `${start + j + 1}: ${l}`).join('\n'),
        });
      }
    });
  }
  return results;
}

const todos = searchContent('./src', /TODO|FIXME/);
todos.forEach(r => console.log(`${r.file}:${r.line}`, r.match));
```

## Directory tree (ASCII)

```js
function dirTree(dir, { depth = 3, current = 0, prefix = '' } = {}) {
  if (current > depth) return '';
  let out = '';
  const names = fs.readdirSync(dir); // returns string[]
  names.forEach((name, i) => {
    const isLast = i === names.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    const full = path.join(dir, name);
    out += prefix + connector + name + '\n';
    const stat = fs.statSync(full);
    if (stat.isDirectory && current < depth) {
      out += dirTree(full, { depth, current: current + 1, prefix: prefix + childPrefix });
    }
  });
  return out;
}

console.log('./src');
console.log(dirTree('./src', { depth: 3 }));
```

## Directory statistics

```js
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

const stats = analyzeDir('./src');
console.log(`Total: ${stats.totalFiles} files, ${stats.totalSizeKB}KB`);
stats.byExtension.forEach(([ext, s]) => console.log(`  ${ext}: ${s.count} files (${(s.size/1024).toFixed(1)}KB)`));
```

## Batch copy with dry-run

```js
function batchCopy(srcDir, destDir, pattern, { dryRun = true } = {}) {
  const files = listFiles(srcDir, { filter: pattern });
  const ops = files.map(f => ({
    from: f.path,
    to: path.join(destDir, path.relative(srcDir, f.path)),
  }));

  if (dryRun) {
    console.log(`[DRY RUN] Would copy ${ops.length} files:`);
    ops.forEach(op => console.log(`  ${op.from} → ${op.to}`));
    return ops;
  }

  for (const { from, to } of ops) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    console.log(`Copied: ${from} → ${to}`);
  }
  return ops;
}

// Preview: copy all .log files to backup/
batchCopy('./logs', './backup', /\.log$/, { dryRun: true });
```

## Find large files

```js
function findLargeFiles(dir, minSizeKB = 100) {
  return listFiles(dir)
    .filter(f => f.size >= minSizeKB * 1024)
    .sort((a, b) => b.size - a.size)
    .map(f => ({ path: f.path, sizeKB: (f.size / 1024).toFixed(1) }));
}

const large = findLargeFiles('./', 100);
large.forEach(f => console.log(`${f.sizeKB}KB\t${f.path}`));
```

## Notes

- All operations use Node.js built-in `fs` — no external dependencies
- `filter` param accepts a RegExp or string (converted to RegExp)
- `recursive: false` limits listing to immediate children only
- For large directories: use `maxDepth` to control scan depth
