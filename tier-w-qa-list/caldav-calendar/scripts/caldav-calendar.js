// CalDAV calendar helpers for Whistant iOS JS runtime
// Uses fetch() + XML — no Node.js binaries required
//
// Credentials auto-resolved from: globalThis → keychain → params
//
// Usage:
//   const caldav = require('./caldav-calendar.js');
//   const client = await caldav.getClient();
//   console.log(await client.queryEvents(calUrl, { start: '20260101T000000Z' }));

/**
 * Resolve CalDAV credentials from available sources.
 */
async function _getCredentials() {
  var url = null, username = null, password = null;
  // 1. globalThis
  if (typeof globalThis !== 'undefined') {
    url = globalThis.CALDAV_URL;
    username = globalThis.CALDAV_USERNAME;
    password = globalThis.CALDAV_PASSWORD;
  }
  // 2. keychain
  if (typeof keychain !== 'undefined') {
    try {
      if (!url) url = await keychain.get('CALDAV_URL');
      if (!username) username = await keychain.get('CALDAV_USERNAME');
      if (!password) password = await keychain.get('CALDAV_PASSWORD');
    } catch (e) { /* keychain unavailable */ }
  }
  // 3. process.env
  if (typeof process !== 'undefined' && process.env) {
    if (!url) url = process.env.CALDAV_URL;
    if (!username) username = process.env.CALDAV_USERNAME;
    if (!password) password = process.env.CALDAV_PASSWORD;
  }
  return { url: url, username: username, password: password };
}

/**
 * Get a configured calDavClient with auto-resolved credentials.
 */
async function getClient(params) {
  params = params || {};
  var url = params.baseUrl || params.url;
  var username = params.username;
  var password = params.password;

  if (!url || !username || !password) {
    var creds = await _getCredentials();
    if (!url) url = creds.url;
    if (!username) username = creds.username;
    if (!password) password = creds.password;
  }

  if (!url || !username || !password) {
    throw new Error('CalDAV credentials not found. Store with keychain.set("CALDAV_URL", "..."), keychain.set("CALDAV_USERNAME", "..."), keychain.set("CALDAV_PASSWORD", "...")');
  }

  return calDavClient({ baseUrl: url, username: username, password: password });
}

function calDavClient(params) {
  var baseUrl = params.baseUrl;
  var username = params.username;
  var password = params.password;
  var authType = params.authType || 'basic';

  var auth = authType === 'bearer'
    ? 'Bearer ' + password
    : 'Basic ' + btoa(username + ':' + password);

  var headers = {
    'Authorization': auth,
    'Content-Type': 'application/xml; charset=utf-8',
    'Depth': '1',
  };

  function parseDisplaynames(xml) {
    var results = [];
    var re = /<(?:[^:>]+:)?displayname[^>]*>([^<]+)<\/(?:[^:>]+:)?displayname>/g;
    var m;
    while ((m = re.exec(xml)) !== null) results.push(m[1]);
    return results;
  }

  function parseHrefs(xml) {
    var results = [];
    var re = /<(?:[^:>]+:)?href[^>]*>([^<]+)<\/(?:[^:>]+:)?href[^>]*>/g;
    var m;
    while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
    return results;
  }

  function parseEvents(xml) {
    var events = [];
    var re = /<(?:[^:>]+:)?calendar-data[^>]*>([\s\S]*?)<\/(?:[^:>]+:)?calendar-data>/gi;
    var m;
    while ((m = re.exec(xml)) !== null) {
      var ical = m[1];
      var summary = (ical.match(/SUMMARY:([^\r\n]+)/) || [])[1];
      summary = summary ? summary.trim() : null;
      var dtstart = (ical.match(/DTSTART[^:]*:([^\r\n]+)/) || [])[1];
      dtstart = dtstart ? dtstart.trim() : null;
      var dtend = (ical.match(/DTEND[^:]*:([^\r\n]+)/) || [])[1];
      dtend = dtend ? dtend.trim() : null;
      var uid = (ical.match(/UID:([^\r\n]+)/) || [])[1];
      uid = uid ? uid.trim() : null;
      var desc = (ical.match(/DESCRIPTION:([^\r\n]+)/) || [])[1];
      desc = desc ? desc.trim() : null;
      events.push({ summary: summary, dtstart: dtstart, dtend: dtend, uid: uid, description: desc });
    }
    return events;
  }

  // Helper: merge objects (JSC-safe, no spread)
  function merge(a, b) {
    var out = {};
    var k;
    for (k in a) { if (a.hasOwnProperty(k)) out[k] = a[k]; }
    for (k in b) { if (b.hasOwnProperty(k)) out[k] = b[k]; }
    return out;
  }

  // Helper: PROPFIND a URL and return parsed text
  async function _propfind(url, props, depth) {
    var propXml = '';
    for (var i = 0; i < props.length; i++) {
      var ns = props[i].indexOf(':') > -1 ? props[i].split(':')[0] : 'D';
      var name = props[i].indexOf(':') > -1 ? props[i].split(':')[1] : props[i];
      if (ns === 'C') {
        propXml += '\n    <C:' + name + '/>';
      } else {
        propXml += '\n    <D:' + name + '/>';
      }
    }
    var body = '<?xml version="1.0" encoding="utf-8"?>\n<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n  <D:prop>' + propXml + '\n  </D:prop>\n</D:propfind>';
    var res = await fetch(url, {
      method: 'PROPFIND',
      headers: merge(headers, { 'Depth': String(depth || 0) }),
      body: body,
      timeout: 15,
    });
    if (!res.ok) throw new Error('PROPFIND error: ' + res.status + ' on ' + url);
    return await res.text();
  }

  // Resolve a relative href to absolute using a base URL
  function resolveHref(href, base) {
    if (!href) return null;
    if (href.match(/^https?:\/\//)) return href;
    var baseRoot = base.replace(/^(https?:\/\/[^\/]+).*$/, '$1');
    if (href.indexOf('/') === 0) return baseRoot + href;
    var baseDir = base.replace(/\/[^\/]*$/, '');
    return baseDir + '/' + href;
  }

  // Parse first href from an XML property block
  function parseHrefIn(xml, propName) {
    var re = new RegExp('<(?:[^:>]+:)?' + propName + '[^>]*>[\\s\\S]*?<(?:[^:>]+:)?href[^>]*>([^<]+)<\\/(?:[^:>]+:)?href>', 'i');
    var m = xml.match(re);
    return m ? m[1].trim() : null;
  }

  var api = {
    discover: async function() {
      // Step 1: PROPFIND root for principal + calendar-home-set
      var xml1 = await _propfind(baseUrl, ['current-user-principal', 'C:calendar-home-set', 'displayname'], 0);
      var principalPath = parseHrefIn(xml1, 'current-user-principal');
      var calendarHome = parseHrefIn(xml1, 'calendar-home-set');
      var principalUrl = principalPath ? resolveHref(principalPath, baseUrl) : null;
      if (calendarHome) calendarHome = resolveHref(calendarHome, baseUrl);

      // Step 2: iCloud only returns calendar-home-set from principal, not root
      if (!calendarHome && principalUrl) {
        try {
          var xml2 = await _propfind(principalUrl, ['C:calendar-home-set'], 0);
          calendarHome = parseHrefIn(xml2, 'calendar-home-set');
          if (calendarHome) calendarHome = resolveHref(calendarHome, principalUrl);
        } catch (e) { /* principal might not support PROPFIND */ }
      }

      return {
        baseUrl: baseUrl,
        principalUrl: principalUrl,
        calendarHome: calendarHome,
      };
    },

    listCalendars: async function(calHomeUrl) {
      var xml = await _propfind(calHomeUrl, ['displayname', 'resourcetype', 'C:supported-calendar-component-set'], 1);
      var hrefs = parseHrefs(xml);
      var names = parseDisplaynames(xml);
      var result = [];
      for (var i = 0; i < hrefs.length; i++) {
        result.push({
          href: resolveHref(hrefs[i], calHomeUrl),
          displayName: names[i] || hrefs[i],
        });
      }
      return result;
    },

    queryEvents: async function(calUrl, opts) {
      opts = opts || {};
      var now = new Date();
      var startStr = opts.start || now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      var endStr = opts.end || new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      var res = await fetch(calUrl, {
        method: 'REPORT',
        headers: merge(headers, { 'Depth': '1' }),
        body: '<?xml version="1.0" encoding="utf-8"?>\n<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n  <D:prop><D:getetag/><C:calendar-data/></D:prop>\n  <C:filter>\n    <C:comp-filter name="VCALENDAR">\n      <C:comp-filter name="VEVENT">\n        <C:time-range start="' + startStr + '" end="' + endStr + '"/>\n      </C:comp-filter>\n    </C:comp-filter>\n  </C:filter>\n</C:calendar-query>',
        timeout: 15,
      });
      if (!res.ok) throw new Error('queryEvents error: ' + res.status + ' ' + res.statusText);
      var xml = await res.text();
      return parseEvents(xml);
    },

    createEvent: async function(calUrl, opts) {
      opts = opts || {};
      var eventUid = opts.uid || 'whistant-' + Date.now() + '@example.com';
      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Whistant//CalDAV//EN',
        'BEGIN:VEVENT',
        'UID:' + eventUid,
        'DTSTART:' + opts.dtstart,
        opts.dtend ? 'DTEND:' + opts.dtend : '',
        'SUMMARY:' + (opts.summary || 'New Event'),
        opts.description ? 'DESCRIPTION:' + opts.description : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\r\n');

      var res = await fetch(calUrl + (calUrl.endsWith('/') ? '' : '/') + eventUid + '.ics', {
        method: 'PUT',
        headers: merge(headers, { 'Content-Type': 'text/calendar; charset=utf-8' }),
        body: lines,
        timeout: 15,
      });
      if (!res.ok) throw new Error('createEvent error: ' + res.status + ' ' + res.statusText);
      return { uid: eventUid, etag: res.headers.get('ETag'), status: res.status };
    },

    deleteEvent: async function(calUrl, uid, etag) {
      var delHeaders = merge(headers, { 'Content-Type': 'text/calendar; charset=utf-8' });
      if (etag) delHeaders = merge(delHeaders, { 'If-Match': etag });
      var res = await fetch(calUrl + (calUrl.endsWith('/') ? '' : '/') + uid + '.ics', {
        method: 'DELETE',
        headers: delHeaders,
        timeout: 15,
      });
      if (!res.ok) throw new Error('deleteEvent error: ' + res.status + ' ' + res.statusText);
      return { status: res.status };
    },

    fullSync: async function(opts) {
      opts = opts || {};
      var info = await api.discover();
      if (!info.calendarHome) throw new Error('No calendar home found — server may not support CalDAV discovery');

      var calendars = await api.listCalendars(info.calendarHome);

      // Filter to user calendars (skip inbox/notification/outbox system collections)
      var userCals = [];
      for (var i = 0; i < calendars.length; i++) {
        var cal = calendars[i];
        var h = cal.href || '';
        if (h.indexOf('/inbox/') >= 0 || h.indexOf('/notification/') >= 0 || h.indexOf('/outbox/') >= 0) continue;
        userCals.push(cal);
      }

      // Query events from each user calendar
      var now = new Date();
      var startStr = opts.start || now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      var endStr = opts.end || new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      var allEvents = [];
      for (var j = 0; j < userCals.length; j++) {
        try {
          var events = await api.queryEvents(userCals[j].href, { start: startStr, end: endStr });
          for (var k = 0; k < events.length; k++) {
            events[k].calendar = userCals[j].displayName;
            allEvents.push(events[k]);
          }
        } catch (e) {
          // Some calendars (e.g. birthday calendars) don't support REPORT — skip
        }
      }

      // Format clean output for AI consumption
      var output = { calendars: [], events: [] };
      for (var m = 0; m < userCals.length; m++) {
        output.calendars.push({
          name: userCals[m].displayName,
          url: userCals[m].href,
        });
      }
      for (var n = 0; n < allEvents.length; n++) {
        var ev = allEvents[n];
        output.events.push({
          calendar: ev.calendar,
          summary: ev.summary,
          start: ev.dtstart,
          end: ev.dtend,
          uid: ev.uid,
        });
      }
      return output;
    },
  };

  return api;
}

// ─── Template compliance: handler, runFromParams, parseCommand, tokenize ────

function handler(event, context) {
  return runFromParams(event);
}

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (typeof params === 'string') params = parseCommand(params);

  // Resolve from PARAMS globals
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // If no action but positional args, use first arg
  if (!params.action && params.argv && params.argv.length > 0) {
    params.action = params.argv[0];
  }

  var action = params.action || 'discover';
  var client = await getClient(params);

  try {
    switch (action) {
      case 'discover':
        return await client.discover();
      case 'listCalendars':
        return await client.listCalendars(params.calHomeUrl || params.calUrl || params.homeUrl || params.baseUrl);
      case 'queryEvents':
        return await client.queryEvents(params.calUrl || params.url, { start: params.start, end: params.end });
      case 'createEvent':
        return await client.createEvent(params.calUrl || params.url, params);
      case 'deleteEvent':
        return await client.deleteEvent(params.calUrl || params.url, params.uid, params.etag);
      case 'fullSync':
        return await client.fullSync(params);
      default:
        return {
          availableActions: ['discover', 'listCalendars', 'queryEvents', 'createEvent', 'deleteEvent'],
          usage: 'run /skills/caldav-calendar/scripts/caldav-calendar.js <action> [--calUrl URL]',
          tip: 'Credentials auto-resolved from keychain. Store once: keychain.set("CALDAV_URL", "...") etc.',
        };
    }
  } catch (e) {
    throw e;
  }
}

function tokenize(input) {
  var tokens = [];
  var re = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  var m;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[0]);
  }
  return tokens;
}

function parseCommand(input) {
  var tokens = tokenize(input);
  if (!tokens.length) return {};
  var action = tokens[0];
  var result = { action: action };
  var i = 1;
  while (i < tokens.length) {
    var t = tokens[i];
    if (t.indexOf('--') === 0) {
      var key = t.slice(2);
      result[key] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else if (t.indexOf('-') === 0) {
      var key2 = t.slice(1);
      result[key2] = tokens[i + 1] !== undefined && tokens[i + 1].indexOf('--') !== 0 ? tokens[++i] : true;
    } else {
      if (i === 1 && !result.calUrl) result.calUrl = t;
    }
    i++;
  }
  return result;
}

// ─── Node CLI block ──────────────────────────────────────────────────────────
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var args = process.argv.slice(2);
  var input = args.join(' ');
  if (!input) {
    console.log('Usage: node caldav-calendar.js <action> [--calUrl URL]');
    console.log('Actions: discover, listCalendars, queryEvents, createEvent, deleteEvent');
    console.log('Env: CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD');
    process.exit(0);
  }
  var parsed = parseCommand(input);
  runFromParams(parsed).then(function(r) {
    console.log(JSON.stringify(r, null, 2));
  }).catch(function(e) {
    console.error(e.message);
    process.exit(1);
  });
}

// ─── CommonJS / globalThis exports ──────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calDavClient: calDavClient,
    getClient: getClient,
    _getCredentials: _getCredentials,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
  };
}
if (typeof globalThis !== 'undefined') {
  globalThis.caldav = {
    calDavClient: calDavClient,
    getClient: getClient,
    _getCredentials: _getCredentials,
    handler: handler,
    runFromParams: runFromParams,
    parseCommand: parseCommand,
    tokenize: tokenize,
  };
}

// ─── PARAMS auto-run block ──────────────────────────────────────────────────
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    try {
      var result = await runFromParams();
      if (typeof console !== 'undefined' && console.log) {
        console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      }
      return result;
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
      throw err;
    }
  })();
}
