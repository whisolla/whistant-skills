---
name: memory-setup
description: Enable and configure memory search for persistent context. Use when setting up memory, creating daily logs, or organizing project context.
version: 2.0
---
# memory-setup
_Converted from ClawHub: `jrbobbyhansen-pixel/memory-setup`_
## Runtime: fetch✅ fs✅ crypto✅ http✅ | child_process❌ WebSocket❌ Blob❌
# Memory Setup

Initialize and manage OpenClaw-compatible workspace memory structure.

## Directory Structure

```
workspace/
├── MEMORY.md          # Long-term curated memory
└── memory/
    ├── logs/          # Daily logs (YYYY-MM-DD.md)
    ├── projects/      # Per-project context
    ├── groups/        # Group chat context
    └── system/        # Preferences
```

## Setup

```js
var ms = require('./memory-setup.js');

// Initialize full structure
ms.init();

// Initialize with user name
ms.init('Yijie');
```

## Core Operations

```js
// Create a project memory file
ms.createProject('Whistant', 'iOS AI agent app');

// Get today's daily log
var log = ms.dailyLog();
// log.file → path
// log.content → file content

// Get a specific date's log
var log = ms.dailyLog('2026-04-01');

// Append to today's log
ms.appendToLog(null, '## Completed\n- Rewrote admapix skill\n- Updated SKILL.md');

// Update MEMORY.md section
ms.updateMemory('About the User', 'Name: Yijie Gao, Ph.D.\nGoal: Find AI agent engineering role in TX/CA/WA');
```

## Daily Log Format

```js
# YYYY-MM-DD — Daily Log

## Tasks
- [ ] ...

## Notes


---
```
