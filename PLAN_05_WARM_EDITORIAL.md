# UI/UX Redesign Implementation Plan — Plan 05: Warm Editorial

> **Design System:** Warm Editorial — Off-white surface, deep slate ink, violet accent, Inter for headings, Source Serif 4 for section titles. Calm, reading-optimized, low-stimulation. For students who want a tool that doesn't feel like a stressful government portal.

---

## 1. Redesign Objective

Counter the anxiety of registration-deadline pressure by making the tool feel calm, trustworthy, and deliberate — like a well-designed academic planner rather than an administrative system. Use warm-neutral surfaces (NOT the banned cream/sand default — use a desaturated near-white with a faint blue-violet tint to push it away from beige). Deep slate ink for maximum readability. Violet accent for selection and active states — distinctive from the blue that dominates academic/government portals. Use generous line height and comfortable spacing in the grid to reduce scanning fatigue.

**Not changing:** architecture, routing, data flow, Zustand store, persistence, Cloudflare Pages deployment.

---

## 2. Current UX Diagnosis

### 2.1 Product purpose
Browser-only timetable planner: import Excel → select non-conflicting classes → copy class codes or registration script.

### 2.2 Primary users and contexts
UIT students, all faculties. Many find registration inherently stressful (limited seats, overlapping schedules, deadlines). A calm, readable interface reduces the cognitive overhead so they can focus on the decision-making, not the tool.

**Observation:** The current design is neutral but not warm. The zinc-gray palette reads as "institutional" — not wrong, but not actively reassuring. A warm-editorial aesthetic makes the tool feel more like a trusted companion than a form to fill out.

### 2.3 Critical user flows
Same as previous plans (Import → Plan → Output).

### 2.4 Current IA problems
None structural. The three-section single-page layout remains unchanged.

### 2.5 Current interaction problems (shared baseline)
- Conflict dialog: text-only, no grid highlight.
- Manual-mode toggle: undiscoverable mobile.
- No drag-and-drop despite affordance.
- `getReadonlySx` hardcoded color.

### 2.6 Copy/content problems
- Upload title is noun phrase.
- Plan empty state: text only.

### 2.7 Accessibility risks
- Nav active border low contrast.
- `font-weight: 750/850` non-standard.
- AgGrid keyboard focus ring absent.
- **Violet-specific:** Violet `#7c3aed` on white `#ffffff` = 6.1:1 ✓. Violet on off-white `#f5f4f8` = 5.8:1 ✓. Deep slate `#1e1b2e` on off-white = 16:1 ✓.

### 2.8 Empty/loading/error-state gaps
Same baseline.

### 2.9 Warm editorial redesign opportunities
1. Source Serif 4 for section headings: adds literary authority, contrasts well with Inter body.
2. Generous AgGrid row height (`rowHeight: 44px` instead of default 32px) — easier to scan under stress, less dense error rate.
3. Violet selection color: distinct from every UIT portal color (all use blue or green). Users won't confuse "selected" with "system".
4. Subtle tinted surface (blue-violet tint in the bg, not warm/cream) — makes the page feel considered rather than default.
5. Off-white grid: alternating rows with barely-perceptible distinction (vs current zebra-striping which reads as busy).

---

## 3. Code-Level UI Audit

```
Accessibility:     2/4   — invalid weights, nav active, AgGrid focus
Performance:       3/4   — lazy AgGrid good; generous row height increases DOM paint area slightly
Responsive:        3/4   — works; mobile toggle hidden
Theming:           2/4   — no MUI theme; hardcoded colors
Anti-patterns:     3/4   — ghost-card on .grid-frame

Total: 13/20 — Targeted overhaul
```

**Additional editorial-specific concern:**
- Source Serif 4 is a display serif. At `0.82rem` (AgGrid cell font size), it would read poorly. **Decision:** Source Serif 4 for headings only (`h1`, `h2`, section titles). Grid cells remain sans-serif (Inter 400 at 13px).
- Generous row height: `rowHeight: 44` must be set in `AgGrid/index.tsx` as a grid prop, not CSS.

---

## 4. Target Design Direction — Warm Editorial

**Color strategy:** Restrained. Violet accent ≤10% surface coverage. Near-neutral off-white tinted toward blue-violet (OKLCH chroma 0.008, hue 275). Deep slate ink. No warm-leaning neutrals (explicitly avoiding the sand/cream AI default).

**Palette:**

| Token | OKLCH | Hex |
|-------|-------|-----|
| `--bg` | `oklch(97% 0.008 275)` | `#f5f4f8` |
| `--surface` | `oklch(100% 0 0)` | `#ffffff` |
| `--surface-muted` | `oklch(95% 0.006 275)` | `#eeecf5` |
| `--ink` | `oklch(14% 0.03 275)` | `#1e1b2e` |
| `--ink-2` | `oklch(32% 0.03 270)` | `#3b3659` |
| `--ink-3` | `oklch(52% 0.02 265)` | `#6b6789` |
| `--border` | `oklch(88% 0.01 270)` | `#dddbe8` |
| `--border-soft` | `oklch(93% 0.007 275)` | `#e8e6f2` |
| `--violet` | `oklch(48% 0.22 295)` | `#7c3aed` |
| `--violet-2` | `oklch(60% 0.2 295)` | `#8b5cf6` |
| `--violet-soft` | `oklch(95.5% 0.025 295)` | `#ede9fe` |
| `--success` | `oklch(45% 0.13 165)` | `#065f46` |
| `--success-soft` | `oklch(97% 0.015 165)` | `#d1fae5` |
| `--warning` | `oklch(52% 0.13 55)` | `#92400e` |
| `--warning-soft` | `oklch(97% 0.015 55)` | `#fef3c7` |
| `--error` | `oklch(42% 0.18 28)` | `#991b1b` |
| `--error-soft` | `oklch(97% 0.015 28)` | `#fee2e2` |
| `--radius-sm` | — | `8px` |
| `--radius-md` | — | `12px` |
| `--radius-lg` | — | `16px` |

**Typography:**
- Section headings (`h2`, section titles): Source Serif 4 600. Adds scholarly authority.
- Page heading (`h1`, app title): Inter 700. Clean, neutral identifier.
- Body, controls, grid: Inter 400/500/600. Excellent readability at small sizes.
- Code/script fields: system monospace (unchanged).

**Font import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:wght@400;600&display=swap');
```

**Motion:** Calm, unhurried. 150–200ms transitions (slightly slower than current 120ms — reinforces the calm register). No bounce, no spring. `ease-out-quart` equivalent (`cubic-bezier(0.25,1,0.5,1)`). No entrance animations on content.

**Radius:** Generous. `8px` controls, `12px` inputs, `16px` panels. Rounder = friendlier = calmer.

**AgGrid row height:** `rowHeight: 44` (set as prop in `AgGrid/index.tsx`). More vertical breathing room per row.

---

## 5. Information Architecture Changes

None structural. Section heading font changes (Source Serif 4) make the three-step sequence feel more like chapters in a book — reinforces the calm, deliberate register.

Optional: rename page title from "Courses" to "Kế hoạch học tập" — more Vietnamese and less transactional.

---

## 6. Design-System Changes

### 6.1 `src/theme/tokens.css`
Violet-tinted neutrals via OKLCH. All properties defined here.

### 6.2 `src/theme/muiTheme.ts`
```ts
createTheme({
  palette: {
    primary: { main: '#7c3aed', dark: '#6d28d9', light: '#8b5cf6', contrastText: '#ffffff' },
    background: { default: '#f5f4f8', paper: '#ffffff' },
    text: { primary: '#1e1b2e', secondary: '#3b3659' },
    success: { main: '#065f46' },
    warning: { main: '#92400e' },
    error: { main: '#991b1b' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Source Serif 4", "Georgia", serif', fontWeight: 600 },
    h3: { fontFamily: '"Source Serif 4", "Georgia", serif', fontWeight: 600 },
    body1: { fontFamily: '"Inter", sans-serif', fontWeight: 400, lineHeight: 1.65 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', borderRadius: 8 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiInputBase-root': { borderRadius: 12 } } } },
  }
})
```

### 6.3 AgGrid calm vars
```css
--ag-font-family: '"Inter"', ui-sans-serif, sans-serif;
--ag-font-size: 13px;
--ag-foreground-color: #1e1b2e;
--ag-secondary-foreground-color: #3b3659;
--ag-background-color: #ffffff;
--ag-header-background-color: #f5f4f8;
--ag-odd-row-background-color: #fafafa;
--ag-row-hover-color: #f0eeff;
--ag-selected-row-background-color: #ede9fe;
--ag-alpine-active-color: #7c3aed;
--ag-border-color: #dddbe8;
--ag-input-focus-border-color: #7c3aed;
--ag-range-selection-background-color: rgba(124,58,237,0.1);
```

`rowHeight: 44` set as prop in `AgGrid/index.tsx`.

### 6.4 Section title component update
`SectionHeader` — apply `component="h2"` with Source Serif 4 style via MUI theme `h2` typography variant. CSS class `.section-title` gets `font-family: var(--font-serif)`.

Add CSS var:
```css
--font-serif: "Source Serif 4", "Georgia", serif;
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

### 6.5 Font weight corrections
`750` → `700`, `850` → `700` (Inter doesn't have 800), `650` → `600`. Note: Inter's available weights: 100–900 (variable font) — so 800 is valid. But Source Serif 4 is 400/600 only. Heading weights: 600 for Source Serif 4, 700 for Inter h1.

### 6.6 Transition timing
All CSS transitions updated to 150–200ms with `cubic-bezier(0.25,1,0.5,1)`.

---

## 7. Component Migration Plan

| Component | Type | Key changes |
|-----------|------|-------------|
| `App.css` | Refactor | Violet-tinted tokens; Source Serif 4 for section titles; generous radius; 150-200ms transitions |
| `AgGrid/styles.css` | Update | Violet vars; `rowHeight: 44` hint; focus ring; calm zebra (barely visible) |
| `AgGrid/index.tsx` | Update | `rowHeight={44}` prop |
| `ThoiKhoaBieuTable/styles.css` | Update | Token align; violet class cell accent; generous padding |
| `ScriptDangKyInput` | Fix | `var(--surface-muted)` readonly bg |
| `SelectExcelButton` | Enhance | Drag-and-drop; generous styled drop zone; violet dragover |
| `TrungTkbDialog` | Enhance | Conflict flash; serif dialog title |
| `index.tsx` | Add | `ThemeProvider` warm editorial theme |
| `ErrorBoundary` | Polish | Calm fallback: serif heading + muted message + reload |

---

## 8. Screen-by-Screen Implementation Plan

### Section 1 — Nhập Excel (`#import`)
- Drop panel: `border-radius: 16px`. `border: 1px solid var(--border-soft)`. Generous padding `28px 24px`.
- Dragover: violet border `var(--violet)`, `background: var(--violet-soft)`.
- Icon box: violet-soft bg, violet icon. `border-radius: 12px`.
- Upload title: Source Serif 4 medium `1.05rem`. "Chọn file thời khóa biểu".
- Button: violet primary. Generous `padding: 9px 20px`.

### Section 2 — Xếp lớp (`#plan`)
- Grid frame: `border: 1px solid var(--border-soft)`, `border-radius: 12px`. No shadow.
- AgGrid: `rowHeight={44}`. Violet selection. Hover `#f0eeff`. Calm zebra (barely visible alternating).
- Keyboard focus: `outline: 2px solid var(--violet)`, `outline-offset: -1px`.
- Status bar: `background: var(--surface-muted)`, `color: var(--ink-2)`.
- Conflict flash: error-soft `#fee2e2` bg + error border, 2 cycles × 500ms.
- ThoiKhoaBieuTable: MaLop accent `color: var(--violet)`. Hover: violet-soft.

### Section 3 — Mã lớp & script (`#output`)
- Section title in Source Serif 4 — matches the calm, "chapter" feel.
- Credit pill: generous padding `8px 12px`. ok: success-soft + success text.
- Textareas: `border-radius: 12px`. `background: var(--surface-muted)` for readonly.
- Copy button: violet outlined (copy is not the "final" action — it's a utility action). On success: violet `CheckIcon`.
- Share: violet text-link style button.
- Manual toggle: violet checkbox. Generous label size `0.9rem`.

---

## 9. State Coverage Plan

| State | Action |
|-------|--------|
| No file | Drop zone remains visible with ghost state. Icon muted violet, label muted ink-3. |
| Importing | Violet CircularProgress in icon box. `aria-busy`. |
| Import error | Error red snackbar. `autoHideDuration: 5000`. |
| Import success | Violet success snackbar. |
| Empty class list | Plan section: calm empty state. Soft violet ghost icon + serif label + muted link. |
| Conflict | Error-soft flash on grid rows + dialog. Dialog title: Source Serif 4. |
| Copy success | Violet CheckIcon. 3s. |
| Error boundary | Serif heading + muted message + calm reload button. |

---

## 10. Accessibility Requirements

- **Violet on white:** `#7c3aed` on `#ffffff` = 6.1:1 ✓.
- **Violet on violet-soft:** `#7c3aed` on `#ede9fe` = 4.6:1 ✓ (borderline — verify. If fails, use `--ink` on `--violet-soft` backgrounds instead).
- **Ink on bg:** `#1e1b2e` on `#f5f4f8` = 14:1 ✓.
- **Ink-3 on surface:** `#6b6789` on `#ffffff` = 5.1:1 ✓.
- **Success on success-soft:** `#065f46` on `#d1fae5` = 5.4:1 ✓.
- **Warning text on warning-soft:** `#92400e` on `#fef3c7` = 5.1:1 ✓.
- Source Serif 4 headings: variable font — ensure `font-display: swap` in font import.
- `rowHeight: 44` improves scan efficiency but also increases clickable area → better touch targets on mobile.
- Focus rings: `3px solid rgba(124,58,237,0.4)`.
- Nav active: `2px solid var(--violet)`, `background: var(--violet-soft)`.
- All reduced-motion, ARIA, skip-link requirements: same as Plan 01.

---

## 11. Responsive Requirements

| Breakpoint | Notes |
|------------|-------|
| 375px | Nav equal-width tabs. Drop zone generous padding reduced to `18px 14px`. AgGrid `rowHeight: 44` helps touch on mobile. |
| 768px | Full width grid. Timetable horizontal scroll. |
| 1024px+ | Full editorial layout. Max-width 1540px. |
| High-DPI | Verify violet accent at high pixel density — should look saturated, not harsh. |

---

## 12. Performance Constraints

- Fonts: Inter (variable) + Source Serif 4. Inter variable font ~80KB woff2 — larger than static Inter but covers all weights. Source Serif 4 400/600 ~45KB. Total new font load: ~125KB vs current ~100KB (Be Vietnam Pro + Noto Sans). Acceptable.
- `rowHeight: 44` prop: no JS overhead. Slightly more DOM paint area on large datasets.
- `cubic-bezier(0.25,1,0.5,1)` transitions: CSS-only, negligible.

---

## 13. Testing and QA Checklist

**Warm editorial specific**
- [ ] Source Serif 4 loads and renders in headings (not body/grid)
- [ ] Inter renders correctly in body and grid cells
- [ ] `rowHeight: 44` applied — grid rows noticeably taller
- [ ] Violet on violet-soft passes 4.5:1 (verify with tool)
- [ ] Error-soft conflict flash visible (light red on off-white)
- [ ] Calm zebra alternating rows: barely visible (not distracting)
- [ ] Dialog: Source Serif 4 title renders in serif
- [ ] Generous radius (12–16px) consistent across all panels
- [ ] 150–200ms transitions feel calm, not sluggish

**Shared checklist**
- [ ] All font weights valid for each font family
- [ ] Drag-and-drop works (violet dragover)
- [ ] Conflict row error-soft flash visible
- [ ] Copy CheckIcon violet success state
- [ ] Empty states render (calm, serif-labeled)
- [ ] Keyboard navigable
- [ ] `prefers-reduced-motion` respected (all transitions suppressed)
- [ ] 375 / 768 / 1440 responsive

---

## 14. Rollout Order

### Phase 1 — Design-system foundation
1. Create `src/theme/tokens.css` — violet-tinted OKLCH vars, generous radius, serif/sans vars
2. Font import: Inter (variable) + Source Serif 4 (400/600)
3. Create `src/theme/muiTheme.ts` — violet palette, Inter body, Source Serif 4 h2/h3
4. Fix font-weight values (Inter valid range, Source Serif 4 has 400/600 only)

### Phase 2 — App shell / navigation
5. Wrap `index.tsx` with warm `ThemeProvider`
6. `App.css` body bg: `var(--bg)` tinted off-white
7. Nav active: violet solid border + violet-soft bg
8. All section title elements: Source Serif 4 via `.section-title` class

### Phase 3 — Core shared components
9. AgGrid: violet vars; `rowHeight={44}` prop; focus ring; calm zebra
10. ThoiKhoaBieuTable: violet accent + generous padding
11. `ScriptDangKyInput`: readonly bg var fix; violet success icon

### Phase 4 — Critical user flows
12. `SelectExcelButton`: drag-and-drop + violet dragover + generous styled zone
13. AgGrid/index.tsx: `rowHeight={44}` prop
14. Conflict row: error-soft flash context wiring
15. Output: violet CheckIcon on copy; generous credit pill

### Phase 5 — Secondary
*(None)*

### Phase 6 — States
16. Empty states: calm serif labels
17. `ErrorBoundary`: serif heading + calm reload button
18. notistack: violet/error custom colors

### Phase 7 — Responsive + accessibility
19. Contrast audit (violet on violet-soft edge case)
20. Touch targets with `rowHeight: 44` on mobile
21. Keyboard audit (generous radius = easier to see focus)
22. 375 / 768 / 1440 visual check

### Phase 8 — Motion + polish
23. All transitions updated to 150–200ms `cubic-bezier(0.25,1,0.5,1)`
24. Conflict flash (error-soft, 2 cycles × 500ms)
25. Dragover violet transition
26. `prefers-reduced-motion` gating

### Phase 9 — Final audit
27. Contrast re-check (violet palette)
28. Font rendering check (Source Serif 4 + Inter at all sizes)
29. `npm run build` clean
30. Cloudflare Pages staging deploy

---
*Plan 05 of 05 — Warm Editorial*
