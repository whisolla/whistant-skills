# Whistant Skills

> **Cataloged, tiered, QA-verified.** A curated monorepo of agent skills — organized by platform reach and testing status.

## Structure

```
whistant-skills/
├── tier-u/              ← Universal skills: QA-tested, works on Whistant + OpenClaw
├── tier-w/              ← Whistant-only skills: QA-tested, requires iOS-specific APIs
├── tier-u-qa-list/      ← Universal candidate skills: compatible but NOT yet QA-tested
└── metadata/
    └── skills.json       ← Machine-readable catalog with tier & test flags
```

## Three Tiers

### tier-u — Universal 🌐 (30 skills)

**QA-tested universal skills.** Pure JavaScript + `fetch()`. No iOS-specific APIs. Works on:

- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js / desktop)
- ✅ Any runtime with `fetch()` support

All 30 have passed deep QA (device testing on simulator or real device).

**Examples:** `weather`, `slack`, `github`, `trello`, `discord`, `simplehttpskill`, `nasdaq100-futures`

### tier-w — Whistant-only 📱 (4 skills)

**QA-tested Whistant-only skills.** Require iOS-specific APIs (OAuth browser, keychain, etc.):

- ✅ Whistant (iOS)
- ❌ OpenClaw / desktop

**Includes:** `google`, `microsoft`, `clawhub`, `skill-creator`

### tier-u-qa-list — Universal Candidates ⏳ (244 skills)

**Compatible but NOT yet QA-tested.** These skills are in the COMPATIBLE set (catalog.js) and appear to use only `fetch()` + pure JS — they should be Tier U. But they haven't been through deep QA yet.

These are waiting in the queue for QA verification. Once Forge tests them and they pass, they move to `tier-u/`.

## Skill Stats

| Metric | Count |
|--------|-------|
| **tier-u** (QA-tested universal) | 30 |
| **tier-w** (QA-tested Whistant-only) | 4 |
| **tier-u-qa-list** (awaiting QA) | 244 |
| **Total** | **278** |
| QA-tested (`whistant_tested: true`) | 34 |
| Platform-specific code (tier-w) | 4 |

## Testing Status

The `whistant_tested` and `openclaw_tested` flags in `metadata/skills.json` reflect actual QA results from `dev/tasks/skill-qa/RESULTS-QA.md`.

**Only skills in tier-u/ and tier-w/ have been device-tested.** Skills in tier-u-qa-list/ are catalog-compatible but not yet verified.

## Installation

### On Whistant (iOS)

Tier u and tier-w skills both work. Install via ClawHub skill browser or:

```bash
run /skills/clawhub/scripts/clawhub.js install <skill-name>
```

### On OpenClaw (Desktop)

Only tier-u/ skills work. To install:

```bash
git clone https://github.com/whisolla/whistant-skills.git
cp -r whisant-skills/tier-u/* ~/.openclaw/skills/
```

Tier-w skills need porting (replace `browser.openOAuth()` / `keychain` with Node equivalents).

## Contributing

### Adding a new skill

1. Ensure the skill is in `backend/skills/` and passes L3 compatibility check
2. Submit for QA → goes to `tier-u-qa-list/` while awaiting testing
3. After QA passes → moves to `tier-u/` (universal) or `tier-w/` (Whistant-only)

### Tier Classification

| Tier | Criteria |
|------|----------|
| **U** | Pure JS + `fetch()` only. No `require('fs')`, `keychain`, `browser.openOAuth`, Shortcuts, `UIApplication`, ObjC, etc. |
| **W** | Uses any iOS/Whistant-specific API |
| **U-QA** | Appears to be U (catalog-compatible, no platform deps) but hasn't been device QA-tested yet |

## Source

Skills sourced from `whistant/backend/skills/clawhub/scripts/catalog.js` COMPATIBLE set.

Maintained by Captain 📦 — Whisolla LLC.

## Related

- [Whistant](https://whistant.app) — iPhone AI agent app
- [OpenClaw](https://github.com/openclaw) — Desktop agent framework
- [ClawHub](https://clawhub.ai) — Community skill registry
