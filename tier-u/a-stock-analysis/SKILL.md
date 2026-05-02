---
name: a-stock-analysis
description: A股实时行情与技术分析（沪深股票）。不需要API Key。
version: 2.2
---

# a-stock-analysis

获取A股（沪深）股票的实时行情与技术指标分析。不需要API Key，直接调用EastMoney免费接口。

## 使用方法

**直接调用 `handler()` 即可：**

```
handler({ parameters: { code: "600036" } })
```

`handler()` 会自动获取实时行情、K线数据，并计算 MA、RSI、MACD、布林带、量比等技术指标，返回完整的分析报告。

### 示例

| 股票 | 调用方式 |
|------|----------|
| 招商银行 | `handler({ parameters: { code: "600036" } })` |
| 平安银行 | `handler({ parameters: { code: "000001" } })` |
| 宁德时代 | `handler({ parameters: { code: "300750" } })` |

### 返回内容

- `price` — 最新价
- `changeAmt` / `changePct` — 涨跌额/涨跌幅
- `ma5` / `ma10` / `ma20` — 均线
- `rsi` — RSI相对强弱指标
- `macd` — MACD指标 { dif, dea, macd }
- `bollinger` — 布林带 { upper, middle, lower }
- `volRatio` — 量比
- `message` — 格式化的中文分析报告

### 注意事项

- `code` 为6位沪深股票代码（6开头沪市，0/3开头深市）
- 交易时间：周一至周五 9:30–11:30、13:00–15:00（北京时间）
