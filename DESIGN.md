# DESIGN.md — Courses

## Source and precedence
Intent defines the product goal: import an Excel timetable, plan classes without conflicts, then copy class codes or the registration script. ui-ux-pro-max provides the canonical visual direction. Impeccable is the implementation quality gate: remove clutter, preserve task focus, and reject decorative UI that does not help the workflow.

## Canonical visual direction
Clean Vietnamese productivity dashboard, light mode, monochrome base with blue accent, compact spacing, restrained motion, and tactile micro-interactions.

## Tokens
- Primary: `#18181B`
- Secondary: `#3F3F46`
- CTA / active: `#2563EB`
- Background: `#FAFAFA`
- Text: `#09090B`
- Surface: `#FFFFFF`
- Muted surface: `#F4F4F5`
- Border: `#E4E4E7`
- Success: `#047857`
- Warning: `#B45309`
- Error: `#B91C1C`
- Radius: 10px for controls, 12px for major panels.

## Typography
- Headings: Be Vietnam Pro, 700–800.
- Body and controls: Noto Sans, 400–700.
- Code/script fields: system monospace.
- No display hero scale. Product UI uses compact fixed sizes.

## Information architecture
Single page only:
1. Nhập Excel.
2. Xếp lớp.
3. Mã lớp & script.

The navigation is an in-page anchor bar with visible active state. It must not route users into separate screens.

## Content rules
- Vietnamese-first labels, buttons, empty states, errors, and confirmations.
- No long helper paragraphs.
- No marketing hero copy.
- No status-card pileups.
- No FAQ/video buttons in the primary interface.
- Show only operational status: file name, selected class count, credit count, generated outputs.

## Interaction rules
- Show import loading state and disable upload while parsing.
- Buttons and inputs require visible focus rings.
- Motion is 120–150ms and non-essential.
- Respect `prefers-reduced-motion`.
- No emoji as icons; use SVG/MUI icons.

## Cloudflare Pages
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `build`
- Deploy command where required: `npm run deploy`
