/**
 * GitHub REST API helpers for Whistant iOS JS runtime
 * Uses fetch() — no Node.js binaries required.
 *
 * Token priority: globalThis.GITHUB_TOKEN → keychain.get('GITHUB_TOKEN') → params.token
 *
 * Usage:
 *   const github = require('./github.js');
 *   const api = github.githubApi(token);
 *   console.log(await api.getRepo("whisolla/whistant_local"));
 */

const GITHUB_API = 'https://api.github.com';

/**
 * Resolve GitHub token from available sources.
 * Priority: globalThis.GITHUB_TOKEN → keychain → process.env (devenv) → null
 */
async function _getToken() {
  // 1. globalThis injected by Whistant runtime
  if (typeof globalThis !== 'undefined' && globalThis.GITHUB_TOKEN) {
    return globalThis.GITHUB_TOKEN;
  }
  if (typeof globalThis !== 'undefined' && globalThis.GITHUB_FINE_GRAINED_PAT) {
    return globalThis.GITHUB_FINE_GRAINED_PAT;
  }
  // 2. keychain persistent storage
  if (typeof keychain !== 'undefined') {
    try {
      var stored = await keychain.get('GITHUB_TOKEN');
      if (stored) return stored;
      stored = await keychain.get('GITHUB_FINE_GRAINED_PAT');
      if (stored) return stored;
      stored = await keychain.get('github_fine_grained_pat');
      if (stored) return stored;
    } catch (e) { /* keychain not available */ }
  }
  // 3. process.env for devenv
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.GITHUB_FINE_GRAINED_PAT) return process.env.GITHUB_FINE_GRAINED_PAT;
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  }
  return null;
}

function makeHeaders(token) {
  return {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function githubApi(token) {
  var headers = makeHeaders(token);
  var api = {
    headers: headers,

    // --- Issues ---
    listIssues: async function(repo, opts) {
      opts = opts || {};
      var state = opts.state || 'open';
      var per_page = opts.per_page || 20;
      var url = GITHUB_API + '/repos/' + repo + '/issues?state=' + state + '&per_page=' + per_page;
      if (opts.labels) url += '&labels=' + encodeURIComponent(opts.labels);
      if (opts.milestone) url += '&milestone=' + opts.milestone;
      if (opts.assignee) url += '&assignee=' + encodeURIComponent(opts.assignee);
      if (opts.creator) url += '&creator=' + encodeURIComponent(opts.creator);
      if (opts.since) url += '&since=' + opts.since;
      var res = await fetch(url, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('listIssues error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getIssue: async function(repo, number) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/issues/' + number, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getIssue error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    createIssue: async function(repo, opts) {
      opts = opts || {};
      var body = { title: opts.title, body: opts.body, labels: opts.labels, assignees: opts.assignees, milestone: opts.milestone };
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/issues', {
        method: 'POST',
        headers: merge(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
        timeout: 10,
      });
      if (!res.ok) throw new Error('createIssue error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    updateIssue: async function(repo, number, opts) {
      opts = opts || {};
      var body = { title: opts.title, body: opts.body, state: opts.state, labels: opts.labels, assignees: opts.assignees };
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/issues/' + number, {
        method: 'PATCH',
        headers: merge(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
        timeout: 10,
      });
      if (!res.ok) throw new Error('updateIssue error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    addIssueComment: async function(repo, number, commentBody) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/issues/' + number + '/comments', {
        method: 'POST',
        headers: merge(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ body: commentBody }),
        timeout: 10,
      });
      if (!res.ok) throw new Error('addIssueComment error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    // --- Pull Requests ---
    listPRs: async function(repo, opts) {
      opts = opts || {};
      var state = opts.state || 'open';
      var per_page = opts.per_page || 20;
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/pulls?state=' + state + '&per_page=' + per_page, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('listPRs error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getPR: async function(repo, number) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/pulls/' + number, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getPR error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    createPR: async function(repo, opts) {
      opts = opts || {};
      var body = { title: opts.title, body: opts.body, head: opts.head, base: opts.base, draft: opts.draft, maintainer_can_modify: opts.maintainer_can_modify };
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/pulls', {
        method: 'POST',
        headers: merge(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
        timeout: 10,
      });
      if (!res.ok) throw new Error('createPR error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    // --- CI / Checks ---
    getCheckRuns: async function(repo, sha) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/commits/' + sha + '/check-runs', { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getCheckRuns error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getCommitStatus: async function(repo, sha) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/commits/' + sha + '/status', { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getCommitStatus error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    // --- Actions ---
    listWorkflowRuns: async function(repo, opts) {
      opts = opts || {};
      var per_page = opts.per_page || 20;
      var url = GITHUB_API + '/repos/' + repo + '/actions/runs?per_page=' + per_page;
      if (opts.workflow_id) url += '&workflow_id=' + opts.workflow_id;
      if (opts.branch) url += '&branch=' + encodeURIComponent(opts.branch);
      if (opts.status) url += '&status=' + opts.status;
      var res = await fetch(url, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('listWorkflowRuns error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getWorkflowRun: async function(repo, runId) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/actions/runs/' + runId, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getWorkflowRun error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getWorkflowRunJobs: async function(repo, runId) {
      var res = await fetch(GITHUB_API + '/repos/' + repo + '/actions/runs/' + runId + '/jobs', { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getWorkflowRunJobs error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    getFailedJobs: async function(repo, runId) {
      var data = await api.getWorkflowRunJobs(repo, runId);
      return {
        failedJobs: data.jobs.filter(function(j) { return j.conclusion === 'failure'; }),
        data: data,
      };
    },

    // --- Repository ---
    getRepo: async function(repo) {
      var res = await fetch(GITHUB_API + '/repos/' + repo, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getRepo error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    listRepos: async function(opts) {
      opts = opts || {};
      var per_page = opts.per_page || 30;
      var url = GITHUB_API + '/user/repos?per_page=' + per_page + '&sort=updated';
      if (opts.visibility) url += '&visibility=' + opts.visibility;
      if (opts.affiliation) url += '&affiliation=' + opts.affiliation;
      var res = await fetch(url, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('listRepos error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    // --- Search ---
    searchIssues: async function(q, opts) {
      opts = opts || {};
      var per_page = opts.per_page || 30;
      var url = GITHUB_API + '/search/issues?q=' + encodeURIComponent(q) + '&per_page=' + per_page;
      var res = await fetch(url, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('searchIssues error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    searchRepos: async function(q, opts) {
      opts = opts || {};
      var per_page = opts.per_page || 30;
      var order = opts.order || 'desc';
      var url = GITHUB_API + '/search/repositories?q=' + encodeURIComponent(q) + '&per_page=' + per_page + '&order=' + order;
      if (opts.sort) url += '&sort=' + opts.sort;
      var res = await fetch(url, { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('searchRepos error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },

    // --- Rate Limit ---
    getRateLimit: async function() {
      var res = await fetch(GITHUB_API + '/rate_limit', { headers: headers, timeout: 10 });
      if (!res.ok) throw new Error('getRateLimit error: ' + res.status + ' ' + res.statusText);
      return await res.json();
    },
  };
  return api;
}

// Helper: merge two objects shallow (JSC-safe, no spread)
function merge(a, b) {
  var out = {};
  var k;
  for (k in a) { if (a.hasOwnProperty(k)) out[k] = a[k]; }
  for (k in b) { if (b.hasOwnProperty(k)) out[k] = b[k]; }
  return out;
}

// --- CLI runner for iOS runtime ---
async function runFromParams(inputParams) {
  var params = inputParams || {};
  // Resolve params from PARAMS globals if not explicitly passed
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // Auto-resolve token: explicit param > globalThis > keychain > process.env
  var token = params.token || params.GITHUB_TOKEN || params.GITHUB_FINE_GRAINED_PAT;
  if (!token) { token = await _getToken(); }

  var repo = params.repo;
  var action = params.action || params.cmd;

  // If no action but positional args (from /cmd), use first arg as action
  if (!action && params.argv && params.argv.length > 0) {
    action = params.argv[0];
  }

  if (!action) {
    return {
      availableActions: [
        'listIssues', 'getIssue', 'createIssue', 'updateIssue', 'addIssueComment',
        'listPRs', 'getPR', 'createPR',
        'getCheckRuns', 'getCommitStatus',
        'listWorkflowRuns', 'getWorkflowRun', 'getWorkflowRunJobs', 'getFailedJobs',
        'getRepo', 'listRepos', 'searchIssues', 'searchRepos', 'getRateLimit',
      ],
      usage: 'Usage: run /skills/github/scripts/github.js <action> [--repo owner/repo] [--token ghp_...]',
      example: 'Token auto-resolved from keychain. Store once: await keychain.set("GITHUB_TOKEN", "github_pat_...")',
    };
  }

  if (!token) {
    return { error: 'No GITHUB_TOKEN found. Store token via keychain.set("GITHUB_TOKEN", "github_pat_...") or set globalThis.GITHUB_TOKEN.' };
  }

  var api = githubApi(token);

  switch (action) {
    case 'listIssues':      return await api.listIssues(repo, params);
    case 'getIssue':        return await api.getIssue(repo, params.number);
    case 'createIssue':     return await api.createIssue(repo, params);
    case 'updateIssue':     return await api.updateIssue(repo, params.number, params);
    case 'addIssueComment': return await api.addIssueComment(repo, params.number, params.body);
    case 'listPRs':         return await api.listPRs(repo, params);
    case 'getPR':           return await api.getPR(repo, params.number);
    case 'createPR':        return await api.createPR(repo, params);
    case 'getCheckRuns':    return await api.getCheckRuns(repo, params.sha);
    case 'getCommitStatus': return await api.getCommitStatus(repo, params.sha);
    case 'listWorkflowRuns':return await api.listWorkflowRuns(repo, params);
    case 'getWorkflowRun':  return await api.getWorkflowRun(repo, params.runId);
    case 'getWorkflowRunJobs': return await api.getWorkflowRunJobs(repo, params.runId);
    case 'getFailedJobs':   return await api.getFailedJobs(repo, params.runId);
    case 'getRepo':         return await api.getRepo(repo);
    case 'listRepos':       return await api.listRepos(params);
    case 'searchIssues':    return await api.searchIssues(params.q, params);
    case 'searchRepos':     return await api.searchRepos(params.q, params);
    case 'getRateLimit':    return await api.getRateLimit();
    default:
      return { error: 'Unknown action: ' + action, availableActions: availableList() };
  }
}

function availableList() {
  return [
    'listIssues', 'getIssue', 'createIssue', 'updateIssue', 'addIssueComment',
    'listPRs', 'getPR', 'createPR',
    'getCheckRuns', 'getCommitStatus',
    'listWorkflowRuns', 'getWorkflowRun', 'getWorkflowRunJobs', 'getFailedJobs',
    'getRepo', 'listRepos', 'searchIssues', 'searchRepos', 'getRateLimit',
  ];
}

// --- Template compliance: handler, tokenize, parseCommand ---

function handler(event, context) {
  return runFromParams(event);
}

function tokenize(input) {
  var tokens = [];
  var re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  var m;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[0]);
  }
  return tokens;
}

function parseCommand(input) {
  var tokens = tokenize(input);
  if (!tokens.length) return {};
  var action = tokens[0];
  var result = { action: action };
  var i = 1;
  while (i < tokens.length) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var key = t.slice(2);
      result[key] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else if (t.indexOf('-') === 0) {
      var key2 = t.slice(1);
      result[key2] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else {
      // positional args
      if (i === 1) result.repo = t;
      else if (i === 2 && result.action === 'getIssue') result.number = t;
    }
    i++;
  }
  return result;
}

// --- Node CLI block ---
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var args = process.argv.slice(2);
  var input = args.join(' ');
  if (!input) {
    console.log('Usage: node github.js <action> [--repo owner/repo] [--token ghp_...]');
    console.log('Actions: getRateLimit, getRepo, listIssues, searchRepos, ...');
    process.exit(0);
  }
  var parsed = parseCommand(input);
  runFromParams(parsed).then(function(r) {
    console.log(JSON.stringify(r, null, 2));
  }).catch(function(e) {
    console.error(e.message);
    process.exit(1);
  });
}

// --- CommonJS / globalThis exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    githubApi: githubApi,
    runFromParams: runFromParams,
    handler: handler,
    parseCommand: parseCommand,
    tokenize: tokenize,
    _getToken: _getToken,
  };
}
if (typeof globalThis !== 'undefined') {
  globalThis.github = {
    githubApi: githubApi,
    runFromParams: runFromParams,
    handler: handler,
    parseCommand: parseCommand,
    tokenize: tokenize,
    _getToken: _getToken,
  };
}

// --- PARAMS auto-run block ---
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    try {
      var result = await runFromParams();
      if (typeof console !== 'undefined' && console.log) {
        console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      }
      return result;
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
      throw err;
    }
  })();
}
