---
name: qmd
description: Search and index local files using BM25 text search (via fs) and vector search via Ollama embeddings. No CLI required — pure JS implementation.
version: 1.0
---
# qmd

Search local files using BM25 keyword matching and optional vector search via Ollama. Pure `fs` + `fetch()` — no CLI required.

## BM25 text search (keyword)

```js
const fs = require('fs');
const path = require('path');

// Index: scan directory for markdown/text files
// Note: Whistant's fs.readdirSync returns string[] (filenames only).
// Use fs.statSync(full) which returns { size, isFile, isDirectory } (properties, not methods).
function indexFiles(dir, mask = /\.(md|txt|js|ts)$/) {
  const files = [];
  function walk(d) {
    const names = fs.readdirSync(d);
    for (const name of names) {
      const full = path.join(d, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory) walk(full);
      else if (stat.isFile && mask.test(name)) files.push(full);
    }
  }
  walk(dir);
  return files;
}

// BM25-style search (simplified TF-IDF)
function bm25Search(files, query, topK = 10) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scores = files.map(filePath => {
    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
    const words = content.split(/\s+/);
    const tf = terms.reduce((sum, t) => sum + words.filter(w => w.includes(t)).length, 0);
    const score = tf / Math.sqrt(words.length + 1);
    return { filePath, score, preview: content.slice(0, 200) };
  });
  return scores.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}

const files = indexFiles('/path/to/docs');
const results = bm25Search(files, 'authentication API');
results.forEach(r => console.log(r.score.toFixed(3), r.filePath));
```

## Get a specific file excerpt

```js
function getDocExcerpt(filePath, startLine = 1, numLines = 40) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  return lines.slice(startLine - 1, startLine - 1 + numLines).join('\n');
}

const excerpt = getDocExcerpt('/path/to/docs/readme.md', 10, 40);
console.log(excerpt);
```

## Vector search via Ollama embeddings

```js
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

async function getEmbedding(text, model = 'nomic-embed-text') {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: text }),
  });
  return (await res.json()).embedding;
}

function cosineSim(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}

async function vectorSearch(files, query, topK = 5, model = 'nomic-embed-text') {
  const queryEmbed = await getEmbedding(query, model);
  const scored = [];
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8').slice(0, 2000); // first 2k chars
    const embed = await getEmbedding(content, model);
    const sim = cosineSim(queryEmbed, embed);
    scored.push({ filePath, sim, preview: content.slice(0, 150) });
  }
  return scored.sort((a, b) => b.sim - a.sim).slice(0, topK);
}

// Usage (requires Ollama running with nomic-embed-text pulled)
const results = await vectorSearch(files, 'how to authenticate users');
results.forEach(r => console.log(r.sim.toFixed(3), r.filePath));
```

## Hybrid search (BM25 + vector rerank)

```js
async function hybridSearch(files, query, topK = 5) {
  // Step 1: BM25 candidates (broader)
  const bm25Results = bm25Search(files, query, topK * 3);
  if (bm25Results.length === 0) return [];

  // Step 2: Vector rerank the BM25 candidates
  const queryEmbed = await getEmbedding(query);
  const reranked = [];
  for (const r of bm25Results) {
    const content = fs.readFileSync(r.filePath, 'utf8').slice(0, 2000);
    const embed = await getEmbedding(content);
    const sim = cosineSim(queryEmbed, embed);
    reranked.push({ ...r, vectorSim: sim, combined: r.score * 0.4 + sim * 0.6 });
  }
  return reranked.sort((a, b) => b.combined - a.combined).slice(0, topK);
}

const hybrid = await hybridSearch(files, 'webhook setup guide');
hybrid.forEach(r => console.log(r.combined.toFixed(3), r.filePath));
```

## Status check

```js
function collectionStatus(dir) {
  const files = indexFiles(dir);
  const totalSize = files.reduce((s, f) => s + fs.statSync(f).size, 0);
  return { files: files.length, totalSizeKB: (totalSize / 1024).toFixed(1), dir };
}

console.log(collectionStatus('/path/to/docs'));
```

## Notes

- BM25 works offline — no Ollama needed
- Vector search requires Ollama running: `ollama serve` + `ollama pull nomic-embed-text`
- `OLLAMA_URL` default: `http://localhost:11434`
- For large corpora, pre-compute and cache embeddings to a JSON file
- Original `qmd` CLI: `npm i -g https://github.com/tobi/qmd` (not available in JSCore)
