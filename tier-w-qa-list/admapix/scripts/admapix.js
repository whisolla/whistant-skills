'use strict';

// ── AdMapix: Ad Intelligence & App Analytics ─────────────────────────────────
// Base URL: https://api.admapix.com/api/data
// Auth: X-API-Key header
// v2.1 — Full rewrite: corrected endpoints, full API surface, JSC compat
// ──────────────────────────────────────────────────────────────────────────────

var BASE = 'https://api.admapix.com';
var _apiKey = null;
var TIMEOUT = 30;

// ── Credentials ───────────────────────────────────────────────────────────────

async function getApiKey() {
  if (_apiKey) return _apiKey;
  // globalThis first (set by TerminalManager on app launch)
  if (typeof globalThis !== 'undefined' && globalThis.ADMAPIX_API_KEY) {
    _apiKey = globalThis.ADMAPIX_API_KEY;
    return _apiKey;
  }
  // Keychain second
  if (typeof keychain !== 'undefined') {
    try {
      var stored = await keychain.get('admapix_api_key');
      if (stored) {
        _apiKey = stored;
        return _apiKey;
      }
    } catch (e) { /* keychain unavailable */ }
  }
  // Env fallback
  if (typeof process !== 'undefined' && process.env && process.env.ADMAPIX_API_KEY) {
    _apiKey = process.env.ADMAPIX_API_KEY;
    return _apiKey;
  }
  return null;
}

function init(apiKey) {
  _apiKey = apiKey;
  return { ok: true };
}

async function checkApiKey() {
  var key = await getApiKey();
  if (!key) {
    return {
      ok: false,
      message_cn: '🔑 需要先配置 AdMapix API Key 才能使用：\n\n1. 打开 https://www.admapix.com 注册账号\n2. 登录后在控制台找到 API Keys，创建一个 Key\n3. 拿到 Key 后回来找我，我帮你配置 ✅',
      message_en: '🔑 You need an AdMapix API Key to get started:\n\n1. Go to https://www.admapix.com and sign up\n2. After signing in, find API Keys in your dashboard and create one\n3. Come back with your key and I\'ll set it up for you ✅',
    };
  }
  return { ok: true, key: key };
}

async function configure(apiKey) {
  if (typeof keychain !== 'undefined') {
    try {
      keychain.set('admapix_api_key', apiKey);
    } catch (e) { /* ignore */ }
  }
  _apiKey = apiKey;
  return { ok: true };
}

// ── HTTP Helpers ──────────────────────────────────────────────────────────────

function encodeParams(params) {
  var parts = [];
  var keys = Object.keys(params);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = params[k];
    if (v !== undefined && v !== null) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

async function apiGet(path, params, apiKey) {
  var url = BASE + path + encodeParams(params);
  var response = await fetch(url, {
    method: 'GET',
    headers: { 'X-API-Key': apiKey },
    timeout: TIMEOUT,
  });
  if (!response.ok) {
    var text = '';
    try { text = await response.text(); } catch (e) { /* ignore */ }
    return { error: true, status: response.status, message: text };
  }
  return response.json();
}

async function apiPost(path, body, apiKey) {
  var response = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    timeout: TIMEOUT,
  });
  if (!response.ok) {
    var text = '';
    try { text = await response.text(); } catch (e) { /* ignore */ }
    return { error: true, status: response.status, message: text };
  }
  return response.json();
}

// ── Quota ─────────────────────────────────────────────────────────────────────

async function getQuota() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/quota', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Product/App Endpoints ─────────────────────────────────────────────────────

/**
 * Search for unified products (cross-platform aggregated apps)
 * POST /api/data/unified-product-search
 */
async function unifiedProductSearch(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      keyword: args.keyword || '',
      type: args.type || 1,
      page: args.page || 1,
      page_size: Math.min(args.page_size || 20, 100),
      sort_field: args.sort_field || '3',
      sort_rule: args.sort_rule || 'desc',
    };
    if (args.country_ids && args.country_ids.length) body.country_ids = args.country_ids;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    if (args.device && args.device.length) body.device = args.device;
    if (args.start_date) body.start_date = args.start_date;
    if (args.end_date) body.end_date = args.end_date;
    var data = await apiPost('/api/data/unified-product-search', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Search for platform-specific products
 * POST /api/data/product-search
 */
async function searchProducts(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      keyword: args.keyword || '',
      page: args.page || 1,
      page_size: Math.min(args.page_size || 20, 100),
      sort_field: args.sort_field || '3',
      sort_rule: args.sort_rule || 'desc',
    };
    if (args.country_ids && args.country_ids.length) body.country_ids = args.country_ids;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    var data = await apiPost('/api/data/product-search', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get app details by product ID
 * GET /api/data/app-detail
 */
async function getAppDetail(appId, country) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var params = { id: appId };
    if (country) params.country = country;
    var data = await apiGet('/api/data/app-detail', params, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Search creatives for a specific product
 * POST /api/data/product-content-search
 */
async function searchProductContent(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      page: args.page || 1,
      page_size: Math.min(args.page_size || 20, 100),
      sort_field: args.sort_field || '3',
      sort_rule: args.sort_rule || 'desc',
    };
    if (args.content_type) body.content_type = args.content_type;
    if (args.country_ids && args.country_ids.length) body.country_ids = args.country_ids;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    if (args.start_date) body.start_date = args.start_date;
    if (args.end_date) body.end_date = args.end_date;
    var data = await apiPost('/api/data/product-content-search', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Creative Search Endpoints ─────────────────────────────────────────────────

/**
 * Search ad creatives
 * POST /api/data/search
 */
async function searchCreatives(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      content_type: args.content_type || 'creative',
      keyword: args.keyword || '',
      page: args.page || 1,
      page_size: Math.min(args.page_size || 60, 100),
      sort_field: args.sort_field || '3',
      sort_rule: args.sort_rule || 'desc',
      generate_page: args.generate_page !== false,
    };
    if (args.country_ids && args.country_ids.length) body.country_ids = args.country_ids;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    if (args.device && args.device.length) body.device = args.device;
    if (args.start_date) body.start_date = args.start_date;
    if (args.end_date) body.end_date = args.end_date;
    if (args.material_type) body.material_type = args.material_type;
    if (args.trade_level1 && args.trade_level1.length) body.trade_level1 = args.trade_level1;
    if (args.trade_level2 && args.trade_level2.length) body.trade_level2 = args.trade_level2;
    if (args.trade_level3 && args.trade_level3.length) body.trade_level3 = args.trade_level3;
    if (args.ad_media_type && args.ad_media_type.length) body.ad_media_type = args.ad_media_type;
    if (args.product_model && args.product_model.length) body.product_model = args.product_model;
    var data = await apiPost('/api/data/search', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Ranking Endpoints ─────────────────────────────────────────────────────────

/**
 * Get app store rankings
 * POST /api/data/store-rank
 */
async function getStoreRank(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      market: args.market || 'appstore',
      rank_type: args.rank_type || 'free',
      cat_type: args.cat_type || 'game',
      cat_code: args.cat_code || 'games',
      country: args.country || ['US'],
      page: args.page || 1,
      page_size: Math.min(args.page_size || 20, 100),
    };
    if (args.date) body.date = args.date;
    if (args.compare_date) body.compare_date = args.compare_date;
    if (args.is_compare) body.is_compare = args.is_compare;
    var data = await apiPost('/api/data/store-rank', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get generic rankings (ad intelligence based)
 * POST /api/data/generic-rank
 */
async function getGenericRank(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      rank_type: args.rank_type || 'promotion',
      category_id: args.category_id || '6014',
      date_type: args.date_type || 1,
      page: args.page || 1,
      page_size: Math.min(args.page_size || 50, 100),
      sort_rule: args.sort_rule || 'desc',
    };
    if (args.country && args.country.length) body.country = args.country;
    if (args.start_date) body.start_date = args.start_date;
    if (args.end_date) body.end_date = args.end_date;
    if (args.sort_field) body.sort_field = args.sort_field;
    if (args.day_mode) body.day_mode = args.day_mode;
    if (args.keyword) body.keyword = args.keyword;
    var data = await apiPost('/api/data/generic-rank', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get store categories
 * GET /api/data/store-categories
 */
async function getStoreCategories() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/store-categories', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get store countries
 * GET /api/data/store-countries
 */
async function getStoreCountries() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/store-countries', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Download & Revenue Endpoints ──────────────────────────────────────────────

/**
 * Get available date range for download data
 * GET /api/data/download-date
 */
async function getDownloadDate() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/download-date', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get download trend data
 * POST /api/data/download-detail
 */
async function getDownloadDetail(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      query_start_date: args.query_start_date || '',
      query_end_date: args.query_end_date || '',
      day_type: args.day_type || 1,
      flag: args.flag !== false,
      is_all: args.is_all || false,
    };
    if (args.compare_start_date) body.compare_start_date = args.compare_start_date;
    if (args.compare_end_date) body.compare_end_date = args.compare_end_date;
    if (args.country_st && args.country_st.length) body.country_st = args.country_st;
    var data = await apiPost('/api/data/download-detail', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get download data by country
 * POST /api/data/download-country
 */
async function getDownloadCountry(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      query_start_date: args.query_start_date || '',
      query_end_date: args.query_end_date || '',
      day_type: args.day_type || 1,
      flag: args.flag !== false,
      is_all: args.is_all || false,
    };
    if (args.country_st && args.country_st.length) body.country_st = args.country_st;
    var data = await apiPost('/api/data/download-country', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get available date range for revenue data
 * GET /api/data/revenue-date
 */
async function getRevenueDate() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/revenue-date', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get revenue trend data
 * POST /api/data/revenue-detail
 */
async function getRevenueDetail(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      query_start_date: args.query_start_date || '',
      query_end_date: args.query_end_date || '',
      day_type: args.day_type || 1,
      flag: args.flag !== false,
      is_all: args.is_all || false,
      revenue_type: args.revenue_type || 'ALL',
    };
    if (args.country_st && args.country_st.length) body.country_st = args.country_st;
    var data = await apiPost('/api/data/revenue-detail', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get revenue data by country
 * POST /api/data/revenue-country
 */
async function getRevenueCountry(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      query_start_date: args.query_start_date || '',
      query_end_date: args.query_end_date || '',
      day_type: args.day_type || 1,
      flag: args.flag !== false,
      is_all: args.is_all || false,
      revenue_type: args.revenue_type || 'ALL',
    };
    if (args.country_st && args.country_st.length) body.country_st = args.country_st;
    var data = await apiPost('/api/data/revenue-country', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Distribution Endpoints ────────────────────────────────────────────────────

/**
 * Analyze app ad distribution across dimensions
 * POST /api/data/app-distribution
 */
async function getAppDistribution(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      unified_product_id: args.unified_product_id || '',
      dim: args.dim || 'country',
      index_type: args.index_type || 0,
    };
    if (args.start_time) body.start_time = args.start_time;
    if (args.end_time) body.end_time = args.end_time;
    if (args.countries && args.countries.length) body.countries = args.countries;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    if (args.material_type) body.material_type = args.material_type;
    var data = await apiPost('/api/data/app-distribution', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get available distribute dimensions per content type
 * GET /api/data/distribute-dims
 */
async function getDistributeDims() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/distribute-dims', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

/**
 * Get global promotion distribution
 * POST /api/data/global-promote
 */
async function getGlobalPromote(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      ids: args.ids || [],
      dim: args.dim || 'country',
      sort_field: args.sort_field || '15',
      sort_rule: args.sort_rule || 'desc',
    };
    if (args.keyword) body.keyword = args.keyword;
    var data = await apiPost('/api/data/global-promote', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Market Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze ad market by dimension
 * POST /api/data/market-search
 */
async function searchMarket(args) {
  var check = await checkApiKey();
  if (!check.ok) return check;
  args = args || {};
  try {
    var body = {
      class_type: args.class_type || 1,
      data_type: args.data_type || '1',
      page: args.page || 1,
      page_size: Math.min(args.page_size || 20, 100),
    };
    if (args.start_date) body.start_date = args.start_date;
    if (args.end_date) body.end_date = args.end_date;
    if (args.trade_level3 && args.trade_level3.length) body.trade_level3 = args.trade_level3;
    if (args.country_level2 && args.country_level2.length) body.country_level2 = args.country_level2;
    if (args.media_ids && args.media_ids.length) body.media_ids = args.media_ids;
    if (args.device && args.device.length) body.device = args.device;
    var data = await apiPost('/api/data/market-search', body, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Utility Endpoints ─────────────────────────────────────────────────────────

/**
 * Get filter option codes (countries, media, device, etc.)
 * GET /api/data/filter-options
 */
async function getFilterOptions() {
  var check = await checkApiKey();
  if (!check.ok) return check;
  try {
    var data = await apiGet('/api/data/filter-options', {}, check.key);
    if (data.error) return { ok: false, message: '❌ ' + (data.message || 'API error') };
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, message: '❌ 请求失败: ' + e.message };
  }
}

// ── Formatting Helpers ────────────────────────────────────────────────────────

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

/**
 * Strip HTML highlight tags from API response names
 */
function stripHighlight(str) {
  if (!str) return '';
  return str.replace(/<font[^>]*>/g, '').replace(/<\/font>/g, '');
}

/**
 * Extract a nested dot-notation field from a response object
 * e.g. getNested(obj, 'query.info.query.info.productNameDefault')
 */
function getNested(obj, path) {
  if (!obj || !path) return undefined;
  var parts = path.split('.');
  var current = obj;
  for (var i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;
    current = current[parts[i]];
  }
  return current;
}

// ── Handler ───────────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  var action = params.action || 'search';

  switch (action) {
    // Product
    case 'unifiedProductSearch':
      return await unifiedProductSearch(params);
    case 'searchProducts':
      return await searchProducts(params);
    case 'getAppDetail':
      return await getAppDetail(params.appId || params.id, params.country);
    case 'searchProductContent':
      return await searchProductContent(params);

    // Creative
    case 'search':
    case 'searchCreatives':
      return await searchCreatives(params);

    // Rankings
    case 'storeRank':
    case 'getStoreRank':
      return await getStoreRank(params);
    case 'genericRank':
    case 'getGenericRank':
      return await getGenericRank(params);
    case 'storeCategories':
      return await getStoreCategories();
    case 'storeCountries':
      return await getStoreCountries();

    // Download & Revenue
    case 'downloadDate':
      return await getDownloadDate();
    case 'downloadDetail':
      return await getDownloadDetail(params);
    case 'downloadCountry':
      return await getDownloadCountry(params);
    case 'revenueDate':
      return await getRevenueDate();
    case 'revenueDetail':
      return await getRevenueDetail(params);
    case 'revenueCountry':
      return await getRevenueCountry(params);

    // Distribution
    case 'appDistribution':
      return await getAppDistribution(params);
    case 'distributeDims':
      return await getDistributeDims();
    case 'globalPromote':
      return await getGlobalPromote(params);

    // Market
    case 'marketSearch':
      return await searchMarket(params);

    // Utility
    case 'quota':
      return await getQuota();
    case 'filterOptions':
      return await getFilterOptions();
    case 'configure':
      return await configure(params.apiKey);

    default:
      return { ok: false, message: 'Unknown action: ' + action };
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

// globalThis for /cmd path
try {
  if (typeof globalThis !== 'undefined') {
    globalThis.admapix = {
      getApiKey: getApiKey,
      init: init,
      checkApiKey: checkApiKey,
      configure: configure,
      getQuota: getQuota,
      unifiedProductSearch: unifiedProductSearch,
      searchProducts: searchProducts,
      getAppDetail: getAppDetail,
      searchProductContent: searchProductContent,
      searchCreatives: searchCreatives,
      getStoreRank: getStoreRank,
      getGenericRank: getGenericRank,
      getStoreCategories: getStoreCategories,
      getStoreCountries: getStoreCountries,
      getDownloadDate: getDownloadDate,
      getDownloadDetail: getDownloadDetail,
      getDownloadCountry: getDownloadCountry,
      getRevenueDate: getRevenueDate,
      getRevenueDetail: getRevenueDetail,
      getRevenueCountry: getRevenueCountry,
      getAppDistribution: getAppDistribution,
      getDistributeDims: getDistributeDims,
      getGlobalPromote: getGlobalPromote,
      searchMarket: searchMarket,
      getFilterOptions: getFilterOptions,
      handler: handler,
      runFromParams: runFromParams,
      tokenize: tokenize,
      parseCommand: parseCommand,
      formatNumber: formatNumber,
      stripHighlight: stripHighlight,
      getNested: getNested,
    };
  }
} catch (e) { /* ignore */ }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getApiKey: getApiKey,
    init: init,
    checkApiKey: checkApiKey,
    configure: configure,
    getQuota: getQuota,
    unifiedProductSearch: unifiedProductSearch,
    searchProducts: searchProducts,
    getAppDetail: getAppDetail,
    searchProductContent: searchProductContent,
    searchCreatives: searchCreatives,
    getStoreRank: getStoreRank,
    getGenericRank: getGenericRank,
    getStoreCategories: getStoreCategories,
    getStoreCountries: getStoreCountries,
    getDownloadDate: getDownloadDate,
    getDownloadDetail: getDownloadDetail,
    getDownloadCountry: getDownloadCountry,
    getRevenueDate: getRevenueDate,
    getRevenueDetail: getRevenueDetail,
    getRevenueCountry: getRevenueCountry,
    getAppDistribution: getAppDistribution,
    getDistributeDims: getDistributeDims,
    getGlobalPromote: getGlobalPromote,
    searchMarket: searchMarket,
    getFilterOptions: getFilterOptions,
    handler: handler,
    runFromParams: runFromParams,
    tokenize: tokenize,
    parseCommand: parseCommand,
    formatNumber: formatNumber,
    stripHighlight: stripHighlight,
    getNested: getNested,
  };
}

function runFromParams(params) {
  var event = { parameters: params || {} };
  return handler(event, null);
}

// ── CMD Parsing ───────────────────────────────────────────────────────────────

function tokenize(input) {
  if (!input) return [];
  var tokens = [];
  var current = '';
  var inQuote = false;
  var quoteChar = '';
  for (var i = 0; i < input.length; i++) {
    var c = input[i];
    if (inQuote) {
      if (c === quoteChar) {
        inQuote = false;
        tokens.push(current);
        current = '';
      } else {
        current += c;
      }
    } else if (c === '"' || c === "'") {
      inQuote = true;
      quoteChar = c;
    } else if (c === ' ' || c === '\t') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += c;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function parseCommand(tokens) {
  if (!tokens || !tokens.length) return { action: 'search' };
  var params = {};
  var action = 'search';
  var i = 0;

  // First positional arg = action
  var first = tokens[0];
  if (first && first.indexOf('--') !== 0) {
    action = first;
    i = 1;
  }

  while (i < tokens.length) {
    var token = tokens[i];
    if (token.indexOf('--') === 0) {
      var key = token.slice(2);
      i++;
      if (i < tokens.length && tokens[i].indexOf('--') !== 0) {
        // Value might be JSON array
        var val = tokens[i];
        if (val.indexOf('[') === 0) {
          try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
        } else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(Number(val)) && val !== '') val = Number(val);
        params[key] = val;
      } else {
        params[key] = true;
        i--; // backtrack, no value
      }
    }
    i++;
  }

  params.action = action;
  return params;
}

// ── Node CLI ──────────────────────────────────────────────────────────────────
// For local testing: node scripts/admapix.js --action storeRank --country '["US"]'

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var argv = process.argv.slice(2);
  var cliParams = parseCommand(argv);
  handler({ parameters: cliParams }, null).then(function (result) {
    console.log(JSON.stringify(result, null, 2));
  }).catch(function (err) {
    console.error(err);
  });
}

// ── PARAMS Auto-Run ───────────────────────────────────────────────────────────
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams(PARAMS || PARAMS_JSON);
    if (typeof console !== 'undefined' && console.log) {
      console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}

