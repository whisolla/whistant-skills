---
name: mx-macro-data
description: "Natural language query for global macroeconomic data via EastMoney API. Covers GDP, CPI, monetary policy, fiscal data, trade, and employment across global markets."
version: 2.2
---
# mx-macro-data

Use the EastMoney (东方财富) mxClaw API to query macroeconomic data in natural language.

## Setup

Get your `EM_API_KEY` from https://ai.eastmoney.com/mxClaw (register → API Key).

Set the key:
```js
await keychain.set('EM_API_KEY', 'your-key');
```

## Usage

**Terminal:**
```
run /skills/mx-macro-data/scripts/mx-macro-data.js 中国近三年GDP增速
```

**Code mode:**
```js
const s = require('/skills/mx-macro-data/scripts/mx-macro-data.js');
console.log(await s.search('中国近三年GDP增速'));
```

## Example queries

- 中国近三年GDP增速
- 美国近两年CPI走势
- 日本央行利率决策
- 中国M2货币供应量
- 全球主要经济体PMI
- 中国进出口贸易数据

> **Runtime:** Primary: `run /skills/mx-macro-data/scripts/mx-macro-data.js <query>` Code mode: `const s = require('/skills/mx-macro-data/scripts/mx-macro-data.js'); console.log(await s.search("query"))`

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
EM_API_KEY=<your-key> node scripts/mx-macro-data.js 中国近三年GDP增速
```
