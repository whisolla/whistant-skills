# Whistant Skills

> **Skills from skills_version/ only.** Every skill here has a Forge versioned fork — QA passed, deployable.

## Structure

```
whistant-skills/
├── tier-u/              ← Universal skills (pure fetch + JS)
├── tier-w/              ← Whistant-only skills (keychain/OAuth/Shortcuts)
├── tier-u-qa-list/      ← Pending: catalog entries not yet versioned by Forge
└── metadata/
    └── skills.json       ← Machine-readable catalog
```

## Two Tiers

### tier-u — Universal 🌐

Pure JavaScript + `fetch()`. No iOS-specific APIs. Works on:
- ✅ Whistant (iOS / JavaScriptCore)
- ✅ OpenClaw (Node.js)
- ✅ Any `fetch()` runtime

### tier-w — Whistant-only 📱

Requires iOS-specific APIs (keychain, OAuth PKCE, Shortcuts bridge):
- ✅ Whistant (iOS)
- ❌ OpenClaw / desktop

## Status

All skills in `tier-u/` and `tier-w/` come from `backend/skills_version/`
(v1.0, v1.1, ... v3.6). Being versioned means Forge has already forked,
tested, and QA'd them. They are deployable.

Skills in `tier-u-qa-list/` are catalog entries not yet versioned by Forge.
They are prompt-only stubs waiting for fork + versioning.
