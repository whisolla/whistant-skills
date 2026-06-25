---
name: summarize
description: Summarize any URL, text content, or document — uses fetch() to get content then LLM to summarize. Evolved from steipete/summarize version 1.0 at 2026-05-28.
version: 1.0
---

# Summarize

Summarize web pages, articles, or documents using the agent's built-in LLM.

## Workflow

1. **Fetch the content** from URL or file
2. **Compress/extract** the meaningful text (strip HTML, boilerplate)
3. **Send to LLM** with a summarization prompt

---

## Fetch URL Content

```js
// Fetch a web page (returns HTML)
const res = await fetch('https://example.com/article');
const html = await res.text();

// Fetch as JSON (APIs, structured content)
const res2 = await fetch('https://api.github.com/repos/facebook/react');
const json = await res2.json();
```

For **PDF files**, use the built-in file reading tool — Whistant can read PDF via the `readFile` tool (supports `txt`, `md`, `html`, `pdf`, `csv`).

---

## Simple HTML Text Extraction (no library needed)

```js
// Strip HTML tags manually for basic extraction
function extractText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000); // keep first 8k chars for LLM
}

const res = await fetch(url);
const html = await res.text();
const text = extractText(html);
```

For **better extraction** (article content detection), use `pkg add` to install a pure-JS library:

```js
// In terminal: pkg add parse5
// Then in your script:
const { parseFragment } = require('parse5');
// Or use a simpler approach with linkedom if available
```

---

## Summarization Prompts (send to LLM)

### Short summary (3-5 sentences)
```
Summarize the following text in 3-5 sentences. Focus on the main point and key takeaways.

[TEXT]
```

### Medium summary (1 paragraph)
```
Give a comprehensive but concise summary of this text. Include the main thesis, key supporting points, and any important conclusions.

[TEXT]
```

### Key bullet points
```
Extract the 5-7 most important points from this text. Format as a bullet list.

[TEXT]
```

### Extract action items
```
From this text, extract all action items, deadlines, and commitments. Format as:
• [Action] — [Owner if mentioned] — [Deadline if mentioned]

[TEXT]
```

---

## Length Presets

| Flag | Target | Use when |
|------|--------|----------|
| `--length short` | 3 sentences | headlines, quick updates |
| `--length medium` | 1 paragraph | articles, emails |
| `--length long` | 2-3 paragraphs | reports, research |
| `--length xl` | full summary | documents, papers |
| `--extract-only` | raw extracted text | user wants raw content |

---

## YouTube Videos

YouTube transcripts are accessible via Invidious instances (no API key):

```js
// Find the video ID from the URL
// https://www.youtube.com/watch?v=dQw4w9WgXcQ → ID: dQw4w9WgXcQ
// https://youtu.be/ID → ID: ID

const videoId = 'dQw4w9WgXcQ';
const res = await fetch(`https://yewtu.be/api/v1/videos/${videoId}`);
// yewtu.be is a public Invidious instance (no API key needed)
// Alternative: `https://invidious.projectsegfau.lt/api/v1/videos/${videoId}`
const json = await res.json();
const transcript = json.subtitles?.[0]?.baseUrl;
// Or use the captions directly:
const captionRes = await fetch(json.subtitles?.[0]?.baseUrl);
const captionText = await captionRes.text();
```

Then send the transcript text to the LLM with a summarization prompt.

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Fetch + extract article | `fetch(url)` → strip HTML → LLM |
| Fetch JSON API | `fetch(url)` → `res.json()` → LLM |
| Read local file | `readFile` tool (supports PDF, MD, TXT, CSV, HTML) |
| YouTube transcript | Fetch from Invidious public instance |
| Extract key points | Send to LLM with bullet-point prompt |
