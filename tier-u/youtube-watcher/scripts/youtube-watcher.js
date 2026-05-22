// youtube-watcher.js — YouTube transcript + metadata skill
// Key actions: transcript (via innertube), metadata (via oembed)
// No API key required for public videos

// ── getVideoId ────────────────────────────────────────────────────────────────

function getVideoId(urlOrId) {
  var patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = urlOrId.match(patterns[i]);
    if (m) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  throw new Error('Could not extract video ID from: ' + urlOrId);
}

// ── fetchTranscript ───────────────────────────────────────────────────────────

async function fetchTranscript(videoId, lang) {
  lang = lang || 'en';

  // Step 1: Get innertube API key from watch page
  var pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
    headers: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    timeout: 10
  });
  if (!pageRes.ok) throw new Error('Failed to fetch YouTube page: HTTP ' + pageRes.status);
  var html = await pageRes.text();
  var keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!keyMatch) throw new Error('Could not extract innertube API key from page');
  var apiKey = keyMatch[1];

  // Step 2: Call innertube /player endpoint with Android client
  var playerRes = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=' + apiKey + '&prettyPrint=false',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip'
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId: videoId
      }),
      timeout: 15
    }
  );
  if (!playerRes.ok) throw new Error('Innertube /player failed: HTTP ' + playerRes.status);
  var player = await playerRes.json();
  var tracks = player && player.captions && player.captions.playerCaptionsTracklistRenderer
    ? player.captions.playerCaptionsTracklistRenderer.captionTracks || []
    : [];
  if (tracks.length === 0) throw new Error('No caption tracks found for: ' + videoId);

  // Pick track matching lang (default: first track)
  var track = null;
  for (var i = 0; i < tracks.length; i++) {
    if (tracks[i].languageCode === lang) { track = tracks[i]; break; }
  }
  if (!track) track = tracks[0];
  var captionUrl = track.baseUrl;

  // Step 3: Fetch caption XML
  var capRes = await fetch(captionUrl + '&fmt=json3', { timeout: 10 });
  if (!capRes.ok) throw new Error('Failed to fetch captions: HTTP ' + capRes.status);
  var capText = await capRes.text();

  // Step 4: Parse XML — <p t="1360" d="1680">text</p>
  var segments = [];
  var pos = 0;
  while (pos < capText.length) {
    var open = capText.indexOf('<p ', pos);
    if (open === -1) break;
    var gt = capText.indexOf('>', open);
    if (gt === -1) break;
    var close = capText.indexOf('</p>', gt);
    if (close === -1) break;
    var tMatch = capText.slice(open, gt).match(/\bt="(\d+)"/);
    var textContent = capText.slice(gt + 1, close)
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textContent) segments.push({ startMs: tMatch ? parseInt(tMatch[1]) : 0, text: textContent });
    pos = close + 4;
  }
  return segments;
}

// ── getCleanTranscript ────────────────────────────────────────────────────────

async function getCleanTranscript(urlOrId, lang) {
  var videoId = getVideoId(urlOrId);
  var segments = await fetchTranscript(videoId, lang);
  return segments.map(function(s) { return s.text; }).join(' ').replace(/\s+/g, ' ').trim();
}

// ── getMetadata ───────────────────────────────────────────────────────────────

async function getMetadata(urlOrId) {
  var videoId = getVideoId(urlOrId);
  var res = await fetch(
    'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + videoId + '&format=json',
    { timeout: 10 }
  );
  if (!res.ok) throw new Error('oEmbed failed: HTTP ' + res.status);
  var meta = await res.json();
  return meta;
}

// ── getTimestamped ────────────────────────────────────────────────────────────

function getTimestamped(transcriptSegments) {
  return transcriptSegments.map(function(s) {
    var t = s.startMs / 1000;
    var m = Math.floor(t / 60);
    var sec = Math.floor(t % 60).toString().padStart(2, '0');
    return '[' + m + ':' + sec + '] ' + s.text;
  }).join('\n');
}

// ── Handler ──────────────────────────────────────────────────────────────────

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ── Exports ───────────────────────────────────────────────────────────────────

var myApi = {
  handler: handler,
  runFromParams: runFromParams,
  getVideoId: getVideoId,
  fetchTranscript: fetchTranscript,
  getCleanTranscript: getCleanTranscript,
  getMetadata: getMetadata,
  getTimestamped: getTimestamped,
  parseCommand: parseCommand
};
if (typeof module !== 'undefined' && module.exports) { module.exports = myApi; }
if (typeof globalThis !== 'undefined') { globalThis.youtubeWatcher = myApi; }

// ── CMD Parsing ───────────────────────────────────────────────────────────────

function tokenize(cmd) {
  var tokens = [];
  var current = '';
  var inQuote = false;
  var quoteChar = '';
  for (var i = 0; i < cmd.length; i++) {
    var ch = cmd[i];
    if ((ch === '"' || ch === "'") && !inQuote) {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
    } else if (ch === ' ' && !inQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var action = '';
  var url = '';
  var lang = 'en';
  var haveAction = false;
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i];
    if (tok === 'transcript') { action = 'transcript'; haveAction = true; }
    else if (tok === 'timestamped') { action = 'timestamped'; haveAction = true; }
    else if (tok === 'metadata') { action = 'metadata'; haveAction = true; }
    else if (tok === 'clean') { action = 'clean'; haveAction = true; }
    else if (tok === '--action' || tok === '-a') { i++; if (i < tokens.length) { action = tokens[i]; haveAction = true; } }
    else if (tok === '--lang' || tok === '-l') { i++; if (i < tokens.length) lang = tokens[i]; }
    else if (!tok.startsWith('--') && !tok.startsWith('-') && tok.length > 0 && !url) {
      // First non-flag after action is the URL; first non-flag with no action yet might be action name
      if (!haveAction && (tok === 'transcript' || tok === 'timestamped' || tok === 'metadata' || tok === 'clean')) {
        action = tok; haveAction = true;
      } else {
        url = tok;
      }
    }
  }
  return { action: action, url: url, lang: lang };
}

// ── runFromParams ─────────────────────────────────────────────────────────────

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams || Object.keys(params).length === 0) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var action = params.action || '';
  var url = params.url || params.video || '';
  var lang = params.lang || 'en';

  if (params.command) {
    var parsed = parseCommand(params.command);
    if (parsed.action && !params.action) action = parsed.action;
    if (parsed.url) url = parsed.url;
    if (parsed.lang) lang = parsed.lang;
  }

  if (!action && !url) {
    return 'YouTube Watcher Skill\n\nUsage:\n' +
      '  await s.getMetadata(urlOrId)         — Video metadata (title, author, thumbnail)\n' +
      '  await s.getCleanTranscript(urlOrId)  — Plain paragraph transcript\n' +
      '  await s.fetchTranscript(urlOrId)    — Raw transcript segments with timestamps\n' +
      '  await s.getTimestamped(segments)     — Format segments as [m:ss] lines\n' +
      '\nJS API examples:\n' +
      '  await s.getMetadata("dQw4w9WgXcQ")\n' +
      '  await s.getCleanTranscript("dQw4w9WgXcQ")\n' +
      '\nTerminal:\n' +
      '  run /skills/youtube-watcher/scripts/youtube-watcher.js metadata dQw4w9WgXcQ\n' +
      '  run /skills/youtube-watcher/scripts/youtube-watcher.js transcript dQw4w9WgXcQ\n' +
      '  run /skills/youtube-watcher/scripts/youtube-watcher.js clean dQw4w9WgXcQ\n';
  }

  try {
    if (action === 'metadata') {
      if (!url) return 'Error: metadata action requires a URL or video ID';
      var meta = await getMetadata(url);
      return 'Title: ' + (meta.title || 'N/A') + '\nAuthor: ' + (meta.author_name || 'N/A') +
        '\nThumbnail: ' + (meta.thumbnail_url || 'N/A') + '\nURL: https://www.youtube.com/watch?v=' + getVideoId(url);
    } else if (action === 'transcript' || action === 'timestamped') {
      if (!url) return 'Error: transcript action requires a URL or video ID';
      var segs = await fetchTranscript(getVideoId(url), lang);
      if (action === 'timestamped') return getTimestamped(segs);
      return segs.map(function(s) { return s.text; }).join(' ');
    } else if (action === 'clean') {
      if (!url) return 'Error: clean action requires a URL or video ID';
      return await getCleanTranscript(url, lang);
    } else {
      // Default: return metadata if URL provided
      if (url) {
        var meta2 = await getMetadata(url);
        return 'Title: ' + (meta2.title || 'N/A') + '\nAuthor: ' + (meta2.author_name || 'N/A') +
          '\nThumbnail: ' + (meta2.thumbnail_url || 'N/A') + '\nURL: https://www.youtube.com/watch?v=' + getVideoId(url);
      }
      return 'Error: unknown action "' + action + '". Use: metadata, transcript, timestamped, clean.';
    }
  } catch (e) {
    return 'Error: ' + (e.message || String(e));
  }
}

// ── Node.js CLI ────────────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var args = process.argv.slice(2);
  var cmdStr = args.join(' ');
  if (cmdStr) {
    runFromParams({ command: cmdStr })
      .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
      .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
  } else {
    runFromParams({})
      .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
      .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
  }
}

// ── PARAMS auto-run ───────────────────────────────────────────────────────────

if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
