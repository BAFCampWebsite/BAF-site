import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import nl from '../i18n/nl.json';

export const locales = [
  { lang: 'fr', t: fr },
  { lang: 'en', t: en },
  { lang: 'nl', t: nl },
];

export function pagePaths(slug = '') {
  return locales.map(({ lang, t }) => ({
    params: { locale: lang },
    props: { lang, t, slug },
  }));
}
