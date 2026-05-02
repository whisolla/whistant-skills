// News summary helpers for iPhone JS sandbox
// Uses fetch() + manual XML parsing — no libraries required

const FEEDS = {
  bbcWorld: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  bbcTop: 'https://feeds.bbci.co.uk/news/rss.xml',
  bbcBusiness: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  bbcTech: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  reuters: 'https://www.reutersagency.com/feed/?best-regions=world',
  npr: 'https://feeds.npr.org/1001/rss.xml',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
};

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag) => {
      try {
        const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
      } catch (e) { return ''; }
    };
    items.push({
      title: getTag('title'),
      description: getTag('description'),
      link: getTag('link'),
      pubDate: getTag('pubDate'),
      source: 'RSS',
    });
  }
  return items;
}

async function fetchFeed(feedUrl, { maxItems = 10 } = {}) {
  const res = await fetch(feedUrl, { timeout: 10 });
  if (!res.ok) throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  const items = parseRSS(xml);
  return items.slice(0, maxItems);
}

async function getNewsBriefing({ sources = ['bbcWorld'], maxPerSource = 5 } = {}) {
  const results = {};
  for (const key of sources) {
    const url = FEEDS[key] || key;
    try {
      results[key] = await fetchFeed(url, { maxItems: maxPerSource });
    } catch (e) {
      results[key] = [];
      console.warn(`Failed to fetch ${key}: ${e.message}`);
    }
  }
  return results;
}

function formatBriefing(news) {
  let output = '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  output += `📰 News Briefing — ${today}\n\n`;
  for (const [source, items] of Object.entries(news)) {
    if (!items || items.length === 0) continue;
    output += `🌐 ${source.toUpperCase()}\n`;
    items.forEach((item, i) => {
      const desc = item.description?.replace(/<[^>]+>/g, '').trim().slice(0, 200) || '';
      output += `${i + 1}. ${item.title}\n   ${desc}...\n   ${item.link}\n\n`;
    });
  }
  return output;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FEEDS, parseRSS, fetchFeed, getNewsBriefing, formatBriefing };
} else if (typeof globalThis !== 'undefined') {
  globalThis.newsSummary = { FEEDS, parseRSS, fetchFeed, getNewsBriefing, formatBriefing };
}
