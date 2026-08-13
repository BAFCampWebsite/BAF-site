import { getNowInfo, getNowPosition } from "./calendar-client";

/**
 * "Now" marker logic for the timeline view: keeps the line/chip aligned with
 * the visitor's clock and drives the "jump to now" button, which lives in
 * Programme.astro outside the calendar container.
 */
export function createTimelineNow(options: { container: HTMLElement | null }) {
  const { container } = options;
  const nowJumpWrap = document.querySelector("[data-now-jump-wrap]");
  const nowJumpButton = document.querySelector("[data-jump-to-now]");

  // "Jump to now" button under the hero: only visible while the timeline
  // marker is shown, and it scrolls the line to the vertical centre.
  function syncNowButton() {
    if (!nowJumpWrap) return;
    const hasLine = Boolean(container?.querySelector(".timeline-now:not([hidden])"));
    if (hasLine) {
      nowJumpWrap.removeAttribute("hidden");
    } else {
      nowJumpWrap.setAttribute("hidden", "");
    }
  }

  function jumpToNow() {
    const marker = container?.querySelector(".timeline-now:not([hidden])");
    if (!marker) return;
    const y = marker.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }

  // Keep the "now" marker on the timeline in sync with the visitor's clock.
  function updateNowMarkers() {
    const now = getNowInfo(new Date());
    const sections = container?.querySelectorAll(".timeline-day-section");
    sections?.forEach((section) => {
      const dayKey = section.getAttribute("data-day-key");
      const dayStart = Number(section.getAttribute("data-day-start"));
      const dayEnd = Number(section.getAttribute("data-day-end"));
      if (!dayKey || Number.isNaN(dayStart) || Number.isNaN(dayEnd)) return;
      const { top, visible } = getNowPosition(now, dayKey, dayStart, dayEnd);
      const topStyle = `top:${top}px;`;
      const line = section.querySelector(".timeline-now");
      const chip = section.querySelector(".timeline-now-time");
      [line, chip].forEach((el) => {
        if (!el) return;
        el.setAttribute("style", topStyle);
        if (visible) {
          el.removeAttribute("hidden");
        } else {
          el.setAttribute("hidden", "");
        }
      });
      if (visible && chip) chip.textContent = now.timeLabel;
    });
    syncNowButton();
  }

  // Re-align to the start of each minute so the marker never lags behind.
  function scheduleNowTick() {
    updateNowMarkers();
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000 + 50;
    setTimeout(scheduleNowTick, msToNextMinute);
  }

  nowJumpButton?.addEventListener("click", jumpToNow);
  scheduleNowTick();

  return { syncNowButton };
}
