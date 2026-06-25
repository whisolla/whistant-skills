---
name: admapix
description: "Ad intelligence & app analytics assistant. Search ad creatives, analyze apps, view rankings, track downloads/revenue, and get market insights. Get your API key at https://www.admapix.com. Evolved from fly0pants/admapix version 1.0.29 at 2026-05-26."
version: 2.1
keychain: [admapix_api_key]
---
# admapix
_Converted from ClawHub: `fly0pants/admapix`_

## Runtime: fetch✅ fs✅ crypto✅ http✅ | child_process❌ WebSocket❌ Blob❌

# AdMapix Intelligence Assistant

**Get started:** Sign up and get your API key at https://www.admapix.com

You are an ad intelligence and app analytics assistant. Help users search ad creatives, analyze apps, explore rankings, track downloads/revenue, and understand market trends — all via the AdMapix API.

**Data disclaimer:** Download/revenue figures are third-party estimates, not official data.

## API Access

Base URL: `https://api.admapix.com`
All endpoints use the `/api/data/` prefix.
Auth: `X-API-Key` header (auto-resolved from globalThis → keychain → config → env).

## Credential Setup

The skill auto-resolves credentials in this order:
1. `globalThis.ADMAPIX_API_KEY`
2. Keychain (`swift:keychain` → `admapix_api_key`)
3. Config (`swift:config` → `skills.entries.admapix.apiKey`)
4. `process.env.ADMAPIX_API_KEY`

Set via `/cmd`:
```
/cmd --action configure --apiKey sk_xxxxx
```

## Quick Start

### `/cmd` (terminal) — Primary Path

All endpoints accessible via the `--action` flag:

```bash
# Product Search
/cmd --action unifiedProductSearch --keyword tiktok
/cmd --action unifiedProductSearch --keyword tiktok --page_size 5 --country_ids '["US"]'

# Creative Search
/cmd --action search --keyword "puzzle game" --content_type creative
/cmd --action search --keyword "puzzle game" --content_type imagevideo --country_ids '["US","JP"]' --generate_page true

# Rankings
/cmd --action storeRank --market appstore --rank_type free --country '["US"]'
/cmd --action genericRank --rank_type promotion --country '["US"]'
/cmd --action genericRank --rank_type download --category_id 6014

# App Detail (requires unifiedProductId from search)
/cmd --action getAppDetail --appId 835599320 --country US

# Distribution
/cmd --action appDistribution --unified_product_id 835599320 --dim country

# Download & Revenue
/cmd --action downloadDetail --unified_product_id 835599320 --query_start_date 2026-02-14 --query_end_date 2026-03-16
/cmd --action revenueDetail --unified_product_id 835599320 --query_start_date 2026-02-14 --query_end_date 2026-03-16

# Market Analysis
/cmd --action marketSearch --class_type 1 --data_type 2

# Utility
/cmd --action quota
/cmd --action filterOptions
/cmd --action configure --apiKey sk_xxxxx
```

### `/code` (JS require) — Direct API Access

```js
var s = require("admapix");

// ── Product/App ──
var r = await s.unifiedProductSearch({keyword:"tiktok", page_size:3});
console.log(r.ok, r.data.totalSize, "results");
console.log(s.stripHighlight(r.data.list[0].unifiedProductName));

var d = await s.getAppDetail("835599320", "US");
console.log(d.ok, JSON.stringify(d.data).length, "bytes");

// ── Creative Search ──
var c = await s.searchCreatives({keyword:"puzzle game", content_type:"creative", page_size:3});
console.log(c.ok, c.data.list.length, "creatives");

// ── Rankings ──
var sr = await s.getStoreRank({market:"appstore", rank_type:"free", country:["US"], page_size:5});
console.log(sr.ok, sr.data.list.length, "apps");

var gr = await s.getGenericRank({rank_type:"promotion", category_id:"6014", page_size:5});
console.log(gr.ok, gr.data.list.length, "ranked");

// ── Distribution ──
var ad = await s.getAppDistribution({unified_product_id:"835599320", dim:"country"});
console.log(ad.ok, ad.data.list.length, "countries");

// ── Download/Revenue ──
var dl = await s.getDownloadDetail({unified_product_id:"835599320", query_start_date:"2026-02-14", query_end_date:"2026-03-16"});
console.log(dl.ok, dl.data.list.length, "days");

// ── Market Analysis ──
var m = await s.searchMarket({class_type:1, data_type:"2", page_size:5});
console.log(m.ok, m.data.data_list.length, "countries");

// ── Utility ──
var q = await s.getQuota();
console.log(q.ok, "credits:", q.data.creativeSearchCnt, "search,", q.data.productDetailCnt, "detail");

// ── Credentials ──
console.log("has key:", !!s.getApiKey());
await s.configure("sk_xxxxx");
```

## All Available Actions

| Action | Method | Endpoint | Cost |
|--------|--------|----------|------|
| `unifiedProductSearch` | POST | `/api/data/unified-product-search` | 1 product search |
| `searchProducts` | POST | `/api/data/product-search` | 1 product search |
| `getAppDetail` | GET | `/api/data/app-detail` | 1 product detail |
| `searchProductContent` | POST | `/api/data/product-content-search` | 1 creative search |
| `search` / `searchCreatives` | POST | `/api/data/search` | 1 creative search |
| `storeRank` / `getStoreRank` | POST | `/api/data/store-rank` | included |
| `genericRank` / `getGenericRank` | POST | `/api/data/generic-rank` | included |
| `storeCategories` | GET | `/api/data/store-categories` | included |
| `storeCountries` | GET | `/api/data/store-countries` | included |
| `downloadDate` | GET | `/api/data/download-date` | included |
| `downloadDetail` | POST | `/api/data/download-detail` | 1 product detail |
| `downloadCountry` | POST | `/api/data/download-country` | 1 product detail |
| `revenueDate` | GET | `/api/data/revenue-date` | included |
| `revenueDetail` | POST | `/api/data/revenue-detail` | 1 product detail |
| `revenueCountry` | POST | `/api/data/revenue-country` | 1 product detail |
| `appDistribution` | POST | `/api/data/app-distribution` | 1 product detail |
| `distributeDims` | GET | `/api/data/distribute-dims` | included |
| `globalPromote` | POST | `/api/data/global-promote` | included |
| `marketSearch` | POST | `/api/data/market-search` | included |
| `quota` | GET | `/api/data/quota` | free |
| `filterOptions` | GET | `/api/data/filter-options` | free |
| `configure` | — | (local) | — |

## Key Parameters Reference

### Common Filters (apply to most search endpoints)

| Param | Example | Description |
|-------|---------|-------------|
| `country_ids` | `["US","JP"]` | Country code filter |
| `media_ids` | `["101"]` | Media channel filter |
| `device` | `["1"]` | Device filter (1=Android, 2=iOS) |
| `start_date` | `"2026-02-14"` | Start date YYYY-MM-DD |
| `end_date` | `"2026-03-16"` | End date YYYY-MM-DD |
| `page` | `1` | Page number |
| `page_size` | `20` | Results per page (max 100) |
| `sort_field` | `"3"` | Sort field |
| `sort_rule` | `"desc"` | Sort direction |

### Creative Search `content_type`

| Type | Description |
|------|-------------|
| `creative` | Multi-asset ad bundles |
| `imagevideo` | Individual image/video assets |
| `preplay` | Playable/interactive ads |
| `demoad` | Landing pages |
| `document` | Document-format ads |

### Generic Rank `rank_type`

| Type | Description |
|------|-------------|
| `promotion` | Apps by ad promotion volume |
| `download` | Apps by download estimates |
| `revenue` | Apps by revenue estimates |
| `newapp` | Recently launched apps |
| `overseas` | Chinese apps going global |
| `drama` | Short drama/content apps |

## Utilities

- `stripHighlight(str)` — remove HTML `<font>` highlight tags from names
- `getNested(obj, "query.info.query.info.productNameDefault")` — extract nested dot-notation fields
- `formatNumber(n, lang)` — format large numbers (cn: 万/亿, en: K/M/B)

## Error Handling

| Code | Meaning |
|------|---------|
| 401 | API Key invalid → show setup guide |
| 429 | Rate limited → retry later |
| empty list | No data → suggest adjusting parameters |

## Local Testing

```bash
# Requires: echo '{"type":"commonjs"}' > scripts/package.json (do NOT commit)
# Test with mocked config
cd backend/skills/admapix
echo '{"type":"commonjs"}' > scripts/package.json
node -e "
var admapix = require('./scripts/admapix.js');
admapix.init('sk_test');
console.log('checkApiKey:', admapix.checkApiKey().ok);
console.log('exports:', Object.keys(admapix).length, 'functions');
"
rm scripts/package.json
```
