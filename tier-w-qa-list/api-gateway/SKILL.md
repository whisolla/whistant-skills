---
name: api-gateway
description: Passthrough proxy for third-party APIs using Maton.ai managed OAuth. Call 100+ services (Slack, Notion, Airtable, HubSpot, etc.) without handling OAuth tokens yourself. Requires MATON_API_KEY. Evolved from byungkyu/api-gateway version 1.0.124 at 2026-05-27.
version: 2.2
keychain: [MATON_API_KEY]
---
# api-gateway

Use Maton's API gateway to call third-party services with managed OAuth. The gateway injects OAuth tokens automatically — you only need a Maton API key.

Get your key at: https://maton.ai — then connect services in the Maton dashboard.

## /cmd — Whistant terminal

```bash
# Check account
run /skills/api-gateway/scripts/api-gateway.js user

# List active connections
run /skills/api-gateway/scripts/api-gateway.js connections --status=ACTIVE

# Call a service
run /skills/api-gateway/scripts/api-gateway.js call --app=slack --path=/api/auth.test
run /skills/api-gateway/scripts/api-gateway.js call --app=notion --path=/v1/users/me
```

### Flags

| Flag | Values | Description |
|------|--------|-------------|
| `--app` | `slack`, `notion`, `github`, etc. | Service name |
| `--path` | `/api/...` | Native API endpoint path |
| `--body` | JSON string | Request body (for POST/PUT/PATCH) |
| `--method` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | HTTP method (default: GET) |
| `--headers` | JSON string | Additional headers |
| `--connection` | connection ID | Specific connection for multi-account |
| `--status` | `ACTIVE`, `INACTIVE` | Filter connections by status |

### Actions

| Action | Description | Flags |
|--------|-------------|-------|
| `user` | Get account info (name, email, credits) | — |
| `connections` | List connected services | `--status` |
| `call` | Passthrough API call | `--app`, `--path`, `--body`, `--method`, `--headers`, `--connection` |

## /code — JS API

```js
var gw = require("/skills/api-gateway/scripts/api-gateway.js");

// Set API key
gw.init({ apiKey: "v2.xxx" });
// or store in keychain: keychain.set("MATON_API_KEY", "v2.xxx")

// Account info
var user = await gw.getUser();
console.log(user.name, user.email);

// List connections
var conns = await gw.listConnections("ACTIVE");
console.log("Active connections:", conns.connections.length);

// Passthrough call
var result = await gw.call("slack", "/api/auth.test");
console.log(result.ok, result.message);

// With body and custom method
var page = await gw.call("notion", "/v1/pages", {
  parent: { database_id: "xxx" },
  properties: { Name: { title: [{ text: { content: "Hello" } }] } }
}, "POST", { "Notion-Version": "2022-06-28" });

// With specific connection
var msg = await gw.call("slack", "/api/chat.postMessage", {
  channel: "C0123456789", text: "Hello!"
}, "POST", null, "conn-xxx");
```

## Supported services (sample)

| Service | App Name | Notes |
|---|---|---|
| Slack | `slack` | Messages, channels, users |
| Notion | `notion` | Pages, databases, blocks |
| Google Mail | `google-mail` | Gmail API |
| Google Drive | `google-drive` | Files, folders |
| GitHub | `github` | Repos, issues, PRs |
| Airtable | `airtable` | Bases, tables, records |
| HubSpot | `hubspot` | CRM contacts, deals |
| Salesforce | `salesforce` | CRM objects |
| Jira | `jira` | Issues, projects |
| Linear | `linear` | Issues, teams |
| Asana | `asana` | Tasks, projects |
| Dropbox | `dropbox` | Files |
| ElevenLabs | `elevenlabs` | TTS |

Full list of 100+ services: https://maton.ai/connections

## Notes

- Maton key authenticates YOU, not the service — services must be connected via Maton dashboard first
- Each service uses its native API schema — check the service's API docs for endpoint paths
- `ctrl.maton.ai` = management API | `gateway.maton.ai` = proxy API
- If no connections are configured, calls return HTTP 400 with guidance

## Local Testing

```bash
cd backend
echo '{"type":"commonjs"}' > skills/api-gateway/scripts/package.json
MATON_API_KEY="v2.your-key" node -e "
var gw = require('./skills/api-gateway/scripts/api-gateway.js');
(async function() {
  console.log('user:', (await gw.getUser()).email);
  console.log('connections:', (await gw.listConnections()).connections.length);
})();
"
rm skills/api-gateway/scripts/package.json
```
