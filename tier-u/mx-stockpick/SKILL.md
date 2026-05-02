---
name: mx-stockpick
description: 基于东方财富数据库，支持通过自然语言筛选A港美股、基金、可转债等，支持技术面、消息面、基本面及市场情绪等多维指标筛选。Natural language stock screener via EastMoney API.
version: 2.0
---
# mx-stockpick

Use the EastMoney (东方财富) mxClaw API to screen stocks, ETFs, funds, and bonds using natural language.

## Setup

Get your `EM_API_KEY` from https://ai.eastmoney.com/mxClaw (register → API Key).

```js
const EM_API_KEY = 'your_em_api_key_here';
```

## Screen stocks

```js
const EM_API_KEY = 'your_em_api_key_here';
const query = '股价大于100元，主力流入，成交额排名前50';
const selectType = 'A股'; // A股 | 港股 | 美股 | 基金 | ETF | 可转债 | 板块

const callId = 'call_' + Math.random().toString(36).slice(2, 10);
const userId = 'user_' + Math.random().toString(36).slice(2, 10);

const res = await fetch('https://ai-saas.eastmoney.com/proxy/b/mcp/tool/selectSecurity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'em_api_key': EM_API_KEY,
  },
  body: JSON.stringify({
    query,
    selectType,
    toolContext: {
      callId,
      userInfo: { userId },
    },
  }),
});
const data = await res.json();
const results = data?.data ?? {};
console.log(JSON.stringify(results, null, 2));
```

## Example queries

```js
// Technical signals
const q1 = '连续3日上涨，成交量放大，MACD金叉';
// Fundamental filters
const q2 = 'PE小于20，ROE大于15%，近一年净利润增速大于20%';
// Sector/concept
const q3 = '半导体行业，市值大于100亿';
// US stocks
const q4 = 'US tech stocks with revenue growth > 20% last year';
// ETF
const q5 = '规模最大的科技类ETF';
// Convertible bonds
const q6 = '转股溢价率小于5%的可转债';
```

## Select type reference

```js
const selectTypes = ['A股', '港股', '美股', '基金', 'ETF', '可转债', '板块'];
// Leave empty string '' for auto-detect
```

## Notes

- API endpoint: `https://ai-saas.eastmoney.com/proxy/b/mcp/tool/selectSecurity`
- Auth header: `em_api_key`
- Response: `data.data` contains screened results
- Include specific filter criteria in the query for best results
