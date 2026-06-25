---
name: cn-web-search
version: 1.0
description: 中文网页搜索 — 聚合 11 个免费搜索引擎，并行获取，无需 API Key Evolved from joansongjr/cn-web-search version 2.4.0 at 2026-05-26.
author: joansongjr
author_url: https://github.com/joansongjr
repository: https://github.com/joansongjr/cn-web-search
license: MIT
tags:
  - search
  - chinese
  - wechat
  - web-search
  - bing
  - qwant
  - startpage
  - duckduckgo
  - hacker-news
  - reddit
  - arxiv
  - stackoverflow
  - caixin
  - wolfram
  - no-api-key
  - free
  - 中文搜索
---

# 中文网页搜索 (CN Web Search)

多引擎聚合搜索，**全部免费，无需 API Key**。并行查询 11 个搜索引擎，JSON 引擎返回结构化结果，HTML 引擎提取文本摘要。

## 引擎总览

| 类别 | 引擎 ID | 类型 | 默认 |
|------|---------|------|------|
| JSON | `hn` — Hacker News | 结构化 | ✅ |
| JSON | `reddit` — Reddit | 结构化 | ✅ |
| 中文 | `bing` — Bing CN | 文本 | ✅ |
| 英文 | `ddg` — DuckDuckGo Lite | 文本 | ✅ |
| 公众号 | `weixin` — 搜狗微信 | 文本 | ✅ |
| 英文 | `qwant` — Qwant | 文本 | |
| 英文 | `startpage` — Startpage | 文本 | |
| 深度 | `caixin` — 财新 | 文本 | |
| 技术 | `stackoverflow` — Stack Overflow | 文本 | |
| 知识 | `wolfram` — Wolfram Alpha | 文本 | |
| 学术 | `arxiv` — arXiv | 文本 | |

> ⚠️ `m.so.com`（360）和 `sogou.com`（搜狗网页）响应过大（450KB+），不适合 JSC 环境，已跳过。

---

## /cmd — Terminal Usage

```
run /skills/cn-web-search/scripts/cn-web-search.js --query "iPhone 18" 
run /skills/cn-web-search/scripts/cn-web-search.js --query "AI 新闻" --engines hn,reddit,bing --count 3
run /skills/cn-web-search/scripts/cn-web-search.js engines
```

### Command-line flags

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--query` | `-q` | Search query (required) | — |
| `--engines` | `-e` | Comma-separated engine IDs | `hn,reddit,bing,ddg,weixin` |
| `--count` | `-n` | Results per engine (max 20) | `5` |

### Commands

| Command | Description |
|---------|-------------|
| `engines` / `list` | List all available engines |
| `help` / `--help` | Show usage help |
| (query string) | Positional query (same as `--query`) |

---

## /code — JS API

Load the skill:

```js
var s = require("/skills/cn-web-search/scripts/cn-web-search.js");
```

### Search

```js
console.log(await s.search({query: "iPhone 18", engines: ["hn", "reddit"], count: 3}));
// Returns: { query, engineCount, results, formatted }
```

```js
console.log(await s.search({query: "AI 新闻"}));
// Default engines: hn, reddit, bing, ddg, weixin
```

### List engines

```js
console.log(await s.listEngines());
// hn — Hacker News (json) [default]
// reddit — Reddit (json) [default]
// ...
```

### runFromParams

```js
console.log(await s.runFromParams({action: "search", query: "AI news", engines: "hn,ddg", count: 3}));
console.log(await s.runFromParams({action: "engines"}));
```

### handler

```js
console.log(await s.handler({action: "search", query: "iPhone 18"}));
console.log(await s.handler({action: "engines"}));
```

---

## v1.0 — Track B Conversion (2026-05-26)

- ✅ Converted from pure prompt to CODE skill
- ✅ 11 engines with parallel fetch
- ✅ JSON engines (HN, Reddit) return structured results
- ✅ HTML engines use lightweight text extraction
- ✅ JSC compatible (no const/let/arrow)
- ✅ Template compliant (handler, exports, parseCommand, tokenize, runFromParams, Node CLI, PARAMS)
- ✅ 13 exported functions

## v0.9.0
- ✅ 移除付费引擎，全部免费

---

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/cn-web-search.js --query "AI news" --engines hn,reddit --count 3
```
