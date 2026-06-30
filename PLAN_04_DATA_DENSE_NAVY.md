# UI/UX Redesign Implementation Plan — Plan 04: Data-Dense Navy

> **Design System:** Data-Dense Navy — Blue-navy primary, amber accent highlights, Fira Code for data fields, Fira Sans for body. Maximum information density. Optimized for users who need to scan many rows fast.

---

## 1. Redesign Objective

Redesign the tool around the insight that the most time-critical moment is the **plan section** — filtering and selecting from potentially hundreds of class rows under deadline pressure. Make the AgGrid the hero of the interface. Compress everything else (import, output) to take up minimum vertical space so users spend less time scrolling and more time making decisions. Use a data-dense dashboard aesthetic: tight spacing, technical typography, amber highlights for active/alert states.

**Not changing:** architecture, routing, data flow, Zustand store, persistence, Cloudflare Pages deployment.

---

## 2. Current UX Diagnosis

### 2.1 Product purpose
Browser-only timetable planner. The primary value is in the AgGrid class-selection experience, not the import or output steps.

### 2.2 Primary users and contexts
UIT students under time pressure. The import step is one-time (per semester). The output step is one-time (once classes are chosen). The plan step is where they spend 80% of their time — trying different combinations, checking conflicts, revising selections.

**Current IA problem (minor but real):** The three sections are visually equal in weight. Import and output sections are as tall as the plan section. This doesn't reflect the task distribution. A data-dense redesign compresses import and output into compact blocks, letting the grid expand.

### 2.3 Critical user flows
1. **Import** — fastest possible: click, select file, done. Should feel like a 2-second task.
2. **Plan** — the core. Must be as fast as possible: filter by MaMH, sort by Thu/Tiet, select, see conflict, deselect, re-select. The grid is the product.
3. **Output** — one-click copy. Should feel like an afterthought (in the best way).

### 2.4 Current IA problems (data-dense perspective)
- Import section takes `min-height: 168px`. For a tool where import is a 2-second task, this is excessive real estate.
- The `SchedulePanel` (ThoiKhoaBieuTable) appears below the grid — fine. But on small screens it pushes output very far down.
- Output section credit pill and manual toggle are in the section header — correct placement, but small at current scale.

### 2.5 Redesign-specific layout proposal
- **Import section:** Compress to a single inline bar. File name + status on the left. "Chọn file" button on the right. `min-height: 52px`. When a file is loaded, show a condensed status badge. Removes the 168px drop panel entirely — file input still triggered by button click.
- **Plan section:** `min-height: calc(100vh - 180px)` — give it as much screen as possible.
- **Output section:** Two-line compact layout: credit pill + toggle on one row; textareas below.

### 2.6 Current interaction problems (shared baseline)
- Conflict dialog: text-only.
- Manual toggle: undiscoverable mobile.
- No drag-and-drop.
- Hardcoded `#f8fafc`.

### 2.7 Accessibility risks (data-dense specific)
- Compact import bar: ensure file input is still keyboard-accessible.
- Fira Code: check that monospace characters at 13px pass legibility. Atkinson Hyperlegible was designed for legibility; Fira Code is designed for code — verify at small sizes.
- Navy `#1e3a8a` on white = 9.1:1 ✓. Amber `#f59e0b` on navy = 5.7:1 ✓. Amber on white `#f59e0b` = 3.2:1 — body text only via dark ink.

### 2.8 Empty/loading/error-state gaps
Same baseline. Compact import bar needs its own loading state (inline spinner in the button).

---

## 3. Code-Level UI Audit

```
Accessibility:     2/4   — invalid weights, nav active, AgGrid focus
Performance:       3/4   — lazy AgGrid good
Responsive:        2/4   — compact import bar requires careful mobile adaptation; plan section height on mobile
Theming:           2/4   — no MUI theme; hardcoded colors
Anti-patterns:     3/4   — ghost-card; upload drop panel oversized for the task

Total: 12/20 — Full overhaul required
```

---

## 4. Target Design Direction — Data-Dense Navy

**Color strategy:** Committed. Navy as primary color 40% of surface (nav, header cells, selected rows, active states). Amber strictly for highlights, warnings, and active filter indicators.

**Palette:**

| Token | OKLCH | Hex |
|-------|-------|-----|
| `--bg` | `oklch(97.5% 0.005 255)` | `#f8fafc` |
| `--surface` | `oklch(100% 0 0)` | `#ffffff` |
| `--surface-muted` | `oklch(95% 0.005 255)` | `#f1f5f9` |
| `--ink` | `oklch(22% 0.09 255)` | `#1e3a8a` |
| `--ink-2` | `oklch(36% 0.07 255)` | `#1e40af` |
| `--ink-body` | `oklch(18% 0.03 255)` | `#1e293b` |
| `--ink-muted` | `oklch(42% 0.03 240)` | `#475569` |
| `--border` | `oklch(88% 0.01 240)` | `#cbd5e1` |
| `--border-soft` | `oklch(93% 0.007 240)` | `#e2e8f0` |
| `--navy` | `oklch(37% 0.14 255)` | `#1e40af` |
| `--navy-2` | `oklch(50% 0.18 255)` | `#3b82f6` |
| `--navy-soft` | `oklch(95% 0.02 255)` | `#dbeafe` |
| `--amber` | `oklch(74% 0.16 85)` | `#f59e0b` |
| `--amber-soft` | `oklch(96.5% 0.02 85)` | `#fef3c7` |
| `--amber-dark` | `oklch(60% 0.14 85)` | `#b45309` |
| `--success` | `oklch(42% 0.13 165)` | `#047857` |
| `--success-soft` | `oklch(97% 0.02 165)` | `#ecfdf5` |
| `--error` | `oklch(42% 0.18 28)` | `#b91c1c` |
| `--radius-sm` | — | `4px` |
| `--radius-md` | — | `6px` |
| `--radius-lg` | — | `8px` |

**Typography:** Fira Sans 400/500/600 body (technical precision for data scanning). Fira Code 400/500 for class codes, script, and MaLop/MaMH code fields in AgGrid (monospace data = instantly recognizable). Be Vietnam Pro retained for headings only (Vietnamese compatibility). Remove Noto Sans — replace with Fira Sans.

**Motion:** Minimal. 80ms row selection background transition. 100ms filter apply indicator. No entrance animations. The data should feel instantly available.

**Radius:** Tight. `4px` controls, `6px` inputs, `8px` panels. Data-dense interfaces use tight radii — rounder feels informal for a precision tool.

---

## 5. Information Architecture Changes

**Import section:** Compress from `168px` drop panel to `52px` inline bar.
- Left: file status badge (file icon + name + row count) or empty placeholder text
- Right: "Chọn file" button
- This matches the actual task weight (import is a 2-second once-per-semester step)

**Plan section:** Expand. `min-height: calc(100vh - 180px)`. Grid is the product.

**Output section:** Compact two-row layout. No change to content — only compresses vertical rhythm.

**Nav:** Keep. Three anchors unchanged.

---

## 6. Design-System Changes

### 6.1 `src/theme/tokens.css`
Navy + amber custom properties. Tight radius scale.

### 6.2 `src/theme/muiTheme.ts`
```ts
createTheme({
  palette: {
    primary: { main: '#1e40af', dark: '#1e3a8a', light: '#3b82f6', contrastText: '#ffffff' },
    warning: { main: '#f59e0b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Fira Sans", ui-sans-serif, sans-serif',
    h1: { fontFamily: '"Be Vietnam Pro", "Fira Sans", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Be Vietnam Pro", "Fira Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Be Vietnam Pro", "Fira Sans", sans-serif', fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', borderRadius: 6 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 8 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiInputBase-root': { borderRadius: 6 } } } },
  }
})
```

### 6.3 Font import
```css
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;700&family=Fira+Code:wght@400;500&family=Fira+Sans:wght@400;500;600&display=swap');
```

### 6.4 AgGrid navy + amber vars
```css
--ag-alpine-active-color: #1e40af;
--ag-row-hover-color: #f1f5f9;
--ag-selected-row-background-color: #dbeafe;
--ag-header-background-color: #1e293b;
--ag-header-foreground-color: #f8fafc;
--ag-header-column-separator-color: #334155;
--ag-odd-row-background-color: #fafbfd;
--ag-input-focus-border-color: #1e40af;
--ag-font-family: '"Fira Sans"', ui-sans-serif, sans-serif;
/* Filter active = amber highlight */
--ag-header-cell-filtered-background-color: #fef3c7;
```

Additionally: MaLop and MaMH cells use Fira Code font via `cellClass` or `cellStyle` in AgGrid column definition.

### 6.5 New compact import bar component
New layout for `ImportSection` — replace `upload-drop-panel` with `.import-bar`:
```css
.import-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  min-height: 52px;
}
.import-bar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 0.86rem;
  font-family: 'Fira Sans', sans-serif;
}
.import-bar-filename {
  color: var(--ink-body);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 6.6 Font weight corrections
Same: `750` → `700`, `850` → `800` (or `700`), `650` → `600`.

---

## 7. Component Migration Plan

| Component | Type | Key changes |
|-----------|------|-------------|
| `App.css` | Refactor + layout | Navy tokens; compact import bar layout; expand plan section height |
| `SelectExcelButton` | Restructure | Replace drop-panel with inline bar; keep file input logic; add drag-and-drop |
| `AgGrid/styles.css` | Update | Navy vars; dark header; amber filter; Fira Code for code cells; focus ring |
| `ThoiKhoaBieuTable/styles.css` | Update | Token alignment; Fira Code for MaLop in cells |
| `ScriptDangKyInput` | Fix + font | `var(--surface-muted)` readonly; Fira Code already on script field |
| `TrungTkbDialog` | Enhance | Conflict flash; navy dialog |
| `index.tsx` | Add | `ThemeProvider` navy theme |
| `ErrorBoundary` | Polish | Navy-accented fallback |

---

## 8. Screen-by-Screen Implementation Plan

### Section 1 — Nhập Excel (`#import`) — RESTRUCTURED

**Old:** 168px drop panel with icon, title, file name, button.
**New:** 52px inline bar.

```
[ 📄 icon ] [ filename or "Chưa có file" ]           [ Chọn file Excel ▸ ]
             [ 240 lớp học · 2h ago ]
```

- File input: still triggered by button click (hidden `<input type="file">`).
- Drag-and-drop: `onDragOver`/`onDrop` on the bar itself. Dragover visual: amber border + amber-soft bg (amber = "action incoming").
- Import loading: button changes to "Đang đọc…" with inline `CircularProgress size=12`. Bar dims slightly.
- On success: file name + "240 lớp học" status appear inline. notistack success snackbar as confirmation.

### Section 2 — Xếp lớp (`#plan`)
- Grid occupies `min-height: calc(100vh - 180px)`.
- AgGrid dark navy header row: `--ag-header-background-color: #1e293b`. White header text.
- MaLop / MaMH cells: Fira Code font (`cellStyle: { fontFamily: '"Fira Code", monospace' }`).
- Active filter cells: amber highlight (`--ag-header-cell-filtered-background-color: #fef3c7`).
- Selected rows: navy-soft (`#dbeafe`).
- Keyboard focus: `outline: 2px solid var(--navy)`.
- Status bar: `background: var(--surface-muted)`. Credit pill navy ok / amber warn.
- Conflict flash: amber (`#fef3c7` bg + `#f59e0b` border), 2 cycles.

### Section 3 — Mã lớp & script (`#output`)
- Compact. Credit pill + toggle inline.
- Textareas: Fira Code (already planned for script; extend to class codes too — they are codes).
- Copy button: navy `variant="contained"`. On success: `CheckIcon` + `color: var(--success)`.
- Share: navy outlined.
- Manual toggle: navy checkbox. Full row on mobile xs.

---

## 9. State Coverage Plan

| State | Action |
|-------|--------|
| No file | Import bar: ghost file icon + "Nạp file Excel thời khóa biểu" muted label |
| Importing | Bar dims; button "Đang đọc…" + spinner |
| Import error | Error snackbar. Bar resets. |
| Import success | File name + lớp count appear in bar. |
| Empty class list | Plan section: navy ghost icon + compact label |
| Conflict | Amber flash on grid rows + dialog |
| Copy success | Green CheckIcon (confirmation = success, not navy CTA) |
| Error boundary | Navy icon + heading + reload |

---

## 10. Accessibility Requirements

- **Navy on white:** `#1e40af` on `#ffffff` = 7.5:1 ✓.
- **Navy header on dark:** `#f8fafc` on `#1e293b` = 13:1 ✓.
- **Amber text:** never used as body text on light. `--amber-dark` (`#b45309`) on white = 4.8:1 ✓ (for status badges only).
- **Fira Code at 13px:** legible for monospace content (code fields). Not used for body text.
- Compact import bar: `<label>` properly associated with `<input type="file">`. Keyboard: pressing `Enter` or `Space` on the button opens file picker.
- Plan section height on mobile: `calc(100vh - 180px)` may be too small on 375px. Add `min-height: 420px` floor.
- Focus rings: `3px solid rgba(30,64,175,0.4)`.
- Nav active: `2px solid var(--navy)`.
- All reduced-motion, ARIA, skip-link requirements same as Plan 01.

---

## 11. Responsive Requirements

| Breakpoint | Notes |
|------------|-------|
| 375px | Import bar stacks: status above button. Plan section `min-height: 420px`. Credit + toggle stacked. |
| 768px | Import bar inline. Grid full width. |
| 1024px+ | Full data-dense layout. Grid `calc(100vh - 180px)`. |

---

## 12. Performance Constraints

- New fonts: Fira Sans + Fira Code (~120KB combined woff2). Slight increase from current. Use `display=swap` and `preload` hint for Fira Sans (body font — critical).
- Compact import bar: less DOM complexity than drop panel. Slight performance improvement.
- No animation libraries.
- Plan section height change: no JS — pure CSS.

---

## 13. Testing and QA Checklist

**Data-dense specific**
- [ ] Import bar: file input keyboard-accessible (Enter/Space opens picker)
- [ ] Import bar: drag-and-drop works; amber dragover visible
- [ ] Import bar loading state: button dims + spinner
- [ ] Fira Code readable at 13px in AgGrid MaLop/MaMH cells
- [ ] AgGrid dark header: all header text readable
- [ ] Amber filter active indicator visible in header
- [ ] Navy selected row clearly distinguishable from hover
- [ ] Plan section height on mobile: grid not too short (≥420px)
- [ ] Status bar: credit pill navy/amber variants correct

**Shared checklist**
- [ ] All font weights valid
- [ ] Conflict row amber flash visible
- [ ] Copy CheckIcon success state
- [ ] Empty states render
- [ ] Keyboard navigable (compact import bar included)
- [ ] `prefers-reduced-motion` respected
- [ ] 375 / 768 / 1440 responsive

---

## 14. Rollout Order

### Phase 1 — Design-system foundation
1. Create `src/theme/tokens.css` — navy OKLCH vars, tight radius
2. Font import: Be Vietnam Pro (600/700) + Fira Sans (400/500/600) + Fira Code (400/500)
3. Create `src/theme/muiTheme.ts` — navy palette, Fira Sans body
4. Fix font-weight values

### Phase 2 — App shell / navigation
5. Wrap `index.tsx` with navy `ThemeProvider`
6. Nav active: solid navy border + navy-soft bg
7. Body, surface tokens applied

### Phase 3 — Core shared components
8. AgGrid: navy header, amber filter, navy selection, focus ring, Fira Code cell style option
9. ThoiKhoaBieuTable: token align, Fira Code for code cells
10. `ScriptDangKyInput`: fix readonly bg; Fira Code confirmed

### Phase 4 — Critical user flows
11. **`SelectExcelButton` restructure** → compact import bar component
12. Mobile responsive for import bar (stack layout at xs)
13. Drag-and-drop on import bar
14. Conflict flash (amber) context wiring
15. Output: CheckIcon success state

### Phase 5 — Secondary
*(None)*

### Phase 6 — States
16. Import bar states (empty, loading, loaded)
17. Plan empty state (compact)
18. `ErrorBoundary` navy fallback

### Phase 7 — Responsive + accessibility
19. Mobile import bar stacking
20. Plan section height floor at 375px
21. Contrast audit (amber, navy-on-dark header)
22. Keyboard audit (compact bar)

### Phase 8 — Motion + polish
23. 80ms row selection transition
24. Amber dragover transition on import bar
25. Conflict flash (amber, 2 cycles)
26. `prefers-reduced-motion` gating

### Phase 9 — Final audit
27. Contrast re-check
28. `npm run build` clean
29. Cloudflare Pages staging deploy

---
*Plan 04 of 05 — Data-Dense Navy*
