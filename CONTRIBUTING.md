# Contributing

This page should explain to you what you need to do to be able to contribute.

## About Astro

Astro is a templating system. It allows you to split up big files and then run a command to combine and compile everything for you.

We are using this for the following reasons:

- It is _very_ simple
- Allows us to separate translations away from the code
- Allows us to split up and re-use repetitive HTML blocks
- The output is pre-rendered, meaning:
  - the result is extremely easy to put on the web
  - it will load fast and run on anything

## Translations

The website "design" and the actual text are split up in different folders. In the website, you will see the text's placeholders (identified by a "key") that like this: `t("mySection.aboutFoo")`.

The system will replace these placeholders at build time (before the deployment) by finding the value for the specified key in each of the language files under [src/i18n](src/i18n/).

! Note: if you're running the dev server, you will need to restart it if you want to see changes to translation files.

### About key structure

This setup is pretty freeform but there's one thing that's useful, and that's sticking to namespaces.

A key's structure is `namespace.optionalSubsections.name`. The dots represent nesting levels. The only thing that is required is that you use a namespace, and a key. You can have as many subsections as you'd want if you want to stay neat and organized.

To make sure that in your file, you're not repeating the same namespace 100 times, we choose the namespace at the top. e.g. for the `nav` component, and you want to use the key `nav.card.title` and also the `nav.card.subtitle`, you would use the following:

```astro
---
import { getTranslations } from '../i18n/getTranslations';

const t = getTranslations('nav');
---

<h1>{t('card.title')}</h1>
<p>{t('card.subtitle')}</p>
```

### Examples

#### Fixing existing translations

Did you notice an existing translation is wrong? You can fix it directly in the corresponding language file.

- Open [this folder](src/i18n/) and find the language file
- Find the text you're looking for
  - Either use the search function to find the text
  - Find the key
- Edit the file and commit it

#### Adding new text

This is very similar to the above, except you will need to define a key, and then add a value for it in all the translation files.

- Come up with a new key.
  - It's best to keep things organised.
    - If you're in an existing page, make it behind the namespace (e.g. if you see `getTranslations('billetterie');`, then the namespace is `billetterie`)
- Add the key in the translation files, and add the translated value.
  - If you want to add value for `billetterie.hero.subtitle`, you would add it someplace like this:

    ```json
    {
      "billetterie": {
        "hero": {
          "title": "Existing title",
          "subtitle": "This is a new paragraph about beautiful things"
          // [...] Other stuff
        }
      }
    }
    ```

- Use the new key in the page
  - If you're on a page that has a namespace, use it already (see the example in this [chapter](#about-key-structure))
    - In the billetterie namespace, you would use e.g. `<p>{t('hero.subtitle')}</p>`

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
- _If you added a new namespace_, make sure to add it to the [types.ts](src/i18n/types.ts) file
  Example:

```astro src/pages/[locale]/my-page.astro
---
// This does the /en /fr magic
export { getLocaleStaticPaths as getStaticPaths } from '../../i18n/getStaticPaths';

// Contains the navigation, footer, the CSS, etc.
import BaseLayout from '../../layouts/BaseLayout.astro';
//
import MyComponent from '../../components/MyComponent.astro';

const { lang, t } = Astro.props;
---

<BaseLayout
  title={t('myPage.title')}
  ...
>
  <MyComponent t={t} />
</BaseLayout>
```

## Calendar events

The events themselves are edited in the teamup.com calendar. That is the source of truth. If you need to change things, ask around for access.

These events get downloaded into the repo using the `npm run fetch:teamup` command, and there are two ways to run it. Locally, or using GitHub actions. The latter allows this process to run without a local machine.

### Local fetch

To fetch events from the Teamup calendar and save them as JSON on your machine locally, you need to configure a few environment variables first.

#### 1. Set up the environment variables

Create or update your local [.env](.env) file with the following values:

```env
TEAMUP_API_KEY=your-teamup-api-token
CALENDAR_ID=your-calendar-id
START_DATE=2026-08-01
END_DATE=2026-08-30
```

You can also provide these values through GitHub Actions secrets or environment variables when running in CI.

#### 2. Run the export script

From the project root, run:

```bash
npm run fetch:teamup
```

This will call the Teamup API and write the JSON output to [public/teamup-events.json](public/teamup-events.json).

### GitHub Actions Teamup sync

The Teamup update workflow runs automatically on a schedule (6am UTC), but it can also be triggered manually from GitHub Actions if you don't want to wait.

#### Trigger the action manually

You can trigger the action manually like so:

1. Open the repository on [GitHub and go to the Actions tab](https://github.com/BAFCampWebsite/BAF-site/actions).
2. Select the workflow named "Update Teamup events".
3. Click "Run workflow".
4. Choose the branch you want to use (usually `main`) and confirm.

The workflow will reset its state to the latest `main`, run the export script, and create a pull request if [public/teamup-events.json](public/teamup-events.json) changed.

#### Merge the resulting pull request

1. Open the [pull request created by the workflow](https://github.com/BAFCampWebsite/BAF-site/pulls?q=is%3Apr+is%3Aopen+chore%3A+update+Teamup+events). (it'll be called `chore: update Teamup events`)
2. Review the changes in [public/teamup-events.json](public/teamup-events.json) to confirm the update looks correct.
3. When ready, merge the pull request into the `main` branch.

A normal GitHub merge flow is fine here, but "Squash and merge" is often the cleanest option for this kind of automated update.
