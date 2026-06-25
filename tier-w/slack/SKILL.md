---
name: slack
description: Interact with Slack via the Slack Web API using fetch(). List channels, read/send messages, react, pin, and manage emoji. Evolved from steipete/slack version 1.0.0 at 2026-05-27.
version: 1.4
keychain: [SLACK_BOT_TOKEN]
---
# slack

Interact with Slack via `fetch()` using the Slack Web API. Works anywhere `fetch` is available — no child_process, no binaries needed.

## Runtime: fetch✅ | blocked: child_process WebSocket Blob

## Token Setup (one-time)

The bot token is read from these sources in priority order:
1. `globalThis.SLACK_BOT_TOKEN` — injected by Whistant runtime
2. `keychain.get('SLACK_BOT_TOKEN')` — persistent per-user storage
3. `process.env.SLACK_BOT_TOKEN` — for local devenv testing

**Store your bot token once:**
```js
await keychain.set('SLACK_BOT_TOKEN', 'xoxb-your-token-here');
```

To obtain a Slack bot token:
1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable necessary scopes (chat:write, channels:history, channels:read, etc.)
3. Install the app to your workspace and copy the Bot User OAuth Token

## Usage

All operations use `/cmd`. Token auto-resolved from `globalThis` → `keychain`.

```sh
# List channels the bot can access
run /skills/slack/scripts/slack.js listChannels

# Read recent messages from a channel
run /skills/slack/scripts/slack.js readMessages --channelId C08RP3EN692 --limit 5

# Send a message to a channel
run /skills/slack/scripts/slack.js sendMessage --to channel:C08RP3EN692 --content "Hello from Whistant!"

# List custom emoji
run /skills/slack/scripts/slack.js emojiList

# React to a message
run /skills/slack/scripts/slack.js react C123 1712023032.1234 ✅
```

## Available Actions

| Action | Params |
|--------|--------|
| `listChannels` | `types` (default: `public_channel,private_channel`) |
| `readMessages` | `channelId`, `limit` |
| `sendMessage` | `to` ("channel:ID" or "user:ID"), `content` |
| `react` | positional: `channelId messageId emoji` |
| `emojiList` | — |
| `editMessage` | `channelId`, `messageId`, `content` |
| `deleteMessage` | `channelId`, `messageId` |
| `pinMessage` / `unpinMessage` / `listPins` | `channelId`, `messageId` |
| `memberInfo` | `userId` |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
SLACK_BOT_TOKEN=xoxb-... node scripts/slack.js listChannels
```
