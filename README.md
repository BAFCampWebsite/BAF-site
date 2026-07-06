# BAF Camp website

Static multilingual site for the Belgian Activism Festi-Camp, built with [Astro](https://astro.build).

- **French** at `https://belgian-activism-festi-camp.be/`
- **English** at `https://belgian-activism-festi-camp.be/en/`
- **Dutch** at `https://belgian-activism-festi-camp.be/nl/`

## Local development
Install Node and npm [You can find it here if you don't know how to install it](https://nodejs.org/en/download) (Use the Installer underneath the code block, that's the easiest)

In your terminal, make sure you are in this rep's directory and then run the following commands.
```bash
npm install
npm run dev
```

The above will start a development server and you can access it by navigating to `http://localhost:4321`. Changes to the files will reload the browser automatically.

## Build

```bash
npm run build
```

Outputs a fully static site to `dist/`. No runtime JavaScript framework — just HTML + CSS + vanilla JS.

This is what will be deployed eventually

## Preview the build

```bash
npm run preview
```

## Project structure

```
src/
  i18n/          # Translation JSON files (one per language)
  components/    # Reusable UI components (Nav, Footer, Hero, etc.)
  layouts/       # Page layout wrapper
  pages/         # Single catch-all route generating all pages + languages
public/          # Static assets (images, PDFs, style.css)
```

See ARCHITECTURE.md for details.

## Deployment

Push to `main` — Vercel detects Astro from `astro.config.mjs` and auto-deploys.
