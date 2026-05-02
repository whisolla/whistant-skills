---
name: skill-creator
description: Create or update AgentSkills. Use when designing, structuring, or packaging skills with scripts, references, and assets.
version: 1.0
---

# Skill Creator

Create concise, actionable skills for the agent.

## About Skills

Skills are small, self‑contained guides that teach the agent how to do a specific job.

### What Skills Provide

- A clear workflow for a task
- References/assets when needed

## Core Principles

### Concise is Key

Keep SKILL.md short. Move details to references. Prefer brief examples.

### Set Appropriate Degrees of Freedom

- **High freedom**: text instructions when multiple valid approaches exist
- **Low freedom**: specific steps when the task is fragile

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
└── Bundled Resources (optional)
    ├── references/       - Docs to load when needed
    └── assets/           - Templates/files used in outputs
```

#### SKILL.md (required)

- **Frontmatter**: `name`, `description`, `version` (semver, e.g. `1.0`, `1.1`, `2.0`)
- **Body**: workflow + references to other files
- **Examples section**: Include a `## Examples` section with concrete input/output pairs so the LLM can copy and adapt. This is critical for self-improvement — the LLM learns faster from examples than from descriptions alone.

Example:
```markdown
## Examples

**Get current weather**
```js
const w = require('/skills/weather/scripts/weather.js');
console.log(await w.current('Tokyo'));
// → { provider: "wttr.in", location: "Tokyo", tempC: 22, humidity: 65 }
```

**Handle missing input**
```js
// If no city given, ask the user rather than guessing
console.log(await w.current(''));
// → Error: location required
```
```

#### Bundled Resources (optional)

##### References (`references/`)

Use for schemas, API docs, or long examples. Only read when needed.

##### Assets (`assets/`)

Use for templates, icons, boilerplate, or sample files.

##### Scripts (`scripts/`)

Place runnable JS files at `skills/<skill-name>/scripts/<script>.js`. Run via `run skills/<skill-name>/scripts/<script>.js` in the JS terminal. Scripts use the same JavaScriptCore sandbox — see **JS Terminal Runtime Reference** below for what's available.

## Skill Creation Process

### File operations

Use the built-in file tool calls (not iOS Shortcuts) for all skill file operations:

- **`createFolder`**: create `skills/<name>/` and subdirectories. Path relative to `On My iPhone/Whistant`.
- **`saveFile`**: create or overwrite a file. Set clipboard content first via `clipboard` tool, then call `saveFile` with `filePath`. Path relative to `On My iPhone/Whistant` (e.g. `skills/my-skill/SKILL.md`).
- **`readFile`**: read any existing skill file for inspection.
- **`editFile`**: insert/replace/delete lines in an existing file. Operations: `insert` (lineNumber, text), `replace` (lineNumber, text), `delete` (startLine, endLine?).
- **`getFilesInFolder`**: list contents of a skill directory.
- **`deleteFile`**: remove a file or folder.

### Steps

1. Understand the skill with a concrete example
2. Plan reusable contents (references/assets/scripts)
3. `createFolder` for `skills/<name>/` (and `scripts/`, `references/` if needed)
4. Set clipboard to SKILL.md content → `saveFile` to `skills/<name>/SKILL.md`
5. Add scripts/references the same way (clipboard → saveFile)
6. `readFile` to verify, `editFile` to fix
7. Iterate based on real usage

### Frontmatter Template

```yaml
---
name: my-skill
description: One-line summary of what the skill does and when to use it.
version: 1.0
---
```

- **version**: Start at `1.0`. Bump when updating the skill (e.g. `1.1` for minor fixes, `2.0` for major rewrites). The server uses this to push updated skills to users automatically.

## Simple Example

User: "Create a skill for summarizing meeting notes."

- SKILL.md: short workflow + when to use (frontmatter: name, description, version)
- references/format.md: summary template
- assets/meeting-summary.md: blank template file

## JS Terminal Runtime Reference

Skills run in Whistant's **JavaScriptCore sandbox** on iPhone. This is NOT Node.js — know what works and what doesn't.

### Available

- **Async**: Promise, async/await (top-level `await` supported)
- **Network**: `fetch()` with full Response API (.text(), .json(), .arrayBuffer())
- **File I/O**: `require('fs')` — readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync, renameSync, appendFileSync, statSync. Sandboxed to Documents (`/code`, `/skills`)
- **Crypto**: `require('crypto')` — createHash, createHmac, randomBytes, cipheriv/decipheriv
- **Core modules**: `path`, `os`, `process`, `util`, `querystring`, `url`, `events`, `assert`, `buffer`, `http`, `https`, `stream`, `timers`
- **Encoding**: Buffer, TextEncoder/TextDecoder, atob/btoa, URL, URLSearchParams
- **Standard JS**: Map, Set, WeakMap, WeakSet, Proxy, Symbol, BigInt, Intl, ArrayBuffer
- **Packages**: `pkg add <name>` installs pure-JS packages from jsDelivr (axios, lodash, dayjs, uuid, crypto-js, validator, ajv, marked, etc.)
- **App APIs**: `memory` (semantic search), `keychain` (iOS Keychain), `browser.openOAuth()`, `nlEmbed` (sentence embeddings)

### NOT Available

- **Top-level await** — supported; no wrapping required
- **No child_process / spawn / exec** — module exists as stub but all calls throw errors, no shell access
- **No WebSocket API**
- **No localStorage / sessionStorage**
- **No Blob, FormData, ReadableStream**
- **No native/binary npm modules** — only browser-compatible pure JS
- **No require('*.json')**
- **No system filesystem** — sandboxed to ~/Documents only
- **Unavailable modules**: child_process, net, cluster, zlib, tls, dgram, dns, readline, vm, worker_threads

### Module Resolution

`require()` searches in order:
1. Relative paths (`./file.js`, `../file.js`) — resolved from the calling module's directory
2. `/code/pkg/<name>.js` (CDN packages)
3. `/code/node_modules/<name>.js`
4. `/code/lib/<name>.js` (bundled polyfills)
5. `/skills/<name>.js`
6. `/code/<name>.js`

Use full paths for skill scripts: `require('/skills/weather/scripts/weather.js')`

### Timeouts

- Default: 15 seconds for async operations
- Extended: 300 seconds during OAuth flows
- Late output captured via `pending` command

### Writing Skill Scripts

- Use CommonJS (`module.exports = { ... }`)
- All async work inside `(async () => { ... })()`
- Use `fetch()` for HTTP — not axios (saves a package install)
- Use `fs` for file persistence between runs
- Use `keychain` for secrets (API keys, tokens)
- Use relative requires (`require('./helper.js')`) between scripts in the same skill
