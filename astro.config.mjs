import { defineConfig } from 'astro/config';
import astroIntl from "astro-intl";
import { readFileSync } from 'node:fs';
import vercel from '@astrojs/vercel';

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  site: 'https://bafcamp.be',
  integrations: [astroIntl({
    defaultLocale: "fr",
    locales: ["fr", "en", "nl"],
    messages: {
      fr: () => JSON.parse(readFileSync("./src/i18n/fr.json", "utf-8")),
      en: () => JSON.parse(readFileSync("./src/i18n/en.json", "utf-8")),
      nl: () => JSON.parse(readFileSync("./src/i18n/nl.json", "utf-8")),
    },
  }), sitemap({
    i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-UK',
          nl: 'nl-BE',
          fr: 'fr-BE',
        },
      },
    // Print-only pages (e.g. /fr/programme-print) don't belong in the
    // sitemap. Any page whose slug ends in `-print` is treated as one.
    filter: (page) => !/\/[^/]+-print\/?$/.test(page),
    xslURL: 'https://gitcdn.xyz/repo/pedroborges/xml-sitemap-stylesheet/master/sitemap.xsl'
    })],
  vite: {
    plugins: [
      {
        name: "i18n-hot-reload",
        configureServer(server) {
          server.watcher.on("change", (filePath) => {
            if (filePath.includes("/src/i18n/") && filePath.endsWith(".json")) {
              server.ws.send({ type: "full-reload" });
            }
          });
        },
      },
    ],
  },
});
