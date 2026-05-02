'use strict';

// ── Trello REST API wrapper ──────────────────────────────────────────────────
// Base URL: https://api.trello.com/1
// Auth: ?key= & ?token= query params
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://api.trello.com/1';

let _apiKey = null;
let _token = null;

function getCredentials() {
  if (_apiKey && _token) return { apiKey: _apiKey, token: _token };
  try {
    const { config } = require('swift:config');
    _apiKey = config.get('skills.entries.trello.apiKey') || null;
    _token = config.get('skills.entries.trello.token') || null;
  } catch (e) { /* config not available */ }
  return { apiKey: _apiKey, token: _token };
}

function authParams(creds) {
  return '?key=' + encodeURIComponent(creds.apiKey) + '&token=' + encodeURIComponent(creds.token);
}

async function trelloFetch(path, options) {
  const creds = getCredentials();
  if (!creds.apiKey || !creds.token) {
    return { ok: false, message: '🔑 需要先配置 Trello API Key 和 Token。\n\n1. 获取 API Key: https://trello.com/app-key\n2. 生成 Token (点击 API Key 页面上的 Token 链接)\n3. 告诉我这两个值，我帮你配置' };
  }
  try {
    const res = await fetch(BASE + path + authParams(creds), {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    if (data.error) return { ok: false, message: '❌ Trello API 错误: ' + data.error };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 网络请求失败: ' + e.message };
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

async function configure(apiKey, token) {
  try {
    const { config } = require('swift:config');
    config.set('skills.entries.trello.apiKey', apiKey);
    config.set('skills.entries.trello.token', token);
    _apiKey = apiKey;
    _token = token;
    return { ok: true };
  } catch (e) {
    return { ok: false, message: '配置失败: ' + e.message };
  }
}

async function handler(event, context) {
  const params = (event && event.parameters) || {};
  const action = params.action || 'listBoards';

  try {
    switch (action) {
      case 'listBoards': return await listBoards();
      case 'getBoard': return await getBoard(params.boardId);
      case 'getBoardLists': return await getBoardLists(params.boardId);
      case 'getBoardCards': return await getBoardCards(params.boardId);
      case 'getList': return await getList(params.listId);
      case 'getListCards': return await getListCards(params.listId);
      case 'createCard': return await createCard(params);
      case 'updateCard': return await updateCard(params.cardId, params.fields);
      case 'moveCard': return await moveCard(params.cardId, params.idList);
      case 'addComment': return await addComment(params.cardId, params.text);
      case 'archiveCard': return await archiveCard(params.cardId);
      default: return { ok: false, message: 'Unknown action: ' + action };
    }
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

function init(apiKey, token) {
  _apiKey = apiKey;
  if (token) _token = token;
  return { ok: true };
}

module.exports = {
  handler, init,
  listBoards, getBoard, getBoardLists, getBoardCards,
  getList, getListCards, createCard, updateCard,
  moveCard, addComment, archiveCard, configure, getCredentials,
};
