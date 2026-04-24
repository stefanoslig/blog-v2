# stefanos-lignos.dev

Personal blog built with Astro 6, Tailwind CSS v4, and React 19.

## Tech stack

- **Astro 6.1** — static site generator
- **Tailwind CSS v4** — CSS-first styling via `@theme` tokens in `src/styles/global.css`, no `tailwind.config.js`
- **React 19** — used only for MDX shortcode components
- **MDX** — post authoring with interactive shortcodes (Accordion, Tabs, Notice, Video, etc.)
- **Shiki** — syntax highlighting
- **TypeScript** — full type checking with `npx astro check`
- **Partytown** — offloads third-party scripts to a web worker
- **@astrojs/sitemap** — auto-generated sitemap

## Fonts

Loaded via Astro's native `fonts` config in `astro.config.mjs` (no `astro-font` package). Currently: Geist (sans) and Geist Mono.

## Theming

Light/dark mode via `html.dark` class. A pre-paint inline script in `Base.astro` reads `localStorage.theme` and falls back to `prefers-color-scheme: dark`. Tailwind `dark:` variants handle all color switching. Theme tokens live in `src/styles/global.css`.

## Project structure

```
src/
  content/         # MDX/Markdown blog posts (Content Collections)
  layouts/         # Base.astro, PostSingle.astro + partials/shortcodes
  pages/           # Astro routes (index, posts, tags, categories, about)
  styles/          # global.css (single stylesheet, Tailwind v4)
  lib/             # contentParser, utils (dateFormat, slugify, sortFunctions…)
  config/          # config.json, menu.json, social.json
```

## Commands

| Command             | Action                                          |
|---------------------|-------------------------------------------------|
| `npm install`       | Install dependencies                            |
| `npm run dev`       | Start dev server at `http://localhost:4321`     |
| `npm run build`     | Build static site to `dist/`                    |
| `npm run preview`   | Preview the production build locally            |
| `npx astro check`   | Type-check all `.astro` files                   |

## Notes

- The `z` deprecation warnings in `content.config.ts` (`ts(6385)`) are from Astro's legacy zod re-export; they are non-breaking and will resolve when Astro removes the shim in a future release.
- Two type errors in `src/lib/utils/sortFunctions.ts` (date arithmetic on `Date | undefined`) are pre-existing and non-blocking — `sortByDate` works correctly at runtime.
