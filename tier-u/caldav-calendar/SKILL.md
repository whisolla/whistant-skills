---
name: caldav-calendar
description: Sync and query CalDAV calendars (iCloud, Google, Fastmail, Nextcloud, etc.) via the CalDAV REST protocol using fetch(). Read/create/update/delete events. No CLI required.
version: 2.0
---
# caldav-calendar

Interact with CalDAV servers directly via `fetch()` using XML requests. Works with iCloud, Google Calendar, Fastmail, Nextcloud, and any CalDAV-compatible server.

## Setup

```js
const CALDAV_URL = 'https://caldav.icloud.com/'; // iCloud example
const USERNAME = 'your@icloud.com';
const PASSWORD = 'your-app-specific-password'; // NOT your Apple ID password
const AUTH = 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`);

const headers = {
  'Authorization': AUTH,
  'Content-Type': 'application/xml; charset=utf-8',
  'Depth': '1',
};
```

**Common CalDAV base URLs:**
- iCloud: `https://caldav.icloud.com/`
- Google: `https://www.google.com/calendar/dav/`
- Fastmail: `https://caldav.fastmail.com/`
- Nextcloud: `https://your-server.com/remote.php/dav/`

## Discover calendars (PROPFIND)

```js
const res = await fetch(CALDAV_URL, {
  method: 'PROPFIND',
  headers: { ...headers, 'Depth': '0' },
  body: `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:displayname/>
    <C:calendar-home-set/>
    <D:current-user-principal/>
  </D:prop>
</D:propfind>`,
});
const xml = await res.text();
// Parse the calendar-home-set href from the XML response
const homeMatch = xml.match(/<[^:>]*:?href[^>]*>([^<]+calendar[^<]+)<\/[^>]+href>/);
console.log('Calendar home:', homeMatch?.[1]);
```

## List calendars

```js
const calHomeUrl = `${CALDAV_URL}${USERNAME}/`; // adjust per server
const res = await fetch(calHomeUrl, {
  method: 'PROPFIND',
  headers: { ...headers, 'Depth': '1' },
  body: `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:displayname/>
    <D:resourcetype/>
    <C:supported-calendar-component-set/>
  </D:prop>
</D:propfind>`,
});
const xml = await res.text();
// Extract displayname elements
const names = [...xml.matchAll(/<D:displayname>([^<]+)<\/D:displayname>/g)].map(m => m[1]);
console.log('Calendars:', names);
```

## Fetch events in a date range (REPORT)

```js
const calUrl = `${CALDAV_URL}${USERNAME}/calendar/`; // calendar collection URL
const start = '20260101T000000Z';
const end = '20260201T000000Z';

const res = await fetch(calUrl, {
  method: 'REPORT',
  headers: { ...headers, 'Depth': '1' },
  body: `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${start}" end="${end}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`,
});
const xml = await res.text();
// Extract iCalendar data blocks
const events = [...xml.matchAll(/<C:calendar-data[^>]*>([\s\S]*?)<\/C:calendar-data>/g)];
events.forEach(([, ical]) => {
  const summary = ical.match(/SUMMARY:(.+)/)?.[1]?.trim();
  const dtstart = ical.match(/DTSTART[^:]*:(.+)/)?.[1]?.trim();
  console.log(dtstart, summary);
});
```

## Create an event (PUT)

```js
const uid = `whistant-${Date.now()}@example.com`;
const eventUrl = `${calUrl}${uid}.ics`;
const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Whistant//EN
BEGIN:VEVENT
UID:${uid}
DTSTART:20260115T100000Z
DTEND:20260115T110000Z
SUMMARY:Team Meeting
DESCRIPTION:Weekly sync
END:VEVENT
END:VCALENDAR`;

const res = await fetch(eventUrl, {
  method: 'PUT',
  headers: { ...headers, 'Content-Type': 'text/calendar; charset=utf-8' },
  body: ical,
});
console.log('Created:', res.status, res.headers.get('ETag'));
```

## Delete an event (DELETE)

```js
const eventUrl = `${calUrl}event-uid.ics`;
const etag = '"event-etag"'; // from GET or PROPFIND
const res = await fetch(eventUrl, {
  method: 'DELETE',
  headers: { ...headers, 'If-Match': etag },
});
console.log('Deleted:', res.status);
```

## Notes

- iCloud requires an **app-specific password** (not your Apple ID password) — generate at appleid.apple.com
- Google Calendar CalDAV requires OAuth2 token in Authorization header (`Bearer <token>`)
- `Depth: 1` means include children; `Depth: 0` means just the resource itself
- REPORT with `calendar-query` is the standard way to fetch events by date range
- Event UID must be unique; use timestamp or UUID
