/**
 * ontology.js — Typed knowledge graph for Whistant iOS JS runtime
 * Stored as append-only JSONL. Pure fs — no external dependencies.
 */

const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const ONTOLOGY_DIR = WORKSPACE + '/memory/ontology';
const GRAPH_FILE = ONTOLOGY_DIR + '/graph.jsonl';

function mkdirp(dir) {
  const fs = require('fs');
  fs.mkdirSync(dir, { recursive: true });
}

function readFile(path, fallback = '') {
  const fs = require('fs');
  try { return fs.readFileSync(path, 'utf8'); } catch (e) { return fallback; }
}

function appendFile(path, content) {
  const fs = require('fs');
  mkdirp(require('path').dirname(path));
  fs.appendFileSync(path, content + '\n');
}

function entityPath(id) {
  return `${ONTOLOGY_DIR}/entities/${id}.json`;
}

// ─── Entity types ─────────────────────────────────────────────────────────────

const types = {
  Person: { required: ['name'] },
  Project: { required: ['name', 'status'] },
  Task: { required: ['title', 'status'], status_enum: ['open', 'in_progress', 'blocked', 'done'] },
  Event: { required: ['title', 'start'] },
  Document: { required: ['title'] },
  Note: { required: ['content'] },
};

// ─── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new entity
 * @param {string} type — e.g. 'Person', 'Project', 'Task'
 * @param {object} properties
 * @param {string} [id] — custom ID, auto-generated if not provided
 */
function createEntity(type, properties, id = null) {
  const entityId = id || `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const entity = {
    id: entityId,
    type,
    properties,
    relations: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  appendFile(GRAPH_FILE, JSON.stringify({ op: 'create', entity }));
  return entity;
}

/**
 * Load the full graph by replaying JSONL
 * @returns {{ entities: object, relations: array }}
 */
function loadGraph() {
  if (!require('fs').existsSync(GRAPH_FILE)) return { entities: {}, relations: [] };
  const entities = {};
  const relations = [];
  const lines = readFile(GRAPH_FILE, '').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      if (record.op === 'create' || record.op === 'update') {
        entities[record.entity.id] = record.entity;
      } else if (record.op === 'relate') {
        relations.push({ from: record.from, rel: record.rel, to: record.to });
      } else if (record.op === 'delete') {
        delete entities[record.id];
      }
    } catch (e) {
      // Skip malformed lines
    }
  }
  return { entities, relations };
}

/**
 * Get a single entity by ID
 * @param {string} id
 */
function getById(id) {
  const { entities } = loadGraph();
  return entities[id] ?? null;
}

/**
 * Query entities by type and optional property filters
 * @param {string} type
 * @param {object} where — e.g. { status: 'open', assignee: 'U123' }
 */
function queryByType(type, where = {}) {
  const { entities } = loadGraph();
  return Object.values(entities).filter(e => {
    if (e.type !== type) return false;
    return Object.entries(where).every(([k, v]) => e.properties[k] === v);
  });
}

/**
 * Update entity properties
 * @param {string} id
 * @param {object} propsUpdate — e.g. { status: 'done' }
 */
function updateEntity(id, propsUpdate) {
  const existing = getById(id);
  if (!existing) throw new Error('Entity not found: ' + id);
  const updated = {
    ...existing,
    properties: { ...existing.properties, ...propsUpdate },
    updated: new Date().toISOString(),
  };
  appendFile(GRAPH_FILE, JSON.stringify({ op: 'update', entity: updated }));
  return updated;
}

/**
 * Delete an entity (soft delete — marks as deleted in log)
 * @param {string} id
 */
function deleteEntity(id) {
  appendFile(GRAPH_FILE, JSON.stringify({ op: 'delete', id }));
}

// ─── Relations ────────────────────────────────────────────────────────────────

/**
 * Create a relation between two entities
 * @param {string} fromId — source entity ID
 * @param {string} rel — relation type, e.g. 'has_owner', 'belongs_to'
 * @param {string} toId — target entity ID
 */
function relate(fromId, rel, toId) {
  appendFile(GRAPH_FILE, JSON.stringify({ op: 'relate', from: fromId, rel, to: toId }));
}

/**
 * Get entities related to a given entity
 * @param {string} entityId
 * @param {string|null} relType — filter by relation type, or null for all
 */
function getRelated(entityId, relType = null) {
  const { entities, relations } = loadGraph();
  const outgoing = relations
    .filter(r => r.from === entityId && (relType ? r.rel === relType : true))
    .map(r => ({ rel: r.rel, entity: entities[r.to] }))
    .filter(r => r.entity);
  const incoming = relations
    .filter(r => r.to === entityId && (relType ? r.rel === relType : true))
    .map(r => ({ rel: r.rel, entity: entities[r.from] }))
    .filter(r => r.entity);
  return { outgoing, incoming };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Get graph statistics
 */
function stats() {
  const { entities, relations } = loadGraph();
  const byType = {};
  for (const e of Object.values(entities)) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  return { totalEntities: Object.keys(entities).length, totalRelations: relations.length, byType };
}

/**
 * Search entities by property values (text match)
 * @param {string} query
 */
function search(query) {
  const { entities } = loadGraph();
  const q = query.toLowerCase();
  return Object.values(entities).filter(e =>
    Object.values(e.properties).some(v =>
      String(v).toLowerCase().includes(q)
    )
  );
}

module.exports = {
  createEntity,
  loadGraph,
  getById,
  queryByType,
  updateEntity,
  deleteEntity,
  relate,
  getRelated,
  stats,
  search,
  types,
};
