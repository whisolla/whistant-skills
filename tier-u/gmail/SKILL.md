---
name: gmail
description: Read, send, and manage Gmail using the Gmail REST API via fetch(). Requires a Google OAuth2 access token.
version: 2.0
---
# gmail

Use the Gmail REST API via `fetch()`. All requests require a Google OAuth2 access token.

## Setup

Get an access token via Google OAuth2 (scope: `https://www.googleapis.com/auth/gmail.modify`).

```js
const ACCESS_TOKEN = 'ya29.your_oauth_token_here';
const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};
const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
```

## List messages

```js
const res = await fetch(`${BASE}/messages?maxResults=10&q=is:unread`, { headers });
const data = await res.json();
data.messages?.forEach(m => console.log(m.id, m.threadId));
```

## Get a message

```js
const messageId = 'message_id_here';
const res = await fetch(`${BASE}/messages/${messageId}?format=full`, { headers });
const msg = await res.json();
// Subject is in headers array
const subject = msg.payload?.headers?.find(h => h.name === 'Subject')?.value;
const from = msg.payload?.headers?.find(h => h.name === 'From')?.value;
console.log('From:', from, 'Subject:', subject);
// Body (base64url encoded)
const body = msg.payload?.body?.data ?? msg.payload?.parts?.[0]?.body?.data;
if (body) console.log(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
```

## Send a message

```js
// Build RFC 2822 raw message, base64url encode it
const to = 'recipient@example.com';
const subject = 'Hello from Whistant';
const bodyText = 'This is a test email.';
const raw = btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${bodyText}`)
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const res = await fetch(`${BASE}/messages/send`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ raw }),
});
const sent = await res.json();
console.log('Sent message id:', sent.id);
```

## List threads

```js
const res = await fetch(`${BASE}/threads?maxResults=10`, { headers });
const data = await res.json();
data.threads?.forEach(t => console.log(t.id, t.snippet));
```

## Search messages

```js
const q = encodeURIComponent('from:boss@company.com after:2024/01/01 subject:report');
const res = await fetch(`${BASE}/messages?q=${q}&maxResults=20`, { headers });
const data = await res.json();
console.log('Found:', data.resultSizeEstimate, 'messages');
data.messages?.forEach(m => console.log(m.id));
```

## Modify labels (mark read/unread, archive)

```js
const messageId = 'message_id_here';
// Mark as read
const res = await fetch(`${BASE}/messages/${messageId}/modify`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
});
// Archive (remove INBOX label)
const res2 = await fetch(`${BASE}/messages/${messageId}/modify`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
});
```

## List labels

```js
const res = await fetch(`${BASE}/labels`, { headers });
const data = await res.json();
data.labels?.forEach(l => console.log(l.id, l.name));
```

## Create a draft

```js
const raw = btoa(`To: someone@example.com\r\nSubject: Draft\r\n\r\nDraft body here.`)
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const res = await fetch(`${BASE}/drafts`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ message: { raw } }),
});
const draft = await res.json();
console.log('Draft id:', draft.id);
```

## Notes

- Scopes needed: `gmail.readonly` for read-only, `gmail.modify` for read+write, `gmail.send` for send
- All message bodies are base64url encoded — use `atob()` after replacing `-` → `+` and `_` → `/`
- Rate limit: 1 billion quota units/day; 250 quota units/second per user
- For long email bodies use `format=full`; for just headers use `format=metadata`
