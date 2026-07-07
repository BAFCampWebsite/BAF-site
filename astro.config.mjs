import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://belgian-activism-festi-camp.be',
  redirects: {
    '/': '/fr/',
    '/billetterie': '/fr/billetterie',
    '/programme': '/fr/programme',
    '/infos': '/fr/infos',
    '/financements': '/fr/financements',
    '/charte': '/fr/charte',
    '/autogestion': '/fr/autogestion',
    '/nous-aider': '/fr/nous-aider',
  },
});
