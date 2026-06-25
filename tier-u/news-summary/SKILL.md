---
name: news-summary
description: Get today's news briefing — fetches RSS feeds from BBC, Reuters, NPR, Al Jazeera and summarizes top stories. Evolved from joargp/news-summary version 1.0.1 at 2026-05-15.
version: 1.0
---

# News Summary

Fetch and summarize news from trusted international RSS feeds. Triggered when user asks for "news", "headlines", "what's happening", "daily briefing".

## RSS Feed Sources

| Source | URL | Best for |
|--------|-----|---------|
| BBC World | `https://feeds.bbci.co.uk/news/world/rss.xml` | World news |
| BBC Top Stories | `https://feeds.bbci.co.uk/news/rss.xml` | Top headlines |
| BBC Business | `https://feeds.bbci.co.uk/news/business/rss.xml` | Business |
| BBC Technology | `https://feeds.bbci.co.uk/news/technology/rss.xml` | Tech |
| Reuters | `https://www.reutersagency.com/feed/?best-regions=world` | World |
| NPR | `https://feeds.npr.org/1001/rss.xml` | US perspective |
| Al Jazeera | `https://www.aljazeera.com/xml/rss/all.xml` | Global South |

---

## Step 1 — Fetch RSS

```js
// Fetch BBC World News RSS
const url = 'https://feeds.bbci.co.uk/news/world/rss.xml';
const res = await fetch(url);
const xml = await res.text();
```

---

## Step 2 — Parse XML (manual, no library needed)

```js
// Extract <item> blocks from RSS XML
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag) => {
      // Match tag content, handling CDATA wrappers
      const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      if (!m) return '';
      let content = m[1];
      // Strip CDATA wrapper if present: <![CDATA[...]]>
      content = content.replace(/^<!\[CDATA\[([\\s\\S]*?)\]\]>$/, '$1');
      // Strip any remaining HTML/XML tags
      content = content.replace(/<[^>]+>/g, '').trim();
      return content;
    };
    items.push({
      title: getTag('title'),
      description: getTag('description'),
      link: getTag('link'),
      pubDate: getTag('pubDate'),
    });
  }
  return items;
}

const stories = parseRSS(xml);
const top5 = stories.slice(0, 5);
// Each story: { title, description, link, pubDate }
```

---

## Step 3 — Build Briefing (send to LLM)

```
Summarize today's top news from these headlines. Group by topic.
For each story give: headline + 1 sentence of context.

Headlines:
[TITLES HERE]

Return as:
📰 WORLD: ...
💼 BUSINESS: ...
💻 TECH: ...
```

---

## Step 4 — Voice Summary (optional)

Whistant has built-in text-to-speech. No external API needed. After generating the text summary, use Whistant's Talk Mode to read it aloud.

---

## Full Example Script

```js
// Fetch + parse BBC world news, get top 5
const res = await fetch('https://feeds.bbci.co.uk/news/world/rss.xml');
const xml = await res.text();

const items = [];
const re = /<item>([\s\S]*?)<\/item>/gi;
let m;
while ((m = re.exec(xml)) !== null) {
  const xml2 = m[1];
  const t = xml2.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const d = xml2.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
  const l = xml2.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  items.push({
    title: t ? t[1].replace(/<[^>]+>/g,'').trim() : '',
    desc: d ? d[1].replace(/<[^>]+>/g,'').trim().slice(0,200) : '',
    link: l ? l[1].replace(/<[^>]+>/g,'').trim() : '',
  });
}

const top = items.slice(0, 8);
top.forEach((s, i) => console.log(`${i+1}. ${s.title}`));
// → 1. [Headline]
//    [Description preview]
//    Link: [url]
```

---

## Output Format Template

```
📰 News Briefing — [today's date]

🌍 WORLD
• [headline] — [1-sentence context]
• ...

💼 BUSINESS
• [headline] — [1-sentence context]
• ...

💻 TECH
• [headline] — [1-sentence context]
• ...

Sources: BBC World · Reuters · NPR
```

## Tips
- Always try BBC World first (most reliable)
- Al Jazeera adds Global South perspective
- Combine 2-3 feeds for a balanced briefing
- Fetch + parse + LLM summary = full briefing in <2 min

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node -e "var ns = require('./scripts/news-summary.js'); ns.getNewsBriefing({maxPerSource:1}).then(console.log)"
```
