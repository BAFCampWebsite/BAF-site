import re, pathlib, sys
from deep_translator import GoogleTranslator

LANGUAGES = {"en": "en", "nl": "nl"}
ALL_HTML_FILES = [
    "index.html", "programme.html", "infos.html",
    "autogestion.html", "billetterie.html", "charte.html",
    "financements.html", "nous-aider.html", "galerie.html",
]

# Séparateur très improbable à traduire
SEPARATOR = "XSEPX42XSEPX"

def translate_html(html: str, target_lang: str) -> str:
    parts = re.split(r'(<[^>]+>)', html)

    texts_to_translate = []
    indices = []
    for i, part in enumerate(parts):
        if not part.startswith('<') and part.strip() != '':
            texts_to_translate.append(part)
            indices.append(i)

    if not texts_to_translate:
        return html

    print(f"    → {len(texts_to_translate)} fragments à traduire")

    try:
        translator = GoogleTranslator(source='fr', target=target_lang)
        translated_texts = translator.translate_batch(texts_to_translate)
        
        # Fallback si un fragment revient None
        translated_texts = [
            t if t is not None else original
            for t, original in zip(translated_texts, texts_to_translate)
        ]
    except Exception as e:
        print(f"    ⚠ Erreur: {e}, fichier gardé en français")
        return html

    for idx, translated_text in zip(indices, translated_texts):
        parts[idx] = translated_text

    return ''.join(parts)

def fix_links(html: str, lang: str) -> str:
    def replace(m):
        href = m.group(1)
        if href.startswith("http") or href.startswith("mailto") or href.startswith("#") or href.startswith("/") or href.startswith(".."):
            return m.group(0)
        return f'href="/{lang}/{href}"'
    return re.sub(r'href="([^"]+)"', replace, html)

def fix_lang_attr(html: str, lang: str) -> str:
    return html.replace('<html lang="fr">', f'<html lang="{lang}">', 1)

def fix_css_path(html: str) -> str:
    return re.sub(r'href="[^"]*style\.css"', 'href="../style.css"', html)

def fix_asset_paths(html: str) -> str:
    def replace(m):
        src = m.group(1)
        if src.startswith("http") or src.startswith("data:") or src.startswith("..") or src.startswith("/"):
            return m.group(0)
        return f'src="../{src}"'
    return re.sub(r'src="([^"]+)"', replace, html)

files_to_translate = sys.argv[1:] if len(sys.argv) > 1 else ALL_HTML_FILES

for filename in files_to_translate:
    path = pathlib.Path(filename)
    if not path.exists():
        print(f"  ⚠ {filename} introuvable, skip")
        continue
    src = path.read_text(encoding="utf-8")
    for lang in LANGUAGES:
        out = pathlib.Path(lang) / filename
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
