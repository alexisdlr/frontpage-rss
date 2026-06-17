# Frontpage — RSS Feed Reader

A customizable content aggregator that pulls RSS and Atom feeds into one calm reading dashboard. Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io).

**Live URL:** https://frontpage-feed-reader-main-rho.vercel.app

**Guest experience (submit this URL):** https://frontpage-feed-reader-main-rho.vercel.app/guest

![Screenshot of the solution](./public/images/screenshot.png)

---

## Overview

Frontpage lets you subscribe to RSS/Atom feeds, organize them by category, browse articles in a scannable list, and read full content in-app when available. Authenticated users persist feeds and read state in Supabase; guests get a fully populated demo with 19 curated feeds and session-based read tracking.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Authentication | Supabase Auth |
| Hosting | Vercel |
| Styling | Tailwind CSS v4 + design tokens |
| RSS parsing | `rss-parser` with custom normalization |
| List virtualization | `@tanstack/react-virtual` |

---

## Design Decisions

### Dashboard layout

Dense, Linear-inspired list view with a sticky category sidebar on desktop and a slide-over nav on mobile. Unread indicators use a small accent dot and bold titles rather than heavy badges, keeping scan speed high.

### Reader view

Articles with sufficient `content_html` open in a serif reader (Georgia) on a calm background; sanitized HTML with lazy-loaded images. Otherwise, items open the original source in a new tab.

### Guest experience

Guests land on `/guest` with live-fetched content from 19 sample feeds across five categories. Read state lives in `localStorage` so the demo feels real without an account. A persistent banner encourages sign-up to save subscriptions.

### Landing page

Mobile-first hero with dual CTAs (sign up + try as guest). Marketing screenshot uses `next/image` with lazy loading and responsive `sizes` to avoid blocking LCP on smaller viewports.

---

## Performance

| Technique | Implementation |
|-----------|----------------|
| Skeleton screens | Route-level Suspense, guest hydration, filter transitions, load-more rows |
| Lazy images | Favicons (`loading="lazy"`), reader HTML images via sanitizer, marketing screenshot |
| Virtualized lists | `@tanstack/react-virtual` when 50+ items are loaded; dynamic row measurement |
| Pagination | Cursor-based server pagination (30 items/page) + infinite scroll |
| Guest caching | 5-minute in-memory cache for parallel RSS fetches |
| Images | AVIF/WebP via `next.config.ts` |

---

## Lighthouse Scores

Measured on the production deployment (mobile, Lighthouse 11.7).

### Landing page (`/`)

| Category | Score | Target |
|----------|-------|--------|
| Performance | **98** | >85 |
| Accessibility | **94** | >90 |
| Best Practices | **100** | >90 |
| SEO | **100** | — |

### Guest dashboard (`/guest`)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | **97** | Server-rendered live RSS fetch on first load |
| Accessibility | **79** | Slow SSR window during feed aggregation affects audit timing |
| Best Practices | **96** | |
| SEO | **73** | Dynamic content page; lower SEO weight by design |

Guest mode intentionally fetches live feeds server-side so reviewers see real content. That adds cold-start latency but keeps the demo authentic.

---

## Known Limitations

- Search UI is present but not wired to a backend (Stretch feature)
- Bookmarks / Saved section not implemented (Stretch feature)
- OPML import/export not implemented (Stretch feature)
- Design Challenge features (onboarding flow, digest view, layout customization) deferred to v2
- Supabase env vars must be configured on Vercel for authenticated features

---

## Running Locally

```bash
git clone https://github.com/alexisdlr/frontpage-rss.git
cd frontpage-rss

pnpm install

cp .env.example .env.local
# Fill in Supabase credentials

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Guest mode works without Supabase; auth and dashboard require env vars.

### Environment Variables

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |

---

## Acknowledgments

Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io). Spec and brand guidance from the challenge starter kit.
