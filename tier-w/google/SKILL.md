---
name: google
description: Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs — runs entirely in the iPhone JS terminal via fetch() and OAuth2 PKCE. Tokens stored in iOS Keychain.
version: 1.2
---

# google

> **Runtime:** Terminal: `run /skills/google/scripts/google.js <action> [args]`. JS: `var g = require('/skills/google/scripts/google'); var s = await g.auth.status(); console.log('loggedIn:', s.loggedIn)`

Google Workspace skill for the iPhone JS terminal. No binary required — uses `fetch()` + Google OAuth2 PKCE in the in-app browser. Credentials stored securely in iOS Keychain via the `keychain` bridge.

## Quick Use (terminal)

```bash
# Check auth status
run /skills/google/scripts/google.js auth status

# List recent inbox
run /skills/google/scripts/google.js gmail inbox --max=5

# Read a specific email
run /skills/google/scripts/google.js gmail read MESSAGE_ID

# Calendar events
run /skills/google/scripts/google.js calendar events --days=7 --max=10

# Drive search
run /skills/google/scripts/google.js drive search report --max=10

# Contacts
run /skills/google/scripts/google.js contacts list --max=20
```

## Quick Use (JS)

```js
var g = require('/skills/google/scripts/google');

// Auth
await g.auth.setup('CLIENT_ID');  // once
await g.auth.login();            // opens browser
var s = await g.auth.status();
console.log('loggedIn:', s.loggedIn, 'expires:', s.expiresAt);

// Gmail
var msgs = await g.gmail.messages('in:inbox newer_than:3d', { max: 5 });
msgs.forEach(function(m) { console.log(m.date + ' | ' + m.from + '\n  ' + m.subject); });

// Calendar
var events = await g.calendar.events('primary', { from: new Date().toISOString(), max: 10 });
events.forEach(function(e) { console.log(e.start.dateTime + ' | ' + e.summary); });
```

## Setup (once per user)

Google is different from Microsoft here: **Whistant cannot rely on one shared Google client for everyone**. In practice, each user should create their own Google OAuth client ID and use that in the app.

### 1. Create a Google OAuth client

In [Google Cloud Console](https://console.cloud.google.com):

1. Create a project.
2. Enable the APIs you need:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - People API
   - Google Sheets API
   - Google Docs API
3. Configure **OAuth consent screen**:
   - User type: **External**
   - Add the exact Gmail address you will log in with under **Test users**
4. Create **OAuth client ID**:
   - App type: **iOS**
   - Bundle ID: `com.whisolla.whistant`
5. Copy the client ID, for example:
   - `123456789-abcdefg.apps.googleusercontent.com`

If Google shows `access_denied` or says the app is not verified, the usual fix is: **add your Gmail address to Test users**.

### 2. Save the client ID in Whistant

```js
var g = require('/skills/google/scripts/google');

// Good default for Gmail/Calendar/read-only Drive + Docs
await g.auth.setup('YOUR_CLIENT_ID');
console.log('client ID saved');

// For Drive upload + Docs editing, use broader scopes explicitly
await g.auth.setup('YOUR_CLIENT_ID', [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
]);
console.log('client ID saved with full scopes');
```

### 3. Log in

```js
var g = require('/skills/google/scripts/google');
await g.auth.login();
console.log('logged in');
```

The browser opens once, Google redirects back to Whistant, and the token is stored in Keychain.

## Auth commands

```js
await g.auth.setup('CLIENT_ID')   // save client ID + scopes
await g.auth.login()              // open browser, exchange code, save token
await g.auth.status()             // check whether a token exists / when it expires
await g.auth.logout()             // revoke + clear token
```

## Capability → scope notes

- **Gmail read**: may use the app's built-in Gmail token path
- **Gmail send / modify**: needs user OAuth with Gmail scope
- **Calendar**: needs user OAuth
- **Drive search / metadata**: needs user OAuth
- **Drive upload**: needs `drive.file` (or broader Drive write scope)
- **Sheets edit**: needs `spreadsheets`
- **Docs edit**: needs `documents`

## Gmail

> **No setup required for reading.** Gmail read access uses the app's built-in sign-in (Email tab).
> Just make sure you're signed into Gmail in the app — no client ID or `g.auth.setup()` needed.
>
> **Sending without attachments**: Use the `runShortcut` tool with `Email Contact Shortcut`
> (params: `email`, `emailTitle`, `emailBody`). No Gmail write scope needed.
>
> **Sending with attachments**: Use `g.gmail.send()` — requires user OAuth with `gmail` scope
> (`g.auth.setup('CLIENT_ID', ['gmail'])` + `g.auth.login()`). Files are read from the JS sandbox.

```js
// Search messages — returns metadata (subject, from, date, snippet)
const msgs = await g.gmail.messages('in:inbox newer_than:3d', { max: 10 });
console.log(msgs.map(m => m.date + ' | ' + m.from + '\n  ' + m.subject));

// Read a single message with fully decoded body
const msg = await g.gmail.read('MESSAGE_ID');
console.log(msg.subject);
console.log(msg.from);
console.log(msg.body);      // plain text (HTML tags stripped if no plain part)
console.log(msg.bodyHtml);  // raw HTML if present

// Search threads (grouped by conversation)
const threads = await g.gmail.search('newer_than:7d in:inbox', { max: 10 });

// Read all messages in a thread
const thread = await g.gmail.thread('THREAD_ID');
thread.forEach(m => console.log(m.from + ': ' + m.snippet));

// Raw message object (advanced)
const raw = await g.gmail.raw('MESSAGE_ID');

// List attachments in a message
const atts = await g.gmail.attachments('MESSAGE_ID');
// [{ partId, attachmentId, filename, mimeType, size }]

// Download an attachment to a local path
await g.gmail.downloadAttachment('MESSAGE_ID', 'ATTACHMENT_ID', 'Documents/invoice.pdf');

// Send email with attachments (requires 'gmail' OAuth scope)
await g.gmail.send({
  to: 'a@b.com', subject: 'Report', body: 'Please find attached.',
  attachments: [
    { path: 'Documents/report.pdf' },                          // name inferred from path
    { path: 'Downloads/data.xlsx', name: 'Q1 Data.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  ],
});
```

Parsed message shape:
```js
{
  id, threadId,
  subject, from, to, date,
  snippet,           // short preview from Gmail
  body,              // decoded plain text (or HTML-stripped fallback)
  bodyHtml,          // decoded HTML (empty string if none)
  labelIds,          // e.g. ['INBOX', 'UNREAD']
}
```

## Calendar

```js
// List upcoming events
const events = await g.calendar.events('primary', {
  from: new Date().toISOString(),
  to: new Date(Date.now() + 7*24*3600*1000).toISOString(),
  max: 20,
});
console.log(events.map(e => e.summary + ' @ ' + e.start.dateTime));

// Create event
await g.calendar.create('primary', {
  summary: 'Team Standup',
  from: '2026-03-16T09:00:00+08:00',
  to:   '2026-03-16T09:30:00+08:00',
  colorId: 7,
});

// Update event
await g.calendar.update('primary', 'EVENT_ID', { summary: 'New Title', colorId: 4 });

// Show colors
const colors = await g.calendar.colors();
console.log(colors.event);
```

## Drive

```js
// Search files
const files = await g.drive.search("name contains 'report'", { max: 10 });
console.log(files.map(f => f.name + ' (' + f.id + ')'));

// Get file metadata
const file = await g.drive.get('FILE_ID');

// Upload a local file (requires Drive write scope, e.g. drive.file)
await g.drive.upload('/code/report.txt', {
  name: 'report.txt',
  mimeType: 'text/plain',
});

// Download a Drive file to the local sandbox
await g.drive.download('FILE_ID', '/code/report_downloaded.txt');
```

## Contacts

```js
const contacts = await g.contacts.list({ max: 20 });
console.log(contacts.map(c => c.name + ' <' + c.email + '>'));
```

## Sheets

```js
// Create a spreadsheet
const sheet = await g.sheets.create('Test Sheet');

// Read values
const data = await g.sheets.get(sheet.spreadsheetId, 'Sheet1!A1:D10');
console.log(data.values);

// Update values
await g.sheets.update(sheet.spreadsheetId, 'Sheet1!A1:B2', [['Name','Score'],['Alice','95']]);

// Append rows
await g.sheets.append(sheet.spreadsheetId, 'Sheet1!A:C', [['x','y','z']]);

// Clear range
await g.sheets.clear(sheet.spreadsheetId, 'Sheet1!A2:Z');

// Metadata
const meta = await g.sheets.metadata(sheet.spreadsheetId);
```

## Docs

```js
// Create a document
const doc = await g.docs.create('Test Doc');

// Insert text (requires Google Docs write scope)
await g.docs.insertText(doc.documentId, 'Hello from Whistant\n');

// Apply arbitrary Docs API batchUpdate requests
await g.docs.batchUpdate(doc.documentId, [
  { insertText: { location: { index: 1 }, text: 'First line\n' } },
]);

// Read document as plain text
const text = await g.docs.cat(doc.documentId);
console.log(text);

// Get document structure
const full = await g.docs.get(doc.documentId);
```

## Troubleshooting

- `access_denied` or "app not verified"
  - add your Gmail address under **OAuth consent screen → Test users**
- redirect or login loop issues
  - make sure the OAuth client type is **iOS**
  - make sure the bundle ID is exactly `com.whisolla.whistant`
- 403 on Drive upload / Docs edit
  - you probably logged in with read-only scopes, run `g.auth.setup(...)` again with broader scopes, then `g.auth.logout()` and `g.auth.login()`
- 404 / API disabled
  - enable the matching API in Google Cloud Console

## Safety — confirm before destructive or bulk actions

Before executing any action that is irreversible or affects many items at once, **always show the user what will be affected and ask for confirmation first**. Do not proceed until the user explicitly says yes.

Examples that require confirmation:
- Deleting emails (any volume, but especially bulk/search-based deletes)
- Trashing or permanently removing Drive files
- Clearing a Sheets range or overwriting data
- Sending emails on the user's behalf
- Any operation that cannot be undone or affects more than a handful of items

Suggested pattern — preview first, then act:
```js
// 1. Show what will be affected
const msgs = await g.gmail.messages('label:promotions older_than:30d', { max: 500 });
console.log(`Found ${msgs.length} messages. IDs: ${msgs.map(m => m.id).join(', ')}`);

// 2. Wait for user confirmation before deleting
// (only proceed after user says "yes, delete them")
```

## Notes

- Top-level `await` is supported — use it directly without wrapping.
- Login opens the in-app browser → user signs in with Google → browser closes automatically when Google redirects back.
- Token is refreshed automatically when it expires (uses refresh token).
- Keychain bridge: `keychain.set/get/delete(key, value)` — used internally, but you can use it for other secrets too.
- `browser.openOAuth(authUrl, redirectPrefix)` — used internally; resolves with the full redirect URL when the browser navigates to any URL starting with `redirectPrefix`.

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/google.js auth status
```
