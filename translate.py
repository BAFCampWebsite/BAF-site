import os, re, pathlib, deepl

API_KEY   = os.environ["DEEPL_API_KEY"]
LANGUAGES = {"en": "EN-GB", "nl": "NL"}

# Fichiers à traduire
HTML_FILES = [
    "index.html", "programme.html", "infos.html",
    "autogestion.html", "billetterie.html", "charte.html",
    "financements.html", "nous-aider.html", "galerie.html",
]

# Ce qu'on NE traduit PAS (URLs, classes CSS, emojis seuls...)
SKIP_TAGS = re.compile(
    r'(<(script|style)[^>]*>.*?</\2>|<!--.*?-->)',
    re.DOTALL
)

translator = deepl.Translator(API_KEY)

def translate_html(html: str, target_lang: str) -> str:
    result = translator.translate_text(
        html,
        source_lang="FR",
        target_lang=target_lang,
        tag_handling="html",        # ← DeepL respecte les balises HTML
        ignore_tags=["script","style","a"],  # ne traduit pas href etc.
    )
    return result.text

def fix_links(html: str, lang: str) -> str:
    """Repointe les liens internes vers /en/ ou /nl/"""
    def replace(m):
        href = m.group(1)
        # liens externes ou ancres → on touche pas
        if href.startswith("http") or href.startswith("mailto") or href.startswith("#"):
            return m.group(0)
        return f'href="/{lang}/{href}"'
    return re.sub(r'href="([^"]+)"', replace, html)

def fix_lang_attr(html: str, lang: str) -> str:
    return html.replace('<html lang="fr">', f'<html lang="{lang}">', 1)

for filename in HTML_FILES:
    src = pathlib.Path(filename).read_text(encoding="utf-8")
    for lang, deepl_lang in LANGUAGES.items():
        print(f"Translating {filename} → {lang}...")
        translated = translate_html(src, deepl_lang)
        translated = fix_links(translated, lang)
        translated = fix_lang_attr(translated, lang)
        out = pathlib.Path(lang) / filename
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(translated, encoding="utf-8")
        print(f"  ✓ {out}")

print("Done.")
