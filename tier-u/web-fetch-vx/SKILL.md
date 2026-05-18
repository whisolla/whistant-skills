---
name: web-fetch-vx
description: Generic web content fetcher. Extract clean content from any public URL with configurable output format. Triggers on: (1) User asks to fetch a URL, (2) User asks "抓取网页", "get the content of", "extract from URL"
version: 1.3
---

# Web Fetch vX

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.

A generic fetch wrapper that retrieves any public URL and returns its content in a configurable format.

## JS API

```js
const s = require('/skills/web-fetch-vx/scripts/web-fetch-vx.js');
// Fetch as markdown (default)
console.log(await s.runFromParams({url: 'https://example.com'}));
// Fetch as plain text
console.log(await s.runFromParams({url: 'https://example.com', extractMode: 'text'}));
// Fetch as JSON
console.log(await s.runFromParams({url: 'https://example.com', extractMode: 'json'}));
// With max chars
console.log(await s.runFromParams({url: 'https://example.com', maxChars: 2000, includeMetadata: true}));
```

## Features

- **extractMode**: `markdown` (default), `text`, or `json`
- **maxChars**: truncate content (default 8000)
- **includeMetadata**: include title/author/description header (default true)
- Cleans HTML: removes scripts, styles, nav, footer, sidebar
- Decodes HTML entities

## /cmd Usage

```bash
# Default: markdown, 8000 chars, with metadata
run /skills/web-fetch-vx/scripts/web-fetch-vx.js https://example.com

# Plain text, no metadata
run /skills/web-fetch-vx/scripts/web-fetch-vx.js https://example.com --mode text --no-metadata

# JSON output with 4000 char limit
run /skills/web-fetch-vx/scripts/web-fetch-vx.js https://example.com --mode json --max-chars 4000

# Markdown with explicit --url flag
run /skills/web-fetch-vx/scripts/web-fetch-vx.js --url "https://news.ycombinator.com" --mode markdown
```

## Notes

- Works on public HTTP/HTTPS URLs only
- Complex SPAs (React/Vue apps) may need the browser tool instead
- Rate limit: ~10-20 requests/min per domain recommended
- CoinGecko has 10-30 calls/min rate limit on free tier

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/web-fetch-vx.js https://example.com
```
