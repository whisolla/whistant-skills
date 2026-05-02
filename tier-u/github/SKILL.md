---
name: github
description: Interact with GitHub using the REST API via fetch(). List/create issues, PRs, check CI runs, and query repositories.
version: 2.0
---
# github

Use the GitHub REST API via `fetch()`. All authenticated requests need a Personal Access Token (PAT).

## Setup

```js
const GITHUB_TOKEN = 'ghp_your_token_here'; // PAT with repo scope
const headers = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};
const REPO = 'owner/repo'; // e.g. 'steipete/Whisperator'
```

## List issues

```js
const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=20`, { headers });
const issues = await res.json();
issues.forEach(i => console.log(`#${i.number} ${i.title}`));
```

## Create an issue

```js
const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ title: 'Bug: something broke', body: 'Details here', labels: ['bug'] }),
});
const issue = await res.json();
console.log('Created issue:', issue.html_url);
```

## List pull requests

```js
const res = await fetch(`https://api.github.com/repos/${REPO}/pulls?state=open`, { headers });
const prs = await res.json();
prs.forEach(pr => console.log(`#${pr.number} ${pr.title} (${pr.head.ref} → ${pr.base.ref})`));
```

## Get PR status / CI checks

```js
const prNumber = 55;
const res = await fetch(`https://api.github.com/repos/${REPO}/pulls/${prNumber}`, { headers });
const pr = await res.json();
console.log('State:', pr.state, 'Mergeable:', pr.mergeable, 'CI:', pr.head.sha);

// Get check runs for the PR's head commit
const checkRes = await fetch(`https://api.github.com/repos/${REPO}/commits/${pr.head.sha}/check-runs`, { headers });
const checks = await checkRes.json();
checks.check_runs.forEach(c => console.log(c.name, c.status, c.conclusion));
```

## List workflow runs

```js
const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=10`, { headers });
const data = await res.json();
data.workflow_runs.forEach(r => console.log(r.id, r.name, r.status, r.conclusion));
```

## Get a specific workflow run

```js
const runId = 12345678;
const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs/${runId}`, { headers });
const run = await res.json();
console.log(run.name, run.status, run.conclusion, run.html_url);
```

## Get failed jobs in a run

```js
const runId = 12345678;
const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs/${runId}/jobs`, { headers });
const data = await res.json();
data.jobs
  .filter(j => j.conclusion === 'failure')
  .forEach(j => {
    console.log('Failed job:', j.name);
    j.steps.filter(s => s.conclusion === 'failure').forEach(s => console.log('  Step:', s.name));
  });
```

## Comment on an issue or PR

```js
const issueNumber = 42;
const res = await fetch(`https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ body: 'Thanks for the report!' }),
});
const comment = await res.json();
console.log('Comment posted:', comment.html_url);
```

## Search issues / PRs

```js
const q = encodeURIComponent(`repo:${REPO} is:issue is:open label:bug`);
const res = await fetch(`https://api.github.com/search/issues?q=${q}`, { headers });
const data = await res.json();
data.items.forEach(i => console.log(`#${i.number} ${i.title}`));
```

## Get repo info

```js
const res = await fetch(`https://api.github.com/repos/${REPO}`, { headers });
const repo = await res.json();
console.log(repo.full_name, '⭐', repo.stargazers_count, '🍴', repo.forks_count);
```

## Notes

- Token scopes: `repo` for private repos, `public_repo` for public only
- Rate limit: 5000 req/hour authenticated, 60/hour unauthenticated
- Pagination: use `?page=2&per_page=100`, check `Link` header for next page
- All timestamps are ISO 8601 UTC
