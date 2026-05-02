/**
 * aistatus — Whistant-compatible handler
 * Check real-time AI provider status via aistatus.cc API. No API key needed.
 */

const BASE = 'https://aistatus.cc';

async function handler(event, context) {
  const params = (event && event.parameters) || event || {};
  const query = params.query || params.q || '';
  const endpoint = params.endpoint || 'all';

  try {
    let url;
    if (endpoint === 'model' && query) {
      url = `${BASE}/api/model?q=${encodeURIComponent(query)}`;
    } else if (endpoint === 'status') {
      url = `${BASE}/api/status`;
    } else if (endpoint === 'trending') {
      url = `${BASE}/api/trending`;
    } else if (endpoint === 'mmlu') {
      url = `${BASE}/api/mmlu`;
    } else if (endpoint === 'incidents') {
      url = `${BASE}/api/incidents`;
    } else {
      url = `${BASE}/api/all`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`aistatus.cc API error: ${res.status}`);
    const data = await res.json();

    let out = [];
    const statusEmoji = { operational: '✅', degraded: '⚠️', down: '🔴', unknown: '❓' };

    // Provider status
    const providerStatus = data.status?.providerStatus || data.providerStatus || [];
    if (providerStatus.length > 0) {
      const totalModels = data.status?.totalModels || data.totalModels || 'N/A';
      out.push(`## AI Provider Status (${totalModels} models tracked)`);
      out.push('');
      out.push('| Provider | Status | Models |');
      out.push('|----------|--------|--------|');
      for (const p of providerStatus) {
        const emoji = statusEmoji[p.status] || '❓';
        const detail = p.statusDetail ? ` — ${p.statusDetail}` : '';
        out.push(`| ${emoji} ${p.name} | ${p.status} | ${p.modelCount} |${detail}`);
      }
    }

    // Trending models
    const trendingModels = data.trending?.models || data.trending || [];
    if (trendingModels.length > 0) {
      out.push('');
      out.push(`## Trending Models (week of ${data.trending?.week || 'N/A'})`);
      out.push('');
      for (const m of trendingModels.slice(0, 10)) {
        out.push(`${m.rank || ''}. ${m.id || m.name} by ${m.provider || '?'} — ${m.tokensFormatted || m.tokens || 'N/A'}`);
      }
    }

    // LLM Leaderboard
    const mmlu = data.mmlu || [];
    if (mmlu.length > 0) {
      out.push('');
      out.push('## LLM Leaderboard (MMLU)');
      out.push('');
      out.push('| Rank | Model | Avg Score | Params |');
      out.push('|------|-------|-----------|--------|');
      for (const m of mmlu.slice(0, 10)) {
        out.push(`| ${m.rank} | ${m.name} | ${m.avgScore || 'N/A'} | ${m.params || 'N/A'}B |`);
      }
    }

    // Recent incidents
    const incidents = data.incidents || [];
    if (incidents.length > 0) {
      out.push('');
      out.push('## Recent Incidents');
      out.push('');
      const recent = incidents.slice(0, 5);
      for (const inc of recent) {
        const ts = inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'Unknown';
        out.push(`- ${ts}: ${inc.name} ${inc.from} → ${inc.to}${inc.detail ? ' (' + inc.detail + ')' : ''}`);
      }
    }

    // Updated timestamp
    if (data.lastUpdated) {
      const updated = new Date(data.lastUpdated).toLocaleString();
      out.push('');
      out.push(`*Last updated: ${updated}*`);
    }

    return { ok: true, formatted: out.join('\n'), data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function init(config) {}

module.exports = { handler, init };
