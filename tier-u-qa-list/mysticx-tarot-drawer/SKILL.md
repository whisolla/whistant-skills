---
name: mysticx-tarot-drawer
description: Draw tarot cards from MysticX.ai — one card, daily card, or any of 13 spreads. Browse the full 78-card deck. No API key needed.
version: 2.0
---
# MysticX Tarot Drawer

Draw tarot cards via the MysticX public API. **No API key required.**

## Standard usage — USE THIS PATTERN

```js
var tarot = require('./scripts/mysticx-tarot-drawer.js');

// Draw a single card
var result = await tarot.handler({ count: 1, lang: 'en' });
console.log(result.formatted);

// Three card spread with a question
var result = await tarot.handler({ spread: 'three-card', question: 'Will I get the job?', lang: 'en' });
console.log(result.formatted);

// Daily tarot card
var result = await tarot.handler({ spread: 'daily-tarot', lang: 'en' });
console.log(result.formatted);

// Yes or no spread
var result = await tarot.handler({ spread: 'yes-or-no', question: 'Should I accept the offer?', lang: 'en' });
console.log(result.formatted);

// Love reading in Chinese
var result = await tarot.handler({ spread: 'love-simple', question: '我的感情运如何？', lang: 'zh_CN' });
console.log(result.formatted);
```

## Spread slugs

| User says | spread value |
|-----------|-------------|
| one card / single card | `one-card` |
| yes or no | `yes-or-no` |
| three card / past present future | `three-card` |
| daily tarot / card of the day | `daily-tarot` |
| love tarot / love reading | `love-simple` |
| obstacle / what's blocking me | `obstacle-key` |
| celtic cross / full reading | `celtic-cross` |

## Language codes

`en`, `zh_CN`, `ja`, `ko`, `pt`, `es`, `fr`, `de`, `ar`

## What the output looks like

```
🔮 **Three Card Spread**
❓ *Will I get the job?*

---
![The Fool](https://mysticx-static.mysticx.ai/.../0.jpg)
**"The Fool" (Upright)**
📍 Position: Past

**Meaning:** A leap of faith into the unknown...

**Keywords:** new beginnings, innocence, spontaneity

🔮 Want a full AI-powered reading with deeper insights? Visit MysticX.ai
```
