---
name: caldav-calendar
description: Sync and query CalDAV calendars (iCloud, Google, Fastmail, Nextcloud, etc.) via the CalDAV REST protocol using fetch(). Read/create/update/delete events. Evolved from asleep123/caldav-calendar version 1.0.1 at 2026-05-22.
version: 2.6
keychain: [CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD]
---
# caldav-calendar

Interact with CalDAV servers directly via `fetch()` using XML requests. Works with iCloud, Google Calendar, Fastmail, Nextcloud, and any CalDAV-compatible server.

## Current Device Status

All actions work on device via `/cmd`. The recommended entry point is `fullSync` — it handles the entire iCloud 2-step discovery chain automatically:

- `fullSync` — discover → list calendars → query all events (one command)
- `discover` — returns parsed `{baseUrl, principalUrl, calendarHome}` (not raw XML)
- `listCalendars` — returns calendars with absolute URLs
- `queryEvents` — query events by date range
- `createEvent` — create new events
- `deleteEvent` — delete events

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
# Full sync — discover + list calendars + query all events (recommended)
run /skills/caldav-calendar/scripts/caldav-calendar.js fullSync

# Discover principal / calendar home (returns parsed JSON)
run /skills/caldav-calendar/scripts/caldav-calendar.js discover

# List calendars at a given home URL (returns absolute URLs)
run /skills/caldav-calendar/scripts/caldav-calendar.js listCalendars --calUrl https://p174-caldav.icloud.com:443/18712951099/calendars/

# Query events in a date range
run /skills/caldav-calendar/scripts/caldav-calendar.js queryEvents --calUrl https://p174-caldav.icloud.com:443/18712951099/calendars/486C1236-3CF5-459B-97E2-B00362EEB893/ --start 20260101T000000Z --end 20260201T000000Z

# Create an event (PUT)
run /skills/caldav-calendar/scripts/caldav-calendar.js createEvent --calUrl https://.../calendars/ --dtstart 20260115T100000Z --dtend 20260115T110000Z --summary "Team Meeting"

# Delete an event (DELETE)
run /skills/caldav-calendar/scripts/caldav-calendar.js deleteEvent --calUrl https://.../calendars/ --uid event-uid@example.com
```

## Usage

All operations use `/cmd`. The `fullSync` command handles discovery automatically.

```sh
# Full sync — discover + list calendars + query all events (recommended)
run /skills/caldav-calendar/scripts/caldav-calendar.js fullSync
```

See `/cmd Usage` section for all commands.

## Available Actions

| Action | Params |
|--------|--------|
| `fullSync` | — (discover → list → query all events, 30-day window) |
| `discover` | — (returns `{baseUrl, principalUrl, calendarHome}`) |
| `listCalendars` | `calUrl` (calendar home URL, returns absolute URLs) |
| `queryEvents` | `calUrl`, `start`, `end` |
| `createEvent` | `calUrl`, `dtstart`, `dtend`, `summary`, `description` |
| `deleteEvent` | `calUrl`, `uid`, `etag` |

## Full sync (one-command calendar overview)

```js
const client = caldav.calDavClient({ baseUrl, username, password });
const result = await caldav.getClient();
const sync = await client.fullSync();
console.log(sync.calendars.length, 'calendars,', sync.events.length, 'events');
```

## Discover calendars (PROPFIND)

```js
const client = caldav.calDavClient({ baseUrl, username, password });
const info = await client.discover();
// Returns: { baseUrl, principalUrl, calendarHome }
console.log('Calendar home:', info.calendarHome);
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
- The current device bridge supports custom HTTP methods with bodies, so CalDAV discovery and event queries can run directly through `fetch()`.
- For iCloud deletes, omit `If-Match` unless you have a real ETag. Sending `If-Match: *` causes `412 Precondition Failed`.

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
CALDAV_URL=https://caldav.icloud.com CALDAV_USERNAME=... CALDAV_PASSWORD=... node scripts/caldav-calendar.js discover
```
