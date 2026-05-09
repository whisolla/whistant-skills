---
name: agent-autonomy-kit
description: Transform your agent from reactive to proactive. Set up a task queue, proactive heartbeat, and continuous operation patterns so the agent works between prompts.
version: 1.0
---
# agent-autonomy-kit 🚀

Stop waiting for prompts. Keep working. This skill provides patterns and templates for proactive agent operation.

## Core concepts

1. **Task Queue** — Persistent `tasks/QUEUE.md` the agent pulls from proactively
2. **Proactive Heartbeat** — `HEARTBEAT.md` that does work, not just checks
3. **Continuous Operation** — Work until token limits, then sleep with handoff notes
4. **Token Awareness** — Know your budget, prioritize high-impact tasks

---

## Setup (one-time)

### Step 1: Create task queue

Create `tasks/QUEUE.md` in your workspace:

```js
const fs = require('fs');
fs.mkdirSync('tasks', { recursive: true });
fs.writeFileSync('tasks/QUEUE.md', `# Task Queue

*Last updated: ${new Date().toISOString()}*

## 🔴 Ready (can be picked up)
### High Priority
- [ ] [Task description]

## 🟡 In Progress
- [ ] @agent: [Task description]

## 🔵 Blocked
- [ ] [Task description] (needs: [blocker])

## ✅ Done Today
- [x] @agent: [Task description]

## 💡 Ideas (not yet tasks)
- [Idea]
`);
console.log('Created tasks/QUEUE.md');
```

### Step 2: Update HEARTBEAT.md

Replace your `HEARTBEAT.md` with the proactive template:

```js
fs.writeFileSync('HEARTBEAT.md', `# Proactive Heartbeat

## 1. Quick Checks (30 seconds)
- Human messages waiting? → Handle immediately
- Critical blockers? → Escalate

If nothing urgent, proceed to work mode.

## 2. Work Mode
1. Read tasks/QUEUE.md
2. Pick highest-priority Ready task you can do
3. Do meaningful work on it
4. Update queue (move to Done or note progress)
5. If time/tokens remain, pick another task

## 3. Before Finishing
- Log what you did to memory/YYYY-MM-DD.md
- Update queue with new tasks discovered
- Post update to team if significant

## Token Strategy
- Human requests: ALWAYS FIRST
- Urgent tasks: time-sensitive items
- High-impact tasks: move needles
- Maintenance: improvements and cleanup

*Idle time = wasted tokens. Keep working.*
`);
console.log('Updated HEARTBEAT.md');
```

---

## Task queue helpers

```js
const fs = require('fs');
const QUEUE = 'tasks/QUEUE.md';

function getReadyTasks() {
  const content = fs.readFileSync(QUEUE, 'utf8');
  const readySection = content.match(/## 🔴 Ready[\s\S]*?(?=## 🟡|$)/)?.[0] ?? '';
  return [...readySection.matchAll(/^- \[ \] (.+)$/gm)].map(m => m[1]);
}

function claimTask(taskText, agentName) {
  let content = fs.readFileSync(QUEUE, 'utf8');
  // Move from Ready to In Progress
  content = content.replace(`- [ ] ${taskText}`, '');
  content = content.replace(
    '## 🟡 In Progress\n',
    `## 🟡 In Progress\n- [ ] @${agentName}: ${taskText}\n`
  );
  content = content.replace(`*Last updated: ${/.*/}*`, `*Last updated: ${new Date().toISOString()}*`);
  fs.writeFileSync(QUEUE, content);
  console.log(`Claimed: ${taskText}`);
}

function completeTask(taskText, agentName) {
  let content = fs.readFileSync(QUEUE, 'utf8');
  content = content.replace(`- [ ] @${agentName}: ${taskText}`, '');
  content = content.replace(
    '## ✅ Done Today\n',
    `## ✅ Done Today\n- [x] @${agentName}: ${taskText}\n`
  );
  fs.writeFileSync(QUEUE, content);
  console.log(`Completed: ${taskText}`);
}

// Usage
const tasks = getReadyTasks();
console.log('Ready tasks:', tasks);
if (tasks.length > 0) {
  claimTask(tasks[0], 'whistant');
  // ... do work ...
  completeTask(tasks[0], 'whistant');
}
```

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

---

## Handoff note (before sleeping)

```js
function writeHandoffNote(agentName, workDone, nextTasks) {
  const note = `# Handoff Note — ${new Date().toISOString()}

**Agent:** ${agentName}
**Status:** Approaching token limit — pausing

## Work completed this session
${workDone.map(w => `- ${w}`).join('\n')}

## Next tasks (pick these up next session)
${nextTasks.map(t => `- [ ] ${t}`).join('\n')}

## Context to remember
- Check tasks/QUEUE.md for full queue state
- Review memory/${new Date().toISOString().slice(0,10)}.md for today's notes
`;
  fs.appendFileSync(`memory/${new Date().toISOString().slice(0,10)}.md`, note);
  console.log('Handoff note written');
}
```

## Notes

- Run this setup once, then the agent manages it autonomously via heartbeats
- Task queue is a flat Markdown file — simple and durable
- For multi-agent teams: each agent marks tasks with `@agentname` to avoid conflicts
- GitHub Projects is an alternative queue backend for team coordination
