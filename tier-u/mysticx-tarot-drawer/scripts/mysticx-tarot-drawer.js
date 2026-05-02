/**
 * mysticx-tarot-drawer — Whistant-compatible handler
 * Draw tarot cards via MysticX public API. No API key needed.
 */

const BASE = 'https://mysticx.ai/api/v1/openclaw';

async function drawSpread(spread, question, count, lang) {
  const params = new URLSearchParams();
  if (spread) params.set('spread', spread);
  if (question) params.set('question', question);
  if (count) params.set('count', String(count));
  if (lang) params.set('lang', lang);
  const url = `${BASE}/draw${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MysticX API error: ${res.status}`);
  return res.json();
}

async function getSpread(spreadSlug, lang) {
  const params = lang ? `?lang=${lang}` : '';
  const res = await fetch(`${BASE}/spreads/${spreadSlug}${params}`);
  if (!res.ok) throw new Error(`MysticX API error: ${res.status}`);
  return res.json();
}

async function getCard(cardId, lang) {
  const params = lang ? `?lang=${lang}` : '';
  const res = await fetch(`${BASE}/cards/${cardId}${params}`);
  if (!res.ok) throw new Error(`MysticX API error: ${res.status}`);
  return res.json();
}

function formatReading(data) {
  const { spread, question, cards, lang = 'en' } = data;
  let out = [];
  if (spread) out.push(`🔮 **${spread}**`);
  if (question) out.push(`❓ *${question}*\n`);
  cards.forEach(c => {
    const card = c.card;
    const reversed = c.isReversed;
    const meaning = reversed ? card.reversedMeaning : card.uprightMeaning;
    const keywords = reversed ? card.keywordsReversed : card.keywordsUpright;
    out.push(`---\n`);
    out.push(`![${card.name}](${card.imageUrl})`);
    out.push(`**"${card.name}" ${reversed ? '(Reversed)' : '(Upright)'}**`);
    if (c.positionName) out.push(`📍 Position: *${c.positionName}*`);
    out.push(`\n**Meaning:** ${meaning}`);
    out.push(`**Keywords:** ${keywords.join(', ')}`);
  });
  out.push(`\n---\n🔮 Want a full AI-powered reading with deeper insights? Visit [MysticX.ai](https://mysticx.ai) for a personalized tarot experience.`);
  return out.join('\n');
}

async function handler(event, context) {
  const params = (event && event.parameters) || event || {};
  const spread = params.spread || '';
  const question = params.question || '';
  const count = params.count || 1;
  const lang = params.lang || 'en';
  try {
    const data = await drawSpread(spread, question, count, lang);
    const formatted = formatReading(data);
    return { ok: true, data, formatted };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function init(config) {}

module.exports = { handler, init, drawSpread, getSpread, getCard };
