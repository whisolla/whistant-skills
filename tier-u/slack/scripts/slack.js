/**
 * slack.js — Slack Web API for Whistant iOS JS runtime
 * Uses fetch() to call Slack Web API methods.
 * 
 * Setup: Set SLACK_BOT_TOKEN in your environment or pass it in.
 *   export SLACK_BOT_TOKEN=xoxb-your-token-here
 * 
 * Usage:
 *   const slack = require('./slack.js');
 *   // React to a message
 *   await slack.react({ channelId: 'C123', messageId: '1712023032.1234', emoji: '✅' });
 */

const SLACK_API = 'https://slack.com/api';
const TOKEN = (typeof process !== 'undefined' && process.env?.SLACK_BOT_TOKEN) || '';

/**
 * Make a Slack API call via fetch
 * @param {string} method — e.g. "reactions.add"
 * @param {object} params
 * @returns {Promise<object>}
 */
async function slackCall(method, params = {}) {
  if (!TOKEN) throw new Error('SLACK_BOT_TOKEN not set. Cannot call Slack API.');
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
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
  // Slack emoji: strip colons if user included them
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
  const [type, id] = to.split(':');
  const channel = type === 'channel' ? id : undefined;
  const user = type === 'user' ? id : undefined;
  return slackCall('chat.postMessage', {
    channel: channel || id,
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
  return slackCall('emoji.list');
}

// ─── Convenience ────────────────────────────────────────────────────────────

/**
 * Main dispatch — call this with an action object
 * @param {{ action: string, [key: string]: any }} opts
 */
async function run(opts) {
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
    default:
      throw new Error(`Unknown slack action: ${action}`);
  }
}

module.exports = { run, react, listReactions, sendMessage, editMessage, deleteMessage, readMessages, pinMessage, unpinMessage, listPins, memberInfo, emojiList };
