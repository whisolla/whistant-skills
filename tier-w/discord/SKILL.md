---
name: discord
description: Send and read Discord messages via Discord REST API v10 using a Bot Token. Supports send, read, react, edit, delete, threads, DMs, guild discovery, and more — all via fetch(). No CLI required.
version: 3.4
---
# discord

Interact with Discord via `fetch()` using the Discord REST API v10. Works anywhere `fetch` is available — no child_process, no WebSocket, no binaries needed.

## Runtime: fetch✅ | blocked: child_process WebSocket Blob

---

## Known JSC Gotchas (iOS / JavaScriptCore)

These are verified on iPhone JavaScriptCore:

1. **Use `JSON.parse(await res.text())` instead of `await res.json()`** — JSC's `.json()` Promise doesn't correctly reconstruct JS arrays from JSON array responses.
2. **`keychain.get/set` are async-structured** — use `await keychain.get(key)` to resolve.
3. **Top-level `await`** is supported natively — no wrapping needed.
4. **Unicode emoji in reaction URLs must be `encodeURIComponent()`** — e.g. `encodeURIComponent('✅')`.
5. **No `require()` or ESM** — use plain script globals.

---

## Auth Setup (one-time)

You need a **Discord Bot Token**:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** → **Bot** tab → **Add Bot** → copy the **Token**
3. Under **OAuth2 → URL Generator**: scopes = `bot`, permissions = `Send Messages`, `Read Message History`, `Add Reactions`, `Manage Messages`
4. Open the generated URL to invite the bot to your server
5. In **Bot settings**, enable **Message Content Intent** (required to read `message.content`)
6. **Store the token** — never hardcode it (see Token Storage below)

To find channel/guild/message IDs: enable **Developer Mode** in Discord (Settings → Advanced → Developer Mode), then right-click → **Copy ID**.

---

## Token Storage

### Whistant iOS (JavaScriptCore runtime)

Use the built-in `keychain` global:

```js
// Store token once
await keychain.set('discord_bot_token', 'YOUR_BOT_TOKEN_HERE');

// Retrieve token on every run
const token = await keychain.get('discord_bot_token');
if (!token) throw new Error('Discord token not found — run setup first');
```

`keychain.get()` returns `string | null`. Token persists across sessions.

### Backend / Node.js

```js
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // not hardcoded
```

---

## Base Helper (with rate-limit retry)

Discord returns `429` on rate limit. Use `discord()` below — it auto-retries with backoff:

```js
const DISCORD_API = 'https://discord.com/api/v10';

async function discord(token, method, path, body, _retries = 2) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
      // Required on iOS — Cloudflare blocks iOS URLSession unless DiscordBot UA is used
      'User-Agent': 'DiscordBot (https://discord.com/developers, 5.0)',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(DISCORD_API + path, opts);
  const text = await res.text();
  if (res.status === 429) {
    if (_retries <= 0) throw new Error('Discord rate limited');
    const data = JSON.parse(text);
    const waitMs = (data.retry_after || 1) * 1000;
    await new Promise(r => setTimeout(r, waitMs));
    return discord(token, method, path, body, _retries - 1);
  }
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Discord ${method} ${path} → ${res.status}: ${text}`);
  // Use JSON.parse(await res.text()) — r.json() doesn't correctly reconstruct
  // JS arrays from JSON arrays in iOS JavaScriptCore.
  try { return JSON.parse(text); } catch { return text; }
}
```

> **Why retry?** Discord's rate limits are per-route and easy to hit on bursty usage. The retry above waits `retry_after` seconds before re-attempting.

---

## Getting the Token (Whistant iOS)

```js
const KEY = 'discord_bot_token';

async function getDiscordToken() {
  let token = await keychain.get(KEY);
  if (token) return token;
  // First run: replace with your actual bot token
  throw new Error('Token not found in keychain — store your bot token first');
}

const BOT_TOKEN = await getDiscordToken();
```

---

## Send Message

```js
const CHANNEL_ID = '1234567890'; // Replace with your channel ID

const msg = await discord(BOT_TOKEN, 'POST', `/channels/${CHANNEL_ID}/messages`, {
  content: 'Hello from Whistant! 👋',
});
console.log('Sent:', msg.id);
```

### Send with Embed

```js
const msg = await discord(BOT_TOKEN, 'POST', `/channels/${CHANNEL_ID}/messages`, {
  embeds: [{
    title: 'Status Update',
    description: 'Task completed.',
    color: 0x5865F2,
    timestamp: new Date().toISOString(),
  }],
});
```

### Reply to a Message

```js
const msg = await discord(BOT_TOKEN, 'POST', `/channels/${CHANNEL_ID}/messages`, {
  content: 'Got it!',
  message_reference: { message_id: REPLY_TO_ID },
});
```

---

## Read Messages

```js
const messages = await discord(BOT_TOKEN, 'GET', `/channels/${CHANNEL_ID}/messages?limit=20`);
for (const m of messages) {
  console.log(`[${m.author.username}] ${m.content}`);
}
```

---

## React to a Message

```js
// Unicode emoji — MUST use encodeURIComponent()
const emoji = encodeURIComponent('✅');
await discord(BOT_TOKEN, 'PUT',
  `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}/reactions/${emoji}/@me`);
console.log('Reacted!');
```

### Custom Server Emoji

```js
// Format: name:emojiId  (e.g. "pizza:123456789012345678")
const customEmoji = encodeURIComponent('pizza:123456789012345678');
await discord(BOT_TOKEN, 'PUT',
  `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}/reactions/${customEmoji}/@me`);
```

---

## Edit a Message

```js
const edited = await discord(BOT_TOKEN, 'PATCH',
  `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`,
  { content: 'Fixed content.' });
```

---

## Delete a Message

```js
await discord(BOT_TOKEN, 'DELETE',
  `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`);
```

---

## Create a Thread

```js
const thread = await discord(BOT_TOKEN, 'POST',
  `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}/threads`, {
    name: 'Discussion',
    auto_archive_duration: 1440, // minutes: 60, 1440, 4320, 10080
  });
console.log('Thread:', thread.id);
```

---
---

## List My Guilds / Servers

```js
// List all servers the bot is in
const guilds = await discord(BOT_TOKEN, 'GET', '/users/@me/guilds');
for (const g of guilds) {
  console.log(g.name, '→', g.id);
}
```

---

## List Channels in a Server

```js
// Get all channels in a guild (returns categories + voice + text)
const channels = await discord(BOT_TOKEN, 'GET', `/guilds/${GUILD_ID}/channels`);

// Filter to text channels only (type=0)
const textChannels = channels.filter(c => c.type === 0);
for (const ch of textChannels) {
  console.log('#' + ch.name, '→', ch.id, '| parent:', ch.parent_id || 'none');
}
```

---

## Send a DM

```js
// 1. Open or get existing DM channel with a user
const dm = await discord(BOT_TOKEN, 'POST', '/users/@me/channels', {
  recipient_id: USER_ID,
});
// dm.id is the channel ID to use for messaging

// 2. Send message to the DM channel
const msg = await discord(BOT_TOKEN, 'POST', `/channels/${dm.id}/messages`, {
  content: 'Hello from Whistant!',
});
console.log('DM sent:', msg.id);
```

---

## Channel Types

| type | Meaning        |
|------|---------------|
| 0    | Text channel  |
| 2    | Voice         |
| 4    | Category      |
| 5    | Announcement  |
| 11   | Public thread |
| 12   | Private thread |

---

## Quick Reference

| Action | Method | Path |
|--------|--------|------|
| Send message | `POST` | `/channels/{id}/messages` |
| Read messages | `GET` | `/channels/{id}/messages?limit=N` |
| Edit message | `PATCH` | `/channels/{id}/messages/{id}` |
| Delete message | `DELETE` | `/channels/{id}/messages/{id}` |
| React | `PUT` | `/channels/{id}/messages/{id}/reactions/{emoji}/@me` |
| Create thread | `POST` | `/channels/{id}/messages/{id}/threads` |
| List guild channels | `GET` | `/guilds/{id}/channels` |
| Open DM | `POST` | `/users/@me/channels` |
| List guilds | `GET` | `/users/@me/guilds` |
| Bot info | `GET` | `/users/@me` |

All endpoints base: `https://discord.com/api/v10`
