---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound more human. Identifies AI writing patterns and transforms them with natural language substitutions.
version: 2.0
---
# humanize-ai-text

Detect AI writing patterns and transform text to sound more natural. Works entirely in JS — no external dependencies.

## AI pattern detection

```js
const AI_PATTERNS = [
  // High signal vocabulary
  { pattern: /\b(delve|tapestry|landscape|pivotal|underscore|foster|showcase|leverage|utilize|facilitate)\b/gi, category: 'AI Vocabulary', weight: 2 },
  { pattern: /\b(groundbreaking|vibrant|nestled|breathtaking|revolutionary|innovative)\b/gi, category: 'Promotional Language', weight: 2 },
  // Significance inflation
  { pattern: /\b(serves as a testament|pivotal moment|indelible mark|testament to)\b/gi, category: 'Significance Inflation', weight: 3 },
  // Copula avoidance
  { pattern: /\bserves as\b/gi, category: 'Copula Avoidance', weight: 2 },
  // Filler phrases
  { pattern: /\b(in order to|due to the fact that|it is worth noting|it is important to note)\b/gi, category: 'Filler Phrases', weight: 1 },
  // Transition formulas
  { pattern: /^(Additionally,|Furthermore,|Moreover,|In conclusion,|In summary,|However,|Nevertheless,)/gm, category: 'Formulaic Transitions', weight: 1 },
  // Negative parallelism
  { pattern: /not only .{1,30} but also/gi, category: 'Negative Parallelism', weight: 2 },
  // Em dash overuse (3+)
  { pattern: /(?:[^—]*—){3,}/g, category: 'Em Dash Overuse', weight: 1 },
  // Challenges formula
  { pattern: /Despite (these )?(challenges|limitations)/gi, category: 'Challenges Formula', weight: 2 },
  // Conclusion formula
  { pattern: /\bFuture (outlook|directions?|implications?)\b/gi, category: 'Future Outlook Formula', weight: 2 },
];

function detectAI(text) {
  const issues = [];
  let totalWeight = 0;
  for (const { pattern, category, weight } of AI_PATTERNS) {
    const matches = text.match(pattern) ?? [];
    if (matches.length > 0) {
      issues.push({ category, matches, count: matches.length });
      totalWeight += matches.length * weight;
    }
  }
  const words = text.split(/\s+/).length;
  const score = Math.min(100, (totalWeight / words) * 500);
  const level = score < 15 ? 'low' : score < 35 ? 'medium' : score < 60 ? 'high' : 'very high';
  return { issues, score: score.toFixed(1), level, wordCount: words };
}

const result = detectAI('This groundbreaking approach serves as a testament to innovation. Additionally, it fosters collaboration.');
console.log('AI probability:', result.level, `(${result.score})`);
result.issues.forEach(i => console.log(`  [${i.category}]: ${i.matches.join(', ')}`));
```

## Transform text (rule-based replacements)

```js
const REPLACEMENTS = [
  // AI vocab → simpler words
  [/\bdelve\b/gi, 'look'],
  [/\butilize\b/gi, 'use'],
  [/\bfacilitate\b/gi, 'help'],
  [/\blocate[sd]?\b/gi, 'find'],
  [/\bleverage\b/gi, 'use'],
  [/\bfoster\b/gi, 'build'],
  [/\bshowcase\b/gi, 'show'],
  [/\bunderscore\b/gi, 'show'],
  [/\bpivotal\b/gi, 'key'],
  [/\btapestry\b/gi, 'mix'],
  [/\blandscape\b/gi, 'field'],
  // Filler removal
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bit is worth noting that\b/gi, ''],
  [/\bit is important to note that\b/gi, ''],
  // Serves as → is
  [/\bserves as a\b/gi, 'is a'],
  [/\bserves as\b/gi, 'is'],
  // Transition variety (replace formulaic starts)
  [/^Additionally,\s*/gm, ''],
  [/^Furthermore,\s*/gm, ''],
  [/^Moreover,\s*/gm, ''],
];

function humanize(text) {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Clean up double spaces from removals
  result = result.replace(/\s{2,}/g, ' ').trim();
  return result;
}

const original = 'In order to leverage our capabilities, we utilize groundbreaking approaches. Additionally, this serves as a testament to innovation.';
const humanized = humanize(original);
console.log('Original:', original);
console.log('Humanized:', humanized);
```

## Compare before/after

```js
function compare(original, transformed) {
  const before = detectAI(original);
  const after = detectAI(transformed);
  return {
    before: { score: before.score, level: before.level },
    after: { score: after.score, level: after.level },
    improvement: (parseFloat(before.score) - parseFloat(after.score)).toFixed(1),
  };
}

const orig = 'This groundbreaking approach serves as a testament to innovation. Additionally, it fosters collaboration.';
const clean = humanize(orig);
const diff = compare(orig, clean);
console.log(`Score: ${diff.before.score} → ${diff.after.score} (improved by ${diff.improvement})`);
```

## AI signal reference

| Category | Examples |
|---|---|
| AI Vocabulary | delve, tapestry, pivotal, underscore, foster, leverage |
| Significance Inflation | "serves as a testament", "pivotal moment" |
| Filler Phrases | "in order to", "due to the fact that" |
| Formulaic Transitions | "Additionally,", "Furthermore,", "In conclusion," |
| Negative Parallelism | "Not only... but also..." |

## Notes

- Patterns based on [Wikipedia: Signs of AI Writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- Rule-based — no ML model or API needed
- For aggressive rewriting, pair with an LLM using the detected issues as a rewrite prompt
- Score 0–100: <15 low, 15–35 medium, 35–60 high, 60+ very high AI probability
