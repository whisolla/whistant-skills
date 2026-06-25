---
name: discord
description: Send and read Discord messages via Discord REST API v10 using a Bot Token. Supports send, read, react, edit, delete, threads, DMs, guild discovery, and more — all via fetch(). Evolved from steipete/discord version 1.0.1 at 2026-05-21.
version: 3.6
keychain: [discord_bot_token]
---
# discord

Interact with Discord via `fetch()` using the Discord REST API v10. Works anywhere `fetch` is available — no child_process, no WebSocket, no binaries needed.

## Runtime: fetch✅ | blocked: child_process WebSocket Blob

## Token Setup (one-time)

The bot token is read from these sources in priority order:
1. `globalThis.DISCORD_BOT_TOKEN` — injected by Whistant runtime
2. `keychain.get('discord_bot_token')` — persistent per-user storage
3. `params.token` — passed explicitly via `/cmd` flag

**Store your bot token once:**
```js
await keychain.set('discord_bot_token', 'MTQ...your-token-here');
```

To obtain a Discord Bot Token:
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** → **Bot** tab → **Add Bot** → copy the **Token**
3. Under **OAuth2 → URL Generator**: scopes = `bot`, permissions = `Send Messages`, `Read Message History`, `Add Reactions`, `Manage Messages`
4. Open the generated URL to invite the bot to your server
5. In **Bot settings**, enable **Message Content Intent** (required to read `message.content`)
6. Enable **Developer Mode** (Settings → Advanced → Developer Mode) to find channel/guild/message IDs via right-click → **Copy ID**

## /cmd Usage

```sh
# Bot info / auth test
run /skills/discord/scripts/discord.js botInfo

# List guilds the bot is in
run /skills/discord/scripts/discord.js listGuilds

# List channels in a guild
run /skills/discord/scripts/discord.js listChannels --guildId 1350904588231774361

# Send a message
run /skills/discord/scripts/discord.js sendMessage --channelId 1350904589347717187 --content "Hello from Whistant!"

# Read recent messages
run /skills/discord/scripts/discord.js readMessages --channelId 1350904589347717187 --limit 5

# React to a message
run /skills/discord/scripts/discord.js react --channelId 1350904589347717187 --messageId 1507184126447456437 --emoji ✅

# Open a DM channel with a user
run /skills/discord/scripts/discord.js openDM --userId USER_ID

# Create a thread from a message
run /skills/discord/scripts/discord.js createThread --channelId ... --messageId ... --name Discussion
```

## /code Usage

```js
const discord = require('/skills/discord/scripts/discord.js');

// Bot info (token auto-resolved from keychain)
console.log(await discord.botInfo());

// List guilds
console.log(await discord.listGuilds());

// Read messages from a channel
const msgs = await discord.readMessages({ channelId: '1350904589347717187', limit: 5 });
msgs.forEach(m => console.log('[' + m.author.username + '] ' + m.content.slice(0, 80)));

// Send a message
console.log(await discord.sendMessage({
  channelId: '1350904589347717187',
  content: 'Hello from Whistant! 👋',
}));

// React to a message
console.log(await discord.react({
  channelId: '1350904589347717187',
  messageId: '1507184126447456437',
  emoji: '✅',
}));
```

## Available Actions

| Action | Params | Method/Path |
|--------|--------|-------------|
| `botInfo` | — | `GET /users/@me` |
| `listGuilds` | — | `GET /users/@me/guilds` |
| `listChannels` | `guildId` | `GET /guilds/{id}/channels` |
| `getChannel` | `channelId` | `GET /channels/{id}` |
| `sendMessage` | `channelId`, `content`, `embeds?` | `POST /channels/{id}/messages` |
| `readMessages` | `channelId`, `limit?` | `GET /channels/{id}/messages` |
| `editMessage` | `channelId`, `messageId`, `content` | `PATCH /channels/{id}/messages/{id}` |
| `deleteMessage` | `channelId`, `messageId` | `DELETE /channels/{id}/messages/{id}` |
| `react` | `channelId`, `messageId`, `emoji` | `PUT /channels/{id}/messages/{id}/reactions/{emoji}/@me` |
| `getReactions` | `channelId`, `messageId`, `emoji?` | `GET /channels/{id}/messages/{id}/reactions` |
| `createThread` | `channelId`, `messageId`, `name` | `POST /channels/{id}/messages/{id}/threads` |
| `openDM` | `userId` | `POST /users/@me/channels` |

## API Notes

- **Rate limit:** All calls auto-retry on 429 with `retry_after` backoff (2 retries)
- **User-Agent:** `DiscordBot (https://discord.com/developers, 5.0)` — required on iOS to avoid Cloudflare blocks
- **Reactions:** Unicode emoji must be raw (not `:name:`); the function calls `encodeURIComponent()` internally
- **DM channels:** Use `openDM` first to get/create a DM channel, then `sendMessage` with the returned `id`
- **Channel types:** 0=Text, 2=Voice, 4=Category, 5=Announcement, 11=Public thread, 12=Private thread

## Known JSC Gotchas

1. Use `JSON.parse(await res.text())` instead of `await res.json()` — JSC's `.json()` Promise doesn't correctly reconstruct JS arrays from JSON array responses.
2. `keychain.get/set` are async-structured — use `await keychain.get(key)` to resolve.
3. Unicode emoji in reaction URLs must be `encodeURIComponent()` — handled automatically in `react()`.
4. The `User-Agent: DiscordBot` header is required on iOS — Cloudflare blocks iOS URLSession otherwise.

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
DISCORD_BOT_TOKEN=MTQ... node scripts/discord.js botInfo
```
