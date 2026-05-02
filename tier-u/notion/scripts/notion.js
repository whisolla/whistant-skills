// Notion API helpers for iPhone JS sandbox
// Uses fetch() — no Node.js binaries required

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function makeHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function notionApi(token) {
  const headers = makeHeaders(token);
  const api = {
    headers,

    // --- Search ---
    async search(query, { filter, sort, page_size = 100 } = {}) {
      const body = { query, page_size };
      if (filter) body.filter = filter;
      if (sort) body.sort = sort;
      const res = await fetch(`${NOTION_API}/search`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`search error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Pages ---
    async getPage(pageId) {
      const res = await fetch(`${NOTION_API}/pages/${pageId}`, { headers });
      if (!res.ok) throw new Error(`getPage error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async createPage({ parent, properties, children }) {
      const body = { parent, properties };
      if (children) body.children = children;
      const res = await fetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`createPage error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async updatePage(pageId, { properties, archived }) {
      const body = {};
      if (properties) body.properties = properties;
      if (archived !== undefined) body.archived = archived;
      const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`updatePage error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Blocks ---
    async getBlocks(blockId) {
      const res = await fetch(`${NOTION_API}/blocks/${blockId}/children`, { headers });
      if (!res.ok) throw new Error(`getBlocks error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async appendBlocks(blockId, children) {
      const res = await fetch(`${NOTION_API}/blocks/${blockId}/children`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ children }),
      });
      if (!res.ok) throw new Error(`appendBlocks error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Databases ---
    async getDatabase(databaseId) {
      const res = await fetch(`${NOTION_API}/databases/${databaseId}`, { headers });
      if (!res.ok) throw new Error(`getDatabase error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async queryDatabase(databaseId, { filter, sorts, page_size = 100, start_cursor } = {}) {
      const body = { page_size };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (start_cursor) body.start_cursor = start_cursor;
      const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`queryDatabase error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async createDatabase(parentPageId, { title, properties }) {
      const res = await fetch(`${NOTION_API}/databases`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent: { page_id: parentPageId },
          title: [{ text: { content: title } }],
          properties,
        }),
      });
      if (!res.ok) throw new Error(`createDatabase error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    // --- Users ---
    async getUser(userId) {
      const res = await fetch(`${NOTION_API}/users/${userId}`, { headers });
      if (!res.ok) throw new Error(`getUser error: ${res.status} ${res.statusText}`);
      return await res.json();
    },

    async listUsers({ page_size = 100 } = {}) {
      const res = await fetch(`${NOTION_API}/users?page_size=${page_size}`, { headers });
      if (!res.ok) throw new Error(`listUsers error: ${res.status} ${res.statusText}`);
      return await res.json();
    },
  };
  return api;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { notionApi };
} else if (typeof globalThis !== 'undefined') {
  globalThis.notionApi = notionApi;
}
