---
name: book-of-the-day
version: "1.1"
description: Book of the Day — a daily book oracle. One uplifting book, one light poetic reading. Trigger: "book of the day", "today's book", "今日之书", "书签运势". Each invocation fetches a fresh book. Respond in the user's language. FORBIDDEN: never output "Draw again", "再抽一次", or similar prompts. Evolved from romanluoman00007/book-of-the-day version 1.0.7 at 2026-05-27.
  Book of the Day — a daily book oracle. One uplifting book, one light poetic reading. Trigger: "book of the day", "today's book", "今日之书", "书签运势". Each invocation fetches a fresh book. Respond in the user's language. FORBIDDEN: never output "Draw again", "再抽一次", or similar prompts.
---

# Book of the Day 🔮📖

**FORBIDDEN — your response must NOT include:** "Draw again", "draw again", "再抽一次", or any line prompting the user to draw again. End only with one of the warm CTAs below.

---

A daily book oracle. Light as a fortune cookie, deep as a good book. Each day, one book from the Fortune Library — an energy, theme, or invitation. Never a warning, always a gift.

---

## Usage

### /cmd (Terminal)

```bash
# Get today's book
book-of-the-day

# Get a specific date's book
book-of-the-day --date 2026-05-25

# List all archetypes
book-of-the-day --archetypes

# Get one archetype's info
book-of-the-day --archetype "The Explorer"

# Get fortune context (for AI to generate reading)
book-of-the-day --context
book-of-the-day --context --date 2026-01-01
```

### /code (JS require)

```js
var botd = require("/skills/book-of-the-day/scripts/book-of-the-day.js");

// Fetch today's book
var r = await botd.getBook();
console.log(r.book.title, "by", r.book.author);

// Fetch a specific date
var r = await botd.getBook("2026-05-25");
console.log(r.book.title);

// List archetypes
var archs = botd.getArchetypes();
console.log(Object.keys(archs).join(", "));

// Get one archetype
var info = botd.getArchetype("The Sage");
console.log(info.emoji, info.energy);

// Format for display
var r = await botd.getBook();
console.log(botd.formatBook(r.book));

// Fortune context (for AI generation)
console.log(botd.formatFortuneContext(r.book));

// Via runFromParams
await botd.runFromParams({ action: "get", date: "2026-01-01" });
await botd.runFromParams({ action: "archetypes" });
await botd.runFromParams({ action: "context" });
```

### Exports

| Function | Description |
|----------|-------------|
| `getBook(date?)` | Fetch today's book (or specific date) |
| `getArchetypes()` | All 6 archetypes with emoji + energy |
| `getArchetype(name)` | Single archetype info |
| `formatBook(book)` | Formatted book display |
| `formatFortuneContext(book)` | Context for AI fortune reading |
| `runFromParams(params)` | Unified runner ({action, date, archetype}) |
| `handler(event, context)` | Whistant handler (routes action → function) |

### Handler Actions

| action | params | returns |
|--------|--------|---------|
| `get` | `{date?}` | `{ok, book, formatted}` |
| `archetypes` | — | `{archetypes, formatted}` |
| `archetype` | `{archetype}` | `{archetype, emoji, energy}` |
| `context` | `{date?}` | `{ok, book, context}` |

---

## How It Works

### 1. Fetch Today's Book

API: `GET https://book-of-the-day.vercel.app/?date=YYYY-MM-DD` (omit `date` for today). Response: `title`, `author`, `topics`, `rating`, `description`, `archetype`, `cover_url`. No API key required.

### 2. Assign the Fortune Archetype

| Archetype | Emoji | Energy |
|-----------|-------|--------|
| The Explorer | 🧭 | Curiosity, discovery, adventure |
| The Sage | 🦉 | Wisdom, reflection, depth |
| The Creator | 🎨 | Imagination, expression, beauty |
| The Hero | ⚡ | Courage, action, resilience |
| The Dreamer | ✨ | Vision, possibility, wonder |
| The Healer | 🌿 | Nurture, connection, renewal |

### 3. Generate the Fortune Reading

**Part 1 — The Draw** (1 sentence): fortune-cookie opening.  
**Part 2 — The Book**: Title, Author, Archetype emoji + name. One evocative sentence (a feeling, not a summary).  
**Part 3 — Today's Reading** (2–3 sentences): Connect the book to "today". Warm, open, non-prescriptive. Tone: light, poetic. Under 200 words.

### 4. Closing CTA — Pick One (Required)

End with **exactly one** of these. **Do not add "Draw again" or "再抽一次".**

- **Reflection:** "今天结束时，不妨回看这一页，看看它是否在生活里出现过。"
- **Share:** "如果想聊聊此刻的心情，我可以用这本书的主题，为你做更细腻的解读。"
- **Tomorrow:** "明天，再来翻开新的一页吧。"
- **Audio** (if configured): "🎧 想听听这本书的精华？ [播放]"

**Stop here.** Do not add any further lines like "Draw again" or "再抽一次".

---

## Example Output (中文)

🔮 **今日之书 · 2025年3月4日**

*命运的书架已为你开启。*

**✨ 梦想者**

### *《Keep Going》— Austin Kleon*

十条小径，带你在创意枯竭时继续前行。

**今日解读**

也许今天不需要完成什么——只需要开始一件小小的、只属于自己的事。这本书知道，创意不是灵感的闪光，而是每天安静地浇水，等待那朵你不确定会不会开的花。今天，你愿意为自己做一件小小的、有点奇妙的事吗？

今天结束时，不妨回看这一页，看看它是否在生活里出现过。

---

## Rules

- Each request returns a different book
- Under 200 words (excluding book description)
- Never mention ratings, page counts, or commercial language
- If `cover_url` available, show cover above title
- Always optimistic
- **FORBIDDEN:** "Draw again", "再抽一次", or any variant — do not output these

---

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/book-of-the-day.js --date 2026-05-25
rm scripts/package.json
```
