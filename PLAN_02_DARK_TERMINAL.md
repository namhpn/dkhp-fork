# UI/UX Redesign Implementation Plan — Plan 02: Dark Terminal

> **Design System:** Dark Terminal — Near-black surface, slate tonal ramp, emerald/green accent. Inspired by code editors and terminal UIs. Dense, precise, no-nonsense. For users who live in developer tools.

---

## 1. Redesign Objective

Transform the current neutral-light UI into a dark, high-contrast, terminal-aesthetic tool that feels native to developers and power-users. Preserve every function and flow. Change only the visual register — from "administrative web tool" to "precision instrument". Use Crimson Pro for headings (academic, scholarly, readable) and Atkinson Hyperlegible for body (legibility-optimized, designed for reading under stress).

**Not changing:** architecture, routing, data flow, Zustand store, persistence, Cloudflare Pages deployment, component tree structure.

---

## 2. Current UX Diagnosis

### 2.1 Product purpose
Browser-only timetable planner: import Excel → select non-conflicting classes → copy class codes or registration script.

### 2.2 Primary users and contexts
UIT students under registration deadline pressure. Many are CS/IT students comfortable with dark-mode developer tools. Often work late at night (dark mode reduces eye strain). Often keep the tool open alongside IDE or terminal.

### 2.3 Critical user flows
1. **Import** — select `.xlsx` file; see parse confirmation.
2. **Plan** — filter AgGrid; select classes; resolve conflicts; view timetable grid.
3. **Output** — copy class codes; copy registration script; share URL.

### 2.4 Current IA problems
- None structural. Three-section single-page pattern is correct.
- "Courses" English title is identity-mismatched for a Vietnamese UIT tool.

### 2.5 Current interaction problems (same baseline as Plan 01)
- Conflict dialog is text-only — no grid-level visual conflict feedback.
- Manual-mode toggle undiscoverable on mobile.
- No actual drag-and-drop despite drop-zone visual affordance.
- `getReadonlySx` hardcoded color — not a design token.

### 2.6 Copy/content problems
- Upload title noun phrase, not imperative.
- Plan section empty state: text only, no icon.

### 2.7 Accessibility risks
- Nav active border `rgba(…,0.24)` low contrast.
- `font-weight: 750/850` non-standard.
- AgGrid keyboard focus ring absent.
- **Dark mode specific:** verify that dark surfaces don't create new contrast issues. Dark background (`#020617`) with light text (`#F8FAFC`) → contrast ~16:1 — excellent. Watch for muted text on dark.

### 2.8 Empty/loading/error-state gaps
Same as Plan 01 baseline. Drag-and-drop missing. ErrorBoundary renders raw string.

### 2.9 Redesign opportunities
Same baseline fixes as Plan 01, plus:
1. Full dark theme: background, surfaces, borders, AgGrid theme, timetable table.
2. Monospace accent for class codes and script fields — already uses `system monospace`, promote this as a design decision.
3. Green "active/success" instead of blue — signals registration confirmation.
4. Terminal-style status bar at bottom of grid (already exists, needs dark styling).

---

## 3. Code-Level UI Audit

```
Accessibility:     2/4   — invalid weights, low-contrast active nav, no AgGrid focus ring
Performance:       3/4   — lazy AgGrid good; no extra concerns
Responsive:        3/4   — works; mobile toggle still hidden
Theming:           1/4   — no MUI dark theme configured; will need full dark palette override
Anti-patterns:     3/4   — ghost-card on .grid-frame; otherwise clean

Total: 12/20 — Full visual overhaul required (dark theme adds complexity)
```

**Additional dark-mode-specific risks:**

| ID | P | Issue |
|----|---|-------|
| D1 | P1 | No dark MUI theme — all Material defaults are light |
| D2 | P1 | AgGrid ag-theme-alpine is light-only — must switch to ag-theme-balham or custom dark vars |
| D3 | P2 | ThoiKhoaBieuTable hardcodes `#ffffff` and `#f4f4f5` backgrounds |
| D4 | P2 | notistack snackbars use light defaults |

---

## 4. Target Design Direction — Dark Terminal

**Color strategy:** Full dark surface. Near-black body. Slate surface hierarchy. Emerald accent ≤10% coverage. Amber for warnings (high contrast on dark).

**Palette:**

| Token | OKLCH | Hex |
|-------|-------|-----|
| `--bg` | `oklch(8% 0.01 255)` | `#050d1a` |
| `--surface` | `oklch(13% 0.015 255)` | `#0f172a` |
| `--surface-raised` | `oklch(17% 0.015 255)` | `#1e293b` |
| `--surface-muted` | `oklch(21% 0.012 255)` | `#263042` |
| `--ink` | `oklch(97% 0 0)` | `#f8fafc` |
| `--ink-2` | `oklch(78% 0 0)` | `#c5c5c5` |
| `--ink-3` | `oklch(58% 0 0)` | `#888888` |
| `--border` | `oklch(25% 0.01 255)` | `#2d3748` |
| `--border-soft` | `oklch(20% 0.01 255)` | `#1f2937` |
| `--green` | `oklch(66% 0.18 165)` | `#22c55e` |
| `--green-soft` | `oklch(20% 0.04 165)` | `#0a2218` |
| `--amber` | `oklch(72% 0.16 85)` | `#f59e0b` |
| `--amber-soft` | `oklch(18% 0.04 85)` | `#1a1200` |
| `--error` | `oklch(58% 0.2 28)` | `#ef4444` |
| `--radius-sm` | — | `6px` |
| `--radius-md` | — | `8px` |
| `--radius-lg` | — | `10px` |

**Typography:** Crimson Pro 600/700 for headings (scholarly, readable on dark). Atkinson Hyperlegible 400/700 for body and controls (designed for legibility under impaired conditions — dark screen, late night, stress). System monospace for code fields (unchanged from current).

**Motion:** Same 120–150ms. Terminal cursor-blink on script textarea when active (optional, reduced-motion gated). No other animated additions.

**Radius:** Tighter. `6px` controls, `8px` inputs, `10px` panels. Terminal aesthetic — less pill-shaped than current.

**AgGrid theme:** Switch from `ag-theme-alpine` to `ag-theme-balham` dark variant, or apply full custom `--ag-*` dark custom properties. Recommend custom vars approach (no new dependency).

---

## 5. Information Architecture Changes

None. Structure preserved. Title update: "Xếp lớp UIT" optional.

---

## 6. Design-System Changes

### 6.1 `src/theme/tokens.css` (new — dark variant)
All dark-mode custom properties. `@media (prefers-color-scheme: dark)` root block. Since this tool is dark-always, set properties unconditionally (no media query needed unless light toggle is added later).

### 6.2 `src/theme/muiTheme.ts` (new — dark palette)
```ts
createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22c55e' },
    background: { default: '#050d1a', paper: '#0f172a' },
    text: { primary: '#f8fafc', secondary: '#c5c5c5' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#22c55e' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Atkinson Hyperlegible", "Noto Sans", ui-sans-serif, sans-serif',
    h1: { fontFamily: '"Crimson Pro", serif' },
    h2: { fontFamily: '"Crimson Pro", serif' },
    h3: { fontFamily: '"Crimson Pro", serif' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, boxShadow: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 10, border: '1px solid #2d3748' } } },
  }
})
```

### 6.3 AgGrid dark theme vars
Override `--ag-*` custom properties in `.course-grid`:
- `--ag-background-color: #0f172a`
- `--ag-header-background-color: #1e293b`
- `--ag-odd-row-background-color: #111827`
- `--ag-row-hover-color: #1a2f20`
- `--ag-selected-row-background-color: #14532d`
- `--ag-alpine-active-color: #22c55e`
- `--ag-border-color: #2d3748`
- `--ag-foreground-color: #f8fafc`
- `--ag-secondary-foreground-color: #c5c5c5`

### 6.4 Font import update
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
```

### 6.5 Font weight corrections
Same as Plan 01: remove `750/850`, use `700/800`.

---

## 7. Component Migration Plan

| Component | Type | Key changes |
|-----------|------|-------------|
| `App.css` | Full dark restyle | All token refs; dark body/surface; border colors; nav styles |
| `AgGrid/styles.css` | Full dark restyle | All `--ag-*` vars swapped to dark values; focus ring; weights |
| `ThoiKhoaBieuTable/styles.css` | Dark restyle | Replace hardcoded `#ffffff`/`#f4f4f5` with dark tokens |
| `ScriptDangKyInput` | Fix | `var(--surface-muted)` for readonly bg; dark-compatible |
| `SelectExcelButton` | Enhance | Drag-and-drop; dark dragover visual state |
| `TrungTkbDialog` | Enhance | Conflict row highlight; dialog dark styling via MUI theme |
| `index.tsx` | Add | `ThemeProvider` with dark MUI theme |
| `ErrorBoundary` | Polish | Dark fallback UI |

---

## 8. Screen-by-Screen Implementation Plan

### Section 1 — Nhập Excel (`#import`)
- Upload panel: `background: var(--surface)` (dark), `border: 1px solid var(--border)`.
- Dragover state: `border-color: var(--green)`, `background: var(--green-soft)`.
- Icon box: `background: var(--green-soft)`, icon color `var(--green)`.
- File name text: `var(--ink-2)` (muted but legible on dark).
- Copy: "Chọn file thời khóa biểu".

### Section 2 — Xếp lớp (`#plan`)
- Grid frame: `background: transparent`, `border: 1px solid var(--border)`. Dark AgGrid theme via vars.
- Status bar: `background: var(--surface-raised)`, `color: var(--ink-2)`.
- Conflict dialog: MUI dark theme applies. Dialog border `1px solid var(--border)`.
- Conflict rows flash: `background: var(--amber-soft)`, border `var(--amber)`, 2 cycles.
- AgGrid keyboard focus: `outline: 2px solid var(--green)`.

### Section 3 — Mã lớp & script (`#output`)
- Credit pill dark: `background: var(--surface-raised)`, `border: 1px solid var(--border)`.
- Script textareas: `background: var(--surface)`, monospace font, `color: var(--green)` — terminal feel for the code output.
- Class-code textarea: `color: var(--ink)`.
- Copy button: on success, swap to `CheckIcon` with `color: var(--green)`.

### ThoiKhoaBieuTable
- Table: `background: var(--surface)`, `border-color: var(--border)`.
- Header cells: `background: var(--surface-raised)`, `color: var(--ink)`.
- Class cells: hover `background: var(--green-soft)`.
- Class cell accent (MaLop): `color: var(--green)` (currently `#2563eb`).

---

## 9. State Coverage Plan

| State | Action |
|-------|--------|
| No file loaded | Dark empty state: ghost icon `var(--ink-3)` + label `var(--ink-2)` |
| Importing | Green `CircularProgress`. `aria-busy`. |
| Import error | notistack dark error variant. `autoHideDuration: 5000`. |
| Import success | notistack dark success variant with green. |
| Empty class list | Dark empty zone: icon + label + link. |
| Conflict | Dialog + amber flash on grid rows. |
| Copy success | `CheckIcon` swap, green color, 3s. |
| Error boundary | Dark icon + heading + reload button. |

---

## 10. Accessibility Requirements

- **Dark contrast:** `--ink` (`#f8fafc`) on `--bg` (`#050d1a`) = ~18:1 ✓. `--ink-2` (`#c5c5c5`) on `--surface` (`#0f172a`) ≈ 8:1 ✓. `--ink-3` (`#888888`) on `--surface` = 4.7:1 ✓.
- Green `#22c55e` on dark `#050d1a` = 8.5:1 ✓. On surface `#0f172a` = 7:1 ✓.
- Amber `#f59e0b` on dark = 9:1 ✓.
- Error `#ef4444` on dark = 5.1:1 ✓ — check all error text contexts.
- Focus rings: `3px solid rgba(34,197,94,0.5)` (green tint) for dark mode.
- Nav active: `2px solid var(--green)` solid. No alpha-reduced borders.
- Reduced motion: all transitions/animations gated. Terminal cursor-blink (if added) gated.
- ARIA same as Plan 01.

---

## 11. Responsive Requirements

Same as Plan 01. Additional check: dark backgrounds at high pixel density (OLED) — test on physical device or high-DPI emulation.

---

## 12. Performance Constraints

- Two new font families (Crimson Pro, Atkinson Hyperlegible) — ~80KB combined woff2. Acceptable.
- `display=swap` in font import. Font stack fallback includes `serif` and `sans-serif`.
- No additional JS dependencies.
- Dark theme: no performance impact.

---

## 13. Testing and QA Checklist

**Dark-mode specific**
- [ ] All text passes 4.5:1 on dark backgrounds
- [ ] No near-invisible borders (test on OLED-dark simulation)
- [ ] AgGrid dark theme: row selection, hover, filter states all visible
- [ ] ThoiKhoaBieuTable dark: all cell types legible
- [ ] notistack snackbars: dark variant applied

**Same as Plan 01**
- [ ] All font weights valid
- [ ] No ghost-card pattern (border + wide shadow)
- [ ] Nav active solid border
- [ ] Drag-and-drop works
- [ ] Conflict row flash visible (amber on dark)
- [ ] Copy icon swap works
- [ ] All empty states render
- [ ] Keyboard navigable
- [ ] `prefers-reduced-motion` respected
- [ ] 375 / 768 / 1440 responsive

---

## 14. Rollout Order

### Phase 1 — Design-system foundation
1. Create `src/theme/tokens.css` — dark OKLCH custom properties
2. Add Google Fonts import (Crimson Pro + Atkinson Hyperlegible)
3. Create `src/theme/muiTheme.ts` — dark MUI palette + typography
4. Fix font-weight values across all CSS

### Phase 2 — App shell / navigation
5. Wrap `index.tsx` in dark `ThemeProvider`
6. Update `App.css` body/surface/nav to dark tokens
7. Strengthen nav active border (green, solid)

### Phase 3 — Core shared components
8. Update `AgGrid/styles.css` — full dark `--ag-*` vars + focus ring
9. Update `ThoiKhoaBieuTable/styles.css` — dark token alignment
10. Fix `ScriptDangKyInput` — `var(--surface-muted)`, dark-safe
11. Script textarea: `color: var(--green)` terminal style

### Phase 4 — Critical user flows
12. `SelectExcelButton`: drag-and-drop + dark dragover visual
13. Conflict row: amber flash context wiring
14. Output: green `CheckIcon` swap on copy

### Phase 5 — Secondary screens
*(None)*

### Phase 6 — States
15. Dark empty states (icon + label + link)
16. Dark `ErrorBoundary` fallback
17. notistack dark variant config

### Phase 7 — Responsive + accessibility
18. Contrast audit (dark-specific)
19. Keyboard + screen reader audit
20. 375 / 768 / 1440 visual check

### Phase 8 — Motion + polish
21. Amber conflict flash (dark visible)
22. Terminal cursor-blink (optional, reduced-motion gated)
23. All transitions 120–150ms

### Phase 9 — Final audit
24. Contrast re-check
25. `npm run build` clean
26. Cloudflare Pages staging deploy

---
*Plan 02 of 05 — Dark Terminal*
