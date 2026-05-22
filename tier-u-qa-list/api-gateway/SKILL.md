---
name: api-gateway
description: Passthrough proxy for third-party APIs using Maton.ai managed OAuth. Call 100+ services (Slack, Notion, Airtable, HubSpot, etc.) without handling OAuth tokens yourself. Requires MATON_API_KEY.
version: 1.0
---
# api-gateway

Use Maton's API gateway to call third-party services with managed OAuth via `fetch()`. The gateway injects OAuth tokens automatically — you only need a Maton API key.

Get your key at: https://maton.ai — then connect services in the Maton dashboard.

## Setup

```js
const MATON_API_KEY = 'your_maton_api_key';
const GATEWAY = 'https://gateway.maton.ai';
const headers = {
  'Authorization': `Bearer ${MATON_API_KEY}`,
  'Content-Type': 'application/json',
};
```

## URL pattern

```js
// https://gateway.maton.ai/{app}/{native-api-path}
// {app} = service name (e.g. slack, notion, google-mail)
// {native-api-path} = the actual API endpoint on that service

const slackUrl = `${GATEWAY}/slack/api/chat.postMessage`;
const notionUrl = `${GATEWAY}/notion/v1/pages`;
const gmailUrl = `${GATEWAY}/google-mail/gmail/v1/users/me/messages`;
console.log(slackUrl, notionUrl, gmailUrl);
```

## Example: Send a Slack message

```js
const res = await fetch(`${GATEWAY}/slack/api/chat.postMessage`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ channel: 'C0123456789', text: 'Hello from Whistant!' }),
});
const data = await res.json();
console.log('ok:', data.ok, 'ts:', data.ts);
```

## Example: Create a Notion page

```js
const res = await fetch(`${GATEWAY}/notion/v1/pages`, {
  method: 'POST',
  headers: { ...headers, 'Notion-Version': '2022-06-28' },
  body: JSON.stringify({
    parent: { database_id: 'your-database-id' },
    properties: { Name: { title: [{ text: { content: 'New page' } }] } },
  }),
});
const page = await res.json();
console.log('Created:', page.id);
```

## Example: List Airtable records

```js
const BASE_ID = 'appXXXXXX';
const TABLE = 'Tasks';
const res = await fetch(`${GATEWAY}/airtable/v0/${BASE_ID}/${TABLE}?maxRecords=10`, { headers });
const data = await res.json();
data.records?.forEach(r => console.log(r.id, r.fields));
```

## Example: Send a Gmail message

```js
const raw = btoa('To: someone@example.com\r\nSubject: Test\r\n\r\nHello from gateway!')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const res = await fetch(`${GATEWAY}/google-mail/gmail/v1/users/me/messages/send`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ raw }),
});
console.log('Sent:', (await res.json()).id);
```

## List active connections

```js
const res = await fetch('https://ctrl.maton.ai/connections?status=ACTIVE', { headers });
const data = await res.json();
data.connections?.forEach(c => console.log(c.app, c.id, c.status));
```

## Multiple connections for the same app

```js
// If you have multiple Slack workspaces connected, specify which one:
const res = await fetch(`${GATEWAY}/slack/api/conversations.list`, {
  headers: { ...headers, 'Maton-Connection': 'connection-id-here' },
});
```

## Supported services (sample)

| Service | App Name | Notes |
|---|---|---|
| Slack | `slack` | Messages, channels, users |
| Notion | `notion` | Pages, databases, blocks |
| Google Mail | `google-mail` | Gmail API |
| Google Drive | `google-drive` | Files, folders |
| Google Calendar | `google-calendar` | Events, calendars |
| Airtable | `airtable` | Bases, tables, records |
| HubSpot | `hubspot` | CRM contacts, deals |
| GitHub | `github` | Repos, issues, PRs |
| Salesforce | `salesforce` | CRM objects |
| Jira | `jira` | Issues, projects |
| Linear | `linear` | Issues, teams |
| Asana | `asana` | Tasks, projects |
| Notion | `notion` | Pages, DBs |
| Dropbox | `dropbox` | Files |
| ElevenLabs | `elevenlabs` | TTS |
| Exa | `exa` | Web search |
| Firecrawl | `firecrawl` | Web scraping |

Full list of 100+ services: https://maton.ai/connections

## Notes

- Maton key authenticates YOU, not the service — services must be connected via Maton dashboard first
- Each service uses its native API schema — check the service's API docs for endpoint paths
- Rate limits apply per service's own limits
- `ctrl.maton.ai` = management API | `gateway.maton.ai` = proxy API
