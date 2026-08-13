import { escapeHtml, downloadCalendarEvent, type TimelineEvent } from "./calendar-client";

export type EventModalLabels = {
  date?: string;
  time?: string;
  language?: string;
  location?: string;
  hostedBy?: string;
  age?: string;
  warnings?: string;
};

/**
 * Event detail modal shared by every calendar view. The dialog markup lives
 * in EventModal.astro; this wires open/close, the add-to-calendar action and
 * dismissal (close buttons, backdrop click, Escape).
 */
export function createEventModal(options: { addToCalendarLabel: string; labels: EventModalLabels }) {
  const { addToCalendarLabel, labels } = options;
  const modal = document.getElementById("eventModal");
  const modalContent = document.getElementById("eventModalContent");
  const closeButtons = Array.from(document.querySelectorAll("[data-close-modal]"));
  let activeEvent: TimelineEvent | null = null;

  function openModal(event: TimelineEvent) {
    if (!modal || !modalContent) return;
    activeEvent = event;
    const title = escapeHtml(event.title || "Untitled event");
    const dateLabel = escapeHtml(event.realDateLabel || event.dayLabel || event.dateLabel || "");
    const timeLabel = escapeHtml(event.timeLabel || "");
    const location = event.location ? escapeHtml(event.location) : "";
    const who = event.who ? escapeHtml(event.who) : "";
    const language = event.language ? escapeHtml(event.language) : "";
    const childFriendly = event.childFriendly ? escapeHtml(event.childFriendly) : "";
    const warnings = event.warnings ? escapeHtml(event.warnings) : "";
    const notes = event.notesText ? escapeHtml(event.notesText).replace(/\n/g, "<br>") : "";
    const modalBadges = (event.labels || [])
      .map((label, i) => {
        const bg = (event.accents && event.accents[i]) || "var(--rose)";
        return `<span class="calendar-modal-badge" style="background:${bg};">${escapeHtml(label)}</span>`;
      })
      .join("") || `<span class="calendar-modal-badge" style="background:var(--rose);">Event</span>`;

    modalContent.innerHTML = `
      <div class="calendar-modal-body">
        <div class="calendar-modal-badges">${modalBadges}</div>
        <h3 id="eventModalTitle" class="calendar-modal-title">${title}</h3>
        <div class="calendar-modal-meta">
          <div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.date || "Date")}</strong><span>${dateLabel}</span></div>
          <div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.time || "Time")}</strong><span>${timeLabel}</span></div>
          ${language ? `<div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.language || "Language")}</strong><span class="calendar-modal-info">${language}</span></div>` : ""}
          ${childFriendly ? `<div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.age || "Age")}</strong><span class="calendar-modal-info">${childFriendly}</span></div>` : ""}
          ${warnings ? `<div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.warnings || "Warnings")}</strong><span class="calendar-modal-info">${warnings}</span></div>` : ""}
          ${location ? `<div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.location || "Location")}</strong><span>${location}</span></div>` : ""}
          ${who ? `<div class="calendar-modal-meta-item"><strong>${escapeHtml(labels.hostedBy || "Hosted by")}</strong><span>${who}</span></div>` : ""}
        </div>
        ${notes ? `<p class="calendar-modal-notes">${notes}</p>` : ""}
        <button type="button" class="calendar-modal-action" data-add-to-calendar>${addToCalendarLabel}</button>
      </div>
    `;

    const addToCalendarButton = modalContent.querySelector("[data-add-to-calendar]");
    addToCalendarButton?.addEventListener("click", (event) => {
      event.preventDefault();
      if (activeEvent) {
        downloadCalendarEvent(activeEvent);
      }
    });

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    activeEvent = null;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  closeButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  return { openModal, closeModal };
}
