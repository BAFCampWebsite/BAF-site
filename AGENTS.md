# AGENTS.md

## Translations

- All strings that contain translatable language must come from the translation files. Do not hardcode these strings in HTML.
- We use i18n-ally and rely on the usage reporting and things like "keys in use", "keys not found", etc.
- Do not use `t.raw()` calls as this confuses the usage reporting. Access keys directly. For iterations, pre-fill your dictionaries/arrays with the translated text by directly accessing the keys before.
- Prefix Emojis should not be part of translations strings and should stay in source code.
- Keep URLs and link markup out of translation files. For links inside translated text, use `t.markup(key, { tags })` with a custom `<link>...</link>` tag in the JSON and map it to an `<a>` in the component, hardcoding the URL there. See CONTRIBUTING.md.

## Architecture

- Make separate components for highly repeatable items, or for very isolated parts which are better to keep out and organised separately.

## Design
- There's a design system in [the css sheet](public/style.css), use it and avoid unnecessary inline styles.
