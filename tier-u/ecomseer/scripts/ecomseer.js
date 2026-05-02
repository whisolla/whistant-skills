'use strict';

// ── EcomSeer: TikTok Shop Intelligence API ───────────────────────────────────
// Base URL: https://www.ecomseer.com
// Auth: X-API-Key header
// Deep Research: https://deepresearch.ecomseer.com
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://www.ecomseer.com';
const DEEP_BASE = 'https://deepresearch.ecomseer.com';

let _apiKey = null;

function getApiKey() {
  if (_apiKey) return _apiKey;
  try {
    const { config } = require('swift:config');
    _apiKey = config.get('skills.entries.ecomseer.apiKey') || null;
  } catch (e) { _apiKey = null; }
  return _apiKey;
}

function checkApiKey() {
  const key = getApiKey();
  if (!key) {
    return {
      ok: false,
      message_cn: '🔑 需要先配置 EcomSeer API Key 才能使用：\n\n1. 打开 https://www.ecomseer.com 注册账号\n2. 登录后在控制台找到 API Keys，创建一个 Key\n3. 拿到 Key 后回来找我，我帮你配置 ✅',
      message_en: '🔑 You need an EcomSeer API Key to get started:\n\n1. Go to https://www.ecomseer.com and sign up\n2. After signing in, find API Keys in your dashboard and create one\n3. Come back with your key and I\'ll set it up for you ✅',
    };
  }
  return { ok: true, key };
}

// ── Low-level fetch helpers ──────────────────────────────────────────────────

async function apiGet(path, params, apiKey) {
  const url = new URL(BASE + path);
  if (params) {
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, String(params[k]));
    });
  }
  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
  });
  return res.json();
}

async function apiPost(path, body, apiKey, headers) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── API Endpoints ────────────────────────────────────────────────────────────

async function searchGoods(args = {}) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/goods/search', {
      keyword: args.keyword || '',
      region: args.region || 'US',
      page: args.page || 1,
      pagesize: Math.min(args.pagesize || 20, 50),
      ...(args.sort ? { sort: args.sort } : {}),
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function getGoodsFilters(region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/goods/filters', { region: region || 'US' }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function getGoodsDetail(productId, region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/goods/detail', {
      product_id: productId,
      region: region || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function getGoodsSaleRank(args = {}) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/goods/sale-rank', {
      region: args.region || 'US',
      l1_cid: args.category_id || '',
      order: args.order || '2,2',
      limit: args.limit || 20,
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function searchInfluencers(keyword, region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/influencers/search', {
      words: keyword,
      region: region || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function getInfluencerDetail(uid, region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/influencers/detail', {
      uid,
      region: region || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function searchShops(keyword, region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/shops/search', {
      words: keyword,
      region: region || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

async function getShopDetail(shopId, region) {
  const check = checkApiKey();
  if (!check.ok) return check;
  try {
    const data = await apiGet('/api/open/shops/detail', {
      id: shopId,
      region: region || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Deep Research (JS polling — replaces bash while loop) ─────────────────

/**
 * Submit deep research task.
 * Returns { ok, taskId } or { ok: false, message }
 */
async function submitDeepResearch(query, context, apiKey) {
  try {
    const res = await fetch(DEEP_BASE + '/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-local-token-2026',
      },
      body: JSON.stringify({
        project: 'ecomseer',
        query,
        context: context || null,
        api_key: apiKey,
      }),
    });
    const data = await res.json();
    if (data.error) return { ok: false, message: '❌ ' + data.message };
    return { ok: true, taskId: data.task_id };
  } catch (e) {
    return { ok: false, message: '❌ 提交失败: ' + e.message };
  }
}

/**
 * Poll deep research status until completed or failed.
 * Uses setTimeout-based polling (non-blocking in async context).
 */
async function pollDeepResearch(taskId, onProgress, pollIntervalMs) {
  pollIntervalMs = pollIntervalMs || 15000;

  while (true) {
    let res;
    try {
      res = await fetch(DEEP_BASE + '/research/' + taskId, {
        headers: { 'Authorization': 'Bearer test-local-token-2026' },
      });
    } catch (e) {
      // Connection refused — framework may not be available; fall back
      return { ok: false, status: 'unreachable', message: 'Deep research service unavailable. Try direct API calls.' };
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      return { ok: false, status: 'parse_error', message: 'Invalid response from research service.' };
    }

    const status = data.status;
    if (onProgress) onProgress(status);

    if (status === 'completed') {
      return { ok: true, status: 'completed', data };
    }
    if (status === 'failed') {
      return { ok: false, status: 'failed', message: data.error?.message || 'Research failed.', data };
    }
    if (status === 'pending' || status === 'running') {
      // Wait before next poll
      await new Promise(r => setTimeout(r, pollIntervalMs));
      continue;
    }
    // Unknown status
    return { ok: false, status: status || 'unknown', message: 'Unknown research status.', data };
  }
}

/**
 * Full deep research flow: submit → poll → return results.
 * This replaces the bash "while true; do... done" loop.
 */
async function deepResearch(query, context, onProgress) {
  const check = checkApiKey();
  if (!check.ok) return check;

  // Step 1: Submit
  const submit = await submitDeepResearch(query, context, check.key);
  if (!submit.ok) return submit;

  // Step 2: Poll until done (non-blocking via setTimeout)
  const result = await pollDeepResearch(submit.taskId, onProgress);
  return result;
}

// ── Config ───────────────────────────────────────────────────────────────────

async function configure(apiKey) {
  try {
    const { config } = require('swift:config');
    config.set('skills.entries.ecomseer.apiKey', apiKey);
    _apiKey = apiKey;
    return { ok: true };
  } catch (e) {
    return { ok: false, message: '配置失败: ' + e.message };
  }
}

module.exports = {
  searchGoods, getGoodsFilters, getGoodsDetail, getGoodsSaleRank,
  searchInfluencers, getInfluencerDetail,
  searchShops, getShopDetail,
  deepResearch, submitDeepResearch, pollDeepResearch,
  configure, getApiKey, checkApiKey,
};
