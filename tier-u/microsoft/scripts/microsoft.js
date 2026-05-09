// Microsoft 365 skill for the iPhone JS terminal
// Uses Microsoft OAuth2 PKCE + in-app browser — no binary needed
// Shared app registration — users just run login(), no setup required
// Stores tokens in iOS Keychain via the `keychain` bridge
//
// Quick start:
//   const m = require('/skills/microsoft/scripts/microsoft');
//   await m.auth.login();   // opens browser, saves token
//   const msgs = await m.mail.messages({ max: 5 });

// ---------------------------------------------------------------------------
// App credentials — injected from Info.plist (MS_CLIENT_ID, CALLBACK_SCHEME)
// ---------------------------------------------------------------------------

function resolveClientId() {
  if (typeof __MS_CLIENT_ID !== 'undefined' && __MS_CLIENT_ID) return __MS_CLIENT_ID;
  throw new Error('Microsoft client ID not found. Set MS_CLIENT_ID in Info.plist.');
}

function resolveRedirectUri() {
  var scheme = (typeof __CALLBACK_SCHEME !== 'undefined' && __CALLBACK_SCHEME) ? __CALLBACK_SCHEME : 'whistant';
  return scheme + '://auth';
}
const AUTH_URL     = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL    = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH_BASE   = 'https://graph.microsoft.com/v1.0';

const DEFAULT_SCOPES = [
  'Mail.ReadWrite',
  'Mail.Send',
  'Calendars.ReadWrite',
  'Files.ReadWrite',
  'Contacts.ReadWrite',
  'offline_access',
  'User.Read',
].join(' ');

// ---------------------------------------------------------------------------
// Keychain
// ---------------------------------------------------------------------------

const KEYCHAIN_KEY = 'microsoft_oauth_token';

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


function buildAuthUrl() {
  const params = [
    'response_type=code',
    'client_id='    + encodeURIComponent(resolveClientId()),
    'redirect_uri=' + encodeURIComponent(resolveRedirectUri()),
    'scope='        + encodeURIComponent(DEFAULT_SCOPES),
    'response_mode=query',
    'prompt=select_account',
  ].join('&');
  return AUTH_URL + '?' + params;
}

async function exchangeCode(code) {
  const body = 'grant_type=authorization_code' +
    '&code='         + encodeURIComponent(code) +
    '&client_id='    + encodeURIComponent(resolveClientId()) +
    '&redirect_uri=' + encodeURIComponent(resolveRedirectUri());
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    timeout: 15,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });
  if (!res.ok) throw new Error('Token exchange failed: ' + await res.text());
  return await res.json();
}

async function refreshAccessToken(refreshToken) {
  const body = 'grant_type=refresh_token' +
    '&client_id='     + encodeURIComponent(resolveClientId()) +
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
// Auth
// ---------------------------------------------------------------------------

const auth = {
  /** Open in-app browser for Microsoft sign-in. No setup needed — just call login(). */
  async login() {
    const redirectUri = resolveRedirectUri();
    const authUrl     = buildAuthUrl();
    console.log('Opening Microsoft sign-in...');
    var redirectUrl;
    try {
      redirectUrl = await browser.openOAuth(authUrl, redirectUri);
    } catch (e) {
      throw new Error((e && (e.message || String(e))) || 'Login cancelled or failed');
    }
    const match = redirectUrl.match(/[?&]code=([^&]+)/);
    if (!match) throw new Error('No code in redirect: ' + redirectUrl);
    const code  = decodeURIComponent(match[1]);
    const token = await exchangeCode(code);
    token._expiresAt = Date.now() + (token.expires_in || 3600) * 1000;
    await saveToken(token);
    console.log('Authorized! Token stored in Keychain.');
    return { ok: true, expiresAt: new Date(token._expiresAt).toISOString() };
  },

  async logout() {
    await clearToken();
    console.log('Logged out.');
  },

  async status() {
    const token = await loadToken();
    if (!token) { console.log('Auth: not logged in'); return { loggedIn: false }; }
    const exp = token._expiresAt ? new Date(token._expiresAt).toISOString() : 'unknown';
    console.log('Auth: logged in, token expires ' + exp);
    return { loggedIn: true, expiresAt: exp };
  },

  /** Returns a valid access token, refreshing silently if expired. */
  async getAccessToken() {
    let token = await loadToken();
    if (!token) throw new Error('Not logged in. Run: await m.auth.login()');
    if (token._expiresAt && Date.now() > token._expiresAt - 60000) {
      if (!token.refresh_token) throw new Error('Token expired. Please run m.auth.login() again.');
      const refreshed = await refreshAccessToken(token.refresh_token);
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
// Base API helpers
// ---------------------------------------------------------------------------

async function apiGet(path, params) {
  const accessToken = await auth.getAccessToken();
  let url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  if (params) {
    var parts = [];
    Object.entries(params).forEach(function(entry) {
      var k = entry[0], v = entry[1];
      if (v === undefined || v === null) return;
      parts.push(k + '=' + encodeURIComponent(v));
    });
    if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&');
  }
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  return await res.json();
}

async function apiPost(path, body, method) {
  const accessToken = await auth.getAccessToken();
  const url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  const res = await fetch(url, {
    method: method || 'POST',
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function apiDelete(path) {
  const accessToken = await auth.getAccessToken();
  const url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: 'Bearer ' + accessToken } });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseEvent(e) {
  return {
    id:        e.id,
    subject:   e.subject  || '',
    from:      e.start    && (e.start.dateTime    || e.start.date)    || '',
    to:        e.end      && (e.end.dateTime      || e.end.date)      || '',
    location:  e.location && e.location.displayName || '',
    organizer: e.organizer && e.organizer.emailAddress &&
               (e.organizer.emailAddress.name || e.organizer.emailAddress.address) || '',
    isAllDay:  !!e.isAllDay,
    preview:   e.bodyPreview || '',
  };
}

// ---------------------------------------------------------------------------
// Mail (Outlook)
// ---------------------------------------------------------------------------

function parseMessage(m) {
  var from = '';
  if (m.from && m.from.emailAddress) {
    from = m.from.emailAddress.name
      ? m.from.emailAddress.name + ' <' + m.from.emailAddress.address + '>'
      : m.from.emailAddress.address;
  }
  var to = (m.toRecipients || []).map(function(r) { return r.emailAddress.address; }).join(', ');
  var body = '', bodyHtml = '';
  if (m.body) {
    if (m.body.contentType === 'html') {
      bodyHtml = m.body.content;
      body = m.body.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      body = m.body.content || '';
    }
  }
  return {
    id:             m.id,
    conversationId: m.conversationId,
    subject:        m.subject || '',
    from:           from,
    to:             to,
    date:           m.receivedDateTime || '',
    snippet:        m.bodyPreview || '',
    body:           body,
    bodyHtml:       bodyHtml,
    isRead:         m.isRead,
    importance:     m.importance,
  };
}

const mail = {
  /**
   * List messages from a folder. opts: { max, folder, filter, search }
   * folder defaults to 'inbox'. filter is an OData $filter string.
   */
  async messages(opts) {
    const max    = (opts && opts.max)    || 10;
    const folder = (opts && opts.folder) || 'inbox';
    const params = {
      '$top':     max,
      '$select':  'id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,conversationId',
      '$orderby': 'receivedDateTime desc',
    };
    if (opts && opts.filter) params['$filter'] = opts.filter;
    if (opts && opts.search) params['$search'] = '"' + opts.search + '"';
    const data = await apiGet('/me/mailFolders/' + folder + '/messages', params);
    return (data.value || []).map(parseMessage);
  },

  /** Read a single message with full body. */
  async read(messageId) {
    const m = await apiGet('/me/messages/' + messageId + '?$select=id,subject,from,toRecipients,receivedDateTime,body,bodyPreview,isRead,conversationId,importance');
    return parseMessage(m);
  },

  /** Search messages across all folders. */
  async search(query, opts) {
    const max = (opts && opts.max) || 10;
    const data = await apiGet('/me/messages', {
      '$search': '"' + query + '"',
      '$top':    max,
      '$select': 'id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,conversationId',
    });
    return (data.value || []).map(parseMessage);
  },

  /**
   * Send a new email.
   * opts: { to, subject, body, bodyHtml, cc, bcc,
   *         attachments: [{ path, name?, contentType? }] }
   * attachments.path is relative to the JS sandbox Documents root.
   * Graph API inline attachment limit is 3 MB per attachment.
   */
  async send(opts) {
    const message = {
      subject: opts.subject,
      body: { contentType: opts.bodyHtml ? 'HTML' : 'Text', content: opts.bodyHtml || opts.body || '' },
      toRecipients: [{ emailAddress: { address: opts.to } }],
    };
    if (opts.cc)  message.ccRecipients  = [{ emailAddress: { address: opts.cc } }];
    if (opts.bcc) message.bccRecipients = [{ emailAddress: { address: opts.bcc } }];
    if (opts.attachments && opts.attachments.length) {
      message.attachments = opts.attachments.map(function(a) {
        var b64 = __fs_readBase64(a.path);
        if (!b64) throw new Error('Could not read attachment file: ' + a.path);
        return {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name:         a.name || a.path.split('/').pop(),
          contentType:  a.contentType || 'application/octet-stream',
          contentBytes: b64,
        };
      });
    }
    return await apiPost('/me/sendMail', { message, saveToSentItems: true });
  },

  /** Reply to a message. opts: { body, bodyHtml } */
  async reply(messageId, opts) {
    return await apiPost('/me/messages/' + messageId + '/reply', {
      message: { body: { contentType: opts.bodyHtml ? 'HTML' : 'Text', content: opts.bodyHtml || opts.body || '' } },
    });
  },

  /** Mark a message as read (isRead=true) or unread (isRead=false). */
  async markRead(messageId, isRead) {
    return await apiPost('/me/messages/' + messageId, { isRead: isRead !== false }, 'PATCH');
  },

  /** Move message to trash (Deleted Items). */
  async delete(messageId) {
    return await apiPost('/me/messages/' + messageId + '/move', { destinationId: 'deleteditems' });
  },

  /** List attachments for a message. Returns [{ id, name, contentType, size }] */
  async attachments(messageId) {
    const data = await apiGet('/me/messages/' + messageId + '/attachments', {
      '$select': 'id,name,contentType,size',
    });
    return (data.value || []).map(function(a) {
      return { id: a.id, name: a.name, contentType: a.contentType, size: a.size || 0 };
    });
  },

  /** Download an attachment and save to a local path. Returns savePath on success. */
  async downloadAttachment(messageId, attachmentId, savePath) {
    const a = await apiGet('/me/messages/' + messageId + '/attachments/' + attachmentId + '?$select=id,name,contentBytes');
    if (!a.contentBytes) throw new Error('No contentBytes in attachment response');
    var ok = __fs_writeBase64(savePath, a.contentBytes);
    if (!ok) throw new Error('Failed to save attachment to ' + savePath);
    return savePath;
  },
};

// ---------------------------------------------------------------------------
// Calendar (Outlook)
// ---------------------------------------------------------------------------

const calendar = {
  /**
   * List events. opts: { from, to, max, calendarId }
   * from/to are ISO date strings. calendarId defaults to primary calendar.
   */
  async events(opts) {
    const max = (opts && opts.max) || 20;
    const params = {
      '$top':     max,
      '$select':  'id,subject,start,end,location,organizer,isAllDay,bodyPreview',
      '$orderby': 'start/dateTime asc',
    };
    var filters = [];
    if (opts && opts.from) filters.push('start/dateTime ge \'' + opts.from + '\'');
    if (opts && opts.to)   filters.push('end/dateTime le \''   + opts.to   + '\'');
    if (filters.length) params['$filter'] = filters.join(' and ');
    const calId = (opts && opts.calendarId);
    const path  = calId ? '/me/calendars/' + calId + '/events' : '/me/events';
    const data  = await apiGet(path, params);
    return (data.value || []).map(parseEvent);
  },

  /** Create an event. opts: { subject, from (ISO), to (ISO), description, location, timeZone, isAllDay } */
  async create(opts) {
    const body = {
      subject: opts.subject,
      start: { dateTime: opts.from, timeZone: opts.timeZone || 'UTC' },
      end:   { dateTime: opts.to,   timeZone: opts.timeZone || 'UTC' },
    };
    if (opts.description) body.body     = { contentType: 'Text', content: opts.description };
    if (opts.location)    body.location = { displayName: opts.location };
    if (opts.isAllDay)    body.isAllDay = true;
    return parseEvent(await apiPost('/me/events', body));
  },

  /** Update an event by ID. Pass only the fields to change. */
  async update(eventId, opts) {
    return parseEvent(await apiPost('/me/events/' + eventId, opts, 'PATCH'));
  },

  /** Delete an event. */
  async delete(eventId) {
    return await apiDelete('/me/events/' + eventId);
  },

  /** List all calendars. */
  async list() {
    const data = await apiGet('/me/calendars?$select=id,name,color,isDefaultCalendar');
    return data.value || [];
  },
};

// ---------------------------------------------------------------------------
// OneDrive
// ---------------------------------------------------------------------------

const onedrive = {
  /** List items in root or a folder. folderId omitted = root. */
  async list(folderId) {
    const path = folderId
      ? '/me/drive/items/' + folderId + '/children'
      : '/me/drive/root/children';
    const data = await apiGet(path + '?$select=id,name,size,lastModifiedDateTime,folder,file,webUrl');
    return data.value || [];
  },

  /** Search files and folders. */
  async search(query, opts) {
    const max  = (opts && opts.max) || 10;
    const data = await apiGet(
      '/me/drive/search(q=\'' + encodeURIComponent(query) + '\')' +
      '?$top=' + max + '&$select=id,name,size,lastModifiedDateTime,folder,file,webUrl'
    );
    return data.value || [];
  },

  /** Get metadata for a file or folder. */
  async get(itemId) {
    return await apiGet('/me/drive/items/' + itemId + '?$select=id,name,size,lastModifiedDateTime,folder,file,webUrl,parentReference');
  },

  /** Get a pre-authenticated download URL for a file. */
  async downloadUrl(itemId) {
    const item = await apiGet('/me/drive/items/' + itemId + '?$select=id,@microsoft.graph.downloadUrl');
    return item['@microsoft.graph.downloadUrl'];
  },

  /**
   * Upload a local file to OneDrive (simple PUT — works up to ~250 MB).
   * localPath:   path to file in the JS sandbox (e.g. '/Documents/report.pdf')
   * opts: { remotePath, name, contentType, folderId }
   *   remotePath:  destination path in OneDrive root (default: filename from localPath).
   *                Ignored when folderId is set.
   *   name:        override destination filename.
   *   contentType: MIME type (default: 'application/octet-stream').
   *   folderId:    upload into a specific folder by its item ID.
   * Returns the created/updated DriveItem metadata.
   */
  async upload(localPath, opts) {
    const accessToken = await auth.getAccessToken();
    const filename = (opts && opts.name) || localPath.split('/').pop();
    const contentType = (opts && opts.contentType) || 'application/octet-stream';
    let url;
    if (opts && opts.folderId) {
      url = GRAPH_BASE + '/me/drive/items/' + opts.folderId + ':/' + encodeURIComponent(filename) + ':/content';
    } else {
      const remotePath = (opts && opts.remotePath) || filename;
      url = GRAPH_BASE + '/me/drive/root:/' + encodeURIComponent(remotePath) + ':/content';
    }
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': contentType,
      },
      bodyFilePath: localPath,
    });
    if (!res.ok) throw new Error('Upload failed ' + res.status + ': ' + await res.text());
    return await res.json();
  },
};

// ---------------------------------------------------------------------------
// Contacts (Outlook)
// ---------------------------------------------------------------------------

const contacts = {
  /** List contacts. opts: { max } */
  async list(opts) {
    const max  = (opts && opts.max) || 20;
    const data = await apiGet('/me/contacts', {
      '$top':    max,
      '$select': 'id,displayName,emailAddresses,mobilePhone,businessPhones',
    });
    return (data.value || []).map(function(c) {
      return {
        id:    c.id,
        name:  c.displayName || '',
        email: c.emailAddresses && c.emailAddresses[0] ? c.emailAddresses[0].address : '',
        phone: c.mobilePhone || (c.businessPhones && c.businessPhones[0]) || '',
      };
    });
  },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const microsoft = { auth, mail, calendar, onedrive, contacts };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = microsoft;
} else if (typeof globalThis !== 'undefined') {
  globalThis.microsoft = microsoft;
}
