// ============================================================================
// url-preview — fetch URL, parse OG/meta tags, return title/description/image
// JSC compat: pure fetch + regex HTML parsing, no AbortController
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC
// ---------------------------------------------------------------------------

async function previewUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL is required.');
  }
  // Normalize: strip surrounding quotes
  var url = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  var res;
  try {
    res = await fetch(url, { timeout: 12 });
  } catch (e) {
    throw new Error('Failed to fetch URL: ' + e.message);
  }
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ' — ' + res.statusText);
  }

  var html = await res.text();

  // Extract title: og:title > twitter:title > <title>
  var title = extractMeta(html, 'og:title')
             || extractMeta(html, 'twitter:title')
             || extractTag(html, 'title')
             || '';
  title = title.trim();

  // Extract description: og:description > twitter:description > meta[name=description]
  var description = extractMeta(html, 'og:description')
                  || extractMeta(html, 'twitter:description')
                  || extractAttr(html, 'name', 'description')
                  || '';
  description = description.trim();

  // Extract image: og:image > twitter:image
  var image = extractMeta(html, 'og:image')
            || extractMeta(html, 'twitter:image')
            || '';

  // Extract favicon
  var favicon = extractFavicon(html, url);

  // Extract site name: og:site_name
  var siteName = extractMeta(html, 'og:site_name') || '';

  // Format output
  var lines = [];
  var domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  lines.push('\uD83D\uDD17 ' + (title || domain));
  if (description) {
    lines.push('\uD83D\uDCC4 ' + description.substring(0, 300));
  }
  if (image) {
    lines.push('\uD83D\uDDBC ' + image);
  }
  if (favicon) {
    lines.push('\uD83C\uDF10 ' + favicon);
  }
  if (siteName) {
    lines.push('\uD83C\uDFE0 ' + siteName + ' (' + domain + ')');
  } else {
    lines.push('\uD83C\uDFE0 ' + domain);
  }

  return lines.join('\n');
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

var skillApi = { previewUrl, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillApi;
}
if (typeof globalThis !== 'undefined') {
  globalThis.url_preview = skillApi;
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
  var out = { input: undefined };
  if (!tokens.length) return out;

  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0, parts = [];
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--input' || t === '-i') && i + 1 < tokens.length) {
      out.input = tokens[i + 1]; i += 2; continue;
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

  var input = params.input || params.url || params.query || params.text || '';
  if (!input && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.input) input = parsed.input;
  }
  if (!input && params.argv && params.argv.length) {
    var parsed = parseCommand(params.argv.join(' '));
    if (parsed.input) input = parsed.input;
  }

  if (!input) {
    return 'Usage: url-preview <url>\nExample: url-preview https://github.com/openclaw/openclaw';
  }

  return await previewUrl(input);
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
// HELPERS — HTML parsing
// ---------------------------------------------------------------------------

function extractMeta(html, property) {
  // og:title, og:description, etc.
  var pattern = '<meta[^>]+(?:property|name)=["\']' + property.replace(/:/g, ':') + '["\'][^>]+content=["\']([^"\']+)["\']';
  var re = new RegExp(pattern, 'i');
  var m = html.match(re);
  if (m) return decodeHtml(m[1]);

  // Also try reversed attribute order: content= first, then property=
  var re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' + property.replace(/:/g, ':') + '["\']', 'i');
  var m2 = html.match(re2);
  if (m2) return decodeHtml(m2[1]);

  return null;
}

function extractAttr(html, attrName, attrValue) {
  var re = new RegExp('<meta[^>]+' + attrName + '=["\']' + attrValue + '["\'][^>]+content=["\']([^"\']+)["\']', 'i');
  var m = html.match(re);
  if (m) return decodeHtml(m[1]);
  var re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+' + attrName + '=["\']' + attrValue + '["\']', 'i');
  var m2 = html.match(re2);
  if (m2) return decodeHtml(m2[1]);
  return null;
}

function extractTag(html, tag) {
  var re = new RegExp('<' + tag + '[^>]*>([^<]+)<\\/' + tag + '>', 'i');
  var m = html.match(re);
  if (m) return decodeHtml(m[1].trim());
  return null;
}

function extractFavicon(html, pageUrl) {
  // Try shortcut icon
  var m = html.match(/<link[^>]+rel=["\'](?:shortcut\s+)?icon["\'][^>]+href=["\']([^"\']+)["\']/i);
  if (m) return resolveUrl(m[1], pageUrl);
  // Try Apple touch icon
  m = html.match(/<link[^>]+rel=["\']apple-touch-icon[^"\']*["\'][^>]+href=["\']([^"\']+)["\']/i);
  if (m) return resolveUrl(m[1], pageUrl);
  // Default favicon.ico
  var base = pageUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return 'https://www.google.com/s2/favicons?domain=' + base + '&sz=64';
}

function resolveUrl(href, pageUrl) {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) {
    var m = pageUrl.match(/^https?:\/\/[^\/]+/);
    return m ? m[0] + href : null;
  }
  return null;
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
    .replace(/&#(\d+);/g, function(_, code) { return String.fromCharCode(code); })
    .replace(/&#x([0-9a-fA-F]+);/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); });
}
