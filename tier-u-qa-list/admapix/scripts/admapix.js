'use strict';

// ── AdMapix: Ad Intelligence & App Analytics API ──────────────────────────────
// Base URL: https://api.admapix.com
// Auth: X-API-Key header
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://api.admapix.com';

let _apiKey = null;

function getApiKey() {
  if (_apiKey) return _apiKey;
  try {
    const { config } = require('swift:config');
    _apiKey = config.get('skills.entries.admapix.apiKey') || null;
  } catch (e) {
    _apiKey = null;
  }
  return _apiKey;
}

function checkApiKey() {
  const key = getApiKey();
  if (!key) {
    return {
      ok: false,
      message_cn: '🔑 需要先配置 AdMapix API Key 才能使用：\n\n1. 打开 https://www.admapix.com 注册账号\n2. 登录后在控制台找到 API Keys，创建一个 Key\n3. 拿到 Key 后回来找我，我帮你配置 ✅',
      message_en: '🔑 You need an AdMapix API Key to get started:\n\n1. Go to https://www.admapix.com and sign up\n2. After signing in, find API Keys in your dashboard and create one\n3. Come back with your key and I\'ll set it up for you ✅',
    };
  }
  return { ok: true, key };
}

async function apiGet(path, params, apiKey) {
  const url = new URL(BASE + path);
  if (params) {
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null) {
        url.searchParams.set(k, String(params[k]));
      }
    });
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'X-API-Key': apiKey },
  });
  return response.json();
}

async function apiPost(path, body, apiKey) {
  const response = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

// ── API Endpoints ─────────────────────────────────────────────────────────────

/**
 * Search ad creatives
 * @param {object} args - { keyword, country_ids, creative_team, start_date, end_date, sort_field, sort_rule, page, page_size, generate_page }
 */
async function search(args = {}) {
  const check = checkApiKey();
  if (!check.ok) return check;

  const params = {
    keyword: args.keyword || '',
    page: args.page || 1,
    page_size: Math.min(args.page_size || 20, 60),
    sort_field: args.sort_field || '3',
    sort_rule: args.sort_rule || 'desc',
    generate_page: args.generate_page !== false,
  };
  if (args.country_ids && args.country_ids.length) params.country_ids = args.country_ids;
  if (args.creative_team && args.creative_team.length) params.creative_team = args.creative_team;
  if (args.start_date) params.start_date = args.start_date;
  if (args.end_date) params.end_date = args.end_date;

  try {
    const data = await apiPost('/data/ad/search', params, check.key);
    if (data.error) return { ok: false, message: '❌ ' + data.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get app store rankings
 * @param {object} args - { country, category, rank_type, limit }
 */
async function getRankings(args = {}) {
  const check = checkApiKey();
  if (!check.ok) return check;

  try {
    const data = await apiGet('/data/store-rank', {
      country: args.country || 'US',
      category: args.category || '5000',
      rank_type: args.rank_type || 'free',
      limit: args.limit || 50,
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get app download/revenue details
 * @param {string} appId - App ID (bundle id or name search)
 * @param {string} country - Country code
 */
async function getAppDetails(appId, country) {
  const check = checkApiKey();
  if (!check.ok) return check;

  try {
    const data = await apiGet('/data/app-detail', {
      app_id: appId,
      country: country || 'US',
    }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Search for an app by name
 * @param {string} keyword - App name search term
 */
async function searchApp(keyword) {
  const check = checkApiKey();
  if (!check.ok) return check;

  try {
    const data = await apiGet('/data/app-search', { keyword }, check.key);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Config helper ─────────────────────────────────────────────────────────────

async function configure(apiKey) {
  try {
    const { config } = require('swift:config');
    config.set('skills.entries.admapix.apiKey', apiKey);
    _apiKey = apiKey;
    return { ok: true };
  } catch (e) {
    return { ok: false, message: '配置失败: ' + e.message };
  }
}

// ── Utility ─────────────────────────────────────────────────────────────────

function formatNumber(n, lang) {
  if (lang === 'cn') {
    if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    return String(n);
  }
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

async function handler(event, context) {
  const params = (event && event.parameters) || {};
  const action = params.action || 'search';

  try {
    switch (action) {
      case 'search': return await search(params);
      case 'rankings': return await getRankings(params);
      case 'app': return await getAppDetails(params.appId, params.country);
      case 'searchApp': return await searchApp(params.keyword);
      default: return { ok: false, message: 'Unknown action: ' + action };
    }
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

function init(apiKey) {
  _apiKey = apiKey;
  return { ok: true };
}

module.exports = { handler, init, search, getRankings, getAppDetails, searchApp, configure, getApiKey, checkApiKey, formatNumber };
