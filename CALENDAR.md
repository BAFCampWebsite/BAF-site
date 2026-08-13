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
| `src/lib/calendar.ts` | Data prep shared by build and client code: event normalization, day/location filters, category meta, tent keys. |
| `src/lib/calendar-client.ts` | Client-side view rendering: `renderCard`, `renderList`/`renderListEvent`, `renderTimeline`/`renderTimelineDay`, "now" position helpers, ICS download. |
| `src/lib/calendar-modal.ts` | `createEventModal()` — opens/closes the event modal, wires the add-to-calendar action. |
| `src/lib/calendar-timeline.ts` | `createTimelineNow()` — keeps the timeline's "now" marker in sync and drives the jump-to-now button. |
| `src/styles/calendar/base.css` | Shared styles: shell, toolbar, special card, filter panel, search, view toggles, day scaffolding, modal, empty state, media queries. |
| `src/styles/calendar/cards.css` · `list.css` · `timeline.css` | One file per view, each self-contained. |

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
- **All four stylesheets are always loaded** (`ProgrammeCalendar.astro`
  imports them unconditionally); the view toggle only switches what gets
  injected, so don't rely on per-view CSS being tree-shaken.
- **The list view is disabled** in the toolbar (commented-out button), but its
  render code, styles and `?view=list` handling are kept for re-enabling.
- The client script reads its data from the
  `<script type="application/json" data-calendar-data>` blob and keeps state
  shareable via URL params: `?view=&day=&category=&children=&location=&search=`.
