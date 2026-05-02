---
name: memory-manager
description: Local memory management for agents. Compression detection, auto-snapshots, and semantic search. Use when agents need to detect compression risk before memory loss, save context snapshots, search historical memories, or track memory usage patterns.
version: 2.0
---
# memory-manager
_Converted from ClawHub: `marmikcfc/memory-manager`_
## Runtime: fetch✅ fs✅ crypto✅ http✅ | child_process❌ WebSocket❌ Blob❌
# Memory Manager

Professional-grade memory architecture with episodic / semantic / procedural tiers.

## Directory Structure

```
memory/
├── episodic/     # Time-based event logs (YYYY-MM-DD.md)
├── semantic/     # Facts, concepts, knowledge
├── procedural/  # Workflows, how-to guides
└── snapshots/   # Compression backups
```

## Setup

```js
var mm = require('./memory-manager.js');
mm.init();
```

## Core Operations

```js
// Initialize memory structure
mm.init();

// Check compression risk
var risk = mm.detectRisk();
// risk.risk = 'safe' | 'warning' | 'critical'
// risk.pct = percentage full

// Save a snapshot before compaction
var snap = mm.snapshot();
// snap.file = path to snapshot

// Search memories by type
var results = mm.search('episodic', 'project');
// results.results = [{ tier, file, line, text }, ...]
mm.search('all', 'React hooks'); // search all tiers

// Get statistics
var st = mm.stats();
// st.episodic, st.semantic, st.procedural, st.snapshots
// st.risk = { risk, pct }

// Organize flat files into proper tiers
mm.organize();

// Add a categorized entry
mm.categorize('semantic', 'React hooks best practices', 'Use useMemo for expensive computations...');
mm.categorize('procedural', 'Deploy to Vercel', '1. Run vercel\n2. Select project\n3. Confirm...');
```

## Thresholds

| Risk Level | Context % | Action |
|------------|-----------|--------|
| ✅ Safe | <70% | None needed |
| ⚠️ Warning | 70-85% | Organize / prune |
| 🚨 Critical | >85% | Snapshot NOW |
