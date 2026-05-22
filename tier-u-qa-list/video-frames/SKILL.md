---
name: video-frames
description: Extract frames or thumbnails from video files. In Whistant, use the browser tool to capture screenshots of video at specific timestamps, or use a fetch-based video frame extraction service.
version: 2.0
---
# video-frames

Extract frames from videos in Whistant's JS runtime. Since `child_process` is blocked, use one of these approaches:

## Option 1: Browser tool (recommended for local video files)

Use Whistant's browser automation to open a video file in a WebKit browser and capture screenshots at specific timestamps:

```js
// Open video in browser, seek to timestamp, screenshot
// Use browserPerformAction in Whistant:
// 1. Open the video file: file:///path/to/video.mp4
// 2. Inject JS to seek to timestamp
// 3. Take screenshot
const seekJs = `
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = 10; // seconds
    await new Promise(r => video.onseeked = r);
  }
`;
// Then call browserPerformAction('screenshot') to capture the frame
```

## Option 2: Fetch from a remote video via canvas extraction

For web-hosted videos, extract a frame using a browser-side approach:

```js
// This runs in Whistant's JSCore — creates a data URI of the frame
const videoUrl = 'https://example.com/video.mp4';
const timestampSeconds = 10;

// Use Whistant's browser to load and extract frame
const extractJs = `(async () => {
  const video = document.createElement('video');
  video.src = '${videoUrl}';
  video.crossOrigin = 'anonymous';
  video.muted = true;
  await new Promise(r => { video.onloadedmetadata = r; video.load(); });
  video.currentTime = ${timestampSeconds};
  await new Promise(r => { video.onseeked = r; });
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
})()`;
// Run via browserEvaluateJs action — returns base64 JPEG
```

## Option 3: Use cloud video processing API

For server-side frame extraction, use a cloud API like Mux or similar:

```js
// Example: Mux Video API frame extraction
const MUX_TOKEN_ID = 'your_token_id';
const MUX_TOKEN_SECRET = 'your_token_secret';
const PLAYBACK_ID = 'your_playback_id';
const TIME_SECONDS = 10;

// Mux thumbnail URL (no auth required for public playback)
const thumbnailUrl = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?time=${TIME_SECONDS}&width=1280`;
const res = await fetch(thumbnailUrl);
const blob = await res.arrayBuffer();
console.log('Frame size:', blob.byteLength, 'bytes');
// Save via fs: require('fs').writeFileSync('/tmp/frame.jpg', Buffer.from(blob))
```

## Option 4: YouTube / video platform thumbnails

For YouTube videos, use the built-in thumbnail URLs (no API key needed):

```js
function getYouTubeThumbnails(videoId) {
  return {
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
  };
}

const thumbs = getYouTubeThumbnails('dQw4w9WgXcQ');
const res = await fetch(thumbs.maxres);
const buf = await res.arrayBuffer();
console.log('Thumbnail size:', buf.byteLength, 'bytes');
```

## Notes

- ffmpeg is not available in Whistant's JSCore runtime
- For local video files: browser tool with `file://` URL is the most reliable
- For remote videos: browser canvas extraction or cloud API
- Timestamp is in seconds for all approaches
