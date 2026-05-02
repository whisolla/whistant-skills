---
name: aistatus
description: Check real-time AI provider status, search model availability, get trending models, LLM benchmark leaderboard, and recent outage incidents. Use when asked about AI service status, model availability, or AI rankings.
version: 2.1
---
# aistatus

**USE THIS SKILL when asked about AI provider status, whether a service is down, model availability, trending models, or AI benchmark rankings.**

**RULE: The handler returns a formatted text string. Print it directly. Do NOT dump JSON.**

## How to use

**Step 1 — Load the handler:**
```
var ai = require('/skills/aistatus/scripts/aistatus.js');
```

**Step 2 — Call handler() with an action:**
```
var result = await ai.handler({ endpoint: 'all' });
// OR check specific provider status
var result = await ai.handler({ endpoint: 'status' });
// OR search for a model
var result = await ai.handler({ endpoint: 'model', query: 'claude-sonnet' });
// OR get trending models
var result = await ai.handler({ endpoint: 'trending' });
// OR get leaderboard
var result = await ai.handler({ endpoint: 'mmlu' });
// OR get recent incidents
var result = await ai.handler({ endpoint: 'incidents' });
```

**Step 3 — Print the result directly:**
The handler returns a formatted string. **Print `result.formatted` directly. Do NOT return JSON.**

## Available Endpoints

| endpoint | What it does |
|----------|-------------|
| `all` | Everything: provider status, trending, leaderboard, incidents |
| `status` | Provider operational status only |
| `model` | Search models by name (provide `query`) |
| `trending` | Top 10 most-used models this week |
| `mmlu` | LLM benchmark leaderboard |
| `incidents` | Recent outages and status changes |

## IMPORTANT

- Base API: `https://aistatus.cc` — free, no auth needed
- The handler returns a plain formatted string — PRINT IT DIRECTLY
- Do NOT call external status pages (status.openai.com, etc.) — use aistatus.cc
- Provider status values: `operational`, `degraded`, `down`, `unknown`
