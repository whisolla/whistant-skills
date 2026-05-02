// GitHub REST API helpers for iPhone JS sandbox
// Uses fetch() — no Node.js binaries required

const GITHUB_API = 'https://api.github.com';

function makeHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function githubApi(token) {
  const headers = makeHeaders(token);
  const api = {
    headers,

    // --- Issues ---
    async listIssues(repo, { state = 'open', per_page = 20, labels, milestone, assignee, creator, since } = {}) {
      let url = `${GITHUB_API}/repos/${repo}/issues?state=${state}&per_page=${per_page}`;
      if (labels) url += `&labels=${encodeURIComponent(labels)}`;
      if (milestone) url += `&milestone=${milestone}`;
      if (assignee) url += `&assignee=${encodeURIComponent(assignee)}`;
      if (creator) url += `&creator=${encodeURIComponent(creator)}`;
      if (since) url += `&since=${since}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`listIssues error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getIssue(repo, number) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/issues/${number}`, { headers });
      if (!res.ok) throw new Error(`getIssue error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async createIssue(repo, { title, body, labels, assignees, milestone }) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/issues`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, labels, assignees, milestone }),
      });
      if (!res.ok) throw new Error(`createIssue error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async updateIssue(repo, number, { title, body, state, labels, assignees }) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/issues/${number}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, state, labels, assignees }),
      });
      if (!res.ok) throw new Error(`updateIssue error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async addIssueComment(repo, number, body) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/issues/${number}/comments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error(`addIssueComment error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Pull Requests ---
    async listPRs(repo, { state = 'open', per_page = 20 } = {}) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/pulls?state=${state}&per_page=${per_page}`, { headers });
      if (!res.ok) throw new Error(`listPRs error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getPR(repo, number) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/pulls/${number}`, { headers });
      if (!res.ok) throw new Error(`getPR error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async createPR(repo, { title, body, head, base, draft, maintainer_can_modify } = {}) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/pulls`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, head, base, draft, maintainer_can_modify }),
      });
      if (!res.ok) throw new Error(`createPR error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- CI / Checks ---
    async getCheckRuns(repo, sha) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/commits/${sha}/check-runs`, { headers });
      if (!res.ok) throw new Error(`getCheckRuns error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getCommitStatus(repo, sha) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/commits/${sha}/status`, { headers });
      if (!res.ok) throw new Error(`getCommitStatus error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Actions ---
    async listWorkflowRuns(repo, { workflow_id, branch, status, per_page = 20 } = {}) {
      let url = `${GITHUB_API}/repos/${repo}/actions/runs?per_page=${per_page}`;
      if (workflow_id) url += `&workflow_id=${workflow_id}`;
      if (branch) url += `&branch=${encodeURIComponent(branch)}`;
      if (status) url += `&status=${status}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`listWorkflowRuns error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getWorkflowRun(repo, runId) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/runs/${runId}`, { headers });
      if (!res.ok) throw new Error(`getWorkflowRun error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getWorkflowRunJobs(repo, runId) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/runs/${runId}/jobs`, { headers });
      if (!res.ok) throw new Error(`getWorkflowRunJobs error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async getFailedJobs(repo, runId) {
      const data = await api.getWorkflowRunJobs(repo, runId);
      return {
        failedJobs: data.jobs.filter(j => j.conclusion === 'failure'),
        data,
      };
    },

    // --- Repository ---
    async getRepo(repo) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}`, { headers });
      if (!res.ok) throw new Error(`getRepo error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async listRepos({ visibility, affiliation, per_page = 30 } = {}) {
      let url = `${GITHUB_API}/user/repos?per_page=${per_page}&sort=updated`;
      if (visibility) url += `&visibility=${visibility}`;
      if (affiliation) url += `&affiliation=${affiliation}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`listRepos error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Search ---
    async searchIssues(q, { per_page = 30 } = {}) {
      const url = `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&per_page=${per_page}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`searchIssues error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async searchRepos(q, { sort, order = 'desc', per_page = 30 } = {}) {
      let url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&per_page=${per_page}&order=${order}`;
      if (sort) url += `&sort=${sort}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`searchRepos error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Rate Limit ---
    async getRateLimit() {
      const res = await fetch(`${GITHUB_API}/rate_limit`, { headers });
      if (!res.ok) throw new Error(`getRateLimit error: ${res.status} ${res.statusText}`);
      return await res.json();
    },
  };
  return api;
}

// --- CLI runner for iOS runtime ---
async function runFromParams() {
  let params = {};
  try {
    if (typeof PARAMS !== 'undefined' && PARAMS !== null) {
      params = PARAMS;
    } else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) {
      params = JSON.parse(PARAMS_JSON);
    }
  } catch (e) {
    params = {};
  }

  const token = params.token || params.GITHUB_TOKEN || params.GITHUB_TOKEN;
  const repo = params.repo;
  const action = params.action || params.cmd || 'help';

  if (!token) {
    return { error: 'No GITHUB_TOKEN provided. Pass { token, repo, action, ... } to run a GitHub API call.' };
  }

  const api = githubApi(token);

  switch (action) {
    case 'listIssues':
      return await api.listIssues(repo, params);
    case 'getIssue':
      return await api.getIssue(repo, params.number);
    case 'createIssue':
      return await api.createIssue(repo, params);
    case 'updateIssue':
      return await api.updateIssue(repo, params.number, params);
    case 'addIssueComment':
      return await api.addIssueComment(repo, params.number, params.body);
    case 'listPRs':
      return await api.listPRs(repo, params);
    case 'getPR':
      return await api.getPR(repo, params.number);
    case 'createPR':
      return await api.createPR(repo, params);
    case 'getCheckRuns':
      return await api.getCheckRuns(repo, params.sha);
    case 'getCommitStatus':
      return await api.getCommitStatus(repo, params.sha);
    case 'listWorkflowRuns':
      return await api.listWorkflowRuns(repo, params);
    case 'getWorkflowRun':
      return await api.getWorkflowRun(repo, params.runId);
    case 'getWorkflowRunJobs':
      return await api.getWorkflowRunJobs(repo, params.runId);
    case 'getFailedJobs':
      return await api.getFailedJobs(repo, params.runId);
    case 'getRepo':
      return await api.getRepo(repo);
    case 'listRepos':
      return await api.listRepos(params);
    case 'searchIssues':
      return await api.searchIssues(params.q, params);
    case 'searchRepos':
      return await api.searchRepos(params.q, params);
    case 'getRateLimit':
      return await api.getRateLimit();
    default:
      return {
        availableActions: [
          'listIssues', 'getIssue', 'createIssue', 'updateIssue', 'addIssueComment',
          'listPRs', 'getPR', 'createPR',
          'getCheckRuns', 'getCommitStatus',
          'listWorkflowRuns', 'getWorkflowRun', 'getWorkflowRunJobs', 'getFailedJobs',
          'getRepo', 'listRepos', 'searchIssues', 'searchRepos', 'getRateLimit'
        ],
        usage: 'Pass { token, repo, action, ... } to run a GitHub API call. No token = public calls only.',
        example: 'await githubHelper.run({ token: "ghp_...", repo: "owner/repo", action: "listIssues" })',
      };
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { githubApi, runFromParams };
} else if (typeof globalThis !== 'undefined') {
  globalThis.githubApi = githubApi;
  globalThis.githubRunFromParams = runFromParams;
}

// Auto-run from PARAMS when executed directly
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  runFromParams()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error?.message || String(error));
    });
}
