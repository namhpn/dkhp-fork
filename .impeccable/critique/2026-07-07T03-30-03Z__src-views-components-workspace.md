---
target: workspace-main + workspace-timetable timetable overflow
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-07-07T03-30-03Z
slug: src-views-components-workspace
---
Method: degraded single-context (spawn_agent unavailable)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Selection updates timetable and stats promptly |
| 2 | Match System / Real World | 3 | Familiar weekly grid; Vietnamese labels |
| 3 | User Control and Freedom | 3 | Toggle deselect, toolbar actions available |
| 4 | Consistency and Standards | 2 | `.compact` timetable styles exist but are never applied |
| 5 | Error Prevention | 3 | Conflict-disabled toggles work |
| 6 | Recognition Rather Than Recall | 2 | Off-screen weekday columns require horizontal scroll recall |
| 7 | Flexibility and Efficiency | 2 | No density toggle, no panel resize |
| 8 | Aesthetic and Minimalist Design | 2 | Timetable dominates sidebar with oversized dimensions |
| 9 | Error Recovery | 3 | n/a for this surface |
| 10 | Help and Documentation | 2 | Empty states exist; no scroll affordance guidance |
| **Total** | | **25/40** | **Acceptable — significant layout fixes needed** |

## Anti-Patterns Verdict

**LLM assessment**: Not AI-slop visually — the monochrome productivity look is on-brand. The failure is spatial: a full-width timetable spec is parked inside a ~41% sidebar without adaptation.

**Deterministic scan**: `detect.mjs` returned 0 findings on Workspace/App.css/ThoiKhoaBieuTable (no decorative slop hits).

**Browser visualization**: Skipped — no mutable browser overlay tool in session. Reproduction used Playwright measurements against `http://localhost:3000/`.

## Overall Impression

The split workspace concept is sound: grid left, live timetable right. But `#thoi-khoa-bieu` is sized like a standalone full-page calendar (1050px min-width, 70vh min-height) while `workspace-timetable` only receives ~505–571px at desktop breakpoints. Users must scroll inside the wrapper to see Thu 5–7, and on common laptop heights they also scroll the page — breaking the "see selection + schedule at a glance" task.

## What's Working

- Side-by-side layout at ≥1280px keeps grid and timetable co-visible during selection.
- `#thoi-khoa-bieu-wrapper` correctly sets `overflow-x: auto` as a scroll container.
- Timetable panel chrome (stats, toolbar, empty states) is compact and task-focused.

## Priority Issues

**[P1] Timetable min-width exceeds sidebar column**
- **Why**: Table forces 1050px width in a ~541px wrapper (1440×900); wrapper needs ~509px horizontal scroll to see the full week.
- **Fix**: Apply sidebar-aware density — enable existing `.compact` mode via container query or prop when inside `.workspace-timetable`; reduce `min-width` to `min(100%, 700px)` or use `100%` with fluid column widths.
- **Suggested command**: `$impeccable layout workspace-timetable`

**[P1] `min-height: 70vh` inflates timetable column past grid**
- **Why**: At 1366×768 with 3 classes selected: timetable column 775px vs grid 562px; page scroll +129px. Users lose single-viewport scanning.
- **Fix**: Drop viewport-based min-height in sidebar context; use content height or `max-height: calc(100dvh - header - panel chrome)` with internal scroll on wrapper only.
- **Suggested command**: `$impeccable layout workspace-timetable`

**[P2] Compact mode implemented but hardcoded off**
- **Why**: `ThoiKhoaBieuTable` sets `compact: false` always; `.compact` CSS already reduces min-width to 700px and removes min-height.
- **Fix**: Tie compact to container width (`@container (max-width: 640px)`) or parent class on `.workspace-timetable`.
- **Suggested command**: `$impeccable distill ThoiKhoaBieuTable`

**[P2] Grid ratio 59/41 under-allocates timetable**
- **Why**: Six weekday columns + period labels need horizontal space; 41% column cannot host a 1050px table without scroll.
- **Fix**: Rebalance to 50/50 at wide breakpoints, or stack timetable below grid between 1024–1279px with full-width table.
- **Suggested command**: `$impeccable adapt workspace`

**[P3] Nested scroll without affordance**
- **Why**: Wrapper scrolls horizontally but no shadow, fade, or hint that Thu 5–7 are off-screen.
- **Fix**: Edge fade on wrapper, sticky first column (period), or "scroll for more days" micro-hint on first selection.
- **Suggested command**: `$impeccable polish timetable-panel`

## Persona Red Flags

**Alex (Power User)**: Cannot see full week without two-axis scrolling; no keyboard path to scan off-screen columns; timetable taller than grid breaks parallel comparison.

**Sam (Accessibility)**: Horizontal scroll region in narrow column is tedious for keyboard users; sticky timetable column grows page length, increasing tab stops.

**Casey (Mobile / short viewport)**: At 1024×768 stacked layout, +715px page scroll — timetable buried below grid after selection.

## Minor Observations

- `.workspace-timetable` is `position: sticky` but unconstrained height — sticky benefit limited when column exceeds viewport.
- `.cell-class { width: 230px }` fixed cells fight fluid sidebar sizing.
- DESIGN.md allows horizontal scroll on small screens, but desktop sidebar should minimize it.

## Questions to Consider

- Should the timetable default to compact density whenever it shares a row with the grid?
- Would a "expand timetable" affordance (inline full-width or dialog) serve full-week viewing better than shrinking cells?
- Is 59/41 the right split if timetable is a primary output, not secondary preview?
