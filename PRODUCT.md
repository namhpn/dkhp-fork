# PRODUCT.md — UIT Course Planner

## Product intent
UIT Course Planner helps UIT students convert an official Excel timetable into a conflict-checked class plan, visual timetable, and registration script. The product is a browser-only utility: no account, no backend for timetable data, and no telemetry.

## Primary users
- UIT students preparing for course registration under time pressure.
- Students comparing multiple sections by teacher, day, period, credits, faculty, and availability.
- Students who already know class codes and only need to draw/share a timetable.

## Core problem
The official timetable data is dense. Students need to filter rows quickly, avoid schedule conflicts, preserve choices across tabs, and produce a final registration script without manually retyping every class code.

## Constraints
- Static React SPA deployable on Cloudflare Pages.
- No server-side application layer.
- Timetable parsing must stay local in the browser.
- Existing XLSX parsing, Zustand state, Ag Grid selection, and script generation logic must remain intact.
- UI must support Vietnamese labels and longer text without fixed-width breakage.

## Major flows
1. Upload Excel timetable.
2. Read and validate timetable rows in the browser.
3. Filter/sort/group course rows.
4. Select classes while preventing schedule conflicts.
5. Review credit total and timetable layout.
6. Copy class codes, share timetable link, or copy the registration script.

## Information architecture
- Step 1: Data setup and usage orientation.
- Step 2: Course table, filtering, selection, schedule preview.
- Step 3: Final timetable, class-code list, generated registration script.

## Accessibility and resilience requirements
- Use semantic landmarks: nav and main.
- Provide skip navigation.
- Keep visible labels on fields; do not rely on placeholders.
- Preserve keyboard shortcuts and expose navigation labels.
- Keep contrast at WCAG AA level for normal text.
- Respect reduced-motion preference.
- Support small screens with responsive cards and horizontally scrollable dense tables.
- Provide clear empty-state recovery when the user has not uploaded a file.

## Ethical stance
- Timetable data remains local to the browser.
- No telemetry, external behavior monitoring, or hidden data submission.
- No fabricated urgency, gamified pressure, misleading claims, or manipulative default choices.

## Success metrics
- User can understand the three-step flow without reading external documentation.
- User can upload a valid Excel timetable and see row count/status immediately.
- User can identify selected class count and credit status at a glance.
- User can recover from missing-data states without confusion.
- Final script and timetable outputs are visually and functionally discoverable.
