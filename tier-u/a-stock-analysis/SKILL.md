---
name: a-stock-analysis
description: China A-share stock analysis: real-time quotes, K-line, technical indicators (MA, RSI, MACD, Bollinger). Shanghai/Shenzhen stock market. No API key required.
version: 2.6
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.
>
> **Two ways to call:**
> - JS: `await aStockApi.runFromParams({code:"600036"})` or `await aStockApi.getQuote("600036")`
> - Terminal: `run /skills/a-stock-analysis/scripts/a-stock-analysis.js 600036`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --code 600036`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action analyze --code 600036`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action quote --code 600036`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action kline --code 600036 --days 30`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action minKline --code 600036 --days 5`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action gainers --count 10`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action losers --count 10`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action mostActive --count 10`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action volume --code 600036`
>   `run /skills/a-stock-analysis/scripts/a-stock-analysis.js --action portfolio --portfolio '[["600036",100,35],["000001",200,12.5]]'`

# a-stock-analysis

获取A股（沪深）股票的实时行情与技术指标分析。不需要API Key，直接调用EastMoney免费接口。

## JS API

```js
// Full analysis (default action)
await aStockApi.runFromParams({code: "600036"});

// Individual functions
await aStockApi.getQuote("600036");
await aStockApi.getKline("600036", 30);
await aStockApi.getMinKline("600036", 5);
await aStockApi.getTopGainers(10);
await aStockApi.getTopLosers(10);
await aStockApi.getMostActive(10);
await aStockApi.analyzeVolume("600036");
await aStockApi.portfolioPnL([["600036", 100, 35]]);

// Via runFromParams
await aStockApi.runFromParams({code: "600036", action: "analyze"});
await aStockApi.runFromParams({code: "600036", action: "quote"});
await aStockApi.runFromParams({code: "000001", action: "kline", days: 10});
await aStockApi.runFromParams({code: "000001", action: "minKline", days: 5});
await aStockApi.runFromParams({code: "600036", action: "volume"});
await aStockApi.runFromParams({action: "gainers", count: 10});
await aStockApi.runFromParams({action: "losers", count: 10});
await aStockApi.runFromParams({action: "mostActive", count: 10});
await aStockApi.runFromParams({portfolio: [["600036", 100, 35], ["000001", 200, 12.5]]});
```

### 返回内容

- `price` — 最新价
- `changeAmt` / `changePct` — 涨跌额/涨跌幅
- `ma5` / `ma10` / `ma20` — 均线
- `rsi` — RSI相对强弱指标
- `macd` — MACD指标 { dif, dea, macd }
- `bollinger` — 布林带 { upper, middle, lower }
- `volRatio` — 量比
- `message` — 简化的分析报告字符串

### 注意事项

- `code` 为6位沪深股票代码（6开头沪市，0/3开头深市）
- 交易时间：周一至周五 9:30–11:30、13:00–15:00（北京时间）
- EastMoney API 仅支持中国A股，不支持美股

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/a-stock-analysis.js --action quote --code 600036
```
