---
name: baidu-search
description: Search the web using Baidu's AI Search API (Qianfan). Requires a BAIDU_API_KEY from Baidu Cloud.
version: 2.0
---
# baidu-search

Use Baidu's Qianfan AI Search API via `fetch()` to search the Chinese web.

## Setup

Get your API key from https://cloud.baidu.com → Qianfan platform.

```js
const BAIDU_API_KEY = 'your_baidu_api_key';
```

## Basic search

```js
const BAIDU_API_KEY = 'your_baidu_api_key';

const res = await fetch('https://qianfan.baidubce.com/v2/ai_search/web_search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BAIDU_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Appbuilder-From': 'whistant',
  },
  body: JSON.stringify({
    messages: [{ content: '人工智能最新进展', role: 'user' }],
    search_source: 'baidu_search_v2',
    resource_type_filter: [{ type: 'web', top_k: 10 }],
  }),
});
const data = await res.json();
const results = data.references ?? [];
results.forEach(r => console.log(r.title, r.url, r.content));
```

## Search with filters

```js
const query = '2025年A股行情分析';
const count = 5;

const res = await fetch('https://qianfan.baidubce.com/v2/ai_search/web_search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BAIDU_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Appbuilder-From': 'whistant',
  },
  body: JSON.stringify({
    messages: [{ content: query, role: 'user' }],
    search_source: 'baidu_search_v2',
    resource_type_filter: [{ type: 'web', top_k: count }],
    search_filter: {
      time_range: 'month', // 'day' | 'week' | 'month' | 'year'
    },
  }),
});
const data = await res.json();
if (data.code) throw new Error(data.message);
const results = data.references ?? [];
results.forEach(r => console.log(r.title, r.url));
```

## Search news

```js
const res = await fetch('https://qianfan.baidubce.com/v2/ai_search/web_search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BAIDU_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Appbuilder-From': 'whistant',
  },
  body: JSON.stringify({
    messages: [{ content: '科技新闻今日', role: 'user' }],
    search_source: 'baidu_search_v2',
    resource_type_filter: [{ type: 'news', top_k: 10 }],
  }),
});
const data = await res.json();
(data.references ?? []).forEach(r => console.log(r.title, r.url, r.publish_time));
```

## Notes

- API: `https://qianfan.baidubce.com/v2/ai_search/web_search`
- Auth: `Authorization: Bearer <key>`
- `resource_type_filter.type`: `web` | `news` | `image` | `video`
- `top_k`: number of results (1–20)
- Response: `data.references[]` with `title`, `url`, `content`, `publish_time`
- Register at: https://cloud.baidu.com/product/qianfan
