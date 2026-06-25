---
name: github
description: Interact with GitHub using the REST API via fetch(). List/create issues, PRs, check CI runs, and query repositories. Evolved from steipete/github version 1.0.0 at 2026-05-22.
version: 2.7
keychain: [GITHUB_FINE_GRAINED_PAT, GITHUB_TOKEN]
---
# github

Use the GitHub REST API via `fetch()`. All authenticated requests need a Personal Access Token (PAT).

## Runtime: fetch✅ | blocked: child_process WebSocket Blob

## Token Setup (one-time)

The bot token is read from these sources in priority order:
1. `globalThis.GITHUB_TOKEN` or `globalThis.GITHUB_FINE_GRAINED_PAT` — injected by Whistant runtime
2. `keychain.get('GITHUB_TOKEN')` — persistent per-user storage
3. `params.token` — passed explicitly via `/cmd` flag

**Store your token once:**
```js
await keychain.set('GITHUB_TOKEN', 'github_pat_your_token_here');
```

To obtain a GitHub PAT: Settings → Developer settings → Personal access tokens → Fine-grained tokens (repo scope).

## Usage

Token is auto-resolved from `globalThis` → `keychain`. Use `require()` to load the skill module — do NOT use `child_process` or shell commands.

```js
const g = require('/skills/github/scripts/github.js');
const gh = await g.getApi();  // auto-resolves token

// Rate limit check
console.log(JSON.stringify(await gh.getRateLimit()));

// List repos
console.log(await gh.listRepos({ per_page: 5 }));

// Repo info
console.log(await gh.getRepo('whisolla/whistant_local'));

// List issues
console.log(await gh.listIssues('whisolla/whistant_local', { state: 'open' }));

// Search repos
console.log(await gh.searchRepos('react hooks', { per_page: 5 }));
```

The module exports `getApi()` — an async factory that auto-resolves the token and returns an API object with all methods. Call `await g.getApi()` once to get the authenticated API object, then call methods on it.

## Available Actions

After calling `const gh = await g.getApi()`, use:

| Method | Signature |
|--------|-----------|
| `gh.getRateLimit()` | — no args |
| `gh.getRepo(repo)` | `repo` string, e.g. `"whisolla/whistant_local"` |
| `gh.listRepos(opts)` | `opts`: `{ per_page, visibility, affiliation }` |
| `gh.listIssues(repo, opts)` | `repo` string, `opts`: `{ state, labels, per_page }` |
| `gh.getIssue(repo, number)` | `repo` string, `number` int |
| `gh.createIssue(repo, opts)` | `repo` string, `opts`: `{ title, body, labels }` |
| `gh.updateIssue(repo, number, opts)` | `repo` string, `number` int, `opts`: `{ state, title }` |
| `gh.addIssueComment(repo, number, body)` | `repo` string, `number` int, `body` string |
| `gh.listPRs(repo, opts)` | `repo` string, `opts`: `{ state, per_page }` |
| `gh.getPR(repo, number)` | `repo` string, `number` int |
| `gh.createPR(repo, opts)` | `repo` string, `opts`: `{ title, head, base }` |
| `gh.getCheckRuns(repo, sha)` | `repo` string, `sha` commit hash |
| `gh.getCommitStatus(repo, sha)` | `repo` string, `sha` commit hash |
| `gh.listWorkflowRuns(repo, opts)` | `repo` string, `opts`: `{ branch, status }` |
| `gh.getWorkflowRun(repo, runId)` | `repo` string, `runId` int |
| `gh.getWorkflowRunJobs(repo, runId)` | `repo` string, `runId` int |
| `gh.getFailedJobs(repo, runId)` | `repo` string, `runId` int |
| `gh.searchIssues(q, opts)` | `q` query string, `opts`: `{ per_page }` |
| `gh.searchRepos(q, opts)` | `q` query string, `opts`: `{ sort, order, per_page }` |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
GITHUB_FINE_GRAINED_PAT=github_pat_... node scripts/github.js getRateLimit
```
