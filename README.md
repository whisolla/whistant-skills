# Whistant Skills

> **Cataloged, tiered, ready to use.** A curated monorepo of 287 agent skills — organized for Whistant compatibility and classified by platform reach.

## What Is This?

This repo contains **272 skills** cataloged for availability on Whistant. They're organized by tier so you know what works where.

**⚠️ Testing status:** These skills were sourced from the community skill catalog (clawhub/scripts/catalog.js, COMPATIBLE set) and curated for Whistant compatibility. They have **not** been individually L3 live-tested on the Whistant iPhone app unless marked `whistant_tested: true`.

## Tiers Explained

### Tier U — Universal 🌐

**271 skills** — Pure JavaScript + `fetch()`. No iOS Shortcuts, no JSC-specific APIs, no platform dependencies. These skills work on:

- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js / desktop)
- ✅ Any runtime with `fetch()` support

Ideal for: cross-platform agent frameworks, community sharing, ClawHub publishing.

**Source:** `clawhub/scripts/catalog.js` COMPATIBLE set (2026-05-09).

**Examples:** `simplehttpskill`, `polymarket-trade`, `nasdaq100-futures`, `tool-call-retry`, `http-retry`

### Tier W — Whistant-only 📱

**1 skill** — Requires iOS-specific APIs (Shortcuts, keychain, JSC `require('fs')`, etc.) or Whistant-specific runtime features.

- ✅ Whistant (iOS)
- ❌ OpenClaw / desktop (without porting)

**Includes:** `clawhub` (pre-installed, uses Whistant-specific hooks).

## Skill Types

| Type | Count | Description |
|------|-------|-------------|
| **Code** (`scripts/`) | 33 | Has executable JavaScript that fetches APIs, processes data |
| **Prompt-only** | 254 | AI instruction sets — the model follows guidance patterns |

Prompt-only skills are inherently universal (Tier U) since they contain no platform-specific code.

## Repository Structure

```
whistant-skills/
├── README.md              ← You are here
├── tier-u/                ← Universal skills (pure JS + fetch())
│   ├── simplehttpskill/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── polymarket-trade/
│   └── ...
├── tier-w/                ← Whistant-only skills (Shortcuts, JSC)
│   ├── weather/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── discord/
│   └── ...
└── metadata/
    └── skills.json        ← Machine-readable skill catalog
```

## skills.json Schema

Each entry in `metadata/skills.json`:

```json
{
  "name": "skill-name",
  "tier": "U",
  "type": "code",
  "whistant_tested": true,
  "openclaw_tested": false,
  "has_scripts": true,
  "requires_shortcuts": false,
  "has_platform_specific_code": false,
  "description": "What the skill does",
  "clawhub_published": false
}
```

## Installation

### On Whistant (iOS)

Skills are pre-installed or available via the ClawHub skill browser. Tier U and Tier W skills both work.

### On OpenClaw (Desktop)

Only Tier U skills work out of the box. To install:

```bash
# Clone the repo
git clone https://github.com/whisolla/whistant-skills.git

# Copy Tier U skills to your OpenClaw skills directory
cp -r whisant-skills/tier-u/* ~/.openclaw/skills/
```

Tier W skills need porting — replace iOS-specific APIs with Node.js equivalents before using on desktop.

## Skill Stats

| Metric | Count |
|--------|-------|
| Total cataloged skills | 272 |
| Tier U (Universal) | 271 |
| Tier W (Whistant-only) | 1 |
| Code skills (has `scripts/`) | ~33 |
| Prompt-only skills | ~238 |
| Shortcuts-dependent | 0 |
| Platform-specific code | 0 |

## Testing & Verification

These 272 skills are **catalog-sourced**, not individually L3 live-tested on Whistant:

- **271 Tier U (Universal)** — Sourced from `clawhub/scripts/catalog.js` COMPATIBLE set. Pure JavaScript + `fetch()`, no iOS-specific dependencies.
- **1 Tier W (Whistant-only)** — `clawhub`, pre-installed and uses Whistant-specific hooks.

The `whistant_tested` field in `skills.json` is set based on catalog sourcing, not on-device L3 verification.

## Contributing

1. **Submit a new skill**: Create a PR with `SKILL.md` + `scripts/` (if code) in the appropriate tier
2. **Port Tier W → Tier U**: Replace iOS-specific APIs with cross-platform equivalents and move to `tier-u/`
3. **Add OpenClaw testing**: Test Tier U skills on OpenClaw and update `openclaw_tested: true`

### Tier Classification Rules

- **Tier U**: Only `fetch()` + pure JS. No `require('fs')`, `keychain`, `Shortcuts`, `callbackUrl`, `UIApplication`, `WKWebView`, `ObjC`, or other platform APIs
- **Tier W**: Uses any iOS/Whistant-specific API or Shortcuts dependency
- Prompt-only skills are always Tier U

## License

MIT — Whisolla LLC

## Related

- [Whistant](https://whistant.app) — iPhone AI agent app
- [OpenClaw](https://github.com/openclaw) — Desktop agent framework
- [ClawHub](https://clawhub.io) — Community skill registry
