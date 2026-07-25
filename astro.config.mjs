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
          en: 'en', 
          nl: 'nl',
          fr: 'fr',
        },
      },
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
