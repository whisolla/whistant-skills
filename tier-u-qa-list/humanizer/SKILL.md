---
name: humanizer
description: Rewrite AI-generated text to sound human-written. Detects and fixes 24 AI writing patterns — inflated symbolism, promotional language, em dash overuse, rule of three, AI vocabulary, vague attributions, and more.
version: 1.0
---

# Humanizer

Remove AI writing patterns from any text. Use when user asks to "humanize", "de-AI", or "make this sound natural".

## Quick Rule

> If you'd hear it in a real conversation, keep it. If it sounds like a Wikipedia article written by a chatbot, fix it.

---

## The 5-Step Process

1. **Read the text** — get the full meaning before touching anything
2. **Identify patterns** — scan for the patterns below
3. **Rewrite each problem** — fix patterns, preserve meaning
4. **Read aloud** — if it sounds robotic, keep revising
5. **Check for soul** — does it sound like a real person wrote it?

---

## Pattern 1: Inflated Symbolism

**Stop saying things "represent", "symbolize", or "mark" arbitrary things.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "...marking a pivotal moment..." | "...after this, everything changed." |
| "...underscoring the importance of..." | Just state the importance directly. |
| "...setting the stage for..." | "...this led to..." |

---

## Pattern 2: Promotional Language

**Kill: "breathtaking", "vibrant", "nestled", "must-visit", "renowned", "groundbreaking", "profound"**

| AI (bad) | Human (good) |
|-----------|-------------|
| "Nestled in the breathtaking mountains..." | "In the mountains near..." |
| "A groundbreaking innovation..." | Name what it actually does. |
| "Rich cultural heritage" | "Cultural traditions dating back..." |

---

## Pattern 3: -ing Superficial Analysis

**AI adds "-ing" phrases to create fake depth.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "...reflecting the community's deep connection to the land" | "...as the architect explained, the colors reference local flowers." |
| "...highlighting its commitment to..." | Just describe what they did. |
| "...ensuring that users can..." | "...users can..." |

---

## Pattern 4: Vague Attributions

**"Experts believe", "researchers say", "studies show" — with no actual citation.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "Experts believe this could affect outcomes." | Name the expert, study, or drop it. |
| "According to industry reports..." | Quote the specific report name and finding. |
| "Several sources indicate..." | Cite one specific source. |

---

## Pattern 5: Rule of Three Overuse

**AI forces everything into groups of three.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "innovation, inspiration, and industry insights" | Describe what each one actually is. |
| "fast, reliable, and affordable" | Pick the one that matters most or be specific. |

---

## Pattern 6: AI Vocabulary Words

**These appear 10x more in post-2023 AI text:**

`additionally, align with, crucial, delve, emphasizing, enhance, fostering, garner, highlight (verb), interplay, intricate, pivotal, showcase, tapestry, testament, underscore, vibrant`

**Fix:** Replace with a direct verb or drop the sentence entirely.

---

## Pattern 7: Copula Avoidance

**AI won't just say "is" — it says "serves as", "stands as", "boasts", "features".**

| AI (bad) | Human (good) |
|-----------|-------------|
| "The gallery serves as the exhibition space..." | "The gallery is the exhibition space..." |
| "The town boasts a rich history..." | "The town has been settled since..." |
| "features four separate spaces" | "has four rooms" |

---

## Pattern 8: Negative Parallelisms

**"Not only...but also...", "It's not just about..."**

| AI (bad) | Human (good) |
|-----------|-------------|
| "It's not just about the beat—it's about the culture." | Drop the parallelism. Just say what it's about. |

---

## Pattern 9: Em Dash Overuse

**AI overuses em dashes to create "punchy" prose.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "...a feature—not a bug—embedded in..." | "...a feature that was..." |
| "...the company—not the users—decided..." | "...the company decided, overriding user preferences." |

---

## Pattern 10: Bold and Emoji Overuse

**AI bolds everything it thinks is important.**

| AI (bad) | Human (good) |
|-----------|-------------|
| "The **key findings** are: **1.**, **2.**, **3.**" | Just write a clear paragraph. |
| "🚀 **Launch**: Q3 2024 ✅" | "The product launches Q3 2024." |

---

## Pattern 11: Curly Quotes

AI uses smart quotes ("...") instead of plain quotes.  
**Fix:** Use straight ASCII quotes: `"..."` not `"..."`

---

## Pattern 12: Filler Phrases

| AI (bad) | Human (good) |
|-----------|-------------|
| "In order to achieve this goal" | "To achieve this" |
| "Due to the fact that" | "Because" |
| "At this point in time" | "Now" |
| "The system has the ability to process" | "The system can process" |
| "It is important to note that" | Just say it. |

---

## Pattern 13: Hedging and Qualifying

| AI (bad) | Human (good) |
|-----------|-------------|
| "It could potentially possibly be argued that..." | "This policy may affect outcomes." |
| "While specific details are limited..." | State what you actually know. |
| "Based on available information..." | Give the specific information or say you don't know. |

---

## Pattern 14: Generic Conclusions

| AI (bad) | Human (good) |
|-----------|-------------|
| "The future looks bright for the company. Exciting times lie ahead!" | "The company plans to open two more locations next year." |

---

## Pattern 15: Collaborative Tone Leakage

**Phrases that belong in chatbot replies, not content:**

`"I hope this helps!", "Of course!", "Certainly!", "You're absolutely right!", "Would you like me to expand..."`

**Fix:** Delete them. Just deliver the content.

---

## Adding Soul (Beyond Just Fixing Patterns)

Soulless writing is also a sign of AI. Fix it by:

- **Having opinions.** "This is impressive but also kind of unsettling" > neutral pros/cons.
- **Varying rhythm.** Short sentences. Then a long one that takes its time.
- **Using "I".** "I keep coming back to this example because..." signals a human.
- **Acknowledging uncertainty.** "I'm not sure about X, but Y seems clear."
- **Letting some mess in.** Tangents and asides are human.
- **Being specific about feelings.** "Unsettling" > "a concerning development."

---

## Full Example

**AI text:**
> The new software update serves as a testament to the company's commitment to innovation. Moreover, it provides a seamless, intuitive, and powerful user experience—ensuring that users can accomplish their goals efficiently. It's not just an update, it's a revolution in how we think about productivity. Industry experts believe this will have a lasting impact on the entire sector, highlighting the company's pivotal role in the evolving technological landscape.

**Humanized:**
> The software update adds batch processing, keyboard shortcuts, and offline mode. Early beta tester feedback has been mostly positive — people like the new shortcuts, though the offline mode still has bugs. Two more features are planned for Q4.

**Changes:** Removed inflated symbolism, "moreover", rule of three, em dash, vague attribution, AI vocabulary ("pivotal", "landscape"). Added specific features, mixed sentiment, readable rhythm.

---

## Reference

Based on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) by WikiProject AI Cleanup.
