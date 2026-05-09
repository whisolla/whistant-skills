---
name: ontology
description: Typed knowledge graph for structured agent memory. Create/query/relate entities (Person, Project, Task, Event, etc.) stored as JSONL in memory/ontology/graph.jsonl.
version: 2.0
---
# ontology

A typed knowledge graph stored as append-only JSONL. Uses `fs` to read/write — no external dependencies.

## Storage

Default path: `memory/ontology/graph.jsonl`

```js
const fs = require('fs');
const path = require('path');
const GRAPH_PATH = path.join(process.env.HOME || '~', 'memory/ontology/graph.jsonl');
fs.mkdirSync(path.dirname(GRAPH_PATH), { recursive: true });
```

## Core types

```js
// Entity shapes
const types = {
  Person: { required: ['name'] },
  Project: { required: ['name', 'status'] },
  Task: { required: ['title', 'status'], status_enum: ['open', 'in_progress', 'blocked', 'done'] },
  Event: { required: ['title', 'start'] },
  Document: { required: ['title'] },
  Note: { required: ['content'] },
};
```

## Create entity

```js
function createEntity(type, props, id = null) {
  const entity = {
    id: id || `${type.toLowerCase()}_${Date.now()}`,
    type,
    properties: props,
    relations: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  const record = JSON.stringify({ op: 'create', entity });
  fs.appendFileSync(GRAPH_PATH, record + '\n');
  return entity;
}

// Examples
const alice = createEntity('Person', { name: 'Alice', email: 'alice@example.com' });
const proj = createEntity('Project', { name: 'Website Redesign', status: 'active' }, 'proj_001');
const task = createEntity('Task', { title: 'Fix login bug', status: 'open', assignee: alice.id });
```

## Load graph (replay JSONL)

```js
function loadGraph(graphPath = GRAPH_PATH) {
  if (!fs.existsSync(graphPath)) return { entities: {}, relations: [] };
  const entities = {};
  const relations = [];
  const lines = fs.readFileSync(graphPath, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    const record = JSON.parse(line);
    if (record.op === 'create' || record.op === 'update') {
      entities[record.entity.id] = record.entity;
    } else if (record.op === 'relate') {
      relations.push({ from: record.from, rel: record.rel, to: record.to });
    } else if (record.op === 'delete') {
      delete entities[record.id];
    }
  }
  return { entities, relations };
}

const { entities, relations } = loadGraph();
console.log('Entities:', Object.keys(entities).length);
```

## Query by type

```js
function queryByType(type, where = {}) {
  const { entities } = loadGraph();
  return Object.values(entities).filter(e => {
    if (e.type !== type) return false;
    return Object.entries(where).every(([k, v]) => e.properties[k] === v);
  });
}

// Get all open tasks
const openTasks = queryByType('Task', { status: 'open' });
openTasks.forEach(t => console.log(t.id, t.properties.title));
```

## Get entity by ID

```js
function getById(id) {
  const { entities } = loadGraph();
  return entities[id] ?? null;
}

const person = getById('proj_001');
console.log(person?.properties);
```

## Create relation

```js
function relate(fromId, rel, toId) {
  const record = JSON.stringify({ op: 'relate', from: fromId, rel, to: toId });
  fs.appendFileSync(GRAPH_PATH, record + '\n');
}

relate('proj_001', 'has_owner', alice.id);
relate(task.id, 'belongs_to', 'proj_001');
```

## Get related entities

```js
function getRelated(entityId, relType = null) {
  const { entities, relations } = loadGraph();
  const outgoing = relations
    .filter(r => r.from === entityId && (relType ? r.rel === relType : true))
    .map(r => ({ rel: r.rel, entity: entities[r.to] }));
  const incoming = relations
    .filter(r => r.to === entityId && (relType ? r.rel === relType : true))
    .map(r => ({ rel: r.rel, entity: entities[r.from] }));
  return { outgoing, incoming };
}

const { outgoing } = getRelated('proj_001', 'has_owner');
outgoing.forEach(r => console.log(r.rel, '->', r.entity?.properties?.name));
```

## Update entity

```js
function updateEntity(id, propsUpdate) {
  const existing = getById(id);
  if (!existing) throw new Error('Entity not found: ' + id);
  const updated = { ...existing, properties: { ...existing.properties, ...propsUpdate }, updated: new Date().toISOString() };
  const record = JSON.stringify({ op: 'update', entity: updated });
  fs.appendFileSync(GRAPH_PATH, record + '\n');
  return updated;
}

updateEntity(task.id, { status: 'in_progress' });
```

## Delete entity

```js
function deleteEntity(id) {
  const record = JSON.stringify({ op: 'delete', id });
  fs.appendFileSync(GRAPH_PATH, record + '\n');
}
```

## Notes

- JSONL format: one operation per line — append-only, never overwrite
- `loadGraph()` replays the full log — later ops override earlier ones
- Keep graph under ~10k entities for good performance in JSCore
- For larger graphs, migrate to SQLite via `require('better-sqlite3')` (needs `pkg add`)
