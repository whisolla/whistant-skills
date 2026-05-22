/**
 * agent-autonomy-kit.js — Proactive task queue for Whistant iOS JS runtime
 * 
 * Provides persistent task queue, heartbeat helpers, and handoff notes.
 * Works entirely with fs + fetch.
 * 
 * Usage:
 *   const aak = require('./agent-autonomy-kit.js');
 *   await aak.init();              // One-time setup
 *   const tasks = aak.getReadyTasks();
 *   aak.claimTask(tasks[0], 'whistant');
 *   // ... do work ...
 *   aak.completeTask(tasks[0], 'whistant');
 */

const WORKSPACE = process.env.WORKSPACE_DIR || '/code';
const TASKS_DIR = WORKSPACE + '/tasks';
const QUEUE_FILE = TASKS_DIR + '/QUEUE.md';
const MEMORY_DIR = WORKSPACE + '/memory';

// ─── FS helpers ──────────────────────────────────────────────────────────────

function mkdirp(dir) {
  const fs = require('fs');
  fs.mkdirSync(dir, { recursive: true });
}

function readFile(path, fallback = '') {
  const fs = require('fs');
  try { return fs.readFileSync(path, 'utf8'); } catch (e) { return fallback; }
}

function writeFile(path, content) {
  const fs = require('fs');
  mkdirp(require('path').dirname(path));
  fs.writeFileSync(path, content);
}

function appendFile(path, content) {
  const fs = require('fs');
  mkdirp(require('path').dirname(path));
  fs.appendFileSync(path, content);
}

// ─── Default QUEUE.md template ────────────────────────────────────────────────

const QUEUE_TEMPLATE = (lastUpdated) => `# Task Queue

*Last updated: ${lastUpdated}*

## 🔴 Ready (can be picked up)
### High Priority
- [ ]

## 🟡 In Progress
- [ ]

## 🔵 Blocked
- [ ]  (needs: )

## ✅ Done Today
- [x]

## 💡 Ideas (not yet tasks)
-
`;

const HEARTBEAT_TEMPLATE = `# Proactive Heartbeat

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
`;

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * One-time setup: create tasks dir, QUEUE.md, and HEARTBEAT.md
 */
function init() {
  mkdirp(TASKS_DIR);
  mkdirp(MEMORY_DIR);
  if (!require('fs').existsSync(QUEUE_FILE)) {
    writeFile(QUEUE_FILE, QUEUE_TEMPLATE(new Date().toISOString()));
    console.log('Created', QUEUE_FILE);
  }
  const hbPath = WORKSPACE + '/HEARTBEAT.md';
  if (!require('fs').existsSync(hbPath)) {
    writeFile(hbPath, HEARTBEAT_TEMPLATE);
    console.log('Created HEARTBEAT.md');
  }
  console.log('agent-autonomy-kit initialized.');
}

// ─── Queue helpers ────────────────────────────────────────────────────────────

/**
 * Get all "Ready" tasks from the queue
 * @returns {string[]} array of task descriptions
 */
function getReadyTasks() {
  const content = readFile(QUEUE_FILE, '');
  const readySection = content.match(/## 🔴 Ready[\s\S]*?(?=## 🟡|$)/)?.[0] ?? '';
  return [...readySection.matchAll(/^- \[ \] (.+)$/gm)].map(m => m[1]);
}

/**
 * Claim a task: move from Ready → In Progress
 * @param {string} taskText
 * @param {string} agentName
 */
function claimTask(taskText, agentName) {
  let content = readFile(QUEUE_FILE, '');
  const escaped = taskText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  content = content.replace(`- [ ] ${taskText}`, `- [ ] @${agentName}: ${taskText}`);
  content = content.replace(
    /(\*Last updated: ).*/,
    `$1${new Date().toISOString()}`
  );
  writeFile(QUEUE_FILE, content);
  console.log(`Claimed: ${taskText}`);
}

/**
 * Complete a task: move from In Progress → Done Today
 * @param {string} taskText
 * @param {string} agentName
 */
function completeTask(taskText, agentName) {
  let content = readFile(QUEUE_FILE, '');
  content = content.replace(`- [ ] @${agentName}: ${taskText}`, `- [x] @${agentName}: ${taskText}`);
  content = content.replace(
    /(\*Last updated: ).*/,
    `$1${new Date().toISOString()}`
  );
  writeFile(QUEUE_FILE, content);
  console.log(`Completed: ${taskText}`);
}

/**
 * Add a new task to the Ready section
 * @param {string} taskText
 * @param {string} [priority] — 'high' or plain
 */
function addTask(taskText, priority = 'normal') {
  const content = readFile(QUEUE_FILE, '');
  const marker = priority === 'high' ? '### High Priority\n' : '';
  const insertion = marker + `- [ ] ${taskText}`;
  content.replace(
    /(\*Last updated: ).*/,
    `$1${new Date().toISOString()}`
  );
  writeFile(QUEUE_FILE, content.replace(
    '## 🔴 Ready (can be picked up)\n',
    `## 🔴 Ready (can be picked up)\n${marker}- [ ] ${taskText}\n`
  ));
  console.log(`Added task: ${taskText}`);
}

/**
 * Read the full queue content
 */
function getQueue() {
  return readFile(QUEUE_FILE, '');
}

/**
 * Write the full queue content
 */
function setQueue(content) {
  writeFile(QUEUE_FILE, content);
}

// ─── Handoff notes ────────────────────────────────────────────────────────────

/**
 * Write a handoff note before pausing (token limit)
 * @param {string} agentName
 * @param {string[]} workDone — array of work descriptions
 * @param {string[]} nextTasks — array of task descriptions
 */
function writeHandoffNote(agentName, workDone = [], nextTasks = []) {
  const today = new Date().toISOString().slice(0, 10);
  mkdirp(MEMORY_DIR);
  const note = `# Handoff Note — ${new Date().toISOString()}

**Agent:** ${agentName}
**Status:** Approaching token limit — pausing

## Work completed this session
${workDone.length ? workDone.map(w => `- ${w}`).join('\n') : '- (none)'}

## Next tasks (pick these up next session)
${nextTasks.length ? nextTasks.map(t => `- [ ] ${t}`).join('\n') : '- (none)'}

## Context to remember
- Check tasks/QUEUE.md for full queue state
- Review memory/${today}.md for today's notes
`;
  appendFile(`${MEMORY_DIR}/${today}.md`, note);
  console.log('Handoff note written to memory/' + today + '.md');
}

// ─── Token strategy ───────────────────────────────────────────────────────────

/**
 * Calculate token budget strategy
 * @param {number} estimatedDailyBudget — estimated daily token budget
 * @param {number} costPerHeartbeat — tokens used per heartbeat run
 */
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

// ─── CMD parsing ───────────────────────────────────────────────────────────────

function tokenize(cmd) {
  if (typeof cmd !== 'string') return [];
  var tokens = [];
  var buf = '';
  var inStr = false;
  var quote = '';
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if (inStr) {
      if (ch === quote) { inStr = false; quote = ''; }
      else { buf += ch; }
    } else {
      if (ch === '"' || ch === "'") { inStr = true; quote = ch; }
      else if (ch === ' ') { if (buf) { tokens.push(buf); buf = ''; } }
      else { buf += ch; }
    }
  }
  if (buf) tokens.push(buf);
  // Strip "run /skills/.../" prefix
  var runIdx = -1;
  for (var j = 0; j < tokens.length; j++) {
    if (tokens[j] === 'run' && j + 1 < tokens.length && tokens[j+1].indexOf('/skills/') >= 0) {
      runIdx = j; break;
    }
  }
  if (runIdx >= 0) tokens = tokens.slice(runIdx + 2);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = typeof cmd === 'string' ? tokenize(cmd) : cmd;
  var out = { action: '', flags: {}, args: [] };
  if (!tokens || !tokens.length) return out;
  out.action = tokens[0];
  for (var i = 1; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var kv = t.slice(2).split('=');
      out.flags[kv[0]] = kv[1] || true;
    } else {
      out.args.push(t);
    }
  }
  return out;
}

// ─── Handler / runFromParams ───────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }
  var action = params.action || '';
  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.action && !action) action = parsed.action;
    // Merge flags from command line into params
    for (var k in parsed.flags) { if (!params[k]) params[k] = parsed.flags[k]; }
    // Positional args
    if (parsed.args.length && !params._) { params._ = parsed.args; }
  }
  if (!action) action = 'help';

  switch (action) {
    case 'init':
      init();
      return 'agent-autonomy-kit initialized.';
    case 'tasks':
      return getReadyTasks().join('\n') || '(no ready tasks)';
    case 'queue':
      return getQueue();
    case 'claim': {
      var t = params.task || (params._ && params._[0]) || '';
      var a = params.agent || 'agent';
      if (!t) return 'Usage: claim <task text> [--agent=name]';
      claimTask(t, a);
      return 'Claimed: ' + t;
    }
    case 'complete': {
      var t2 = params.task || (params._ && params._[0]) || '';
      var a2 = params.agent || 'agent';
      if (!t2) return 'Usage: complete <task text> [--agent=name]';
      completeTask(t2, a2);
      return 'Completed: ' + t2;
    }
    case 'add': {
      var t3 = params.task || (params._ && params._[0]) || '';
      if (!t3) return 'Usage: add <task text> [--priority=high]';
      addTask(t3, params.priority);
      return 'Added: ' + t3;
    }
    case 'handoff': {
      var work = (params.workDone || '').split(',').filter(Boolean);
      var next = (params.nextTasks || '').split(',').filter(Boolean);
      writeHandoffNote(params.agent || 'agent', work, next);
      return 'Handoff note written.';
    }
    case 'strategy': {
      var budget = parseInt(params.budget) || 100000;
      var cost = parseInt(params.costPerHeartbeat) || 3000;
      return JSON.stringify(tokenStrategy(budget, cost), null, 2);
    }
    case 'help':
    default:
      return 'agent-autonomy-kit — Usage:\n' +
        '  init              — create tasks/QUEUE.md and HEARTBEAT.md\n' +
        '  tasks             — list ready tasks\n' +
        '  queue             — show full queue\n' +
        '  claim <text>      — claim a task\n' +
        '  complete <text>  — mark task done\n' +
        '  add <text>        — add new task\n' +
        '  handoff --workDone=a,b --nextTasks=c,d — write handoff note\n' +
        '  strategy [--budget=N] [--cost=N] — token budget advice';
  }
}

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ─── Exports ───────────────────────────────────────────────────────────────────

const myApi = {
  init,
  getReadyTasks,
  claimTask,
  completeTask,
  addTask,
  getQueue,
  setQueue,
  writeHandoffNote,
  tokenStrategy,
  HEARTBEAT_TEMPLATE,
  handler,
  runFromParams,
};

if (typeof module !== 'undefined' && module.exports) { module.exports = myApi; }
if (typeof globalThis !== 'undefined') { globalThis.agent_autonomy_kit = myApi; }

// ─── Node.js CLI (local dev only) ─────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  (async function() {
    var args = process.argv.slice(2);
    var result = await runFromParams({ command: args.join(' ') });
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  })();
}

// ─── PARAMS auto-run block (device /cmd only) ─────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
