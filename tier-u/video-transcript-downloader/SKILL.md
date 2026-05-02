---
name: video-transcript-downloader
description: Fetch transcripts and subtitles from YouTube and other video platforms using fetch(). No yt-dlp required. For YouTube, uses the public caption endpoint.
version: 2.0
---
# video-transcript-downloader

Get video transcripts via `fetch()`. Works for YouTube public videos with captions enabled.

> Note: `yt-dlp` and `ffmpeg` are not available in Whistant's JS runtime. This skill uses fetch-based approaches instead.

## Get YouTube transcript (clean paragraph)

```js
async function getYouTubeTranscript(videoUrl, lang = 'en') {
  const idMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch ? idMatch[1] : videoUrl;

  // Step 1: get innertube API key from watch page
  const pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await pageRes.text();
  const keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!keyMatch) throw new Error('Could not extract innertube API key');

  // Step 2: Android /player endpoint — returns valid timedtext URLs (no bot block)
  const playerRes = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=' + keyMatch[1] + '&prettyPrint=false',
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
  if (tracks.length === 0) throw new Error('No captions found for: ' + videoId);
  const track = tracks.find(t => t.languageCode === lang) || tracks[0];

  // Step 3: fetch XML captions
  const xml = await (await fetch(track.baseUrl + '&fmt=json3')).text();

  // Parse <p t="ms" d="ms">text</p>
  const segments = [];
  let pos = 0;
  while (pos < xml.length) {
    const open = xml.indexOf('<p ', pos);
    if (open === -1) break;
    const gt = xml.indexOf('>', open);
    const close = xml.indexOf('</p>', gt);
    if (close === -1) break;
    const text = xml.slice(gt + 1, close)
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) segments.push(text);
    pos = close + 4;
  }
  return segments.join(' ').replace(/\s+/g, ' ').trim();
}

const transcript = await getYouTubeTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log(transcript.slice(0, 500));
```

## Get transcript with timestamps

```js
async function getTimestampedTranscript(videoUrl) {
  const idMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch ? idMatch[1] : videoUrl;

  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  const html = await pageRes.text();
  const trackMatch = html.match(/"captionTracks":\[.*?"baseUrl":"([^"]+)"/);
  if (!trackMatch) throw new Error('No captions found');

  const captionUrl = trackMatch[1].replace(/\\u0026/g, '&');
  const xml = await (await fetch(captionUrl)).text();

  const lines = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const t = parseFloat(m[1]);
    const text = m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').trim();
    if (text) {
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60).toString().padStart(2, '0');
      lines.push(`[${mins}:${secs}] ${text}`);
    }
  }
  return lines.join('\n');
}

const timestamped = await getTimestampedTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log(timestamped.slice(0, 500));
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

## Notes

- Works for any YouTube video with public captions (auto-generated or manual)
- `[Music]`, `[Applause]` etc. are stripped by default (they're inside `<font>` tags)
- For non-YouTube sites: use `web_fetch` tool to get the page, then look for VTT/SRT subtitle URLs
- yt-dlp and ffmpeg are **not available** in Whistant's JSCore — use fetch-based approaches only
