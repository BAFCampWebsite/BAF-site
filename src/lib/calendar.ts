export const SUBCALENDAR_ID_MAP = {
  "15782183": "CONFERENCE",
  "15782182": "FILM",
  "15766557": "MUSIC",
  "15782184": "THEATRE",
  "15766558": "WORKSHOPS",
} as const;

type Category = keyof typeof SUBCALENDAR_ID_MAP;

const defaultCategory = "WORKSHOPS";

export function buildCategoryMeta(t: (key: string) => string) {
  return {
    CONFERENCE: { accent: "var(--rose)", label: t("calendar.filters.conference") },
    FILM: { accent: "var(--bleu)", label: t("calendar.filters.film") },
    MUSIC: { accent: "#9b4d4d", label: t("calendar.filters.music") },
    THEATRE: { accent: "#3f6f4f", label: t("calendar.filters.theatre") },
    WORKSHOPS: { accent: "#5e4b9b", label: t("calendar.filters.workshops") },
  };
}

export type CategoryMeta = ReturnType<typeof buildCategoryMeta>;

export const TENT_KEYS = [
  "chezgeorges",
  "lestaca",
  "cinema",
  "workshop",
  "point",
  "jam",
  "peoplepower",
  // "moving",
  // "chill",
  "other",
] as const;

export type TentKey = (typeof TENT_KEYS)[number];

export function getTentKey(location: string | undefined): TentKey {
  const loc = String(location || "").trim().toLowerCase();
  if (loc.includes("chez georges")) return "chezgeorges";
  if (loc.includes("estaca")) return "lestaca";
  if (loc.includes("cinema") || loc.includes("ciné")) return "cinema";
  if (loc.includes("workshop") || loc.includes("atelier")) return "workshop";
  if (loc.includes("point")) return "point";
  if (loc.includes("jam")) return "jam";
  if (loc.includes("people power")) return "peoplepower";
  // if (loc.includes("moving")) return "moving";
  // if (loc.includes("chill")) return "chill";
  return "other";
}

export function getNotesText(notes: unknown = "") {
  const normalized = String(notes || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return normalized;
}

export function getFirstCommentText(comments: { message?: string }[] = []) {
  if (!comments?.length) return "";
  return getNotesText(comments[0].message || "");
}

export function buildCalendarEvents(
  rawEvents: Record<string, unknown>[],
  lang: string,
  categoryMeta: CategoryMeta,
  workshopsLabel: string,
) {
  return rawEvents
    .map((event) => {
      const start = new Date(event.start_dt as string);
      const end = new Date(event.end_dt as string);
      const notesText = getNotesText(event.notes);
      const languageNote = getFirstCommentText(event.comments as { message?: string }[]);
      const previewText = notesText ? notesText.split(/\r?\n/)[0].trim() : "";

      const brusselsParts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Europe/Brussels",
      }).formatToParts(start);
      const brParts = (type: string) => brusselsParts.find((p) => p.type === type)?.value;
      const brYear = Number(brParts("year"));
      const brMonth = Number(brParts("month"));
      const brDay = Number(brParts("day"));
      const brHour = Number(brParts("hour"));

      const realDay = new Date(Date.UTC(brYear, brMonth - 1, brDay));
      const effectiveDay = new Date(realDay);
      if (brHour < 3) effectiveDay.setUTCDate(effectiveDay.getUTCDate() - 1);

      const dayKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "UTC",
      }).format(effectiveDay);
      const dayLabel = new Intl.DateTimeFormat(lang, {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(effectiveDay);

      const dateLabel = new Intl.DateTimeFormat(lang, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(effectiveDay);

      const realDateLabel = new Intl.DateTimeFormat(lang, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(realDay);

      const timeLabel = `${start.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Europe/Brussels",
      })} — ${end.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Europe/Brussels",
      })}`;

      const ids = (event.subcalendar_ids as unknown[])?.length
        ? (event.subcalendar_ids as unknown[])
        : [event.subcalendar_id];

      const seen = new Set<string>();
      const cats: Category[] = [];
      ids.forEach((id) => {
        const cat = SUBCALENDAR_ID_MAP[String(id)] ?? defaultCategory;
        if (seen.has(cat)) return;
        seen.add(cat);
        cats.push(cat);
      });
      cats.sort((a) => (a === "FILM" ? -1 : 1));

      return {
        ...event,
        categories: cats,
        accents: cats.map((c) => categoryMeta[c]?.accent ?? "var(--gris-encre)"),
        labels: cats.map((c) => categoryMeta[c]?.label ?? workshopsLabel),
        locationKey: getTentKey(event.location as string),
        dayKey,
        dayLabel,
        dateLabel,
        realDateLabel,
        timeLabel,
        notesText,
        previewText,
        languageNote,
        isPlaceholder: !previewText,
      };
    })
    .sort((a, b) => new Date(a.start_dt as string) - new Date(b.start_dt as string));
}

export function buildDayFilters(
  events: { dayKey: string }[],
  lang: string,
) {
  return Array.from(new Set(events.map((event) => event.dayKey))).map((dayKey) => {
    const date = new Date(dayKey);
    return {
      dayKey,
      label: new Intl.DateTimeFormat(lang, {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(date),
    };
  });
}

export function buildLocationFilters(
  events: { location?: unknown }[],
  noLocationLabel: string,
  otherLabel: string,
) {
  const presentTents = new Set(events.map((event) => getTentKey(event.location as string)));
  const tents = TENT_KEYS.filter((key) => presentTents.has(key));
  if (tents.length === 0) tents.push("other");

  return tents.map((tentKey) => {
    const sample = events.find((event) => getTentKey(event.location as string) === tentKey);
    const raw = String(sample?.location || "").trim();
    const label = tentKey === "other" ? otherLabel : raw || noLocationLabel;
    return {
      locationKey: tentKey,
      label,
    };
  });
}
