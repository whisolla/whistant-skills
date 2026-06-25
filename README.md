# Whistant Skills

> **Cataloged, tiered, QA-verified.** A curated monorepo of agent skills — organized by platform reach and testing status.

## Structure

```
whistant-skills/
├── tier-u/              ← Universal skills: QA-tested, works on Whistant + OpenClaw
├── tier-u-qa-list/      ← Universal candidates: compatible but NOT yet QA-tested
├── tier-w/              ← Whistant-only skills: QA-tested, requires iOS-specific APIs
├── tier-w-qa-list/      ← Whistant-only candidates: not yet QA-tested
└── metadata/
    └── skills.json       ← Machine-readable catalog with tier & test flags
```

Source of truth for all tier-u/, tier-u-qa-list/, tier-w/, and tier-w-qa-list/ entries:
`backend/skills_version/<skill>/<latest-version>/`

Each repo skill folder is a clean copy of `skills_version/<skill>/<latest>/`.
Version bumps flow: Forge updates `skills_version/<skill>/vN.M/` → Captain syncs the
latest version into the appropriate tier folder here.

## Four Tiers

### tier-u — Universal, QA-tested 🌐

**Pure JavaScript + `fetch()`. No iOS-specific APIs.** Works on:
- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js / desktop)
- ✅ Any runtime with `fetch()` support

### tier-u-qa-list — Universal Candidates ⏳

**Compatible but NOT yet QA-tested.** Universal candidates waiting for Forge QA.
Once verified, they promote to `tier-u/`.

### tier-w — Whistant-only, QA-tested 📱

**Require iOS-specific APIs** (OAuth browser, keychain, Shortcuts bridge). Whistant-only.

### tier-w-qa-list — Whistant-only Candidates ⏳

**Whistant-only but not yet QA-tested.** Wait for Forge verification before promoting to `tier-w/`.

## Skill Stats

See `metadata/skills.json` for current counts. The four-tier breakdown changes with each QA pass.

## Tier Classification Rules

A skill is **Tier U (Universal)** when its code uses only:
- `fetch()` to public/free APIs
- Pure JavaScript computation
- Optional `keychain:` for non-essential user credentials (e.g. elevated rate limits)

A skill is **Tier W (Whistant-only)** when its code requires:
- iOS Shortcuts bridge (`runShortcut`, `runShortcutWithInput`)
- OAuth2 PKCE flow + Keychain token storage
- iOS-native bridge calls (e.g. `whistant://` schemes)

The source of truth is the code itself — see `backend/skills_version/<skill>/<latest>/scripts/`.
The `tier` field in `metadata/skills.json` should match this code-based classification.
