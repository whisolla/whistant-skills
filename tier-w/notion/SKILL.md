---
name: notion
description: Notion API for creating and managing pages, databases, and blocks. Requires a Notion integration token. Evolved from steipete/notion version 1.0.0 at 2026-05-17.
version: 2.2
keychain: [NOTION_TOKEN]
---

# notion

> **Runtime:** `run /skills/notion/scripts/notion --action search --query "..."` / Code: `console.log(await require('/skills/notion/scripts/notion').search("..."))`

Use the Notion REST API to search pages, query databases, create pages, and append blocks.

## Setup

1. Create an integration at https://notion.so/my-integrations
2. Copy the API key (starts with `ntn_` or `secret_`)
3. Share target pages/databases with your integration (click "..." → "Connect to" → your integration name)
4. Store the token once via keychain:

```js
await keychain.set("NOTION_TOKEN", "ntn_your_key");
console.log(await keychain.get("NOTION_TOKEN"));
// → "ntn_your_key"
```

After this, the skill finds the token automatically — no need to pass it in any command.

| Token source | When it's used |
|-------------|---------------|
| `keychain.get("NOTION_TOKEN")` | Normal Whistant use (set once, persists) |
| `globalThis.NOTION_TOKEN = "..."` | Testing via `/code` if keychain not set |
| `NOTION_TOKEN=...` env var | Node.js CLI local testing |

## Terminal Usage

```bash
# Search pages and databases
run /skills/notion/scripts/notion --action search --query "meeting notes"

# Get a page by ID
run /skills/notion/scripts/notion --action get-page --page-id "uuid-here"

# Query a database
run /skills/notion/scripts/notion --action query-db --database-id "uuid-here"

# Update page properties
run /skills/notion/scripts/notion --action update-page --page-id "uuid-here" --properties '{"Date":{"date":{"start":"2026-05-18"}}}'

# Add a comment
run /skills/notion/scripts/notion --action add-comment --page-id "uuid-here" --comment "Great progress!"

# Create a page in a database
run /skills/notion/scripts/notion --action create-page --parent "database-uuid" --properties '{"Name":{"title":[{"text":{"content":"My Note"}}]}}'

# Create a child page under a parent page
run /skills/notion/scripts/notion --action create-page --parent "page-uuid" --parent-type page --properties '{"Name":{"title":[{"text":{"content":"Child Page"}}]}}'

# Append blocks to a page
run /skills/notion/scripts/notion --action append-block --page-id "uuid-here" --children '[{"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":"Hello!"}}]}}]'

# Get blocks (children) of a page
run /skills/notion/scripts/notion --action get-blocks --page-id "uuid-here"

# Get database metadata
run /skills/notion/scripts/notion --action get-database --database-id "uuid-here"
```

## JS API

```js
var s = require('/skills/notion/scripts/notion');

// Search — returns array of pages and databases
console.log(await s.search("meeting notes"));

// Get a page by ID
console.log(await s.getPage("uuid-here"));

// Query a database — returns all pages
console.log(await s.queryDatabase("uuid-here"));

// Create a page in a database
console.log(await s.createPage({
  parent: { database_id: "uuid-here" },
  properties: { Name: { title: [{ text: { content: "My Note" } }] } }
}));

// Append blocks to a page (or any block)
console.log(await s.appendBlock("uuid-here", [
  { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: "Hello!" } }] } }
]));

// Get blocks (children) of a page
console.log(await s.getBlocks("uuid-here"));

// Get database metadata
console.log(await s.getDatabase("uuid-here"));

// Update page properties (date, tags, status, etc.)
console.log(await s.updatePage("uuid-here", {
  properties: { Date: { date: { start: "2026-05-18" } }, Tags: { multi_select: [{ name: "Urgent" }] } }
}));

// Add a comment to a page (requires comment permission on integration)
console.log(await s.createComment({ page_id: "uuid-here" }, [
  { text: { content: "Nice work!" } }
]));
// ⚠️ Enable "Insert comments" in your integration settings at notion.so/my-integrations
```

## Actions

### search(query, options?)
Searches all pages and databases the integration has access to.

```js
await s.search("term");
await s.search("term", { filter: { property: "object", value: "page" }, sort: { direction: "descending", timestamp: "last_edited_time" } });
```

### getPage(pageId)
Retrieves a page by ID.

```js
await s.getPage("uuid");
```

### queryDatabase(databaseId, options?)
Queries a database with optional filter and sort.

```js
await s.queryDatabase("uuid");
await s.queryDatabase("uuid", { filter: { property: "Status", select: { equals: "Done" } }, sorts: [{ property: "Date", direction: "descending" }] });
```

### createPage({ parent, properties, children? })
Creates a new page in a database or as a child of a page.

```js
await s.createPage({
  parent: { database_id: "uuid" },
  properties: { Name: { title: [{ text: { content: "Title" } }] } }
});
```

### appendBlock(blockId, children)
Appends blocks to an existing page or block.

```js
await s.appendBlock("uuid", [
  { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: "Text" } }] } }
]);
```

### getBlocks(blockId)
Retrieves the children blocks of a page or block.

```js
await s.getBlocks("uuid");
```

### getDatabase(databaseId)
Retrieves database metadata including property schemas.

```js
await s.getDatabase("uuid");
```

### updatePage(pageId, { properties, archived? })
Updates a page's properties (date, tags, status, etc.) or archives it.

```js
await s.updatePage("uuid", {
  properties: { Date: { date: { start: "2026-05-19" } }, Tags: { multi_select: [{ name: "Done" }] } }
});
```

### createComment({ page_id }, richText)
Adds a comment to a page. Requires "Insert comments" permission on the integration.

```js
await s.createComment(
  { page_id: "uuid" },
  [{ text: { content: "Looks good!" } }]
);
```

## Property Type Reference

```js
// title
{title: [{text: {content: 'My Title'}}]}
// rich_text
{rich_text: [{text: {content: 'Some text'}}]}
// select
{select: {name: 'Option A'}}
// multi_select
{multi_select: [{name: 'A'}, {name: 'B'}]}
// date
{date: {start: '2024-01-15', end: '2024-01-16'}}
// checkbox
{checkbox: true}
// number
{number: 42}
// url
{url: 'https://example.com'}
// email
{email: 'user@example.com'}
// relation
{relation: [{id: 'related-page-id'}]}
```

## Notes

- Page/database IDs are UUIDs with or without dashes
- Rate limit: ~3 requests/second average
- `Notion-Version: 2022-06-28` is used
- The API cannot set database view filters — that's UI-only
- Pass `NOTION_TOKEN` via `keychain.set("NOTION_TOKEN", "ntn_...")` before first use (see Setup)

## Local Testing

```bash
export NOTION_TOKEN=ntn_...
cd ~/Projects/whistant/backend/skills/notion
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/notion.js --action search --query "test"
```


