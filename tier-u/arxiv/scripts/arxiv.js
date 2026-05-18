// arxiv — JSC-compatible handler for arXiv API
// API: https://export.arxiv.org/api/query (free, no key)
// Response: Atom/XML — parsed with regex

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC
// ---------------------------------------------------------------------------

async function search(query, maxResults) {
  if (!query || !query.trim()) throw new Error('Search query is required.');
  var q = encodeURIComponent(query.trim());
  var url = 'https://export.arxiv.org/api/query?search_query=all:' + q + '&max_results=' + (maxResults || 5) + '&sortBy=relevance&sortOrder=descending';
  var res = await fetch(url, { timeout: 15 });
  if (!res.ok) throw new Error('arXiv API error: ' + res.status);
  var xml = await res.text();
  return parseFeed(xml, 'search');
}

async function getById(idList) {
  if (!idList || !idList.length) throw new Error('id_list is required (comma-separated arXiv IDs).');
  var ids = idList.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  var url = 'https://export.arxiv.org/api/query?id_list=' + ids.join(',');
  var res = await fetch(url, { timeout: 15 });
  if (!res.ok) throw new Error('arXiv API error: ' + res.status);
  var xml = await res.text();
  return parseFeed(xml, 'detail');
}

async function downloadPdf(arxivId) {
  if (!arxivId || !arxivId.trim()) throw new Error('arXiv ID is required (e.g. 2401.12345).');
  var id = arxivId.trim();
  var url = 'https://arxiv.org/pdf/' + id + '.pdf';
  var res = await fetch(url, { timeout: 20, redirect: 'follow' });
  if (!res.ok) throw new Error('PDF download failed: ' + res.status);
  // Return the URL for the AI to open, not the raw bytes
  return 'PDF available at: ' + url + '\n(Use browser tool to open this URL)';
}

// ---------------------------------------------------------------------------
// XML parsing — regex-based (no DOMParser in JSC)
// ---------------------------------------------------------------------------

function parseFeed(xml, mode) {
  var entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  if (!entries.length) {
    var totalResults = xml.match(/<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/);
    var total = totalResults ? totalResults[1] : '0';
    return 'No results found. Total: ' + total;
  }

  var results = entries.map(function(entry) {
    var title = extractTag(entry, 'title');
    var summary = extractTag(entry, 'summary');
    var published = extractTag(entry, 'published');
    var updated = extractTag(entry, 'updated');
    var id = extractTag(entry, 'id');
    var authors = [];
    var authorMatches = entry.match(/<author>[\s\S]*?<\/author>/g) || [];
    authorMatches.forEach(function(a) {
      var name = extractTag(a, 'name');
      if (name) authors.push(name);
    });
    var doi = extractTag(entry, 'doi');
    var comments = extractTag(entry, 'arxiv:comment');
    var journal = extractTag(entry, 'arxiv:journal_ref');

    // PDF link
    var pdfLink = '';
    var linkMatches = entry.match(/<link[^>]+>/g) || [];
    linkMatches.forEach(function(link) {
      if (link.includes('title="pdf"') || link.includes("title='pdf'")) {
        var hrefMatch = link.match(/href="([^"]+)"/);
        if (hrefMatch) pdfLink = hrefMatch[1];
      }
    });

    // ArXiv ID from URL
    var arxivId = '';
    if (id) {
      var idMatch = id.match(/\/(\d+\.\d+)(v\d+)?$/);
      if (idMatch) arxivId = idMatch[1];
    }

    // Format output
    var lines = [];
    lines.push('Title: ' + (title || 'N/A'));
    if (authors.length) lines.push('Authors: ' + authors.join(', '));
    if (published) lines.push('Published: ' + published.slice(0, 10));
    if (arxivId) lines.push('arXiv ID: ' + arxivId);
    if (doi) lines.push('DOI: ' + doi);
    if (journal) lines.push('Journal: ' + journal);
    if (comments) lines.push('Comments: ' + comments);
    if (pdfLink) lines.push('PDF: ' + pdfLink);
    if (id) lines.push('URL: ' + id);
    if (summary) lines.push('Abstract: ' + summary.slice(0, 500) + (summary.length > 500 ? '...' : ''));

    return lines.join('\n');
  });

  if (mode === 'search') {
    var totalMatch = xml.match(/<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/);
    var total = totalMatch ? totalMatch[1] : entries.length;
    var header = '=== arXiv Search Results (' + entries.length + ' of ' + total + ') ===\n';
    return header + results.join('\n\n' + Array(40).join('-') + '\n\n');
  } else {
    return '=== arXiv Paper Details ===\n\n' + results.join('\n\n' + Array(40).join('=') + '\n\n');
  }
}

function extractTag(xml, tag) {
  var pattern = '<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>';
  var re = new RegExp(pattern);
  var m = xml.match(re);
  if (!m) return '';
  // Unescape common XML entities
  return m[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, function(_, code) { return String.fromCharCode(Number(code)); })
    .trim();
}

// ---------------------------------------------------------------------------
// 2. HANDLER — standard AI entry point
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// 3. EXPORTS — synchronous, before any await
// ---------------------------------------------------------------------------

var arxivApi = { search, getById, downloadPdf, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) { module.exports = arxivApi; }
if (typeof globalThis !== 'undefined') { globalThis.arxiv = arxivApi; }

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
  var out = { action: undefined, input: undefined, idList: undefined, maxResults: undefined };
  if (!tokens.length) return out;

  // Drop leading: run, filename
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();

  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--search' || t === '-s') && i + 1 < tokens.length) {
      out.action = 'search'; out.input = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--id' || t === '-i') && i + 1 < tokens.length) {
      out.action = 'getById'; out.idList = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--pdf' || t === '-p') && i + 1 < tokens.length) {
      out.action = 'downloadPdf'; out.input = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--max' || t === '-n') && i + 1 < tokens.length) {
      out.maxResults = parseInt(tokens[i + 1], 10); i += 2; continue;
    }
    i += 1;
  }

  // Remaining non-flag tokens form the input
  if (!out.input) {
    var remaining = tokens.filter(function(t) { return !t.startsWith('-'); });
    if (remaining.length) out.input = remaining.join(' ');
  }

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

  // Resolve input from various sources
  var input = params.input || params.query || params.text || '';
  var action = params.action || 'search';
  var idList = params.idList || params.id_list || params.ids;
  var maxResults = params.maxResults || params.max_results || params.count || 5;

  // Check for command-line style parsing
  if (!input && !idList && params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.action) action = parsed.action;
    if (parsed.input) input = parsed.input;
    if (parsed.idList) idList = parsed.idList;
    if (parsed.maxResults) maxResults = parsed.maxResults;
  }

  if (!input && !idList) {
    return 'Usage:\n  arxiv.search("transformer architecture")\n  arxiv.getById("2301.00001,2301.00002")\n  arxiv.downloadPdf("2301.00001")';
  }

  try {
    if (action === 'getById' || action === 'byId' || action === 'detail' || action === 'paper') {
      return await getById(idList || input);
    }
    if (action === 'downloadPdf' || action === 'pdf') {
      return await downloadPdf(input);
    }
    // Default: search
    return await search(input, maxResults);
  } catch (e) {
    return 'Error: ' + (e.message || String(e));
  }
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry (local dev only)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block — device /cmd path only
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
