export function escapeHtml(value: unknown) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeIcsText(value: unknown) {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/\n/g, "\\n")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function toIcsDate(value: string | Date) {
  const date = new Date(value);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function createCalendarFile(event: Record<string, unknown>) {
  const title = (event.title || "Untitled event").replace(/\r?\n/g, " ");
  const location = (event.location || "").replace(/\r?\n/g, " ");
  const description = (event.notesText || event.notes || "").replace(/\r?\n/g, "\n");
  const start = toIcsDate(event.start_dt as string);
  const end = toIcsDate(event.end_dt as string);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BAF//Programme//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id || Date.now()}@baf-site`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : "",
    location ? `LOCATION:${escapeIcsText(location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
}

type TimelineEvent = {
  id: string | number;
  title?: string;
  start_dt: string;
  end_dt: string;
  timeLabel?: string;
  dayLabel?: string;
  location?: string;
  locationKey?: string;
  dayKey: string;
  labels?: string[];
  accents?: string[];
  languageNote?: string;
  previewText?: string;
  isPlaceholder?: boolean;
  notesText?: string;
  notes?: string;
  who?: string;
  realDateLabel?: string;
  dateLabel?: string;
};

export function renderCard(event: TimelineEvent) {
  const title = escapeHtml(event.title || "Untitled event");
  const timeLabel = escapeHtml(event.timeLabel || "");
  const location = event.location ? escapeHtml(event.location) : "";
  const who = event.who ? escapeHtml(event.who) : "";
  const languageNote = event.languageNote ? escapeHtml(event.languageNote) : "";
  const preview = event.previewText ? escapeHtml(event.previewText) : "";
  const previewClass = event.isPlaceholder ? "calendar-card-preview is-placeholder" : "calendar-card-preview";
  const accent = (event.accents && event.accents[0]) || "var(--rose)";
  const badges = (event.labels || [])
    .map((label, i) => {
      const bg = (event.accents && event.accents[i]) || "var(--rose)";
      return `<span class="calendar-card-category" style="background:${bg};">${escapeHtml(label)}</span>`;
    })
    .join("");

  return `
    <article class="calendar-card" data-event-id="${event.id}" style="border-left-color:${accent};">
      <div class="calendar-card-top">
        <span class="calendar-card-time">${timeLabel}</span>
        <div class="calendar-card-top-right">
          <div class="calendar-card-categories">${badges}</div>
        </div>
      </div>
      <h3>${title}</h3>
      <div class="calendar-card-meta-grid">
        ${languageNote ? `<div class="calendar-card-meta-item"><span>💬</span><span class="calendar-card-language">${languageNote}</span></div>` : ""}
        ${location ? `<div class="calendar-card-meta-item"><span>🎪</span><span>${location}</span></div>` : ""}
        ${who ? `<div class="calendar-card-meta-item"><span>👤</span><span>${who}</span></div>` : ""}
      </div>
      ${preview ? `<p class="${previewClass}">${preview}</p>` : ""}
    </article>
  `;
}

export function renderListEvent(event: TimelineEvent, addToCalendarLabel: string) {
  const title = escapeHtml(event.title || "Untitled event");
  const timeLabel = escapeHtml(event.timeLabel || "");
  const location = event.location ? escapeHtml(event.location) : "";
  const who = event.who ? escapeHtml(event.who) : "";
  const languageNote = event.languageNote ? escapeHtml(event.languageNote) : "";
  const notes = event.notesText ? escapeHtml(event.notesText).replace(/\n/g, "<br>") : "";
  const accent = (event.accents && event.accents[0]) || "var(--rose)";
  const badges = (event.labels || [])
    .map((label, i) => {
      const bg = (event.accents && event.accents[i]) || "var(--rose)";
      return `<span class="calendar-list-badge" style="background:${bg};">${escapeHtml(label)}</span>`;
    })
    .join("");

  return `
    <article class="calendar-list-item" data-event-id="${event.id}" style="border-left-color:${accent};">
      <div class="calendar-list-head">
        <div class="calendar-list-head-left">
          <span class="calendar-list-time">${timeLabel}</span>
          <button type="button" class="calendar-modal-action calendar-list-add" data-add-to-calendar>${escapeHtml(addToCalendarLabel)}</button>
        </div>
        <div class="calendar-list-badges">${badges}</div>
      </div>
      <h3 class="calendar-list-title">${title}</h3>
      <div class="calendar-list-body">
        <div class="calendar-list-meta">
          ${location ? `<div class="calendar-list-meta-item"><span>🎪</span><span>${location}</span></div>` : ""}
          ${who ? `<div class="calendar-list-meta-item"><span>👤</span><span>${who}</span></div>` : ""}
          ${languageNote ? `<div class="calendar-list-meta-item"><span>💬</span><span class="calendar-list-language">${languageNote}</span></div>` : ""}
        </div>
        ${notes ? `<p class="calendar-list-notes">${notes}</p>` : ""}
      </div>
    </article>
  `;
}

export function renderList(visibleEvents: TimelineEvent[], activeDay: string, addToCalendarLabel: string) {
  if (activeDay !== "all") {
    return `<div class="calendar-list">${visibleEvents.map((e) => renderListEvent(e, addToCalendarLabel)).join("")}</div>`;
  }
  const dayKeys = [...new Set(visibleEvents.map((e) => e.dayKey))];
  return dayKeys
    .map((dayKey) => {
      const dayEvents = visibleEvents.filter((e) => e.dayKey === dayKey);
      const dayLabel = escapeHtml(dayEvents[0].dayLabel || dayKey);
      return `
        <div class="calendar-day-section">
          <h2 class="calendar-day-heading">${dayLabel}</h2>
          <div class="calendar-list">${dayEvents.map((e) => renderListEvent(e, addToCalendarLabel)).join("")}</div>
        </div>
      `;
    })
    .join("");
}

export function getMinutes(value: string | Date) {
  const date = new Date(value);
  const brussels = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Brussels",
  }).format(date);
  const [hh, mm] = brussels.split(":").map(Number);
  return hh * 60 + mm;
}

export function getLocationLabel(event: TimelineEvent, noLocationLabel: string) {
  const loc = String(event.location || "").trim();
  return loc ? loc : noLocationLabel;
}

export function getDayMinutes(value: string | Date, dayKey: string) {
  const date = new Date(value);
  const brusselsDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
  }).format(date);
  const mins = getMinutes(value);
  const eventDay = new Date(brusselsDate + "T00:00:00Z").getTime();
  const keyDay = new Date(dayKey + "T00:00:00Z").getTime();
  const diffDays = Math.round((eventDay - keyDay) / 86400000);
  return mins + diffDays * 24 * 60;
}

export type TimelineNow = {
  brusselsDayKey: string;
  minutes: number;
  timeLabel: string;
};

// Current time (browser clock) expressed in the festival's Brussels time zone,
// using the same "day" convention as the event day keys (events before 3am
// belong to the previous festival day).
export function getNowInfo(date: Date): TimelineNow {
  const minutes = getMinutes(date);
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
  const mi = String(minutes % 60).padStart(2, "0");
  return {
    brusselsDayKey: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Brussels",
    }).format(date),
    minutes,
    timeLabel: `${hh}:${mi}`,
  };
}

// Position of "now" on a given day's timeline, in the same minute-of-day
// convention as getDayMinutes (minutes past midnight roll over into the next
// day, e.g. 01:30 of the following calendar day maps to 1470).
export function getNowPosition(
  now: TimelineNow,
  dayKey: string,
  dayStart: number,
  dayEnd: number,
) {
  const nowDay = new Date(now.brusselsDayKey + "T00:00:00Z").getTime();
  const keyDay = new Date(dayKey + "T00:00:00Z").getTime();
  const diffDays = Math.round((nowDay - keyDay) / 86400000);
  const nowMin = now.minutes + diffDays * 24 * 60;
  return { top: nowMin - dayStart, visible: nowMin >= dayStart && nowMin <= dayEnd };
}

import { getTentKey, TENT_KEYS } from "./calendar";

export function renderTimelineEvent(event: TimelineEvent, dayStartMin: number, dayKey: string, showLocation = false) {
  const startMin = getDayMinutes(event.start_dt, dayKey);
  const endMin = getDayMinutes(event.end_dt, dayKey);
  const top = startMin - dayStartMin;
  const height = Math.max(endMin - startMin, 34);
  const accent = (event.accents && event.accents[0]) || "var(--rose)";
  const title = escapeHtml(event.title || "Untitled event");
  const timeLabel = escapeHtml(event.timeLabel || "");
  const location = event.location ? escapeHtml(String(event.location).trim()) : "";
  const languageNote = event.languageNote ? escapeHtml(event.languageNote) : "";
  const badges = (event.labels || [])
    .map((label, i) => {
      const bg = (event.accents && event.accents[i]) || "var(--rose)";
      return `<span class="timeline-event-badge" style="background:${bg};">${escapeHtml(label)}</span>`;
    })
    .join("");

  return `
    <div
      class="timeline-event"
      data-event-id="${event.id}"
      style="top:${top}px;height:${height}px;border-left-color:${accent};"
      title="${title}"
    >
      <div class="timeline-event-head">
        <span class="timeline-event-time">${timeLabel}</span>
        <span class="timeline-event-badges">${badges}</span>
      </div>
      ${languageNote ? `<span class="timeline-event-language">💬 ${languageNote}</span>` : ""}
      ${showLocation && location ? `<span class="timeline-event-location">${location}</span>` : ""}
      <span class="timeline-event-title">${title}</span>
    </div>
  `;
}

export function renderTimelineDay(dayKey: string, dayEvents: TimelineEvent[], noLocationLabel: string, otherLabel: string, now: TimelineNow | null = null) {
  const startTimes = dayEvents.map((e) => getDayMinutes(e.start_dt, dayKey));
  const endTimes = dayEvents.map((e) => getDayMinutes(e.end_dt, dayKey));
  let dayStart = Math.floor(Math.min(...startTimes) / 60) * 60;
  let dayEnd = Math.max(Math.ceil(Math.max(...endTimes) / 60) * 60, Math.max(...endTimes) + 30);
  if (dayEnd <= dayStart) dayEnd = dayStart + 24 * 60;

  const hourLabels = [];
  for (let m = dayStart; m <= dayEnd; m += 60) {
    const hh = String((Math.floor(m / 60) % 24)).padStart(2, "0");
    hourLabels.push(`<span class="timeline-hour" style="top:${m - dayStart}px;">${hh}:00</span>`);
  }

  const presentTents = Array.from(
    new Set(dayEvents.map((e) => getTentKey(e.location)))
  );
  const tents = TENT_KEYS.filter((key) => presentTents.includes(key));
  if (tents.length === 0) tents.push("other");

  const headers = tents
    .map((tentKey) => {
      if (tentKey === "other") {
        const label = escapeHtml(otherLabel);
        return `<div class="timeline-loc-header" title="${label}">${label}</div>`;
      }
      const sample = dayEvents.find((e) => getTentKey(e.location) === tentKey);
      const label = escapeHtml(getLocationLabel(sample, noLocationLabel));
      return `<div class="timeline-loc-header" title="${label}">${label}</div>`;
    })
    .join("");

  const tracks = tents
    .map((tentKey) => {
      const events = dayEvents.filter((e) => getTentKey(e.location) === tentKey);
      const showLocation = tentKey === "other";
      const inner = events.map((e) => renderTimelineEvent(e, dayStart, dayKey, showLocation)).join("");
      return `<div class="timeline-track">${inner}</div>`;
    })
    .join("");

  const heightPx = dayEnd - dayStart;
  const dayLabel = escapeHtml(dayEvents[0].dayLabel || dayKey);
  const minWidth = Math.max(tents.length * 200 + 70, 520);

  const nowMarkup = now
    ? (() => {
        const { top, visible } = getNowPosition(now, dayKey, dayStart, dayEnd);
        return `
        <div class="timeline-now" style="top:${top}px;" ${visible ? "" : "hidden"} aria-hidden="true">
          <span class="timeline-now-time">${now.timeLabel}</span>
        </div>
      `;
      })()
    : "";

  return `
    <div class="timeline-day-section" data-day-key="${dayKey}" data-day-start="${dayStart}" data-day-end="${dayEnd}">
      <h2 class="calendar-day-heading">${dayLabel}</h2>
      <div class="timeline-scroll">
        <div class="timeline" style="min-width:${minWidth}px;">
          <div class="timeline-header">
            <div class="timeline-corner"></div>
            ${headers}
          </div>
          <div class="timeline-body" style="height:${heightPx}px;">
            <div class="timeline-gutter">${hourLabels.join("")}</div>
            ${tracks}
            ${nowMarkup}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderTimeline(visibleEvents: TimelineEvent[], activeDay: string, noLocationLabel: string, otherLabel: string, now: TimelineNow | null = null) {
  if (activeDay !== "all") {
    return renderTimelineDay(activeDay, visibleEvents, noLocationLabel, otherLabel, now);
  }
  const dayKeys = [...new Set(visibleEvents.map((e) => e.dayKey))];
  return dayKeys
    .map((dayKey) => renderTimelineDay(dayKey, visibleEvents.filter((e) => e.dayKey === dayKey), noLocationLabel, otherLabel, now))
    .join("");
}
