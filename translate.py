import os, re, pathlib, deepl

API_KEY   = os.environ["DEEPL_API_KEY"]
LANGUAGES = {"en": "EN-GB", "nl": "NL"}

HTML_FILES = [
    "index.html", "programme.html", "infos.html",
    "autogestion.html", "billetterie.html", "charte.html",
    "financements.html", "nous-aider.html", "galerie.html",
]

translator = deepl.Translator(API_KEY)

def translate_html(html: str, target_lang: str) -> str:
    result = translator.translate_text(
        html,
        source_lang="FR",
        target_lang=target_lang,
        tag_handling="html",
        ignore_tags=["script", "style", "a"],
    )
    return result.text

def fix_links(html: str, lang: str) -> str:
    """Repointe les liens internes vers /en/ ou /nl/"""
    def replace(m):
        href = m.group(1)
        if href.startswith("http") or href.startswith("mailto") or href.startswith("#"):
            return m.group(0)
        return f'href="/{lang}/{href}"'
    return re.sub(r'href="([^"]+)"', replace, html)

def fix_lang_attr(html: str, lang: str) -> str:
    return html.replace('<html lang="fr">', f'<html lang="{lang}">', 1)

def fix_css_path(html: str) -> str:
    """Corrige le chemin du CSS"""
    return html.replace('href="style.css"', 'href="../style.css"')

def fix_asset_paths(html: str) -> str:
    """Corrige les src d'images et assets locaux"""
    def replace(m):
        src = m.group(1)
        if src.startswith("http") or src.startswith("data:") or src.startswith(".."):
            return m.group(0)
        return f'src="../{src}"'
    return re.sub(r'src="([^"]+)"', replace, html)

for filename in HTML_FILES:
    src = pathlib.Path(filename).read_text(encoding="utf-8")
    for lang, deepl_lang in LANGUAGES.items():
        print(f"Translating {filename} → {lang}...")
        translated = translate_html(src, deepl_lang)
        translated = fix_links(translated, lang)
        translated = fix_lang_attr(translated, lang)
        translated = fix_css_path(translated)
        translated = fix_asset_paths(translated)
        out = pathlib.Path(lang) / filename
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(translated, encoding="utf-8")
        print(f"  ✓ {out}")

print("Done.")
