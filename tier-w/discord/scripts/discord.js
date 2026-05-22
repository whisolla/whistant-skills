/**
 * discord.js — Discord REST API v10 for Whistant iOS JS runtime
 * Uses fetch() — no WebSocket, no binaries required.
 *
 * Token priority: globalThis.DISCORD_BOT_TOKEN → keychain('discord_bot_token') → params.token
 *
 * Usage:
 *   const discord = require('./discord.js');
 *   await discord.sendMessage({ channelId: '...', content: 'Hello!' });
 */

var DISCORD_API = 'https://discord.com/api/v10';

/**
 * Resolve Discord bot token from available sources.
 * Priority: globalThis → keychain → process.env
 */
async function _getToken() {
  if (typeof globalThis !== 'undefined' && globalThis.DISCORD_BOT_TOKEN) {
    return globalThis.DISCORD_BOT_TOKEN;
  }
  if (typeof keychain !== 'undefined') {
    try {
      var stored = await keychain.get('discord_bot_token');
      if (stored) return stored;
    } catch (e) { /* keychain not available */ }
  }
  if (typeof process !== 'undefined' && process.env && process.env.DISCORD_BOT_TOKEN) {
    return process.env.DISCORD_BOT_TOKEN;
  }
  throw new Error('DISCORD_BOT_TOKEN not set. Store via keychain.set("discord_bot_token", "...") or set globalThis.DISCORD_BOT_TOKEN.');
}

/**
 * Discord API helper with rate-limit retry.
 * @param {string} method — HTTP method
 * @param {string} path — API path (e.g. /channels/123/messages)
 * @param {object} body — optional JSON body
 * @param {number} retries — remaining retry count (default 2)
 */
async function _discord(method, path, body, retries) {
  if (retries === undefined) retries = 2;
  var token = await _getToken();
  var opts = {
    method: method,
    headers: {
      'Authorization': 'Bot ' + token,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://discord.com/developers, 5.0)',
    },
    timeout: 15,
  };
  if (body) opts.body = JSON.stringify(body);
  var res = await fetch(DISCORD_API + path, opts);
  var text = await res.text();
  if (res.status === 429) {
    if (retries <= 0) throw new Error('Discord rate limited');
    var data = JSON.parse(text);
    var waitMs = (data.retry_after || 1) * 1000;
    await new Promise(function(r) { setTimeout(r, waitMs); });
    return _discord(method, path, body, retries - 1);
  }
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('Discord ' + method + ' ' + path + ' → ' + res.status + ': ' + text.slice(0, 200));
  try { return JSON.parse(text); } catch (e) { return text; }
}

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Send a message to a Discord channel.
 * @param {{ channelId: string, content: string, embeds?: array, message_reference?: object }} opts
 */
async function sendMessage(opts) {
  var body = { content: opts.content };
  if (opts.embeds) body.embeds = opts.embeds;
  if (opts.message_reference) body.message_reference = opts.message_reference;
  return _discord('POST', '/channels/' + opts.channelId + '/messages', body);
}

/**
 * Read recent messages from a channel.
 * @param {{ channelId: string, limit?: number }} opts
 */
async function readMessages(opts) {
  var limit = opts.limit || 20;
  return _discord('GET', '/channels/' + opts.channelId + '/messages?limit=' + limit);
}

/**
 * Edit a message.
 * @param {{ channelId: string, messageId: string, content: string }} opts
 */
async function editMessage(opts) {
  return _discord('PATCH', '/channels/' + opts.channelId + '/messages/' + opts.messageId, {
    content: opts.content,
  });
}

/**
 * Delete a message.
 * @param {{ channelId: string, messageId: string }} opts
 */
async function deleteMessage(opts) {
  return _discord('DELETE', '/channels/' + opts.channelId + '/messages/' + opts.messageId);
}

// ─── Reactions ──────────────────────────────────────────────────────────────

/**
 * React to a message with an emoji.
 * @param {{ channelId: string, messageId: string, emoji: string }} opts
 */
async function react(opts) {
  var emoji = encodeURIComponent(opts.emoji);
  // Use _discord for 429 retry; 204 is handled by _discord (returns null)
  await _discord('PUT', '/channels/' + opts.channelId + '/messages/' + opts.messageId + '/reactions/' + emoji + '/@me');
  return { ok: true };
}

/**
 * Get reactions on a message.
 * @param {{ channelId: string, messageId: string, emoji?: string }} opts
 */
async function getReactions(opts) {
  var path = '/channels/' + opts.channelId + '/messages/' + opts.messageId + '/reactions';
  if (opts.emoji) path += '/' + encodeURIComponent(opts.emoji);
  return _discord('GET', path);
}

// ─── Threads ─────────────────────────────────────────────────────────────────

/**
 * Create a thread from a message.
 * @param {{ channelId: string, messageId: string, name: string, auto_archive_duration?: number }} opts
 */
async function createThread(opts) {
  return _discord('POST', '/channels/' + opts.channelId + '/messages/' + opts.messageId + '/threads', {
    name: opts.name,
    auto_archive_duration: opts.auto_archive_duration || 1440,
  });
}

// ─── Guilds / Channels / DM ─────────────────────────────────────────────────

/**
 * List all guilds the bot is in.
 */
async function listGuilds() {
  return _discord('GET', '/users/@me/guilds');
}

/**
 * List channels in a guild.
 * @param {{ guildId: string }} opts
 */
async function listChannels(opts) {
  return _discord('GET', '/guilds/' + opts.guildId + '/channels');
}

/**
 * Get info about a single channel.
 * @param {{ channelId: string }} opts
 */
async function getChannel(opts) {
  return _discord('GET', '/channels/' + opts.channelId);
}

/**
 * Open or get existing DM channel with a user.
 * @param {{ userId: string }} opts
 */
async function openDM(opts) {
  return _discord('POST', '/users/@me/channels', { recipient_id: opts.userId });
}

/**
 * Get bot info (authenticated user).
 */
async function botInfo() {
  return _discord('GET', '/users/@me');
}

// ─── Convenience dispatch ────────────────────────────────────────────────────

function availableActions() {
  return [
    'sendMessage', 'readMessages', 'editMessage', 'deleteMessage',
    'react', 'getReactions',
    'createThread',
    'listGuilds', 'listChannels', 'getChannel', 'openDM', 'botInfo',
  ];
}

async function run(opts) {
  if (!opts || !opts.action) {
    return 'Usage: discord.run({ action: "...", ... })\nActions: ' + availableActions().join(', ');
  }
  var action = opts.action;
  switch (action) {
    case 'sendMessage':    return sendMessage(opts);
    case 'readMessages':   return readMessages(opts);
    case 'editMessage':    return editMessage(opts);
    case 'deleteMessage':  return deleteMessage(opts);
    case 'react':          return react(opts);
    case 'getReactions':   return getReactions(opts);
    case 'createThread':   return createThread(opts);
    case 'listGuilds':     return listGuilds();
    case 'listChannels':   return listChannels(opts);
    case 'getChannel':     return getChannel(opts);
    case 'openDM':         return openDM(opts);
    case 'botInfo':        return botInfo();
    default:
      throw new Error('Unknown discord action: ' + action);
  }
}

// ─── Template compliance: handler / runFromParams ────────────────────────────

function handler(event, context) {
  return run(event);
}

async function runFromParams(params) {
  if (!params) params = {};
  if (typeof params === 'string') params = parseCommand(params);

  // Resolve from PARAMS globals if not explicitly passed
  if (!params || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // If no action but positional args, use first arg
  if (!params.action && params.argv && params.argv.length > 0) {
    params.action = params.argv[0];
  }

  // Support --token flag: inject into globalThis for _getToken() auto-resolution
  if (params.token && typeof globalThis !== 'undefined') {
    globalThis.DISCORD_BOT_TOKEN = params.token;
  }

  return run(params);
}

function tokenize(input) {
  var tokens = [];
  var re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  var m;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[0]);
  }
  return tokens;
}

function parseCommand(input) {
  var tokens = tokenize(input);
  if (!tokens.length) return {};
  var action = tokens[0];
  var result = { action: action };
  var i = 1;
  while (i < tokens.length) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var key = t.slice(2);
      result[key] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else if (t.indexOf('-') === 0) {
      var key2 = t.slice(1);
      result[key2] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else {
      // positional args: channelId, messageId, emoji, content
      if (i === 1 && !result.channelId) result.channelId = t;
      else if (i === 2 && !result.messageId) result.messageId = t;
      else if (i === 3 && !result.emoji) result.emoji = t;
      else if (i === 4 && !result.content) result.content = t;
    }
    i++;
  }
  return result;
}

// ─── Node CLI block ──────────────────────────────────────────────────────────
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var args = process.argv.slice(2);
  var input = args.join(' ');
  if (!input) {
    console.log('Usage: node discord.js <action> [--channelId ID] [--messageId ID] [--content text]');
    console.log('Actions: ' + availableActions().join(', '));
    process.exit(0);
  }
  var parsed = parseCommand(input);
  runFromParams(parsed).then(function(r) {
    console.log(JSON.stringify(r, null, 2));
  }).catch(function(e) {
    console.error(e.message);
    process.exit(1);
  });
}

// ─── CommonJS / globalThis exports ───────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _getToken: _getToken,
    _discord: _discord,
    sendMessage: sendMessage,
    readMessages: readMessages,
    editMessage: editMessage,
    deleteMessage: deleteMessage,
    react: react,
    getReactions: getReactions,
    createThread: createThread,
    listGuilds: listGuilds,
    listChannels: listChannels,
    getChannel: getChannel,
    openDM: openDM,
    botInfo: botInfo,
    run: run,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
    availableActions: availableActions,
  };
}
if (typeof globalThis !== 'undefined') {
  globalThis.discord = {
    _getToken: _getToken,
    _discord: _discord,
    sendMessage: sendMessage,
    readMessages: readMessages,
    editMessage: editMessage,
    deleteMessage: deleteMessage,
    react: react,
    getReactions: getReactions,
    createThread: createThread,
    listGuilds: listGuilds,
    listChannels: listChannels,
    getChannel: getChannel,
    openDM: openDM,
    botInfo: botInfo,
    run: run,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
    availableActions: availableActions,
  };
}

// ─── PARAMS auto-run block ──────────────────────────────────────────────────
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    try {
      var result = await runFromParams();
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
