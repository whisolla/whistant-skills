---
name: clawdbot-filesystem
description: Advanced filesystem operations — list, search, batch process, analyze directories. Pure JS using Node fs module.
version: 1.2
---
# clawdbot-filesystem

Advanced file and directory operations using Node.js `fs` module. Listing, search, batch ops, tree view, and stats.

## Runtime: fs✅ path✅ | blocked: child_process WebSocket

## /cmd Usage

```sh
# List files in a directory (recursive)
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js listFiles --dir /skills

# Show directory tree
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js dirTree --dir /code --depth 2

# Analyze directory by extension
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js analyzeDir --dir /skills

# Find large files (>100KB)
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js findLargeFiles --dir /skills --minSizeKB 50

# Search content (grep-like)
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js searchContent --dir /skills --pattern "version:"

# Read file lines
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js readLines --file /skills/weather/SKILL.md --limit 5
```

## /code Usage

```js
const fsUtil = require('/skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js');

// List all JS files
console.log(fsUtil.listFiles('/skills', { filter: /\.js$/ }).length + ' JS files');

// Directory tree
console.log(fsUtil.dirTree('/skills', { depth: 1 }));

// Directory statistics
console.log(fsUtil.analyzeDir('/skills'));

// Search content
console.log(fsUtil.searchContent('/skills', 'version:', { filter: /\.md$/, context: 0 }).length + ' version matches');

// Find large files
console.log(fsUtil.findLargeFiles('/skills', 50).length + ' files >50KB');

// Read file lines
const lines = fsUtil.readLines('/skills/weather/SKILL.md', { limit: 3 });
console.log(lines.total, 'total lines, first', lines.lines.length, 'returned');
```

## Smart file listing with filters

```js
// Note: Whistant fs.readdirSync returns plain strings (filenames only, no Dirent).
// Use fs.statSync(fullPath) to check isDirectory/isFile — returns { size, isFile, isDirectory }.
const files = fsUtil.listFiles('/skills', { filter: /\.js$/, recursive: false });
files.forEach(f => console.log(f.path, '(' + (f.size / 1024).toFixed(1) + 'KB)'));
```

## Content search (grep-like)

```js
const todos = fsUtil.searchContent('/skills', 'TODO|FIXME', { context: 2 });
todos.forEach(r => console.log(r.file + ':' + r.line, r.match));
```

## Directory tree (ASCII)

```js
console.log(fsUtil.dirTree('/skills', { depth: 3 }));
```

## Directory statistics

```js
const stats = fsUtil.analyzeDir('/skills');
stats.byExtension.forEach(([ext, s]) =>
  console.log('  ' + ext + ': ' + s.count + ' files (' + (s.size/1024).toFixed(1) + 'KB)')
);
```

## Notes

- All operations use Node.js built-in `fs` — no external dependencies
- `filter` param accepts a RegExp or string (converted to RegExp)
- `recursive: false` limits listing to immediate children only
- For large directories: use `maxDepth` to control scan depth

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/clawdbot-filesystem.js listFiles --dir /path/to/test
```
