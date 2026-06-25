---
name: arxiv
description: Search, download, and summarize academic papers from arXiv. Built for AI/ML researchers. Evolved from ractorrr/arxiv version 1.0.4 at 2026-05-15.
version: 1.3
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.
>
> **Two ways to call:**
> - JS: `await arxiv.runFromParams({input:"transformer architecture"})` or `await arxiv.search("LLM security")`
> - Terminal:
>   `run /skills/arxiv/scripts/arxiv.js --search "transformer architecture"`
>   `run /skills/arxiv/scripts/arxiv.js --id 2103.14030`
>   `run /skills/arxiv/scripts/arxiv.js --pdf 2103.14030`
>   `run /skills/arxiv/scripts/arxiv.js --max 10 "prompt injection"`
> ⚠️ **Rate limiting:** arXiv caps search queries (~3-4/min). If you hit 429, wait 30-60s and retry. The `--id` and `--pdf` endpoints are not rate-limited.

# arXiv Research Assistant

Search, fetch, and analyze academic papers from arXiv.org directly from your AI assistant.

## Description

This skill enables Claude to search arXiv for academic papers, fetch paper details, download PDFs, and help you stay updated with the latest research in any field.

**Perfect for:**
- Researchers staying current with literature
- Students doing literature reviews  
- Content creators finding authoritative sources
- Interview prep with cutting-edge knowledge
- Anyone building expertise in a technical field

## Usage

### Search Papers
```
"Search arXiv for LLM security attacks"
"Find recent papers on prompt injection"
"arXiv papers about transformer architecture from 2024"
```

### Get Paper Details
```
"Get arXiv paper 2401.12345"
"Summarize this arXiv paper: [URL]"
```

### Download Papers
```
"Download the PDF for arXiv 2401.12345"
```

## JS API

```js
// Search
await arxiv.search("transformer architecture", 5);

// By ID (comma-separated)
await arxiv.getById("2301.00001,2301.00002");

// Download PDF URL
await arxiv.downloadPdf("2301.00001");

// Via runFromParams
await arxiv.runFromParams({input: "LLM security attacks", maxResults: 10});
await arxiv.runFromParams({action: "getById", idList: "2301.00001"});
await arxiv.runFromParams({action: "downloadPdf", input: "2301.00001"});
```

## Configuration

No API key required - arXiv API is free and open.

## Author

Created by [Ractor](https://github.com/Ractorrr)

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/arxiv.js --search "transformer" --max 3
```
