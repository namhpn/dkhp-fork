# UI/UX Redesign Implementation Plan — Plan 01: Monochrome Precision

> **Design System:** Monochrome Precision — Near-black ink on neutral white, zinc tonal ramp, single blue accent ≤10% surface coverage. Zero decorative elements. Maximum data density with surgical restraint.

---

## 1. Redesign Objective

Sharpen the existing clean baseline into a tool that feels engineered rather than styled. Remove visual noise accumulated through MUI defaults (ghost-card borders + shadows on same element, overrounded corners, soft-gray text below contrast threshold). Make the three-step workflow invisible — the user should never think about the interface, only their class selections.

**Not changing:** the single-page layout, Vietnamese labels, the three-section structure (Nhập Excel → Xếp lớp → Mã lớp & script), all business logic and state management (Zustand store), AgGrid column/filter state, localStorage persistence, Cloudflare Pages deployment.

---

## 2. Current UX Diagnosis

### 2.1 Product purpose
Browser-only timetable planner: import Excel → select non-conflicting classes → copy class codes or registration script.

### 2.2 Primary users and contexts
UIT students under registration deadline pressure. One device (often mobile or 13" laptop). Running this tool in a second browser tab while the registration portal is open in the first. Zero tolerance for confusion.

### 2.3 Critical user flows
1. **Import** — click to select `.xlsx`; see immediate confirmation (file name, row count).
2. **Plan** — filter/sort AgGrid by subject, section, teacher; select row to add class; see visual conflict alert; review timetable grid below.
3. **Output** — see credit count and status pill; copy class-code list; optionally copy auto-registration script; share link.

### 2.4 Current IA problems
- None structural — the single-page anchor-nav pattern is correct.
- Page title "Courses" is English in a Vietnamese product — minor identity mismatch, low priority.

### 2.5 Current interaction problems
- `TrungTkbDialog` gives text-only conflict info. No grid highlight — users must read and mentally map back to conflicting row.
- "Nhập mã lớp" toggle is tucked next to the credit pill with MUI Tooltip — undiscoverable on mobile.
- Upload drop panel does not implement actual drag-and-drop despite drop-zone visual affordance.
- `getReadonlySx` hardcodes `#f8fafc` background — breaks any future theme change.

### 2.6 Copy/content problems
- Upload title "File Excel thời khóa biểu" is a noun phrase, not an action prompt.
- Empty state in plan section: "Nạp file Excel để xem danh sách lớp." — functional but no icon, no visual hierarchy.

### 2.7 Accessibility risks
- `section-nav-item` active state border is `rgba(37,99,235,0.24)` — low contrast against blue-soft background.
- `font-weight: 750` and `font-weight: 850` — non-standard weights, browser-dependent rendering.
- AgGrid row selection has no visible focus ring in keyboard navigation mode.

### 2.8 Empty/loading/error-state gaps
- No loading skeleton for AgGrid — only LinearProgress bar (adequate but thin).
- No drag-and-drop implementation despite visual affordance.
- ErrorBoundary exists but renders a raw string instead of designed fallback.
- ThoiKhoaBieuTable returns null when no classes selected — no "empty" visual.

### 2.9 Redesign opportunities
1. Replace `font-weight: 750/850` with valid weights (700/800).
2. Add actual drag-and-drop to the upload zone.
3. Strengthen nav active indicator beyond color alone.
4. Make the manual-mode toggle more visible on mobile.
5. Improve empty states with icon + label.
6. Add AgGrid row highlight when conflict dialog opens.
7. Configure MUI theme so component defaults align with design tokens.

---

## 3. Code-Level UI Audit

```
Accessibility:     2/4   — invalid font weights, nav active a11y weak, grid keyboard focus missing
Performance:       3/4   — lazy AgGrid good; xlsx 300KB+ unavoidable; no extra splitting needed
Responsive:        3/4   — horizontal scroll works; mobile nav ok; manual toggle hidden mobile
Theming:           2/4   — MUI theme not configured (Material defaults leak); hardcoded hex in component
Anti-patterns:     3/4   — no gradient text, no glassmorphism; ghost-card pattern on .grid-frame

Total: 13/20 — Targeted overhaul recommended
```

**Priority findings:**

| ID | P | Issue | Location |
|----|---|-------|----------|
| A1 | P1 | `font-weight: 750/850` — invalid, browser-rounds | App.css, AgGrid/styles.css |
| A2 | P1 | MUI theme not configured — defaults override tokens | index.tsx |
| A3 | P1 | `getReadonlySx` hardcodes `#f8fafc` — not a var | ScriptDangKyInput.tsx |
| A4 | P1 | `.grid-frame` border + implicit shadow — ghost-card | App.css |
| B1 | P2 | Nav active border rgba 0.24 — low contrast | App.css |
| B2 | P2 | No drag-and-drop despite affordance | SelectExcelButton.tsx |
| B3 | P2 | AgGrid keyboard focus ring absent | AgGrid/styles.css |
| C1 | P3 | Upload title is noun phrase not action | SelectExcelButton.tsx |
| C2 | P3 | Empty plan state has no icon | App.tsx |

---

## 4. Target Design Direction — Monochrome Precision

**Color strategy:** Restrained. Zinc neutrals via OKLCH. Single blue accent ≤10% surface area. No warm tints on background. No tinted neutrals by default-warmth habit.

**Palette:**

| Token | OKLCH | Hex |
|-------|-------|-----|
| `--bg` | `oklch(97.8% 0 0)` | `#f9f9f9` |
| `--surface` | `oklch(100% 0 0)` | `#ffffff` |
| `--surface-muted` | `oklch(95.8% 0 0)` | `#f4f4f4` |
| `--ink` | `oklch(12% 0 0)` | `#1a1a1a` |
| `--ink-2` | `oklch(35% 0 0)` | `#4a4a4a` |
| `--ink-3` | `oklch(54% 0 0)` | `#737373` |
| `--border` | `oklch(88% 0 0)` | `#dcdcdc` |
| `--border-soft` | `oklch(92% 0 0)` | `#ebebeb` |
| `--blue` | `oklch(52% 0.22 255)` | `#2563eb` |
| `--blue-soft` | `oklch(96.5% 0.015 255)` | `#eff6ff` |
| `--success` | `oklch(42% 0.13 165)` | `#047857` |
| `--warning` | `oklch(50% 0.13 55)` | `#b45309` |
| `--error` | `oklch(42% 0.18 28)` | `#b91c1c` |

**Typography:** Be Vietnam Pro 600/700 headings. Noto Sans 400/500/600 body. No weights outside the loaded font's available set. No display scale — product UI uses compact fixed sizes.

**Motion:** 120–150ms. CSS transitions only. No libraries.

**Radius:** `--radius-sm: 8px` controls, `--radius-md: 10px` inputs, `--radius-lg: 12px` panels.

**Banned:** side-stripe borders, gradient text, glassmorphism, hero-metric stats, border + wide box-shadow on same element, `border-radius > 12px` on cards.

---

## 5. Information Architecture Changes

None. Single-page, three-section structure is correct. Anchor nav preserved.

---

## 6. Design-System Changes

### 6.1 `src/theme/tokens.css` (new file)
Move all `:root` custom properties here. Add OKLCH definitions with hex fallbacks. Import before App.css.

### 6.2 `src/theme/muiTheme.ts` (new file)
Full MUI `createTheme` with:
- `palette.primary.main`: `#2563eb`
- `palette.text.primary/secondary`: aligned to token ink values
- `palette.background.default/paper`: aligned to `--bg` / `--surface`
- `shape.borderRadius`: `10`
- `typography.fontFamily`: Noto Sans stack
- `MuiButton`: no default shadow, `textTransform: none`, weight 600
- `MuiTextField` readonly: `var(--surface-muted)` background
- `MuiCheckbox`: `--blue` color
- `MuiDialog`: `borderRadius: 12px`

### 6.3 Font weight corrections
`font-weight: 750` → `700`, `font-weight: 850` → `800` (or `700`), `font-weight: 650` → `600`. Applied globally across all CSS files.

### 6.4 Removals
`.drop-shadow-blue:hover { filter: none }` — dead rule. Remove. `@keyframes flash` scoped to using component only.

---

## 7. Component Migration Plan

| Component | Type | Key changes |
|-----------|------|-------------|
| `App.css` | Refactor | Token refs; fix weights; remove ghost-card; strengthen nav border |
| `SelectExcelButton` | Enhance | Drag-and-drop; action-phrase copy; dragover visual state |
| `TrungTkbDialog` | Enhance | Pass conflict row IDs to grid context for flash highlight |
| `AgGrid/styles.css` | Fix | Keyboard focus ring; font weight fix; token alignment |
| `AgGrid/index.tsx` | Fix | Emit conflict row IDs via context |
| `ScriptDangKyInput` | Fix | Replace `#f8fafc` with `var(--surface-muted)` |
| `ThoiKhoaBieuTable/styles.css` | Minor | Token alignment only |
| `index.tsx` | Add | Wrap in `ThemeProvider` with muiTheme |
| `ErrorBoundary` | Polish | Icon + heading + reload button fallback |

---

## 8. Screen-by-Screen Implementation Plan

### Section 1 — Nhập Excel (`#import`)
- Add `onDragOver`/`onDrop` to upload panel. Dragover visual: `--blue` border + `--blue-soft` bg.
- Copy: "Chọn file thời khóa biểu" (imperative).
- Status: show "{n} lớp học" after parse (more meaningful than "dòng").
- Import button: `CircularProgress size=16` inline + "Đang đọc…" label while importing.

### Section 2 — Xếp lớp (`#plan`)
- Grid frame: `border: 1px solid var(--border-soft)` only. No shadow. `border-radius: 8px`.
- AgGrid CSS: keyboard focus ring `.ag-cell-focus { outline: 2px solid var(--blue); outline-offset: -2px; }`.
- Conflict rows: when `TrungTkbDialog` opens, apply `conflict-flash` CSS class to conflicting rows in the grid. 2 cycles × 400ms, then class removed.
- ThoiKhoaBieuTable: token-align only.

### Section 3 — Mã lớp & script (`#output`)
- Manual toggle: full-width row on `xs` breakpoint. Label "Nhập mã lớp thủ công".
- Textareas: `var(--surface-muted)` background (not `#f8fafc`).
- Copy button: `CheckIcon` swap for 3s after clipboard success.
- Share button: same icon-swap pattern.

---

## 9. State Coverage Plan

| State | Current | Action |
|-------|---------|--------|
| No file loaded | Bare empty message | Add icon (32px, muted) + label in 120px min-height zone |
| Importing | CircularProgress | Keep; add `aria-busy="true"` |
| Import error | notistack error | Keep; set `autoHideDuration: 5000` |
| Empty class list | Text only | Icon + label + scroll-to-import link |
| Conflict | Dialog text only | Add grid row flash |
| Copy success | Tooltip only | Icon swap on button |
| Error boundary | Raw string | Icon + heading + reload button |

---

## 10. Accessibility Requirements

- All body text ≥ 4.5:1. `--ink-3` `#737373` on `#ffffff` = 4.6:1. ✓
- Focus rings: `3px solid rgba(37,99,235,0.4)`, offset `2px`. Extend to `.ag-cell-focus`.
- Nav active: `2px solid var(--blue)` solid border (not alpha-reduced).
- Font weights: all valid values only.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` already in App.css — ensure conflict-flash animation is gated.
- ARIA: `aria-live="polite"` on status messages; `aria-disabled` on disabled textareas.

---

## 11. Responsive Requirements

| Breakpoint | Notes |
|------------|-------|
| 375px | Nav equal-width tabs; section header stacks; output textareas stack; manual toggle full row |
| 768px | Grid full width; timetable horizontal scroll |
| 1024px | No changes from current |
| 1440px+ | Max-width 1540px maintained, centered |

---

## 12. Performance Constraints

- Keep AgGrid lazy import.
- `xlsx` large dependency — out of scope.
- MUI theme: ~0 bundle impact (tree-shaken).
- `tokens.css`: ~2KB.
- No animation libraries.

---

## 13. Testing and QA Checklist

**Visual**
- [ ] No text fails 4.5:1 contrast
- [ ] No `border + wide box-shadow` pairing on same element
- [ ] No `border-radius > 12px` on cards
- [ ] No gradient text
- [ ] All font weights are valid (400/500/600/700/800)
- [ ] Nav active state has `2px solid` visible border

**Interaction**
- [ ] Drag-and-drop accepts `.xlsx`, rejects others
- [ ] File input fallback works
- [ ] Controls disabled during import
- [ ] Conflict dialog opens AND grid row flashes
- [ ] Copy icon swaps to check on success
- [ ] Manual toggle visible and usable at 375px

**Accessibility**
- [ ] Tab order matches visual reading order
- [ ] AgGrid keyboard navigable with visible focus ring
- [ ] Dialog focus trapped and returned on close
- [ ] VoiceOver/NVDA smoke test passes
- [ ] `prefers-reduced-motion` gates all animations

**Responsive**
- [ ] 375px: no horizontal overflow
- [ ] 768px: grid + timetable scroll correctly
- [ ] 1440px: max-width applied

**State**
- [ ] Empty states: import, plan (no data), plan (no selection)
- [ ] Persistence: refresh restores state
- [ ] Error boundary renders fallback UI

---

## 14. Rollout Order

### Phase 1 — Design-system foundation
1. Create `src/theme/tokens.css` — OKLCH custom properties
2. Update `App.css` to import tokens; replace hardcoded hex with vars
3. Fix all font-weight values across CSS files
4. Create `src/theme/muiTheme.ts` — full MUI theme

### Phase 2 — App shell / navigation
5. Wrap `index.tsx` with `ThemeProvider`
6. Strengthen nav active border
7. Verify header/nav at all breakpoints

### Phase 3 — Core shared components
8. Fix `.grid-frame` (border only, no shadow)
9. Fix `ScriptDangKyInput` hardcoded color
10. Fix `AgGrid/styles.css` (focus ring, weights, tokens)
11. Align `ThoiKhoaBieuTable/styles.css` tokens

### Phase 4 — Critical user flows
12. `SelectExcelButton`: drag-and-drop + copy update
13. `AgGrid/index.tsx`: emit conflict row IDs
14. `TrungTkbDialog`: wire conflict rows to grid flash
15. Output section: icon swap on copy/share

### Phase 5 — Secondary screens
*(None — single-page product)*

### Phase 6 — Empty/loading/error/success states
16. Import empty state: icon + label
17. Plan empty state: icon + label + link
18. `ErrorBoundary` fallback UI
19. Import loading: `aria-busy` + `aria-label`

### Phase 7 — Responsive + accessibility pass
20. Full keyboard audit
21. VoiceOver/NVDA smoke test
22. Contrast audit
23. 375 / 768 / 1440 visual check

### Phase 8 — Motion + polish
24. Confirm all transitions 120–150ms
25. Drag-over visual state
26. Conflict-row flash animation
27. Verify `prefers-reduced-motion`

### Phase 9 — Final audit
28. Re-run contrast check
29. Re-run keyboard test
30. `npm run build` — no warnings
31. Deploy to Cloudflare Pages staging

---
*Plan 01 of 05 — Monochrome Precision*
