/**
 * video-transcript-downloader.js — YouTube transcript fetching for Whistant iOS JS runtime
 * Uses Android player endpoint to bypass bot detection.
 * Fixed: added timeout to all fetch calls, added handler/runFromParams wrapper.
 */

function extractVideoId(input) {
  if (!input) return null;
  var m = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : (input.length === 11 ? input : null);
}

async function getYouTubeTranscript(videoUrl, lang) {
  lang = lang || 'en';
  var videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL or video ID');

  // Step 1: get innertube API key from watch page
  var pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
    timeout: 10,
  });
  var html = await pageRes.text();
  var keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!keyMatch) throw new Error('Could not extract innertube API key');

  // Step 2: Android player endpoint
  var playerRes = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=' + keyMatch[1] + '&prettyPrint=false',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId: videoId,
      }),
      timeout: 10,
    }
  );
  var player = await playerRes.json();
  var tracks = player && player.captions && player.captions.playerCaptionsTracklistRenderer
    ? player.captions.playerCaptionsTracklistRenderer.captionTracks || []
    : [];
  if (!tracks.length) throw new Error('No captions found for: ' + videoId);
  var track = tracks.find(function(t) { return t.languageCode === lang; }) || tracks[0];

  // Step 3: fetch XML captions
  var xmlRes = await fetch(track.baseUrl + '&fmt=json3', { timeout: 10 });
  var xml = await xmlRes.text();

  var segments = [];
  var pos = 0;
  while (pos < xml.length) {
    var open = xml.indexOf('<p ', pos);
    if (open === -1) break;
    var gt = xml.indexOf('>', open);
    var close = xml.indexOf('</p>', gt);
    if (close === -1) break;
    var text = xml.slice(gt + 1, close)
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) segments.push(text);
    pos = close + 4;
  }
  return segments.join(' ').replace(/\s+/g, ' ').trim();
}

async function getTimestampedTranscript(videoUrl, lang) {
  // Uses the same player-API approach as getYouTubeTranscript for reliable iOS sandbox compatibility.
  // Fetching timedtext via HTML-parsed URL fails in iOS sandbox with "unsupported URL".
  var videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL or video ID');

  // Step 1: get innertube API key from watch page
  var pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
    timeout: 10,
  });
  var html = await pageRes.text();
  var keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!keyMatch) throw new Error('Could not extract innertube API key');

  // Step 2: Android player endpoint (same as getYouTubeTranscript — iOS sandbox allows these successive fetches)
  var playerRes = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=' + keyMatch[1] + '&prettyPrint=false',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId: videoId,
      }),
      timeout: 10,
    }
  );
  var player = await playerRes.json();
  var tracks = player && player.captions && player.captions.playerCaptionsTracklistRenderer
    ? player.captions.playerCaptionsTracklistRenderer.captionTracks || []
    : [];
  if (!tracks.length) throw new Error('No captions found for: ' + videoId);
  var track = tracks.find(function(t) { return t.languageCode === (lang || 'en'); }) || tracks[0];

  // Step 3: fetch XML captions — no fmt=json3, native XML uses <p t="ms" d="ms"> format
  var xmlRes = await fetch(track.baseUrl, { timeout: 10 });
  var xml = await xmlRes.text();

  var lines = [];
  var re = /<p t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  var m;
  while ((m = re.exec(xml)) !== null) {
    var t = parseInt(m[1], 10) / 1000; // milliseconds to seconds
    var text = m[2]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) {
      var mins = Math.floor(t / 60);
      var secs = Math.floor(t % 60).toString().padStart(2, '0');
      lines.push('[' + mins + ':' + secs + '] ' + text);
    }
  }
  return lines.join('\n');
}

async function getMetadata(videoUrl) {
  var videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL or video ID');
  var res = await fetch(
    'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + videoId + '&format=json',
    { timeout: 10 }
  );
  return await res.json();
}

// ---------------------------------------------------------------------------
// HANDLER
// ---------------------------------------------------------------------------

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

var vtdApi = {
  getYouTubeTranscript: getYouTubeTranscript,
  getTimestampedTranscript: getTimestampedTranscript,
  getMetadata: getMetadata,
  handler: handler,
  runFromParams: runFromParams,
};

if (typeof module !== 'undefined' && module.exports) { module.exports = vtdApi; }
if (typeof globalThis !== 'undefined') { globalThis.video_transcript_downloader = vtdApi; }

// ---------------------------------------------------------------------------
// CMD PARSING
// ---------------------------------------------------------------------------

function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  var tokens = [], i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    var ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; if (cur) tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseCommand(cmd) {
  var tokens = tokenize(cmd);
  var out = { url: undefined, action: undefined, lang: undefined };
  if (!tokens.length) return out;
  if (tokens[0] && tokens[0].toLowerCase() === 'run') tokens.shift();
  if (tokens[0] && /\w+\.js$/i.test(tokens[0])) tokens.shift();
  var i = 0;
  while (i < tokens.length) {
    var t = tokens[i];
    if ((t === '--url' || t === '-u') && i + 1 < tokens.length) {
      out.url = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--action' || t === '-a') && i + 1 < tokens.length) {
      out.action = tokens[i + 1]; i += 2; continue;
    }
    if ((t === '--lang' || t === '-l') && i + 1 < tokens.length) {
      out.lang = tokens[i + 1]; i += 2; continue;
    }
    i += 1;
  }
  if (!out.url && tokens.length) out.url = tokens[0];
  return out;
}

// ---------------------------------------------------------------------------
// runFromParams
// ---------------------------------------------------------------------------

async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) params = PARAMS;
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) params = JSON.parse(PARAMS_JSON);
    } catch (e) { params = {}; }
  }

  var action = params.action || params.type || 'transcript';
  var url = params.url || params.videoUrl || params.video_url || params.input || '';
  var lang = params.lang || params.language || 'en';

  if (!url) {
    return 'Usage:\n  video_transcript_downloader.getYouTubeTranscript("https://youtube.com/watch?v=...")\n  video_transcript_downloader.getMetadata("VIDEO_ID")\n  video_transcript_downloader.runFromParams({url:"...", action:"transcript"})';
  }

  try {
    if (action === 'metadata' || action === 'meta') {
      return await getMetadata(url);
    }
    if (action === 'timestamped' || action === 'timestamps') {
      return await getTimestampedTranscript(url);
    }
    // Default: clean transcript
    return await getYouTubeTranscript(url, lang);
  } catch (e) {
    return 'Error: ' + (e.message || String(e));
  }
}

// ---------------------------------------------------------------------------
// Node.js CLI entry
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromParams({ url: process.argv[2] || '', lang: process.argv[3] || 'en' })
    .then(function(result) { console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2)); })
    .catch(function(err) { console.error(err && err.message ? err.message : String(err)); process.exitCode = 1; });
}

// ---------------------------------------------------------------------------
// PARAMS auto-run block
// ---------------------------------------------------------------------------

if (typeof module === 'undefined' && (
  (typeof PARAMS !== 'undefined' && PARAMS !== null) ||
  (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON)
)) {
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
