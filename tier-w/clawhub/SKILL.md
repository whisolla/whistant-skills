---
name: clawhub
description: Main skill-management tool for listing installed skills, searching the catalog, installing skills, and uninstalling skills. Primary use is direct terminal commands like `run /skills/clawhub/scripts/clawhub.js list` or `run /skills/clawhub/scripts/clawhub.js search discord`; code mode via `require(...)` is secondary. Evolved from steipete/clawhub version 1.0 at 2026-05-15.
version: 3.34
---

# ClaWHub Skill Manager

A JS skill-management tool for listing installed skills, searching the vetted catalog, installing skills, uninstalling skills, and learning from prior usage.

## Load & Usage

Top-level `await` is supported — use it directly.

Primary usage is direct command mode.

Use clawhub first whenever the task is about skill management:
- list installed skills
- browse or search available skills
- install a skill
- uninstall a skill

Terminal command examples:

```text
run /skills/clawhub/scripts/clawhub.js list
run /skills/clawhub/scripts/clawhub.js browse --limit 20
run /skills/clawhub/scripts/clawhub.js search discord
run /skills/clawhub/scripts/clawhub.js install discord
run /skills/clawhub/scripts/clawhub.js uninstall discord
run /skills/clawhub/scripts/clawhub.js logUsage weather success "wttr.in worked"
run /skills/clawhub/scripts/clawhub.js log weather success "wttr.in worked"
run /skills/clawhub/scripts/clawhub.js help
```

These are terminal commands, not JavaScript code.
Do not put `run /skills/clawhub/scripts/clawhub.js list` inside the terminal tool's `code` field.
Use it as the terminal command itself.

In direct command mode (`run /skills/clawhub/scripts/clawhub.js ...`), clawhub prints the final result automatically.

Code mode is secondary. In code mode, assign the return value and print it with `console.log(...)`.
Do not call `clawhub.list()` or `await clawhub.search(...)` bare in terminal code and expect output; without `console.log(...)`, the result may not be shown.

```js
const clawhub = require('/skills/clawhub/scripts/clawhub.js');

// What skills are installed on this device?
const installed = clawhub.list();
console.log(installed);        // required in code mode

// Browse the skill store (catalog, NOT installed)
const topSkills = clawhub.browse(20);
console.log(topSkills);        // required in code mode

const matches = await clawhub.search('meeting notes');
console.log(matches);          // required in code mode

// Install / uninstall — always use just the slug
const installResult = await clawhub.install('youtube-watcher');
console.log(installResult);

const uninstallResult = clawhub.uninstall('simplehttpskill');
console.log(uninstallResult);

// Run a skill's script directly
const mod = await clawhub.run('weather', { location: 'Boston' });

// Usage tracking — call BEFORE clearTask
clawhub.logUsage('weather', 'success', 'wttr.in worked for Tokyo');
clawhub.logUnmetSearch('stock price feed');
clawhub.usageSummary();        // per-skill success rates

// Annotations — persist learned knowledge
clawhub.annotate('weather', 'require path: /skills/weather/scripts/weather.js');
clawhub.getNotes('weather');
```

## API reference

| Method | Description |
|--------|-------------|
| `list()` | **Installed skills.** Returns JSON array of skill slugs on this device. Primary use: `run /skills/clawhub/scripts/clawhub.js list`. In code mode: `const x = clawhub.list(); console.log(x);`. |
| `browse(n?)` | **Browse catalog.** Top-N entries by downloads from the skill store (NOT installed). Primary use: `run /skills/clawhub/scripts/clawhub.js browse --limit 20`. In code mode: `const x = clawhub.browse(20); console.log(x);`. |
| `search(query)` | **Search catalog.** Semantic + keyword search across the skill store. Primary use: `run /skills/clawhub/scripts/clawhub.js search discord`. In code mode: `const x = await clawhub.search(query); console.log(x);`. |
| `status()` | **Full diagnostic.** Installed count, recent usage, failures, unmet searches. Returns JSON string. |
| `install(skillId)` | Install a skill. `'creator/slug'` (community) or `'slug'` (local/backend). Primary use: `run /skills/clawhub/scripts/clawhub.js install discord`. In code mode: `const x = await clawhub.install(skillId); console.log(x);`. |
| `run(slug, args?)` | Find and run a skill's main script. Returns result. |
| `uninstall(slug)` | Remove skill from sandbox. Always use just the slug (e.g. `'weather'`). Primary use: `run /skills/clawhub/scripts/clawhub.js uninstall weather`. In code mode: `const x = clawhub.uninstall(slug); console.log(x);`. Throws on not-found. |
| `status()` | Installed skills, recent usage, failures, unmet searches. Returns JSON string. |
| `usageSummary(slug?)` | Per-skill success rates. Returns JSON string. |
| `logUsage(slug, outcome, note?)` | Record `'success'` / `'fail'` / `'partial'`. Call before clearTask. Alias: `log`. |
| `logUnmetSearch(query)` | Log a search that found nothing useful. |
| `help` | Show all available actions and examples. Terminal: `run ... clawhub.js help` or `--help` / `-h`. |
| `annotate(slug, note)` | Persist learned knowledge to `_notes.md`. |
| `getNotes(slug)` | Read `_notes.md` for a skill. |
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
2. **Log outcome** → `logUsage(slug, outcome, note)` (or alias `log`) before every `clearTask`
3. **Log gaps** → `logUnmetSearch(query)` when search returns nothing useful
4. **Annotate** → `annotate(slug, note)` for anything learned, including on success (correct path, provider quirks, arg format)
5. **Review** → `status()` and `usageSummary()` to see failures, unused skills, and unmet gaps

Usage stats appear in `skills.header` at session start — `{ total, lastUsed, successRate }` per skill.

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/clawhub.js list
```
