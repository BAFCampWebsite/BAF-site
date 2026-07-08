# Contributing

This page should explain to you what you need to do to be able to contribute.

## Translations

The website "design" and the actual text are split up in different folders. In the website, you will see text placeholders that like this: `t("mySection.aboutFoo")`.

The system will replace these placeholders at build time (before the deployment) by finding the value in each of the language files under [src/i18n](src/i18n/).

### Structure

For convenience, each component has its own "namespace" (the top-level object).

To make sure that in your file, you're not repeating the same prefix 100 times, we choose the namespace at the top. e.g. for the `nav` component, and you want to use the key `nav.card.title` and also the `nav.card.subtitle`, you would use the following:

```astro
---
const t = getTranslations('nav');
---
<h1>{t('card.title')}</h1>
<p>{t('card.subtitle')}</p>
```

### Adding languages

If we decide to add more, there are a few things that will need to be added

- Create new JSON file in [src/i18n/](src/i18n/)
- Adjust `getStaticPaths` in each file under [pages](src/pages/)
- Update the [Nav component](src/components/Nav.astro) to include a new language
- Adjust the i18n-ally plugin config in
- Update the [script for validation](scripts/validate-translations.mjs) to include the new json file

## Linking to pages

Make sure to include the language prefix when making links. This way you won't always get sent to the index, and actually get the translation of the same page.

```astro
---
import { getLocale } from 'astro-intl';
const lang = getLocale();
const p = `/${lang}`; // <- This is the language prefix. e.g. `/fr`, `/en`, etc.
---
<!-- And then someplace in your code... -->
    <a href={`${p}/myPage`}>{t('programme')}</a>
```

## Adding pages

To add a new page, you need to follow the following steps:

- Define a new page under [src/pages/[locale]](src/pages/[locale]/)
- Develop the page (See example below)
  - Make your components in [src/components/](src/components/)
  - Import your components on your page file
  - Adjust the `<BaseLayout>` to include your components in the order you want.
- Add links to the page (see [chapter above](#linking-to-pages))

Example:

```astro src/pages/[locale]/my-page.astro
---
export { getLocaleStaticPaths as getStaticPaths } from "../../i18n/getStaticPaths";

import BaseLayout from '../../layouts/BaseLayout.astro';
import MyComponent from '../../components/MyComponent.astro';

const { lang, t } = Astro.props;
---

<BaseLayout title={t('myPage.title')} ...>
  <MyComponent t={t} />
</BaseLayout>
```

## Other Technicalities
