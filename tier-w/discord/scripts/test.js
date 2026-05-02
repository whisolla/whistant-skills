// Discord skill test — Whistant iPhone JSC runtime
// ------------------------------------------------------------------
// This file tests the discord skill against a live bot.
// Channel/guild IDs and token are specific to THIS test setup.
// The SKILL.md is generic — this file is the test harness.
// ------------------------------------------------------------------
const KEYCHAIN_TOKEN_KEY = 'discord_bot_token';
const CHANNEL   = 'CHANNEL_ID';   // ← Replace with your channel ID
const GUILD     = 'GUILD_ID';     // ← Replace with your guild ID
const BASE      = 'https://discord.com/api/v10';

// Fallback token — replace with your bot token for testing
const _fallback = 'YOUR_BOT_TOKEN_HERE';

// ------------------------------------------------------------------
// Token retrieval
// ------------------------------------------------------------------
async function getToken() {
  try {
    const stored = await keychain.get(KEYCHAIN_TOKEN_KEY);
    if (stored) { console.log('[keychain] token found'); return stored; }
  } catch (e) { console.log('[keychain] get error:', e.message || e); }
  console.log('[keychain] storing fallback token...');
  await keychain.set(KEYCHAIN_TOKEN_KEY, _fallback);
  return _fallback;
}

// ------------------------------------------------------------------
// Base discord() helper — matches SKILL.md exactly
// ------------------------------------------------------------------
function httpHeaders(token) {
  return { 'Authorization': 'Bot ' + token, 'Content-Type': 'application/json' };
}

async function discord(token, method, path, body) {
  const opts = { method, headers: httpHeaders(token), timeout: 15 };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
  try { return JSON.parse(text); } catch { return text; }
}

// ------------------------------------------------------------------
// Run tests
// ------------------------------------------------------------------
(async () => {
  const results = { skill: 'discord', version: '3.2', runtime: 'iPhone-JSC', passed: [], failed: [] };
  let TOKEN = null; let sentId = null;

  // Token
  try { TOKEN = await getToken(); results.passed.push('keychain:token-retrieved'); }
  catch (e) { results.failed.push('keychain:token -> ' + e.message); }

  if (!TOKEN) { console.log(JSON.stringify(results)); return; }

  // Auth
  try {
    const me = await discord(TOKEN, 'GET', '/users/@me');
    if (me && me.bot) results.passed.push('live:auth (bot=' + me.username + ')');
    else results.failed.push('live:auth -> ' + JSON.stringify(me).slice(0, 100));
  } catch (e) { results.failed.push('live:auth -> ' + e.message); }

  // Guild channels (requires GUILD to be set)
  if (GUILD !== 'GUILD_ID') {
    try {
      const channels = await discord(TOKEN, 'GET', '/guilds/' + GUILD + '/channels');
      if (Array.isArray(channels)) results.passed.push('live:guild-channels (count=' + channels.length + ')');
      else results.failed.push('live:guild-channels -> ' + JSON.stringify(channels).slice(0, 80));
    } catch (e) { results.failed.push('live:guild-channels -> ' + e.message); }
  }

  // Send (requires CHANNEL to be set)
  if (CHANNEL !== 'CHANNEL_ID') {
    try {
      const msg = await discord(TOKEN, 'POST', '/channels/' + CHANNEL + '/messages', {
        content: '🧪 Whistant discord skill v3.2 test ✅',
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

    // React (requires sentId)
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
  } else {
    results.passed.push('skip:send (CHANNEL not configured)');
    results.passed.push('skip:read (CHANNEL not configured)');
    results.passed.push('skip:react (CHANNEL not configured)');
  }

  results.ok = results.failed.length === 0;
  console.log(JSON.stringify(results, null, 2));
})();
