---
name: guitar-tab-finder
version: "1.1"
keychain: [BRAVE_SEARCH_API_KEY]
description: Find guitar tabs/sheet sources for a song from a title or YouTube link. Search via Brave API, rank by source reputation, and produce a clean practice note. Use when a user asks to locate tabs/chords/fingerstyle arrangements and optionally create/update an Obsidian note (or generic markdown/json output) for a learning queue. Evolved from guitar-tab-finder/guitar-tab-finder version 1.0.1 at 2026-05-27.
---

# Guitar Tab Finder

Use this skill to turn a song link/title into a usable practice packet:
1. identify the song/arrangement,
2. search for tabs via Brave Search API,
3. rank results by source reputation (Ultimate Guitar > Songsterr > community sites),
4. produce structured output for the AI to format.

The CODE handles search + ranking. The AI handles final formatting and presentation.

---

## Usage

### /cmd (Terminal)

```bash
# By song + artist
guitar-tab-finder --song "Blackbird" --artist "Beatles"

# With arrangement filter
guitar-tab-finder --song "Blackbird" --artist "Beatles" --arrangement fingerstyle

# From YouTube URL
guitar-tab-finder --url "https://www.youtube.com/watch?v=bApQqay1iJA"

# Limit results
guitar-tab-finder --song "Blackbird" --artist "Beatles" --count 5
```

### /code (JS require)

```js
var gtf = require("/skills/guitar-tab-finder/scripts/guitar-tab-finder.js");

// Search by song + artist
var r = await gtf.findTabs({ song: "Blackbird", artist: "Beatles" });
console.log(r.totalFound + " results, top: " + r.tabs[0].source);

// Search by "Artist - Song" string
var r = await gtf.findTabs("Beatles - Blackbird", { count: 5 });

// From YouTube URL (auto-resolves title)
var r = await gtf.findTabs("https://www.youtube.com/watch?v=bApQqay1iJA");

// With arrangement
var r = await gtf.findTabs({ song: "Blackbird", artist: "Beatles" }, { arrangement: "fingerstyle" });

// Format as practice note
console.log(gtf.formatPracticeNote(r));

// Via handler
var r = await gtf.handler({ song: "Blackbird", artist: "Beatles", count: 5 });
console.log(r.formatted);
```

### Exports

| Function | Description |
|----------|-------------|
| `findTabs(input, opts?)` | Main: search + rank guitar tabs |
| `searchBrave(query, count?)` | Raw Brave Search API call |
| `resolveYouTube(url)` | Resolve YouTube URL → song title |
| `assessSource(url)` | Rate source reputation (high/medium/low) |
| `formatPracticeNote(result)` | Format as markdown practice note |
| `handler(event, context)` | Whistant handler |
| `runFromParams(params)` | Unified runner |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `count` | 10 | Max results to return |
| `arrangement` | `""` | Filter: "fingerstyle", "drop d", etc. |

### Source Reputation

| Confidence | Sources |
|------------|---------|
| **HIGH** | ultimate-guitar.com, songsterr.com, guitartabs.cc |
| **MEDIUM** | musescore.com, e-chords.com, chordify.net, jamplay.com, 911tabs.com |
| **LOW** | Everything else (community blogs, personal sites) |

---

## Workflow

1. **Parse input** — Accept song title, artist, or YouTube URL. If URL, resolve via oEmbed.
2. **Search tabs** — Brave Search API with multiple query variants (with/without arrangement, guitar tab + chords).
3. **Rank and filter** — Sort by source reputation (high → medium → low), deduplicate, flag paywalled.
4. **Build practice note** — Structured markdown with status, song, artist, arrangement, tuning, tab links, next step.

---

## Consent + Filesystem Guardrails

- Default: **web lookup + text output only** (markdown).
- Perform local file/vault actions **only when explicitly requested**.
- Before writing files, require user-provided target path.
- Do not read/write outside the approved target path.

## Obsidian Mode Rules (optional)

Use only when user asks for Obsidian output:
- Do not duplicate title in body
- One note per song under user-specified folder
- Link PDFs with `[[file.pdf]]` or embed with `![[file.pdf]]`
- Deduplicate by normalized song+artist name

## Quality Bar

- Prefer accuracy over volume
- Be explicit when uncertain
- Do not claim tabs are free if not confirmed
- Keep notes concise and practical (ready for immediate practice)

---

## API Key

Requires Brave Search API key. Store via one of:
```js
// In Whistant app:
keychain.set("BRAVE_SEARCH_API_KEY", "BSA...");

// For local testing:
export BRAVE_SEARCH_API_KEY="BSA..."
```

---

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
BRAVE_SEARCH_API_KEY="BSA..." node scripts/guitar-tab-finder.js --song "Blackbird" --artist "Beatles"
rm scripts/package.json
```
