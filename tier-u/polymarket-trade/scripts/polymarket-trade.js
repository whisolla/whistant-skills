/**
 * polymarket-trade skill — Whistant-compatible handler
 * Browse/monitor Polymarket prediction markets via free Gamma API.
 * No API key required.
 */

const BASE = 'https://gamma-api.polymarket.com';

/**
 * Get trending markets by 24h volume.
 */
async function getTrending(limit = 10) {
  const url = `${BASE}/events?order=volume24hr&ascending=false&closed=false&limit=${limit}`;
  const res = await fetch(url);
  return res.json();
}

/**
 * Search markets by keyword.
 */
async function search(query, limit = 10) {
  const url = `${BASE}/events?q=${encodeURIComponent(query)}&closed=false&limit=${limit}`;
  const res = await fetch(url);
  return res.json();
}

/**
 * Get biggest price movers in 24h.
 */
async function getMovers(limit = 10) {
  const url = `${BASE}/markets?order=priceChange24h&ascending=false&closed=false&limit=${limit}`;
  const res = await fetch(url);
  return res.json();
}

/**
 * Parse a market object into structured format.
 * outcomePrices are 0–1 floats (multiply by 100 for percentage).
 */
function parseMarket(market) {
  const outcomes = market.outcomes ?? [];
  const prices = (market.outcomePrices ?? []).map(p => parseFloat(p));
  return {
    question: market.question,
    volume: parseFloat(market.volume ?? 0),
    volume24hr: parseFloat(market.volume24hr ?? 0),
    endDate: market.endDate,
    closed: market.closed ?? false,
    outcomes: outcomes.map((name, i) => ({
      name,
      probability: prices[i] ?? 0,
      percentage: ((prices[i] ?? 0) * 100).toFixed(1) + '%',
    })),
  };
}

/**
 * Format trending events nicely.
 */
function formatEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return 'No markets found.';
  return events.map((e, i) => {
    let lines = [`${i + 1}. ${e.title || e.question}`, `   Volume: $${parseFloat(e.volume24hr || e.volume || 0).toLocaleString()}`];
    if (e.markets && e.markets.length > 0) {
      e.markets.slice(0, 2).forEach(m => {
        if (Array.isArray(m.outcomes)) {
          m.outcomes.forEach((outcome, j) => {
            const prob = parseFloat(m.outcomePrices?.[j] ?? 0) * 100;
            if (prob > 0) lines.push(`   ${outcome}: ${prob.toFixed(1)}%`);
          });
        }
      });
    }
    return lines.join('\n');
  }).join('\n\n');
}

/**
 * Format markets nicely (from /markets endpoint).
 */
function formatMarkets(markets) {
  if (!Array.isArray(markets) || markets.length === 0) return 'No markets found.';
  return markets.map((m, i) => {
    let lines = [`${i + 1}. ${m.question || m.title}`, `   24h Volume: $${parseFloat(m.volume24hr || 0).toLocaleString()}`];
    if (Array.isArray(m.outcomes)) {
      m.outcomes.forEach((outcome, j) => {
        const prob = parseFloat(m.outcomePrices?.[j] ?? 0) * 100;
        if (prob > 0) lines.push(`   ${outcome}: ${prob.toFixed(1)}%`);
      });
    }
    return lines.join('\n');
  }).join('\n\n');
}

async function handler(event, context) {
  const { action = 'trending', query = '', limit = 10 } = event;
  try {
    let data, formatted;
    if (action === 'search') {
      data = await search(query, limit);
      formatted = formatEvents(data);
    } else if (action === 'movers') {
      data = await getMovers(limit);
      formatted = formatMarkets(data);
    } else {
      data = await getTrending(limit);
      formatted = formatEvents(data);
    }
    // Return ONLY the formatted string — AI should print this directly, not JSON
    return formatted || 'No markets found.';
  } catch (err) {
    return 'Error: ' + err.message;
  }
}

function init(config) {}

module.exports = { handler, init, getTrending, search, getMovers, parseMarket, formatEvents, formatMarkets };
