/**
 * slack.js — Slack Web API for Whistant iOS JS runtime
 * Uses fetch() to call Slack Web API methods.
 *
 * Setup: Set SLACK_BOT_TOKEN via globalThis or keychain before use.
 *   // Option 1: globalThis (injected by Whistant runtime)
 *   globalThis.SLACK_BOT_TOKEN = 'xoxb-...';
 *
 *   // Option 2: keychain (per-user persistent storage)
 *   await keychain.set('SLACK_BOT_TOKEN', 'xoxb-...');
 *
 * Usage:
 *   const slack = require('./slack.js');
 *   await slack.react({ channelId: 'C123', messageId: '1712023032.1234', emoji: '✅' });
 */

const SLACK_API = 'https://slack.com/api';

/**
 * Resolve Slack bot token from available sources.
 * Priority: globalThis.SLACK_BOT_TOKEN > keychain > process.env (devenv)
 */
async function _getToken() {
  // 1. globalThis injected by Whistant runtime
  if (typeof globalThis !== 'undefined' && globalThis.SLACK_BOT_TOKEN) {
    return globalThis.SLACK_BOT_TOKEN;
  }
  // 2. keychain persistent storage
  if (typeof keychain !== 'undefined') {
    const stored = await keychain.get('SLACK_BOT_TOKEN');
    if (stored) return stored;
  }
  // 3. process.env for devenv
  if (typeof process !== 'undefined' && process.env && process.env.SLACK_BOT_TOKEN) {
    return process.env.SLACK_BOT_TOKEN;
  }
  throw new Error('SLACK_BOT_TOKEN not set. Provide via globalThis.SLACK_BOT_TOKEN or keychain.set("SLACK_BOT_TOKEN", ...)');
}

/**
 * Make a Slack API call via fetch
 * @param {string} method — e.g. "reactions.add"
 * @param {object} params
 * @returns {Promise<object>}
 */
async function slackCall(method, params) {
  const TOKEN = await _getToken();
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    timeout: 15,
  });
  const data = await res.json();
  if (!data.ok) {
    if (data.error === 'channel_not_found') throw new Error(`Channel not found: ${params.channel}`);
    if (data.error === 'message_not_found') throw new Error(`Message not found in channel ${params.channel}`);
    throw new Error(`Slack API error: ${data.error}`);
  }
  return data;
}

// ─── Reactions ──────────────────────────────────────────────────────────────

/**
 * Add a reaction emoji to a message
 * @param {{ channelId: string, messageId: string, emoji: string }} opts
 */
async function react({ channelId, messageId, emoji }) {
  const emojiName = emoji.replace(/^:|:$/g, '');
  return slackCall('reactions.add', {
    channel: channelId,
    timestamp: messageId,
    name: emojiName,
  });
}

/**
 * List reactions on a message
 * @param {{ channelId: string, messageId: string }}
 */
async function listReactions({ channelId, messageId }) {
  return slackCall('reactions.get', {
    channel: channelId,
    timestamp: messageId,
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Send a message
 * @param {{ to: string, content: string }} opts
 *   to: "channel:C123" or "user:U456"
 */
async function sendMessage({ to, content }) {
  // Slack chat.postMessage accepts user IDs directly as channel (auto-DM)
  var parts = to.split(':');
  var channel = parts.length === 2 ? parts[1] : to;
  return slackCall('chat.postMessage', {
    channel: channel,
    text: content,
  });
}

/**
 * Edit an existing message
 * @param {{ channelId: string, messageId: string, content: string }}
 */
async function editMessage({ channelId, messageId, content }) {
  return slackCall('chat.update', {
    channel: channelId,
    ts: messageId,
    text: content,
  });
}

/**
 * Delete a message
 * @param {{ channelId: string, messageId: string }}
 */
async function deleteMessage({ channelId, messageId }) {
  return slackCall('chat.delete', {
    channel: channelId,
    ts: messageId,
  });
}

/**
 * Read recent messages from a channel
 * @param {{ channelId: string, limit?: number }}
 */
async function readMessages({ channelId, limit = 20 }) {
  return slackCall('conversations.history', {
    channel: channelId,
    limit,
  });
}

// ─── Pins ───────────────────────────────────────────────────────────────────

/**
 * Pin a message
 * @param {{ channelId: string, messageId: string }}
 */
async function pinMessage({ channelId, messageId }) {
  return slackCall('pins.add', {
    channel: channelId,
    timestamp: messageId,
  });
}

/**
 * Unpin a message
 * @param {{ channelId: string, messageId: string }}
 */
async function unpinMessage({ channelId, messageId }) {
  return slackCall('pins.remove', {
    channel: channelId,
    timestamp: messageId,
  });
}

/**
 * List pinned items in a channel
 * @param {{ channelId: string }}
 */
async function listPins({ channelId }) {
  return slackCall('pins.list', { channel: channelId });
}

// ─── Member Info ────────────────────────────────────────────────────────────

/**
 * Get member info
 * @param {{ userId: string }}
 */
async function memberInfo({ userId }) {
  return slackCall('users.info', { user: userId });
}

/**
 * List custom emoji
 */
async function emojiList() {
  return slackCall('emoji.list', {});
}

/**
 * List channels the bot has access to
 * @param {{ types?: string }} opts — e.g. "public_channel,private_channel"
 */
async function listChannels(opts) {
  opts = opts || {};
  var types = opts.types || 'public_channel,private_channel';
  var allChannels = [];
  var cursor;
  do {
    var params = { types: types, limit: 200 };
    if (cursor) params.cursor = cursor;
    var data = await slackCall('conversations.list', params);
    var channels = data.channels || [];
    for (var i = 0; i < channels.length; i++) {
      allChannels.push({
        id: channels[i].id,
        name: channels[i].name,
        isPrivate: channels[i].is_private || false,
        numMembers: channels[i].num_members || 0,
        topic: channels[i].topic ? channels[i].topic.value : '',
      });
    }
    cursor = data.response_metadata ? data.response_metadata.next_cursor : null;
  } while (cursor);
  return allChannels;
}

// ─── Convenience ────────────────────────────────────────────────────────────

/**
 * Main dispatch — call this with an action object
 * @param {{ action: string, [key: string]: any }} opts
 */
async function run(opts) {
  if (!opts || !opts.action) {
    return 'Usage: slack.run({ action: "emojiList", ... })\n' +
           'Actions: react, listReactions, sendMessage, editMessage, deleteMessage,\n' +
           '         readMessages, pinMessage, unpinMessage, listPins, memberInfo, emojiList';
  }
  const { action, ...params } = opts;
  switch (action) {
    case 'react':              return react(params);
    case 'reactions':          return listReactions(params);
    case 'sendMessage':        return sendMessage(params);
    case 'editMessage':        return editMessage(params);
    case 'deleteMessage':      return deleteMessage(params);
    case 'readMessages':       return readMessages(params);
    case 'pinMessage':         return pinMessage(params);
    case 'unpinMessage':       return unpinMessage(params);
    case 'listPins':           return listPins(params);
    case 'memberInfo':         return memberInfo(params);
    case 'emojiList':          return emojiList();
    case 'listChannels':       return listChannels(params);
    default:
      throw new Error(`Unknown slack action: ${action}`);
  }
}

// ─── handler / runFromParams (template compliance) ──────────────────────────

/**
 * Terminal handler — parses cmd-line style input
 */
function handler(event, context) {
  return run(event);
}

/**
 * runFromParams — supports both cmd-line object and action string
 */
async function runFromParams(params) {
  if (!params) params = {};
  // Handle string input (direct call with command string)
  if (typeof params === 'string') params = parseCommand(params);
  // If no action set but PARAMS has positional args (from /cmd path), use first as action
  if (!params.action && params.argv && params.argv.length > 0) {
    params.action = params.argv[0];
  }
  return run(params);
}

/**
 * Tokenize a command string into an array
 */
function tokenize(input) {
  const tokens = [];
  const re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let m;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[0]);
  }
  return tokens;
}

/**
 * Parse command string into action+params object
 * Examples:
 *   "emojiList"                 → { action: "emojiList" }
 *   "sendMessage --to channel:C123 --content Hello" → { action: "sendMessage", to: "channel:C123", content: "Hello" }
 *   "react C123 1712023032.1234 ✅" → { action: "react", channelId: "C123", messageId: "1712023032.1234", emoji: "✅" }
 */
function parseCommand(input) {
  const tokens = tokenize(input);
  if (!tokens.length) return {};
  const action = tokens[0];
  const result = { action };
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      result[key] = tokens[i + 1] !== undefined && !tokens[i + 1].startsWith('--') ? tokens[++i] : true;
    } else if (t.startsWith('-')) {
      const key = t.slice(1);
      result[key] = tokens[i + 1] !== undefined && !tokens[i + 1].startsWith('--') ? tokens[++i] : true;
    } else {
      // Positional args
      if (i === 1) result.channelId = t;
      else if (i === 2) result.messageId = t;
      else if (i === 3) result.emoji = t;
      else if (i === 4) result.content = t;
    }
    i++;
  }
  return result;
}

// ─── Node CLI block ──────────────────────────────────────────────────────────

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const args = process.argv.slice(2);
  const input = args.join(' ');
  if (!input) {
    console.log('Usage: node slack.js <action> [args]');
    console.log('Actions: emojiList, sendMessage, react, readMessages, pinMessage, memberInfo');
    process.exit(0);
  }
  const parsed = parseCommand(input);
  run(parsed).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exit(1); });
}

// ─── PARAMS auto-run block ──────────────────────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    try {
      var inputParams = typeof PARAMS !== 'undefined' && PARAMS !== null ? PARAMS : (typeof PARAMS_JSON !== 'undefined' ? PARAMS_JSON : null);
      var result = await runFromParams(inputParams);
      if (typeof console !== 'undefined' && console.log) {
        console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      }
      return result;
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
      throw err;
    }
  })();
}

// ─── CommonJS / globalThis exports ─────────────────────────────────────────

// Guarded: only set module.exports when CommonJS `module` is available (require path).
// In direct eval (/cmd path), `module` is undefined so this block is skipped.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    run,
    handler,
    runFromParams,
    parseCommand,
    tokenize,
    react,
    listReactions,
    sendMessage,
    editMessage,
    deleteMessage,
    readMessages,
    pinMessage,
    unpinMessage,
    listPins,
    memberInfo,
    emojiList,
    listChannels,
  };
}
// Always set globalThis for direct script access (both /cmd and /code paths)
if (typeof globalThis !== 'undefined') {
  globalThis.slack = {
    run,
    handler,
    runFromParams,
    parseCommand,
    tokenize,
    react,
    listReactions,
    sendMessage,
    editMessage,
    deleteMessage,
    readMessages,
    pinMessage,
    unpinMessage,
    listPins,
    memberInfo,
    emojiList,
    listChannels,
  };
}
