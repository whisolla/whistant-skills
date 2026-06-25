---
name: citedy
description: "Citedy SEO Content Autopilot — AI marketing toolkit for trend scouting, competitor analysis, article generation with AI illustrations and voice-over in 55 languages, social media adaptations, lead magnets, content ingestion, and short-form video. Triggers on: SEO content, citedy, autopilot article, trend scan, content marketing, generate article, social adaptation. Evolved from fly0pants/adclaw version 1.0.29 at 2026-05-26."
version: 3.1
keychain: [CITEDY_API_KEY]
---
# citedy — SEO Content Autopilot

Full-stack AI marketing toolkit powered by Citedy (https://www.citedy.com).
Generate SEO-optimized articles, scan trends, adapt content for social media, and more.

**Base URL:** `https://www.citedy.com`
**Auth:** `Authorization: Bearer <api_key>` (prefix: `citedy_agent_`)
**Pricing:** 1 credit = $0.01 USD

## Quick Start

### `/cmd` — Terminal invocation

```bash
# Agent status & balance
run /skills/adclaw/scripts/adclaw.js status
run /skills/adclaw/scripts/adclaw.js me

# List writing personas
run /skills/adclaw/scripts/adclaw.js personas

# List articles
run /skills/adclaw/scripts/adclaw.js articles --status published --limit 10

# Trend scan (costs credits: fast=2, deep=4, ultra=6, ultra+=8)
run /skills/adclaw/scripts/adclaw.js scan --query "AI marketing trends" --mode fast --limit 5

# Generate article (turbo=2cr, standard=20cr)
run /skills/adclaw/scripts/adclaw.js article --topic "How AI is changing SEO" --mode turbo
run /skills/adclaw/scripts/adclaw.js article --topic "Content strategy 2026" --mode standard --size mini

# Social adaptation (~5cr/platform)
run /skills/adclaw/scripts/adclaw.js adapt --article <article_id> --platforms linkedin,x_thread

# Settings & schedule
run /skills/adclaw/scripts/adclaw.js settings
run /skills/adclaw/scripts/adclaw.js schedule
run /skills/adclaw/scripts/adclaw.js gaps --days 7
```

### `/code` — JS require path

```js
var citedy = require("/skills/adclaw/scripts/adclaw.js");

// Set API key (or via globalThis.CITEDY_API_KEY or keychain)
citedy.init("citedy_agent_...");

// Free endpoints — no credit cost
console.log(await citedy.getMe());
console.log(await citedy.getStatus());
console.log(await citedy.getPersonas());
console.log(await citedy.listArticles({ status: "published", limit: 5 }));
console.log(await citedy.getSettings());
console.log(await citedy.getSchedule({ type: "all" }));
console.log(await citedy.getScheduleGaps({ days: 7 }));

// Paid endpoints — costs credits
console.log(await citedy.scanTrends({ query: "AI marketing", mode: "fast", limit: 5 }));
console.log(await citedy.createArticle({ topic: "AI SEO tips", mode: "turbo" }));
console.log(await citedy.createArticle({ topic: "Content strategy", mode: "standard", size: "mini" }));
console.log(await citedy.adaptArticle({ article_id: "uuid", platforms: ["linkedin"] }));
```

## Exported Functions (27)

| Function | Credits | Description |
|----------|---------|-------------|
| `init(apiKey)` | free | Set API key for this session |
| `hasKey()` | free | Check if API key is configured |
| `getMe()` | free | Agent info, balance, rate limits, platforms |
| `getStatus()` | free | Operational readiness snapshot |
| `getPersonas()` | free | 25 writing personas (Hemingway, Musk, etc.) |
| `listArticles(opts)` | free | List published/draft articles |
| `getSettings()` | free | Agent configuration |
| `getSchedule(opts)` | free | Content schedule timeline |
| `getScheduleGaps(opts)` | free | Find schedule coverage gaps |
| `scanTrends(opts)` | 2-8 | Trend scan (X, web, HN, Reddit) |
| `createArticle(opts)` | 2-139 | Generate SEO article |
| `adaptArticle(opts)` | ~5/platform | Create social media adaptations |

### Command-line flags

| Flag | Values | Used by |
|------|--------|---------|
| `--status` | published, generated, draft | articles |
| `--limit` | 1-100 | articles, scan |
| `--query` | any text | scan |
| `--mode` | fast, deep, ultra, ultra+, turbo, standard | scan, article |
| `--topic` | any text | article |
| `--size` | mini, standard, full, pillar | article |
| `--language` | ISO code (en, es, fr, …) | article |
| `--persona` | musk, hemingway, jobs, … | article |
| `--article` | UUID | adapt |
| `--platforms` | linkedin,x_thread,facebook,… | adapt |
| `--days` | 1-30 | gaps |

## API Reference

For the complete API reference (20+ endpoints including webhooks, shorts, lead magnets, ingest, competitors, products, publish, register), see the full docs at https://www.citedy.com or consult `skill_uptodate.md` in this directory.

### Core Endpoints

| Endpoint | Method | Cost |
|----------|--------|------|
| `/api/agent/me` | GET | free |
| `/api/agent/status` | GET | free |
| `/api/agent/personas` | GET | free |
| `/api/agent/articles` | GET | free |
| `/api/agent/settings` | GET/PUT | free |
| `/api/agent/schedule` | GET | free |
| `/api/agent/schedule/gaps` | GET | free |
| `/api/agent/scan` | POST | 2-8 cr |
| `/api/agent/autopilot` | POST | 2-139 cr |
| `/api/agent/adapt` | POST | ~5 cr/platform |

### Article Modes & Pricing

| Mode | Credits | Speed | Notes |
|------|---------|-------|-------|
| Turbo | 2 | 5-15s | Micro-article, no search |
| Turbo+ | 4 | 10-25s | Turbo + web search |
| Standard mini | 15 | 30-60s | ~500 words |
| Standard | 20 | 30-120s | ~1000 words |
| Standard full | 33 | 60-120s | ~1500 words |
| Standard pillar | 48 | 60-120s | ~2500 words |

Extensions: +illustrations (9-36cr), +audio (10-55cr), +competition analysis (8cr, on by default).

### Trend Scan Modes

| Mode | Credits | Sources |
|------|---------|---------|
| fast | 2 | X/Twitter only |
| deep | 4 | X + web |
| ultra | 6 | + HackerNews |
| ultra+ | 8 | + Reddit |

## Credential Setup

The API key resolves in this order:
1. `globalThis.CITEDY_API_KEY` (pre-injected for device testing)
2. `globalThis.ADCLAW_API_KEY` (legacy env var)
3. `keychain.get('CITEDY_API_KEY')` (Whistant keychain)
4. `keychain.get('ADCLAW_API_KEY')` (legacy keychain)

Set via `/code` (uses keychain in the real Whistant app):
```js
var citedy = require("/skills/adclaw/scripts/adclaw.js");
console.log(citedy.init("citedy_agent_..."));
// Or store persistently via keychain:
// console.log(citedy.configure("citedy_agent_..."));
```

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
CITEDY_API_KEY="citedy_agent_..." node scripts/adclaw.js me
```
