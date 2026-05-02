---
name: clawhub
description: Search, install, and self-improve on community skills from a pre-vetted catalog of 735 OpenClaw skills compatible with Whistant's JS runtime. Use when the user wants to find or install a skill by topic, or to review skill ecosystem health.
version: 1.1
---

# ClaWHub Skill Catalog

A JS module for searching, installing, and learning from community skills screened for Whistant JS runtime compatibility.

## Load & Usage

Top-level `await` is supported — use it directly.

```js
const clawhub = require('/skills/clawhub/scripts/clawhub.js');

// Discovery
const results = await clawhub.search('keyword');  // returns [] if no match
console.log(JSON.stringify(clawhub.list(20), null, 2));

// Install + run
await clawhub.install('creator/slug');       // community skill from GitHub
await clawhub.install('youtube-watcher');     // local/compatible skill from backend
const mod = await clawhub.run('creator/slug', { key: 'value' });  // auto-resolves script path

// Uninstall
clawhub.uninstall('creator/slug');

// Usage tracking — always call BEFORE clearTask
clawhub.logUsage('weather', 'success', 'wttr.in worked for Tokyo');
clawhub.logUsage('weather', 'fail', 'wttr.in 404 for zip code');
// If search returned nothing useful:
clawhub.logUnmetSearch('stock price feed');  // populates status().unmetSearches

// Usage summary — shows per-skill success rates; sub-slugs (e.g. weather/wttr.in) get a providers breakdown
console.log(JSON.stringify(clawhub.usageSummary(), null, 2));

// Annotations — persist learned knowledge, even on success
clawhub.annotate('weather', 'require path: /skills/weather/scripts/weather.js');
console.log(clawhub.getNotes('weather'));

// Self-diagnostic — ecosystem health overview
console.log(JSON.stringify(clawhub.status(), null, 2));
```

## API reference

| Method | Description |
|--------|-------------|
| `search(query)` | Semantic + keyword blended search across 735 catalog skills. Returns `[{slug, downloads, desc, status, score}]`. Statuses: `"compatible_installed"` (5), `"compatible"` (60), `"not_compatible"` (45), `"may_work_directly"` (625+). |
| `install(skillId)` | Install a skill. Accepts `"creator/slug"` (community, fetched from GitHub) or plain `"slug"` (local/compatible, fetched from backend with full file manifest). Skips `"not_compatible"`. |
| `run(slug, args?)` | Find and require a skill's main script automatically. Checks SKILL.md `main:` frontmatter, then tries `scripts/<name>.js`. Throws a clear error if the skill is instruction-only (no script). |
| `list(n?)` | Top-N catalog entries by downloads. Returns `[{slug, downloads, desc, status}]` with status for each. |
| `uninstall(creator/slug)` | Remove skill directory. |
| `logUsage(slug, outcome, note?)` | Record `"success"` / `"fail"` / `"partial"` for a skill use. Call before `clearTask`. |
| `logUnmetSearch(query)` | Log a search that found nothing useful. Populates `status().unmetSearches`. |
| `annotate(slug, note)` | Append a learned note to `_notes.md`. Call for gotchas, correct paths, arg formats — even on success. |
| `getNotes(slug)` | Read `_notes.md` for a skill. |
| `usageSummary(slug?)` | Success rates per slug. Sub-slugs (e.g. `weather/wttr.in`) include a `providers` breakdown sorted by successRate. |
| `status()` | Overview: installed skills, recently used, never used, recent failures, unmet searches. |

## Skill Screening & Status Categories

All 735 indexed skills (plus 40k+ excluded) fall into four categories:

### ✅ **Compatible Installed** (5 skills) — Pre-installed, use immediately
- **Status Badge:** `compatible_installed`
- **Screening:** Deep screened, ready-to-use defaults
- **Compatibility:** JS-only, fully tested, always available
- **Skills:** `clawhub`, `skill-creator`, `weather`, `google`, `microsoft`
- **Action:** Use immediately, no download needed

### ✅ **Compatible** (60 skills) — Backend-available, search & install
- **Status Badge:** `compatible`
- **Screening:** Deep screened, JS-compatible (in backend/skills/)
- **Compatibility:** Whistant-compatible, fully tested
- **Examples:** `github`, `gmail`, `slack`, `notion`, `stock-analysis`, `youtube-watcher`
- **Action:** Search in catalog, install via `clawhub.install('skill-name')` — fetches full file manifest from backend
- **Note:** Available on backend but not pre-installed to save space

### 🟡 **May Work Directly** (~650 skills) — Download & test
- **Status Badge:** `may_work_directly`
- **Screening:** Simple screening (JS-only code found)
- **Compatibility:** May work with Whistant JS runtime (needs testing)
- **Examples:** `telegram`, `seo`, `conventional-commits`, `nextjs-expert`
- **Action:** Download via `clawhub.install()` and test before relying
- **Note:** Passed automated JS-only filtering but require validation

### ❌ **Not Compatible** (46 skills) — Don't use
- **Status Badge:** `not_compatible`
- **Screening:** Deep screened, determined incompatible
- **Blocker:** Requires Python, shell scripts, binaries, Node.js packages
- **Examples:** `playwright`, `obsidian`, `openai-whisper`, `pdf`, `word-docx`
- **Why blocked:** Runtime requirements beyond Whistant's JS sandbox
  - `playwright` — requires Node.js npm package
  - `obsidian` — requires Obsidian app runtime
  - `openai-whisper` — requires Python CLI
  - `pdf`, `word-docx` — require native OS binaries
  - `web-search-plus` — multiple external dependencies
- **Action:** ❌ Do not attempt to install

### ⛔ **Not Indexed** (40k+ skills) — Can't use
- **Source:** OpenClaw GitHub clawhub repo
- **Reason:** Detected non-JS code (Python, shell, Go, Rust, Node.js, etc.)
- **Status:** Not in catalog.js (excluded during indexing)
- **Action:** ❌ Cannot use with Whistant

### Whistant JS Runtime Constraints
- ❌ No shell (`exec`, `spawn`, `child_process`)
- ❌ No Python or Node subprocess
- ❌ No npm package installation at runtime
- ❌ No background processes, cron, or daemons
- ❌ No paths outside sandbox (`~/.config`, `/usr/local/bin`, `/var/`, etc.)
- ✅ Pure JavaScript only
- ✅ `fetch()` for HTTP/API calls
- ✅ `require()` for bundled modules
- ✅ App-local storage (`/skills/` paths, Documents)

### Screening Methodology
**Deep Screening (100 popular skills):**
- Manual code review: Python code? Shell scripts? npm dependencies?
- Result: 66 converted to JS (5 default pre-installed + 61 available) → `compatible_installed` or `compatible`
- OR 46 rejected for non-JS runtime → `not_compatible`

**Simple Screening (~650 skills):**
- Automated scan: if Python/shell/Node.js code found → exclude from catalog
- If only JS found → add to catalog as `may_work_directly`
- These are candidates but need active testing to confirm

**Excluded (~40k+ skills):**
- Detected non-JS code during OpenClaw indexing scan
- Not included in catalog.js

### When installing a skill
1. Check status from `clawhub.search()` or `clawhub.list()`
   - `"compatible_installed"` → already available, use immediately
   - `"compatible"` → install via `clawhub.install('skill-name')` (fetches from backend)
   - `"may_work_directly"` → install via `clawhub.install('creator/slug')` and test (may need adaptation)
   - `"not_compatible"` → skip it (known incompatible)
2. For `"may_work_directly"` skills: scan SKILL.md for `exec`, `shell`, `python`, `subprocess` references
3. If found, evaluate whether the logic can be rewritten in pure JS before running

## Search mechanism

Blends semantic + keyword + popularity via `nlEmbed.semanticRank()` (Apple NLEmbedding on-device, 512-dim sentence vectors). Score = semantic × 0.4 + keyword × 0.4 + popularity × 0.2. Keyword matching ensures exact slug/description matches always surface. Falls back to keyword-only (70/30 with popularity) when the embed bridge is unavailable.

## Status Reference

| Status | Count | Screening | Location | Action |
|--------|-------|-----------|----------|--------|
| `compatible_installed` | 5 | Deep | Pre-installed | Use immediately |
| `compatible` | 60 | Deep | backend/skills/ | `install('slug')` from backend |
| `not_compatible` | 45 | Deep | whistant_na/ | ❌ Don't use |
| `may_work_directly` | 625+ | Simple (JS-only) | catalog.js | `install('creator/slug')` & test |
| (not indexed) | 40k+ | Rejected | OpenClaw repo | ❌ Can't use |

## Self-improvement loop

1. **Use a skill** → `run(slug)` auto-resolves the script; no need to manually find paths
2. **Log outcome** → `logUsage(slug, outcome, note)` before every `clearTask`
3. **Log gaps** → `logUnmetSearch(query)` when search returns nothing useful
4. **Annotate** → `annotate(slug, note)` for anything learned, including on success (correct path, provider quirks, arg format)
5. **Review** → `status()` and `usageSummary()` to see failures, unused skills, and unmet gaps

Usage stats appear in `skills.header` at session start — `{ total, lastUsed, successRate }` per skill.
