---
name: mx-macro-data
description: 基于东方财富数据库，支持自然语言查询全球宏观经济数据，涵盖GDP、CPI、货币金融、财政、外贸、就业等领域。Natural language query for global macroeconomic data via EastMoney API.
version: 2.0
---
# mx-macro-data

Use the EastMoney (东方财富) mxClaw API to query macroeconomic data in natural language.

## Setup

Get your `EM_API_KEY` from https://ai.eastmoney.com/mxClaw (register → API Key).

```js
const EM_API_KEY = 'your_em_api_key_here';
```

## Query macroeconomic data

```js
const EM_API_KEY = 'your_em_api_key_here';
const query = '中国近三年GDP增速'; // natural language query

const callId = 'call_' + Math.random().toString(36).slice(2, 10);
const userId = 'user_' + Math.random().toString(36).slice(2, 10);

const res = await fetch('https://ai-saas.eastmoney.com/proxy/b/mcp/tool/searchMacroData', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'em_api_key': EM_API_KEY,
  },
  body: JSON.stringify({
    query,
    toolContext: {
      callId,
      userInfo: { userId },
    },
  }),
});
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
```

## Parse results

```js
// Response structure: data.macroDataResultDTO or data.dataList
const result = data?.data ?? {};
const rows = result?.dataList ?? result?.macroDataResultDTO?.dataList ?? [];
rows.forEach(row => console.log(row));
```

## Example queries

```js
// GDP
const q1 = '中国近三年GDP增速';
// CPI / inflation
const q2 = '美国近两年CPI走势';
// Trade balance
const q3 = '中国近一年进出口数据';
// Employment
const q4 = '美国失业率近12个月变化';
// Monetary
const q5 = '中国M2增速近一年数据';
// Multi-region comparison
const q6 = '中美欧元区近一年GDP增速对比';
```

## Constraints

- Use **specific indicator names** — avoid vague terms like "经济数据" or "宏观指标"
- Specify time range explicitly (e.g. "近三年", "2023年", "过去12个月")
- Specify region explicitly (e.g. "中国", "美国", "欧元区") — no need to break into sub-regions

## Notes

- API endpoint: `https://ai-saas.eastmoney.com/proxy/b/mcp/tool/searchMacroData`
- Auth header: `em_api_key`
- Same auth pattern as `mx-finance-data` — reuse the same `EM_API_KEY`
