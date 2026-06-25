---
name: skill-goldprice
description: Real-time precious metal prices — gold, silver, platinum, palladium via free JSON API. No API key required. Evolved from 108518/skill-goldprice version 1.0.0 at 2026-06-05.
version: 1.0
---

> **Runtime:** Always `await` the handler — do NOT use `.then()`. Do NOT write fetch code manually.
>
> **Two ways to call:**
> - **Terminal (`/cmd`)**: `run /skills/skill-goldprice/scripts/skill-goldprice.js [metal]`
> - **JS (`/code`)**: `var g = require("/skills/skill-goldprice/scripts/skill-goldprice.js"); console.log(g.formatAllPrices(await g.getAllPrices()));`

## `/cmd` — Terminal Usage

| Command | Description |
|---------|-------------|
| `run /skills/skill-goldprice/scripts/skill-goldprice.js` | Show all 4 metals (Gold, Silver, Platinum, Palladium) |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js gold` | Gold price only |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js silver` | Silver price only |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js platinum` | Platinum price only |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js palladium` | Palladium price only |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js --metal XAU` | By symbol (XAU/XAG/XPT/XPD) |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js --action get --metal XAG` | Explicit action + metal |
| `run /skills/skill-goldprice/scripts/skill-goldprice.js --help` | Help & usage |

## `/code` — JS Usage

```js
var g = require("/skills/skill-goldprice/scripts/skill-goldprice.js");

// Get all 4 metal prices as formatted Markdown
console.log(g.formatAllPrices(await g.getAllPrices()));

// Get all prices as raw objects
console.log(JSON.stringify(await g.getAllPrices(), null, 2));

// Get single metal by name
console.log(g.formatPrice(await g.getPrice("gold")));

// Get single metal by symbol
console.log(g.formatPrice(await g.getPrice("XAU")));

// List supported metals
console.log(JSON.stringify(g.METALS, null, 2));
```

## Supported Metals

| Symbol | Name | Aliases |
|--------|------|---------|
| XAU | Gold 🥇 | gold, au |
| XAG | Silver 🥈 | silver, ag |
| XPT | Platinum 🔹 | platinum, pt |
| XPD | Palladium 🔸 | palladium, pd |

## Data Source

Free JSON API from [api.gold-api.com](https://api.gold-api.com). No API key required. Prices in USD.

## Handler Actions

| Action | Description | Params |
|--------|-------------|--------|
| `all` | Fetch all 4 metal prices | none |
| `get` | Fetch single metal price | `metal` (name or symbol) |

## Output Format

### Table (all metals)
Returns a Markdown table with current prices and update timestamps.

### Single metal
Returns a one-line formatted price: `🥇 Gold (XAU): USD 4,337.30 (updated ...)`

## Error Handling

- Network/API errors return `{symbol, error: "..."}` in raw output
- Formatted output shows the error inline
- Unknown metals show a helpful error message

## Local Testing

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/skill-goldprice.js
node scripts/skill-goldprice.js gold
node scripts/skill-goldprice.js silver
```
