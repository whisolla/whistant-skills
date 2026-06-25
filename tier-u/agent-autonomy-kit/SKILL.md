---
name: agent-autonomy-kit
description: Transform your agent from reactive to proactive. Set up a proactive heartbeat, continuous operation patterns, token budget awareness, and handoff notes so the agent works between prompts. Evolved from ryancampbell/agent-autonomy-kit version 1.0.0 at 2026-05-19.
version: 1.3
---
# agent-autonomy-kit 🚀

Stop waiting for prompts. Keep working. This skill provides patterns and templates for proactive agent operation.

## Core concepts

1. **Proactive Heartbeat** — `HEARTBEAT.md` that does work, not just checks
2. **Continuous Operation** — Work until token limits, then sleep with handoff notes
3. **Token Awareness** — Know your budget, prioritize high-impact tasks

---

## ⚠️ Task Management: Use Whistant Native Functions

This skill originally included a file-based task queue (`tasks/QUEUE.md`). **Do NOT use that for task management.** Whistant has native task functions with structured, step-level tracking. Always prefer them.

### Native task functions (always use these)

| Function | Purpose |
|---|---|
| `createTask(goal, steps)` | Create a new task plan with ordered steps |
| `updateTask(stepId, action, status, result, reasoning)` | Update a single step's status/result |
| `replanTask(goal, steps, reasoning)` | Replace remaining steps (re-plan from step N onward) |
| `clearTask()` | Clear current task (auto-saves to completed_tasks) |

**Step format:**
```json
[
  { "stepId": "1", "action": "Research framework options", "status": "pending", "result": "" },
  { "stepId": "2", "action": "Set up project scaffolding", "status": "pending", "result": "" }
]
```

**Why native over file-based queue:**
- Native tasks use structured JSON with step IDs, status tracking, and reasoning history
- Native tasks auto-save to `completed_tasks/` on clear
- The file-based QUEUE.md is flat markdown with no step-level tracking — it's a fallback only for pure JSC runtime contexts where native functions aren't available

### When to use native tasks vs. this skill

| You want to... | Use |
|---|---|
| Track a step-by-step plan with status | `createTask` / `updateTask` / `replanTask` |
| Mark tasks done, clear completed plans | `updateTask` (status="done") / `clearTask` |
| Set up proactive heartbeat patterns | This skill's HEARTBEAT.md template |
| Write session handoff notes | `writeHandoffNote()` from this skill |
| Check token budget before working | `tokenStrategy()` from this skill |

---

## Setup (one-time)

### Step 1: Set up HEARTBEAT.md

Replace your `HEARTBEAT.md` with the proactive template. In the Whistant sandbox, use `/code/` paths:

```js
const HB_PATH = '/code/HEARTBEAT.md';
const fs = require('fs');
fs.writeFileSync(HB_PATH, `# Proactive Heartbeat

## 1. Quick Checks (30 seconds)
- Human messages waiting? → Handle immediately
- Critical blockers? → Escalate

If nothing urgent, proceed to work mode.

## 2. Work Mode
1. Check current task plan (read plan from context or use native task state)
2. Pick the next pending step and execute it
3. Use updateTask() to mark step status and result
4. If no active plan, ask: what can I improve or fix proactively?
5. If time/tokens remain, continue to next step or task

## 3. Before Finishing
- Log what you did to memory/YYYY-MM-DD.md
- If work is incomplete, use replanTask() to adjust remaining steps
- Write a handoff note if approaching token limits
- Post update to team if significant

## Token Strategy
- Human requests: ALWAYS FIRST
- Urgent tasks: time-sensitive items
- High-impact tasks: move needles
- Maintenance: improvements and cleanup

*Idle time = wasted tokens. Keep working.*
`);
console.log('Updated', HB_PATH);
```

> ⚠️ **Whistant sandbox paths**: Always prefix with `/code/` for sandbox filesystem access. The iOS simulator filesystem root (`/`) is separate from the macOS host — only `/code/` paths are persistent.

---

## Token budget awareness

```js
function tokenStrategy(estimatedDailyBudget, costPerHeartbeat) {
  const runsAvailable = Math.floor(estimatedDailyBudget / costPerHeartbeat);
  return {
    runsAvailable,
    priority: ['Human requests (always first)', 'Urgent tasks', 'High-impact tasks', 'Maintenance'],
    advice: runsAvailable < 5
      ? 'Low budget — prioritize human requests only'
      : runsAvailable < 20
      ? 'Moderate budget — focus on high-impact tasks'
      : 'Healthy budget — work through the queue',
  };
}

const strategy = tokenStrategy(100000, 3000);
console.log(`~${strategy.runsAvailable} heartbeat runs available`);
console.log('Advice:', strategy.advice);
```

Use this before starting proactive work to decide how aggressively to work through tasks.

---

## Handoff note (before sleeping)

When approaching token limits, write a handoff note so the next session knows where to continue:

```js
function writeHandoffNote(agentName, workDone, nextTasks) {
  const today = new Date().toISOString().slice(0, 10);
  const MEMORY_FILE = `/code/memory/${today}.md`;
  require('fs').mkdirSync('/code/memory', { recursive: true });
  const note = `# Handoff Note — ${new Date().toISOString()}

**Agent:** ${agentName}
**Status:** Approaching token limit — pausing

## Work completed this session
${workDone.map(w => `- ${w}`).join('\n')}

## Next tasks (pick these up next session)
${nextTasks.map(t => `- [ ] ${t}`).join('\n')}

## Context to remember
- Current task plan and remaining steps (check plan state on resume)
- Review memory/${today}.md for today's notes
`;
  require('fs').appendFileSync(MEMORY_FILE, note);
  console.log('Handoff note written to', MEMORY_FILE);
}
```

---

## JS Module (for skill/JSC runtime)

When running in the JSC runtime (via `/code` or `/cmd`), this module provides:

```
require('/skills/agent-autonomy-kit/scripts/agent-autonomy-kit.js')
```

**Available exports:**
- `HEARTBEAT_TEMPLATE` — the proactive heartbeat template string
- `tokenStrategy(budget, cost)` — calculate token budget advice
- `writeHandoffNote(agentName, workDone, nextTasks)` — write session handoff note

**⚠️ Deprecated (use native functions instead):** `init`, `getReadyTasks`, `claimTask`, `completeTask`, `addTask`, `getQueue`, `setQueue` — these are file-based task helpers that should NOT be used when native `createTask`/`updateTask`/`replanTask`/`clearTask` are available. They exist only as a JSC-runtime fallback.

**Usage via `/code` (JSC runtime):**
```js
var aak = require('/skills/agent-autonomy-kit/scripts/agent-autonomy-kit.js');
console.log(aak.tokenStrategy(100000, 3000));
aak.writeHandoffNote('whistant', ['fixed login bug'], ['review PR feedback']);
```

**Usage via `/cmd` (terminal):**
```bash
run /skills/agent-autonomy-kit/scripts/agent-autonomy-kit.js strategy --budget=100000 --costPerHeartbeat=3000
run /skills/agent-autonomy-kit/scripts/agent-autonomy-kit.js handoff --agent=whistant --workDone=done1,done2 --nextTasks=task1,task2
```

---

## Notes

- Native task management (`createTask`/`updateTask`/`replanTask`/`clearTask`) is the primary task system — use it for structured plan execution
- This skill provides the **proactive patterns** that wrap around native task management: heartbeat, token awareness, handoff continuity
- The HEARTBEAT.md template guides the agent to check for pending native tasks and work on them
- For multi-agent teams: native task steps can track which agent executed each step via the `reasoning` field

## ⚠️ Whistant Sandbox — Path & Command Guide

The Whistant iOS sandbox has a **separate filesystem** from the macOS host. Key rules:

| Need | Do this | Avoid |
|------|---------|-------|
| Workspace root | `/code/` | bare relative paths in terminal |
| Create a file | `write` tool or `fs.writeFileSync('/code/path/…', content)` | bare `writeFile` without path prefix |
| Create a directory | `fs.mkdirSync('/code/dir', { recursive: true })` | calling `mkdir` as a terminal command |
| Read a file | `fs.readFileSync('/code/path/…', 'utf8')` | relative paths that resolve to wrong root |
| List directory | `ls /code/` (once is enough) | repeated `ls` calls — one is sufficient |
| Find files | `find /code/ -name "*.md"` | bare `find` without arguments |

## Local Testing

```bash
# Must create a package.json with "type":"commonjs" (ESM incompatibility)
echo '{"type":"commonjs"}' > scripts/package.json

# Test via Node.js CLI
node scripts/agent-autonomy-kit.js strategy --budget=100000 --costPerHeartbeat=3000
node scripts/agent-autonomy-kit.js help

# Cleanup
rm scripts/package.json
```

