---
name: model-usage
description: Summarize per-model usage cost from CodexBar cost JSON. Parse modelBreakdowns to find current model or all-model cost breakdown.
version: 2.0
---
# model-usage

Parse CodexBar local cost JSON to summarize per-model usage. Works entirely in JS — no CLI needed.

## Get CodexBar cost JSON

First, obtain the JSON from CodexBar CLI output (run separately and paste/read the JSON):

```js
// Assume costJson is the parsed JSON array from: codexbar cost --format json --provider codex
// Or: codexbar cost --format json --provider claude
const costJson = [/* paste JSON here */];
```

## Find current model (highest cost in most recent day)

```js
function getCurrentModel(dailyEntries) {
  // Find most recent entry with modelBreakdowns
  const withBreakdowns = dailyEntries
    .filter(e => e.modelBreakdowns && Object.keys(e.modelBreakdowns).length > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (withBreakdowns.length === 0) {
    // Fallback: use modelsUsed from last entry
    const last = dailyEntries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const models = last?.modelsUsed ?? [];
    return { model: models[models.length - 1] ?? 'unknown', cost: 0, fallback: true };
  }

  const latest = withBreakdowns[0];
  const breakdowns = latest.modelBreakdowns;
  const topModel = Object.entries(breakdowns)
    .sort(([, a], [, b]) => (b.cost ?? 0) - (a.cost ?? 0))[0];

  return { model: topModel[0], cost: topModel[1].cost, date: latest.date };
}

// Usage
const entries = costJson.find(p => p.provider === 'codex')?.daily ?? [];
const current = getCurrentModel(entries);
console.log(`Current model: ${current.model} ($${current.cost?.toFixed(4)})`);
```

## All-models breakdown

```js
function getAllModels(dailyEntries) {
  const totals = {};
  for (const entry of dailyEntries) {
    const breakdowns = entry.modelBreakdowns ?? {};
    for (const [model, stats] of Object.entries(breakdowns)) {
      if (!totals[model]) totals[model] = { cost: 0, calls: 0 };
      totals[model].cost += stats.cost ?? 0;
      totals[model].calls += stats.calls ?? 0;
    }
  }
  return Object.entries(totals)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .map(([model, stats]) => ({ model, ...stats }));
}

// Usage
const entries = costJson.find(p => p.provider === 'codex')?.daily ?? [];
const allModels = getAllModels(entries);
allModels.forEach(m => console.log(`${m.model}: $${m.cost.toFixed(4)} (${m.calls} calls)`));
```

## Filter by date range

```js
function filterByDateRange(dailyEntries, startDate, endDate) {
  return dailyEntries.filter(e => {
    const d = new Date(e.date);
    return d >= new Date(startDate) && d <= new Date(endDate);
  });
}

// Last 7 days
const now = new Date();
const week = new Date(now - 7 * 24 * 60 * 60 * 1000);
const recent = filterByDateRange(entries, week.toISOString(), now.toISOString());
const weekModels = getAllModels(recent);
weekModels.forEach(m => console.log(`${m.model}: $${m.cost.toFixed(4)}`));
```

## CodexBar JSON structure reference

```js
// Expected shape of costJson (array of providers):
const exampleShape = {
  provider: 'codex', // or 'claude'
  daily: [
    {
      date: '2024-01-15',
      totalCost: 0.1234,
      modelsUsed: ['gpt-4o', 'gpt-4o-mini'],
      modelBreakdowns: {
        'gpt-4o': { cost: 0.1000, calls: 5 },
        'gpt-4o-mini': { cost: 0.0234, calls: 20 },
      },
    },
  ],
};
```

## Notes

- Run `codexbar cost --format json --provider codex` on macOS to get the raw JSON
- Paste the JSON into the `costJson` variable above
- Works fully offline — no API calls needed
