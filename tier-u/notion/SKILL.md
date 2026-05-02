---
name: notion
description: Notion API for creating and managing pages, databases, and blocks. Requires a Notion integration token.
version: 2.0
---
# notion

Use the Notion REST API via `fetch()` to create, read, update pages, databases, and blocks.

## Setup

1. Create an integration at https://notion.so/my-integrations
2. Copy the API key (starts with `ntn_` or `secret_`)
3. Share target pages/databases with your integration (click "..." → "Connect to" → your integration name)

Store the key in memory or pass it directly:
```js
const NOTION_KEY = 'ntn_your_key_here'; // replace with real key
const NOTION_VERSION = '2022-06-28';
const headers = {
  'Authorization': `Bearer ${NOTION_KEY}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json',
};
```

## Search pages and databases

```js
const res = await fetch('https://api.notion.com/v1/search', {
  method: 'POST',
  headers,
  body: JSON.stringify({ query: 'page title' }),
});
const data = await res.json();
console.log(data.results);
```

## Get a page

```js
const pageId = 'your-page-id'; // UUID with or without dashes
const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers });
const page = await res.json();
console.log(page.properties);
```

## Get page content (blocks)

```js
const pageId = 'your-page-id';
const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, { headers });
const data = await res.json();
data.results.forEach(b => console.log(b.type, b[b.type]));
```

## Create a page in a database

```js
const res = await fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    parent: { database_id: 'your-database-id' },
    properties: {
      Name: { title: [{ text: { content: 'New Item' } }] },
      Status: { select: { name: 'Todo' } },
    },
  }),
});
const page = await res.json();
console.log('Created page:', page.id);
```

## Query a database

```js
const dbId = 'your-database-id';
const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    filter: { property: 'Status', select: { equals: 'Active' } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  }),
});
const data = await res.json();
console.log(data.results.length, 'results');
```

## Update page properties

```js
const pageId = 'your-page-id';
const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    properties: { Status: { select: { name: 'Done' } } },
  }),
});
const updated = await res.json();
console.log('Updated:', updated.id);
```

## Add blocks to a page

```js
const pageId = 'your-page-id';
const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: 'Hello from Whistant!' } }] },
      },
    ],
  }),
});
const data = await res.json();
console.log('Appended blocks:', data.results.length);
```

## Create a database

```js
const res = await fetch('https://api.notion.com/v1/databases', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    parent: { page_id: 'parent-page-id' },
    title: [{ text: { content: 'My Database' } }],
    properties: {
      Name: { title: {} },
      Status: { select: { options: [{ name: 'Todo' }, { name: 'Done' }] } },
      Date: { date: {} },
    },
  }),
});
const db = await res.json();
console.log('Created DB:', db.id);
```

## Property type reference

```js
// title
const titleProp = { title: [{ text: { content: 'My Title' } }] };
// rich_text
const textProp = { rich_text: [{ text: { content: 'Some text' } }] };
// select
const selectProp = { select: { name: 'Option A' } };
// multi_select
const multiProp = { multi_select: [{ name: 'A' }, { name: 'B' }] };
// date
const dateProp = { date: { start: '2024-01-15', end: '2024-01-16' } };
// checkbox
const checkProp = { checkbox: true };
// number
const numProp = { number: 42 };
// url
const urlProp = { url: 'https://example.com' };
// email
const emailProp = { email: 'user@example.com' };
// relation
const relProp = { relation: [{ id: 'related-page-id' }] };
```

## Notes

- Page/database IDs are UUIDs (with or without dashes)
- Rate limit: ~3 requests/second average
- `Notion-Version: 2022-06-28` is the stable version
- The API cannot set database view filters — that's UI-only
