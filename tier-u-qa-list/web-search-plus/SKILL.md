---
name: web-search-plus
description: Unified search guidance with intelligent provider routing. Helps users choose the best search provider for their query type — Serper (Google), Tavily (Research), Querit (Multilingual AI), Exa (Neural), Perplexity (AI Answers), You.com (RAG/Real-time), and SearXNG (Privacy). Provides search strategy, query optimization, and multi-source research methodology.
version: 1.0
---

# Web Search Plus

> **Whistant Runtime:** Pure prompt guidance. No API keys or code execution required — the AI uses this skill to guide users on search strategy, provider selection, and query optimization. Helps the user choose the right tool for each search task.

## Overview

Stop guessing which search provider to use. This skill helps you select the best search approach for any query — whether you need product prices, deep research, AI-synthesized answers, or private searching.

---

## Search Provider Selection Guide

| You want to... | Best Provider | Why |
|---|---|---|
| Find product prices | **Serper** (Google) | Shopping-optimized results |
| Find local businesses | **Serper** (Google) | Maps + reviews |
| Understand complex topics | **Tavily** | Research-grade depth |
| Do deep research | **Tavily** | Structured, comprehensive |
| Search across languages | **Querit** | Multilingual AI search |
| Find similar companies/tools | **Exa** | Neural similarity search |
| Find research papers | **Exa** | Academic/neural search |
| Get direct answers with sources | **Perplexity** | AI-synthesized + citations |
| Know current events | **Perplexity** | Real-time AI answers |
| Get real-time info | **You.com** | RAG + real-time |
| Search privately | **SearXNG** | Self-hosted, no tracking |

---

## Provider Reference

| Provider | Free Tier | Sign Up | API Docs |
|----------|-----------|---------|----------|
| **Serper** | 2,500/month | serper.dev | Google Search API |
| **Tavily** | 1,000/month | tavily.com | AI research API |
| **Querit** | Varies | querit.ai | Multilingual search |
| **Exa** | 1,000/month | exa.ai | Neural search |
| **Perplexity** | Via Kilo | kilo.ai | AI answers API |
| **You.com** | Limited | api.you.com | RAG search API |
| **SearXNG** | FREE | Self-hosted | Meta search engine |

---

## Query Optimization

### Query Type Detection

| Query Pattern | Provider | Example |
|---|---|---|
| Shopping keywords (price, buy, best) | Serper | "iPhone 16 Pro Max price" |
| Research questions (how, why, explain) | Tavily | "how does HTTPS encryption work" |
| Multilingual + recency | Querit | "latest AI policy updates in Germany" |
| URL detected + similarity | Exa | "companies like stripe.com" |
| Local + direct answer | Perplexity | "events in Berlin this weekend" |
| Real-time intent (latest, breaking, news) | You.com | "latest AI regulation news" |
| Privacy keywords (private, anonymous) | SearXNG | anything, privately |

### Advanced Search Techniques

**For Research:**
- Break complex questions into sub-queries
- Cross-reference results across 2+ providers
- Use Tavily for depth, Serper for breadth

**For Shopping:**
- Include price qualifiers: "under $X", "best budget"
- Add year/version: "2024", "latest model"
- Check multiple sources for price verification

**For Current Events:**
- Include date qualifiers or recency hints
- Use You.com or Perplexity for real-time
- Cross-reference major news sources

---

## Multi-Source Research Workflow

1. **Initial Search:** Use Perplexity for quick AI-synthesized answer with citations
2. **Deep Dive:** Use Tavily for comprehensive research on key topics
3. **Cross-check:** Use Serper to verify facts against Google's index
4. **Source Discovery:** Use Exa to find similar/related sources
5. **Final Verification:** Cross-reference key claims across 2+ sources

---

## Privacy-First Searching

For sensitive queries, use SearXNG (self-hosted meta search engine):
- Aggregates results from Google, Bing, DuckDuckGo, and more
- No tracking, no logs, no user profiling
- Can be self-hosted for maximum privacy
- Supports custom search engine selection

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| Irrelevant results | Query too broad | Add specific terms, date ranges |
| Too few results | Query too narrow | Broaden keywords, remove filters |
| Outdated info | Search engine cache | Add year/recency to query |
| Biased results | Single provider | Cross-reference with another provider |
| API limit hit | Free tier exhausted | Rotate providers, wait for reset |

---

## Quick Reference

| Search Goal | Provider | Query Formula |
|---|---|---|
| Buy something | Serper | "[product] [price/best] [year]" |
| Learn something | Tavily | "how/why/explain [topic]" |
| Find similar | Exa | "like [example]" or "[category] similar to [name]" |
| Get answer | Perplexity | Direct question + "with sources" |
| Latest news | You.com | "[topic] latest [year]" |
| Stay private | SearXNG | Any query |
