# Whistant Skills

> **Tested, tiered, ready to use.** A curated monorepo of agent skills — battle-tested on Whistant (iOS) and classified for cross-platform compatibility.

## What Is This?

This repo contains **127 skills** that have passed L3 live-testing on the Whistant iPhone app. Each skill has been verified to produce correct output on-device. They're organized by tier so you know what works where.

## Tiers Explained

### Tier U — Universal 🌐

**115 skills** — Pure JavaScript + `fetch()`. No iOS Shortcuts, no JSC-specific APIs, no platform dependencies. These skills work on:

- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js / desktop)
- ✅ Any runtime with `fetch()` support

Ideal for: cross-platform agent frameworks, community sharing, ClawHub publishing.

**Examples:** `simplehttpskill`, `polymarket-trade`, `nasdaq100-futures`, `tool-call-retry`, `http-retry`

### Tier W — Whistant-only 📱

**12 skills** — Require iOS-specific APIs (Shortcuts, keychain, JSC `require('fs')`, etc.) or Whistant-specific runtime features. These work on:

- ✅ Whistant (iOS)
- ❌ OpenClaw / desktop (without porting)

**Includes:** `weather`, `google`, `microsoft`, `discord`, `clawhub`, `ontology`, and 6 more.

## Skill Types

| Type | Count | Description |
|------|-------|-------------|
| **Code** (`scripts/`) | 31 | Has executable JavaScript that fetches APIs, processes data |
| **Prompt-only** | 96 | AI instruction sets — the model follows guidance patterns |

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
| Total PASS skills | 127 |
| Tier U (Universal) | 115 |
| Tier W (Whistant-only) | 12 |
| Code skills (has `scripts/`) | 31 |
| Prompt-only skills | 96 |
| Shortcuts-dependent | 2 |
| Platform-specific code | 15 |

## Testing

All 127 skills have passed **L3 live-testing** on the Whistant iPhone simulator:
- Code skills: verified real API output, correct data
- Prompt-only skills: verified useful, structured AI output

Testing was performed by:
- Initial testing — individual L3 tests (37 skills)
- **Forge 🔧** — marathon batch testing (30 + 3 + 6 + 2 + 8 + 15 + 4 skills)
- Plus 18 previously-compatible and 5 pre-installed skills

See `SKILLS_PASS.md` in the Whistant PM workspace for full test records.

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
