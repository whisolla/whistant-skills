---
name: url-preview
description: Extract and display URL previews with title, description, and favicon. Use when user shares any HTTP/HTTPS link and wants to see what the page is about without visiting it. Triggers on: (1) User sends a URL/link, (2) User asks "这个链接是什么", "看看这个网页", "what's this link"
version: 1.1
---

# URL Preview Skill

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.

When a user shares a URL, automatically extract and display a preview card.

## JS API

```js
const s = require('/skills/url-preview/scripts/url-preview.js');
// Preview a URL
console.log(await s.previewUrl('https://github.com/openclaw/openclaw'));
// Or via runFromParams
console.log(await s.runFromParams({input: 'https://example.com'}));
```

## Features

- **Title extraction**: og:title → twitter:title → `<title>` tag
- **Description extraction**: og:description → twitter:description → meta description
- **Image extraction**: og:image
- **Favicon**: link[rel=icon] or Google Favicons fallback
- **Site name**: og:site_name

## Output Format

```
🔗 [Page Title](URL)
📝 [description...]
🌐 [favicon URL]
🌐 [site name] ([domain])
```

## Example

User sends: `https://github.com/openclaw/openclaw`

Output:
```
🔗 OpenClaw/OpenClaw
📝 An open-source AI assistant platform for building agentic workflows...
🌐 https://www.google.com/s2/favicons?domain=github.com&sz=64
🌐 github.com
```

## /cmd Usage

```bash
# Basic URL preview
run /skills/url-preview/scripts/url-preview.js https://github.com/openclaw/openclaw

# With explicit --input flag
run /skills/url-preview/scripts/url-preview.js --input "https://news.ycombinator.com"
```

## Notes

- Only works on public HTTP/HTTPS URLs
- Respects rate limits — don't extract more than 5 URLs per minute
- Description truncated to 300 characters
- Favicon uses Google Favicons API as fallback when no `<link rel=icon>` is found

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/url-preview.js https://github.com/openclaw/openclaw
```
