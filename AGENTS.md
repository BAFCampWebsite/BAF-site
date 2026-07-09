# AGENTS.md

## Translations

- We use i18n-ally and rely on the usage reporting and things like "keys in use", "keys not found", etc.
- Do not use `t.raw()` calls as this confuses the usage reporting. Access keys directly. For iterations, pre-fill your dictionaries/arrays with the translated text by directly accessing the keys before.
- Prefix Emojis should not be part of translations strings and should stay in source code.

## Architecture

- Make separate components for highly repeatable items, or for very isolated parts which are better to keep out and organised separately.
- the `old_html/` directory is a historical artifact and is there just for comparison purposes, don't bother considering it for any actual work.
