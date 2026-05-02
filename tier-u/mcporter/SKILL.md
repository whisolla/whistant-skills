---
name: mcporter
description: Call MCP servers and tools directly via JSON-RPC over HTTP using fetch(). List tools, call tools, and manage MCP server interactions without the mcporter CLI.
version: 1.0
---
# mcporter

Call MCP (Model Context Protocol) servers directly via `fetch()` using JSON-RPC 2.0. Works with any HTTP-mode MCP server.

> For stdio-mode MCP servers, `mcporter` CLI is needed. This skill covers HTTP-mode servers via fetch().

## MCP session setup (initialize + get tools)

```js
const MCP_URL = 'https://your-mcp-server.com/mcp'; // or http://localhost:PORT/mcp

async function initMcp(url) {
  // Step 1: Initialize
  const initRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'whistant', version: '1.0' },
      },
      id: 1,
    }),
  });
  const sessionId = initRes.headers.get('Mcp-Session-Id');

  // Step 2: Confirm initialized
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }),
  });

  return { sessionId };
}

const { sessionId } = await initMcp(MCP_URL);
console.log('Session:', sessionId);
```

## List available tools

```js
async function listTools(url, sessionId) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 2 }),
  });
  const data = await res.json();
  return data.result?.tools ?? [];
}

const tools = await listTools(MCP_URL, sessionId);
tools.forEach(t => console.log(t.name, '—', t.description));
```

## Call a tool

```js
async function callTool(url, sessionId, toolName, args = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: args },
      id: 3,
    }),
  });
  const data = await res.json();
  return data.result?.content?.[0]?.text ?? data.result ?? data.error;
}

// Example: call a tool with arguments
const result = await callTool(MCP_URL, sessionId, 'fetch', { url: 'https://example.com' });
console.log(result);
```

## Full one-shot MCP call

```js
async function mcpCall(serverUrl, toolName, args = {}) {
  // Initialize
  const initRes = await fetch(serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'whistant', version: '1.0' } }, id: 1 }),
  });
  const sessionId = initRes.headers.get('Mcp-Session-Id');
  const headers = { 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) };

  // Confirm init
  await fetch(serverUrl, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) });

  // Call tool
  const res = await fetch(serverUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', params: { name: toolName, arguments: args }, id: 2 }),
  });
  return (await res.json()).result;
}

// Usage
const out = await mcpCall('http://localhost:3001/mcp', 'get_weather', { location: 'Boston' });
console.log(out);
```

## List resources (if server supports it)

```js
async function listResources(url, sessionId) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'resources/list', params: {}, id: 4 }),
  });
  return (await res.json()).result?.resources ?? [];
}
```

## Notes

- MCP uses JSON-RPC 2.0 over HTTP POST
- `Mcp-Session-Id` header maintains session state — required for stateful servers
- Sequence: `initialize` → `notifications/initialized` → `tools/call`
- For stdio-mode servers: use `mcporter` CLI (`npm i -g mcporter`) — not available in JSCore
- Protocol version: `2024-11-05` (current stable)
- Full MCP spec: https://modelcontextprotocol.io
