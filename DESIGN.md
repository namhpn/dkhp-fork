# DESIGN.md — UIT Course Planner Design System

## Source and precedence
This visual system was derived from the uploaded ui-ux-pro-max design-system search for an academic student timetable/data-table utility, then constrained by the Intent product brief and Impeccable craft rules. Product clarity, accessibility, and privacy outrank decoration.

## Register
Professional academic productivity tool. Dense data is expected, but the UI should reduce anxiety through strong hierarchy, clear workflow state, and restrained motion.

## Visual direction
- Pattern: data-dense workflow dashboard with a persistent step navigation rail.
- Style: precise, calm, table-first, light-mode utility.
- Avoid: playful claymorphism, generic oversized card grids, decorative gradients that reduce legibility, exaggerated rounded corners, low-contrast pastel text, fake urgency, and telemetry-oriented copy.

## Tokens
- Background: `#f8fafc`
- Surface: `#ffffff`
- Strong surface: `#f1f5f9`
- Text: `#0f172a`
- Muted text: `#475569`
- Subtle text: `#64748b`
- Border: `#dbe4ef`
- Primary blue: `#1e40af`
- Primary strong: `#1e3a8a`
- Primary soft: `#dbeafe`
- Accent amber: `#f59e0b`
- Accent soft: `#fef3c7`
- Success: `#047857`
- Success soft: `#d1fae5`
- Error: `#b91c1c`
- Error soft: `#fee2e2`
- Radius: 12px for controls, 16px for panels.

## Typography
Use a Fira Sans-first system stack without external font loading:
`"Fira Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Headings use heavy weight, tight letter spacing, and responsive clamp sizing. Body copy remains 16px+ where practical. Data tables use 13px–14px for density while maintaining row height and hover feedback.

## Layout system
- Left navigation rail: dark academic blue, persistent, collapsible.
- Main content: max width 1500px, centered, with a hero/workflow panel per step.
- Metrics: compact status tiles for row count, selected classes, credits, mode, and outputs.
- Dense data: Ag Grid remains the primary task surface and gets the largest vertical area.
- Results: script fields and timetable sit in separate clear panels.

## Interaction rules
- Every click target must have a visible hover/focus state.
- Destructive timetable actions use red affordance and tooltip copy.
- The selected-credit status uses color plus explanatory tooltip/copy, never color alone.
- Long table content may scroll horizontally; cards reflow on small screens.
- Motion must be short and disabled by `prefers-reduced-motion`.

## Component guidance
- `PageShell`: step title, intent copy, progress chips, optional action.
- `MetricCard`: compact feedback for counts/status.
- `SectionCard`: task grouping, not generic decoration.
- Ag Grid: blue header, amber filtered state, readable row hover/selection.
- Timetable: white class cells, blue class identifiers, soft table border, overflow wrapper.

## Cloudflare Pages assumptions
- Project root is this ZIP root.
- Build command: `npm run build`.
- Output directory: `build`.
- SPA fallback is handled by `public/_redirects`.
