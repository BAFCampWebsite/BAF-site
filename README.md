# BAF Camp website

Static multilingual site for the Belgian Activism Festi-Camp, built with [Astro](https://astro.build).

- **French** at `https://belgian-activism-festi-camp.be/` (forwards to /fr)
- **English** at `https://belgian-activism-festi-camp.be/en/`
- **Dutch** at `https://belgian-activism-festi-camp.be/nl/`

## Local development

### Setup

If you haven't set up your Code Editor or environment yet, you can [check out the IDE.md page](IDE.md) with a guide.

In your terminal, make sure you are in this repo's directory and then run the following commands.

```bash
npm install
npm run dev
```

The above will start a development server and you can access it by navigating to `http://localhost:4321`. Changes to the files will reload the browser automatically.

### Making changes

Some basic guides and guidelines are detailed in [CONTRIBUTING.md](CONTRIBUTING.md).

The above explains the translations, how to add new pages, and how to make links.

### Build

```bash
npm run build
```

Outputs a fully static site to `dist/`. No runtime JavaScript framework — just HTML + CSS + vanilla JS.

This is what will be deployed eventually

#### Preview the build

```bash
npm run preview
```

## Project structure

```t
src/
  i18n/          # Translation JSON files (one per language)
  components/    # Individual UI components (Nav, Footer, Hero, etc.)
  layouts/       # Page layout wrapper
  pages/[locale] # Defines routes for all pages
public/          # Static assets (images, PDFs, style.css)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Deployment

Push to `main` — Vercel detects Astro from `astro.config.mjs` and auto-deploys.

If you open a PR, Vercel will create a preview deployment, check the "deployments" in the PR itself.
