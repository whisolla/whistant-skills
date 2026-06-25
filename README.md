# Whistant Skills

> **Skills from skills_version/ only.** Being versioned = QA'd by Forge = deployable.

## Structure

```
whistant-skills/
├── tier-u/              ← Universal skills (pure JS + fetch)
├── tier-w/              ← Whistant-only skills (OAuth PKCE, Shortcuts bridge)
├── tier-u-qa-list/      ← Catalog entries not yet versioned by Forge
└── metadata/
    └── skills.json       ← Machine-readable catalog (280 entries)
```

## Two Tiers

### tier-u — Universal 🌐 (51 skills)

Pure JavaScript + `fetch()`. No iOS-specific APIs required. Works on:
- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js)
- ✅ Any `fetch()` runtime

**Note:** Having `keychain:` in SKILL.md frontmatter does NOT make a skill Tier-W.
That's just Whistant's credential resolution. The code itself is universal.

### tier-w — Whistant-only 📱 (8 skills)

Requires iOS-specific features:
- OAuth2 PKCE browser flow
- Shortcuts bridge (`runShortcut`)
- `whistant://` URL schemes

Examples: `google` (OAuth + Shortcuts), `microsoft` (OAuth), `discord` (OAuth PKCE),
`slack` (OAuth PKCE), `clawhub` (OAuth), `skill-creator` (OAuth PKCE),
`caldav-calendar` (OAuth PKCE), `api-gateway` (OAuth PKCE)
