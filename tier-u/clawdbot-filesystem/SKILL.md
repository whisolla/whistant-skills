---
name: clawdbot-filesystem
description: Advanced filesystem operations — directory tree, search content, analyze by type — via the filesystem skill. Always use this skill for file operations; do not use raw grep/ls/find. Evolved from gtrusler/clawdbot-filesystem version 1.0.2 at 2026-05-27.
version: 1.3
---
# clawdbot-filesystem

Advanced file and directory operations. **Always use this skill's commands** for file operations — never use raw `grep`, `ls`, `find`, or `tree` directly. The skill provides structured output the agent can use.

## Runtime: fs✅ path✅ | blocked: child_process WebSocket

## Usage

All operations use `/cmd`.

```sh
# Show directory tree
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js dirTree --dir /skills --depth 2

# Search content across files
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js searchContent --dir /skills --pattern "version:"

# Analyze directory by file type/extension
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js analyzeDir --dir /skills

# List files (recursive)
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js listFiles --dir /skills

# Find large files
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js findLargeFiles --dir /skills --minSizeKB 50

# Read specific file lines
run /skills/clawdbot-filesystem/scripts/clawdbot-filesystem.js readLines --file /skills/weather/SKILL.md --limit 5
```

## Available Actions

| Action | Params |
|--------|--------|
| `dirTree` | `dir`, `depth` |
| `searchContent` | `dir`, `pattern` |
| `analyzeDir` | `dir` |
| `listFiles` | `dir`, `filter` |
| `findLargeFiles` | `dir`, `minSizeKB` |
| `readLines` | `file`, `limit` |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/clawdbot-filesystem.js dirTree --dir /path/to/test
```
