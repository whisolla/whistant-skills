// ============================================================================
// notion skill — Notion API integration for Whistant iPhone
// Version: 2.1
// ============================================================================

// ---------------------------------------------------------------------------
// 1. SKILL LOGIC — Notion API helper functions
// ---------------------------------------------------------------------------

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

async function _getApiKey() {
  // Check globalThis (set by /code test harness)
  if (typeof globalThis !== 'undefined' && globalThis.NOTION_TOKEN) return globalThis.NOTION_TOKEN;
  // Check process.env (Node.js CLI local testing)
  if (typeof process !== 'undefined' && process.env && process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  // Check environment/global variable (sandbox)
  if (typeof NOTION_TOKEN !== 'undefined' && NOTION_TOKEN) return NOTION_TOKEN;
  // Check keychain
  if (typeof keychain !== 'undefined') {
    try { var v = await keychain.get('NOTION_TOKEN'); if (v) return v; } catch (e) {}
  }
  return null;
}

function _makeHeaders(token) {
  return {
    'Authorization': 'Bearer ' + token,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function _fetch(path, options) {
  var token = await _getApiKey();
  if (!token) throw new Error('NOTION_TOKEN not found. Set it via keychain.set("NOTION_TOKEN", "ntn_...") or pass it as a parameter.');
  var url = NOTION_API + path;
  var fetchOpts = Object.assign({ headers: _makeHeaders(token), timeout: 15 }, options || {});
  var res = await fetch(url, fetchOpts);
  if (!res.ok) {
    var text = await res.text().catch(function() { return ''; });
    throw new Error('Notion API error ' + res.status + ': ' + text);
  }
  return await res.json();
}

// --- search ---
async function search(query, options) {
  var body = { query: query || '', page_size: 100 };
  if (options && options.filter) body.filter = options.filter;
  if (options && options.sort) body.sort = options.sort;
  if (options && options.page_size) body.page_size = options.page_size;
  return await _fetch('/search', { method: 'POST', body: JSON.stringify(body) });
}

// --- get-page ---
async function getPage(pageId) {
  if (!pageId) throw new Error('pageId is required');
  return await _fetch('/pages/' + pageId);
}

// --- query-db ---
async function queryDatabase(databaseId, options) {
  if (!databaseId) throw new Error('databaseId is required');
  var body = { page_size: 100 };
  if (options) {
    if (options.filter) body.filter = options.filter;
    if (options.sorts) body.sorts = options.sorts;
    if (options.start_cursor) body.start_cursor = options.start_cursor;
    if (options.page_size) body.page_size = options.page_size;
  }
  return await _fetch('/databases/' + databaseId + '/query', { method: 'POST', body: JSON.stringify(body) });
}

// --- create-page ---
async function createPage(params) {
  if (!params) throw new Error('createPage requires parameters: parent (database_id or page_id), properties');
  var body = { parent: params.parent, properties: params.properties || {} };
  if (params.children) body.children = params.children;
  return await _fetch('/pages', { method: 'POST', body: JSON.stringify(body) });
}

// --- append-block ---
async function appendBlock(blockId, children) {
  if (!blockId) throw new Error('blockId is required');
  if (!children || !children.length) throw new Error('children array is required');
  return await _fetch('/blocks/' + blockId + '/children', { method: 'PATCH', body: JSON.stringify({ children: children }) });
}

// --- get-blocks ---
async function getBlocks(blockId) {
  if (!blockId) throw new Error('blockId is required');
  return await _fetch('/blocks/' + blockId + '/children');
}

// --- get-database ---
async function getDatabase(databaseId) {
  if (!databaseId) throw new Error('databaseId is required');
  return await _fetch('/databases/' + databaseId);
}

// --- update-page ---
async function updatePage(pageId, updates) {
  if (!pageId) throw new Error('pageId is required');
  var body = {};
  if (updates.properties) body.properties = updates.properties;
  if (updates.archived !== undefined) body.archived = updates.archived;
  return await _fetch('/pages/' + pageId, { method: 'PATCH', body: JSON.stringify(body) });
}

// --- create-comment ---
async function createComment(parent, richText) {
  if (!parent) throw new Error('parent (page_id or discussion_id) is required');
  var body = { parent: parent, rich_text: richText };
  return await _fetch('/comments', { method: 'POST', body: JSON.stringify(body) });
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

var notion = { search, getPage, queryDatabase, createPage, appendBlock, getBlocks, getDatabase, updatePage, createComment, handler, runFromParams, parseCommand };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = notion;
}
if (typeof globalThis !== 'undefined') {
  globalThis.notion = notion;
}

// ---------------------------------------------------------------------------
// 4. CMD PARSING — tokenize + parseCommand (verbatim from template)
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
  var out = { action: '', flags: {}, args: [] };
  if (!tokens.length) return out;

  // Strip leading "run /skills/notion/scripts/notion.js"
  var i = 0;
  if (tokens[i] === 'run') i++;
  while (i < tokens.length && tokens[i].indexOf('/skills/') >= 0) i++;
  if (i >= tokens.length) return out;

  // First token after prefix = action (or --action flag with value)
  var first = tokens[i];
  if (first === '--action' || first === '-a') {
    out.action = tokens[++i];
  } else {
    out.action = first;
  }
  i++;

  for (; i < tokens.length; i++) {
    var t = tokens[i];
    if (t === '--query' || t === '-q') {
      out.flags.query = tokens[++i];
    } else if (t === '--page-id' || t === '-p') {
      out.flags.pageId = tokens[++i];
    } else if (t === '--database-id' || t === '-d') {
      out.flags.databaseId = tokens[++i];
    } else if (t === '--parent') {
      out.flags.parent = tokens[++i];
    } else if (t === '--parent-type') {
      out.flags.parentType = tokens[++i];
    } else if (t === '--properties') {
      out.flags.properties = tokens[++i];
    } else if (t === '--comment') {
      out.flags.comment = tokens[++i];
    } else if (t === '--children') {
      out.flags.children = tokens[++i];
    } else if (t === '--filter') {
      out.flags.filter = tokens[++i];
    } else if (t === '--sorts') {
      out.flags.sorts = tokens[++i];
    } else if (t === '--archived') {
      out.flags.archived = tokens[++i];
    } else {
      out.args.push(t);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 5. runFromParams — shared by handler() and PARAMS auto-run block
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // Dispatch by action
  var action = params.action || '';
  // Merge flags from /cmd (PARAMS.flags) or parse from command string
  if (params.flags) {
    // /cmd path: TerminalManager already parsed the command into params.flags
    // Keys use HYPHEN (e.g. "database-id") not underscore
    if (params.flags.action) action = params.flags.action;
    if (params.flags.query) params.query = params.flags.query;
    if (params.flags['page-id']) params.pageId = params.flags['page-id'];
    if (params.flags['database-id']) params.databaseId = params.flags['database-id'];
    if (params.flags.parent) params.parent = params.flags.parent;
    if (params.flags['parent-type']) params.parentType = params.flags['parent-type'];
    if (params.flags.properties) params.properties = params.flags.properties;
    if (params.flags.comment) params.comment = params.flags.comment;
    if (params.flags.children) params.children = params.flags.children;
    if (params.flags.filter) params.filter = params.flags.filter;
    if (params.flags.sorts) params.sorts = params.flags.sorts;
  } else if (params.command && !action) {
    // /code path or fallback: parse from command string
    var parsed = parseCommand(params.command);
    if (parsed.action) action = parsed.action;
    if (parsed.flags) {
      if (parsed.flags.query) params.query = parsed.flags.query;
      if (parsed.flags.pageId) params.pageId = parsed.flags.pageId;
      if (parsed.flags.databaseId) params.databaseId = parsed.flags.databaseId;
      if (parsed.flags.parent) params.parent = parsed.flags.parent;
      if (parsed.flags.properties) params.properties = parsed.flags.properties;
      if (parsed.flags.children) params.children = parsed.flags.children;
      if (parsed.flags.filter) params.filter = parsed.flags.filter;
      if (parsed.flags.sorts) params.sorts = parsed.flags.sorts;
    }
  }

  if (!action) {
    return 'Usage: notion <action> [options]\nActions: search, get-page, query-db, create-page, append-block, get-blocks, get-database\nRun `notion --help` for details.';
  }

  try {
    switch (action) {
      case 'search': {
        var query = params.query || params.text || params.input || '';
        var opts = {};
        if (params.filter) opts.filter = params.filter;
        if (params.sorts) opts.sorts = params.sorts;
        if (params.page_size) opts.page_size = parseInt(params.page_size, 10);
        var result = await search(query, opts);
        var lines = [];
        if (result.results && result.results.length) {
          result.results.forEach(function(item) {
            var title = '';
            try {
              var titleArr = null;
              if (item.properties) {
                var keys = Object.keys(item.properties);
                for (var ki = 0; ki < keys.length; ki++) {
                  var prop = item.properties[keys[ki]];
                  if (prop && prop.type === 'title' && Array.isArray(prop.title)) {
                    titleArr = prop.title; break;
                  }
                }
              }
              if (titleArr) {
                title = titleArr.map(function(t) { return t.plain_text || ''; }).join('');
              }
            } catch (e) {}
            lines.push((item.object === 'page' ? '[page] ' : '[db] ') + (title || item.id) + ' — ' + item.id);
          });
        } else {
          lines.push('No results found.');
        }
        if (result.has_more) lines.push('(more results available — use start_cursor)');
        return lines.join('\n');
      }

      case 'get-page': {
        if (!params.pageId) return 'Error: --page-id is required';
        var page = await getPage(params.pageId);
        var title = '';
        try {
          if (page.properties) {
            var pkeys = Object.keys(page.properties);
            for (var pki = 0; pki < pkeys.length; pki++) {
              var pprop = page.properties[pkeys[pki]];
              if (pprop && pprop.type === 'title' && Array.isArray(pprop.title)) {
                title = pprop.title.map(function(t) { return t.plain_text || ''; }).join(''); break;
              }
            }
          }
        } catch (e) {}
        return 'Page: ' + (title || page.id) + '\nID: ' + page.id + '\nURL: https://notion.so/' + page.id.replace(/-/g, '') + '\nCreated: ' + (page.created_time || 'unknown');
      }

      case 'query-db': {
        if (!params.databaseId) return 'Error: --database-id is required';
        var dbResult = await queryDatabase(params.databaseId, params);
        var lines = ['Database ' + params.databaseId + ' — ' + (dbResult.results ? dbResult.results.length : 0) + ' results'];
        if (dbResult.results) {
          dbResult.results.forEach(function(item) {
            var title = '';
            try {
              if (item.properties) {
                var dpkeys = Object.keys(item.properties);
                for (var dpki = 0; dpki < dpkeys.length; dpki++) {
                  var dpprop = item.properties[dpkeys[dpki]];
                  if (dpprop && dpprop.type === 'title' && Array.isArray(dpprop.title)) {
                    title = dpprop.title.map(function(t) { return t.plain_text || ''; }).join(''); break;
                  }
                }
              }
            } catch (e) {}
            lines.push('  ' + (title || item.id) + ' [' + item.id + ']');
          });
        }
        if (dbResult.has_more) lines.push('(more results available)');
        return lines.join('\n');
      }

      case 'create-page': {
        if (!params.parent) return 'Error: --parent (database-id or page-id) is required';
        var parentObj = {};
        // Default to database_id; use parentType: "page" for page parent
        var parentType = (params.parentType === 'page') ? 'page_id' : 'database_id';
        var parentObj = {};
        parentObj[parentType] = params.parent;
        var props = {};
        if (params.properties) {
          if (typeof params.properties === 'string') {
            try { props = JSON.parse(params.properties); } catch (e) { props = { Name: { title: [{ text: { content: params.properties } }] } }; }
          } else if (typeof params.properties === 'object') {
            props = params.properties;
          } else {
            props = { Name: { title: [{ text: { content: String(params.properties) } }] } };
          }
        }
        var page = await createPage({ parent: parentObj, properties: props, children: params.children ? JSON.parse(params.children) : undefined });
        var title = '';
        try {
          if (page.properties) {
            var cpkeys = Object.keys(page.properties);
            for (var cpki = 0; cpki < cpkeys.length; cpki++) {
              var cpprop = page.properties[cpkeys[cpki]];
              if (cpprop && cpprop.type === 'title' && Array.isArray(cpprop.title)) {
                title = cpprop.title.map(function(t) { return t.plain_text || ''; }).join(''); break;
              }
            }
          }
        } catch (e) {}
        return 'Created page: ' + (title || page.id) + '\nID: ' + page.id + '\nURL: https://notion.so/' + page.id.replace(/-/g, '');
      }

      case 'append-block': {
        if (!params.pageId) return 'Error: --page-id is required';
        if (!params.children) return 'Error: --children (JSON array) is required';
        var children;
        try { children = JSON.parse(params.children); } catch (e) { return 'Error: --children must be valid JSON'; }
        var result = await appendBlock(params.pageId, children);
        return 'Appended ' + (result.results ? result.results.length : 0) + ' block(s) to page ' + params.pageId;
      }

      case 'get-blocks': {
        if (!params.pageId) return 'Error: --page-id is required';
        var blocks = await getBlocks(params.pageId);
        var lines = ['Blocks for ' + params.pageId + ':'];
        if (blocks.results) {
          blocks.results.forEach(function(b) {
            var content = '';
            try {
              var bdata = b[b.type];
              if (bdata && bdata.rich_text && Array.isArray(bdata.rich_text)) {
                content = bdata.rich_text.map(function(t) { return t.plain_text || ''; }).join('');
              }
            } catch (e) {}
            lines.push('  [' + b.type + '] ' + content.substring(0, 80));
          });
        }
        return lines.join('\n');
      }

      case 'get-database': {
        if (!params.databaseId) return 'Error: --database-id is required';
        var db = await getDatabase(params.databaseId);
        var title = '';
        try {
          if (db.title && Array.isArray(db.title)) {
            title = db.title.map(function(t) { return t.plain_text || ''; }).join('');
          }
        } catch (e) { title = ''; }
        return 'Database: ' + (title || params.databaseId) + '\nID: ' + db.id + '\nURL: https://notion.so/' + db.id.replace(/-/g, '');
      }

      case 'update-page': {
        if (!params.pageId) return 'Error: --page-id is required';
        var updates = {};
        if (params.properties) {
          if (typeof params.properties === 'string') {
            try { updates.properties = JSON.parse(params.properties); } catch (e) { return 'Error: --properties must be valid JSON'; }
          } else {
            updates.properties = params.properties;
          }
        }
        var updated = await updatePage(params.pageId, updates);
        return 'Updated page: ' + updated.id;
      }

      case 'add-comment': {
        if (!params.pageId) return 'Error: --page-id is required';
        if (!params.comment) return 'Error: --comment text is required';
        var comment = await createComment({ page_id: params.pageId }, [{ text: { content: params.comment } }]);
        return 'Comment added to ' + params.pageId + '\nID: ' + comment.id;
      }

      default:
        return 'Unknown action: ' + action + '\nValid actions: search, get-page, query-db, create-page, append-block, get-blocks, get-database, update-page, add-comment';
    }
  } catch (err) {
    return 'Error: ' + (err.message || String(err));
  }
}

// ---------------------------------------------------------------------------
// 6. Node.js CLI entry (local dev / testing only)
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ command: process.argv.slice(2).join(' ') })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// 7. PARAMS auto-run block — device /cmd path
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
