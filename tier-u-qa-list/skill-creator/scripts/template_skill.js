// ============================================================================
// SKILL TEMPLATE — unified structure for Whistant JSC runtime
//
// JSC compatibility rules:
//   1. Use normal `async function` style everywhere — works in both
//      require() and direct execution contexts.
//   2. PARAMS block MUST use `return (async function() { ... })()` —
//      the `return` makes TerminalManager's outer IIFE await this one.
//      Without it you get silent "No output after 15s" timeout.
//   3. Never use .then() at top level — always await.
//   4. module.exports must be set synchronously (before any await).
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC — replace with your actual implementation
// ---------------------------------------------------------------------------

async function myAction(input) {
  const res = await fetch('https://example.com/api?q=' + encodeURIComponent(input || ''), { timeout: 10 });
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return await res.json();
}

// ---------------------------------------------------------------------------
// 2. HANDLER — standard AI entry point: await mod.handler({ parameters: {...} })
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  // Fallback: if called with no parameters but PARAMS was injected by Swift
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS — must be synchronous, before any await
// ---------------------------------------------------------------------------

var skillApi = { myAction, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.mySkill = skillApi;
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING — tokenize + parseCommand for /cmd path
//    tokenize() is generic and identical across all skills.
//    parseCommand() is skill-specific — adapt flags/args to your skill.
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; if (cur) tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = { input: undefined };
  if (!tokens.length) return out;

  // Drop leading: run, filename
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0, parts = [];
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--input' || t === '-i') && i + 1 < tokens.length) {
      out.input = tokens[i + 1]; i += 2; continue;
    }
    if (t.startsWith('-')) { i += 1; continue; }
    parts.push(t);
    i += 1;
  }
  if (!out.input && parts.length) out.input = parts.join(' ');
  return out;
}

// ---------------------------------------------------------------------------
// 5. runFromParams — reads PARAMS injected by Swift or accepts a params object
//    Shared by both handler() and the PARAMS auto-run block below.
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // Resolve input: direct field → parsed command string → argv
  var input = params.input || params.query || params.text || '';
  if (!input && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.input) input = parsed.input;
  }
  if (!input && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.input) input = parsed.input;
  }

  return await myAction(input);
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry (local dev / testing only — never fires on device)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block — device /cmd path (run skill.js --flag value)
//    `return` is REQUIRED — makes TerminalManager's outer IIFE await this.
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
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
