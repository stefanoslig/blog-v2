# Blog modernization implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `stefanos-lignos.dev` in a Swiss/refined-minimal aesthetic with light+dark themes and a deep teal accent, and migrate the stack to Astro 6 / Tailwind v4 / React 19 while removing dead packages (`astro-font`, `tailwind-bootstrap-grid`, `sass`).

**Architecture:** Static Astro 6 site. Styling is Tailwind v4 CSS-first — tokens in `src/styles/global.css` via `@theme`, no `tailwind.config.js`. Fonts load through Astro's native `fonts` config. Theme (light/dark) is an `html.dark` class set by a pre-paint inline script that reads `localStorage.theme` and falls back to `prefers-color-scheme`. Per-page content lives in existing MDX/markdown files (unchanged). All 10 existing `/posts/[slug]` URLs remain valid.

**Tech Stack:** Astro 6.1, Tailwind v4, React 19 (MDX shortcodes only), MDX, Shiki, Partytown, TypeScript.

**Verification:** No unit-test framework; each phase ends with `npx astro check` passing, `npx astro build` succeeding, and a manual visual smoke test on the dev server (`npx astro dev`). Baseline Lighthouse captured before migration.

**Reference:** `docs/superpowers/specs/2026-04-24-blog-modernization-design.md` — the spec this plan implements.

---

## Phase 0 — Foundation

### Task 0.1: Baseline and branch

**Files:**
- Modify: none (git state only)

- [ ] **Step 1: Confirm clean working tree and current branch**

Run: `git status && git branch --show-current`
Expected: "nothing to commit, working tree clean" and `main`.

- [ ] **Step 2: Create a feature branch**

Run: `git checkout -b redesign-2026`
Expected: "Switched to a new branch 'redesign-2026'".

- [ ] **Step 3: Capture a baseline Lighthouse of production (optional but recommended)**

If Chrome DevTools access exists: run Lighthouse against https://www.stefanos-lignos.dev/ and save the JSON to `docs/superpowers/plans/baseline-lighthouse.json`. If unavailable, skip — verification still uses build/check passing as hard gates.

- [ ] **Step 4: Commit the baseline if captured**

```bash
# Only if baseline file was saved
git add docs/superpowers/plans/baseline-lighthouse.json
git commit -m "chore: capture pre-migration lighthouse baseline"
```

---

## Phase 1 — Package migration (infrastructure swap)

This phase replaces the build/styling toolchain **without changing any page output yet**. The site will not render correctly at the end of this phase — that's expected. Phase 2 re-introduces styles.

### Task 1.1: Uninstall dead packages

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Remove deprecated dependencies**

Run:
```bash
npm uninstall @astrojs/tailwind astro-font tailwind-bootstrap-grid sass
```
Expected: clean uninstall, `package.json` no longer lists these.

- [ ] **Step 2: Commit the removal**

```bash
git add package.json package-lock.json
git commit -m "chore: remove astro-font, tailwind-bootstrap-grid, sass, @astrojs/tailwind"
```

### Task 1.2: Install new/updated packages

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Upgrade Astro and framework integrations to latest**

Run:
```bash
npm install astro@latest \
  @astrojs/mdx@latest \
  @astrojs/react@latest \
  @astrojs/sitemap@latest \
  @astrojs/partytown@latest
```
Expected: all four integrations + astro updated. Version numbers in `package.json` should match latest tags on npm.

- [ ] **Step 2: Add Tailwind v4 via its Vite plugin and upgrade typography**

Run:
```bash
npm install tailwindcss@latest @tailwindcss/vite@latest @tailwindcss/typography@latest
```
Expected: Tailwind 4.x, `@tailwindcss/vite` 4.x, `@tailwindcss/typography` 0.5.19+.

- [ ] **Step 3: Upgrade React to 19**

Run:
```bash
npm install react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```
Expected: react + react-dom at 19.x, types updated.

- [ ] **Step 4: Upgrade TypeScript, Prettier, Prettier plugins**

Run:
```bash
npm install -D typescript@latest prettier@latest prettier-plugin-astro@latest prettier-plugin-tailwindcss@latest
```
Expected: all at latest.

- [ ] **Step 5: Commit the upgrades**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade astro 6, tailwind 4, react 19, typography plugin"
```

### Task 1.3: Delete legacy config files

**Files:**
- Delete: `tailwind.config.js`, `postcss.config.js`

- [ ] **Step 1: Delete Tailwind and PostCSS configs**

Run:
```bash
rm tailwind.config.js postcss.config.js
```
Expected: files removed. Tailwind v4 reads tokens from CSS `@theme`; PostCSS config isn't needed with the Vite plugin.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: drop tailwind.config.js and postcss.config.js (tailwind v4)"
```

### Task 1.4: Rewrite astro.config.mjs

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Replace the file contents**

Open `astro.config.mjs` and replace with:

```javascript
// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import config from "./src/config/config.json";

export default defineConfig({
  site: config.site.base_url || "http://examplesite.com",
  base: config.site.base_path || "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",

  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Geist",
        cssVariable: "--font-sans",
        weights: ["400", "500", "600", "700"],
        styles: ["normal"],
        subsets: ["latin"],
      },
      {
        provider: fontProviders.google(),
        name: "JetBrains Mono",
        cssVariable: "--font-mono",
        weights: ["400", "500"],
        styles: ["normal"],
        subsets: ["latin"],
      },
      {
        provider: fontProviders.google(),
        name: "Fraunces",
        cssVariable: "--font-serif",
        weights: ["400"],
        styles: ["italic"],
        subsets: ["latin"],
      },
    ],
  },

  integrations: [
    sitemap(),
    react(),
    partytown({ config: { forward: ["dataLayer.push"] } }),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),
    mdx(),
  ],

  markdown: {
    remarkPlugins: [
      remarkModifiedTime,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
});
```

> **Note:** The `experimental.fonts` config above reflects Astro's font API as of the 5.x series. In Astro 6 the API may have moved out of `experimental` (to a top-level `fonts:` key) and `fontProviders` may re-export differently. If `astro check` reports an unknown key or missing export, consult the current Astro 6 docs at [https://docs.astro.build/en/guides/fonts/](https://docs.astro.build/en/guides/fonts/) and adjust only the shape of this block — the three fonts and their CSS variable names (`--font-sans`, `--font-mono`, `--font-serif`) must stay the same.

- [ ] **Step 2: Commit**

```bash
git add astro.config.mjs
git commit -m "refactor: rewrite astro.config for tailwind v4 + native fonts"
```

### Task 1.5: Create the global.css skeleton

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create the file with Tailwind v4 import and theme tokens**

Create `src/styles/global.css` with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* =========================================================
   Theme tokens — light mode (default)
   ========================================================= */
@theme {
  /* Fonts (Astro's font API sets these CSS variables) */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  /* Colors — light mode */
  --color-bg: #fafaf7;
  --color-fg: #0a0a0a;
  --color-fg-secondary: #666666;
  --color-fg-muted: #888888;
  --color-border: rgb(0 0 0 / 0.10);
  --color-accent: #1a8f7b;

  /* Content widths */
  --content-max: 720px;
  --page-max: 960px;
  --toc-width: 160px;
  --toc-gap: 24px;

  /* Breakpoints (for reference inside @media) */
  --breakpoint-sm: 540px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* =========================================================
   Dark mode overrides — applied via html.dark class
   ========================================================= */
html.dark {
  --color-bg: #0f0f0f;
  --color-fg: #fafaf7;
  --color-fg-secondary: #a0a0a0;
  --color-fg-muted: #888888;
  --color-border: rgb(255 255 255 / 0.10);
  --color-accent: #4ac2ad;
}

/* =========================================================
   Base element styles
   ========================================================= */
html {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  min-height: 100vh;
  font-family: inherit;
  font-weight: 400;
}

::selection {
  background: var(--color-accent);
  color: var(--color-bg);
}

a {
  color: inherit;
  text-decoration: none;
  transition: color 120ms ease;
}

a:hover {
  color: var(--color-accent);
}

code, pre, kbd {
  font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
}

em, i, .serif-italic {
  font-family: var(--font-serif), serif;
  font-style: italic;
  font-weight: 400;
}

/* =========================================================
   Typography helpers
   ========================================================= */
.label {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-fg-muted);
}

.kicker {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.display-title {
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.05;
  font-size: clamp(28px, 4vw + 16px, 44px);
}

/* =========================================================
   Prose customisations (typography plugin)
   ========================================================= */
.prose-custom {
  max-width: var(--content-max);
  color: var(--color-fg);
  font-size: 17px;
  line-height: 1.65;
}

.prose-custom h2 {
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: 1.5rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

.prose-custom h3 {
  font-weight: 600;
  letter-spacing: -0.015em;
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose-custom p {
  margin-bottom: 1rem;
}

.prose-custom a {
  color: var(--color-accent);
  border-bottom: 1px solid transparent;
  transition: border-color 120ms ease;
}

.prose-custom a:hover {
  border-bottom-color: var(--color-accent);
}

.prose-custom code:not(pre code) {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-fg);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.92em;
}

.prose-custom pre {
  background: #1a1a1a;
  color: #e8e8e8;
  padding: 16px 20px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 16px 0;
  font-size: 14px;
  line-height: 1.55;
}

.prose-custom blockquote {
  border-left: 3px solid var(--color-accent);
  padding: 4px 0 4px 16px;
  color: var(--color-fg-secondary);
  font-style: normal;
  margin: 20px 0;
}

.prose-custom ul, .prose-custom ol {
  padding-left: 20px;
  margin-bottom: 1rem;
}

.prose-custom ul { list-style: disc; }
.prose-custom ol { list-style: decimal; }

.prose-custom li { margin-bottom: 0.3rem; }

/* Heading anchor hover effect */
.prose-custom h2, .prose-custom h3, .prose-custom h4 {
  scroll-margin-top: 100px;
  position: relative;
}

.prose-custom h2 > a.anchor,
.prose-custom h3 > a.anchor,
.prose-custom h4 > a.anchor {
  position: absolute;
  left: -1.25rem;
  opacity: 0;
  color: var(--color-fg-muted);
  transition: opacity 120ms ease;
}

.prose-custom h2:hover > a.anchor,
.prose-custom h3:hover > a.anchor,
.prose-custom h4:hover > a.anchor {
  opacity: 1;
}

/* =========================================================
   TOC active state (client-side IntersectionObserver sets .active)
   ========================================================= */
.toc-link {
  display: block;
  padding: 4px 0 4px 12px;
  color: var(--color-fg-muted);
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  line-height: 1.35;
  border-left: 2px solid transparent;
  transition: color 120ms ease, border-color 120ms ease;
}

.toc-link:hover {
  color: var(--color-fg);
}

.toc-link.active {
  color: var(--color-accent);
  border-left-color: var(--color-accent);
}

/* =========================================================
   Reduced motion
   ========================================================= */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: tailwind v4 global styles with theme tokens and dark mode"
```

### Task 1.6: Verify the site still compiles

**Files:**
- None (verification only)

- [ ] **Step 1: Run astro check**

Run: `npx astro check`
Expected: it may report type errors coming from old SCSS imports and `astro-font` imports that no longer resolve — this is expected and will be fixed in Phase 2/3. The important thing is Astro itself doesn't crash; content collections and astro-level config validate.

If astro crashes (non-type errors), stop and diagnose before continuing.

- [ ] **Step 2: Skip `astro build` for now**

The build will fail until `Base.astro` stops importing the deleted SCSS. That's expected and handled in Task 3.1. No commit in this task.

---

## Phase 2 — Design tokens already live in `global.css`. Nothing to do here — the tokens, typography helpers, and prose block were all added in Task 1.5. Moving on.

---

## Phase 3 — Theme toggle + Base layout

### Task 3.1: Create the pre-paint theme script as a snippet

**Files:**
- Create: `src/components/theme-init.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/components/theme-init.ts
// Exported as a string so Base.astro can inline it into <head> with is:inline.
// It runs before paint to prevent a flash of the wrong theme.
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) { /* ignore: no localStorage, etc. */ }
})();
`;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/theme-init.ts
git commit -m "feat: add pre-paint theme init script"
```

### Task 3.2: Create the ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Create the component**

```astro
---
// src/components/ThemeToggle.astro
---

<button
  id="theme-toggle"
  type="button"
  class="theme-toggle"
  aria-label="Toggle color theme"
  title="Toggle color theme"
>
  <span class="theme-toggle-icon theme-toggle-icon-light" aria-hidden="true">◐</span>
  <span class="theme-toggle-icon theme-toggle-icon-dark" aria-hidden="true">◑</span>
  <span class="theme-toggle-label" aria-hidden="true">theme</span>
</button>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    color: var(--color-fg-muted);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    cursor: pointer;
    transition: color 120ms ease, border-color 120ms ease;
  }
  .theme-toggle:hover {
    color: var(--color-fg);
    border-color: var(--color-fg);
  }
  .theme-toggle-icon {
    display: inline-block;
    font-size: 14px;
    line-height: 1;
  }
  :global(html:not(.dark)) .theme-toggle-icon-dark { display: none; }
  :global(html.dark) .theme-toggle-icon-light { display: none; }
</style>

<script>
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: theme toggle component"
```

### Task 3.3: Rewrite Base.astro

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Replace the file contents**

```astro
---
// src/layouts/Base.astro
import "@/styles/global.css";
import { ClientRouter } from "astro:transitions";
import { Font } from "astro:assets";
import config from "@/config/config.json";
import { plainify } from "@/lib/utils/textConverter";
import Header from "@/partials/Header.astro";
import Footer from "@/partials/Footer.astro";
import { themeInitScript } from "@/components/theme-init";

export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
}

const { title, meta_title, description, image, noindex, canonical } = Astro.props;
const resolvedTitle = plainify(meta_title ? meta_title : title ? title : config.site.title);
const resolvedDesc = plainify(description ? description : config.metadata.meta_description);
const resolvedImage = `${config.site.base_url}${image ? image : config.metadata.meta_image}`;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
    <meta name="generator" content={Astro.generator} />

    <!-- favicon -->
    <link rel="shortcut icon" href={config.site.favicon} />

    <!-- theme meta -->
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fafaf7" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f0f0f" />

    <!-- pre-paint theme init (avoid FOUC of wrong theme) -->
    <script is:inline set:html={themeInitScript} />

    <!-- fonts -->
    <Font cssVariable="--font-sans" preload />
    <Font cssVariable="--font-mono" />
    <Font cssVariable="--font-serif" />

    <!-- title + canonical -->
    <title>{resolvedTitle}</title>
    {canonical && <link rel="canonical" href={canonical} />}
    {noindex && <meta name="robots" content="noindex,nofollow" />}

    <!-- meta -->
    <meta name="description" content={resolvedDesc} />
    <meta name="author" content={config.metadata.meta_author} />

    <!-- open graph -->
    <meta property="og:title" content={resolvedTitle} />
    <meta property="og:description" content={resolvedDesc} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={`${config.site.base_url}/${Astro.url.pathname.replace("/", "")}`} />
    <meta property="og:image" content={resolvedImage} />

    <!-- twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={resolvedTitle} />
    <meta name="twitter:description" content={resolvedDesc} />
    <meta name="twitter:image" content={resolvedImage} />

    <!-- google analytics via partytown -->
    <script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-YJN6NRX103"></script>
    <script type="text/partytown">
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", "G-YJN6NRX103");
    </script>

    <ClientRouter />
  </head>
  <body>
    <Header transition:persist />
    <main id="main-content">
      <slot />
    </main>
    <Footer transition:persist />
  </body>
</html>
```

> **Note:** `import { Font } from "astro:assets"` may instead be `import { Font } from "astro:fonts"` in Astro 6 — verify and adjust the import path only. The JSX usage `<Font cssVariable="..." />` is stable.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "refactor: rewrite Base.astro for astro 6, native fonts, ClientRouter"
```

### Task 3.4: Verify Base.astro compiles (smoke)

**Files:**
- None (verification only)

- [ ] **Step 1: Run astro check**

Run: `npx astro check`
Expected: Type errors from `Header.astro` and `Footer.astro` (they still reference deleted SCSS). These will be fixed in the next tasks.

---

## Phase 4 — Header + Footer

### Task 4.1: Rewrite Header.astro

**Files:**
- Modify: `src/layouts/partials/Header.astro`
- Modify: `src/config/menu.json` (drop RSS if present, add Writing+About only)

- [ ] **Step 1: Update menu.json**

Open `src/config/menu.json` and replace contents with:

```json
{
  "main": [
    { "name": "Writing", "url": "/" },
    { "name": "About", "url": "/about" }
  ]
}
```

- [ ] **Step 2: Replace Header.astro**

```astro
---
// src/layouts/partials/Header.astro
import menu from "@/config/menu.json";
import ThemeToggle from "@/components/ThemeToggle.astro";

const { main } = menu as { main: { name: string; url: string }[] };
const currentPath = Astro.url.pathname;
const isActive = (url: string) => {
  if (url === "/") return currentPath === "/" || currentPath.startsWith("/posts/") || currentPath.startsWith("/tags") || currentPath.startsWith("/categories");
  return currentPath.startsWith(url);
};
---

<header class="site-header">
  <nav class="site-nav">
    <a href="/" class="site-logo" aria-label="Stefanos Lignos — home">
      <span>Stefanos Lignos</span><span class="site-logo-dot">.</span>
    </a>

    <ul class="site-nav-links">
      {main.map((item) => (
        <li>
          <a
            href={item.url}
            class:list={["site-nav-link", isActive(item.url) && "active"]}
          >
            {item.name}
          </a>
        </li>
      ))}
    </ul>

    <ThemeToggle />
  </nav>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: color-mix(in srgb, var(--color-bg) 85%, transparent);
    backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--color-border);
  }
  .site-nav {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .site-logo {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .site-logo:hover { color: inherit; }
  .site-logo-dot { color: var(--color-accent); }
  .site-nav-links {
    display: flex;
    gap: 18px;
    margin: 0 auto 0 16px;
    list-style: none;
    padding: 0;
  }
  .site-nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-fg-muted);
    letter-spacing: -0.005em;
  }
  .site-nav-link:hover,
  .site-nav-link.active {
    color: var(--color-fg);
  }
  @media (max-width: 540px) {
    .site-nav { padding: 12px 16px; gap: 12px; }
    .site-nav-links { gap: 12px; margin: 0 auto 0 8px; }
    .site-logo { font-size: 14px; }
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/partials/Header.astro src/config/menu.json
git commit -m "feat: new minimal header with theme toggle"
```

### Task 4.2: Rewrite Footer.astro

**Files:**
- Modify: `src/layouts/partials/Footer.astro`
- Delete: `public/assets/footer.svg` (no longer used)

- [ ] **Step 1: Replace Footer.astro**

```astro
---
// src/layouts/partials/Footer.astro
import config from "@/config/config.json";
import social from "@/config/social.json";
import { markdownify } from "@/lib/utils/textConverter";

// social.json shape: { main: [{ name, icon, link }] }
const socialLinks = (social as any).main ?? [];
---

<footer class="site-footer">
  <div class="site-footer-inner">
    <p class="site-footer-copyright" set:html={markdownify(config.params.copyright)} />

    {socialLinks.length > 0 && (
      <ul class="site-footer-social" aria-label="Social links">
        {socialLinks.map((item: any) => (
          <li>
            <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={item.name}>
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
</footer>

<style>
  .site-footer {
    margin-top: 96px;
    border-top: 1px solid var(--color-border);
    padding: 28px 24px 40px;
  }
  .site-footer-inner {
    max-width: var(--page-max);
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    color: var(--color-fg-muted);
    letter-spacing: 0.05em;
  }
  .site-footer-copyright { margin: 0; }
  .site-footer-social {
    display: flex;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .site-footer-social a {
    color: inherit;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
  .site-footer-social a:hover { color: var(--color-fg); }
</style>
```

- [ ] **Step 2: Remove the unused footer SVG asset**

Run: `rm public/assets/footer.svg`
Expected: file removed.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/partials/Footer.astro
git add -A public/assets/footer.svg 2>/dev/null; git add -u public/assets/
git commit -m "feat: new minimal footer, drop footer.svg"
```

### Task 4.3: Smoke test the shell in dev

**Files:**
- None (verification only)

- [ ] **Step 1: Start dev server**

Run: `npx astro dev`
Expected: server starts on http://localhost:4321. It may still warn about the old Posts.astro referencing removed styles — that's OK, we fix it next.

- [ ] **Step 2: Open homepage**

Open http://localhost:4321/ in a browser. Expected: the new header and footer render. The post list in the middle is probably broken (still old code). Toggle the theme button — `html.dark` class appears/disappears and colors flip. Refresh — the theme persists.

- [ ] **Step 3: Stop the dev server and don't commit anything**

No file changes yet.

---

## Phase 5 — Content schema cleanup (drop authors)

### Task 5.1: Remove the authors collection from content config

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Replace file contents**

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    // authors kept optional for backwards-compat with existing frontmatter;
    // no longer rendered anywhere
    authors: z.array(z.string()).default(["admin"]),
    categories: z.array(z.string()).default(["others"]),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
  }),
});

const pagesCollection = defineCollection({
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    layout: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
};
```

- [ ] **Step 2: Delete the authors content directory and old author pages**

Run:
```bash
rm -rf src/content/authors
rm -rf src/pages/authors
rm -f src/layouts/Authors.astro
rm -f src/layouts/AuthorSingle.astro
```
Expected: all removed.

- [ ] **Step 3: Verify content validates**

Run: `npx astro check`
Expected: may have unrelated errors (other files still reference author utilities), but the content collection itself validates. If an error specifically says `Collection "authors" does not exist` from a file we haven't rewritten yet, that's expected and will be fixed when we rewrite `Posts.astro` and `PostSingle.astro`.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts
git add -A src/content/authors src/pages/authors src/layouts/Authors.astro src/layouts/AuthorSingle.astro 2>/dev/null
git commit -m "refactor: remove authors collection and author pages"
```

---

## Phase 6 — Shared post-list components

### Task 6.1: Create the Byline component

**Files:**
- Create: `src/components/Byline.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/components/Byline.astro
import config from "@/config/config.json";
import dateFormat from "@/lib/utils/dateFormat";

export interface Props {
  date: Date;
  readingTime?: string | number;
  category?: string;
  variant?: "kicker" | "meta";
}

const { date, readingTime, category, variant = "meta" } = Astro.props;
const author = config.metadata.meta_author;
---

{variant === "kicker" && (
  <div class="byline-kicker">
    {category && <span>{category}</span>}
    {category && readingTime && <span class="sep">·</span>}
    {readingTime && <span>{readingTime} MIN READ</span>}
  </div>
)}

{variant === "meta" && (
  <div class="byline-meta">
    <span>{dateFormat(date)}</span>
    <span class="sep">·</span>
    <span>{author}</span>
    {readingTime && (
      <>
        <span class="sep">·</span>
        <span>{readingTime} min</span>
      </>
    )}
  </div>
)}

<style>
  .byline-kicker, .byline-meta {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }
  .byline-kicker {
    color: var(--color-accent);
    font-weight: 500;
    letter-spacing: 0.25em;
  }
  .byline-kicker .sep, .byline-meta .sep { margin: 0 6px; opacity: 0.6; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Byline.astro
git commit -m "feat: Byline component"
```

### Task 6.2: Create the PostList component

**Files:**
- Create: `src/components/PostList.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/components/PostList.astro
// Renders a row-list of posts: title + right-aligned short date ("JUL · 25").
import type { CollectionEntry } from "astro:content";

export interface Props {
  posts: CollectionEntry<"posts">[];
}

const { posts } = Astro.props;

function formatShort(d?: Date): string {
  if (!d) return "";
  // e.g. "JUL · 25"
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year = String(d.getFullYear()).slice(-2);
  return `${month} · ${year}`;
}
---

<ul class="post-list">
  {posts.map((p) => (
    <li class="post-list-item">
      <a href={`/posts/${p.slug}`} class="post-list-link">
        <span class="post-list-title">{p.data.title}</span>
        <span class="post-list-date">{formatShort(p.data.date)}</span>
      </a>
    </li>
  ))}
</ul>

<style>
  .post-list { list-style: none; margin: 0; padding: 0; }
  .post-list-item {
    border-bottom: 1px solid var(--color-border);
  }
  .post-list-link {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: baseline;
    padding: 14px 0;
    color: inherit;
  }
  .post-list-title {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: -0.015em;
    color: var(--color-fg);
    transition: color 120ms ease;
  }
  .post-list-link:hover .post-list-title { color: var(--color-accent); }
  .post-list-date {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    color: var(--color-fg-muted);
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PostList.astro
git commit -m "feat: PostList row-list component"
```

### Task 6.3: Create the CategoryGroup component

**Files:**
- Create: `src/components/CategoryGroup.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/components/CategoryGroup.astro
import type { CollectionEntry } from "astro:content";
import PostList from "@/components/PostList.astro";
import { slugify, humanize } from "@/lib/utils/textConverter";

export interface Props {
  category: string;
  posts: CollectionEntry<"posts">[];
}

const { category, posts } = Astro.props;
const slug = slugify(category);
const label = humanize(category);
---

<section class="cat-group">
  <header class="cat-group-header">
    <h2 class="cat-group-label">
      <a href={`/categories/${slug}`}>{label}</a>
    </h2>
    <span class="cat-group-count">{posts.length} {posts.length === 1 ? "ARTICLE" : "ARTICLES"}</span>
  </header>
  <PostList posts={posts} />
</section>

<style>
  .cat-group { margin-top: 48px; }
  .cat-group-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--color-fg);
    margin-bottom: 0;
  }
  .cat-group-label {
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin: 0;
  }
  .cat-group-label a { color: var(--color-fg); }
  .cat-group-label a:hover { color: var(--color-accent); }
  .cat-group-count {
    font-family: var(--font-mono), monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--color-fg-muted);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CategoryGroup.astro
git commit -m "feat: CategoryGroup component"
```

### Task 6.4: Create the FeaturedPost component

**Files:**
- Create: `src/components/FeaturedPost.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/components/FeaturedPost.astro
import type { CollectionEntry } from "astro:content";
import dateFormat from "@/lib/utils/dateFormat";
import readingTime from "@/lib/utils/readingTime";
import { humanize } from "@/lib/utils/textConverter";

export interface Props {
  post: CollectionEntry<"posts">;
  index?: string; // e.g. "01"
}

const { post, index = "01" } = Astro.props;
const { title, description, date, categories } = post.data;
const minutes = readingTime(post.body);
const primaryCategory = (categories && categories[0]) ? humanize(categories[0]) : "";
---

<article class="featured">
  <a href={`/posts/${post.slug}`} class="featured-link">
    <div class="featured-num">
      <span>{index}</span><span class="featured-num-dot">.</span>
    </div>

    <div class="featured-body">
      <div class="featured-kicker">
        <span class="featured-label">LATEST</span>
        {primaryCategory && <><span class="featured-sep">·</span><span>{primaryCategory.toUpperCase()}</span></>}
        <span class="featured-sep">·</span>
        <span>{minutes} MIN READ</span>
      </div>

      <h1 class="featured-title">{title}</h1>

      {description && <p class="featured-desc">{description}</p>}

      <div class="featured-meta">
        {date && <span>{dateFormat(date)}</span>}
        <span class="featured-arrow">READ →</span>
      </div>
    </div>
  </a>
</article>

<style>
  .featured {
    padding: 28px 0 32px;
    border-top: 2px solid var(--color-fg);
    border-bottom: 1px solid var(--color-border);
  }
  .featured-link {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 20px;
    color: inherit;
    align-items: start;
  }
  .featured-num {
    font-family: var(--font-mono), monospace;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--color-fg);
  }
  .featured-num-dot { color: var(--color-accent); }
  .featured-kicker {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--color-fg-muted);
    margin-bottom: 10px;
  }
  .featured-kicker .featured-label { color: var(--color-accent); font-weight: 500; }
  .featured-kicker .featured-sep { margin: 0 6px; opacity: 0.6; }
  .featured-title {
    font-size: clamp(26px, 2.4vw + 14px, 36px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 12px;
    color: var(--color-fg);
  }
  .featured-link:hover .featured-title { color: var(--color-accent); }
  .featured-desc {
    font-size: 15px;
    color: var(--color-fg-secondary);
    margin: 0 0 14px;
    line-height: 1.5;
    max-width: 620px;
  }
  .featured-meta {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .featured-arrow {
    margin-left: auto;
    color: var(--color-accent);
    font-weight: 500;
  }
  @media (max-width: 540px) {
    .featured-link { grid-template-columns: 1fr; gap: 12px; }
    .featured-num { font-size: 28px; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FeaturedPost.astro
git commit -m "feat: FeaturedPost component"
```

---

## Phase 7 — Home page

### Task 7.1: Rewrite the home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the file contents**

```astro
---
// src/pages/index.astro
import Base from "@/layouts/Base.astro";
import FeaturedPost from "@/components/FeaturedPost.astro";
import CategoryGroup from "@/components/CategoryGroup.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";

const posts = await getSinglePage("posts");
const sorted = sortByDate(posts);
const [latest, ...rest] = sorted;

// Group the remaining posts by first category, preserving recency order.
const groups = new Map<string, typeof rest>();
for (const post of rest) {
  const cat = (post.data.categories?.[0] ?? "Other").toString();
  const list = groups.get(cat) ?? [];
  list.push(post);
  groups.set(cat, list);
}

// Sort groups by their newest post (already the first element per group).
const groupEntries = Array.from(groups.entries()).sort(([, a], [, b]) => {
  const da = a[0]?.data.date?.getTime() ?? 0;
  const db = b[0]?.data.date?.getTime() ?? 0;
  return db - da;
});
---

<Base>
  <section class="home">
    <div class="home-inner">
      {latest && <FeaturedPost post={latest} index="01" />}

      {groupEntries.map(([category, postsInCategory]) => (
        <CategoryGroup category={category} posts={postsInCategory} />
      ))}
    </div>
  </section>
</Base>

<style>
  .home { padding: 32px 24px 64px; }
  .home-inner {
    max-width: var(--page-max);
    margin: 0 auto;
  }
  @media (max-width: 540px) {
    .home { padding: 20px 16px 48px; }
  }
</style>
```

- [ ] **Step 2: Verify in dev**

Run: `npx astro dev`
Expected: home page renders with featured post, then category groups, both light and dark mode work, theme toggle persists across reload.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: new home page with featured post and categorized list"
```

---

## Phase 8 — Article page + sticky TOC

### Task 8.1: Split the TOC into two components (mobile disclosure, desktop sticky) + shared scroll-sync script

The previous `RightSidebar.astro` is replaced by three files:
- `src/components/TocSidebar.astro` — the sticky right-column version (shown at ≥900px)
- `src/components/TocDisclosure.astro` — the `<details>` mobile version (shown <900px)
- `src/components/toc-scroll-sync.ts` — the shared client script that highlights the active heading

**Files:**
- Create: `src/components/TocSidebar.astro`, `src/components/TocDisclosure.astro`, `src/components/toc-scroll-sync.ts`
- Delete: `src/layouts/components/RightSidebar.astro`

- [ ] **Step 1: Create the shared scroll-sync script**

```typescript
// src/components/toc-scroll-sync.ts
// Exported as a string so Base-level pages can inline it with <script is:inline set:html>.
// Runs on first load and on every ClientRouter page-load event.
export const tocScrollSyncScript = `
(function () {
  function initTOC() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-link'));
    if (links.length === 0) return;

    var ids = links.map(function (l) { return l.getAttribute('data-target'); }).filter(Boolean);
    var headings = ids.map(function (id) { return document.getElementById(id); }).filter(function (e) { return !!e; });
    if (headings.length === 0) return;

    function setActive(id) {
      links.forEach(function (a) {
        if (a.getAttribute('data-target') === id) a.classList.add('active');
        else a.classList.remove('active');
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

    headings.forEach(function (h) { observer.observe(h); });
    setActive(headings[0].id);
  }

  if (document.readyState !== 'loading') initTOC();
  else document.addEventListener('DOMContentLoaded', initTOC);
  document.addEventListener('astro:page-load', initTOC);
})();
`;
```

- [ ] **Step 2: Create `TocSidebar.astro` (desktop)**

```astro
---
// src/components/TocSidebar.astro
// Sticky right-column TOC, visible at ≥900px.
import type { MarkdownHeading } from "astro";

export interface Props {
  headings: MarkdownHeading[];
}

const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{items.length > 0 && (
  <aside class="toc-sidebar" aria-label="Table of contents">
    <h2 class="toc-sidebar-title">Contents</h2>
    <ol class="toc-sidebar-list">
      {items.map((h) => (
        <li class:list={[`toc-depth-${h.depth}`]}>
          <a href={`#${h.slug}`} class="toc-link" data-target={h.slug}>{h.text}</a>
        </li>
      ))}
    </ol>
  </aside>
)}

<style>
  .toc-sidebar {
    display: none;
    position: sticky;
    top: 90px;
    align-self: start;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
    font-family: var(--font-mono), monospace;
  }
  @media (min-width: 900px) {
    .toc-sidebar { display: block; }
  }
  .toc-sidebar-title {
    font-family: var(--font-mono), monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin: 0 0 10px;
  }
  .toc-sidebar-list { list-style: none; margin: 0; padding: 0; }
  .toc-sidebar-list .toc-depth-3 { padding-left: 12px; }
</style>
```

- [ ] **Step 3: Create `TocDisclosure.astro` (mobile)**

```astro
---
// src/components/TocDisclosure.astro
// <details>-style TOC, visible at <900px, placed inside the article content column.
import type { MarkdownHeading } from "astro";

export interface Props {
  headings: MarkdownHeading[];
}

const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{items.length > 0 && (
  <details class="toc-disclosure" aria-label="Table of contents">
    <summary>Contents</summary>
    <ol class="toc-disclosure-list">
      {items.map((h) => (
        <li class:list={[`toc-depth-${h.depth}`]}>
          <a href={`#${h.slug}`} class="toc-link" data-target={h.slug}>{h.text}</a>
        </li>
      ))}
    </ol>
  </details>
)}

<style>
  .toc-disclosure {
    display: block;
    margin: 0 0 32px;
    padding: 12px 14px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-family: var(--font-mono), monospace;
    font-size: 12px;
  }
  .toc-disclosure > summary {
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }
  .toc-disclosure[open] > summary { margin-bottom: 8px; }
  .toc-disclosure-list { list-style: none; margin: 0; padding: 0; }
  .toc-disclosure-list .toc-depth-3 { padding-left: 12px; }
  @media (min-width: 900px) {
    .toc-disclosure { display: none; }
  }
</style>
```

- [ ] **Step 4: Delete the old RightSidebar.astro**

Run: `rm src/layouts/components/RightSidebar.astro`
Expected: removed. Its consumers (PostSingle.astro) are rewritten in Task 8.2.

- [ ] **Step 5: Commit**

```bash
git add src/components/TocSidebar.astro src/components/TocDisclosure.astro src/components/toc-scroll-sync.ts
git add -A src/layouts/components
git commit -m "feat: split TOC into sidebar (desktop) and disclosure (mobile) components"
```

### Task 8.2: Rewrite PostSingle.astro

**Files:**
- Modify: `src/layouts/PostSingle.astro`

- [ ] **Step 1: Replace contents**

```astro
---
// src/layouts/PostSingle.astro
import type { CollectionEntry } from "astro:content";
import dateFormat from "@/lib/utils/dateFormat";
import readingTime from "@/lib/utils/readingTime";
import similarItems from "@/lib/utils/similarItems";
import { humanize, markdownify, slugify } from "@/lib/utils/textConverter";
import { getSinglePage } from "@/lib/contentParser.astro";
import TocSidebar from "@/components/TocSidebar.astro";
import TocDisclosure from "@/components/TocDisclosure.astro";
import { tocScrollSyncScript } from "@/components/toc-scroll-sync";
import PostList from "@/components/PostList.astro";
import Share from "@/layouts/components/Share.astro";
import config from "@/config/config.json";

export interface Props {
  post: CollectionEntry<"posts">;
}

const { post } = Astro.props;
const posts = await getSinglePage("posts");
const similar = similarItems(post, posts, post.slug).slice(0, 3);

const { Content, remarkPluginFrontmatter, headings } = await post.render();
const { title, description, categories, tags, date } = post.data;
const minutes = readingTime(post.body);
const primaryCategory = categories?.[0] ? humanize(categories[0]) : "";
const author = config.metadata.meta_author;

const lastModified = remarkPluginFrontmatter?.lastModified as string | undefined;
---

<article class="article">
  <div class="article-inner">
    <a href="/" class="article-back" transition:animate="none">← Back to Writing</a>

    <header class="article-header">
      <div class="article-kicker">
        {primaryCategory && <span>{primaryCategory.toUpperCase()}</span>}
        {primaryCategory && <span class="sep">·</span>}
        <span>{minutes} MIN READ</span>
      </div>
      <h1 class="article-title display-title" set:html={markdownify(title)} />
      <div class="article-meta">
        {date && <span>{dateFormat(date)}</span>}
        <span class="sep">·</span>
        <span>{author}</span>
        {lastModified && lastModified !== (date?.toISOString?.() ?? "") && (
          <>
            <span class="sep">·</span>
            <span>Updated {dateFormat(new Date(lastModified))}</span>
          </>
        )}
      </div>
    </header>

    <div class="article-body">
      <div class="article-content prose-custom">
        <TocDisclosure headings={headings} />
        <Content />
      </div>
      <TocSidebar headings={headings} />
    </div>

    <footer class="article-footer">
      {tags && tags.length > 0 && (
        <ul class="article-tags">
          {tags.map((tag: string) => (
            <li>
              <a href={`/tags/${slugify(tag)}`}>#{humanize(tag)}</a>
            </li>
          ))}
        </ul>
      )}
      <Share title={title} description={description ?? ""} slug={post.slug} className="article-share" />
    </footer>
  </div>
</article>

{similar.length > 0 && (
  <aside class="similar">
    <div class="similar-inner">
      <h2 class="similar-title">Similar posts</h2>
      <PostList posts={similar} />
    </div>
  </aside>
)}

<!-- TOC scroll-sync: applies to both the mobile disclosure and desktop sidebar. -->
<script is:inline set:html={tocScrollSyncScript} />

<style>
  .article { padding: 32px 24px 64px; }
  .article-inner {
    max-width: var(--page-max);
    margin: 0 auto;
  }

  .article-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .article-back:hover { color: var(--color-fg); }

  .article-header {
    text-align: center;
    padding-bottom: 28px;
    margin-bottom: 32px;
    border-bottom: 1px solid var(--color-border);
  }
  .article-kicker {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--color-accent);
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .article-kicker .sep, .article-meta .sep { margin: 0 8px; color: var(--color-fg-muted); font-weight: 400; }
  .article-title {
    max-width: 20ch;
    margin: 0 auto 16px;
    color: var(--color-fg);
  }
  .article-meta {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  /* Body: reading column + sticky TOC column at ≥900px; single column below. */
  .article-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--toc-width);
    gap: var(--toc-gap);
    align-items: start;
    max-width: calc(var(--content-max) + var(--toc-gap) + var(--toc-width));
    margin: 0 auto;
  }
  .article-content { grid-column: 1; min-width: 0; }

  @media (max-width: 899px) {
    .article-body { grid-template-columns: 1fr; max-width: var(--content-max); }
  }

  .article-footer {
    max-width: var(--content-max);
    margin: 48px auto 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 28px;
    border-top: 1px solid var(--color-border);
  }
  .article-tags { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; margin: 0; padding: 0; }
  .article-tags a {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--color-fg-secondary);
    border: 1px solid var(--color-border);
    padding: 4px 10px;
    border-radius: 3px;
  }
  .article-tags a:hover { color: var(--color-accent); border-color: var(--color-accent); }

  .similar { padding: 0 24px 80px; }
  .similar-inner {
    max-width: var(--content-max);
    margin: 0 auto;
    padding-top: 40px;
    border-top: 1px solid var(--color-border);
  }
  .similar-title {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin: 0 0 12px;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/PostSingle.astro
git commit -m "feat: new article layout with centered hero and sticky TOC"
```

### Task 8.3: Rewrite the per-slug post route

**Files:**
- Modify: `src/pages/posts/[regular].astro`

- [ ] **Step 1: Read current file to match its structure**

Run: `cat src/pages/posts/[regular].astro`

- [ ] **Step 2: Replace contents**

```astro
---
// src/pages/posts/[regular].astro
import Base from "@/layouts/Base.astro";
import PostSingle from "@/layouts/PostSingle.astro";
import { getSinglePage } from "@/lib/contentParser.astro";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  return posts.map((post) => ({
    params: { regular: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { title, description, image } = post.data;
---

<Base title={title} description={description} image={image}>
  <PostSingle post={post} />
</Base>
```

- [ ] **Step 3: Verify a post renders**

Run: `npx astro dev`
Open http://localhost:4321/posts/nx-module-boundaries in a browser. Expected:
- Centered hero with kicker, title, and meta
- Body content in a reading column
- TOC on the right (sticky) at ≥ 900px
- TOC as a `<details>` at the top when resized < 900px
- TOC active item updates as you scroll
- Toggle theme — works instantly, persists

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/posts/[regular].astro
git commit -m "feat: post route wires up new PostSingle layout"
```

### Task 8.4: Add heading anchor links via remark plugin (optional polish)

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Install rehype-autolink-headings and rehype-slug**

Run: `npm install -D rehype-slug rehype-autolink-headings`
Expected: both installed.

- [ ] **Step 2: Add them to astro.config**

In `astro.config.mjs`, update the `markdown` section to include rehype plugins:

```javascript
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// ... inside defineConfig
  markdown: {
    remarkPlugins: [
      remarkModifiedTime,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: "prepend",
        properties: { className: ["anchor"], "aria-hidden": "true", tabIndex: -1 },
        content: { type: "text", value: "#" },
      }],
    ],
    shikiConfig: { theme: "github-dark-dimmed", wrap: true },
    extendDefaultPlugins: true,
  },
```

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "feat: heading anchor links via rehype-autolink-headings"
```

---

## Phase 9 — Standalone pages: about, tag/category, 404

### Task 9.1: Rewrite About page

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Read the existing About content**

Run: `cat src/content/about/index.md`
Expected: frontmatter + a paragraph of markdown.

- [ ] **Step 2: Replace about.astro**

```astro
---
// src/pages/about.astro
import { getEntry } from "astro:content";
import { Image } from "astro:assets";
import Base from "@/layouts/Base.astro";

const entry = await getEntry("pages" as any, "about" as any) ?? await getEntry({ collection: "pages" as any, slug: "about" });
// Fallback: also check for markdown-based content without explicit collection
let title = "About";
let Content: any = null;
let image: string | undefined;
try {
  const about = await import("@/content/about/index.md");
  title = (about.frontmatter as any)?.title ?? "About";
  image = (about.frontmatter as any)?.image;
  Content = about.Content;
} catch { /* ignore */ }
---

<Base title={title}>
  <section class="about">
    <div class="about-inner">
      <a href="/" class="about-back">← Back to Writing</a>

      <header class="about-header">
        <div class="kicker">ABOUT</div>
        <h1 class="display-title">{title}</h1>
      </header>

      <div class="about-body">
        {image && (
          <img src={image} alt="Stefanos Lignos" class="about-photo" width="120" height="120" />
        )}
        <div class="prose-custom about-prose">
          {Content && <Content />}
        </div>
      </div>
    </div>
  </section>
</Base>

<style>
  .about { padding: 32px 24px 80px; }
  .about-inner { max-width: var(--content-max); margin: 0 auto; }
  .about-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .about-back:hover { color: var(--color-fg); }

  .about-header { margin-bottom: 32px; }
  .about-header .kicker { margin-bottom: 10px; color: var(--color-accent); }

  .about-body { display: flex; gap: 24px; align-items: flex-start; }
  .about-photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .about-prose { flex: 1; }
  @media (max-width: 540px) {
    .about-body { flex-direction: column; gap: 16px; }
  }
</style>
```

> **Note:** `getEntry` API shape changed between Astro 4 and newer versions. If the above doesn't resolve the about markdown, fall back to the dynamic `import("@/content/about/index.md")` approach which always works.

- [ ] **Step 3: Verify in dev**

Run: `npx astro dev`
Open http://localhost:4321/about. Expected: photo + name + intro, styled consistently.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: new about page"
```

### Task 9.2: Rewrite Tag index + tag page

**Files:**
- Modify: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`
- Look at: `src/lib/utils/taxonomyFilter.ts`

- [ ] **Step 1: Read helpers**

Run: `cat src/lib/utils/taxonomyFilter.ts src/lib/taxonomyParser.astro`
Expected: utilities for deriving tag/category lists.

- [ ] **Step 2: Replace `src/pages/tags/index.astro`**

```astro
---
// src/pages/tags/index.astro
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { slugify, humanize } from "@/lib/utils/textConverter";

const posts = await getSinglePage("posts");

const counts = new Map<string, number>();
for (const p of posts) {
  for (const tag of p.data.tags ?? []) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
}
const tags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
---

<Base title="Tags">
  <section class="taxonomy">
    <div class="taxonomy-inner">
      <a href="/" class="taxonomy-back">← Back to Writing</a>
      <header class="taxonomy-header">
        <div class="kicker">TAGS</div>
        <h1 class="display-title">All tags</h1>
      </header>
      <ul class="taxonomy-grid">
        {tags.map(([tag, count]) => (
          <li>
            <a href={`/tags/${slugify(tag)}`} class="taxonomy-chip">
              <span>#{humanize(tag)}</span>
              <span class="taxonomy-count">{count}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
</Base>

<style>
  .taxonomy { padding: 32px 24px 80px; }
  .taxonomy-inner { max-width: var(--page-max); margin: 0 auto; }
  .taxonomy-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .taxonomy-back:hover { color: var(--color-fg); }
  .taxonomy-header { margin-bottom: 28px; }
  .taxonomy-header .kicker { margin-bottom: 10px; color: var(--color-accent); }

  .taxonomy-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .taxonomy-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    color: var(--color-fg);
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .taxonomy-chip:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .taxonomy-count { color: var(--color-fg-muted); font-size: 10px; }
</style>
```

- [ ] **Step 3: Replace `src/pages/tags/[tag].astro`**

```astro
---
// src/pages/tags/[tag].astro
import Base from "@/layouts/Base.astro";
import PostList from "@/components/PostList.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";
import { slugify, humanize } from "@/lib/utils/textConverter";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  const tagSet = new Set<string>();
  for (const p of posts) for (const t of p.data.tags ?? []) tagSet.add(t);

  return Array.from(tagSet).map((tag) => {
    const matching = sortByDate(posts.filter((p) => (p.data.tags ?? []).some((t) => slugify(t) === slugify(tag))));
    return {
      params: { tag: slugify(tag) },
      props: { tag, posts: matching },
    };
  });
}

const { tag, posts } = Astro.props as { tag: string; posts: Awaited<ReturnType<typeof getSinglePage<"posts">>> };
---

<Base title={`Tag: ${humanize(tag)}`}>
  <section class="taxonomy-single">
    <div class="taxonomy-inner">
      <a href="/tags" class="taxonomy-back">← All tags</a>
      <header class="taxonomy-header">
        <div class="kicker">TAG</div>
        <h1 class="display-title">#{humanize(tag)}</h1>
        <p class="taxonomy-count-text">{posts.length} {posts.length === 1 ? "article" : "articles"}</p>
      </header>
      <PostList posts={posts} />
    </div>
  </section>
</Base>

<style>
  .taxonomy-single { padding: 32px 24px 80px; }
  .taxonomy-inner { max-width: var(--page-max); margin: 0 auto; }
  .taxonomy-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .taxonomy-back:hover { color: var(--color-fg); }
  .taxonomy-header { margin-bottom: 24px; }
  .taxonomy-header .kicker { margin-bottom: 10px; color: var(--color-accent); }
  .taxonomy-count-text {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin: 8px 0 0;
  }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/tags
git commit -m "feat: new tag index and tag detail pages"
```

### Task 9.3: Rewrite Category pages

**Files:**
- Modify: `src/pages/categories/index.astro`, `src/pages/categories/[category].astro`

- [ ] **Step 1: Replace `src/pages/categories/index.astro`**

```astro
---
// src/pages/categories/index.astro
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { slugify, humanize } from "@/lib/utils/textConverter";

const posts = await getSinglePage("posts");

const counts = new Map<string, number>();
for (const p of posts) {
  for (const c of p.data.categories ?? []) {
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
}
const categories = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
---

<Base title="Categories">
  <section class="taxonomy">
    <div class="taxonomy-inner">
      <a href="/" class="taxonomy-back">← Back to Writing</a>
      <header class="taxonomy-header">
        <div class="kicker">CATEGORIES</div>
        <h1 class="display-title">All categories</h1>
      </header>
      <ul class="taxonomy-grid">
        {categories.map(([cat, count]) => (
          <li>
            <a href={`/categories/${slugify(cat)}`} class="taxonomy-chip">
              <span>{humanize(cat)}</span>
              <span class="taxonomy-count">{count}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
</Base>

<style>
  .taxonomy { padding: 32px 24px 80px; }
  .taxonomy-inner { max-width: var(--page-max); margin: 0 auto; }
  .taxonomy-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .taxonomy-back:hover { color: var(--color-fg); }
  .taxonomy-header { margin-bottom: 28px; }
  .taxonomy-header .kicker { margin-bottom: 10px; color: var(--color-accent); }

  .taxonomy-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .taxonomy-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    color: var(--color-fg);
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .taxonomy-chip:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .taxonomy-count { color: var(--color-fg-muted); font-size: 10px; }
</style>
```

- [ ] **Step 2: Replace `src/pages/categories/[category].astro`**

```astro
---
// src/pages/categories/[category].astro
import Base from "@/layouts/Base.astro";
import PostList from "@/components/PostList.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";
import { slugify, humanize } from "@/lib/utils/textConverter";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  const catSet = new Set<string>();
  for (const p of posts) for (const c of p.data.categories ?? []) catSet.add(c);

  return Array.from(catSet).map((cat) => {
    const matching = sortByDate(posts.filter((p) => (p.data.categories ?? []).some((c) => slugify(c) === slugify(cat))));
    return {
      params: { category: slugify(cat) },
      props: { category: cat, posts: matching },
    };
  });
}

const { category, posts } = Astro.props as { category: string; posts: Awaited<ReturnType<typeof getSinglePage<"posts">>> };
---

<Base title={`Category: ${humanize(category)}`}>
  <section class="taxonomy-single">
    <div class="taxonomy-inner">
      <a href="/categories" class="taxonomy-back">← All categories</a>
      <header class="taxonomy-header">
        <div class="kicker">CATEGORY</div>
        <h1 class="display-title">{humanize(category)}</h1>
        <p class="taxonomy-count-text">{posts.length} {posts.length === 1 ? "article" : "articles"}</p>
      </header>
      <PostList posts={posts} />
    </div>
  </section>
</Base>

<style>
  .taxonomy-single { padding: 32px 24px 80px; }
  .taxonomy-inner { max-width: var(--page-max); margin: 0 auto; }
  .taxonomy-back {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin-bottom: 28px;
  }
  .taxonomy-back:hover { color: var(--color-fg); }
  .taxonomy-header { margin-bottom: 24px; }
  .taxonomy-header .kicker { margin-bottom: 10px; color: var(--color-accent); }
  .taxonomy-count-text {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--color-fg-muted);
    margin: 8px 0 0;
  }
</style>
```

- [ ] **Step 3: Also delete the unused pagination-based `/page/[slug]` route**

Run: `rm src/pages/page/[slug].astro && rmdir src/pages/page 2>/dev/null || true`
Expected: removed. Pagination on home is no longer needed; the route becomes dead code.

- [ ] **Step 4: Commit**

```bash
git add src/pages/categories src/pages/page 2>/dev/null
git add -A src/pages
git commit -m "feat: new category pages, remove unused pagination route"
```

### Task 9.4: Rewrite 404 page

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Replace contents**

```astro
---
// src/pages/404.astro
import Base from "@/layouts/Base.astro";
---

<Base title="Not found" noindex>
  <section class="notfound">
    <div class="notfound-inner">
      <div class="notfound-num serif-italic">404</div>
      <h1 class="notfound-title">This page has wandered off.</h1>
      <p class="notfound-desc">The link you followed may be broken, or the page may have been moved.</p>
      <a href="/" class="notfound-link">← Back to Writing</a>
    </div>
  </section>
</Base>

<style>
  .notfound {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
  }
  .notfound-inner { max-width: 480px; text-align: center; }
  .notfound-num {
    font-family: var(--font-serif), serif;
    font-style: italic;
    font-size: 120px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--color-accent);
    margin-bottom: 20px;
  }
  .notfound-title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
    line-height: 1.1;
  }
  .notfound-desc {
    color: var(--color-fg-secondary);
    font-size: 16px;
    margin: 0 0 28px;
    line-height: 1.5;
  }
  .notfound-link {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-accent);
    border-bottom: 1px solid currentColor;
    padding-bottom: 2px;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: new 404 page"
```

---

## Phase 10 — MDX shortcodes restyling

All six existing shortcodes (`Button.tsx`, `Notice.tsx`, `Accordion.tsx`, `Tabs.tsx`, `Tab.tsx`, `Video.tsx`) are React components rendered inside MDX. React 19 should compile them unchanged. They need visual refresh to match the new aesthetic.

### Task 10.1: Restyle Notice.tsx

**Files:**
- Modify: `src/layouts/shortcodes/Notice.tsx`

- [ ] **Step 1: Read current file**

Run: `cat src/layouts/shortcodes/Notice.tsx`

- [ ] **Step 2: Replace contents**

```tsx
// src/layouts/shortcodes/Notice.tsx
import type { ReactNode } from "react";

interface Props {
  type?: "note" | "tip" | "info" | "warning";
  children: ReactNode;
}

const colorByType: Record<string, string> = {
  note: "#4a90e2",
  tip: "#1a8f7b",
  info: "#c87c1b",
  warning: "#c03020",
};

export default function Notice({ type = "note", children }: Props) {
  const color = colorByType[type] ?? colorByType.note;
  return (
    <aside
      className="notice"
      style={{
        borderLeft: `3px solid ${color}`,
        padding: "12px 16px",
        margin: "20px 0",
        background: `color-mix(in srgb, ${color} 6%, transparent)`,
        borderRadius: "3px",
        fontSize: "15px",
        lineHeight: 1.55,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "10px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: color,
          fontWeight: 600,
          marginBottom: "6px",
        }}
      >
        {type}
      </div>
      <div>{children}</div>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/shortcodes/Notice.tsx
git commit -m "refactor: restyle Notice shortcode"
```

### Task 10.2: Restyle Button.tsx

**Files:**
- Modify: `src/layouts/shortcodes/Button.tsx`

- [ ] **Step 1: Read current file and note its signature (href, label, etc.)**

Run: `cat src/layouts/shortcodes/Button.tsx`

- [ ] **Step 2: Replace with a minimal, themed implementation preserving the original props**

```tsx
// src/layouts/shortcodes/Button.tsx
import type { ReactNode } from "react";

interface Props {
  label?: string;
  link?: string;
  href?: string;
  children?: ReactNode;
}

export default function Button({ label, link, href, children }: Props) {
  const target = href ?? link ?? "#";
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        padding: "10px 20px",
        marginTop: "12px",
        fontFamily: "var(--font-sans), sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        color: "var(--color-bg)",
        background: "var(--color-accent)",
        border: "none",
        borderRadius: "3px",
        textDecoration: "none",
        letterSpacing: "0.01em",
      }}
    >
      {children ?? label ?? "Read more"}
    </a>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/shortcodes/Button.tsx
git commit -m "refactor: restyle Button shortcode"
```

### Task 10.3: Restyle Accordion.tsx

**Files:**
- Modify: `src/layouts/shortcodes/Accordion.tsx`

- [ ] **Step 1: Read current file**

Run: `cat src/layouts/shortcodes/Accordion.tsx`

- [ ] **Step 2: Replace with a minimal themed implementation preserving its props**

The current component uses an interactive state. Keep the same API; update styles.

```tsx
// src/layouts/shortcodes/Accordion.tsx
import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function Accordion({ title, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "3px",
        marginBottom: "16px",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "12px 16px",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-fg)",
        }}
      >
        <span>{title}</span>
        <span
          aria-hidden
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            color: "var(--color-fg-muted)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 120ms ease",
          }}
        >
          ›
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 16px 16px",
            fontSize: "15px",
            lineHeight: 1.55,
            color: "var(--color-fg-secondary)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/shortcodes/Accordion.tsx
git commit -m "refactor: restyle Accordion shortcode"
```

### Task 10.4: Restyle Tabs.tsx and Tab.tsx

**Files:**
- Modify: `src/layouts/shortcodes/Tabs.tsx`, `src/layouts/shortcodes/Tab.tsx`

- [ ] **Step 1: Read current files**

Run: `cat src/layouts/shortcodes/Tabs.tsx src/layouts/shortcodes/Tab.tsx`

- [ ] **Step 2: Replace `Tabs.tsx`**

```tsx
// src/layouts/shortcodes/Tabs.tsx
import { Children, useState, isValidElement, type ReactNode, type ReactElement } from "react";

interface TabProps { name: string; children: ReactNode; }

export default function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (c): c is ReactElement<TabProps> => isValidElement(c) && (c.props as any).name
  );
  const [active, setActive] = useState(0);

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "3px",
        marginBottom: "20px",
      }}
    >
      <div
        role="tablist"
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          background: "color-mix(in srgb, var(--color-fg) 4%, transparent)",
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.props.name}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: i === active ? "var(--color-fg)" : "var(--color-fg-muted)",
              borderBottom: i === active ? "2px solid var(--color-accent)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.props.name}
          </button>
        ))}
      </div>
      <div style={{ padding: "16px", fontSize: "15px", lineHeight: 1.55 }}>
        {tabs[active]}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `Tab.tsx`**

```tsx
// src/layouts/shortcodes/Tab.tsx
import type { ReactNode } from "react";

interface Props {
  name: string;
  children: ReactNode;
}

export default function Tab({ children }: Props) {
  return <div>{children}</div>;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/shortcodes/Tabs.tsx src/layouts/shortcodes/Tab.tsx
git commit -m "refactor: restyle Tabs and Tab shortcodes"
```

### Task 10.5: Restyle Video.tsx

**Files:**
- Modify: `src/layouts/shortcodes/Video.tsx`

- [ ] **Step 1: Read current file**

Run: `cat src/layouts/shortcodes/Video.tsx`

- [ ] **Step 2: Replace with themed wrapper**

```tsx
// src/layouts/shortcodes/Video.tsx
interface Props {
  src: string;
  title?: string;
}

export default function Video({ src, title = "Video" }: Props) {
  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        margin: "20px 0",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        borderRadius: "3px",
      }}
    >
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/shortcodes/Video.tsx
git commit -m "refactor: restyle Video shortcode"
```

### Task 10.6: Restyle Aside.astro

**Files:**
- Modify: `src/layouts/components/Aside.astro`

- [ ] **Step 1: Read current file**

Run: `cat src/layouts/components/Aside.astro`

- [ ] **Step 2: Replace contents**

```astro
---
// src/layouts/components/Aside.astro
// Used inside MDX posts (see nx-module-boundaries.mdx) for side callouts.
export interface Props {
  type?: "note" | "tip" | "info" | "warning";
}

const { type = "note" } = Astro.props;
const colorMap: Record<string, string> = {
  note: "#4a90e2",
  tip: "#1a8f7b",
  info: "#c87c1b",
  warning: "#c03020",
};
const color = colorMap[type] ?? colorMap.note;
---

<aside class="mdx-aside" data-type={type} style={`--aside-accent: ${color}`}>
  <div class="mdx-aside-label">{type}</div>
  <div class="mdx-aside-body">
    <slot />
  </div>
</aside>

<style>
  .mdx-aside {
    border-left: 3px solid var(--aside-accent);
    padding: 12px 16px;
    margin: 20px 0;
    background: color-mix(in srgb, var(--aside-accent) 6%, transparent);
    border-radius: 3px;
    font-size: 15px;
    line-height: 1.55;
  }
  .mdx-aside-label {
    font-family: var(--font-mono), monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--aside-accent);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .mdx-aside-body :global(p:last-child) { margin-bottom: 0; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/components/Aside.astro
git commit -m "refactor: restyle Aside component"
```

### Task 10.7: Restyle Share.astro, SimilarPosts.astro, Social.astro, Logo.astro

**Files:**
- Modify: `src/layouts/components/Share.astro`, `SimilarPosts.astro`, `Social.astro`, `Logo.astro`

- [ ] **Step 1: Replace Share.astro**

```astro
---
// src/layouts/components/Share.astro
import config from "@/config/config.json";

export interface Props {
  title: string;
  description: string;
  slug: string;
  className?: string;
}

const { title, slug, className = "" } = Astro.props;
const url = `${config.site.base_url}/posts/${slug}`;
---

<div class:list={["share", className]}>
  <span class="share-label">Share</span>
  <a
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Share on Twitter/X"
  >X</a>
  <a
    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Share on LinkedIn"
  >LinkedIn</a>
</div>

<style>
  .share {
    display: flex;
    gap: 14px;
    align-items: center;
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .share-label { color: var(--color-fg-muted); }
  .share a { color: var(--color-fg-secondary); }
  .share a:hover { color: var(--color-accent); }
</style>
```

- [ ] **Step 2: Replace SimilarPosts.astro** (kept but re-used by PostSingle via PostList, so simplest is to delete since PostSingle already uses PostList directly)

Run: `rm src/layouts/components/SimilarPosts.astro`
Expected: removed. PostSingle.astro already uses `PostList` for the "Similar posts" section.

- [ ] **Step 3: Replace Social.astro** (small wrapper around social.json icons — since Footer.astro already renders social directly, delete)

Run: `rm src/layouts/components/Social.astro`
Expected: removed.

- [ ] **Step 4: Replace Logo.astro** (no longer used — Header renders the logo inline)

Run: `rm src/layouts/components/Logo.astro`
Expected: removed.

- [ ] **Step 5: Commit**

```bash
git add -A src/layouts/components
git commit -m "refactor: simplify Share, remove unused SimilarPosts/Social/Logo"
```

---

## Phase 11 — Cleanup

### Task 11.1: Remove old SCSS files and dead theme config

**Files:**
- Delete: `src/styles/base.scss`, `buttons.scss`, `components.scss`, `navigation.scss`, `utilities.scss`, `main.scss`
- Delete: `src/config/theme.json`

- [ ] **Step 1: Remove them**

```bash
rm src/styles/base.scss src/styles/buttons.scss src/styles/components.scss src/styles/navigation.scss src/styles/utilities.scss src/styles/main.scss
rm src/config/theme.json
```
Expected: all removed.

- [ ] **Step 2: Commit**

```bash
git add -A src/styles src/config
git commit -m "chore: remove legacy SCSS and theme.json"
```

### Task 11.2: Remove pagination component if unused

**Files:**
- Modify: `src/layouts/components/Pagination.astro`

- [ ] **Step 1: Grep for any remaining uses**

Run: `grep -r "Pagination" src/ --include="*.astro" --include="*.ts" --include="*.tsx"`
Expected: only the file itself shows up. If anything else still imports it, leave the component in place (it does no harm).

- [ ] **Step 2: If unused, remove it**

```bash
rm src/layouts/components/Pagination.astro
```

- [ ] **Step 3: Commit**

```bash
git add -A src/layouts/components
git commit -m "chore: remove unused Pagination component"
```

### Task 11.3: Remove TwSizeIndicator dev-only component if unused

**Files:**
- Modify: `src/layouts/components/TwSizeIndicator.astro`

- [ ] **Step 1: Check if it's referenced**

Run: `grep -r "TwSizeIndicator" src/ --include="*.astro"`
Expected: nothing (Base.astro no longer imports it after Task 3.3).

- [ ] **Step 2: Remove it**

```bash
rm src/layouts/components/TwSizeIndicator.astro
```

- [ ] **Step 3: Commit**

```bash
git add -A src/layouts/components
git commit -m "chore: remove TwSizeIndicator dev helper"
```

---

## Phase 12 — Final verification

### Task 12.1: Full type + content check

**Files:**
- None

- [ ] **Step 1: Run astro check**

Run: `npx astro check`
Expected: `0 errors, 0 warnings`. If errors appear, fix them in the referenced file and re-run. Common fixes:
- Missing import after a rename → update the import
- Type mismatch in `Astro.props` cast → match to the component's `Props` interface
- Orphaned reference to the deleted `authors` collection → remove that code

- [ ] **Step 2: Run astro build**

Run: `npx astro build`
Expected: build succeeds and writes `dist/`. Watch for warnings about dead routes or unresolved links; fix any that appear.

- [ ] **Step 3: Don't commit — this is a gate**

If steps 1 and 2 both pass, proceed. If anything fails, go back to the task that introduced the break (git log will tell you) and fix it.

### Task 12.2: Manual QA on dev server

**Files:**
- None

- [ ] **Step 1: Start dev server**

Run: `npx astro dev`

- [ ] **Step 2: Walk through the QA checklist**

Open each URL and verify:

| URL | Check |
|---|---|
| `/` | Featured post `01.` renders; category groups appear; dates right-aligned tabular |
| `/posts/nx-module-boundaries` | Hero centered; TOC visible on right at ≥900px; TOC active item updates on scroll |
| `/posts/nx-module-boundaries` at <900px | TOC appears as a `<details>` disclosure near the top |
| `/about` | Photo + intro render correctly |
| `/tags` | Chip grid of all tags with counts |
| `/tags/angular` | Heading + post list |
| `/categories` | Chip grid of categories |
| `/categories/angular` | Heading + post list |
| `/nonexistent` | 404 page with large serif "404" |

For each page, also:
- Toggle theme — instantly flips, no flash, preference persists across navigation
- View transitions feel smooth between home → post → home
- Hover on post titles reveals teal color; hover on headings reveals `#` anchor
- Mobile (resize browser to 375px) — layout holds, nav collapses cleanly, TOC becomes disclosure

- [ ] **Step 3: Check console for errors**

The browser console should be clean — no errors, no warnings from Astro/React about missing keys, missing props, or deprecated APIs.

- [ ] **Step 4: Stop the dev server**

If anything is off, fix and commit in a follow-up task. If everything's good, continue.

- [ ] **Step 5: Lighthouse comparison (only if baseline was captured in Task 0.1)**

Run a production build and preview, then run Lighthouse against it:

```bash
npm run build
npx astro preview &
# Open http://localhost:4321/ and run Lighthouse in Chrome DevTools
# Save the report JSON to docs/superpowers/plans/post-migration-lighthouse.json
```

Compare Performance, Accessibility, Best Practices, and SEO scores against `baseline-lighthouse.json`. The rebuilt site should be at least as good on all four. If any score regresses by >5 points, investigate (most commonly: unoptimised images, missing alt text, or a new JS bundle the migration introduced).

```bash
git add docs/superpowers/plans/post-migration-lighthouse.json 2>/dev/null
git commit -m "chore: capture post-migration lighthouse" || true
```

Then kill the preview server.

### Task 12.3: Update README and final commit

**Files:**
- Modify: `README.md` (it's currently one line)

- [ ] **Step 1: Read current README**

Run: `cat README.md`
Expected: very minimal.

- [ ] **Step 2: Replace with a developer-facing README**

```markdown
# blog-v2

Personal blog at [stefanos-lignos.dev](https://www.stefanos-lignos.dev/).

## Stack

- Astro 6 (static site)
- Tailwind v4 (CSS-first, tokens in `src/styles/global.css`)
- React 19 (MDX shortcodes only)
- MDX posts in `src/content/posts/`

## Local dev

```bash
npm install
npm run dev    # localhost:4321
npm run build  # astro check + astro build
```

## Writing a post

Add a `.md` or `.mdx` file under `src/content/posts/`. Required frontmatter:

```yaml
---
title: "Your title"
description: "Short description for og/meta"
date: 2026-04-24
categories: ["Angular"]
tags: ["Angular", "Architecture"]
---
```

`authors` and `image` are optional. `draft: true` hides the post.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for astro 6 stack"
```

### Task 12.4: Merge to main

**Files:**
- None (git only)

- [ ] **Step 1: Verify branch state is clean**

Run: `git status`
Expected: clean working tree.

- [ ] **Step 2: Switch to main and merge**

Run:
```bash
git checkout main
git merge --no-ff redesign-2026
```
Expected: fast-forward or merge commit succeeds.

- [ ] **Step 3: Smoke-test on main**

Run: `npm run build && npx astro preview`
Expected: preview serves the built site at http://localhost:4321. Walk through the QA checklist from Task 12.2 one more time against the production build.

- [ ] **Step 4: Delete the feature branch**

Run: `git branch -d redesign-2026`

- [ ] **Step 5: Push to origin (user-triggered)**

Only after confirming the user wants to push:

```bash
git push origin main
```

Netlify will pick up the push and deploy.

---

## Notes for the implementer

- **Astro 6 API deltas:** two likely small deltas — the `Font` component's import path (`astro:assets` vs `astro:fonts`) and whether `fontProviders` is under `experimental`. If either breaks, consult Astro's 6.0 migration guide and tweak only the import/shape; the 3 fonts (Geist / JetBrains Mono / Fraunces) and their CSS variable names (`--font-sans`, `--font-mono`, `--font-serif`) are fixed by the design.
- **Tailwind v4:** no `tailwind.config.js`. All customisation lives in `global.css` via `@theme {}` and direct CSS. The Typography plugin loads via `@plugin "@tailwindcss/typography";` at the top of `global.css`. If the typography plugin syntax changed between minor v4 versions, check its README.
- **React 19:** the shortcodes use hooks (`useState` in `Accordion`, `Tabs`). No API changes affect them. If React 19 warns about `act()` or concurrent rendering, ignore for SSR-rendered components — they execute at build time.
- **Flash of wrong theme:** the inline script in `Base.astro` *must* run before `<body>`. Don't move it after `<ClientRouter />` or CSS-in-head will paint once before the class is set.
- **ViewTransitions persist:** Header and Footer use `transition:persist` so scroll position and theme-toggle state aren't nuked on navigation. Don't change those.
