// ============================================================================
// web-fetch-vx — generic URL fetch with extractMode (markdown/text/json)
// JSC compat: pure fetch, regex HTML parsing, no AbortController
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC
// ---------------------------------------------------------------------------

async function fetchUrl(params) {
  var url = params.url || params.input || params.text || '';
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required. Pass {url:"https://..."}');
  }
  url = url.trim().replace(/^["']|["']$/g, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  var extractMode = params.extractMode || params.mode || 'markdown';
  var maxChars = parseInt(params.maxChars, 10) || 8000;
  var includeMetadata = params.includeMetadata !== false;

  var res;
  try {
    res = await fetch(url, { timeout: 15 });
  } catch (e) {
    throw new Error('Fetch failed: ' + e.message);
  }
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ' ' + res.statusText);
  }

  var text = await res.text();
  var title = extractTitle(text);
  var description = extractMeta(text, 'description') || '';
  var author = extractMeta(text, 'author') || '';

  // Helper: truncate string to maxLen, append ellipsis if cut
  function cap(str, maxLen) {
    if (!str || !maxLen) return str || '';
    if (str.length <= maxLen) return str;
    return str.substring(0, Math.max(0, maxLen - 3)) + '...';
  }

  if (extractMode === 'json') {
    // Reserve exact space for metadata fields + JSON structural overhead
    var metaSample = JSON.stringify({url:url,title:title,description:description,author:author});
    var contentMax = Math.max(0, maxChars - metaSample.length - 10);
    var result = {
      success: true,
      url: url,
      title: title,
      description: description.substring(0, 500),
      author: author,
      content: text.substring(0, contentMax)
    };
    var jsonStr = JSON.stringify(result, null, 2);
    // If still over, truncate description and content proportionally
    if (jsonStr.length > maxChars) {
      var budget = maxChars - 80; // leave room for structural JSON chars
      var metaLen = JSON.stringify({url:url,title:title,description:'',author:author}).length;
      var descBudget = Math.min(200, Math.floor((budget - metaLen) * 0.3));
      var contentBudget = Math.max(0, budget - metaLen - descBudget - 20);
      result.description = description.substring(0, descBudget);
      result.content = text.substring(0, contentBudget);
      jsonStr = JSON.stringify(result, null, 2);
    }
    return jsonStr;
  }

  var content;
  if (extractMode === 'text') {
    if (includeMetadata) {
      var meta = '';
      if (title) meta += 'Title: ' + cap(title, 200) + '\n';
      if (author) meta += 'Author: ' + cap(author, 100) + '\n';
      if (description) meta += 'Description: ' + cap(description, 300) + '\n';
      meta += '---\n';
      var contentMax = Math.max(0, maxChars - meta.length - 10);
      content = stripHtml(text).substring(0, contentMax);
      if (content.length < stripHtml(text).length) content += '...';
      return meta + content;
    }
    content = stripHtml(text).substring(0, maxChars);
    if (content.length < stripHtml(text).length) content += '...';
    return content;
  } else {
    // markdown: extract readable paragraphs
    if (includeMetadata) {
      var meta = '';
      if (title) meta += '# ' + cap(title, 200) + '\n\n';
      if (author) meta += '*By ' + cap(author, 100) + '*\n\n';
      if (description) meta += '> ' + cap(description, 300) + '\n\n';
      var contentMax = Math.max(0, maxChars - meta.length - 10);
      content = extractMarkdown(text, contentMax);
      return meta + content;
    }
    content = extractMarkdown(text, maxChars);
    return content;
  }
}

// ---------------------------------------------------------------------------
// 2. HANDLER
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS
// ---------------------------------------------------------------------------

var skillApi = { fetchUrl, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.web_fetch_vx = skillApi;
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; if (cur) tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = { input: undefined, extractMode: 'markdown', maxChars: 8000, includeMetadata: true };
  if (!tokens.length) return out;

  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0, parts = [];
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--url' || t === '-u') && i + 1 < tokens.length) {
      out.input = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--mode' && i + 1 < tokens.length) {
      out.extractMode = tokens[i + 1]; i += 2; continue;
    }
    if (t === '--max-chars' && i + 1 < tokens.length) {
      out.maxChars = parseInt(tokens[i + 1], 10) || 8000; i += 2; continue;
    }
    if (t === '--no-metadata') {
      out.includeMetadata = false; i += 1; continue;
    }
    if (t.startsWith('-')) { i += 1; continue; }
    parts.push(t);
    i += 1;
  }
  if (!out.input && parts.length) out.input = parts.join(' ');
  return out;
}

// ---------------------------------------------------------------------------
// 5. runFromParams
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  var input = params.input || params.url || params.text || '';
  if (!input && params.command) {
    var parsed = parseCommand(params.command);
    Object.keys(parsed).forEach(function(k) { if (k !== 'input' && !params[k]) params[k] = parsed[k]; });
    if (parsed.input) input = parsed.input;
  }
  if (!input && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    Object.keys(parsed).forEach(function(k) { if (k !== 'input' && !params[k]) params[k] = parsed[k]; });
    if (parsed.input) input = parsed.input;
  }

  if (!input) {
    return 'Usage: web-fetch-vx <url> [--mode markdown|text|json] [--max-chars N] [--no-metadata]\nExample: web-fetch-vx https://example.com --mode markdown --max-chars 4000';
  }

  params.input = input;
  return await fetchUrl(params);
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function extractTitle(html) {
  var m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (m) return decodeHtml(m[1].trim());
  m = html.match(/<meta[^>]+og:title["\'][^>]+content=["\']([^"\']+)["\']/i);
  if (m) return decodeHtml(m[1]);
  return '';
}

function extractMeta(html, name) {
  var re = new RegExp('<meta[^>]+name=["\']' + name + '["\'][^>]+content=["\']([^"\']+)["\']', 'i');
  var m = html.match(re);
  if (m) return decodeHtml(m[1]);
  var re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']' + name + '["\']', 'i');
  m = html.match(re2);
  if (m) return decodeHtml(m[1]);
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMarkdown(html, maxChars) {
  // Remove scripts, styles, nav, footer, sidebar
  var cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '\n')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '\n')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n## ')
    .replace(/<\/li>/gi, '\n- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, function(_, code) { return String.fromCharCode(code); })
    .replace(/&#x([0-9a-fA-F]+);/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned.substring(0, maxChars);
}

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, function(_, code) { return String.fromCharCode(code); })
    .replace(/&#x([0-9a-fA-F]+);/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); });
}
