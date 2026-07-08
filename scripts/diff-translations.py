#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.10"
# ///
"""Convert source HTML and dist HTML to markdown for manual comparison."""

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["autogestion", "billetterie", "charte", "financements", "infos", "nous-aider", "programme"]

SMART_QUOTES = str.maketrans({
    "\u2018": "'", "\u2019": "'",
    "\u201c": '"', "\u201d": '"',
})


def md_from_html(html_path: Path) -> str:
    result = subprocess.run(
        ["npx", "html-to-markdown", str(html_path), "--stdout"],
        capture_output=True, text=True, cwd=ROOT,
    )
    text = result.stdout.strip()
    text = text.translate(SMART_QUOTES)
    text = text.replace("\\&amp;", "&")
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&#x27;|&amp;#x27;", "'", text)
    text = re.sub(r"&#x([0-9a-fA-F]+);", lambda m: chr(int(m.group(1), 16)), text)
    return text


OUT = ROOT / "compare"
for slug in PAGES:
    for locale in ("fr", "en", "nl"):
        src = ROOT / f"{slug}.html" if locale == "fr" else ROOT / locale / f"{slug}.html"
        dst = ROOT / "dist" / locale / slug / "index.html"

        if not src.exists() or not dst.exists():
            continue

        out_dir = OUT / locale / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "source.md").write_text(md_from_html(src) + "\n")
        (out_dir / "dist.md").write_text(md_from_html(dst) + "\n")

print(f"Markdown files written to {OUT}/")