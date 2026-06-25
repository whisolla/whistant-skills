---
name: youtube-watcher
description: Fetch transcripts and subtitles from YouTube videos. Uses the YouTube Android innertube API — no API key required for public videos. Evolved from michaelgathara/youtube-watcher version 1.0.0 at 2026-05-15.
version: 2.3
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.

## JS API

```js
const s = require('/skills/youtube-watcher/scripts/youtube-watcher.js');

// Get video metadata (via oEmbed — no API key needed)
await s.getMetadata('dQw4w9WgXcQ');

// Get clean paragraph transcript (via innertube)
await s.getCleanTranscript('dQw4w9WgXcQ');

// Get transcript segments with timestamps
await s.fetchTranscript('dQw4w9WgXcQ');

// Format timestamps
await s.getTimestamped(segments);

// Via runFromParams
await s.runFromParams({url:'dQw4w9WgXcQ', action:'metadata'});
```

## Terminal

```bash
run /skills/youtube-watcher/scripts/youtube-watcher.js metadata dQw4w9WgXcQ
run /skills/youtube-watcher/scripts/youtube-watcher.js transcript dQw4w9WgXcQ
run /skills/youtube-watcher/scripts/youtube-watcher.js timestamped dQw4w9WgXcQ
run /skills/youtube-watcher/scripts/youtube-watcher.js clean dQw4w9WgXcQ --lang en
```

---

# youtube-watcher (detail)

Fetch YouTube video transcripts via the Android innertube `/player` endpoint. No API key required. Works for any public video with captions.

## How it works

YouTube's page-scrape caption URLs embed `ip=0.0.0.0` in their signed params and return empty responses without browser cookies. The Android innertube `/player` endpoint returns valid timedtext URLs with real tokens that actually work.

## Extract video ID

```js
function getVideoId(urlOrId) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const m = urlOrId.match(pat);
    if (m) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  throw new Error('Could not extract video ID from: ' + urlOrId);
}
```

## Fetch transcript (clean paragraph)

```js
async function fetchTranscript(videoId, lang = 'en') {
  // Step 1: get innertube API key from watch page
  const pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await pageRes.text();
  const keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!keyMatch) throw new Error('Could not extract innertube API key');
  const apiKey = keyMatch[1];

  // Step 2: call /player with Android client — gets valid caption URL tokens
  const playerRes = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=' + apiKey + '&prettyPrint=false',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId,
      }),
    }
  );
  const player = await playerRes.json();
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  if (tracks.length === 0) throw new Error('No caption tracks found for: ' + videoId);

  // Pick track matching lang (default: first track)
  const track = tracks.find(t => t.languageCode === lang) || tracks[0];
  const captionUrl = track.baseUrl;

  // Step 3: fetch caption XML (timedtext format 3)
  const capRes = await fetch(captionUrl + '&fmt=json3');
  const capText = await capRes.text();

  // Parse XML: <p t="1360" d="1680">text</p>
  const segments = [];
  let pos = 0;
  while (pos < capText.length) {
    const open = capText.indexOf('<p ', pos);
    if (open === -1) break;
    const gt = capText.indexOf('>', open);
    const close = capText.indexOf('</p>', gt);
    if (close === -1) break;
    const tMatch = capText.slice(open, gt).match(/\bt="(\d+)"/);
    const text = capText.slice(gt + 1, close)
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) segments.push({ startMs: tMatch ? parseInt(tMatch[1]) : 0, text });
    pos = close + 4;
  }
  return segments;
}

const videoId = getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
const segments = await fetchTranscript(videoId);
console.log('Lines:', segments.length);
segments.slice(0, 5).forEach(s => {
  const t = s.startMs / 1000;
  const m = Math.floor(t / 60), sec = Math.floor(t % 60).toString().padStart(2, '0');
  console.log(`[${m}:${sec}] ${s.text}`);
});
```

## Get clean paragraph text

```js
async function getCleanTranscript(videoUrl) {
  const videoId = getVideoId(videoUrl);
  const segments = await fetchTranscript(videoId);
  return segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();
}

const text = await getCleanTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log(text.slice(0, 500));
```

## Get video metadata (no API key)

```js
const videoId = 'dQw4w9WgXcQ';
const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
const meta = await res.json();
console.log('Title:', meta.title);
console.log('Author:', meta.author_name);
console.log('Thumbnail:', meta.thumbnail_url);
```

## Option B: browser.evalJS (when user is logged into YouTube in the Whistant browser)

When the user has YouTube open and logged in, read `ytInitialPlayerResponse` directly from the page DOM — then fetch captions from within the same-origin page context. Works for private/age-restricted videos the user has access to.

```js
// Assumes browser is already open on the YouTube video
async function fetchTranscriptFromBrowser(videoId, lang = 'en') {
  await browser.navigate('https://www.youtube.com/watch?v=' + videoId);
  await new Promise(r => setTimeout(r, 5000)); // wait for page load

  return browser.evalJS(`
    try {
      const ipr = window.ytInitialPlayerResponse;
      const tracks = ipr?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      const track = tracks.find(t => t.languageCode === '${lang}') || tracks[0];
      if (!track) return JSON.stringify({ error: 'no tracks', hasIPR: !!ipr });

      let url = track.baseUrl;
      url = url.startsWith('/') ? 'https://www.youtube.com' + url : url;

      const resp = await fetch(url + '&lang=${lang}', { credentials: 'include' });
      const xml = await resp.text();

      const segs = [];
      let pos = 0;
      while (pos < xml.length) {
        const open = xml.indexOf('<p ', pos);
        if (open === -1) break;
        const gt = xml.indexOf('>', open);
        const close = xml.indexOf('</p>', gt);
        if (close === -1) break;
        const tMatch = xml.slice(open, gt).match(/t="(\\d+)"/);
        const text = xml.slice(gt+1, close).replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/<[^>]+>/g,' ').trim();
        if (text) segs.push({ ms: tMatch ? parseInt(tMatch[1]) : 0, text });
        pos = close + 4;
      }
      return JSON.stringify({ title: ipr?.videoDetails?.title, xmlLen: xml.length, segments: segs });
    } catch(e) { return JSON.stringify({ error: e.message }); }
  `);
}

const result = await fetchTranscriptFromBrowser('dQw4w9WgXcQ');
console.log(result.segments?.slice(0,5));
```

## Notes

- **Option A (Android innertube)**: recommended default — no login, no API key, works for all public videos on any device
- **Option B (browser.evalJS)**: use when user is logged into YouTube in the Whistant browser — reads `ytInitialPlayerResponse` directly from page DOM, bypasses all CORS/bot-detection, works for private/age-restricted videos
- Android client (`clientName: "ANDROID"`) bypasses bot detection by mimicking YouTube's own mobile app
- `lang` defaults to first available track if requested language not found
- Caption XML format: `<p t="startMs" d="durationMs">text</p>`
- `browser.evalJS` and `browser.fetchWithCookies` are also available for other web tasks requiring real browser session

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/youtube-watcher.js metadata dQw4w9WgXcQ
```
