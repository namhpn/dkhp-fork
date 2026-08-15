# DESIGN.md — Course Planner

## Source and precedence
Intent defines the product goal: import an Excel timetable, plan classes without conflicts, then copy class codes or the registration script. ui-ux-pro-max provides the canonical visual direction. Impeccable is the implementation quality gate: remove clutter, preserve task focus, and reject decorative UI that does not help the workflow.

UX audit: [UX-AUDIT-2026-08-16.md](./UX-AUDIT-2026-08-16.md) (score 24/40, full backlog and decision log).

## Canonical visual direction
Clean Vietnamese productivity dashboard, light mode, monochrome base with blue accent, compact spacing, restrained motion, and tactile micro-interactions.

## Tokens
Single source of truth: `src/theme/tokens.css` (OKLCH values with hex fallbacks; hexes below are the fallbacks).

- Ink (primary text): `#1a1a1a` · Ink-2: `#4a4a4a` · Ink-3 (muted): `#737373`
- Accent / CTA: `#2563eb` · Accent-soft: `#eff6ff`
- Background: `#f9f9f9` · Surface: `#ffffff` · Muted surface: `#f4f4f4`
- Border: `#dcdcdc` · Border-soft: `#ebebeb`
- Success: `#047857` (soft `#ecfdf5`) · Warning: `#b45309` (soft `#fffbeb`) · Error: `#b91c1c` (soft `#fee2e2`)
- Focus ring: `--focus-ring` = 2px solid `#2563eb`, offset 2px — solid, never alpha (WCAG 1.4.11 ≥3:1).
- Radius vocabulary: `8px` chips/search/segmented tabs · `10px` buttons/inputs · `12px` panels/table · full pill only for small badges.

## Typography
- Headings: Be Vietnam Pro, 700–800.
- Body and controls: Noto Sans, 400–700.
- Code/script fields: system monospace.
- Data-table headers: 600, not 800 — exaggerated weight contrast creates noise in dense UIs.
- Two bold elements per timetable cell: the MaLop—NgonNgu line (blue) and the teacher name.

## Information architecture
Single page. The header holds: app title, mode tabs (`Xếp lớp` / `Nhập mã`), and the file control. The tabs are a real ARIA tablist wired to one `role="tabpanel"` workspace — no anchor bar, no separate screens.

1. Nhập Excel (header, always visible).
2. Xếp lớp: AG Grid workspace (full viewport height minus header) + sticky timetable panel (46/54 split favouring the timetable, 12px gap, ≥1440px).
3. Kết quả: timetable panel — title row [Thời khóa biểu + scoreboard stats … copy mã lớp | copy script (primary, filled)]; the download-ảnh button overlays the timetable's top-right corner. All actions are icon-only, tooltip + aria-label named. Conflict status surfaces via the legend, not a summary line.

Default grid columns favor comparing: Thứ, Tiết, GV, Khóa học are visible; Sỉ số, Ngôn ngữ start hidden (re-enable via the column menu columns tab).

## Content rules
- Vietnamese-first labels, buttons, empty states, errors, and confirmations.
- No long helper paragraphs.
- No marketing hero copy.
- No status-card pileups.
- No FAQ/video buttons in the primary interface.
- Show only operational status: file name, selected class count, credit count, generated outputs.
- Empty states are hints (placeholder text), never fake values that could be copied.

## Interaction rules
- Show import loading state and disable upload while parsing.
- Buttons and inputs require visible focus rings (token above).
- Motion is 120–150ms and non-essential; no bounce/elastic easing tokens.
- Respect `prefers-reduced-motion`.
- No emoji as icons; use SVG/MUI icons.
- Conflict-disabled rows show a disabled toggle with a "Trùng {mã lớp}" tooltip on hover.
- Keyboard: `/` focuses grid search; Space/Enter on a focused row toggles selection; row click toggles too (group clicks expand). Clicks on embedded row controls (the selection toggle) never fall through to the row handler.
- Destructive timetable shortcuts stay as accepted power features (audit §12) but are documented in the remove-button tooltip.
- Selections/file state autosave to the browser silently; no autosave note in the panel.

## Cloudflare Pages
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `build`
- Deploy command where required: `npm run deploy`
