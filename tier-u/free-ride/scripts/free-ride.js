/**
 * free-ride.js — Free AI models via OpenRouter for Whistant iOS JS runtime
 *
 * Fetches models from OpenRouter, filters to free-only, ranks by quality,
 * and can write the best config to openclaw.json.
 *
 * Usage:
 *   const fr = require('./free-ride.js');
 *   const models = await fr.fetchAllModels();
 *   const free = fr.filterFreeModels(models);
 *   const ranked = fr.rankFreeModels(free);
 *   const config = fr.buildOpenClawConfig(ranked);
 *   fr.writeConfig(config);
 */

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch all available models from OpenRouter
 * @param {string} [apiKey] — defaults to process.env.OPENROUTER_API_KEY
 */
async function fetchAllModels(apiKey) {
  const key = apiKey || process.env?.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');
  const res = await fetch(OPENROUTER_API, {
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
}

// ─── Filtering & ranking ────────────────────────────────────────────────────

/**
 * Filter to free-only models (prompt price === 0)
 * @param {object[]} models
 */
function filterFreeModels(models) {
  return models.filter(m => {
    const prompt = parseFloat(m.pricing?.prompt ?? '1');
    return prompt === 0;
  });
}

/**
 * Rank free models by quality heuristic:
 * - Larger context window → higher score
 * - Known quality providers (qwen, deepseek, mistral, llama, gemma, nvidia, google) → bonus
 * @param {object[]} freeModels
 */
function rankFreeModels(freeModels) {
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

// ─── Config builder ─────────────────────────────────────────────────────────

/**
 * Format model ID for OpenClaw: openrouter/<provider>/<model>:free
 */
function formatModelId(id) {
  if (id === 'openrouter/free') return 'openrouter/free';
  if (id.startsWith('openrouter/')) return id;
  return `openrouter/${id}`;
}

/**
 * Build OpenClaw config from ranked models
 * @param {object[]} rankedModels
 * @param {number} [count=5] — number of fallback models
 */
function buildOpenClawConfig(rankedModels, count = 5) {
  const primary = formatModelId(rankedModels[0]?.id ?? 'openrouter/free');
  const fallbacks = [
    'openrouter/free',
    ...rankedModels.slice(1, count).map(m => formatModelId(m.id)),
  ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

  return {
    primary,
    fallbacks,
    config: {
      'agents.defaults.model.primary': primary,
      'agents.defaults.model.fallbacks': fallbacks,
    },
  };
}

// ─── Config writing ──────────────────────────────────────────────────────────

/**
 * Write config to openclaw.json (deep-merge)
 * @param {object} configObj — the config object to merge
 * @param {string} [configPath] — defaults to $HOME/.openclaw/openclaw.json
 */
function writeConfig(configObj, configPath) {
  const fs = require('fs');
  const path = require('path');
  const home = process.env?.HOME || '/root';
  const target = configPath || path.join(home, '.openclaw', 'openclaw.json');

  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(target, 'utf8')); } catch (e) {}

  function setNested(obj, keyPath, value) {
    const parts = keyPath.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  for (const [key, value] of Object.entries(configObj)) {
    setNested(existing, key, value);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(existing, null, 2));
  console.log('✅ Config written to', target);
  console.log('   Run: openclaw gateway restart');
}

// ─── Quick view ──────────────────────────────────────────────────────────────

/**
 * List free models (quick summary)
 * @param {object[]} freeModels
 */
function listFreeModels(freeModels) {
  const ranked = rankFreeModels(freeModels);
  ranked.slice(0, 20).forEach(m => {
    const ctx = m.context_length ? `${Math.round(m.context_length / 1024)}k` : '?';
    console.log(`${m._score.toFixed(0).padStart(3)} | ${ctx.padStart(4)}k ctx | ${m.id}`);
  });
}

module.exports = {
  fetchAllModels,
  filterFreeModels,
  rankFreeModels,
  buildOpenClawConfig,
  writeConfig,
  listFreeModels,
};
