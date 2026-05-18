// Google Workspace skill for the iPhone JS terminal
// Uses Google OAuth2 PKCE + in-app browser — no gog binary needed
// Stores tokens and credentials in iOS Keychain via the `keychain` bridge
//
// Quick start:
//   const g = require('/skills/google/scripts/google');
//   await g.auth.setup('YOUR_CLIENT_ID');   // once, saves to Keychain
//   await g.auth.login();                   // opens browser, saves token
//   const msgs = await g.gmail.messages('in:inbox newer_than:3d', { max: 5 });

// ---------------------------------------------------------------------------
// Keychain keys
// ---------------------------------------------------------------------------

const KEYCHAIN_KEY        = 'google_oauth_token';
const KEYCHAIN_CLIENT_ID  = 'google_client_id';
const KEYCHAIN_SCOPES     = 'google_scopes';

async function saveToken(token) {
  await keychain.set(KEYCHAIN_KEY, JSON.stringify(token));
}

async function loadToken() {
  const raw = await keychain.get(KEYCHAIN_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

async function clearToken() {
  await keychain.delete(KEYCHAIN_KEY);
}

// ---------------------------------------------------------------------------
// Client ID resolution: Keychain > Info.plist fallback
// ---------------------------------------------------------------------------

async function resolveClientId() {
  const stored = await keychain.get(KEYCHAIN_CLIENT_ID);
  if (stored) return stored;
  if (typeof __G_CLIENT_ID !== 'undefined' && __G_CLIENT_ID) return __G_CLIENT_ID;
  return null;
}

async function resolveScopes() {
  const stored = await keychain.get(KEYCHAIN_SCOPES);
  return stored || DEFAULT_SCOPES;
}

// ---------------------------------------------------------------------------
// OAuth2 PKCE + in-app browser
// ---------------------------------------------------------------------------

const TOKEN_URL  = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const AUTH_URL   = 'https://accounts.google.com/o/oauth2/v2/auth';

// Derive redirect URI from the actual client ID being used.
// e.g. "123456-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123456-abc:/oauth2redirect"
// This ensures the redirect URI matches what Google registered for the user's own OAuth client.
function getRedirectUri(clientId) {
  if (clientId && clientId.indexOf('.apps.googleusercontent.com') !== -1) {
    var prefix = clientId.replace('.apps.googleusercontent.com', '');
    return 'com.googleusercontent.apps.' + prefix + ':/oauth2redirect';
  }
  // Fallback for non-standard client IDs: reverse dot-separated segments
  var reversed = clientId.split('.').reverse().join('.');
  return reversed + ':/oauth2redirect';
}

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents.readonly',
].join(' ');

// PKCE helpers — pure JS, no browser globals needed

// Base64 encoder (replaces btoa which is not available in JSCore)
var _b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function _btoa(str) {
  var result = '', i = 0;
  while (i < str.length) {
    var a = str.charCodeAt(i++), b = str.charCodeAt(i++), c = str.charCodeAt(i++);
    result += _b64chars[a >> 2];
    result += _b64chars[((a & 3) << 4) | (b >> 4)];
    result += isNaN(b) ? '=' : _b64chars[((b & 15) << 2) | (c >> 6)];
    result += isNaN(c) ? '=' : _b64chars[c & 63];
  }
  return result;
}

function base64urlEncode(buf) {
  var bytes = new Uint8Array(buf);
  var str = '';
  for (var i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return _btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateVerifier() {
  var arr = new Uint8Array(32);
  for (var i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
  return base64urlEncode(arr);
}

// Google requires S256 but plain is allowed as fallback.
// JSCore has no crypto.subtle, so we use plain method.
function computeChallenge(verifier) {
  return verifier; // plain method
}

function buildAuthUrl(clientId, scopes, verifier, redirectUri) {
  const challenge = computeChallenge(verifier);
  const params = [
    'response_type=code',
    'client_id=' + encodeURIComponent(clientId),
    'redirect_uri=' + encodeURIComponent(redirectUri),
    'scope=' + encodeURIComponent(scopes || DEFAULT_SCOPES),
    'code_challenge=' + encodeURIComponent(challenge),
    'code_challenge_method=plain',
    'access_type=offline',
    'prompt=consent',
  ].join('&');
  return AUTH_URL + '?' + params;
}

async function exchangeCode(clientId, code, verifier, redirectUri) {
  const body = 'grant_type=authorization_code' +
    '&code=' + encodeURIComponent(code) +
    '&client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&code_verifier=' + encodeURIComponent(verifier);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    timeout: 15,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });
  if (!res.ok) throw new Error('Token exchange failed: ' + await res.text());
  return await res.json();
}

async function refreshAccessToken(clientId, refreshToken) {
  const body = 'grant_type=refresh_token' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&refresh_token=' + encodeURIComponent(refreshToken);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    timeout: 15,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });
  if (!res.ok) throw new Error('Token refresh failed: ' + await res.text());
  return await res.json();
}

// ---------------------------------------------------------------------------
// Auth module
// ---------------------------------------------------------------------------

const auth = {
  /**
   * Save your own Google OAuth client ID to Keychain.
   * Optionally restrict which API scopes are requested.
   *
   * Available scope shortcuts:
   *   'gmail', 'calendar', 'drive', 'contacts', 'sheets', 'docs'
   * Or pass full scope URLs.
   *
   * Example:
   *   await g.auth.setup('YOUR_CLIENT_ID')
   *   await g.auth.setup('YOUR_CLIENT_ID', ['gmail', 'calendar'])
   */
  async setup(clientId, scopes) {
    if (!clientId) throw new Error('clientId is required');
    await keychain.set(KEYCHAIN_CLIENT_ID, clientId);
    if (scopes && scopes.length) {
      const scopeMap = {
        gmail:    'https://www.googleapis.com/auth/gmail.modify',
        calendar: 'https://www.googleapis.com/auth/calendar',
        drive:    'https://www.googleapis.com/auth/drive.readonly',
        contacts: 'https://www.googleapis.com/auth/contacts.readonly',
        sheets:   'https://www.googleapis.com/auth/spreadsheets',
        docs:     'https://www.googleapis.com/auth/documents.readonly',
      };
      const resolved = scopes.map(s => scopeMap[s] || s).join(' ');
      await keychain.set(KEYCHAIN_SCOPES, resolved);
      console.log('Client ID and scopes saved. Run await g.auth.login() to authenticate.');
    } else {
      console.log('Client ID saved. Run await g.auth.login() to authenticate.');
    }
  },

  /** Open in-app browser for Google OAuth (PKCE). No client secret needed. */
  async login() {
    const clientId = await resolveClientId();
    if (!clientId) throw new Error('No client ID found. Run: await g.auth.setup("YOUR_CLIENT_ID")');
    const scopes      = await resolveScopes();
    const verifier    = generateVerifier();
    const redirectUri = getRedirectUri(clientId);
    const authUrl     = buildAuthUrl(clientId, scopes, verifier, redirectUri);
    console.log('Opening Google sign-in...');
    var redirectUrl;
    try {
      redirectUrl = await browser.openOAuth(authUrl, redirectUri);
    } catch (e) {
      throw new Error((e && (e.message || String(e))) || 'Login cancelled or failed');
    }
    const match = redirectUrl.match(/[?&]code=([^&]+)/);
    if (!match) throw new Error('No code in redirect: ' + redirectUrl);
    const code = decodeURIComponent(match[1]);
    const token = await exchangeCode(clientId, code, verifier, redirectUri);
    token._clientId  = clientId;
    token._expiresAt = Date.now() + (token.expires_in || 3600) * 1000;
    await saveToken(token);
    console.log('Authorized! Token stored in Keychain.');
    return { ok: true, expiresAt: new Date(token._expiresAt).toISOString() };
  },

  async logout() {
    const token = await loadToken();
    if (token && token.access_token) {
      await fetch(REVOKE_URL + '?token=' + encodeURIComponent(token.access_token), { method: 'POST' }).catch(function() {});
    }
    await clearToken();
    console.log('Logged out.');
  },

  async status() {
    const clientId = await resolveClientId();
    const token    = await loadToken();
    const scopes   = await keychain.get(KEYCHAIN_SCOPES);
    console.log('Client ID: ' + (clientId || '(using app default)'));
    console.log('Scopes:    ' + (scopes || '(default)'));
    if (!token) { console.log('Auth:      not logged in'); return { loggedIn: false }; }
    const exp = token._expiresAt ? new Date(token._expiresAt).toISOString() : 'unknown';
    console.log('Auth:      logged in, expires ' + exp);
    return { loggedIn: true, expiresAt: exp };
  },

  /** Returns a valid access token, refreshing if needed. */
  async getAccessToken() {
    let token = await loadToken();
    if (!token) throw new Error('Not logged in. Run: await g.auth.login()');
    if (token._expiresAt && Date.now() > token._expiresAt - 60000) {
      if (!token.refresh_token) throw new Error('Token expired and no refresh token. Please login again.');
      const refreshed = await refreshAccessToken(token._clientId, token.refresh_token);
      token = Object.assign({}, token, refreshed, {
        _expiresAt: Date.now() + (refreshed.expires_in || 3600) * 1000,
        refresh_token: refreshed.refresh_token || token.refresh_token,
      });
      await saveToken(token);
    }
    return token.access_token;
  },
};

// ---------------------------------------------------------------------------
// Gmail token — tries app's built-in read-only token first, then user OAuth
// ---------------------------------------------------------------------------

async function getGmailToken() {
  if (typeof __gmail_getToken !== 'undefined') {
    try {
      var t = await __gmail_getToken();
      if (t) return t;
    } catch (_) {}
  }
  return await auth.getAccessToken();
}

// ---------------------------------------------------------------------------
// Base API helper
// ---------------------------------------------------------------------------

async function apiGet(path, params, tokenFn) {
  const accessToken = await (tokenFn ? tokenFn() : auth.getAccessToken());
  let url = path.startsWith('https://') ? path : 'https://www.googleapis.com' + path;
  if (params) {
    var parts = [];
    Object.entries(params).forEach(function(entry) {
      var k = entry[0], v = entry[1];
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach(function(item) { parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(item)); });
      } else {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    });
    if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&');
  }
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  return await res.json();
}

async function apiPost(path, body, method, tokenFn) {
  const accessToken = await (tokenFn ? tokenFn() : auth.getAccessToken());
  const url = path.startsWith('https://') ? path : 'https://www.googleapis.com' + path;
  const res = await fetch(url, {
    method: method || 'POST',
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Gmail-specific wrappers that use the app's built-in read-only token
function gmailGet(path, params)       { return apiGet(path, params, getGmailToken); }
function gmailPost(path, body, method) { return apiPost(path, body, method, getGmailToken); }

// ---------------------------------------------------------------------------
// Gmail helpers
// ---------------------------------------------------------------------------

// Base64url decoder — pure JS (atob not available in JSCore)
var _b64lookup = {};
for (var _i = 0; _i < _b64chars.length; _i++) _b64lookup[_b64chars[_i]] = _i;

function _atob(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  var result = '', i = 0;
  while (i < str.length) {
    var a = _b64lookup[str[i++]] || 0;
    var b = _b64lookup[str[i++]] || 0;
    var c = _b64lookup[str[i++]] || 0;
    var d = _b64lookup[str[i++]] || 0;
    result += String.fromCharCode((a << 2) | (b >> 4));
    if (str[i - 2] !== '=') result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (str[i - 1] !== '=') result += String.fromCharCode(((c & 3) << 6) | d);
  }
  return result;
}

// Decode base64url-encoded Gmail body data to UTF-8 string
function decodeGmailBody(data) {
  if (!data) return '';
  try {
    var binary = _atob(data);
    // Decode UTF-8 bytes
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    var out = '';
    var j = 0;
    while (j < bytes.length) {
      var b = bytes[j++];
      if (b < 0x80) { out += String.fromCharCode(b); }
      else if ((b & 0xE0) === 0xC0) { out += String.fromCharCode(((b & 0x1F) << 6) | (bytes[j++] & 0x3F)); }
      else if ((b & 0xF0) === 0xE0) { out += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[j++] & 0x3F) << 6) | (bytes[j++] & 0x3F)); }
      else { j += 2; out += '?'; } // skip 4-byte chars
    }
    return out;
  } catch (e) { return '(decode error)'; }
}

// Recursively extract text/plain and text/html from a message payload
function extractParts(payload) {
  var plain = '', html = '';
  function walk(part) {
    var mime = part.mimeType || '';
    if (mime === 'text/plain' && part.body && part.body.data) {
      plain += decodeGmailBody(part.body.data);
    } else if (mime === 'text/html' && part.body && part.body.data) {
      html += decodeGmailBody(part.body.data);
    } else if (part.parts) {
      part.parts.forEach(walk);
    }
  }
  walk(payload);
  return { plain: plain, html: html };
}

// Parse raw message into a clean object
function parseMessage(m) {
  var headers = (m.payload && m.payload.headers) || [];
  var h = function(k) {
    var f = headers.find(function(x) { return x.name.toLowerCase() === k.toLowerCase(); });
    return f ? f.value : '';
  };
  var body = extractParts(m.payload || {});
  // For simple non-multipart messages the body is directly in payload.body.data
  if (!body.plain && !body.html && m.payload && m.payload.body && m.payload.body.data) {
    var decoded = decodeGmailBody(m.payload.body.data);
    if ((m.payload.mimeType || '').includes('html')) body.html = decoded;
    else body.plain = decoded;
  }
  return {
    id: m.id,
    threadId: m.threadId,
    subject: h('Subject'),
    from: h('From'),
    to: h('To'),
    date: h('Date'),
    snippet: m.snippet || '',
    body: body.plain || body.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    labelIds: m.labelIds || [],
  };
}

// Encode string to base64url for sending (pure JS, no btoa)
function encodeRFC2822(mimeStr) {
  // Convert to UTF-8 bytes then base64url
  var bytes = '';
  for (var i = 0; i < mimeStr.length; i++) {
    var c = mimeStr.charCodeAt(i);
    if (c < 0x80) { bytes += String.fromCharCode(c); }
    else if (c < 0x800) { bytes += String.fromCharCode(0xC0 | (c >> 6)) + String.fromCharCode(0x80 | (c & 0x3F)); }
    else { bytes += String.fromCharCode(0xE0 | (c >> 12)) + String.fromCharCode(0x80 | ((c >> 6) & 0x3F)) + String.fromCharCode(0x80 | (c & 0x3F)); }
  }
  return _btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---------------------------------------------------------------------------
// Gmail
// ---------------------------------------------------------------------------

const gmail = {
  /** Search threads. Returns [{ id, historyId }]. Use gmail.thread() to read. */
  async search(q, opts) {
    const max = (opts && opts.max) || 10;
    const data = await gmailGet('/gmail/v1/users/me/threads', { q: q, maxResults: max });
    return data.threads || [];
  },

  /**
   * Search messages and return parsed results (subject, from, date, body snippet).
   * For full body use gmail.read(id).
   */
  async messages(q, opts) {
    const max = (opts && opts.max) || 10;
    const data = await gmailGet('/gmail/v1/users/me/messages', { q: q, maxResults: max });
    if (!data.messages || !data.messages.length) return [];
    const results = await Promise.all(
      data.messages.slice(0, max).map(function(m) {
        return gmailGet('/gmail/v1/users/me/messages/' + m.id, {
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'To', 'Date'],
        });
      })
    );
    return results.map(function(m) {
      var headers = (m.payload && m.payload.headers) || [];
      var h = function(k) {
        var f = headers.find(function(x) { return x.name.toLowerCase() === k.toLowerCase(); });
        return f ? f.value : '';
      };
      return {
        id: m.id,
        threadId: m.threadId,
        subject: h('Subject'),
        from: h('From'),
        to: h('To'),
        date: h('Date'),
        snippet: m.snippet || '',
        labelIds: m.labelIds || [],
      };
    });
  },

  /** Read a single message with fully decoded body. */
  async read(messageId) {
    const m = await gmailGet('/gmail/v1/users/me/messages/' + messageId, { format: 'full' });
    return parseMessage(m);
  },

  /** Get raw message object (advanced use). */
  async raw(messageId) {
    return await gmailGet('/gmail/v1/users/me/messages/' + messageId, { format: 'full' });
  },

  /** Get a thread with all messages parsed. */
  async thread(threadId) {
    const data = await gmailGet('/gmail/v1/users/me/threads/' + threadId, { format: 'full' });
    return (data.messages || []).map(parseMessage);
  },

  /**
   * List attachments in a message.
   * Returns [{ partId, attachmentId, filename, mimeType, size }]
   */
  async attachments(messageId) {
    const m = await gmailGet('/gmail/v1/users/me/messages/' + messageId, { format: 'full' });
    var results = [];
    function walk(parts) {
      if (!parts) return;
      parts.forEach(function(p) {
        if (p.filename && p.body && p.body.attachmentId) {
          results.push({
            partId:       p.partId,
            attachmentId: p.body.attachmentId,
            filename:     p.filename,
            mimeType:     p.mimeType,
            size:         p.body.size || 0,
          });
        }
        if (p.parts) walk(p.parts);
      });
    }
    walk(m.payload && m.payload.parts);
    return results;
  },

  /**
   * Download an attachment and save to local file.
   * savePath: destination path in JS sandbox (e.g. 'Downloads/report.pdf')
   * Returns saved file path.
   */
  async downloadAttachment(messageId, attachmentId, savePath) {
    if (typeof __fs_writeBase64 === 'undefined') {
      throw new Error('__fs_writeBase64 not available — requires Whistant JS runtime');
    }
    const data = await gmailGet(
      '/gmail/v1/users/me/messages/' + messageId + '/attachments/' + attachmentId
    );
    // Gmail returns base64url — convert to standard base64
    var b64 = (data.data || '').replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    while (b64.length % 4) b64 += '=';
    var ok = __fs_writeBase64(savePath, b64);
    if (!ok) throw new Error('Failed to save attachment to ' + savePath);
    return savePath;
  },

  /**
   * Send an email with optional file attachments via the Gmail API.
   * Requires the user's own OAuth token with 'gmail' scope (g.auth.setup + g.auth.login).
   * opts: { to, subject, body, cc?, bcc?,
   *         attachments?: [{ path, name?, contentType? }] }
   * attachments.path is relative to the JS sandbox Documents root.
   *
   * For simple sends WITHOUT attachments, prefer the runShortcut tool with
   * 'Email Contact Shortcut' (params: email, emailTitle, emailBody) — it requires
   * no Gmail write scope.
   */
  async send(opts) {
    var boundary = 'gmailboundary' + Date.now();
    var attachments = opts.attachments || [];

    // Build body part — base64-encode to safely handle Unicode
    var bodyText = opts.body || '';
    var bodyB64 = _btoa(unescape(encodeURIComponent(bodyText)));

    var lines = [];
    lines.push('To: ' + opts.to);
    if (opts.cc)  lines.push('Cc: '  + opts.cc);
    if (opts.bcc) lines.push('Bcc: ' + opts.bcc);
    lines.push('Subject: ' + opts.subject);
    lines.push('MIME-Version: 1.0');

    if (attachments.length === 0) {
      lines.push('Content-Type: text/plain; charset=UTF-8');
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      var bodyLines = bodyB64.match(/.{1,76}/g) || [bodyB64];
      lines = lines.concat(bodyLines);
    } else {
      lines.push('Content-Type: multipart/mixed; boundary="' + boundary + '"');
      lines.push('');
      lines.push('--' + boundary);
      lines.push('Content-Type: text/plain; charset=UTF-8');
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      var bLines = bodyB64.match(/.{1,76}/g) || [bodyB64];
      lines = lines.concat(bLines);

      for (var i = 0; i < attachments.length; i++) {
        var att = attachments[i];
        if (typeof __fs_readBase64 === 'undefined') {
          throw new Error('__fs_readBase64 not available — requires Whistant JS runtime');
        }
        var b64 = __fs_readBase64(att.path);
        if (!b64) throw new Error('Could not read attachment file: ' + att.path);
        var filename = att.name || att.path.split('/').pop();
        var contentType = att.contentType || 'application/octet-stream';
        lines.push('--' + boundary);
        lines.push('Content-Type: ' + contentType + '; name="' + filename + '"');
        lines.push('Content-Transfer-Encoding: base64');
        lines.push('Content-Disposition: attachment; filename="' + filename + '"');
        lines.push('');
        var aLines = b64.match(/.{1,76}/g) || [b64];
        lines = lines.concat(aLines);
      }
      lines.push('--' + boundary + '--');
    }

    var raw = lines.join('\r\n');
    var b64url = _btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return await apiPost('/gmail/v1/users/me/messages/send', { raw: b64url });
  },
};

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

const calendar = {
  /** List events. calendarId defaults to 'primary'. */
  async events(calendarId, opts) {
    const cal = calendarId || 'primary';
    const params = {
      maxResults: (opts && opts.max) || 20,
      fields: 'items(id,summary,start,end,location,description,status,attendees/email)',
    };
    if (opts && opts.from) params.timeMin = opts.from;
    if (opts && opts.to)   params.timeMax = opts.to;
    const data = await apiGet('/calendar/v3/calendars/' + encodeURIComponent(cal) + '/events', params);
    return (data.items || []).map(function(e) {
      return {
        id:          e.id,
        summary:     e.summary || '',
        from:        e.start && (e.start.dateTime || e.start.date) || '',
        to:          e.end   && (e.end.dateTime   || e.end.date)   || '',
        location:    e.location    || '',
        description: e.description || '',
        status:      e.status      || '',
        attendees:   (e.attendees  || []).map(function(a) { return a.email; }),
      };
    });
  },

  /** Create an event. */
  async create(calendarId, opts) {
    // opts: { summary, from (ISO), to (ISO), description, colorId }
    const body = {
      summary: opts.summary,
      start: { dateTime: opts.from },
      end:   { dateTime: opts.to },
    };
    if (opts.description) body.description = opts.description;
    if (opts.colorId)     body.colorId = String(opts.colorId);
    return await apiPost('/calendar/v3/calendars/' + encodeURIComponent(calendarId || 'primary') + '/events', body);
  },

  /** Update an event. */
  async update(calendarId, eventId, opts) {
    return await apiPost(
      '/calendar/v3/calendars/' + encodeURIComponent(calendarId || 'primary') + '/events/' + eventId,
      opts,
      'PATCH'
    );
  },

  /** List available event colors. */
  async colors() {
    return await apiGet('/calendar/v3/colors');
  },
};

// ---------------------------------------------------------------------------
// Drive
// ---------------------------------------------------------------------------

const drive = {
  /** Search files. q = Drive query string. */
  async search(q, opts) {
    const max = (opts && opts.max) || 10;
    const data = await apiGet('/drive/v3/files', { q, pageSize: max, fields: 'files(id,name,mimeType,modifiedTime,size,parents)' });
    return data.files || [];
  },

  /** Get file metadata. */
  async get(fileId) {
    return await apiGet('/drive/v3/files/' + fileId + '?fields=id,name,mimeType,modifiedTime,size,parents');
  },

  /**
   * Upload a local file to Drive.
   * opts: { name?, mimeType?, parents?, folderId? }
   * Requires Drive write scope such as drive.file or drive.
   */
  async upload(localPath, opts) {
    const accessToken = await auth.getAccessToken();
    const filename = (opts && opts.name) || localPath.split('/').pop();
    const mimeType = (opts && opts.mimeType) || 'application/octet-stream';
    const parents = (opts && opts.parents)
      ? (Array.isArray(opts.parents) ? opts.parents : [opts.parents])
      : ((opts && opts.folderId) ? [opts.folderId] : undefined);
    const metadata = { name: filename, mimeType: mimeType };
    if (parents && parents.length) metadata.parents = parents;

    const created = await apiPost('/drive/v3/files?fields=id,name,mimeType,modifiedTime,size,parents', metadata);
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files/' + created.id + '?uploadType=media&fields=id,name,mimeType,modifiedTime,size,parents',
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': mimeType,
        },
        bodyFilePath: localPath,
      }
    );
    if (!res.ok) throw new Error('Drive upload failed ' + res.status + ': ' + await res.text());
    return await res.json();
  },

  /** Download a Drive file to a local sandbox path. Returns savePath. */
  async download(fileId, savePath) {
    const accessToken = await auth.getAccessToken();
    const res = await fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    if (!res.ok) throw new Error('Drive download failed ' + res.status + ': ' + await res.text());
    await res.blob(savePath);
    return savePath;
  },
};

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

const contacts = {
  /** List contacts. */
  async list(opts) {
    const max = (opts && opts.max) || 20;
    const data = await apiGet('https://people.googleapis.com/v1/people/me/connections', {
      personFields: 'names,emailAddresses,phoneNumbers',
      pageSize: max,
    });
    return (data.connections || []).map(c => ({
      name: c.names && c.names[0] && c.names[0].displayName,
      email: c.emailAddresses && c.emailAddresses[0] && c.emailAddresses[0].value,
      phone: c.phoneNumbers && c.phoneNumbers[0] && c.phoneNumbers[0].value,
    }));
  },
};

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

const sheets = {
  /** Create a spreadsheet. title may be a string or opts object. */
  async create(title) {
    const opts = (title && typeof title === 'object') ? title : { title: title };
    return await apiPost('https://sheets.googleapis.com/v4/spreadsheets', {
      properties: { title: opts.title || ('Spreadsheet ' + new Date().toISOString()) },
    });
  },

  /** Get values from a range. */
  async get(sheetId, range) {
    return await apiGet('https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(range));
  },

  /** Update values in a range. values = 2D array. */
  async update(sheetId, range, values) {
    return await apiPost(
      'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(range) + '?valueInputOption=USER_ENTERED',
      { range, majorDimension: 'ROWS', values },
      'PUT'
    );
  },

  /** Append values. */
  async append(sheetId, range, values) {
    return await apiPost(
      'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(range) + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
      { range, majorDimension: 'ROWS', values }
    );
  },

  /** Clear a range. */
  async clear(sheetId, range) {
    return await apiPost('https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(range) + ':clear', {});
  },

  /** Get spreadsheet metadata (sheet names, row/column counts). */
  async metadata(sheetId) {
    return await apiGet('https://sheets.googleapis.com/v4/spreadsheets/' + sheetId, {
      includeGridData: false,
      fields: 'spreadsheetId,properties/title,sheets(properties(sheetId,title,gridProperties))',
    });
  },
};

// ---------------------------------------------------------------------------
// Docs
// ---------------------------------------------------------------------------

const docs = {
  /** Create a Google Doc. title may be a string or opts object. */
  async create(title) {
    const opts = (title && typeof title === 'object') ? title : { title: title };
    return await apiPost('https://docs.googleapis.com/v1/documents', {
      title: opts.title || ('Document ' + new Date().toISOString()),
    });
  },

  /** Get document as plain text. */
  async cat(docId) {
    const doc = await apiGet('https://docs.googleapis.com/v1/documents/' + docId);
    const text = (doc.body && doc.body.content || []).map(el => {
      if (!el.paragraph) return '';
      return (el.paragraph.elements || []).map(e => (e.textRun && e.textRun.content) || '').join('');
    }).join('');
    return text;
  },

  /** Get document metadata + structure. */
  async get(docId) {
    return await apiGet('https://docs.googleapis.com/v1/documents/' + docId);
  },

  /** Apply one or more Docs API batchUpdate requests. */
  async batchUpdate(docId, requests) {
    return await apiPost('https://docs.googleapis.com/v1/documents/' + docId + ':batchUpdate', {
      requests: Array.isArray(requests) ? requests : [requests],
    });
  },

  /** Insert text at the given document index (default 1 = start of body). */
  async insertText(docId, text, index) {
    return await docs.batchUpdate(docId, {
      insertText: {
        location: { index: index || 1 },
        text: text,
      },
    });
  },
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// CMD parsing (/cmd path)
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string') return [];
  var tokens = [];
  var buf = '';
  var inStr = false;
  var quote = '';
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if (inStr) {
      if (ch === quote) { inStr = false; tokens.push(buf); buf = ''; }
      else buf += ch;
    } else if (ch === '"' || ch === "'") { inStr = true; quote = ch; }
    else if (ch === ' ' || ch === '\t') { if (buf) { tokens.push(buf); buf = ''; } }
    else buf += ch;
  }
  if (buf) tokens.push(buf);
  // Strip "run /skills/.../" prefix if present
  var runIdx = -1;
  for (var j = 0; j < tokens.length; j++) {
    if (tokens[j] === 'run' && j + 1 < tokens.length && tokens[j+1].indexOf('/skills/') >= 0) {
      runIdx = j;
      break;
    }
  }
  if (runIdx >= 0) tokens = tokens.slice(runIdx + 2);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = typeof cmd === 'string' ? tokenize(cmd) : cmd;
  var out = { action: '', subaction: '', flags: {}, args: [] };
  if (!tokens || !tokens.length) return out;
  out.action = tokens[0];
  if (tokens[1] && tokens[1].indexOf('--') !== 0) out.subaction = tokens[1];
  var positional = out.subaction ? 2 : 1;
  for (var i = positional; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var eq = t.indexOf('=');
      if (eq > 0) out.flags[t.substring(2, eq)] = t.substring(eq + 1);
      else out.flags[t.substring(2)] = true;
    } else {
      out.args.push(t);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Handler & runFromParams
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var action = params.action || '';
  var subaction = params.subaction || '';
  var flags = params.flags || {};
  var args = params.args || [];

  // Parse from command string if provided
  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.action && !action) action = parsed.action;
    if (parsed.subaction) subaction = parsed.subaction;
    if (Object.keys(parsed.flags).length) flags = parsed.flags;
    if (parsed.args.length) args = parsed.args;
  }

  var max = parseInt(flags.max, 10) || 10;

  if (!action) {
    console.log('Usage:');
    console.log('  auth status');
    console.log('  gmail inbox [query] --max=N');
    console.log('  gmail read <id>');
    console.log('  calendar events --days=N --max=N');
    console.log('  drive search <query> --max=N');
    console.log('  contacts list --max=N');
    return 'usage';
  }

  try {
    if (action === 'auth') {
      var s = await auth.status();
      console.log('loggedIn:', s.loggedIn ? 'yes' : 'no');
      if (s.loggedIn) console.log('expires:', s.expiresAt);
      if (subaction === 'login') await auth.login();
    } else if (action === 'gmail') {
      if (subaction === 'inbox') {
        var query = args[0] || 'in:inbox newer_than:3d';
        var msgs = await gmail.messages(query, { max: max });
        console.log('messages:', msgs.length);
        msgs.forEach(function(m) { console.log(m.date + ' | ' + m.from + '\n  ' + m.subject); });
      } else if (subaction === 'read') {
        var msg = await gmail.read(args[0]);
        console.log('subject:', msg.subject);
        console.log('from:', msg.from);
        console.log('body:', (msg.body || '').substring(0, 500));
      } else { console.log('usage: gmail inbox|read'); }
    } else if (action === 'calendar') {
      var days = parseInt(flags.days, 10) || 7;
      var events = await calendar.events('primary', {
        from: new Date().toISOString(),
        to: new Date(Date.now() + days * 86400000).toISOString(),
        max: max
      });
      console.log('events:', events.length);
      events.forEach(function(e) { console.log(e.start.dateTime + ' | ' + e.summary); });
    } else if (action === 'drive') {
      var files = await drive.search(args[0] || '', { max: max });
      console.log('files:', files.length);
      files.forEach(function(f) { console.log(f.name + ' (' + f.id + ')'); });
    } else if (action === 'contacts') {
      var contacts_ = await contacts.list({ max: max });
      console.log('contacts:', contacts_.length);
      contacts_.forEach(function(c) { console.log(c.name + ' <' + c.email + '>'); });
    } else {
      console.log('Unknown action: ' + action);
      console.log('Actions: auth, gmail, calendar, drive, contacts');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  return 'ok';
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const google = { auth, gmail, calendar, drive, contacts, sheets, docs, handler, runFromParams, parseCommand, tokenize };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = google;
} else if (typeof globalThis !== 'undefined') {
  globalThis.google = google;
}

// ---------------------------------------------------------------------------
// Node.js CLI
// ---------------------------------------------------------------------------

if (typeof module !== 'undefined' && typeof process !== 'undefined' && require.main === module) {
  (async function () {
    var args = process.argv.slice(2);
    var cmd = args.join(' ');
    console.log(JSON.stringify(await handler({ parameters: cmd })));
  })();
}

// ---------------------------------------------------------------------------
// PARAMS auto-run (/cmd path)
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (typeof PARAMS !== 'undefined' || typeof PARAMS_JSON !== 'undefined')) {
  return handler({});
}
