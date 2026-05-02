---
name: xhs
description: 小红书全能助手 — 文案生成、封面制作、内容发布与管理。支持标题/正文创作、MCP平台操作（发布、搜索、点赞、评论）。
version: 2.0
---
# xhs 📕 小红书全能助手

两大核心能力：**文案创作**（标题+正文+封面图）和 **平台操作**（发布+搜索+互动）。

---

## 一、文案创作

### 1.1 生成标题

直接用当前模型生成5个不同风格的标题。

**核心要求：**
- 每个标题使用不同风格
- 20字以内，含1-2个emoji
- 禁用平台禁忌词（广告、秒杀、最低价等）

询问用户：选择哪个标题？可修改或自定义，默认选第一个。

### 1.2 生成正文

根据选定标题生成正文。

**核心要求：**
- 600-800字，像朋友聊天的语气
- 禁用列表/编号，用自然段落呈现
- 文末5-10个#标签
- 不超过1000字

询问用户：是否满意？可要求修改，确认后进入封面图步骤。

### 1.3 封面图

封面结构：1080x1440（3:4），上半部分主题图（1080x720），下半部分纯色底+标题文字（1080x720）。

询问用户选择图片来源：
1. **AI 自动生成** — 根据文案主题生成图片
2. **上传自己的图片** — 提供图片路径拼接封面

对于AI生成，先确认英文prompt，再选配色（禁止白底黑字）。

生成封面需要 ImageMagick + 中文字体（`fonts-noto-cjk`）在服务器上安装好。

---

## 二、平台操作（MCP via fetch）

所有平台操作通过本地 MCP 服务进行。MCP 运行在 `http://localhost:18060/mcp`（可通过 `XHS_MCP_URL` 环境变量覆盖）。

每次调用需要：**初始化 → 获取 Session ID → 调用工具**（三步连续）

### MCP 通用调用模式

```js
const MCP_URL = 'http://localhost:18060/mcp';

// Step 1: Initialize and get session ID
async function initMcpSession() {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'whistant', version: '1.0' },
      },
      id: 1,
    }),
  });
  const sessionId = res.headers.get('Mcp-Session-Id');

  // Step 2: Confirm initialization
  await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Mcp-Session-Id': sessionId },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {}, id: null }),
  });

  return sessionId;
}

// Step 3: Call a tool
async function callXhsTool(sessionId, toolName, args = {}) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Mcp-Session-Id': sessionId },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: args },
      id: 2,
    }),
  });
  return res.json();
}
```

### Check login status

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'check_login_status');
console.log(result?.result?.content?.[0]?.text);
```

### Get login QR code

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'get_login_qrcode');
const base64Img = result?.result?.content?.[0]?.text; // data:image/png;base64,...
console.log(base64Img);
```

### Search content

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'search_feeds', { keyword: '美食探店' });
const data = JSON.parse(result?.result?.content?.[0]?.text ?? '{}');
data.items?.forEach(item => console.log(item.id, item.title, item.xsec_token));
```

### Publish image post

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'publish_content', {
  title: '今天发现了一家宝藏咖啡馆☕',
  content: '正文内容，不超过1000字...',
  images: ['/tmp/cover.jpg', '/tmp/photo2.jpg'], // server local absolute paths
});
console.log(result?.result?.content?.[0]?.text);
```

### Publish video post

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'publish_with_video', {
  title: '视频标题',
  content: '视频描述',
  video: '/tmp/video.mp4', // server local absolute path
});
console.log(result?.result?.content?.[0]?.text);
```

### Get post detail

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'get_feed_detail', {
  feed_id: 'post_id_from_search',
  xsec_token: 'token_from_search',
  load_all_comments: false,
});
const data = JSON.parse(result?.result?.content?.[0]?.text ?? '{}');
console.log(data.title, data.desc);
```

### Like a post

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'like_feed', {
  feed_id: 'post_id',
  xsec_token: 'xsec_token',
  unlike: false, // true to unlike
});
```

### Post a comment

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'post_comment_to_feed', {
  feed_id: 'post_id',
  xsec_token: 'xsec_token',
  content: '这个博主太棒了！',
});
```

### Get user profile

```js
const sessionId = await initMcpSession();
const result = await callXhsTool(sessionId, 'user_profile', {
  user_id: 'user_id',
  xsec_token: 'xsec_token',
});
const profile = JSON.parse(result?.result?.content?.[0]?.text ?? '{}');
console.log(profile.nickname, profile.followers);
```

## Parse cookies from string (for manual login)

```js
function parseCookies(cookieStr) {
  return cookieStr.split(';').map(pair => {
    const [name, ...rest] = pair.trim().split('=');
    const value = rest.join('=');
    return {
      name: name.trim(),
      value: value.trim(),
      domain: '.xiaohongshu.com',
      path: '/',
      expires: -1,
      httpOnly: ['web_session', 'id_token', 'acw_tc'].includes(name.trim()),
      secure: ['web_session', 'id_token'].includes(name.trim()),
      session: false,
    };
  }).filter(c => c.name && c.value);
}
// Save result to ~/xiaohongshu-mcp/cookies.json via fs
const cookies = parseCookies('a1=xxx; web_session=yyy; webId=zzz');
console.log(JSON.stringify(cookies, null, 2));
```

---

## Notes

- MCP service: https://github.com/xpzouying/xiaohongshu-mcp/releases
- Start MCP: `DISPLAY=:99 nohup ./xiaohongshu-mcp-linux-amd64 > mcp.log 2>&1 &`
- New Session ID required for every call chain
- Comments: wait >30s between posts to avoid rate limiting
- Images/videos must be server-side **absolute paths**
- Error handling: `Not logged in` → QR login; `Rate limited` → wait and retry
