/**
 * ai-ppt-generator helper
 * Generates PPT via Baidu Qianfan AI PPT API.
 * Requires BAIDU_API_KEY — get one at https://cloud.baidu.com/
 */

const BASE = 'https://qianfan.baidubce.com/v2/tools/ai_ppt/';

function headers(apiKey) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-Appbuilder-From': 'whistant',
  };
}

/**
 * Get available PPT themes.
 * Returns array of { style_id, tpl_id, name }.
 */
async function getThemes(apiKey) {
  const res = await fetch(`${BASE}get_ppt_theme`, {
    method: 'POST',
    headers: headers(apiKey),
  });
  const data = await res.json();
  if (data.errno && data.errno !== 0) throw new Error(data.errmsg);
  return data.data?.ppt_themes ?? [];
}

/**
 * Generate PPT outline via SSE streaming.
 * Returns { title, chat_id, query_id, outline }.
 */
async function generateOutline(apiKey, query) {
  const res = await fetch(`${BASE}generate_outline`, {
    method: 'POST',
    headers: headers(apiKey),
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
  return { title, chat_id: chatId, query_id: queryId, outline };
}

/**
 * Generate PPT file from outline via SSE streaming.
 * Returns { title, url: ppt_download_url }.
 */
async function generatePPT(apiKey, { query, query_id, chat_id, outline, title, style_id = 0, tpl_id = null } = {}) {
  const res = await fetch(`${BASE}generate_ppt_by_outline`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      query_id: parseInt(query_id),
      chat_id: parseInt(chat_id),
      query,
      outline,
      title,
      style_id,
      tpl_id,
      enable_save_bos: true,
    }),
  });
  const text = await res.text();
  let url = '', outTitle = title;
  for (const line of text.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const delta = JSON.parse(line.slice(5).trim());
    if (!outTitle && delta.title) outTitle = delta.title;
    if (delta.ppt_download_url) url = delta.ppt_download_url;
  }
  return { title: outTitle, url };
}

/**
 * Full one-shot: outline → PPT generation.
 * Returns { title, url }.
 */
async function generatePresentation(apiKey, query, styleId = 0) {
  const { title, chat_id, query_id, outline } = await generateOutline(apiKey, query);
  return generatePPT(apiKey, { query, query_id, chat_id, outline, title, style_id: styleId });
}

module.exports = { getThemes, generateOutline, generatePPT, generatePresentation };
