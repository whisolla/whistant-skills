// Discord skill test — Whistant iPhone JSC runtime
// ------------------------------------------------------------------
// Guild: Whistant (1350904588231774361)
// Channel: #general (1350904589347717187)
// ------------------------------------------------------------------
const KEYCHAIN_TOKEN_KEY = 'discord_bot_token';
const CHANNEL   = '1350904589347717187';  // #general
const GUILD     = '1350904588231774361';  // Whistant
const BASE      = 'https://discord.com/api/v10';

// ------------------------------------------------------------------
// Token retrieval
// ------------------------------------------------------------------
async function getToken() {
  try {
    const stored = await keychain.get(KEYCHAIN_TOKEN_KEY);
    if (stored) { console.log('[keychain] token found'); return stored; }
  } catch (e) { console.log('[keychain] get error:', e.message || e); }
  throw new Error('discord_bot_token not found in keychain');
}

// ------------------------------------------------------------------
// Base discord() helper — matches SKILL.md exactly
// ------------------------------------------------------------------
function httpHeaders(token) {
  return { 'Authorization': 'Bot ' + token, 'Content-Type': 'application/json' };
}

async function discord(token, method, path, body, _retries) {
  _retries = _retries !== undefined ? _retries : 2;
  const opts = { method, headers: httpHeaders(token), timeout: 15 };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  if (res.status === 429) {
    if (_retries <= 0) throw new Error('Discord rate limited');
    const data = JSON.parse(text);
    const waitMs = (data.retry_after || 1) * 1000;
    await new Promise(r => setTimeout(r, waitMs));
    return discord(token, method, path, body, _retries - 1);
  }
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
  try { return JSON.parse(text); } catch { return text; }
}

// ------------------------------------------------------------------
// Run tests
// ------------------------------------------------------------------
(async () => {
  const results = { skill: 'discord', version: '3.4', runtime: 'iPhone-JSC', passed: [], failed: [] };
  let TOKEN = null; let sentId = null;

  // Token
  try { TOKEN = await getToken(); results.passed.push('keychain:token-retrieved'); }
  catch (e) { results.failed.push('keychain:token -> ' + e.message); }

  if (!TOKEN) { console.log(JSON.stringify(results)); return; }

  // Auth
  try {
    const me = await discord(TOKEN, 'GET', '/users/@me');
    if (me && me.bot) results.passed.push('live:auth (bot=' + me.username + ', id=' + me.id + ')');
    else results.failed.push('live:auth -> ' + JSON.stringify(me).slice(0, 100));
  } catch (e) { results.failed.push('live:auth -> ' + e.message); }

  // Guild channels
  try {
    const channels = await discord(TOKEN, 'GET', '/guilds/' + GUILD + '/channels');
    const text = channels.filter(c => c.type === 0);
    results.passed.push('live:guild-channels (count=' + text.length + ')');
    text.forEach(c => console.log('  #' + c.name + ' → ' + c.id));
  } catch (e) { results.failed.push('live:guild-channels -> ' + e.message); }

  // Send
  try {
    const msg = await discord(TOKEN, 'POST', '/channels/' + CHANNEL + '/messages', {
      content: '🧪 Whistant discord skill v3.4 test ✅',
    });
    if (msg && msg.id) { sentId = msg.id; results.passed.push('live:send (id=' + sentId + ')'); }
    else results.failed.push('live:send -> ' + JSON.stringify(msg).slice(0, 100));
  } catch (e) { results.failed.push('live:send -> ' + e.message); }

  // Read
  try {
    const msgs = await discord(TOKEN, 'GET', '/channels/' + CHANNEL + '/messages?limit=5');
    if (Array.isArray(msgs)) results.passed.push('live:read (count=' + msgs.length + ')');
    else results.failed.push('live:read -> ' + JSON.stringify(msgs).slice(0, 80));
  } catch (e) { results.failed.push('live:read -> ' + e.message); }

  // React
  if (sentId) {
    try {
      const emoji = encodeURIComponent('✅');
      const r = await fetch(BASE + '/channels/' + CHANNEL + '/messages/' + sentId + '/reactions/' + emoji + '/@me', {
        method: 'PUT', headers: httpHeaders(TOKEN),
      });
      if (r.status === 204) results.passed.push('live:react');
      else results.failed.push('live:react -> HTTP ' + r.status + ': ' + (await r.text()).slice(0, 80));
    } catch (e) { results.failed.push('live:react -> ' + e.message); }
  }

  results.ok = results.failed.length === 0;
  console.log(JSON.stringify(results, null, 2));
})();
