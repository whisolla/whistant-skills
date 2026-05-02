'use strict';

// ── AdClaw: Ad Creative Search API ──────────────────────────────────────────
// Base URL: https://ad.h5.miaozhisheng.tech/api/data/search
// Auth: X-API-Key header
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://ad.h5.miaozhisheng.tech';
const API_PATH = '/api/data/search';

// Country code mappings (region → country IDs)
const COUNTRY_MAP = {
  '东南亚': ['TH','VN','ID','MY','PH','SG','MM','KH','LA','BN'],
  '北美': ['US','CA'],
  '美国': ['US'],
  '欧洲': ['GB','DE','FR','IT','ES','NL','BE','SE'],
  '英国': ['GB'],
  '日韩': ['JP','KR'],
  '日本': ['JP'],
  '韩国': ['KR'],
  '中东': ['AE','SA','IL','EG'],
  '澳洲': ['AU','NZ'],
  '南美': ['BR','MX','AR','CL','CO'],
  '巴西': ['BR'],
  '印度': ['IN'],
  '俄罗斯': ['RU'],
  '非洲': ['ZA','NG','KE','EG'],
  '全球': [],
};

// Creative type mappings
const CREATIVE_MAP = {
  '视频': ['010'],
  '图片': ['001','002'],
  '试玩': ['020'],
  '图片/视频': ['001','002','010'],
};

// Sort field mappings
const SORT_MAP = {
  '最相关': { field: '11', rule: 'desc' },
  '最热': { field: '15', rule: 'desc' },
  '最新': { field: '3', rule: 'desc' },
  '投放最久': { field: '4', rule: 'desc' },
};

let _apiKey = null;

function getApiKey() {
  if (_apiKey) return _apiKey;
  try {
    const { config } = require('swift:config');
    _apiKey = config.get('skills.entries.adclaw.apiKey') || null;
  } catch (e) {
    _apiKey = null;
  }
  return _apiKey;
}

function checkApiKey() {
  const key = getApiKey();
  if (!key) {
    return { ok: false, message: '🔑 需要先配置 AdClaw API Key 才能搜索。\n\n1. 前往 https://admapix.miaozhisheng.tech 注册并获取 API Key\n2. 告诉我你的 API Key，我帮你配置\n3. 配置完成后重新发起搜索即可 🎉' };
  }
  return { ok: true, key };
}

function formatImpression(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return String(n);
}

function parseParams(args) {
  const params = {
    content_type: 'creative',
    keyword: args.keyword || '',
    page: args.page || 1,
    page_size: args.page_size || 20,
    sort_field: '3',
    sort_rule: 'desc',
    generate_page: true,
  };
  if (args.creative_team && args.creative_team.length) params.creative_team = args.creative_team;
  if (args.country_ids && args.country_ids.length) params.country_ids = args.country_ids;
  if (args.start_date) params.start_date = args.start_date;
  if (args.end_date) params.end_date = args.end_date;
  if (args.sort_field) params.sort_field = args.sort_field;
  if (args.sort_rule) params.sort_rule = args.sort_rule;
  if (args.trade_level1) params.trade_level1 = args.trade_level1;
  return params;
}

// ── Exported API ─────────────────────────────────────────────────────────────

async function search(args = {}) {
  const check = checkApiKey();
  if (!check.ok) return check;

  const today = new Date();
  const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);

  const params = parseParams({
    ...args,
    start_date: args.start_date || fmt(thirtyDaysAgo),
    end_date: args.end_date || fmt(today),
  });

  let response;
  try {
    response = await fetch(BASE + API_PATH, {
      method: 'POST',
      headers: {
        'X-API-Key': check.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  } catch (e) {
    return { ok: false, message: '❌ 网络请求失败: ' + e.message };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, message: '❌ API Key 无效，请检查配置。' };
  }
  if (response.status !== 200) {
    return { ok: false, message: '❌ API 错误: ' + response.status };
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    return { ok: false, message: '❌ 响应解析失败' };
  }

  const total = data.totalSize || 0;
  const pageUrl = data.page_url || '';
  const fullUrl = pageUrl ? BASE + pageUrl : null;

  return {
    ok: true,
    total,
    pageUrl: fullUrl,
    page_key: data.page_key,
    list: data.list || [],
    params,
    message: total > 0
      ? `🎯 搜到 ${total} 条「${params.keyword}」的广告素材（第 ${params.page} 页）\n👉 ${fullUrl}\n\n说「下一页」继续 | 说「只看视频」筛选`
      : '🔍 未找到相关广告素材，试试调整关键词或筛选条件。',
  };
}

// Configuration helper
async function configure(apiKey) {
  try {
    const { config } = require('swift:config');
    config.set('skills.entries.adclaw.apiKey', apiKey);
    _apiKey = apiKey;
    return { ok: true };
  } catch (e) {
    return { ok: false, message: '配置失败: ' + e.message };
  }
}

// ── Whistant handler entry point ─────────────────────────────────────────────

/**
 * Standard handler for Whistant AI invocation.
 * @param {Object} event - { parameters: { keyword, country, creative_type, page, page_size, ... } }
 * @param {Object} context - runtime context (unused)
 */
async function handler(event, context) {
  const params = (event && event.parameters) || {};

  // Map country names to IDs
  if (params.country && COUNTRY_MAP[params.country]) {
    params.country_ids = COUNTRY_MAP[params.country];
  }

  // Map creative types
  if (params.creative_type && CREATIVE_MAP[params.creative_type]) {
    params.creative_team = CREATIVE_MAP[params.creative_type];
  }

  // Map sort
  if (params.sort && SORT_MAP[params.sort]) {
    params.sort_field = SORT_MAP[params.sort].field;
    params.sort_rule = SORT_MAP[params.sort].rule;
  }

  const result = await search(params);
  return result;
}

// Allow direct API key injection without swift:config
function init(apiKey) {
  _apiKey = apiKey;
  return { ok: true };
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  handler,
  search,
  configure,
  init,
  getApiKey,
  checkApiKey,
  parseParams,
  formatImpression,
  COUNTRY_MAP,
  CREATIVE_MAP,
  SORT_MAP
};
