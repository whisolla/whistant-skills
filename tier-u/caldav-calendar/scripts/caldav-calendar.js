// CalDAV calendar helpers for iPhone JS sandbox
// Uses fetch() + XML — no Node.js binaries required

function calDavClient({ baseUrl, username, password, authType = 'basic' }) {
  const auth = authType === 'bearer'
    ? `Bearer ${password}`
    : 'Basic ' + btoa(`${username}:${password}`);

  const headers = {
    'Authorization': auth,
    'Content-Type': 'application/xml; charset=utf-8',
    'Depth': '1',
  };

  // Parse displayname from XML
  function parseDisplaynames(xml) {
    const results = [];
    const re = /<D:displayname>([^<]+)<\/D:displayname>/g;
    let m;
    while ((m = re.exec(xml)) !== null) results.push(m[1]);
    return results;
  }

  // Parse hrefs from XML
  function parseHrefs(xml) {
    const results = [];
    const re = /<[^:>]+:?href[^>]*>([^<]+)<\/[^>]+href>/g;
    let m;
    while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
    return results;
  }

  // Parse calendar-data VEVENT blocks
  function parseEvents(xml) {
    const events = [];
    const re = /<C:calendar-data[^>]*>([\s\S]*?)<\/C:calendar-data>/gi;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const ical = m[1];
      const summary = ical.match(/SUMMARY:([^\r\n]+)/)?.[1]?.trim();
      const dtstart = ical.match(/DTSTART[^:]*:([^\r\n]+)/)?.[1]?.trim();
      const dtend = ical.match(/DTEND[^:]*:([^\r\n]+)/)?.[1]?.trim();
      const uid = ical.match(/UID:([^\r\n]+)/)?.[1]?.trim();
      const desc = ical.match(/DESCRIPTION:([^\r\n]+)/)?.[1]?.trim();
      events.push({ summary, dtstart, dtend, uid, description: desc, raw: ical });
    }
    return events;
  }

  const api = {
    // Discover principal / calendar home
    async discover() {
      const res = await fetch(baseUrl, {
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
      if (!res.ok) throw new Error(`discover error: ${res.status} ${res.statusText}`);
      return await res.text();
    },

    // List calendars at a given home URL
    async listCalendars(calHomeUrl) {
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
      if (!res.ok) throw new Error(`listCalendars error: ${res.status} ${res.statusText}`);
      const xml = await res.text();
      const hrefs = parseHrefs(xml);
      const names = parseDisplaynames(xml);
      return hrefs.map((href, i) => ({ href, displayName: names[i] || href }));
    },

    // Query events in a date range
    async queryEvents(calUrl, { start, end } = {}) {
      const startStr = start || new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endStr = end || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const res = await fetch(calUrl, {
        method: 'REPORT',
        headers: { ...headers, 'Depth': '1' },
        body: `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><D:getetag/><C:calendar-data/></D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${startStr}" end="${endStr}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`,
      });
      if (!res.ok) throw new Error(`queryEvents error: ${res.status} ${res.statusText}`);
      const xml = await res.text();
      return parseEvents(xml);
    },

    // Create an event
    async createEvent(calUrl, { uid, summary, dtstart, dtend, description }) {
      const eventUid = uid || `whistant-${Date.now()}@example.com`;
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Whistant//CalDAV//EN',
        'BEGIN:VEVENT',
        `UID:${eventUid}`,
        `DTSTART:${dtstart}`,
        dtend ? `DTEND:${dtend}` : '',
        `SUMMARY:${summary || 'New Event'}`,
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\r\n');

      const res = await fetch(`${calUrl}${eventUid}.ics`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'text/calendar; charset=utf-8' },
        body: ical,
      });
      if (!res.ok) throw new Error(`createEvent error: ${res.status} ${res.statusText}`);
      return { uid: eventUid, etag: res.headers.get('ETag'), status: res.status };
    },

    // Delete an event
    async deleteEvent(calUrl, uid, etag) {
      const res = await fetch(`${calUrl}${uid}.ics`, {
        method: 'DELETE',
        headers: { ...headers, 'If-Match': etag || '*' },
      });
      if (!res.ok) throw new Error(`deleteEvent error: ${res.status} ${res.statusText}`);
      return { status: res.status };
    },
  };

  return api;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calDavClient };
} else if (typeof globalThis !== 'undefined') {
  globalThis.calDavClient = calDavClient;
}
