---
name: multi-search-engine
description: Multi search engine integration with 16 engines (7 CN + 9 Global). Use fetch() to query Baidu, Google, DuckDuckGo, Bing, Brave, WolframAlpha, and more. No API keys required.
version: 1.0
---
# multi-search-engine

Search 16 engines via `fetch()`. No API keys — uses standard web search URLs with browser headers.

## Language routing

```js
function pickEngines(query) {
  const isChinese = /[\u4e00-\u9fff]/.test(query);
  if (isChinese) {
    return ['baidu', 'bingCN', 'sogou', '360', 'shenma'];
  }
  return ['google', 'duckduckgo', 'brave', 'bing', 'wolframalpha'];
}
```

## Search URL builder

```js
const ENGINES = {
  baidu:       q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
  bingCN:      q => `https://cn.bing.com/search?q=${encodeURIComponent(q)}&ensearch=0`,
  bingINT:     q => `https://cn.bing.com/search?q=${encodeURIComponent(q)}&ensearch=1`,
  '360':       q => `https://www.so.com/s?q=${encodeURIComponent(q)}`,
  sogou:       q => `https://sogou.com/web?query=${encodeURIComponent(q)}`,
  weChat:      q => `https://wx.sogou.com/weixin?type=2&query=${encodeURIComponent(q)}`,
  shenma:      q => `https://m.sm.cn/s?q=${encodeURIComponent(q)}`,
  google:      q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  googleHK:    q => `https://www.google.com.hk/search?q=${encodeURIComponent(q)}`,
  duckduckgo:  q => `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
  yahoo:       q => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
  startpage:   q => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
  brave:       q => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  ecosia:      q => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
  qwant:       q => `https://www.qwant.com/?q=${encodeURIComponent(q)}`,
  wolframalpha:q => `https://www.wolframalpha.com/input?i=${encodeURIComponent(q)}`,
};
```

## Fetch a single engine

```js
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
};

async function searchEngine(engineName, query) {
  const url = ENGINES[engineName]?.(query);
  if (!url) throw new Error('Unknown engine: ' + engineName);
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`${engineName} returned ${res.status}`);
  return await res.text(); // parse HTML for results
}

const html = await searchEngine('duckduckgo', 'whistant AI agent');
console.log('Got', html.length, 'bytes from DuckDuckGo');
```

## Multi-engine search with delay

```js
async function multiSearch(query, engineNames, delayMs = 1500) {
  const results = [];
  for (const name of engineNames) {
    try {
      const html = await searchEngine(name, query);
      results.push({ engine: name, html, ok: true });
    } catch (e) {
      results.push({ engine: name, error: e.message, ok: false });
    }
    // Rate limit: delay between requests
    if (engineNames.indexOf(name) < engineNames.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

const engines = pickEngines('AI agent tutorial');
const results = await multiSearch('AI agent tutorial', engines);
results.forEach(r => console.log(r.engine, r.ok ? '✅' : '❌ ' + r.error));
```

## Advanced search operators

```js
// Site-specific search
const siteUrl = ENGINES.google('site:github.com react agent');

// Exact match
const exactUrl = ENGINES.google('"AI agent framework"');

// File type
const pdfUrl = ENGINES.google('machine learning filetype:pdf');

// Time filter (past week — Google only)
const recentUrl = `https://www.google.com/search?q=${encodeURIComponent('AI news')}&tbs=qdr:w`;

// DuckDuckGo bang (redirect to GitHub)
const bangUrl = ENGINES.duckduckgo('!gh tensorflow');

// WolframAlpha calculation
const calcUrl = ENGINES.wolframalpha('100 USD to CNY');

console.log(siteUrl, exactUrl, pdfUrl, recentUrl, bangUrl, calcUrl);
```

## Time filter reference

```js
const timeFilters = {
  hour:  'tbs=qdr:h',
  day:   'tbs=qdr:d',
  week:  'tbs=qdr:w',
  month: 'tbs=qdr:m',
  year:  'tbs=qdr:y',
};
// Append to Google URL: ?q=...&tbs=qdr:w
```

## Notes

- No API keys needed — all engines use standard web URLs
- Always add 1–2 second delay between requests to avoid rate limiting
- If 403/429: fetch the engine homepage first to get fresh session cookies, then retry
- Chinese queries → use domestic engines (Baidu, Bing CN, Sogou, 360, Shenma)
- English queries → use international engines (Google, DuckDuckGo, Brave, Bing)
- WolframAlpha: best for math, conversions, factual queries
