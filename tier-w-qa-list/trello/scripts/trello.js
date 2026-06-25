// ── Trello REST API wrapper ──────────────────────────────────────────────────
// Base URL: https://api.trello.com/1
// Auth: ?key= & ?token= query params
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://api.trello.com/1';

let _apiKey = null;
let _token = null;

async function _getApiKey() {
  if (_apiKey) return _apiKey;
  if (typeof TRELLO_API_KEY !== 'undefined' && TRELLO_API_KEY) { _apiKey = TRELLO_API_KEY; return _apiKey; }
  if (typeof keychain !== 'undefined') {
    try { var v = await keychain.get('TRELLO_API_KEY'); if (v) { _apiKey = v; return _apiKey; } } catch (e) {}
  }
  return null;
}

async function _getApiToken() {
  if (_token) return _token;
  if (typeof TRELLO_API_TOKEN !== 'undefined' && TRELLO_API_TOKEN) { _token = TRELLO_API_TOKEN; return _token; }
  if (typeof keychain !== 'undefined') {
    try { var v = await keychain.get('TRELLO_API_TOKEN'); if (v) { _token = v; return _token; } } catch (e) {}
  }
  return null;
}

async function getCredentials() {
  var key = await _getApiKey();
  var token = await _getApiToken();
  return { apiKey: key, token: token };
}

function authParams(creds) {
  return '?key=' + encodeURIComponent(creds.apiKey) + '&token=' + encodeURIComponent(creds.token);
}

async function trelloFetch(path, options) {
  const creds = await getCredentials();
  if (!creds.apiKey || !creds.token) {
    return { ok: false, message: '🔑 Trello API Key + Token required.\n\n1. Get API Key: https://trello.com/power-ups/admin (log in, click API Key)\n2. Generate Token (click Token link)\n3. Configure via keychain: await trello.configure(KEY, TOKEN)' };
  }
  try {
    const res = await fetch(BASE + path + authParams(creds), {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      var errText = '';
      try { errText = await res.text() || ''; } catch (e2) {}
      return { ok: false, message: '❌ Trello API error ' + res.status + (errText ? ': ' + errText : '') };
    }
    var data;
    try { data = await res.json(); } catch (e2) {
      var textBody = '';
      try { textBody = await res.text() || ''; } catch (e3) {}
      return { ok: false, message: '❌ Trello response parse error' + (textBody ? ': ' + textBody : '') };
    }
    if (data.error) return { ok: false, message: '❌ Trello API error: ' + data.error };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ Network error: ' + (e.message || String(e)) };
  }
}

// ── Operations ────────────────────────────────────────────────────────────────

async function listBoards() {
  return trelloFetch('/members/me/boards', { method: 'GET' });
}

async function getBoard(boardId) {
  return trelloFetch('/boards/' + boardId, { method: 'GET' });
}

async function getBoardLists(boardId) {
  return trelloFetch('/boards/' + boardId + '/lists', { method: 'GET' });
}

async function getBoardCards(boardId) {
  return trelloFetch('/boards/' + boardId + '/cards', { method: 'GET' });
}

async function getList(listId) {
  return trelloFetch('/lists/' + listId, { method: 'GET' });
}

async function getListCards(listId) {
  return trelloFetch('/lists/' + listId + '/cards', { method: 'GET' });
}

async function createCard(args) {
  // args: { idList, name, desc }
  return trelloFetch('/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { idList: args.idList, name: args.name, desc: args.desc || '' },
  });
}

async function updateCard(cardId, fields) {
  // fields: { name, desc, closed, idList }
  return trelloFetch('/cards/' + cardId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: fields,
  });
}

async function moveCard(cardId, idList) {
  return updateCard(cardId, { idList });
}

async function addComment(cardId, text) {
  return trelloFetch('/cards/' + cardId + '/actions/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { text },
  });
}

async function archiveCard(cardId) {
  return updateCard(cardId, { closed: true });
}

function init(apiKey, token) {
  _apiKey = apiKey;
  if (token) _token = token;
  return { ok: true };
}

async function configure(apiKey, token) {
  _apiKey = apiKey;
  _token = token;
  if (typeof keychain !== 'undefined') {
    try {
      await keychain.set('TRELLO_API_KEY', apiKey);
      await keychain.set('TRELLO_API_TOKEN', token);
    } catch (e) {
      return { ok: false, message: 'Setup failed: ' + e.message };
    }
  }
  return { ok: true };
}

// ── Handler ──────────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ── Exports ──────────────────────────────────────────────────────────────────

const trelloApi = {
  handler,
  init,
  configure,
  getCredentials,
  runFromParams,
  listBoards,
  getBoard,
  getBoardLists,
  getBoardCards,
  getList,
  getListCards,
  createCard,
  updateCard,
  moveCard,
  addComment,
  archiveCard,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = trelloApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.trello = trelloApi;
}

// ── CMD Parsing ─────────────────────────────────────────────────────────────

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
  var out = { action: '', flags: {}, args: [] };
  if (!tokens.length) return out;

  // Strip "run /skills/trello/scripts/trello.js" prefix if present
  var runIdx = -1;
  for (var j = 0; j < tokens.length; j++) {
    if (tokens[j] === 'run' && j + 1 < tokens.length && tokens[j + 1].indexOf('/skills/') >= 0) {
      runIdx = j;
      break;
    }
  }
  if (runIdx >= 0) {
    tokens = tokens.slice(runIdx + 2);
  }

  if (!tokens.length) return out;
  out.action = tokens[0];

  var i = 1;
  while (i < tokens.length) {
    var t = tokens[i];
    if (t === '--board' && i + 1 < tokens.length) {
      out.flags.boardId = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--list' && i + 1 < tokens.length) {
      out.flags.listId = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--card' && i + 1 < tokens.length) {
      out.flags.cardId = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--name' && i + 1 < tokens.length) {
      out.flags.name = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--desc' && i + 1 < tokens.length) {
      out.flags.desc = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--text' && i + 1 < tokens.length) {
      out.flags.text = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--to' && i + 1 < tokens.length) {
      out.flags.toListId = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--count' && i + 1 < tokens.length) {
      out.flags.count = parseInt(tokens[i + 1], 10); i += 2; continue;
    }
    out.args.push(t);
    i += 1;
  }
  return out;
}

// ── runFromParams ────────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  var action = params.action || '';
  var p = params;

  // Parse from params.command if present (from PARAMS block /cmd path)
  if (params.command && !action) {
    var parsed = parseCommand(params.command);
    if (parsed.action) action = parsed.action;
    if (parsed.flags.boardId) p.boardId = parsed.flags.boardId;
    if (parsed.flags.listId) p.listId = parsed.flags.listId;
    if (parsed.flags.cardId) p.cardId = parsed.flags.cardId;
    if (parsed.flags.name) p.name = parsed.flags.name;
    if (parsed.flags.desc) p.desc = parsed.flags.desc;
    if (parsed.flags.text) p.text = parsed.flags.text;
    if (parsed.flags.toListId) p.idList = parsed.flags.toListId;
    if (parsed.flags.count) p.count = parsed.flags.count;
    if (parsed.args.length && !p.boardId && !p.listId && !p.cardId) {
      // Map first positional arg based on action
      if (["getBoard","getBoardLists","getBoardCards"].indexOf(action) >= 0) {
        p.boardId = parsed.args[0];
      } else if (["getList","getListCards"].indexOf(action) >= 0) {
        p.listId = parsed.args[0];
      } else if (["moveCard","addComment","archiveCard","updateCard","getListCards"].indexOf(action) >= 0) {
        p.cardId = parsed.args[0];
      } else {
        p.id = parsed.args[0];
      }
    }
  }

  if (!action) {
    return 'Usage: run /skills/trello/scripts/trello.js <action> [args]\n\n' +
      'Actions:\n' +
      '  listBoards                    — List all boards\n' +
      '  getBoard <boardId>            — Get board details\n' +
      '  getBoardLists <boardId>       — Get board lists\n' +
      '  getBoardCards <boardId>       — Get board cards\n' +
      '  getList <listId>              — Get list details\n' +
      '  getListCards <listId>         — Get list cards\n' +
      '  createCard --list <idList> [--name "title"] [--desc "description"]  — Create a card\n' +
      '  moveCard <cardId> --to <listId>                                     — Move card\n' +
      '  addComment <cardId> --text "comment text"                           — Add comment\n' +
      '  archiveCard <cardId>                                                 — Archive card\n\n' +
      'Examples:\n' +
      '  run /skills/trello/scripts/trello.js listBoards\n' +
      '  run /skills/trello/scripts/trello.js getBoardLists 6a07717fb38ec6886c42496d\n' +
      '  run /skills/trello/scripts/trello.js createCard --list 6a077180b38ec6886c424985 --name "New Task" --desc "Details"\n' +
      '  run /skills/trello/scripts/trello.js addComment 6a0a31c47155364d9841eb57 --text "Done!"';
  }

  try {
    switch (action) {
      case 'listBoards':
        return await listBoards();
      case 'getBoard':
        if (!p.boardId) return { ok: false, message: 'Missing boardId' };
        return await getBoard(p.boardId);
      case 'getBoardLists':
        if (!p.boardId) return { ok: false, message: 'Missing boardId' };
        return await getBoardLists(p.boardId);
      case 'getBoardCards':
        if (!p.boardId) return { ok: false, message: 'Missing boardId' };
        return await getBoardCards(p.boardId);
      case 'getList':
        if (!p.listId) return { ok: false, message: 'Missing listId' };
        return await getList(p.listId);
      case 'getListCards':
        if (!p.listId) return { ok: false, message: 'Missing listId' };
        return await getListCards(p.listId);
      case 'createCard':
        if (!p.listId) return { ok: false, message: 'Missing --list <idList>' };
        return await createCard({ idList: p.listId, name: p.name || 'New Card', desc: p.desc || '' });
      case 'updateCard':
        if (!p.cardId) return { ok: false, message: 'Missing cardId' };
        return await updateCard(p.cardId, p.fields || {});
      case 'moveCard':
        if (!p.cardId || !p.idList) return { ok: false, message: 'Missing cardId or --to <listId>' };
        return await moveCard(p.cardId, p.idList);
      case 'addComment':
        if (!p.cardId || !p.text) return { ok: false, message: 'Missing cardId or --text' };
        return await addComment(p.cardId, p.text);
      case 'archiveCard':
        if (!p.cardId) return { ok: false, message: 'Missing cardId' };
        return await archiveCard(p.cardId);
      default:
        return { ok: false, message: 'Unknown action: ' + action + '. Available: listBoards, getBoard, getBoardLists, createCard, moveCard, addComment, archiveCard' };
    }
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// ── Node.js CLI ─────────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) {
      if (typeof result === 'string') console.log(result);
      else console.log(JSON.stringify(result, null, 2));
    })
    .catch(function(err) {
      console.error(err && err.message ? err.message : String(err));
      process.exitCode = 1;
    });
}

// ── PARAMS auto-run block ───────────────────────────────────────────────────

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') console.log(result);
      else console.log(JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
