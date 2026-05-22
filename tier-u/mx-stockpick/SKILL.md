---
name: mx-stockpick
description: "Natural language stock screener via EastMoney API. Filter A-shares, HK, US stocks, funds, and convertible bonds by technical, fundamental, news, and market sentiment indicators."
version: 2.3
---
# mx-stockpick

Use the EastMoney (东方财富) mxClaw API to screen stocks, ETFs, funds, and bonds using natural language.

## Setup

Get your `EM_API_KEY` from https://ai.eastmoney.com/mxClaw (register → API Key).

Set the key:
```js
await keychain.set('EM_API_KEY', 'your-key');
```

## Usage

**Terminal:**
```
run /skills/mx-stockpick/scripts/mx-stockpick.js 半导体行业，市值大于100亿 --type A股
```

**Code mode:**
```js
const s = require('/skills/mx-stockpick/scripts/mx-stockpick.js');
console.log(await s.pick('半导体行业，市值大于100亿', 'A股'));
```

## Example queries

- 连续3日上涨，成交量放大，MACD金叉
- PE小于20，ROE大于15%，近一年净利润增速大于20%
- 半导体行业，市值大于100亿
- US tech stocks with revenue growth > 20% last year
- 规模最大的科技类ETF
- 转股溢价率小于5%的可转债
- 股价大于100元，主力流入

## Select types

`A股` | `港股` | `美股` | `基金` | `ETF` | `可转债` | `板块`

Leave empty `''` for auto-detect.

> **Runtime:** Primary: `run /skills/mx-stockpick/scripts/mx-stockpick.js <query> [--type A股]` Code mode: `const s = require('/skills/mx-stockpick/scripts/mx-stockpick.js'); console.log(await s.pick("query", "A股"))`

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
EM_API_KEY=<your-key> node scripts/mx-stockpick.js 股价大于100元，主力流入 --type A股
```
