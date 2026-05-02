// Base64 encoder — btoa is not available in JSCore (iOS JS runtime)
function _btoa(str) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var out = ''; var i = 0;
  while (i < str.length) {
    var c1 = str.charCodeAt(i++) & 0xff;
    var c2 = str.charCodeAt(i++) & 0xff;
    var c3 = str.charCodeAt(i++) & 0xff;
    out += chars[c1 >> 2] + chars[((c1 & 3) << 4) | (c2 >> 4)];
    out += isNaN(str.charCodeAt(i - 2)) ? '=' : chars[((c2 & 15) << 2) | (c3 >> 6)];
    out += isNaN(str.charCodeAt(i - 1)) ? '=' : chars[c3 & 63];
  }
  return out;
}

// office.js — Microsoft Office skill (Word, Excel, PowerPoint)
// Read and edit Office files stored in OneDrive via Microsoft Graph API
//
// Quick start:
//   const o = require('/skills/microsoft/scripts/office');
//   const m = require('/skills/microsoft/scripts/microsoft');
//   // Authenticate once: await m.auth.login();
//
//   // Find a file in OneDrive by name
//   const files = await o.findFile('budget');
//
//   // Excel
//   const info  = await o.excel.info('ITEM_ID');
//   const rows  = await o.excel.read('ITEM_ID', { sheet: 'Sheet1', offset: 0, limit: 50 });
//   await o.excel.update('ITEM_ID', 'Sheet1!B2', [['newValue']]);
//
//   // Word
//   const doc  = await o.word.read('ITEM_ID', { offset: 0, limit: 50 });
//   const hits = await o.word.search('ITEM_ID', 'keyword');
//   await o.word.replace('ITEM_ID', 'old text', 'new text');
//
//   // PowerPoint
//   const ppt    = await o.powerpoint.info('ITEM_ID');
//   const slides = await o.powerpoint.read('ITEM_ID', { offset: 0, limit: 5 });

'use strict';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

function getAuth() {
  return require('/skills/microsoft/scripts/microsoft').auth;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function apiGet(path, params, extraHeaders) {
  const token = await getAuth().getAccessToken();
  let url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  if (params) {
    const parts = [];
    Object.keys(params).forEach(function(k) {
      if (params[k] !== undefined && params[k] !== null) {
        parts.push(k + '=' + encodeURIComponent(params[k]));
      }
    });
    if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&');
  }
  const headers = Object.assign({ Authorization: 'Bearer ' + token }, extraHeaders || {});
  const res = await fetch(url, { headers: headers });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  return await res.json();
}

async function apiPost(path, body, method, extraHeaders) {
  const token = await getAuth().getAccessToken();
  const url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  const headers = Object.assign(
    { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    extraHeaders || {}
  );
  const res = await fetch(url, {
    method: method || 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API error ' + res.status + ': ' + await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function apiPutBinary(path, buffer, contentType) {
  const token = await getAuth().getAccessToken();
  const url = path.startsWith('https://') ? path : GRAPH_BASE + path;
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': contentType || 'application/octet-stream' };

  const arr = toUint8Array(buffer);

  // Use bodyBase64 fetch option — Swift reads this as raw Data (no string coercion)
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers,
    bodyBase64: uint8ArrayToBase64(arr),
  });
  if (!res.ok) throw new Error('Upload error ' + res.status + ': ' + await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Download a OneDrive file as ArrayBuffer using its pre-auth download URL
async function downloadFileBuffer(itemId) {
  const item = await apiGet(
    '/me/drive/items/' + itemId + '?$select=id,name,@microsoft.graph.downloadUrl'
  );
  const url = item['@microsoft.graph.downloadUrl'];
  if (!url) throw new Error('No download URL for item ' + itemId);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  return await res.arrayBuffer();
}

// Upload modified ArrayBuffer back to a OneDrive item (replaces content)
async function uploadFileBuffer(itemId, buffer) {
  return await apiPutBinary('/me/drive/items/' + itemId + '/content', buffer);
}

// ---------------------------------------------------------------------------
// fflate loader — prefers local package, falls back to CDN UMD bundle
// ---------------------------------------------------------------------------

var _fflateCache = null;
var _aurochsRuntimeCache = null;

async function loadFflate() {
  if (_fflateCache) return _fflateCache;
  try {
    _fflateCache = require('fflate');
    return _fflateCache;
  } catch (_) {}
  var resp = await fetch('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js');
  if (!resp.ok) throw new Error('Failed to fetch fflate from CDN: ' + resp.status);
  var code = await resp.text();
  var wrapped = '(function(self,window,global){' + code + '})(globalThis,globalThis,globalThis);';
  eval(wrapped); // eslint-disable-line no-eval
  if (typeof globalThis !== 'undefined' && globalThis.fflate) {
    _fflateCache = globalThis.fflate;
    return _fflateCache;
  }
  throw new Error('fflate failed to load. Try: pkg add fflate');
}

function loadAurochsRuntime() {
  if (_aurochsRuntimeCache) return _aurochsRuntimeCache;
  _aurochsRuntimeCache = require('/skills/microsoft/scripts/aurochs-runtime.js');
  return _aurochsRuntimeCache;
}

function toUint8Array(input) {
  if (input instanceof Uint8Array) return input;
  if (typeof ArrayBuffer !== 'undefined' && input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView && ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new Error('Unsupported binary input type');
}

async function unzipSyncEntries(bufferOrBytes) {
  var fflate = await loadFflate();
  return fflate.unzipSync(toUint8Array(bufferOrBytes));
}

async function getZipEntries(bufferOrEntries) {
  if (
    bufferOrEntries &&
    typeof bufferOrEntries === 'object' &&
    !(typeof ArrayBuffer !== 'undefined' && bufferOrEntries instanceof ArrayBuffer) &&
    !(typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView && ArrayBuffer.isView(bufferOrEntries))
  ) {
    return bufferOrEntries;
  }
  return await unzipSyncEntries(bufferOrEntries);
}

async function readZipTextEntry(bufferOrEntries, entryPath) {
  var fflate = await loadFflate();
  var entries = await getZipEntries(bufferOrEntries);
  var entry = entries[entryPath];
  if (!entry) throw new Error('Missing zip entry: ' + entryPath);
  return fflate.strFromU8(entry);
}

async function readDocxXml(bufferOrBytes) {
  return await readZipTextEntry(bufferOrBytes, 'word/document.xml');
}

// ---------------------------------------------------------------------------
// ZIP archive helpers powered by fflate
// ---------------------------------------------------------------------------

async function setZipTextEntry(entries, entryPath, text) {
  var fflate = await loadFflate();
  entries[entryPath] = fflate.strToU8(text);
}

async function zipEntries(bufferEntries) {
  var fflate = await loadFflate();
  return fflate.zipSync(bufferEntries);
}

// ---------------------------------------------------------------------------
// Retry + timeout helper for direct Graph fetch calls
// ---------------------------------------------------------------------------

async function fetchWithRetry(url, opt, retries, timeoutMs) {
  retries   = retries   !== undefined ? retries   : 3;
  timeoutMs = timeoutMs !== undefined ? timeoutMs : 15000;
  opt = opt || {};
  for (var i = 0; i <= retries; i++) {
    var ac = new AbortController();
    var t  = setTimeout(function() { ac.abort('timeout'); }, timeoutMs);
    try {
      var r = await fetch(url, Object.assign({}, opt, { signal: ac.signal }));
      clearTimeout(t);
      if (r.ok) return r;
      if (i === retries) throw new Error('HTTP ' + r.status);
    } catch (e) {
      clearTimeout(t);
      if (i === retries) throw e;
      await new Promise(function(res) { setTimeout(res, 400 * Math.pow(2, i)); });
    }
  }
}

// ---------------------------------------------------------------------------
// Excel column helpers
// ---------------------------------------------------------------------------

// Convert 1-based column number to letter(s): 1→A, 26→Z, 27→AA
function colToLetter(n) {
  var result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Excel — Microsoft Graph Workbook API (no download needed)
// ---------------------------------------------------------------------------

// Create a persistent workbook session, run fn(sessionId), then close the session
async function withExcelSession(itemId, fn) {
  var session = await apiPost(
    '/me/drive/items/' + itemId + '/workbook/createSession',
    { persistChanges: true }
  );
  var sessionId = session.id;
  var result;
  try {
    result = await fn(sessionId);
    await apiPost(
      '/me/drive/items/' + itemId + '/workbook/closeSession',
      {},
      'POST',
      { 'workbook-session-id': sessionId }
    );
  } catch (err) {
    try {
      await apiPost(
        '/me/drive/items/' + itemId + '/workbook/closeSession',
        {},
        'POST',
        { 'workbook-session-id': sessionId }
      );
    } catch (_) {}
    throw err;
  }
  return result;
}

const excel = {
  /**
   * Get workbook info: list of sheets with name, row count, column count.
   * @param {string} itemId — OneDrive item ID
   */
  async info(itemId) {
    var data = await apiGet(
      '/me/drive/items/' + itemId + '/workbook/worksheets?$select=id,name,position'
    );
    var sheets = data.value || [];
    var withDims = await Promise.all(sheets.map(async function(s) {
      try {
        var used = await apiGet(
          '/me/drive/items/' + itemId + '/workbook/worksheets/' +
          encodeURIComponent(s.name) + '/usedRange?$select=address,rowCount,columnCount'
        );
        return { id: s.id, name: s.name, position: s.position,
                 rowCount: used.rowCount, columnCount: used.columnCount, address: used.address };
      } catch (_) {
        return { id: s.id, name: s.name, position: s.position };
      }
    }));
    return withDims;
  },

  /**
   * Read rows from a sheet with offset/limit for large-file support.
   * opts: { sheet (name|0-based index), offset (row offset, default 0), limit (row count, default 100) }
   * Returns: { sheet, totalRows, totalCols, offset, limit, rows (2D text array) }
   */
  async read(itemId, opts) {
    opts = opts || {};
    var sheetRef  = opts.sheet !== undefined ? opts.sheet : 0;
    var offset    = opts.offset || 0;
    var limit     = opts.limit  || 100;

    // Resolve sheet name from index if needed
    var sheetName;
    if (typeof sheetRef === 'number') {
      var listData = await apiGet(
        '/me/drive/items/' + itemId + '/workbook/worksheets?$select=id,name,position'
      );
      var sheets = listData.value || [];
      var found  = sheets.find(function(s) { return s.position === sheetRef; });
      if (!found && sheetRef < sheets.length) found = sheets[sheetRef];
      if (!found) throw new Error('Sheet not found at index ' + sheetRef);
      sheetName = found.name;
    } else {
      sheetName = sheetRef;
    }

    // Get dimensions of used range (no values — fast)
    var usedRange = await apiGet(
      '/me/drive/items/' + itemId + '/workbook/worksheets/' +
      encodeURIComponent(sheetName) + '/usedRange?$select=address,rowCount,columnCount'
    );
    var totalRows = usedRange.rowCount    || 0;
    var totalCols = usedRange.columnCount || 0;

    if (totalRows === 0) {
      return { sheet: sheetName, totalRows: 0, totalCols: 0, offset: offset, limit: limit, rows: [] };
    }

    var startRow = offset + 1;  // Excel rows are 1-based
    var endRow   = Math.min(offset + limit, totalRows);
    if (startRow > totalRows) {
      return { sheet: sheetName, totalRows: totalRows, totalCols: totalCols,
               offset: offset, limit: limit, rows: [] };
    }

    var lastCol   = colToLetter(totalCols);
    var address   = 'A' + startRow + ':' + lastCol + endRow;

    var rangeData = await apiGet(
      '/me/drive/items/' + itemId + '/workbook/worksheets/' +
      encodeURIComponent(sheetName) + '/range(address=\'' + address + '\')?$select=address,text'
    );

    return {
      sheet:     sheetName,
      totalRows: totalRows,
      totalCols: totalCols,
      offset:    offset,
      limit:     limit,
      rows:      rangeData.text || [],
    };
  },

  /**
   * Read a specific A1-notation range.
   * address: 'Sheet1!A1:D10' or 'A1:D10' (+ sheet param), e.g. 'B2', 'A:A'
   * Returns: { address, values (2D array), text (2D array, formatted strings) }
   */
  async range(itemId, address, sheet) {
    var sheetName = sheet;
    var addr      = address;
    if (address.includes('!')) {
      var bang = address.indexOf('!');
      sheetName = address.slice(0, bang).replace(/'/g, '');
      addr      = address.slice(bang + 1);
    }
    if (!sheetName) {
      var d = await apiGet(
        '/me/drive/items/' + itemId + '/workbook/worksheets?$select=name,position'
      );
      sheetName = (d.value && d.value[0] && d.value[0].name) || 'Sheet1';
    }
    return await apiGet(
      '/me/drive/items/' + itemId + '/workbook/worksheets/' +
      encodeURIComponent(sheetName) + '/range(address=\'' + addr + '\')?$select=address,values,text'
    );
  },

  /**
   * Search for text/number across all (or specified) sheets.
   * Returns array of { sheet, row (1-based), col (1-based), value }
   * opts: { sheets (array of sheet names to limit search) }
   */
  async search(itemId, query, opts) {
    var info = await excel.info(itemId);
    var q    = String(query).toLowerCase();
    var targetSheets = (opts && opts.sheets) ? opts.sheets : null;
    var results = [];

    for (var si = 0; si < info.length; si++) {
      var s = info[si];
      if (targetSheets && targetSheets.indexOf(s.name) === -1) continue;
      if (!s.rowCount || s.rowCount === 0) continue;

      var data = await apiGet(
        '/me/drive/items/' + itemId + '/workbook/worksheets/' +
        encodeURIComponent(s.name) + '/usedRange?$select=text'
      );
      var rows = data.text || [];
      for (var ri = 0; ri < rows.length; ri++) {
        for (var ci = 0; ci < rows[ri].length; ci++) {
          if (String(rows[ri][ci]).toLowerCase().includes(q)) {
            results.push({ sheet: s.name, row: ri + 1, col: ci + 1,
                           colLetter: colToLetter(ci + 1), value: rows[ri][ci] });
          }
        }
      }
    }
    return results;
  },

  /**
   * Update cells at an A1-notation address.
   * address: 'Sheet1!B2' or 'Sheet1!A1:C3'
   * values: 2D array [[row1col1, row1col2], [row2col1, ...]]
   *   — for a single cell pass [['value']] or just 'value' (auto-wrapped)
   */
  async update(itemId, address, values) {
    // Normalise to 2D array
    var vals = Array.isArray(values)
      ? (Array.isArray(values[0]) ? values : [values])
      : [[values]];

    var sheetName, addr;
    if (address.includes('!')) {
      var bang = address.indexOf('!');
      sheetName = address.slice(0, bang).replace(/'/g, '');
      addr      = address.slice(bang + 1);
    } else {
      var d = await apiGet(
        '/me/drive/items/' + itemId + '/workbook/worksheets?$select=name,position'
      );
      sheetName = (d.value && d.value[0] && d.value[0].name) || 'Sheet1';
      addr      = address;
    }

    return await withExcelSession(itemId, async function(sessionId) {
      return await apiPost(
        '/me/drive/items/' + itemId + '/workbook/worksheets/' +
        encodeURIComponent(sheetName) + '/range(address=\'' + addr + '\')',
        { values: vals },
        'PATCH',
        { 'workbook-session-id': sessionId }
      );
    });
  },

  /**
   * Direct Graph fallback for when excel.read() times out.
   * Bypasses apiGet and uses fetchWithRetry with its own token fetch.
   * opts: { sheetIndex (default 0) }
   * Returns: { sheet, rowCount, columnCount, rows (2D text/value array) }
   */
  async directRead(itemId, opts) {
    var sheetIndex = (opts && opts.sheetIndex) || 0;
    var m     = require('/skills/microsoft/scripts/microsoft');
    var token = (await m.auth.status()).access_token;
    var base  = GRAPH_BASE + '/me/drive/items/' + encodeURIComponent(itemId) + '/workbook';
    var h     = { Authorization: 'Bearer ' + token };

    var sheetsRes = await fetchWithRetry(base + '/worksheets?$select=id,name,position', { headers: h });
    var sheets    = (await sheetsRes.json()).value || [];
    var sheet     = sheets[sheetIndex] || sheets[0];
    if (!sheet) throw new Error('No worksheets found');

    var sid     = encodeURIComponent(sheet.id);
    var dataRes = await fetchWithRetry(
      base + '/worksheets(\'' + sid + '\')/usedRange(valuesOnly=true)?$select=address,rowCount,columnCount,text,values',
      { headers: h }
    );
    var data = await dataRes.json();
    return {
      sheet:       sheet.name,
      rowCount:    data.rowCount,
      columnCount: data.columnCount,
      rows:        data.text || data.values || [],
    };
  },

  /**
   * Append rows to the bottom of used range on a sheet.
   * sheet: sheet name; rows: 2D array of values.
   */
  async append(itemId, sheet, rows) {
    var sheetName = sheet;
    if (!sheetName) {
      var d = await apiGet(
        '/me/drive/items/' + itemId + '/workbook/worksheets?$select=name,position'
      );
      sheetName = (d.value && d.value[0] && d.value[0].name) || 'Sheet1';
    }
    var used = await apiGet(
      '/me/drive/items/' + itemId + '/workbook/worksheets/' +
      encodeURIComponent(sheetName) + '/usedRange?$select=address,rowCount,columnCount'
    );
    var nextRow = (used.rowCount || 0) + 1;
    var numCols = rows[0] ? rows[0].length : 1;
    var endRow  = nextRow + rows.length - 1;
    var addr    = 'A' + nextRow + ':' + colToLetter(numCols) + endRow;

    return await withExcelSession(itemId, async function(sessionId) {
      return await apiPost(
        '/me/drive/items/' + itemId + '/workbook/worksheets/' +
        encodeURIComponent(sheetName) + '/range(address=\'' + addr + '\')',
        { values: rows },
        'PATCH',
        { 'workbook-session-id': sessionId }
      );
    });
  },
};

// ---------------------------------------------------------------------------
// DOCX (Word) — download + fflate XML parse
// ---------------------------------------------------------------------------

// Extract all paragraph text strings from word/document.xml content
// Each <w:p> → join all <w:t> text within it
function parseDocxParagraphs(xml) {
  var paragraphs = [];
  // Split on paragraph boundaries — <w:p> is never nested in valid DOCX
  var parts = xml.split(/<w:p(?:\s[^>]*)?>/);
  for (var i = 1; i < parts.length; i++) {
    var chunk = parts[i];
    // Grab everything before </w:p>
    var endIdx = chunk.indexOf('</w:p>');
    if (endIdx !== -1) chunk = chunk.slice(0, endIdx);
    // Collect <w:t> content (preserving spaces)
    var text = '';
    var tRe  = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    var m;
    while ((m = tRe.exec(chunk)) !== null) {
      text += m[1];
    }
    paragraphs.push(text);
  }
  return paragraphs;
}

// ---------------------------------------------------------------------------
// DOCX XML manipulation helpers
// ---------------------------------------------------------------------------

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Find every <w:p>...</w:p> with its start/end position in the XML string
function findParagraphPositions(xml) {
  var re = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
  var out = [];
  var m;
  while ((m = re.exec(xml)) !== null) {
    var pXml = m[0];
    var tRe  = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    var text = '';
    var tm;
    while ((tm = tRe.exec(pXml)) !== null) text += tm[1];
    out.push({ start: m.index, end: m.index + pXml.length, xml: pXml, text: text });
  }
  return out;
}

// Replace all runs in a paragraph with newText, preserving paragraph style (pPr)
function rebuildParagraph(pXml, newText) {
  var openTag = (pXml.match(/^<w:p(?:\s[^>]*)?>/)||['<w:p>'])[0];
  var pPr     = (pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)||[''])[0];
  return openTag + pPr +
    '<w:r><w:t xml:space="preserve">' + escapeXml(newText) + '</w:t></w:r></w:p>';
}

// Bare paragraph with no inherited style
function newParagraph(text) {
  return '<w:p><w:r><w:t xml:space="preserve">' + escapeXml(text) + '</w:t></w:r></w:p>';
}

// Diff two versions of document XML — returns changed non-empty paragraphs
function computeDiff(oldXml, newXml) {
  var oldParas = parseDocxParagraphs(oldXml).filter(function(p) { return p.trim().length > 0; });
  var newParas = parseDocxParagraphs(newXml).filter(function(p) { return p.trim().length > 0; });
  var changes  = [];
  var len = Math.max(oldParas.length, newParas.length);
  for (var i = 0; i < len; i++) {
    var before = oldParas[i] !== undefined ? oldParas[i] : '';
    var after  = newParas[i] !== undefined ? newParas[i] : '';
    if (before !== after) changes.push({ index: i, before: before, after: after });
  }
  return changes;
}

// ---------------------------------------------------------------------------
// DOCX → HTML helpers
// ---------------------------------------------------------------------------

// Convert runs in a paragraph to HTML, preserving bold/italic
function parseRunsToHtml(pXml) {
  var html = '';
  var rRe  = /<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g;
  var m;
  while ((m = rRe.exec(pXml)) !== null) {
    var run      = m[0];
    var rPrMatch = run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
    var rPr      = rPrMatch ? rPrMatch[1] : '';
    var bold     = /<w:b[\s\/>]/.test(rPr) && !/<w:b\s[^>]*w:val="0"/.test(rPr);
    var italic   = /<w:i[\s\/>]/.test(rPr) && !/<w:i\s[^>]*w:val="0"/.test(rPr);
    var tMatch   = run.match(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/);
    if (!tMatch || !tMatch[1]) continue;
    var text = escapeXml(tMatch[1]);
    if (bold && italic) text = '<strong><em>' + text + '</em></strong>';
    else if (bold)      text = '<strong>' + text + '</strong>';
    else if (italic)    text = '<em>' + text + '</em>';
    html += text;
  }
  return html;
}

function tableToHtml(tblXml) {
  var html   = '<table border="1" cellpadding="4" style="border-collapse:collapse">\n';
  var rowRe  = /<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g;
  var cellRe = /<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g;
  var pRe    = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
  var rm, rc, rp;
  while ((rm = rowRe.exec(tblXml)) !== null) {
    html += '<tr>';
    cellRe.lastIndex = 0;
    while ((rc = cellRe.exec(rm[0])) !== null) {
      var lines = [];
      pRe.lastIndex = 0;
      while ((rp = pRe.exec(rc[0])) !== null) {
        var line = parseRunsToHtml(rp[0]);
        if (line) lines.push(line);
      }
      html += '<td>' + lines.join('<br>') + '</td>';
    }
    html += '</tr>\n';
  }
  return html + '</table>\n';
}

// Convert full document.xml to readable HTML
function buildDocxHtml(xml) {
  var html   = '';
  var inList = false;
  var nodeRe = /(<w:tbl(?:\s[^>]*)?>[\s\S]*?<\/w:tbl>)|(<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>)/g;
  var m;
  while ((m = nodeRe.exec(xml)) !== null) {
    if (m[1]) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += tableToHtml(m[1]);
    } else {
      var pXml   = m[2];
      var isList = /<w:numPr>/.test(pXml);
      var styleM = pXml.match(/<w:pStyle\s+w:val="([^"]+)"/);
      var style  = styleM ? styleM[1] : '';
      var text   = parseRunsToHtml(pXml);
      if (!text.trim()) continue;
      if (isList) {
        if (!inList) { html += '<ul>\n'; inList = true; }
        html += '<li>' + text + '</li>\n';
      } else {
        if (inList) { html += '</ul>\n'; inList = false; }
        var headM = style.match(/[Hh]eading\s*(\d)/i);
        if (headM) {
          html += '<h' + headM[1] + '>' + text + '</h' + headM[1] + '>\n';
        } else {
          html += '<p>' + text + '</p>\n';
        }
      }
    }
  }
  if (inList) html += '</ul>\n';
  return '<div class="docx">\n' + html + '</div>';
}

const word = {
  /**
   * Get document info: total paragraph count (including empty), non-empty count.
   */
  async info(itemId) {
    var buf  = await downloadFileBuffer(itemId);
    var xml  = await readDocxXml(buf);
    var all  = parseDocxParagraphs(xml);
    var nonE = all.filter(function(p) { return p.trim().length > 0; });
    return { totalParagraphs: all.length, nonEmptyParagraphs: nonE.length };
  },

  /**
   * Read document paragraphs with offset/limit for large-file support.
   * opts: { offset (default 0), limit (default 100), includeEmpty (default false) }
   * Returns: { totalParagraphs, offset, limit, paragraphs (string array) }
   */
  async read(itemId, opts) {
    opts = opts || {};
    var offset       = opts.offset || 0;
    var limit        = opts.limit  || 100;
    var includeEmpty = opts.includeEmpty || false;

    var buf = await downloadFileBuffer(itemId);
    var xml = await readDocxXml(buf);
    var all = parseDocxParagraphs(xml);
    if (!includeEmpty) all = all.filter(function(p) { return p.trim().length > 0; });

    return {
      totalParagraphs: all.length,
      offset:          offset,
      limit:           limit,
      paragraphs:      all.slice(offset, offset + limit),
    };
  },

  /**
   * Search paragraphs for a keyword.
   * opts: { context (paragraphs before/after match, default 1), caseSensitive (default false) }
   * Returns: [{ index, text, context: string[] }]
   */
  async search(itemId, keyword, opts) {
    opts = opts || {};
    var context       = opts.context       !== undefined ? opts.context       : 1;
    var caseSensitive = opts.caseSensitive !== undefined ? opts.caseSensitive : false;

    var buf = await downloadFileBuffer(itemId);
    var xml = await readDocxXml(buf);
    var all = parseDocxParagraphs(xml).filter(function(p) { return p.trim().length > 0; });

    var kw      = caseSensitive ? keyword : keyword.toLowerCase();
    var results = [];
    all.forEach(function(p, i) {
      var haystack = caseSensitive ? p : p.toLowerCase();
      if (haystack.includes(kw)) {
        var ctxStart = Math.max(0, i - context);
        var ctxEnd   = Math.min(all.length - 1, i + context);
        results.push({
          index:   i,
          text:    p,
          context: all.slice(ctxStart, ctxEnd + 1),
        });
      }
    });
    return results;
  },

  /**
   * Find and replace text in the document, then save back to OneDrive.
   * Works best when the text exists within a single XML text run.
   * Text split across multiple runs (due to spell-check, formatting changes etc.)
   * may not match — use word.search() first to verify the text appears cleanly.
   * opts: { replaceAll (default true) }
   * Returns { changes: [{index, before, after}], result: OneDriveItem }
   */
  async replace(itemId, searchText, replaceText, opts) {
    opts = opts || {};
    var replaceAll = opts.replaceAll !== false;

    var buf = await downloadFileBuffer(itemId);
    var entries = await unzipSyncEntries(buf);
    var xml = await readZipTextEntry(buf, 'word/document.xml');

    var escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re      = new RegExp(escaped, replaceAll ? 'g' : '');

    if (!re.test(xml)) {
      console.log('Warning: "' + searchText + '" not found in document XML.');
      console.log('Tip: text may be split across XML runs — try word.search() to inspect.');
      return { changes: [], result: null };
    }
    re.lastIndex = 0;

    var newXml  = xml.replace(re, replaceText);
    var changes = computeDiff(xml, newXml);
    await setZipTextEntry(entries, 'word/document.xml', newXml);
    var newBuf = await zipEntries(entries);
    var result = await uploadFileBuffer(itemId, newBuf);
    return { changes: changes, result: result };
  },

  /**
   * Convert document to readable HTML, preserving headings, bold/italic, lists, tables.
   * Returns an HTML string — suitable for display or writing to a .html file.
   */
  async toHtml(itemId) {
    var buf = await downloadFileBuffer(itemId);
    var xml = await readDocxXml(buf);
    return buildDocxHtml(xml);
  },

  /**
   * Apply multiple edits to a document in a single download/upload round trip.
   * Ideal for editing large files — search/read first to find indices, then patch.
   *
   * ops: array of operations (applied in order, index-based ops processed safely):
   *   { op: 'set',         index: n,     text: 'new text' }  — replace non-empty paragraph n
   *   { op: 'insert',      after: n,     text: 'new text' }  — insert new paragraph after n
   *   { op: 'delete',      index: n }                        — delete non-empty paragraph n
   *   { op: 'replaceText', search: 'x',  replace: 'y',
   *                        replaceAll: true }                 — global text substitution
   *
   * Paragraph indices match those returned by word.read() and word.search().
   * Returns { changes: [{index, before, after}], result: OneDriveItem }
   */
  async patch(itemId, ops) {
    var buf = await downloadFileBuffer(itemId);
    var entries = await unzipSyncEntries(buf);
    var xml = await readZipTextEntry(buf, 'word/document.xml');
    var oldXml = xml;

    // Step 1: replaceText ops (no index resolution needed)
    ops.forEach(function(op) {
      if (op.op !== 'replaceText') return;
      var esc = op.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re  = new RegExp(esc, op.replaceAll !== false ? 'g' : '');
      xml = xml.replace(re, op.replace);
    });

    // Step 2: resolve positional ops to XML byte positions (after replaceText)
    var positions = findParagraphPositions(xml);
    var nonEmpty  = positions.filter(function(p) { return p.text.trim().length > 0; });
    var positional = ops
      .filter(function(op) { return op.op === 'set' || op.op === 'insert' || op.op === 'delete'; })
      .map(function(op) {
        var idx = op.index !== undefined ? op.index : op.after;
        var pos = nonEmpty[idx];
        if (!pos) throw new Error('Paragraph index ' + idx + ' out of range (have ' + nonEmpty.length + ')');
        return { op: op, pos: pos };
      });

    // Process high-position ops first so earlier indices don't shift
    positional.sort(function(a, b) { return b.pos.start - a.pos.start; });
    positional.forEach(function(r) {
      var op = r.op, pos = r.pos;
      if (op.op === 'set') {
        xml = xml.slice(0, pos.start) + rebuildParagraph(pos.xml, op.text) + xml.slice(pos.end);
      } else if (op.op === 'insert') {
        xml = xml.slice(0, pos.end) + newParagraph(op.text) + xml.slice(pos.end);
      } else if (op.op === 'delete') {
        xml = xml.slice(0, pos.start) + xml.slice(pos.end);
      }
    });

    var changes = computeDiff(oldXml, xml);
    await setZipTextEntry(entries, 'word/document.xml', xml);
    var newBuf = await zipEntries(entries);
    var result = await uploadFileBuffer(itemId, newBuf);
    return { changes: changes, result: result };
  },
};

// ---------------------------------------------------------------------------
// PPTX (PowerPoint) — download + fflate XML parse
// ---------------------------------------------------------------------------

// Extract all visible text strings from a single slide XML
function parsePptxSlideTexts(xml) {
  var texts = [];
  var re = /<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g;
  var m;
  while ((m = re.exec(xml)) !== null) {
    var t = m[1];
    if (t.trim()) texts.push(t);
  }
  return texts;
}

// Sort slide filenames numerically: slide1.xml < slide2.xml < slide10.xml
function sortSlideFiles(names) {
  return names.slice().sort(function(a, b) {
    var na = parseInt((a.match(/(\d+)\.xml$/) || [0, 0])[1], 10);
    var nb = parseInt((b.match(/(\d+)\.xml$/) || [0, 0])[1], 10);
    return na - nb;
  });
}

async function readPptxSlides(bufferOrBytes) {
  var fflate = await loadFflate();
  var entries = await unzipSyncEntries(bufferOrBytes);
  var files = sortSlideFiles(
    Object.keys(entries).filter(function(n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
  );
  var slides = files.map(function(name, i) {
    var xml = fflate.strFromU8(entries[name]);
    return { index: i, name: name, texts: parsePptxSlideTexts(xml) };
  });
  return { entries: entries, files: files, slides: slides };
}

const powerpoint = {
  /**
   * Get presentation info: total slide count + brief preview of each slide.
   * Returns: { totalSlides, slides: [{ index, preview (first two text fragments) }] }
   */
  async info(itemId) {
    var parsed = await readPptxSlides(await downloadFileBuffer(itemId));
    return {
      totalSlides: parsed.files.length,
      slides: parsed.slides.map(function(slide) {
        return { index: slide.index, preview: slide.texts.slice(0, 3).join(' | ') };
      }),
    };
  },

  /**
   * Read slide content with offset/limit for large presentations.
   * opts: { offset (default 0), limit (default 10) }
   * Returns: { totalSlides, offset, limit, slides: [{ index, texts: string[] }] }
   */
  async read(itemId, opts) {
    opts = opts || {};
    var offset = opts.offset || 0;
    var limit  = opts.limit  || 10;
    var parsed = await readPptxSlides(await downloadFileBuffer(itemId));
    return {
      totalSlides: parsed.files.length,
      offset: offset,
      limit: limit,
      slides: parsed.slides.slice(offset, offset + limit).map(function(slide) {
        return { index: slide.index, texts: slide.texts };
      }),
    };
  },

  /**
   * Search slides for a keyword.
   * opts: { caseSensitive (default false) }
   * Returns: [{ index, texts, matches }] sorted by slide index
   */
  async search(itemId, keyword, opts) {
    opts = opts || {};
    var caseSensitive = opts.caseSensitive || false;
    var kw = caseSensitive ? keyword : keyword.toLowerCase();
    var parsed = await readPptxSlides(await downloadFileBuffer(itemId));
    return parsed.slides.map(function(slide) {
      var matches = slide.texts.filter(function(t) {
        return (caseSensitive ? t : t.toLowerCase()).includes(kw);
      });
      return matches.length ? { index: slide.index, texts: slide.texts, matches: matches } : null;
    }).filter(Boolean);
  },

  /**
   * Replace text in a presentation, save back to OneDrive.
   * Replaces across all slides. Works within single <a:t> runs.
   * opts: { replaceAll (default true) }
   */
  async replace(itemId, searchText, replaceText, opts) {
    opts = opts || {};
    var replaceAll = opts.replaceAll !== false;

    var parsed = await readPptxSlides(await downloadFileBuffer(itemId));
    var escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp(escaped, replaceAll ? 'g' : '');
    var count = 0;

    for (var i = 0; i < parsed.files.length; i++) {
      var name = parsed.files[i];
      var texts = parsed.slides[i].texts;
      var xml = await readZipTextEntry(parsed.entries, name);
      if (re.test(xml)) {
        count++;
        await setZipTextEntry(parsed.entries, name, xml.replace(re, replaceText));
        re.lastIndex = 0;
      }
    }

    if (count === 0) {
      console.log('Warning: "' + searchText + '" not found in any slide XML.');
      return null;
    }
    console.log('Replaced in ' + count + ' slide(s). Uploading...');
    var newBuf = await zipEntries(parsed.entries);
    return await uploadFileBuffer(itemId, newBuf);
  },
};

// ---------------------------------------------------------------------------
// Local file I/O — uses __fs_readBase64 / __fs_writeBase64 bridge from TerminalManager
// Binary never surfaces to the AI; these are used internally by the local namespace.
// ---------------------------------------------------------------------------

function base64ToUint8Array(b64) {
  var chunkChars = 16384;
  var parts = [];
  var total = 0;
  for (var i = 0; i < b64.length; i += chunkChars) {
    var bin = atob(b64.slice(i, i + chunkChars));
    var arr = new Uint8Array(bin.length);
    for (var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
    parts.push(arr);
    total += arr.length;
  }
  var out = new Uint8Array(total);
  var offset = 0;
  parts.forEach(function(part) {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function uint8ArrayToBase64(arr) {
  // Chunk size must be divisible by 3, otherwise each _btoa() chunk may add
  // padding in the middle of the final base64 stream and corrupt binary files.
  var chunk = 24576;
  var out = '';
  for (var i = 0; i < arr.length; i += chunk) {
    var slice = arr.subarray(i, i + chunk);
    var bin = '';
    for (var j = 0; j < slice.length; j++) bin += String.fromCharCode(slice[j]);
    out += _btoa(bin);
  }
  return out;
}

function readLocalUint8Array(filePath) {
  if (typeof __fs_readBase64 === 'undefined') {
    throw new Error('__fs_readBase64 not available — local file access requires the Whistant JS runtime');
  }
  var b64 = __fs_readBase64(filePath);
  if (!b64) throw new Error('Could not read file: ' + filePath);
  return base64ToUint8Array(b64);
}

function readLocalBuffer(filePath) {
  var arr = readLocalUint8Array(filePath);
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

function writeLocalBuffer(filePath, buffer) {
  if (typeof __fs_writeBase64 === 'undefined') {
    throw new Error('__fs_writeBase64 not available — local file access requires the Whistant JS runtime');
  }
  var arr = toUint8Array(buffer);
  var ok = __fs_writeBase64(filePath, uint8ArrayToBase64(arr));
  if (!ok) throw new Error('Could not write file: ' + filePath);
}

async function patchLocalDocxWithAurochs(filePath, spec) {
  var rt = loadAurochsRuntime();
  var newBytes = await rt.patchDocxBytes(spec, readLocalUint8Array(filePath));
  writeLocalBuffer(filePath, newBytes);
  return { filePath: filePath, bytesWritten: toUint8Array(newBytes).byteLength, engine: 'aurochs' };
}

async function patchLocalPptxWithAurochs(filePath, spec) {
  var rt = loadAurochsRuntime();
  var newBytes = await rt.patchPptxBytes(spec, readLocalUint8Array(filePath));
  writeLocalBuffer(filePath, newBytes);
  return { filePath: filePath, bytesWritten: toUint8Array(newBytes).byteLength, engine: 'aurochs' };
}

function normalizeAurochsWorkbookUpdates(updates) {
  if (!Array.isArray(updates)) throw new Error('Workbook updates must be an array');

  var normalized = [];
  var groupedBySheet = {};

  updates.forEach(function(update) {
    if (!update || typeof update !== 'object') {
      throw new Error('Workbook update must be an object');
    }

    if (
      Array.isArray(update.cells) ||
      Array.isArray(update.rows) ||
      Array.isArray(update.cols) ||
      Array.isArray(update.mergeCells) ||
      update.dimension ||
      update.drawing
    ) {
      normalized.push(update);
      return;
    }

    if (!update.sheetName) {
      throw new Error('Workbook update missing sheetName');
    }

    var col = update.col;
    var row = update.row;

    if ((col === undefined || row === undefined) && update.cell) {
      var match = /^([A-Za-z]+)(\d+)$/.exec(String(update.cell));
      if (!match) throw new Error('Invalid cell reference: ' + update.cell);
      col = match[1];
      row = Number(match[2]);
    }

    if (col === undefined || row === undefined) {
      throw new Error('Workbook shorthand update requires { sheetName, col, row, value } or { sheetName, cell, value }');
    }

    var key = update.sheetName;
    var target = groupedBySheet[key];
    if (!target) {
      target = { sheetName: update.sheetName, cells: [] };
      groupedBySheet[key] = target;
      normalized.push(target);
    }

    target.cells.push({
      col: String(col).toUpperCase(),
      row: Number(row),
      value: update.value,
    });
  });

  return normalized;
}

async function patchLocalWorkbookWithAurochs(filePath, updates) {
  var rt = loadAurochsRuntime();
  var newBytes = await rt.patchXlsxBytes(normalizeAurochsWorkbookUpdates(updates), readLocalUint8Array(filePath));
  writeLocalBuffer(filePath, newBytes);
  return { filePath: filePath, bytesWritten: toUint8Array(newBytes).byteLength, engine: 'aurochs' };
}

// ---------------------------------------------------------------------------
// local — same word/powerpoint API for files on device (no OneDrive needed)
// All methods accept a local file path (relative to the JS sandbox Documents root)
// and return the same shapes as their OneDrive counterparts.
// ---------------------------------------------------------------------------

// Helper: call the native Swift bridge if available
function _nativeParse(filePath) {
  if (typeof __office_openFile === 'undefined') return null;
  var result = __office_openFile(filePath);
  if (result && !result.error) return result;
  return null;
}

const local = {
  word: {
    // Sync read via native bridge (no JS, no CDN, no await)
    nativeRead: function(filePath) {
      var r = _nativeParse(filePath);
      if (!r) throw new Error('Native bridge unavailable or file unreadable: ' + filePath);
      return r;
    },
    async info(filePath) {
      var xml = await readDocxXml(readLocalUint8Array(filePath));
      var all  = parseDocxParagraphs(xml);
      var nonE = all.filter(function(p) { return p.trim().length > 0; });
      return { totalParagraphs: all.length, nonEmptyParagraphs: nonE.length };
    },
    async read(filePath, opts) {
      opts = opts || {};
      var offset       = opts.offset || 0;
      var limit        = opts.limit  || 100;
      var includeEmpty = opts.includeEmpty || false;
      var xml = await readDocxXml(readLocalUint8Array(filePath));
      var all = parseDocxParagraphs(xml);
      if (!includeEmpty) all = all.filter(function(p) { return p.trim().length > 0; });
      return { totalParagraphs: all.length, offset: offset, limit: limit,
               paragraphs: all.slice(offset, offset + limit) };
    },
    async search(filePath, keyword, opts) {
      opts = opts || {};
      var context       = opts.context       !== undefined ? opts.context       : 1;
      var caseSensitive = opts.caseSensitive !== undefined ? opts.caseSensitive : false;
      var xml = await readDocxXml(readLocalUint8Array(filePath));
      var all = parseDocxParagraphs(xml).filter(function(p) { return p.trim().length > 0; });
      var kw  = caseSensitive ? keyword : keyword.toLowerCase();
      var results = [];
      all.forEach(function(p, i) {
        var hay = caseSensitive ? p : p.toLowerCase();
        if (hay.includes(kw)) {
          results.push({ index: i, text: p,
            context: all.slice(Math.max(0, i - context), Math.min(all.length - 1, i + context) + 1) });
        }
      });
      return results;
    },
    async toHtml(filePath) {
      var xml = await readDocxXml(readLocalUint8Array(filePath));
      return buildDocxHtml(xml);
    },
    async patch(filePath, ops) {
      var bytes  = readLocalUint8Array(filePath);
      var entries = await unzipSyncEntries(bytes);
      var xml    = await readZipTextEntry(entries, 'word/document.xml');
      var oldXml = xml;
      ops.forEach(function(op) {
        if (op.op !== 'replaceText') return;
        var esc = op.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        xml = xml.replace(new RegExp(esc, op.replaceAll !== false ? 'g' : ''), op.replace);
      });
      var positions = findParagraphPositions(xml);
      var nonEmpty  = positions.filter(function(p) { return p.text.trim().length > 0; });
      var positional = ops
        .filter(function(op) { return op.op === 'set' || op.op === 'insert' || op.op === 'delete'; })
        .map(function(op) {
          var idx = op.index !== undefined ? op.index : op.after;
          var pos = nonEmpty[idx];
          if (!pos) throw new Error('Paragraph index ' + idx + ' out of range');
          return { op: op, pos: pos };
        });
      positional.sort(function(a, b) { return b.pos.start - a.pos.start; });
      positional.forEach(function(r) {
        var op = r.op, pos = r.pos;
        if (op.op === 'set')    xml = xml.slice(0, pos.start) + rebuildParagraph(pos.xml, op.text) + xml.slice(pos.end);
        else if (op.op === 'insert') xml = xml.slice(0, pos.end) + newParagraph(op.text) + xml.slice(pos.end);
        else if (op.op === 'delete') xml = xml.slice(0, pos.start) + xml.slice(pos.end);
      });
      var changes = computeDiff(oldXml, xml);
      await setZipTextEntry(entries, 'word/document.xml', xml);
      var newBuf = await zipEntries(entries);
      writeLocalBuffer(filePath, newBuf);
      return { changes: changes };
    },
  },

  powerpoint: {
    // Sync read via native bridge (no extra ZIP package loading here, no await)
    nativeRead: function(filePath) {
      var r = _nativeParse(filePath);
      if (!r) throw new Error('Native bridge unavailable or file unreadable: ' + filePath);
      return r;
    },
    async info(filePath) {
      var parsed = await readPptxSlides(readLocalUint8Array(filePath));
      return {
        totalSlides: parsed.files.length,
        slides: parsed.slides.map(function(slide) {
          return { index: slide.index, preview: slide.texts.slice(0, 3).join(' | ') };
        }),
      };
    },
    async read(filePath, opts) {
      opts = opts || {};
      var offset = opts.offset || 0;
      var limit  = opts.limit  || 10;
      var parsed = await readPptxSlides(readLocalUint8Array(filePath));
      return {
        totalSlides: parsed.files.length,
        offset: offset,
        limit: limit,
        slides: parsed.slides.slice(offset, offset + limit).map(function(slide) {
          return { index: slide.index, texts: slide.texts };
        }),
      };
    },
    async search(filePath, keyword, opts) {
      opts = opts || {};
      var cs  = opts.caseSensitive || false;
      var kw  = cs ? keyword : keyword.toLowerCase();
      var parsed = await readPptxSlides(readLocalUint8Array(filePath));
      return parsed.slides.map(function(slide) {
        var matches = slide.texts.filter(function(t) { return (cs ? t : t.toLowerCase()).includes(kw); });
        return matches.length ? { index: slide.index, texts: slide.texts, matches: matches } : null;
      }).filter(Boolean);
    },
    async replace(filePath, searchText, replaceText, opts) {
      opts = opts || {};
      var replaceAll = opts.replaceAll !== false;
      var parsed = await readPptxSlides(readLocalUint8Array(filePath));
      var escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp(escaped, replaceAll ? 'g' : '');
      var count = 0;
      for (var i = 0; i < parsed.files.length; i++) {
        var name = parsed.files[i];
        var xml = await readZipTextEntry(parsed.entries, name);
        if (re.test(xml)) {
          count++;
          await setZipTextEntry(parsed.entries, name, xml.replace(re, replaceText));
          re.lastIndex = 0;
        }
      }
      if (count === 0) { console.log('Warning: "' + searchText + '" not found.'); return { changes: [] }; }
      var newBuf = await zipEntries(parsed.entries);
      writeLocalBuffer(filePath, newBuf);
      return { replacedSlides: count };
    },
  },

  // --- Excel (local) — uses native __office_openFile bridge (sync, offline) ---
  excel: {
    /**
     * Get workbook info: sheet names, row/col counts.
     * @param {string} filePath — local path (e.g. 'Documents/data.xlsx')
     */
    info: function(filePath) {
      if (typeof __office_openFile === 'undefined') {
        throw new Error('__office_openFile not available — requires the Whistant iOS runtime');
      }
      var result = __office_openFile(filePath);
      if (result.error) throw new Error(result.error);
      return {
        sheetCount: result.sheetCount,
        sheets: (result.sheets || []).map(function(s) {
          return { name: s.name, rowCount: s.rowCount, colCount: s.colCount };
        }),
      };
    },

    /**
     * Read rows from a sheet with offset/limit.
     * opts: { sheet (name or 0-based index, default 0), offset (row offset, default 0), limit (row count, default 100) }
     */
    read: function(filePath, opts) {
      opts = opts || {};
      var sheetRef = opts.sheet !== undefined ? opts.sheet : 0;
      var offset   = opts.offset || 0;
      var limit    = opts.limit  || 100;

      if (typeof __office_openFile === 'undefined') {
        throw new Error('__office_openFile not available — requires the Whistant iOS runtime');
      }
      var result = __office_openFile(filePath);
      if (result.error) throw new Error(result.error);

      var sheet;
      if (typeof sheetRef === 'number') {
        sheet = (result.sheets || [])[sheetRef];
      } else {
        sheet = (result.sheets || []).find(function(s) { return s.name === sheetRef; });
      }
      if (!sheet) throw new Error('Sheet not found: ' + sheetRef);

      var rows = (sheet.rows || []).slice(offset, offset + limit);
      return {
        sheet:     sheet.name,
        totalRows: sheet.rowCount,
        totalCols: sheet.colCount,
        offset:    offset,
        limit:     limit,
        rows:      rows,
      };
    },

    /**
     * Get sheet names.
     */
    sheetNames: function(filePath) {
      var info = local.excel.info(filePath);
      return info.sheets.map(function(s) { return s.name; });
    },

    /**
     * Read a specific sheet's rows (all of them).
     * @param {number|string} sheetRef — 0-based index or sheet name
     */
    sheetData: function(filePath, sheetRef) {
      if (typeof __office_openFile === 'undefined') {
        throw new Error('__office_openFile not available — requires the Whistant iOS runtime');
      }
      var result = __office_openFile(filePath);
      if (result.error) throw new Error(result.error);
      var sheet;
      if (typeof sheetRef === 'number') {
        sheet = (result.sheets || [])[sheetRef];
      } else {
        sheet = (result.sheets || []).find(function(s) { return s.name === sheetRef; });
      }
      if (!sheet) throw new Error('Sheet not found: ' + sheetRef);
      return sheet.rows || [];
    },

    /**
     * Search for text across all sheets.
     * Returns [{ sheet, row (0-based), col (0-based), value }]
     */
    search: function(filePath, query) {
      if (typeof __office_openFile === 'undefined') {
        throw new Error('__office_openFile not available — requires the Whistant iOS runtime');
      }
      var result = __office_openFile(filePath);
      if (result.error) throw new Error(result.error);
      var q = String(query).toLowerCase();
      var hits = [];
      (result.sheets || []).forEach(function(sheet) {
        (sheet.rows || []).forEach(function(row, ri) {
          row.forEach(function(cell, ci) {
            if (String(cell).toLowerCase().indexOf(q) !== -1) {
              hits.push({ sheet: sheet.name, row: ri, col: ci, value: cell });
            }
          });
        });
      });
      return hits;
    },

    /**
     * Replace plain text values in a local XLSX by editing OOXML XML parts directly.
     * Best for shared strings / inline strings, not formulas or typed numeric cells.
     */
    async replace(filePath, searchText, replaceText, opts) {
      opts = opts || {};
      var replaceAll = opts.replaceAll !== false;
      var entries = await unzipSyncEntries(readLocalUint8Array(filePath));
      var escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var changedEntries = [];
      var targets = Object.keys(entries).filter(function(name) {
        return name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(name);
      });

      for (var i = 0; i < targets.length; i++) {
        var name = targets[i];
        var re = new RegExp(escaped, replaceAll ? 'g' : '');
        var xml = await readZipTextEntry(entries, name);
        if (!re.test(xml)) continue;
        re.lastIndex = 0;
        await setZipTextEntry(entries, name, xml.replace(re, replaceText));
        changedEntries.push(name);
      }

      if (!changedEntries.length) return { changedEntries: [] };
      var newBuf = await zipEntries(entries);
      writeLocalBuffer(filePath, newBuf);
      return { changedEntries: changedEntries };
    },
  },

  // --- Skill-local AUROCHS helpers (bundled inside microsoft skill, no frontend changes needed) ---
  aurochs: {
    async patchDocx(filePath, spec) {
      return await patchLocalDocxWithAurochs(filePath, spec);
    },

    async replaceDocx(filePath, searchText, replaceText, opts) {
      opts = opts || {};
      return await patchLocalDocxWithAurochs(filePath, {
        patches: [{
          type: 'text.replace',
          search: searchText,
          replace: replaceText,
          replaceAll: opts.replaceAll !== false,
        }],
      });
    },

    async patchPptx(filePath, spec) {
      return await patchLocalPptxWithAurochs(filePath, spec);
    },

    async replacePptx(filePath, searchText, replaceText, opts) {
      opts = opts || {};
      var patch = {
        patches: [{
          type: 'text.replace',
          search: searchText,
          replace: replaceText,
          replaceAll: opts.replaceAll !== false,
        }],
      };
      if (opts.slides) patch.patches[0].slides = opts.slides;
      return await patchLocalPptxWithAurochs(filePath, patch);
    },

    async patchWorkbook(filePath, updates) {
      return await patchLocalWorkbookWithAurochs(filePath, updates);
    },
  },
};

// ---------------------------------------------------------------------------
// findFile — search OneDrive by filename
// ---------------------------------------------------------------------------

/**
 * Search OneDrive for files matching name fragment.
 * Returns array of { id, name, size, lastModifiedDateTime, webUrl, mimeType }
 * opts: { max (default 10) }
 */
async function findFile(name, opts) {
  var max  = (opts && opts.max) || 10;
  var m    = require('/skills/microsoft/scripts/microsoft');
  var items = await m.onedrive.search(name, { max: max });
  return items.map(function(item) {
    return {
      id:                   item.id,
      name:                 item.name,
      size:                 item.size,
      lastModifiedDateTime: item.lastModifiedDateTime,
      webUrl:               item.webUrl,
      mimeType:             item.file ? item.file.mimeType : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const office = { excel, word, powerpoint, findFile, fetchWithRetry, local };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = office;
} else if (typeof globalThis !== 'undefined') {
  globalThis.msOffice = office;
}
