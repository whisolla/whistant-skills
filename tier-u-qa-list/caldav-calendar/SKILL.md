---
name: caldav-calendar
description: Sync and query CalDAV calendars (iCloud, Google, Fastmail, Nextcloud, etc.) via the CalDAV REST protocol using fetch(). Read/create/update/delete events.
version: 2.2
---
# caldav-calendar

Interact with CalDAV servers directly via `fetch()` using XML requests. Works with iCloud, Google Calendar, Fastmail, Nextcloud, and any CalDAV-compatible server.

## Runtime: fetch✅ btoa✅ | blocked: child_process WebSocket Blob

## Token Setup (one-time)

Credentials are auto-resolved from: `globalThis` → `keychain` → `process.env`.

**Store your credentials once:**
```js
await keychain.set('CALDAV_URL', 'https://caldav.icloud.com');
await keychain.set('CALDAV_USERNAME', 'your@email.com');
await keychain.set('CALDAV_PASSWORD', 'app-specific-password');
```

**Common CalDAV base URLs:**
- iCloud: `https://caldav.icloud.com/`
- Google: `https://www.google.com/calendar/dav/`
- Fastmail: `https://caldav.fastmail.com/`
- Nextcloud: `https://your-server.com/remote.php/dav/`

**Note:** iCloud requires an **app-specific password** (not your Apple ID password) — generate at appleid.apple.com. Google Calendar CalDAV requires OAuth2 Bearer token.

## /cmd Usage

```sh
# Discover principal / calendar home
run /skills/caldav-calendar/scripts/caldav-calendar.js discover

# List calendars at a given home URL
run /skills/caldav-calendar/scripts/caldav-calendar.js listCalendars --calUrl https://caldav.example.com/user/calendars/

# Query events in a date range
run /skills/caldav-calendar/scripts/caldav-calendar.js queryEvents --calUrl https://caldav.example.com/user/calendar/ --start 20260101T000000Z --end 20260201T000000Z

# Create an event (PUT)
run /skills/caldav-calendar/scripts/caldav-calendar.js createEvent --calUrl https://caldav.example.com/user/calendar/ --dtstart 20260115T100000Z --dtend 20260115T110000Z --summary "Team Meeting"
```

## /code Usage

```js
const caldav = require('/skills/caldav-calendar/scripts/caldav-calendar.js');

// Auto-resolve credentials from keychain
const client = await caldav.getClient();
console.log(await client.discover());

// Or construct directly
const client2 = caldav.calDavClient({
  baseUrl: 'https://caldav.icloud.com',
  username: 'your@email.com',
  password: 'app-password',
});

// List calendars
console.log(await client2.listCalendars('https://caldav.example.com/user/'));

// Query events
console.log(await client2.queryEvents('https://caldav.example.com/user/calendar/', {
  start: '20260101T000000Z',
  end: '20260201T000000Z',
}));
```

## Available Actions

| Action | Params |
|--------|--------|
| `discover` | — (finds principal/calendar home) |
| `listCalendars` | `calUrl` (calendar home URL) |
| `queryEvents` | `calUrl`, `start`, `end` |
| `createEvent` | `calUrl`, `dtstart`, `dtend`, `summary`, `description` |
| `deleteEvent` | `calUrl`, `uid`, `etag` |

## Discover calendars (PROPFIND)

```js
const client = caldav.calDavClient({ baseUrl, username, password });
const xml = await client.discover();
// Parse calendar-home-set href from xml
const homeMatch = xml.match(/<[^:]*:?href[^>]*>([^<]+calendar[^<]+)<\/[^>]+href>/);
console.log('Calendar home:', homeMatch && homeMatch[1] ? homeMatch[1] : 'not found');
```

## List calendars

```js
const calendars = await client.listCalendars(calHomeUrl);
calendars.forEach(c => console.log(c.displayName, '→', c.href));
```

## Query events (REPORT)

```js
const events = await client.queryEvents(calUrl, {
  start: '20260101T000000Z',
  end: '20260201T000000Z',
});
events.forEach(e => console.log(e.dtstart, e.summary));
```

## Create event (PUT)

```js
const result = await client.createEvent(calUrl, {
  summary: 'Team Meeting',
  dtstart: '20260115T100000Z',
  dtend: '20260115T110000Z',
  description: 'Weekly sync',
});
console.log('Created:', result.uid, 'ETag:', result.etag);
```

## Delete event (DELETE)

```js
const result = await client.deleteEvent(calUrl, uid, etag);
console.log('Deleted:', result.status);
```

## Notes

- iCloud `PROPFIND` on root with `Depth: 1` returns 400 — use `Depth: 0`. Calendar-home-set may not appear in root PROPFIND response (server quirk). For iCloud specifically, you may need to discover the principal URL manually via alternative methods.
- `Depth: 1` means include children; `Depth: 0` means just the resource itself.
- REPORT with `calendar-query` is the standard way to fetch events by date range.
- Event UID must be unique; use timestamp or UUID.

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
CALDAV_URL=https://caldav.icloud.com CALDAV_USERNAME=... CALDAV_PASSWORD=... node scripts/caldav-calendar.js discover
```
