---
name: imap-smtp-email
description: Read and send email via REST APIs using fetch(). Supports Gmail API, Outlook Graph API, and JMAP (Fastmail). No IMAP/SMTP CLI required.
version: 2.0
---
# imap-smtp-email

Read, search, and send email using HTTP APIs via `fetch()`. Supports Gmail, Outlook, and any JMAP server (Fastmail).

> Note: IMAP/SMTP are TCP protocols — they can't run in Whistant's JSCore. Use the HTTP-based alternatives below.

## Gmail API

### Setup

```js
// OAuth2 access token — scopes: gmail.readonly, gmail.modify, gmail.send
const TOKEN = 'ya29.your_oauth_access_token';
const headers = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
```

### List unread messages

```js
const res = await fetch(`${BASE}/messages?q=is:unread&maxResults=20`, { headers });
const data = await res.json();
console.log('Unread count:', data.resultSizeEstimate);
for (const { id } of (data.messages ?? []).slice(0, 5)) {
  const msg = await (await fetch(`${BASE}/messages/${id}?format=metadata&metadataHeaders=Subject,From,Date`, { headers })).json();
  const h = msg.payload?.headers ?? [];
  console.log(h.find(x => x.name === 'From')?.value, '|', h.find(x => x.name === 'Subject')?.value);
}
```

### Get full message body

```js
const messageId = 'message_id_here';
const res = await fetch(`${BASE}/messages/${messageId}?format=full`, { headers });
const msg = await res.json();
const bodyData = msg.payload?.body?.data ?? msg.payload?.parts?.[0]?.body?.data ?? '';
if (bodyData) {
  const text = atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
  console.log(text.slice(0, 500));
}
```

### Send message

```js
const to = 'recipient@example.com';
const subject = 'Hello from Whistant';
const body = 'This is the email body.';
const raw = btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`)
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const res = await fetch(`${BASE}/messages/send`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ raw }),
});
console.log('Sent message id:', (await res.json()).id);
```

### Search messages

```js
const query = encodeURIComponent('from:boss@company.com after:2026/01/01 subject:report');
const res = await fetch(`${BASE}/messages?q=${query}&maxResults=10`, { headers });
const data = await res.json();
console.log('Found:', data.resultSizeEstimate, 'messages');
```

### Mark as read / archive

```js
const messageId = 'message_id_here';
// Mark read
await fetch(`${BASE}/messages/${messageId}/modify`, {
  method: 'POST', headers,
  body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
});
// Archive (remove from inbox)
await fetch(`${BASE}/messages/${messageId}/modify`, {
  method: 'POST', headers,
  body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
});
```

---

## Outlook / Microsoft Graph

```js
const MS_TOKEN = 'your_graph_token';
const msHeaders = { 'Authorization': `Bearer ${MS_TOKEN}`, 'Content-Type': 'application/json' };
const MS_BASE = 'https://graph.microsoft.com/v1.0/me';
```

### List messages

```js
const res = await fetch(`${MS_BASE}/messages?$top=20&$filter=isRead eq false&$select=subject,from,receivedDateTime&$orderby=receivedDateTime desc`, { headers: msHeaders });
const data = await res.json();
data.value?.forEach(m => console.log(m.receivedDateTime, m.from?.emailAddress?.address, m.subject));
```

### Send message

```js
const res = await fetch(`${MS_BASE}/sendMail`, {
  method: 'POST',
  headers: msHeaders,
  body: JSON.stringify({
    message: {
      subject: 'Hello from Whistant',
      body: { contentType: 'Text', content: 'Email body.' },
      toRecipients: [{ emailAddress: { address: 'recipient@example.com' } }],
    },
    saveToSentItems: true,
  }),
});
console.log('Status:', res.status); // 202 = sent
```

---

## Fastmail (JMAP)

```js
const JMAP_TOKEN = 'your-fastmail-api-token';
const jHeaders = { 'Authorization': `Bearer ${JMAP_TOKEN}`, 'Content-Type': 'application/json' };
```

### List recent emails

```js
// First get accountId
const session = await (await fetch('https://api.fastmail.com/jmap/session', { headers: jHeaders })).json();
const accountId = Object.keys(session.accounts)[0];

// Query emails
const res = await fetch('https://api.fastmail.com/jmap/api/', {
  method: 'POST',
  headers: jHeaders,
  body: JSON.stringify({
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      ['Email/query', { accountId, sort: [{ property: 'receivedAt', isAscending: false }], limit: 10 }, '0'],
      ['Email/get', { accountId, '#ids': { resultOf: '0', name: 'Email/query', path: '/ids' }, properties: ['subject', 'from', 'receivedAt'] }, '1'],
    ],
  }),
});
const data = await res.json();
data.methodResponses[1][1].list?.forEach(e => console.log(e.receivedAt, e.from?.[0]?.email, e.subject));
```

## Provider quick reference

| Provider | Protocol | Token type |
|---|---|---|
| Gmail | REST | OAuth2 (`gmail.modify`) |
| Outlook | Graph API | OAuth2 (Azure AD) |
| Fastmail | JMAP | API token (fastmail settings) |
| iCloud | JMAP | App-specific password |

## Notes

- Gmail OAuth: https://developers.google.com/gmail/api/auth/about-auth
- Outlook OAuth: Azure AD app with `Mail.ReadWrite` + `Mail.Send`
- Fastmail JMAP token: fastmail.com → Settings → Privacy & Security → API tokens
