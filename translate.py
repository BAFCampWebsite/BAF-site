import re, pathlib
from deep_translator import GoogleTranslator

LANGUAGES = {"en": "en", "nl": "nl"}

HTML_FILES = [
    "index.html", "programme.html", "infos.html",
    "autogestion.html", "billetterie.html", "charte.html",
    "financements.html", "nous-aider.html", "galerie.html",
]

def translate_html(html: str, target_lang: str) -> str:
    """Traduit uniquement le texte visible, pas les balises"""
    # Découpe le HTML en morceaux : balises vs texte
    parts = re.split(r'(<[^>]+>)', html)
    translated_parts = []
    translator = GoogleTranslator(source='fr', target=target_lang)
    for part in parts:
        if part.startswith('<') or part.strip() == '':
            # C'est une balise ou du vide → on touche pas
            translated_parts.append(part)
        else:
            try:
                translated_parts.append(translator.translate(part))
            except Exception:
                translated_parts.append(part)
    return ''.join(translated_parts)

def fix_links(html: str, lang: str) -> str:
    def replace(m):
        href = m.group(1)
        if href.startswith("http") or href.startswith("mailto") or href.startswith("#"):
            return m.group(0)
        return f'href="/{lang}/{href}"'
    return re.sub(r'href="([^"]+)"', replace, html)

def fix_lang_attr(html: str, lang: str) -> str:
    return html.replace('<html lang="fr">', f'<html lang="{lang}">', 1)

def fix_css_path(html: str) -> str:
    return html.replace('href="style.css"', 'href="../style.css"')

def fix_asset_paths(html: str) -> str:
    def replace(m):
        src = m.group(1)
        if src.startswith("http") or src.startswith("data:") or src.startswith(".."):
            return m.group(0)
        return f'src="../{src}"'
    return re.sub(r'src="([^"]+)"', replace, html)

for filename in HTML_FILES:
    src = pathlib.Path(filename).read_text(encoding="utf-8")
    for lang in LANGUAGES:
        out = pathlib.Path(lang) / filename
        if out.exists():
            print(f"  ⏭ {out} déjà traduit, skip")
            continue
        print(f"Translating {filename} → {lang}...")
        translated = translate_html(src, lang)
        translated = fix_links(translated, lang)
        translated = fix_lang_attr(translated, lang)
        translated = fix_css_path(translated)
        translated = fix_asset_paths(translated)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(translated, encoding="utf-8")
        print(f"  ✓ {out}")

print("Done.")
