# Blog modernization — design spec

**Date:** 2026-04-24
**Author:** Stefanos Lignos (with Claude)
**Status:** Ready for implementation planning

## Goal

Modernize `stefanos-lignos.dev`: a refined redesign that moves the site away from its generic "bookworm" template aesthetic, and a dependency cleanup that drops dead packages and upgrades the remaining stack to current versions. Both efforts happen together — the redesign rewrites most styles, so doing the package migration at the same time avoids rewriting them twice.

## Design system

### Identity

Swiss / refined-minimal. Strict grid, tight sans-serif, generous whitespace, single accent. Engineer-editorial — serious about writing and serious about craft, no decorative noise. Both light and dark modes are first-class citizens.

### Color

**Light mode**
- Background: `#fafaf7` (warm off-white)
- Text primary: `#0a0a0a`
- Text secondary: `#666`
- Text muted: `#888`
- Border: `rgba(0, 0, 0, 0.1)`
- Accent: `#1a8f7b` (deep teal)

**Dark mode**
- Background: `#0f0f0f`
- Text primary: `#fafaf7`
- Text secondary: `#a0a0a0`
- Text muted: `#888`
- Border: `rgba(255, 255, 255, 0.1)`
- Accent: `#4ac2ad` (brighter teal for contrast)

Colors live in `src/styles/global.css` via Tailwind v4 `@theme` tokens and `html.dark` overrides. No other color values are hardcoded outside this file.

### Typography

- **Geist** (400, 500, 600, 700) — body, titles, navigation
- **JetBrains Mono** (400, 500) — small labels, metadata, dates, tags, category names. Used at small sizes with letter-spacing `0.2–0.25em` and often uppercase
- **Fraunces** (italic only, variable optical size) — used sparingly as a serif accent phrase inside display titles. Never for body

Fonts are loaded via Astro's native font API (`astro:assets/fonts`, added in Astro 5). No external `<link>` tags to Google Fonts and no `astro-font` package.

Font sizes scale on a modular rhythm with a 16px base:
- Display titles (hero on home and article pages): 32px mobile → 40px desktop, weight 700, letter-spacing −0.035em, line-height 1.05
- Body: 16px, line-height 1.6
- Small labels (JetBrains Mono): 10–11px, letter-spacing 0.2em, uppercase
- Meta / kicker: 11–12px, JetBrains Mono

### Layout

- Page container max width: **960px**
- Reading column max width: **720px**
- Article page: reading column (720px) + 24px gap + 160px sticky TOC column on viewports ≥900px; on narrower viewports, the TOC collapses to a `<details>` disclosure at the top of the article
- Horizontal padding: 16px mobile, 24px desktop
- Vertical rhythm: 8px base unit. Major sections separated by 64px; article `<h2>` has 48px top / 16px bottom spacing; `<h3>` has 32px / 12px

### Motion

Restrained. Astro `ClientRouter` for view transitions between routes (default fade/morph). Hover states on linked titles: underline appears (no color shift, no transform). TOC active item: teal left-border driven by an `IntersectionObserver` on article headings. Theme toggle is instant; animations respect `prefers-reduced-motion`.

## Pages

### Home (`/`)

- Sticky top nav: logo `Stefanos Lignos.` (the period is teal), links (`Writing` · `About`), theme toggle on the right. No RSS link.
- Hero feature block: numbered `01.` treatment, kicker (`LATEST · ANGULAR · 14 MIN`), display title, one-line description, meta row (date · reading time)
- Below the feature: posts grouped by category headers (e.g. `ANGULAR`, `STATE MACHINES`). Each row: title (Geist 500) + date right-aligned (JetBrains Mono, tabular-nums). Hover state: accent color on title
- **Pagination removed.** Entire corpus fits on one page; categorized grouping replaces it
- Footer: small — copyright, social links (GitHub, Twitter/X, LinkedIn from `social.json`). No footer nav

### Article (`/posts/[slug]`)

- Same top nav
- `← Back to Writing` link below nav, JetBrains Mono, muted
- Centered hero block: kicker (category · read time), display title, meta row (date · byline). Thin border below
- Body: centered 720px reading column + sticky 160px TOC column to the right. TOC uses `IntersectionObserver` to highlight the active heading. Mobile: TOC collapses into a disclosure at the top
- Headings get `id`s and reveal a `#` anchor on hover
- Code blocks: Shiki, `github-dark-dimmed` theme, slightly softer than `one-dark-pro`. Same theme in both light and dark modes (code stays dark). Inline code gets a subtle background
- Bottom of article: tag row + share icons + "Similar posts" (keeps existing `similarItems` logic, new row-list styling)
- Hero images: not rendered by default, even when `image` is set in frontmatter. Reading-focused. The `image` field is preserved in the schema and still used for OG metadata

### About (`/about`)

- Narrow reading column (720px)
- Photo (circular, 120px, inline-left), heading, two-paragraph intro, list of links (work, social profiles)
- Visually consistent with article pages

### Tag / category (`/tags/[tag]`, `/categories/[category]`)

- Same nav + `← Back to Writing`
- Title: `Tag: NgRx` or `Category: Angular`
- Matching posts listed in the same row-list pattern used on the home page
- Index pages (`/tags`, `/categories`): grid of labels with post counts

### 404

- Same shell. Centered: large `404` in Fraunces italic, one-line copy, link back home

## Interaction & state

### Theme toggle

- Persisted to `localStorage` under key `theme` (values: `light` | `dark`)
- First-visit default: respects `prefers-color-scheme`
- The class toggle (`html.dark`) is applied by an inline `<script>` in `<head>` that runs **before paint** to avoid flash-of-wrong-theme. This script reads `localStorage` / `matchMedia`, sets `html.classList`, and is small enough to inline
- Toggle button in header updates `localStorage` and toggles the class. No page reload
- Meta `theme-color` tags already present stay, keyed to color scheme

### TOC scroll sync

- Each `h2` / `h3` in article content has a generated `id` (existing `generateToc.ts` utility is kept)
- Client-side: an `IntersectionObserver` observes those headings; the first one intersecting the top 40% of the viewport is marked "current"; its TOC entry gets the teal left-border + accent text color
- On narrow viewports: TOC is a `<details>` at top of article; scroll sync is not applied there

### View Transitions

- `<ClientRouter />` in Base.astro (renamed from `ViewTransitions` in older Astro)
- Default morph/fade between routes
- Nav and footer are `transition:persist`'d to stay stable across navigation

## Technical migration

### Packages updated

| Package | From | To |
| --- | --- | --- |
| `astro` | 5.11.1 | 6.1.x |
| `@astrojs/mdx` | 4.3.0 | 5.0.x |
| `@astrojs/react` | 4.3.0 | 5.0.x |
| `@astrojs/sitemap` | 3.4.1 | 3.7.x |
| `@astrojs/partytown` | 2.1.4 | 2.1.x |
| `react`, `react-dom` | 18.3.1 | 19.2.x |
| `tailwindcss` | 3.4.17 | 4.2.x |
| `@tailwindcss/typography` | 0.5.16 | 0.5.19+ (Tailwind v4-compatible) |
| `typescript` | 5.8.3 | latest |
| `prettier` | 3.3.1 | latest |

### Packages added

- `@tailwindcss/vite` (replaces `@astrojs/tailwind`)

### Packages removed

- `@astrojs/tailwind` — superseded by `@tailwindcss/vite`
- `astro-font` — replaced by Astro's built-in font API
- `tailwind-bootstrap-grid` — native Tailwind grid and flex are sufficient
- `sass` — no more SCSS; a single `global.css` replaces all layer imports
- `prettier-plugin-astro` — keep (still used)
- `prettier-plugin-tailwindcss` — keep (updated to v4-compatible release)

### Config changes

- **Delete** `tailwind.config.js` — Tailwind v4 moves config into CSS via `@theme { ... }` inside `global.css`
- **Delete** `postcss.config.js` — Tailwind v4 Vite plugin doesn't need it
- **Update** `astro.config.mjs`:
  - Remove `@astrojs/tailwind` integration
  - Add `@tailwindcss/vite` Vite plugin
  - Register Geist, JetBrains Mono, and Fraunces via Astro's built-in `fonts` config (the native font API that replaces `astro-font`)
  - `svg: true` stays (inline SVG support for footer etc.)
  - Keep `sitemap`, `react`, `partytown`, `mdx`, and the `astro-auto-import` shortcodes
- **Delete** `src/config/theme.json` — colors and fonts now live in `global.css`
- **Keep** `src/config/config.json` — site metadata
- **Keep** `src/config/menu.json` — but remove any RSS entry; the main nav becomes `Writing` / `About`

### File-level changes

**Delete**
- `src/styles/base.scss`, `buttons.scss`, `components.scss`, `navigation.scss`, `utilities.scss`, `main.scss`
- `src/pages/authors/index.astro`, `src/pages/authors/[single].astro`, `src/pages/authors/page/[slug].astro`
- `src/layouts/Authors.astro`, `src/layouts/AuthorSingle.astro`
- `src/content/authors/` (directory and all author entries)
- `tailwind.config.js`, `postcss.config.js`
- `src/config/theme.json`

**Create**
- `src/styles/global.css` — Tailwind v4 entrypoint with `@import "tailwindcss"`, a `@theme` block defining color/font tokens, a `html.dark` override block, and a handful of component layers (`.prose-custom`, TOC active state, etc.)
- `src/components/ThemeToggle.astro` — button + small client-side script, plus the pre-paint inline script added to `Base.astro`
- `src/components/PostList.astro` — row-list component used on home, tag, category pages (title + date, with optional group header)
- `src/components/CategoryGroup.astro` — wraps `PostList` with a category label header (home page)
- `src/components/FeaturedPost.astro` — the numbered `01.` feature block on home
- `src/components/Byline.astro` — renders `"Stefanos Lignos"` plus date and read time (replaces author-filter logic)

**Rewrite**
- `src/layouts/Base.astro` — Astro font API; `<ClientRouter />` in place of `<ViewTransitions />`; pre-paint theme script; import `global.css`
- `src/layouts/partials/Header.astro` — new nav with theme toggle
- `src/layouts/partials/Footer.astro` — minimal footer; drop `FooterBackground` SVG
- `src/layouts/Posts.astro` — row-list using `PostList` (fluid / legacy "first post big" behavior removed)
- `src/layouts/PostSingle.astro` — centered hero + side-TOC layout; `Byline` component; restyled tag row and share
- `src/layouts/components/RightSidebar.astro` — new TOC with `IntersectionObserver` active-state
- `src/layouts/components/Pagination.astro` — not used on home anymore; kept for tag/category pages if post count ever justifies it
- `src/pages/index.astro` — `FeaturedPost` + `CategoryGroup`s. No pagination
- `src/pages/about.astro`, `src/pages/404.astro`
- `src/pages/tags/[tag].astro`, `tags/index.astro`
- `src/pages/categories/[category].astro`, `categories/index.astro`
- `src/layouts/shortcodes/Notice.tsx`, `Tabs.tsx`, `Tab.tsx`, `Accordion.tsx`, `Button.tsx`, `Video.tsx` — keep behavior, restyle to the new system (Tailwind v4 classes, teal accents)
- `src/layouts/components/Aside.astro`, `SimilarPosts.astro`, `Share.astro`, `Social.astro`, `Logo.astro` — restyled
- `src/content/config.ts` — drop the `authors` collection. Keep the `authors` field on the post schema (it already has `.default(["admin"])`) so existing post frontmatters continue to validate without edits; the field is simply no longer consumed by any template

**Keep unchanged**
- `src/content/posts/*` — all article content
- `src/content/pages/*`, `src/content/about/index.md`
- `src/lib/utils/*` — dateFormat, readingTime, similarItems, sortFunctions, taxonomyFilter, textConverter
- `src/util/generateToc.ts`
- `src/lib/contentParser.astro`, `taxonomyParser.astro` — interior logic stays; any `getSinglePage("authors")` calls are removed
- `remark-modified-time.mjs`, `remark-toc`, `remark-collapse`
- `netlify.toml`
- All existing post URLs (`/posts/[slug]`) — no redirects needed
- `public/assets/*` — the author photo (`my-photo-2.jpg`) is reused on the About page

### Migration-specific risks

- **Tailwind v3 → v4** is a genuine breaking change. Class names mostly stay, but plugin APIs, config, and preflight all move. `@tailwindcss/typography` has specific v4-compatible releases.
- **Astro 5 → 6** requires reading the 6.0 migration guide during planning; `ViewTransitions` → `ClientRouter` rename is one known change; the content collections API may have changed.
- **React 19** breaking changes affect only the six MDX shortcodes. Low-risk.
- **Shiki theme** change may alter code-block appearance in existing posts; we should visually spot-check long code-heavy posts before ship.

## Scope boundaries (YAGNI)

Explicitly **not** included:

- Search (Pagefind, Algolia) — 10 posts doesn't need it
- Comments, reactions, newsletter signup
- Custom OG image generator — the static `/images/og-image.png` stays
- i18n
- Related-posts algorithm changes — `similarItems` utility stays as-is
- Analytics rework — existing Google Analytics via Partytown stays
- RSS feed — explicitly dropped; the nav link is removed
- Author concept — dropped; byline is static `"Stefanos Lignos"`; author pages and content collection removed
- Blog post authoring workflow changes — MDX frontmatter schema stays functional; only the `authors` field becomes irrelevant
- Pagination on the home page — removed; kept as a component for tag/category pages in case they grow

## Verification

Before declaring the redesign done:

- `npx astro check` passes — no TypeScript or content-schema errors
- `npx astro build` produces a clean static output with no warnings introduced by the migration
- All 10 existing article URLs resolve and render with the new styling
- Manual QA on: home, any article, about, 404, one tag page, one category page — in both light and dark mode, at desktop (≥1024px), tablet (≥768px), and mobile (<720px) widths
- Theme toggle: persists across navigation; respects `prefers-color-scheme` on first visit; no flash-of-wrong-theme on reload
- TOC active-state tracking works on `nx-module-boundaries` (longest article with deepest TOC)
- View Transitions work between home and article pages; nav/footer don't flicker
- Social share links, tag links, category links, similar posts all resolve correctly
- Lighthouse: visual/performance baseline is recorded before migration and the rebuilt site is at least as good on Performance, Accessibility, and SEO. The "Best Practices" score shouldn't regress either
