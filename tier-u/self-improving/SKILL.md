---
name: self-improving
description: Self-reflection + Self-criticism + Self-learning + Self-organizing memory. Agent evaluates its own work, catches mistakes, and improves permanently.
version: 2.0
---
# self-improving
_Converted from ClawHub: `ivangdavila/self-improving`_
## Runtime: fetch✅ fs✅ crypto✅ http✅ | child_process❌ WebSocket❌ Blob❌
# Self-Improving Memory System

Log learnings, errors, and corrections to a tiered memory system that survives session compaction.

## Architecture

```
self-improving/
├── memory.md          # HOT: ≤100 lines, always loaded
├── index.md           # Topic index
├── heartbeat-state.md # Heartbeat state
├── corrections.md     # Last 50 corrections
├── projects/         # WARM: per-project learnings
├── domains/          # WARM: domain-specific
└── archive/          # COLD: decayed patterns
```

## Setup

```js
var si = require('./scripts/self-improving.js');
si.init();
// Creates directory structure and default files
```

## Core Operations

```js
var si = require('./scripts/self-improving.js');

// Log a learning
si.logLearning({
  type: 'correction',  // correction | insight | knowledge_gap | best_practice
  summary: 'One-line description',
  details: 'Full context of what happened',
  action: 'What to do differently next time',
  priority: 'high',    // low | medium | high
});

// Log an error
si.logError({
  command: 'npm install',
  summary: 'Install failed on iOS',
  error: 'npm not found',
  context: 'Tried to install dependencies in whistant project',
  fix: 'Use whistant package manager instead',
});

// Search all tiers
var result = si.search('React hooks');
// result.results = [{ file, line, text }, ...]

// Get memory stats
var stats = si.stats();
// stats.hot.lines, stats.warm.projects, etc.

// Update heartbeat state
si.updateHeartbeat('Reviewed X corrections, promoted 1 to WARM');
```

## When to Log

| Situation | Action |
|-----------|--------|
| User corrects you | `logLearning({ type: 'correction', ... })` |
| User says "I prefer X" | `logLearning({ type: 'preference', ... })` |
| Command fails | `logError({ command: '...', error: '...', ... })` |
| Discover better approach | `logLearning({ type: 'best_practice', ... })` |
| User requests feature | Log to `projects/` manually |

## Tier Rules

| Tier | File | Size | Load |
|------|------|------|------|
| HOT | memory.md | ≤100 lines | Always |
| WARM | projects/, domains/ | ≤200 lines each | On context match |
| COLD | archive/ | Unlimited | On explicit query |

## Output Format

```js
📊 Self-Improving Memory

HOT: memory.md (X lines)
WARM: X projects, X domains
COLD: X archived entries

Recent: ✅ Logged as LRN-20260413-ABC
```
