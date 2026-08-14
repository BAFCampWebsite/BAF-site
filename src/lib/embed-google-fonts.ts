// Build-time helper for the print page: downloads the Google Fonts used by
// the site and returns @font-face CSS with the font files base64-embedded,
// so the PDF looks right even when there is no network at print time.
// Returns "" on failure — the caller then falls back to the regular @import.

// Same families as the @import at the top of public/style.css.
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Boogaloo&family=Libre+Baskerville:ital@0;1&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap";

// Google serves woff2 to modern user agents only.
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export async function getEmbeddedFontsCss(): Promise<string> {
  try {
    const response = await fetch(FONTS_URL, { headers: { "User-Agent": CHROME_UA } });
    if (!response.ok) throw new Error(`fonts.css status ${response.status}`);
    const css = await response.text();
    const faces = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
    if (!faces.length) throw new Error("no @font-face blocks in fonts.css");

    const embedded = await Promise.all(
      faces.map(async (face) => {
        const urlMatch = face.match(/url\((https:\/\/[^)]+)\)/);
        if (!urlMatch) return face;
        const fontResponse = await fetch(urlMatch[1]);
        if (!fontResponse.ok) throw new Error(`font status ${fontResponse.status}`);
        const base64 = Buffer.from(await fontResponse.arrayBuffer()).toString("base64");
        const mime = /format\('woff2'\)/.test(face) ? "font/woff2" : "font/woff";
        return face.replace(urlMatch[0], `url(data:${mime};base64,${base64})`);
      }),
    );
    return embedded.join("\n");
  } catch (error) {
    console.warn(
      `[programme-print] Font embedding failed, falling back to the @import: ` +
        (error instanceof Error ? error.message : String(error)),
    );
    return "";
  }
}
