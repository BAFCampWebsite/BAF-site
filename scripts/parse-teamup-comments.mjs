// Parses Teamup event comments into structured fields on each event.
//
// Convention (set on the teamup.com calendar):
//   - Language comment : always starts with NL/FR/EN, e.g. "FR (interpreted to NL, EN)"
//   - Child-friendly   : starts with 🧒, e.g. "🧒 8+" (legacy 👶 prefix also accepted)
//   - Warnings         : starts with ⚠️, e.g. "⚠️ physical, violence"
//
// Comments that match none of these prefixes are kept in a `comments` fallback
// array so no data is silently dropped.

const LANGUAGE_RE = /^(NL|FR|EN)\b/i;
const CHILD_RE = /^[👶🧒]/u; // 🧒 current convention; legacy 👶 accepted
const WARNING_RE = /^⚠\uFE0F?/u; // ⚠ with optional variation selector

export function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function stripPrefix(value, prefixRe) {
  return value.replace(prefixRe, "").replace(/^[\s:：-]+/, "").trim();
}

export function parseComments(events) {
  for (const event of events) {
    if (!Array.isArray(event.comments)) continue;

    let language = "";
    let childFriendly = "";
    let warnings = "";
    const other = [];

    for (const comment of event.comments) {
      const message = stripHtml(comment?.message);
      if (!message) continue;

      if (LANGUAGE_RE.test(message)) {
        if (!language) language = message;
      } else if (CHILD_RE.test(message)) {
        const value = stripPrefix(message, CHILD_RE);
        if (value) childFriendly = childFriendly ? `${childFriendly}, ${value}` : value;
      } else if (WARNING_RE.test(message)) {
        const value = stripPrefix(message, WARNING_RE);
        if (value) warnings = warnings ? `${warnings}, ${value}` : value;
      } else {
        other.push(message);
      }
    }

    delete event.comments;
    if (language) event.language = language;
    if (childFriendly) event.childFriendly = childFriendly;
    if (warnings) event.warnings = warnings;
    if (other.length) event.comments = other.map((message) => ({ message }));
  }
}
