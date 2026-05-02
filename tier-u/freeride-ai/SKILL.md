---
name: freeride-ai
description: Manage free AI models from OpenRouter for OpenClaw. Fetch, rank, and configure the best free models via the OpenRouter API. Requires OPENROUTER_API_KEY. (Same as free-ride skill.)
version: 1.0
---
# free-ride

Configure OpenClaw to use free AI models from OpenRouter. Fetches models, filters to free-only, ranks by quality, and returns config to write to `~/.openclaw/openclaw.json`.

## Setup

```js
const OPENROUTER_API_KEY = 'sk-or-v1-your_key_here'; // get free key at openrouter.ai/keys
```

## Fetch all available models

```js
const res = await fetch('https://openrouter.ai/api/v1/models', {
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
const data = await res.json();
const allModels = data.data ?? [];
console.log('Total models:', allModels.length);
```

## Filter to free-only models

```js
function filterFreeModels(models) {
  return models.filter(m => {
    const prompt = parseFloat(m.pricing?.prompt ?? '1');
    return prompt === 0;
  });
}

// Usage
const freeModels = filterFreeModels(allModels);
console.log('Free models:', freeModels.length);
freeModels.forEach(m => console.log(m.id, m.name));
```

## Rank free models by quality

```js
function rankFreeModels(freeModels) {
  // Score heuristic: prefer larger context, known quality providers
  const QUALITY_PROVIDERS = ['qwen', 'deepseek', 'mistral', 'llama', 'gemma', 'nvidia', 'google'];
  return freeModels
    .map(m => {
      const ctx = parseInt(m.context_length ?? 0);
      const providerScore = QUALITY_PROVIDERS.findIndex(p => m.id.toLowerCase().includes(p));
      const score = ctx / 1000 + (providerScore >= 0 ? (QUALITY_PROVIDERS.length - providerScore) * 10 : 0);
      return { ...m, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

const ranked = rankFreeModels(freeModels);
ranked.slice(0, 10).forEach(m => console.log(m._score.toFixed(0), m.id));
```

## Build OpenClaw config (auto mode)

```js
function buildOpenClawConfig(rankedModels, count = 5) {
  // Format model ID for OpenClaw: openrouter/<provider>/<model>:free
  function formatId(id) {
    if (id === 'openrouter/free') return 'openrouter/free';
    if (id.startsWith('openrouter/')) return id;
    return `openrouter/${id}`;
  }

  const primary = formatId(rankedModels[0]?.id ?? 'openrouter/free');
  const fallbacks = [
    'openrouter/free',
    ...rankedModels.slice(1, count).map(m => formatId(m.id)),
  ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

  return {
    'agents.defaults.model.primary': primary,
    'agents.defaults.model.fallbacks': fallbacks,
  };
}

const config = buildOpenClawConfig(ranked);
console.log('Primary:', config['agents.defaults.model.primary']);
console.log('Fallbacks:', config['agents.defaults.model.fallbacks']);
```

## Write config to openclaw.json

```js
const fs = require('fs');
const configPath = `${process.env.HOME}/.openclaw/openclaw.json`;
const existing = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Deep-set nested key safely
function setNestedKey(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

setNestedKey(existing, 'agents.defaults.model.primary', config['agents.defaults.model.primary']);
setNestedKey(existing, 'agents.defaults.model.fallbacks', config['agents.defaults.model.fallbacks']);
fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));
console.log('✅ Config updated. Run: openclaw gateway restart');
```

## List free models (quick view)

```js
const res = await fetch('https://openrouter.ai/api/v1/models', {
  headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
});
const { data } = await res.json();
const free = data.filter(m => parseFloat(m.pricing?.prompt ?? '1') === 0);
const ranked = free.sort((a, b) => parseInt(b.context_length ?? 0) - parseInt(a.context_length ?? 0));
ranked.slice(0, 20).forEach(m => console.log(`${m.id} | ctx:${m.context_length}`));
```

## Notes

- Get free API key at: https://openrouter.ai/keys
- `openrouter/free` is OpenRouter's smart router — auto-picks best available model
- After writing config: restart gateway with `openclaw gateway restart`
- Free models may have rate limits — configure fallbacks to auto-rotate
