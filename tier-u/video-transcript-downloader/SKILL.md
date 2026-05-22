---
name: video-transcript-downloader
description: Fetch YouTube video transcripts, timestamps, and metadata. Uses the Android player endpoint to bypass bot detection. No API key required.
version: 2.6
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.
>
> **Two ways to call:**
> - JS: `await video_transcript_downloader.getYouTubeTranscript("URL")` or `await video_transcript_downloader.runFromParams({url:"...", action:"transcript"})`
> - Terminal:
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL"`
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL" --action transcript`
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL" --action metadata`
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL" --action timestamped`
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL" --lang en`
>   `run /skills/video-transcript-downloader/scripts/video-transcript-downloader.js --url "VIDEO_URL" --action transcript --lang zh-TW`

# video-transcript-downloader

Fetch YouTube video transcripts and metadata. Works for YouTube videos with captions enabled.

## JS API

```js
// Global name: video_transcript_downloader

// Clean transcript (paragraph format)
await video_transcript_downloader.getYouTubeTranscript("https://youtube.com/watch?v=dQw4w9WgXcQ");

// Transcript with timestamps
await video_transcript_downloader.getTimestampedTranscript("https://youtube.com/watch?v=dQw4w9WgXcQ");

// Video metadata
await video_transcript_downloader.getMetadata("https://youtube.com/watch?v=dQw4w9WgXcQ");

// Via runFromParams
await video_transcript_downloader.runFromParams({url: "dQw4w9WgXcQ", action: "transcript"});
await video_transcript_downloader.runFromParams({url: "dQw4w9WgXcQ", action: "metadata"});
await video_transcript_downloader.runFromParams({url: "dQw4w9WgXcQ", action: "timestamped"});
```

## Notes

- Works for YouTube videos with public captions (auto-generated or manual)
- `[Music]`, `[Applause]` etc. are stripped by default
- yt-dlp and ffmpeg are **not available** in Whistant JSCore — use this skill only

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/video-transcript-downloader.js --url "VIDEO_URL" --action metadata
```
