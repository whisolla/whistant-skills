---
name: nextjs
slug: nextjs
version: 1.2.0
homepage: https://clawic.com/skills/nextjs
description: Build Next.js 15 apps with App Router, server components, caching, auth, and production patterns. Evolved from ivangdavila/nextjs version 1.1.0 at 2026-05-28.
metadata: {"clawdbot":{"emoji":"⚡","requires":{"bins":[]},"os":["linux","darwin","win32"]}}
---

## Before You Generate Code

**Read this SKILL.md first.** The patterns below are the authoritative source for this skill. Apply them to every request.

- If the user asks for routing, data fetching, caching, auth, or deployment patterns — follow the Core Rules below.
- If a topic has a Quick Reference entry, apply that guidance (topics are documented inline even if detailed files are not yet present).
- If the user asks for something not covered here, apply general Next.js 15 App Router best practices and flag what is not covered.

## Setup

For new projects:

```bash
npx create-next-app@latest my-app --typescript --app --src-dir --import-alias "@/*"
cd my-app
```

For existing projects, verify:
- `next` is version 15+ (`cat package.json | grep next`)
- TypeScript is configured (`tsconfig.json` present)
- App Router is enabled (app/ directory exists)

## When to Use

User needs Next.js expertise — routing, data fetching, caching, authentication, or deployment. Agent handles App Router patterns, server/client boundaries, and production optimization.

## Project Memory

Store project-specific patterns in `~/nextjs/memory.md`. This helps the agent maintain consistency across sessions for the same project.

## Quick Reference

> Detailed reference files (`setup.md`, `routing.md`, etc.) are not yet available. Use the inline guidance below for each topic.

| Topic | Where Documented |
|-------|-----------------|
| New project setup | **Setup** section above |
| Routing (parallel, intercepting) | Core Rules 1–2 (Server Components + fetch on server) |
| Data fetching & streaming | Core Rules 2 + 6 |
| Caching & revalidation | Core Rule 3 |
| Authentication | Core Rule 7 |
| Deployment | Apply standard Vercel/Node adapter patterns |
| Environment variables | Core Rule 5 |

## Core Rules

### 1. Server Components by Default
Everything is Server Component in App Router. Add `'use client'` only for useState, useEffect, event handlers, or browser APIs. Server Components can't be imported into Client — pass as children.

### 2. Fetch Data on Server
Fetch in Server Components, not useEffect. Use `Promise.all` for parallel requests. Handle errors with try/catch or Next.js `error.tsx`.

### 3. Cache Intentionally
`fetch` is cached by default — use `cache: 'no-store'` for dynamic data. Set `revalidate` for ISR. See `caching.md` for strategies.

### 4. Server Actions for Mutations
Use `'use server'` functions for form submissions and data mutations. Progressive enhancement — works without JS. See `data-fetching.md`.

### 5. Environment Security
`NEXT_PUBLIC_` exposes to client bundle. Server Components access all env vars. Use `.env.local` for secrets.

### 6. Streaming for Large Data
Use `<Suspense>` boundaries to stream content progressively. Wrap slow components individually.

**Streaming page pattern (Next.js 15):**

```tsx
// app/posts/page.tsx — Server Component
import { Suspense } from 'react'
import Posts from './Posts'        // async server component
import PostsSkeleton from './PostsSkeleton'

export default function Page() {
  return (
    <main>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </main>
  )
}
```

```tsx
// app/posts/Posts.tsx — async Server Component
async function Posts() {
  const data = await fetch('/api/posts', { cache: 'no-store' }).then(r => r.json())
  return (
    <ul>
      {data.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
export default Posts
```

**Error handling:** wrap each `<Suspense>` in an `<ErrorBoundary>` from `next/error`.

### 7. Auth at Middleware Level
Protect routes in middleware, not in pages. Middleware runs on Edge — lightweight auth checks only. See `auth.md`.

## Server vs Client

| Server Component | Client Component |
|------------------|------------------|
| Default in App Router | Requires `'use client'` |
| Can be async | Cannot be async |
| Access backend, env vars | Access hooks, browser APIs |
| Zero JS shipped | JS shipped to browser |

**Decision:** Start Server. Add `'use client'` only for: useState, useEffect, onClick, browser APIs.

## Common Traps

| Trap | Fix |
|------|-----|
| `router.push` in Server | Use `redirect()` |
| `<Link>` prefetches all | `prefetch={false}` |
| `next/image` no size | Add `width`/`height` or `fill` |
| Metadata in Client | Move to Server or `generateMetadata` |
| useEffect for data | Fetch in Server Component |
| Import Server→Client | Pass as children/props |
| Middleware DB call | Call API route instead |
| Missing `await params` (v15) | Params are async in Next.js 15 |

## Next.js 15 Changes

- `params` and `searchParams` are now `Promise` — must await
- `fetch` not cached by default — opt-in with `cache: 'force-cache'`
- Use React 19 hooks: `useActionState`, `useFormStatus`

## Related Skills
Install with `clawhub install <slug>` if user confirms:
- `react` — React fundamentals and patterns
- `typescript` — Type safety for better DX
- `prisma` — Database ORM for Next.js apps
- `tailwindcss` — Styling with utility classes
- `nodejs` — Server runtime knowledge

## Feedback
- If useful: `clawhub star nextjs`
- Stay updated: `clawhub sync`
