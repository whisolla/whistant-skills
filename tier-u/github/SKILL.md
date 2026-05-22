---
name: github
description: Interact with GitHub using the REST API via fetch(). List/create issues, PRs, check CI runs, and query repositories.
version: 2.3
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

## /cmd Usage

```sh
# Rate limit check (token auto-resolved from keychain)
run /skills/github/scripts/github.js getRateLimit

# Get repo info
run /skills/github/scripts/github.js getRepo --repo whisolla/whistant_local

# List open issues
run /skills/github/scripts/github.js listIssues --repo whisolla/whistant_local --state open --per_page 5

# Search repositories
run /skills/github/scripts/github.js searchRepos --q "react hooks" --per_page 5

# List your accessible repos (shows read/write permissions)
run /skills/github/scripts/github.js listRepos --per_page 20
```

## /code Usage

```js
// Get rate limit
const gh = require('/skills/github/scripts/github.js');
const api = gh.githubApi(await gh._getToken());
console.log(await api.getRateLimit());

// Get repo info
console.log(await api.getRepo('whisolla/whistant_local'));

// List your repos (shows permissions per repo)
const repos = await api.listRepos();
console.log(repos.length + ' repos. First: ' + repos[0].full_name + ' push=' + repos[0].permissions.push);

// List issues
console.log(await api.listIssues('whisolla/whistant_local', { state: 'open', per_page: 3 }));

// Search repos
console.log(await api.searchRepos('react hooks', { per_page: 3 }));
```

## Available Actions

| Action | Params |
|--------|--------|
| `getRateLimit` | — |
| `getRepo` | `repo` (owner/name) |
| `listRepos` | `visibility`, `affiliation`, `per_page` — response includes `permissions.push/admin` per repo |
| `listIssues` | `repo`, `state`, `labels`, `per_page` |
| `getIssue` | `repo`, `number` |
| `createIssue` | `repo`, `title`, `body`, `labels` |
| `updateIssue` | `repo`, `number`, `state`, `title` |
| `addIssueComment` | `repo`, `number`, `body` |
| `listPRs` | `repo`, `state`, `per_page` |
| `getPR` | `repo`, `number` |
| `createPR` | `repo`, `title`, `head`, `base` |
| `getCheckRuns` | `repo`, `sha` |
| `getCommitStatus` | `repo`, `sha` |
| `listWorkflowRuns` | `repo`, `branch`, `status` |
| `getWorkflowRun` | `repo`, `runId` |
| `getWorkflowRunJobs` | `repo`, `runId` |
| `getFailedJobs` | `repo`, `runId` |
| `searchIssues` | `q`, `per_page` |
| `searchRepos` | `q`, `sort`, `order`, `per_page` |

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
GITHUB_FINE_GRAINED_PAT=github_pat_... node scripts/github.js getRateLimit
```
