---
name: ai-ppt-generator
description: Generate PowerPoint presentations using Baidu Qianfan AI PPT API. Supports outline generation, theme selection, and full PPT generation. Requires BAIDU_API_KEY.
version: 2.0
---
# ai-ppt-generator

Generate PPT presentations via Baidu Qianfan AI API using `fetch()`. Uses streaming SSE for outline and generation.

## Setup

```js
const BAIDU_API_KEY = 'your_baidu_api_key';
const BASE = 'https://qianfan.baidubce.com/v2/tools/ai_ppt/';
const headers = {
  'Authorization': `Bearer ${BAIDU_API_KEY}`,
  'Content-Type': 'application/json',
  'X-Appbuilder-From': 'whistant',
};
```

## Get available themes

```js
const res = await fetch(`${BASE}get_ppt_theme`, { method: 'POST', headers });
const data = await res.json();
if (data.errno && data.errno !== 0) throw new Error(data.errmsg);
const themes = data.data?.ppt_themes ?? [];
themes.slice(0, 5).forEach(t => console.log(t.style_id, t.tpl_id, t.name));
```

## Generate outline (SSE streaming)

```js
const query = '人工智能发展趋势报告';

// SSE response — read line by line
const res = await fetch(`${BASE}generate_outline`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ query }),
});

const text = await res.text();
let title = '', chatId = '', queryId = '', outline = '';

for (const line of text.split('\n')) {
  if (!line.startsWith('data:')) continue;
  const delta = JSON.parse(line.slice(5).trim());
  if (!title && delta.title) { title = delta.title; chatId = delta.chat_id; queryId = delta.query_id; }
  outline += delta.outline ?? '';
}

console.log('Title:', title, '| chat_id:', chatId, '| query_id:', queryId);
console.log('Outline:', outline.slice(0, 200));
```

## Generate PPT from outline (SSE streaming)

```js
// Use values from outline generation above
const styleId = 0; // from theme list
const tplId = null; // optional template ID

const res = await fetch(`${BASE}generate_ppt_by_outline`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    query_id: parseInt(queryId),
    chat_id: parseInt(chatId),
    query,
    outline,
    title,
    style_id: styleId,
    tpl_id: tplId,
    enable_save_bos: true,
  }),
});

const text = await res.text();
let downloadUrl = '';
for (const line of text.split('\n')) {
  if (!line.startsWith('data:')) continue;
  const delta = JSON.parse(line.slice(5).trim());
  if (delta.ppt_download_url) downloadUrl = delta.ppt_download_url;
}
console.log('Download URL:', downloadUrl);
```

## Download the generated PPT

```js
// After getting downloadUrl from generation step
const pptRes = await fetch(downloadUrl);
const buffer = await pptRes.arrayBuffer();
const fs = require('fs');
fs.writeFileSync('/tmp/output.pptx', Buffer.from(buffer));
console.log('Saved to /tmp/output.pptx');
```

## Full one-shot workflow

```js
async function generatePPT(query, apiKey) {
  const BASE = 'https://qianfan.baidubce.com/v2/tools/ai_ppt/';
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Appbuilder-From': 'whistant' };

  // Step 1: Generate outline
  const outlineRes = await fetch(`${BASE}generate_outline`, { method: 'POST', headers, body: JSON.stringify({ query }) });
  const outlineText = await outlineRes.text();
  let title = '', chatId = '', queryId = '', outline = '';
  for (const line of outlineText.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const d = JSON.parse(line.slice(5).trim());
    if (!title && d.title) { title = d.title; chatId = d.chat_id; queryId = d.query_id; }
    outline += d.outline ?? '';
  }

  // Step 2: Generate PPT
  const pptRes = await fetch(`${BASE}generate_ppt_by_outline`, {
    method: 'POST', headers,
    body: JSON.stringify({ query_id: parseInt(queryId), chat_id: parseInt(chatId), query, outline, title, style_id: 0, enable_save_bos: true }),
  });
  const pptText = await pptRes.text();
  let url = '';
  for (const line of pptText.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const d = JSON.parse(line.slice(5).trim());
    if (d.ppt_download_url) url = d.ppt_download_url;
  }
  return { title, url };
}

const result = await generatePPT('企业年度总结报告', BAIDU_API_KEY);
console.log('PPT ready:', result.title, result.url);
```

## Notes

- API: `https://qianfan.baidubce.com/v2/tools/ai_ppt/`
- Same `BAIDU_API_KEY` as `baidu-search` skill
- Endpoints return SSE (streaming) — read all lines and parse `data:` prefixed JSON
- Generated PPT download URL is valid for a limited time
