# Programme calendar (CALENDAR.md)

The programme calendar is the most JS-heavy part of the site: the three views
(timeline, cards, list) are rendered **client-side** into `#calendarEvents`
from string templates. The `.astro` components only provide the shell, the
styles and the data.

**ALWAYS KEEP THIS FILE UP TO DATE AND ADJUST IT IF SOMETHING MENTIONED CHANGES**

## File map

| File | Role |
|------|------|
| `src/components/ProgrammeCalendar.astro` | Orchestrator. Builds the data in frontmatter, renders the shell (special card, toolbar, grid container + `data-calendar-data` JSON blob), imports **all** calendar styles, and holds the shared client state: filters, search, view switching, URL sync. |
| `src/components/CalendarFilters.astro` | Filter panel markup (day / type / children / location / search rows). |
| `src/components/EventModal.astro` | Static event-detail dialog; its content is injected by `calendar-modal.ts`. |
| `src/components/PrintInstructions.astro` | Shared “how to print” callout, rendered into the `instructions` slot of `PrintLayout.astro`; used by both print pages (pass `portrait` on the list page to pick the A4-portrait wording). |
| `src/components/PrintCover.astro` | Full-page title page for the list print export: BAF logo (base64-inlined), “Festival Programme” label, programme title and festival dates. Rendered first on the cover sheet; `print-list.css` gives it `min-height: 277mm` and a page break after. |
| `src/pages/[locale]/programme-print.astro` | Print-only page: the full timeline, server-rendered at build time with all CSS inlined (no client JS, no external assets) so it can be converted to PDF straight from `file://`. Uses the `PrintLayout.astro` shell. Excluded from the sitemap. |
| `src/pages/[locale]/programme-print-list.astro` | Print-only page: the full programme as a portrait-A4 list (days flow one after another, events grouped by day then by place, full descriptions). Same shell as the timeline export; excluded from the sitemap. |
| `src/layouts/PrintLayout.astro` | Reusable shell for print-first pages: emits a self-contained HTML document (inlined stylesheet: site `:root`/fonts + the page's stylesheets, `print.css` rules, and their screen copy so browser ≈ PDF) plus an optional “how to print” callout. See its header comment for the props and slots. |
| `src/lib/calendar.ts` | Data prep shared by build and client code: event normalization, day/location filters, category meta, tent keys. |
| `src/lib/calendar-client.ts` | Client-side view rendering: `renderCard`, `renderList`/`renderListEvent`, `renderTimeline`/`renderTimelineDay`, `getTimelineDayMetrics`, "now" position helpers, ICS download. |
| `src/lib/calendar-modal.ts` | `createEventModal()` — opens/closes the event modal, wires the add-to-calendar action. |
| `src/lib/calendar-timeline.ts` | `createTimelineNow()` — keeps the timeline's "now" marker in sync and drives the jump-to-now button. |
| `src/styles/calendar/base.css` | Shared styles: shell, toolbar, special card, filter panel, search, view toggles, day scaffolding, modal, empty state, media queries. |
| `src/styles/calendar/cards.css` · `list.css` · `timeline.css` | One file per view, each self-contained. |
| `src/styles/calendar/print.css` | Print stylesheet: A4 landscape `@page`, one day per sheet, hides the site chrome. Its sheet rules (white paper, grey gridlines, clean day boxes) are re-served on screen by the print page so browser ≈ PDF. Its 10mm `@page` margin must stay in sync with the size constants in `src/pages/[locale]/programme-print.astro`. |
| `src/styles/calendar/print-list.css` | Print stylesheet for the list export: A4 portrait `@page`, days flow across pages, `break-inside: avoid` keeps individual events whole. Also styles the `PrintCover.astro` title page (one full sheet + page break). Mirrors the shared chrome-hiding rules of `print.css`. |

## Gotchas

- **View markup is not in the components.** To change what a card, list row or
  timeline event looks like, edit the render functions in
  `src/lib/calendar-client.ts`.
- **The jump-to-now button lives in `src/components/Programme.astro`**, outside
  the calendar component. It's wired through the `[data-now-jump-wrap]` /
  `[data-jump-to-now]` selectors in `calendar-timeline.ts` — don't move it
  without updating those.
- **Mirrored CSS rules.** A few patterns are shared between the modal
  (`base.css`) and the card/list views (the meta block, badge typography).
  Each view file repeats the few rules it needs and comments mark the pairs —
  keep them in sync.
- **All five stylesheets are always loaded** (`ProgrammeCalendar.astro`
  imports them unconditionally); the view toggle only switches what gets
  injected, so don't rely on per-view CSS being tree-shaken.
- **The list view is disabled** in the toolbar (commented-out button), but its
  render code, styles and `?view=list` handling are kept for re-enabling.
- The client script reads its data from the
  `<script type="application/json" data-calendar-data>` blob and keeps state
  shareable via URL params: `?view=&day=&category=&children=&location=&search=`.

## Print / PDF export

- The programme can be printed directly from the browser: open
  `/fr/programme-print` (or `/en/…`, `/nl/…`) and use Print → Save as PDF
  (⌘P). The page is A4 landscape with one festival day per sheet. A list
  version exists at `/fr/programme-print-list` (A4 portrait, days flowing,
  events grouped by day then by place) — both are linked from the calendar
  toolbar.
- Both print pages are server-rendered at build time from the same
  `renderTimelineDay` / `renderPrintListDay` functions as the on-screen
  calendar, wrapped in the `PrintLayout.astro` shell, which inlines all CSS
  (calendar styles + the print stylesheet) and embeds the Google Fonts as
  base64 `@font-face` rules (fetched at build time, so the printout doesn't
  need network — see `src/lib/embed-google-fonts.ts`). The “how to print”
  callout is shared via `src/components/PrintInstructions.astro`.
- The timeline export scales each day at build time to fit its sheet (via
  `getTimelineDayMetrics` and the `fit` option of `renderTimelineDay`);
  `print.css` forces one day per page with `break-after: page` and A4
  landscape via `@page { size: A4 landscape }`. The list export opens with a
  full title page (`PrintCover.astro` — logo, “Festival Programme”, hero
  title, festival dates computed from the event day keys) and lets the days
  flow naturally after it, relying on `break-inside: avoid` on the items
  (`print-list.css`) so an event is never split across pages.
- The print pages re-serve the sheet rules of their stylesheet on screen
  (see the `screenSheetRules` copy in `src/layouts/PrintLayout.astro`), so
  the browser view of the page is a faithful preview of the PDF: white
  sheets, grey borders, clean boxes and the sans font, instead of the site's
  cream-on-screen styling.
- Chrome honors the CSS `@page` size, so the print dialog is already set to
  A4 Landscape / Portrait. Firefox ignores `@page` size — pick A4
  landscape/portrait manually there.
- The print pages are excluded from the sitemap (any slug containing
  `print` in its final segment — see the sitemap filter in
  `astro.config.mjs`).
