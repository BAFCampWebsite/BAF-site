import { defineConfig } from 'astro/config';
import astroIntl from "astro-intl";

export default defineConfig({
  site: 'https://belgian-activism-festi-camp.be',
  integrations: [
    astroIntl({
      defaultLocale: "fr",
      locales: ["fr", "en", "nl"],
      messages: {
        fr: () => import("./src/i18n/fr.json", { with: { type: "json" } }),
        en: () => import("./src/i18n/en.json", { with: { type: "json" } }),
        nl: () => import("./src/i18n/nl.json", { with: { type: "json" } }),
      },
    }),
  ],
});
