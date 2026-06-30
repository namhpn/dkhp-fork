# UI/UX Redesign Implementation Plan — Plan 03: Teal Productivity

> **Design System:** Teal Productivity — Light surface, teal primary with orange CTA, micro-interaction focus. Warm enough to feel approachable, structured enough for data-heavy tasks. Recommended by ui-ux-pro-max for Vietnamese productivity tools.

---

## 1. Redesign Objective

Evolve the current zinc-blue neutral system into a warmer, more humanistic productivity tool feel. Replace the cold blue accent with teal (`#0D9488`) — a color that reads as both professional and approachable. Keep orange (`#F97316`) strictly for primary CTAs (register, copy script) to create clear visual hierarchy. Retain the Be Vietnam Pro / Noto Sans pairing (already validated for Vietnamese multilingual readability). Use micro-interactions more intentionally: hover transitions, selection feedback, and focus states that feel tactile.

**Not changing:** architecture, routing, data flow, Zustand store, persistence, Cloudflare Pages deployment.

---

## 2. Current UX Diagnosis

### 2.1 Product purpose
Browser-only timetable planner: import Excel → select non-conflicting classes → copy class codes or registration script.

### 2.2 Primary users and contexts
UIT students planning class schedules for the upcoming semester. Mix of engineering/science/arts students — not all developer-oriented. Teal + orange reads as approachable across all student types, not just CS majors.

### 2.3 Critical user flows
1. **Import** — select `.xlsx`; parse; confirm.
2. **Plan** — filter/select in AgGrid; view timetable; resolve conflicts.
3. **Output** — copy codes; copy script; share.

### 2.4 Current IA problems
None structural. Three-section anchor-nav is correct.

### 2.5 Current interaction problems
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
- **Teal-specific:** teal `#0D9488` on white `#ffffff` = 5.3:1 ✓. On `--bg` (`#F0FDFA`) = verify. On `--blue-soft` equivalent (teal-soft) = verify.
- Orange `#F97316` on white = 3.1:1 — fails 4.5:1 for body text. Orange must be used only on large text or with white text on orange background. For CTA buttons: white text on `#F97316` background = acceptable for UI components (3:1 minimum for UI elements at any size is WCAG 2.1 §1.4.11).

### 2.8 Empty/loading/error-state gaps
Same baseline as Plans 01/02.

### 2.9 Teal design opportunities
1. Teal as the primary brand color across: upload icon box, nav active state, row selection, focus rings, credit pill (ok state), timetable class cell accents.
2. Orange for: primary action buttons only (Chọn file, Sao chép script). Not for text, not for decorative use.
3. Micro-interactions: upload panel border animates teal on hover (not just on drag). Row selection: 80ms background transition. Button hover: `translateY(-1px)` with shadow change.

---

## 3. Code-Level UI Audit

Same baseline as Plan 01 (13/20). No additional teal-specific code issues beyond the color swap.

---

## 4. Target Design Direction — Teal Productivity

**Color strategy:** Committed. Teal carries 15–25% of surface area (nav active, icon boxes, selection states, focus rings, section accents). Orange strictly CTA-only.

**Palette:**

| Token | OKLCH | Hex |
|-------|-------|-----|
| `--bg` | `oklch(97.5% 0.008 185)` | `#f0fdfa` |
| `--surface` | `oklch(100% 0 0)` | `#ffffff` |
| `--surface-muted` | `oklch(95.5% 0.006 185)` | `#e6faf6` |
| `--ink` | `oklch(25% 0.04 195)` | `#134e4a` |
| `--ink-2` | `oklch(40% 0.04 195)` | `#1f6b65` |
| `--ink-3` | `oklch(55% 0.03 185)` | `#4a857f` |
| `--border` | `oklch(88% 0.01 185)` | `#b2e4de` |
| `--border-soft` | `oklch(93% 0.006 185)` | `#d0f3ee` |
| `--teal` | `oklch(57% 0.14 195)` | `#0d9488` |
| `--teal-2` | `oklch(64% 0.16 195)` | `#14b8a6` |
| `--teal-soft` | `oklch(96% 0.03 195)` | `#ccfbf1` |
| `--orange` | `oklch(68% 0.18 55)` | `#f97316` |
| `--orange-soft` | `oklch(96% 0.02 55)` | `#fff7ed` |
| `--success` | `oklch(50% 0.14 165)` | `#059669` |
| `--success-soft` | `oklch(96% 0.02 165)` | `#d1fae5` |
| `--warning` | `oklch(58% 0.14 75)` | `#d97706` |
| `--warning-soft` | `oklch(96.5% 0.02 75)` | `#fef3c7` |
| `--error` | `oklch(42% 0.18 28)` | `#b91c1c` |
| `--radius-sm` | — | `8px` |
| `--radius-md` | — | `10px` |
| `--radius-lg` | — | `14px` |

**Typography:** Be Vietnam Pro 600/700 headings (unchanged from current — excellent for Vietnamese). Noto Sans 400/500/600 body (unchanged). Font loading already present in `App.css` — keep import, adjust weights only.

**Motion:** Micro-interactions as design intention. 80–150ms transitions. Button hover: `translateY(-1px) + subtle shadow change`. Row selection: 80ms background. Upload panel: border and background transition on hover (50ms) and drag (instant visual state). Focus reveal: 100ms.

**Radius:** `8px` controls (tighter), `10px` inputs, `14px` panels (slightly rounder than current 12px — friendlier).

---

## 5. Information Architecture Changes

None structural. Optional title "Xếp lớp UIT".

---

## 6. Design-System Changes

### 6.1 `src/theme/tokens.css`
Teal + orange custom properties. Teal-tinted background (`#f0fdfa`) replaces neutral white. Teal-tinted borders replace zinc borders.

### 6.2 `src/theme/muiTheme.ts`
```ts
createTheme({
  palette: {
    primary: { main: '#0d9488', dark: '#0f766e', light: '#14b8a6', contrastText: '#ffffff' },
    secondary: { main: '#f97316', contrastText: '#ffffff' },
    background: { default: '#f0fdfa', paper: '#ffffff' },
    text: { primary: '#134e4a', secondary: '#1f6b65' },
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#b91c1c' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Noto Sans", ui-sans-serif, sans-serif',
    h1: { fontFamily: '"Be Vietnam Pro", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Be Vietnam Pro", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Be Vietnam Pro", sans-serif', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', transition: 'all 80ms ease' },
        containedPrimary: {
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(13,148,136,0.3)' }
        }
      }
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
  }
})
```

### 6.3 AgGrid teal vars
```css
--ag-alpine-active-color: #0d9488;
--ag-row-hover-color: #f0fdfa;
--ag-selected-row-background-color: #ccfbf1;
--ag-input-focus-border-color: #0d9488;
--ag-background-color: #ffffff;
--ag-header-background-color: #f0fdfa;
--ag-odd-row-background-color: #f9fffe;
--ag-range-selection-background-color: rgba(13,148,136,0.12);
```

### 6.4 Font weight corrections
Same as Plan 01: `750` → `700`, `850` → `800`, `650` → `600`.

### 6.5 Micro-interaction additions
```css
/* Upload panel hover */
.upload-drop-panel {
  transition: border-color 80ms ease, background-color 80ms ease;
}
.upload-drop-panel:hover {
  border-color: var(--teal);
  background: var(--surface-muted);
}
/* Upload panel dragover */
.upload-drop-panel.drag-active {
  border-color: var(--teal);
  background: var(--teal-soft);
}
/* Section nav micro */
.section-nav-item {
  transition: all 80ms ease;
}
.section-nav-item.active {
  color: var(--teal);
  background: var(--teal-soft);
  border: 2px solid var(--teal);
}
```

---

## 7. Component Migration Plan

| Component | Type | Key changes |
|-----------|------|-------------|
| `App.css` | Refactor | Teal token refs; micro-interaction transitions; border-radius updates; nav active teal |
| `AgGrid/styles.css` | Update | Teal `--ag-*` vars; focus ring teal; weights |
| `ThoiKhoaBieuTable/styles.css` | Update | Teal class cell accent (`color: var(--teal)` for MaLop); hover state |
| `ScriptDangKyInput` | Fix | `var(--surface-muted)` readonly bg; teal copy icon on success |
| `SelectExcelButton` | Enhance | Drag-and-drop; hover/drag visual states; orange CTA button; teal icon box |
| `TrungTkbDialog` | Enhance | Conflict flash + context wiring |
| `index.tsx` | Add | `ThemeProvider` teal theme |
| `ErrorBoundary` | Polish | Teal-accented fallback UI |

---

## 8. Screen-by-Screen Implementation Plan

### Section 1 — Nhập Excel (`#import`)
- Upload panel: hover → teal border + muted teal bg. Drag → teal-soft bg.
- Icon box: `background: var(--teal-soft)`, icon `var(--teal)`.
- CTA button: orange (`secondary` palette color in MUI). "Chọn file thời khóa biểu". Hover lifts `translateY(-1px)`.
- File status: `{n} lớp học`, `color: var(--ink-2)`.

### Section 2 — Xếp lớp (`#plan`)
- Grid: teal selection `--ag-selected-row-background-color: #ccfbf1`. Hover `#f0fdfa`.
- Focus ring: `2px solid var(--teal)`.
- Status bar: `background: var(--surface-muted)` (teal-tinted), `color: var(--ink-2)`.
- Credit pill ok: `color: var(--success)`, `background: var(--success-soft)`.
- Conflict flash: warning amber `#d97706` border + `#fef3c7` bg, 2 cycles.

### Section 3 — Mã lớp & script (`#output`)
- Copy script button: orange MUI `variant="contained"` with hover lift.
- Copy class codes: teal `variant="outlined"` with teal icon.
- On copy success: `CheckIcon` → `color: var(--teal)` (not orange — success, not CTA).
- Manual toggle: teal checkbox. Full row on mobile.

### ThoiKhoaBieuTable
- Class cell MaLop accent: `color: var(--teal)` (was blue).
- Cell hover: `background: var(--teal-soft)`.
- Remove button: keep error red — appropriate for destructive action.

---

## 9. State Coverage Plan

| State | Action |
|-------|--------|
| No file | Teal ghost icon (outlined, muted teal) + label |
| Importing | Teal CircularProgress. `aria-busy`. |
| Import error | Error red snackbar. `autoHideDuration: 5000`. |
| Import success | Teal success snackbar. |
| Empty class list | Teal ghost icon + label + teal link. |
| Conflict | Amber flash on grid rows + dialog. |
| Copy success | Teal CheckIcon. |
| Error boundary | Teal-accented icon + heading + reload. |

---

## 10. Accessibility Requirements

- **Teal on white:** `#0d9488` on `#ffffff` = 5.3:1 ✓ (body text safe).
- **Teal on teal-soft:** `#0d9488` on `#ccfbf1` = verify with tool — likely ~3.8:1. Do not use teal text on teal-soft background. Use `--ink` on teal-soft instead.
- **Orange on white:** `#f97316` on `#ffffff` = 3.1:1 — only use white text on orange background (buttons), never orange text on white.
- **Ink on teal-bg:** `#134e4a` on `#f0fdfa` = ~13:1 ✓.
- Focus ring: `3px solid rgba(13,148,136,0.5)`.
- Nav active: `2px solid var(--teal)`.
- All other requirements same as Plan 01.

---

## 11. Responsive Requirements

Same as Plans 01/02. Teal-bg at mobile: ensure `--bg` `#f0fdfa` doesn't cause color-shift on low-gamut screens. Test on sRGB display (most mobile).

---

## 12. Performance Constraints

- Font: Be Vietnam Pro + Noto Sans already loaded. No new font families needed.
- Micro-interactions: pure CSS, zero JS impact.
- Teal token additions: ~1KB.
- Orange CTA: no performance impact.

---

## 13. Testing and QA Checklist

**Teal-specific**
- [ ] `#0d9488` text on white passes 4.5:1
- [ ] Orange (`#f97316`) never used as text color on white/light bg
- [ ] White text on orange button passes 3:1 (UI component minimum)
- [ ] Teal-soft backgrounds have sufficient contrast with ink text
- [ ] AgGrid teal selection state visible (not too subtle)
- [ ] Teal focus rings visible on all interactive elements
- [ ] Micro-interactions: all 80–150ms, no layout shift

**Shared checklist**
- [ ] All font weights valid
- [ ] Drag-and-drop works (teal dragover state)
- [ ] Conflict flash visible (amber on teal-soft bg)
- [ ] Copy icon swap works (teal CheckIcon)
- [ ] Empty states render
- [ ] Keyboard navigable
- [ ] `prefers-reduced-motion` respected (micro-interactions suppressed)
- [ ] 375 / 768 / 1440 responsive

---

## 14. Rollout Order

### Phase 1 — Design-system foundation
1. Create `src/theme/tokens.css` — teal OKLCH vars
2. Update `App.css` font import (keep existing); update `:root` to teal tokens
3. Fix font-weight values
4. Create `src/theme/muiTheme.ts` — teal/orange palette

### Phase 2 — App shell / navigation
5. Wrap `index.tsx` with teal `ThemeProvider`
6. Nav active: teal solid border + teal-soft bg
7. Body bg: `var(--bg)` teal-tinted

### Phase 3 — Core shared components
8. AgGrid teal vars + focus ring
9. ThoiKhoaBieuTable teal accent
10. `ScriptDangKyInput` fix + teal success icon
11. Credit pill success → teal success color

### Phase 4 — Critical user flows
12. `SelectExcelButton`: hover + drag + drag-and-drop; orange CTA
13. Conflict row: amber flash wiring
14. Output: orange copy script CTA; teal copy class CTA

### Phase 5 — Secondary
*(None)*

### Phase 6 — States
15. Teal empty states
16. `ErrorBoundary` teal fallback
17. notistack teal/orange variant colors

### Phase 7 — Responsive + accessibility
18. Contrast audit (orange, teal-on-teal-soft edge cases)
19. Keyboard audit
20. 375 / 768 / 1440 check

### Phase 8 — Motion + polish
21. Micro-interaction review: all transitions intentional
22. Upload hover/drag states
23. Button hover lift
24. `prefers-reduced-motion` gating for all transitions

### Phase 9 — Final audit
25. Contrast re-check
26. `npm run build` clean
27. Cloudflare Pages staging deploy

---
*Plan 03 of 05 — Teal Productivity*
