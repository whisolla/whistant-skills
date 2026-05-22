---
name: liang-tavily-search
description: Web search using the Tavily Search API. Supports basic and deep search, news search, domain filtering, and time range filtering. Requires a Tavily API key.
version: 2.0
---
# liang-tavily-search

Use the Tavily Search API via `fetch()` for web search with AI-optimized results.

## Setup

Get your API key at https://tavily.com (free tier available).

```js
const TAVILY_API_KEY = 'tvly-your_api_key_here';
```

## Basic search

```js
const TAVILY_API_KEY = 'tvly-your_api_key_here';

const res = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: 'python async patterns',
    max_results: 10,
    search_depth: 'basic', // 'basic' | 'advanced' | 'fast' | 'ultra-fast'
    topic: 'general',      // 'general' | 'news'
  }),
});
const data = await res.json();
data.results?.forEach(r => console.log(r.title, r.url, r.score));
```

## News search with time range

```js
const res = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: 'AI agent news',
    max_results: 10,
    search_depth: 'basic',
    topic: 'news',
    time_range: 'week', // 'day' | 'week' | 'month' | 'year'
  }),
});
const data = await res.json();
data.results?.forEach(r => console.log(r.title, r.published_date, r.url));
```

## Deep search with domain filters

```js
const res = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: 'React hooks best practices',
    max_results: 10,
    search_depth: 'advanced',
    topic: 'general',
    include_domains: ['react.dev', 'kentcdodds.com', 'overreacted.io'],
    include_raw_content: true, // include full page text
  }),
});
const data = await res.json();
data.results?.forEach(r => {
  console.log(r.title, r.url);
  if (r.raw_content) console.log(r.raw_content.slice(0, 200));
});
```

## Exclude domains

```js
const res = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: 'machine learning tutorial',
    max_results: 10,
    search_depth: 'basic',
    exclude_domains: ['youtube.com', 'reddit.com'],
  }),
});
const data = await res.json();
data.results?.forEach(r => console.log(r.title, r.url));
```

## Response structure

```js
// data from any search call
const { query, results, answer, response_time } = data;
// results[i] fields:
// - title: string
// - url: string
// - content: string (snippet)
// - score: number (relevance 0–1)
// - published_date: string (news only)
// - raw_content: string (if include_raw_content: true)
console.log('Answer:', answer); // AI-synthesized answer (if available)
console.log('Results:', results?.length);
```

## Notes

- `max_results`: 1–20
- `search_depth`: `ultra-fast` < `fast` < `basic` < `advanced` (more depth = more quota)
- Free tier: 1000 requests/month
- Tavily API: https://docs.tavily.com
