import { locales } from './getTranslations';

// Generates static paths for each locale defined in the `locales` array.
export function getLocaleStaticPaths() {
    return locales.map(locale => ({ params: { locale } }));
}
