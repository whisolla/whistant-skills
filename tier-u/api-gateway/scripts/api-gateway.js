/**
 * api-gateway helper
 * Maton.ai managed OAuth gateway — call 100+ services via native APIs.
 * Requires MATON_API_KEY — get one at https://maton.ai
 */

const GATEWAY = 'https://gateway.maton.ai';

/**
 * Create request headers for Maton gateway.
 */
function headers(apiKey, extra = {}) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * Call a service via Maton gateway.
 * @param {string} apiKey - Maton API key
 * @param {string} app - Service name (e.g. 'slack', 'notion', 'github')
 * @param {string} path - Native API path (e.g. '/api/chat.postMessage')
 * @param {object} body - Request body (for POST/PATCH/PUT)
 * @param {string} method - HTTP method (default: 'POST')
 * @param {object} extraHeaders - Additional headers
 */
async function call(apiKey, app, path, body = null, method = 'POST', extraHeaders = {}) {
  const url = `${GATEWAY}/${app}${path}`;
  const opts = {
    method,
    headers: headers(apiKey, extraHeaders),
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

/**
 * Call with a specific connection ID (for multiple accounts of same service).
 */
async function callWithConnection(apiKey, app, path, body, method, connectionId) {
  return call(apiKey, app, path, body, method, { 'Maton-Connection': connectionId });
}

module.exports = { call, callWithConnection };
