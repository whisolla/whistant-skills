/**
 * video-transcript-downloader.js — YouTube transcript fetching for Whistant iOS JS runtime
 * Uses Android player endpoint to bypass bot detection.
 */

module.exports = {
  /**
   * Get clean paragraph transcript from a YouTube video
   * @param {string} videoUrl — YouTube URL or video ID
   * @param {string} lang — preferred language code (default 'en')
   */
  async getYouTubeTranscript(videoUrl, lang = 'en') {
    const idMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    const videoId = idMatch ? idMatch[1] : videoUrl;

    // Step 1: get innertube API key from watch page
    const pageRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await pageRes.text();
    const keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!keyMatch) throw new Error('Could not extract innertube API key');

    // Step 2: Android player endpoint
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
  },

  /**
   * Get timestamped transcript lines
   * @param {string} videoUrl
   */
  async getTimestampedTranscript(videoUrl) {
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
  },

  /**
   * Get video metadata (title, author, thumbnail) via oEmbed
   * @param {string} videoUrl
   */
  async getMetadata(videoUrl) {
    const idMatch = videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = idMatch ? idMatch[1] : videoUrl;
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return res.json();
  },
};
