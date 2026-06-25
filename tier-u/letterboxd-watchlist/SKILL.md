---
name: letterboxd-watchlist
version: "1.1"
description: Scrape a public Letterboxd user's watchlist into a list of titles and film URLs without logging in. Use when a user asks to export, scrape, or mirror a Letterboxd watchlist, or to build watch-next queues. Evolved from 0xnuminous/letterboxd-watchlist version 0.1.2 at 2026-05-27.
  Scrape a public Letterboxd user's watchlist into a list of titles and film URLs without logging in. Use when a user asks to export, scrape, or mirror a Letterboxd watchlist, or to build watch-next queues.
---

# Letterboxd Watchlist Scraper

Scrape a **public** Letterboxd watchlist (no auth required). Returns film titles and URLs in summary, CSV, or JSONL format.

---

## Usage

### /cmd (Terminal)

```bash
# Basic (summary format, default)
letterboxd-watchlist --user david

# With format + page limit
letterboxd-watchlist --user david --format csv --max-pages 5

# JSONL output (one JSON per line)
letterboxd-watchlist --user david --format jsonl

# With delay (polite scraping)
letterboxd-watchlist --user david --delay-ms 500
```

### /code (JS require)

```js
var lb = require("/skills/letterboxd-watchlist/scripts/letterboxd-watchlist.js");

// Scrape watchlist (1 page for quick testing)
var r = await lb.scrapeWatchlist("david", { maxPages: 1 });
console.log(r.items.length + " films, page " + r.pages);

// All pages (default: 500 max)
var r = await lb.scrapeWatchlist("david");
console.log(formatSummary(r));

// CSV format
var csv = lb.formatCSV(r.items);
console.log(csv);

// JSONL format
var jsonl = lb.formatJSONL(r.items);
console.log(jsonl);

// Via runFromParams
await lb.runFromParams({ username: "david", format: "csv" });
```

### Exports

| Function | Description |
|----------|-------------|
| `scrapeWatchlist(username, opts?)` | Main scraper — returns `{ok, items, count, pages}` |
| `validateUsername(name)` | Clean and validate a username |
| `extractFilms(html)` | Extract films from page HTML |
| `formatCSV(items)` | Format items as CSV string |
| `formatJSONL(items)` | Format items as JSONL string |
| `formatSummary(result)` | Format a readable summary |
| `handler(event, context)` | Whistant handler |
| `runFromParams(params)` | Unified runner |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxPages` | 500 | Max pages to scrape |
| `delayMs` | 0 | Delay between pages (ms) |
| `timeout` | 30 | Fetch timeout (seconds) |
| `retries` | 1 | Retry count on failure |

### Handler Actions

| event | Description |
|-------|-------------|
| `{username, maxPages?, format?}` | Scrape and return formatted |

---

## How It Works

1. Validate username format (`[A-Za-z0-9_-]+`)
2. Fetch `https://letterboxd.com/<username>/watchlist/page/<n>/`
3. Extract films from `data-item-name` + `data-target-link` attributes
4. Stop when a page has zero film entries
5. Deduplicate by (title, link) key
6. Return in requested format

## Notes

- Letterboxd usernames are case-sensitive, must be exact
- Public profiles only — no login required
- ~28 films per page
- Stop condition: page with zero `data-target-link` entries
- Default is polite (no delay between pages in JS runtime)
- HTML parsing relies on `data-item-name` and `data-target-link` attributes (stable React data attributes, unlikely to break)

## Scope Boundary

- This skill **only** scrapes public watchlists
- Does not handle private profiles, ratings, reviews, or lists
- Output is titles + URLs — no additional film metadata

---

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/letterboxd-watchlist.js --user david --max-pages 1
rm scripts/package.json
```
