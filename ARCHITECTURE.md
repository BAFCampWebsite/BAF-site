# Architecture

## Overview

The site uses [Astro](https://astro.build) — a static site generator that outputs zero-client-JS HTML. Every page is pre-built at deploy time into plain `.html` files.

## File structure

```py
src/
  lib/pages.js                     # Shared locales + pagePaths() helper
  pages/[locale]/
    index.astro                    # /fr/, /en/, /nl/
    billetterie.astro              # /fr/billetterie, /en/billetterie, /nl/billetterie
    programme.astro                # /fr/programme, /en/programme, /nl/programme
    ...                            # ... one file per page type
  components/                      # Shared UI components
  layouts/BaseLayout.astro         # Page wrapper (head, nav, footer, scripts)
  i18n/{fr,en,nl}.json             # All translatable text
```

Each page type has **one file** under `src/pages/[locale]/`. Its `getStaticPaths()` calls the shared `pagePaths('slug')` helper, which returns one path per locale.

## Adding a new page

See [Contributing.md](CONTRIBUTING.md) for more concrete examples

## Translations

All translatable text lives in `src/i18n/{fr,en,nl}.json`. Each JSON file mirrors the page structure:

```json
{
  "nav": { ... },
  "hero": { ... },
  "billetterie": { ... },
  "programme": { ... },
  "site": { ... },
  "footer": { ... }
}
```

Pages read the JSON for their locale and pass it to shared components. To change text, edit one value in one JSON file. To add a language, create `src/i18n/de.json` and add one entry to `src/lib/pages.js`.

A prebuild validation script (`npm run validate:i18n`) checks that all three JSON files share identical key structure — the build fails if a key is missing or extra in any locale.

## Components

Shared UI is extracted into `src/components/`:

| Component | Purpose |
|-----------|---------|
| `Nav.astro` | Navigation bar with dropdowns, burger menu, language switcher |
| `Footer.astro` | 4-column footer with nav, social links, copyright |
| `BaseHead.astro` | `<head>` with SEO, Open Graph, Twitter cards, hreflang, canonical |
| `Scripts.astro` | Vanilla JS for dropdowns, scroll-reveal, logo/hero upload |
| `Hero.astro` | Index page hero with event meta grid + CTAs |
| `EnBref.astro` | "In brief" card section |
| `ContactSection.astro` | Contact CTA section |
| `Billetterie.astro` | Ticket page with privilege meter, pricing tiers, form popup |

These are used in `layouts/BaseLayout.astro` which wraps every page. The layout receives `slug` (current page name) and passes it to `Nav` and `BaseHead` so the language switcher and canonical/alternate URLs stay on the correct page.

## Build output

`npm run build` produces `dist/` with:

```
dist/
  index.html                     # Meta-redirects to /fr/
  billetterie/index.html         # Meta-redirects to /fr/billetterie
  programme/index.html           # Meta-redirects to /fr/programme
  ...
  fr/index.html                  # FR home
  fr/billetterie/index.html      # FR billetterie
  en/index.html                  # EN home
  en/billetterie/index.html      # EN billetterie
  nl/index.html                  # NL home
  nl/billetterie/index.html      # NL billetterie
  style.css                      # from public/
  BAF Logo.png                   # from public/
  ...
```

All files are pure static HTML. No hydration, no framework runtime. Root-level `/` and FR pages are generated as redirect HTML pages (via Astro's built-in `redirects` config), each containing a `<meta http-equiv="refresh">` pointing to the `/fr/...` equivalent.

## Vercel

Vercel auto-detects Astro from `astro.config.mjs`:

1. Installs dependencies via `npm install`
2. Runs `npm run build`
3. Serves the `dist/` folder

`vercel.json` handles redirects that Astro's static redirects cannot express:

| From | To | Reason |
|------|-----|--------|
| `/billeterie` | `/fr/billetterie` | Common typo |
| `/billeterie/` | `/fr/billetterie` | Trailing-slash variant |
| `/:path.html` | `/fr/:path` | Clean URLs for old bookmarks |

Locale prefix redirects (`/` → `/fr/`, `/billetterie` → `/fr/billetterie`, etc.) are handled natively by Astro's `redirects` config in `astro.config.mjs` — no Vercel rule needed.

## URL scheme

Every URL has a three-letter locale prefix:

| Language | Home | Subpage |
|----------|------|---------|
| French | `/fr/` | `/fr/programme` |
| English | `/en/` | `/en/programme` |
| Dutch | `/nl/` | `/nl/programme` |

Root-level URLs (`/`, `/programme`, etc.) automatically redirect to their `/fr/...` equivalent via Astro's `<meta http-equiv="refresh">`.

## Language switcher

The language switcher in `Nav.astro` receives a `slug` prop (the current page name, e.g. `'billetterie'` or `''` for index). It builds per-locale links uniformly:

```
FR: /{slug}        → /billetterie  or  /
NL: /nl/{slug}     → /nl/billetterie  or  /nl/
EN: /en/{slug}     → /en/billetterie  or  /en/
```

No special-casing for French being at root — every locale link follows the same pattern. The `class="active"` state is set per locale at build time.
