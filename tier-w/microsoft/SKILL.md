---
name: microsoft
description: Microsoft 365 for the iPhone JS terminal via Microsoft Graph. Outlook Mail, Calendar, OneDrive, Contacts, and Office files (Excel, Word, PowerPoint — cloud via Graph + local via native bridge). Uses built-in OAuth2 PKCE.
version: 2.3
---

# microsoft

Microsoft 365 skill for the iPhone JS terminal.

Uses the local runtime bridges plus Microsoft Graph:
- `fetch()` for Graph API calls
- `browser.openOAuth()` for sign-in
- `keychain` for token storage
- Info.plist-injected `MS_CLIENT_ID` and callback scheme

Covers: **Mail** · **Calendar** · **OneDrive** · **Contacts** · **Office files**

## Auth

```js
const m = require('/skills/microsoft/scripts/microsoft');
await m.auth.status();   // check first — skip login if already logged in
await m.auth.login();
await m.auth.logout();
```

Notes:
- Always call `m.auth.status()` before `m.auth.login()` to avoid opening the browser unnecessarily.
- Sign-in uses OAuth2 PKCE in the in-app browser.
- Tokens are stored in Keychain.
- Access tokens auto-refresh when possible.
- If the login browser is closed before completing sign-in, `login()` throws within 2 minutes. Call `login()` again to retry.

## Mail

```js
const m = require('/skills/microsoft/scripts/microsoft');

const msgs = await m.mail.messages({ max: 10 });
const sent = await m.mail.messages({ folder: 'sentitems', max: 5 });
const unread = await m.mail.messages({ filter: 'isRead eq false', max: 20 });
const results = await m.mail.search('project update', { max: 10 });

const msg = await m.mail.read('MESSAGE_ID');

await m.mail.send({ to: 'a@b.com', subject: 'Hi', body: 'Hello' });
await m.mail.reply('MESSAGE_ID', { body: 'Thanks!' });
await m.mail.markRead('MESSAGE_ID', true);
await m.mail.delete('MESSAGE_ID');

const atts = await m.mail.attachments('MESSAGE_ID');
await m.mail.downloadAttachment('MESSAGE_ID', 'ATTACHMENT_ID', 'Documents/invoice.pdf');
```

## Calendar

```js
const m = require('/skills/microsoft/scripts/microsoft');

const events = await m.calendar.events({
  from: new Date().toISOString(),
  to: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  max: 20,
});
const cals = await m.calendar.list();

await m.calendar.create({
  subject: 'Standup',
  from: '2026-03-16T09:00:00',
  to: '2026-03-16T09:30:00',
  timeZone: 'UTC',
  location: 'Zoom',
});
await m.calendar.update('EVENT_ID', { subject: 'New Title' });
await m.calendar.delete('EVENT_ID');
```

## OneDrive

```js
const m = require('/skills/microsoft/scripts/microsoft');

const items = await m.onedrive.list();
const files = await m.onedrive.search('report', { max: 10 });
const item = await m.onedrive.get('ITEM_ID');
const url = await m.onedrive.downloadUrl('ITEM_ID');

// Upload a local file to OneDrive root
const result = await m.onedrive.upload('/code/report.pdf');

// Upload with options: custom remote path, filename, content type, or target folder
await m.onedrive.upload('/code/report.pdf', { remotePath: 'Work/Q1/report.pdf' });
await m.onedrive.upload('/code/data.xlsx', {
  folderId: 'FOLDER_ITEM_ID',
  name: 'renamed.xlsx',
  contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});
```

Upload uses `bodyFilePath` so binary files (docx, xlsx, pdf, images) transfer correctly.
Content type defaults to `application/octet-stream` if omitted.

## Contacts

```js
const m = require('/skills/microsoft/scripts/microsoft');
const contacts = await m.contacts.list({ max: 20 });
```

## Office Files

```js
const o = require('/skills/microsoft/scripts/office');
const files = await o.findFile('budget', { max: 10 });
```

### Excel

```js
const o = require('/skills/microsoft/scripts/office');

const info = await o.excel.info('ITEM_ID');
const data = await o.excel.read('ITEM_ID', { sheet: 'Sheet1', offset: 0, limit: 50 });
const r = await o.excel.range('ITEM_ID', 'Sheet1!A1:D10');
await o.excel.update('ITEM_ID', 'Sheet1!B2', [['newValue']]);
```

### Word

```js
const o = require('/skills/microsoft/scripts/office');

const info = await o.word.info('ITEM_ID');
const doc = await o.word.read('ITEM_ID', { offset: 0, limit: 30 });
const hits = await o.word.search('ITEM_ID', 'introduction');
await o.word.replace('ITEM_ID', 'Old title', 'New title');
```

### PowerPoint

```js
const o = require('/skills/microsoft/scripts/office');

const info = await o.powerpoint.info('ITEM_ID');
const ppt = await o.powerpoint.read('ITEM_ID', { offset: 0, limit: 5 });
const hits = await o.powerpoint.search('ITEM_ID', 'roadmap');
await o.powerpoint.replace('ITEM_ID', 'Q1', 'Q2');
```

### Local Office files

Local operations work **offline** — no Microsoft sign-in needed.

Two modes: **native bridge** (sync, instant, read-only) and **pure JS** (fflate-first OOXML parsing/editing for DOCX, PPTX, and lightweight XLSX text replacement).

#### Native bridge (sync, read-only — no await needed)

```js
const o = require('/skills/microsoft/scripts/office');

// Word — sync read via __office_openFile
const doc = o.local.word.nativeRead('Documents/report.docx');
// → { type, name, paragraphs, text, wordCount, totalParagraphs, nonEmptyParagraphs }

// PowerPoint — sync read
const deck = o.local.powerpoint.nativeRead('Documents/deck.pptx');
// → { type, name, slides: [{ index, texts, textCount }], slideCount }

// Excel — all local.excel methods use native bridge (sync)
const info = o.local.excel.info('Documents/data.xlsx');
// → { sheetCount, sheets: [{ name, rowCount, colCount }] }

const data = o.local.excel.read('Documents/data.xlsx', { sheet: 0, offset: 0, limit: 50 });
// → { sheet, totalRows, totalCols, offset, limit, rows }

const names = o.local.excel.sheetNames('Documents/data.xlsx');
const rows  = o.local.excel.sheetData('Documents/data.xlsx', 0);
const hits  = o.local.excel.search('Documents/data.xlsx', 'revenue');
// → [{ sheet, row, col, value }]
```

#### Pure JS async mode

```js
const o = require('/skills/microsoft/scripts/office');

// Word — async read/search/HTML/patch via fflate + XML parsing
await o.local.word.info('Documents/report.docx');
await o.local.word.read('Documents/report.docx', { offset: 0, limit: 50 });
await o.local.word.search('Documents/report.docx', 'keyword');
await o.local.word.toHtml('Documents/report.docx');
await o.local.word.patch('Documents/report.docx', [
  { op: 'replaceText', search: 'Old title', replace: 'New title' },
]);

// PowerPoint — async read, search, and replace via fflate
await o.local.powerpoint.info('Documents/deck.pptx');
await o.local.powerpoint.read('Documents/deck.pptx', { offset: 0, limit: 5 });
await o.local.powerpoint.search('Documents/deck.pptx', 'roadmap');
await o.local.powerpoint.replace('Documents/deck.pptx', 'Q1', 'Q2');

// Excel — async plain-text replace in OOXML parts via fflate
await o.local.excel.replace('Documents/data.xlsx', 'Old label', 'New label');

// Optional skill-local AUROCHS helpers for structured local patching
await o.local.aurochs.replaceDocx('Documents/report.docx', 'Old title', 'New title');
await o.local.aurochs.replacePptx('Documents/deck.pptx', 'Q1', 'Q2', { slides: [1] });
await o.local.aurochs.patchWorkbook('Documents/data.xlsx', [
  { sheetName: 'Record', cells: [{ col: 'B', row: 3, value: 'New label' }], rows: [], cols: [], mergeCells: [] }
]);
```

## Notes

- Authenticate once with `await m.auth.login()` before Graph calls.
- `microsoft.js` handles token refresh for you.
- Attachments use the local file bridge helpers.
- `office.js` builds on top of `microsoft.js` auth.
- Local operations do NOT require auth — they use the native bridge or pure JS file parsing.
- Native bridge methods are **sync** (no `await`). Pure JS methods are **async** (need `await`).
- `office.js` is now **fflate-first** for OOXML ZIP/container work across DOCX, PPTX, and the current lightweight XLSX text-replace path.
- `/skills/microsoft/scripts/aurochs-runtime.js` is a **skill-local bundled JS runtime** for optional structured local patching, so the microsoft skill can ship it without any frontend runtime changes.
- Local Excel editing is currently limited to **plain text string replacement** in OOXML XML parts, not full formula/style/typed-cell editing.
- Prefer **pure JS, self-contained, JSCore-safe** packages only. Do **not** rely on native binaries, `.node` addons, WASM-only packages, or multi-file binary payloads for device delivery.
- The iPhone app should sync **JS/text assets only** for runtime package delivery, not binary package artifacts.
- The current AUROCHS XLSX patch path uses the workbook parser's own sheet names / row indices. For the current sample workbook, the visible second data row maps to `sheetName: 'Record'` and `row: 3`.
- Use native bridge for fast reads, or pure JS methods when you want a backend-deliverable path with less native coupling.
- Use `scripts/test.js` for the device-side smoke test workflow.
