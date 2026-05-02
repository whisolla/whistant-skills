---
name: mx-stocks-screener
description: 基于东方财富数据库，通过自然语言筛选A港美股、基金、债券等多种资产，支持技术面、消息面、基本面及市场情绪多维筛选。Natural language multi-asset screener via EastMoney API.
version: 2.0
---
# mx-stocks-screener

Use the EastMoney (东方财富) mxClaw API to screen stocks and other assets using natural language queries across multiple dimensions.

## Setup

Get your `EM_API_KEY` from https://ai.eastmoney.com/mxClaw (register → API Key).

```js
const EM_API_KEY = 'your_em_api_key_here';
```

## Screen assets

```js
const EM_API_KEY = 'your_em_api_key_here';
const query = '市值大于500亿，近一年净利润增速大于30%，机构持仓比例高';
const selectType = 'A股'; // A股 | 港股 | 美股 | 基金 | ETF | 债券 | 可转债 | 板块

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
console.log(JSON.stringify(data?.data ?? {}, null, 2));
```

## Screening dimensions

```js
// Technical
const tech = '均线多头排列，近5日成交量持续放大，RSI < 70';
// Fundamental
const fund = 'PE < 15，PB < 2，ROE > 12%，资产负债率 < 50%';
// News / sentiment
const news = '近一周机构调研次数超过5次，分析师评级上调';
// Capital flow
const flow = '主力净流入连续3天，北向资金净买入';
// Cross-market
const cross = 'HK tech stocks with P/E under 20 and dividend yield > 3%';
```

## Select type reference

```js
// Available selectType values
const types = ['A股', '港股', '美股', '基金', 'ETF', '债券', '可转债', '板块'];
// '' = auto-detect from query
```

## Notes

- Same API endpoint as `mx-stockpick`: `https://ai-saas.eastmoney.com/proxy/b/mcp/tool/selectSecurity`
- Auth header: `em_api_key`
- Combine multiple criteria in one query for most powerful filtering
- Results returned in `data.data`
