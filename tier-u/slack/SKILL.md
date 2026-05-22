---
name: slack
description: Use when you need to control Slack from Clawdbot via the slack tool, including reacting to messages or pinning/unpinning items in Slack channels or DMs.
version: 1.3
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
2. Enable necessary scopes (chat:write, channels:history, etc.)
3. Install the app to your workspace and copy the Bot User OAuth Token

## /cmd Usage

```sh
# List emoji
run /skills/slack/scripts/slack.js emojiList

# Send a message (--to flag)
run /skills/slack/scripts/slack.js sendMessage --to channel:C123 --content Hello from Whistant!

# React to a message
run /skills/slack/scripts/slack.js react C123 1712023032.1234 ✅

# Read messages
run /skills/slack/scripts/slack.js readMessages --channelId C123 --limit 20
```

## /code Usage

```js
// Send a message
const slack = require('/skills/slack/scripts/slack.js');
console.log(await slack.sendMessage({ to: 'channel:C123', content: 'Hello!' }));

// List emoji
console.log(await slack.emojiList());

// React
console.log(await slack.react({ channelId: 'C123', messageId: '1712023032.1234', emoji: '✅' }));
```

## Exported Functions

`run`, `handler`, `runFromParams`, `parseCommand`, `tokenize`, `react`, `listReactions`, `sendMessage`, `editMessage`, `deleteMessage`, `readMessages`, `pinMessage`, `unpinMessage`, `listPins`, `memberInfo`, `emojiList`

## Actions

### emojiList — List custom emoji

```js
const r = await slack.emojiList();
console.log(Object.keys(r.emoji).length, 'emoji available');
```

### sendMessage — Send a message

```js
// to: "channel:C123" or "user:U456"
const r = await slack.sendMessage({ to: 'channel:C123', content: 'Hello!' });
```

### react — Add reaction

```js
const r = await slack.react({ channelId: 'C123', messageId: '1712023032.1234', emoji: '✅' });
```

### readMessages — Read channel history

```js
const r = await slack.readMessages({ channelId: 'C123', limit: 20 });
```

### editMessage — Edit a message

```js
const r = await slack.editMessage({ channelId: 'C123', messageId: '1712023032.1234', content: 'Updated text' });
```

### deleteMessage — Delete a message

```js
const r = await slack.deleteMessage({ channelId: 'C123', messageId: '1712023032.1234' });
```

### pinMessage / unpinMessage / listPins — Manage pins

```js
await slack.pinMessage({ channelId: 'C123', messageId: '1712023032.1234' });
await slack.unpinMessage({ channelId: 'C123', messageId: '1712023032.1234' });
const r = await slack.listPins({ channelId: 'C123' });
```

### memberInfo — Get user info

```js
const r = await slack.memberInfo({ userId: 'U123' });
```

### run — Dispatch by action name

```js
const r = await slack.run({ action: 'emojiList' });
```

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
SLACK_BOT_TOKEN=xoxb-... node scripts/slack.js emojiList
```
