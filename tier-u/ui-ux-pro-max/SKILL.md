---
name: ui-ux-pro-max
description: UI/UX design intelligence and implementation guidance for building polished interfaces. Use when the user asks for UI design, UX flows, information architecture, visual style direction, design systems/tokens, component specs, copy/microcopy, accessibility, or to generate/critique/refine frontend UI (HTML/CSS/JS, React, Next.js, Vue, Svelte, Tailwind).
version: 1.0
---

# UI/UX Pro Max

> **Whistant Runtime:** Pure prompt guidance. No code execution required — the AI uses this skill's design intelligence to provide expert UI/UX advice. Covers design systems, UX flows, component guidelines, accessibility, and frontend implementation patterns.

## Workflow

Follow these steps to deliver high-quality UI/UX output with minimal back-and-forth.

### 1. Triage

Ask only what you must to avoid wrong work:

- **Target platform:** web / iOS / Android / desktop
- **Stack:** React/Next/Vue/Svelte, CSS/Tailwind, component library
- **Goal and constraints:** conversion, speed, brand vibe, accessibility level (WCAG AA?)
- **What you have:** screenshot, Figma, repo, URL, user journey

If the user says "全部都要" (design + UX + code + design system), treat it as four deliverables and ship in that order.

### 2. Produce Deliverables

Always be concrete: name components, states, spacing, typography, and interactions.

- **UI concept + layout:** Provide a clear visual direction, grid, typography, color system, key screens/sections.
- **UX flow:** Map the user journey, critical paths, error/empty/loading states, edge cases.
- **Design system:** Tokens (color/typography/spacing/radius/shadow), component rules, accessibility notes.
- **Implementation plan:** Exact file-level edits, component breakdown, and acceptance criteria.

## Design Intelligence

### Color Tokens

Use semantic color naming. Always provide light + dark mode tokens.

```css
:root {
  /* Brand */
  --color-primary: oklch(0.55 0.2 260);
  --color-primary-hover: oklch(0.50 0.2 260);
  --color-primary-light: oklch(0.95 0.02 260);

  /* Surfaces */
  --color-bg: oklch(1 0 0);
  --color-bg-secondary: oklch(0.97 0 0);
  --color-bg-tertiary: oklch(0.94 0 0);

  /* Text */
  --color-text: oklch(0.15 0 0);
  --color-text-secondary: oklch(0.45 0 0);
  --color-text-tertiary: oklch(0.65 0 0);

  /* Borders */
  --color-border: oklch(0.90 0 0);
  --color-border-hover: oklch(0.80 0 0);

  /* Status */
  --color-success: oklch(0.55 0.18 145);
  --color-warning: oklch(0.65 0.18 85);
  --color-error: oklch(0.50 0.22 25);
  --color-info: oklch(0.55 0.15 245);
}
```

### Typography Scale

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Component States

Every interactive component must handle these states:
- **Default** — resting state
- **Hover** — mouse/finger over
- **Focus** — keyboard focused (visible ring)
- **Active/Pressed** — being clicked
- **Disabled** — not interactive
- **Loading** — async operation in progress
- **Error** — validation or server error
- **Empty** — no data to display

### UX Patterns

**Loading States:**
- Skeleton screens for page loads (better than spinners)
- Progress bars for multi-step processes
- Optimistic UI updates (show result immediately, rollback on error)

**Empty States:**
- Show illustration + helpful message (not just "No results")
- Provide a call-to-action (e.g., "Create your first project")

**Error States:**
- Human-readable error messages (not raw error codes)
- Recovery actions (retry, go back, contact support)
- Never show blank white screen on error

**Edge Cases:**
- Very long text (truncation with tooltip)
- Very short content (minimum height)
- No network (offline state)
- First-time user (onboarding)
- Power user (keyboard shortcuts)

## Frontend Implementation Patterns

### React Component Template
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, onClick }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

### Accessibility Checklist
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only way to convey information
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Touch targets are ≥ 44x44px
- [ ] Page has a logical heading structure
- [ ] ARIA roles are used correctly

## Output Standards

- Default to CSS custom properties for tokens
- Include: spacing scale, type scale, 2-3 font pair options, color tokens, component states
- Always cover: empty/loading/error, keyboard navigation, focus states, contrast
