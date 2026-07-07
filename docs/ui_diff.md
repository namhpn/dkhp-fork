# UI Diff — Spec vs Current Implementation

**Generated:** 2026-07-06  
**Spec sources:** `docs/prompt_v3.md`, `docs/courses_design_inspiration_research.md`  
**Implementation reviewed:** `src/views/`, `src/theme/`, `public/index.html`, `src/zus/`, `src/manualInput.ts`

This document consolidates six scoped reviews (app shell/layout, design tokens & accessibility, Xếp lớp, Nhập mã lớp, timetable panel, journey & anti-drift) comparing the v3 design contract against the current codebase.

---

## Executive summary

The current app is a **pre-v3 vertical MVP** with solid **backend logic** (overlap detection, manual parsing, Zustand persistence) but **major structural drift** from the approved mockup contract.

| Area | Est. alignment | Verdict |
|---|---|---|
| App shell & layout | ~28% | Forbidden `single-page-flow`; no two-column desktop; file/output in wrong zones |
| Design tokens & a11y | ~58% | Color values mostly OK; typography, motion, WCAG contract largely missing |
| Xếp lớp class explorer | ~25–30% | AG Grid prototype, not spec class explorer |
| Nhập mã lớp work area | ~25% UI / ~70% logic | Wizard tags, not resolution-first layout |
| Timetable panel | ~35% shell / ~65% grid | Grid engine OK; panel shell, toolbar, readiness wrong |
| Journey & anti-drift | Major drift | 8+ forbidden patterns still present |

**Bottom line:** Treat the current UI as legacy. A structural refactor (shell → two-column layout → collapse forbidden sections → rebuild explorer/recommendation surfaces) is required before visual polish.

---

## 1. App shell, layout & responsive

### Matches

| Spec | Implementation |
|---|---|
| App name `Courses` in shell | `App.tsx` — `PageHeader` title |
| Mode switch `Xếp lớp` / `Nhập mã lớp` | Centered segmented toggle in header |
| Two modes share one session (no routes) | Conditional render in single `<main>` |
| `<html lang="vi">` | `public/index.html` |
| No account/profile/notification/admin chrome | Confirmed absent |
| Be Vietnam Pro + Noto Sans loaded | `App.css` Google Fonts import |
| Skip link present (partial) | `App.tsx` — `Bỏ qua điều hướng` |
| `:focus-visible` ring on interactives | `App.css` outline styles |
| `prefers-reduced-motion` respected | Multiple CSS blocks |
| File import: click + drag-drop, parsing spinner | `SelectExcelButton.tsx` |
| Light utility aesthetic | No dashboard/marketing framing |

### Gaps

#### P0 — Structural violations

| Spec | Current implementation | Refs |
|---|---|---|
| Desktop ≥1280px: two-column (58/42 or 60/40), 24px gap | Vertical `single-page-flow`; no column split at any breakpoint | `App.tsx:189`, `App.css:92–96` |
| **Forbidden:** desktop vertical single-page-flow | Entire app stacks `ImportSection` → `PlanSection` → `OutputSection` | `App.tsx:189–201` |
| File controls in header right zone only | Body `ImportSection` titled `Nhập Excel` with large drop panel | `App.tsx:64–71,191` |
| **Forbidden:** `ImportSection` / body-level `Nhập Excel` | Always rendered as first section below header | `App.tsx:64–71` |
| **Forbidden:** `OutputSection` / `Mã lớp & script` | Separate `#output` section with `output-panel` | `App.tsx:162–179` |
| Output actions only in timetable toolbar | Copy/script/share in `OutputSection`; timetable has image icons only | `App.tsx:88–98,162–179` |
| **Forbidden:** stat counters (`Lớp đã chọn`, `Số tín chỉ`) | `grid-statusbar-v2` metric cards in timetable area | `App.tsx:101–110` |
| Sticky timetable right column (`top: 72px`) | `.schedule-panel { position: relative }`; scrolls with page | `App.css:641–648` |
| App shell fixed 56px: brand + mode + file controls | Content-sized header; no file zone in shell | `App.tsx:35–49` |
| `Xếp lớp`: left explorer, right timetable | AgGrid then `SchedulePanel` stacked vertically | `App.tsx:138–158` |
| `Nhập mã lớp`: left input + 40/60 split, right timetable | `OutputSection` 50/50 side-by-side, then timetable | `App.tsx:172–176`, `App.css:344–352` |
| Research §10: header-only import surface | Body `ImportSection` | `App.tsx:64–71` |

#### P1 — Shell contract gaps

| Spec | Current | Refs |
|---|---|---|
| `<header>`, `<nav aria-label="Chế độ làm việc">`, `<main id="main-workspace">` | `<div.header-minimal>`, plain buttons, `id="main-content"` | `App.tsx:35–49,185–203` |
| Skip: `Bỏ qua đến nội dung chính` → `#main-workspace` | `Bỏ qua điều hướng` → `#main-content` | `App.tsx:186–189` |
| Mode switch: `tablist`/`tab`, `aria-selected`, arrow keys | Plain `<button>`s, no ARIA | `App.tsx:42–45` |
| Tab order: skip → mode → file → work → timetable | File controls in 2nd page section (`#import`) | `App.tsx:191` |
| Document title per mode | Static `Courses` | `index.html:11` |
| Breakpoints: 1280 / 768 / mobile stack order | Only `@media (max-width: 760px)` tweaks | `App.css:782–802` |
| Timetable always visible (empty state inside panel) | `SchedulePanel` returns `null` when no selection | `App.tsx:80` |
| Mode-switch confirmation when leaving `Nhập mã lớp` with unresolved input | Direct `setIsChiVeTkb` toggle | `App.tsx:43–44` |

#### P2 — Polish

| Spec | Current | Refs |
|---|---|---|
| `no_file` header: compact `Tải file thời khóa biểu (.xlsx)` | Large centered drop zone | `SelectExcelButton.tsx:112–163` |
| Success header: filename + `Đổi file` + remove icon | Filename + `Đổi file` in panel; **no remove** | `SelectExcelButton.tsx` |
| `replace_confirm` / `remove_confirm` modals | Not implemented | — |
| Section titles: `Danh sách lớp`, `Nhập mã môn hoặc mã lớp` | `Nhập Excel`, `Xếp lớp`, `Mã lớp & script` | `App.tsx:67,140,169` |
| Center-left mode switch; right file zone | Mode centered; right grid column empty | `App.css:116–123` |

---

## 2. Design system tokens & accessibility

### Matches

| Token / rule | Status |
|---|---|
| Core OKLCH + hex palette values | ~88% value match in `tokens.css` |
| `focus-ring` value defined | `tokens.css:82` |
| Focus outline on interactives | `App.css:61–68` |
| Panel radius 12px (utility) | `--radius-lg: 12px` |
| Border-first surfaces (mostly) | Panels use `border: 1px solid` |
| `prefers-reduced-motion` global override | `App.css:804–813` |
| Practical empty states (no illustrations) | `App.tsx:152–156` |

### Gaps

#### P0 — WCAG / contract blocking

| Spec | Current | Refs |
|---|---|---|
| Skip link: correct copy, `#main-workspace`, `:focus-visible` only | Wrong copy/target; uses `:focus` | `App.tsx:186–189`, `App.css:84–86` |
| Landmarks: `<header>`, `<nav>`, `<main id="main-workspace">` | Missing semantic landmarks | `App.tsx:185–203` |
| Mode switch `tablist` + keyboard | Plain buttons | `App.tsx:41–45` |
| Live regions (`aria-live`) for key events | **None** in `src/` | — |
| Table primary text ≥14px | AG Grid global `--ag-font-size: 13px` | `AgGrid/styles.css:6` |
| Icon-only targets ≥44×44px | Toolbar 30×30px; field actions 28×28px | `App.css:557,619,662` |
| `--app-primary` maps to `primary` (#2563eb) | Maps to `--ink-2` (#4a4a4a); skip link uses wrong bg | `App.css:10,79` |

#### P1 — Token drift

| Spec token | Current | Refs |
|---|---|---|
| Names: `text-primary`, `primary`, `danger`, `border-strong` | Renamed: `ink`, `blue`, `error`, `border-soft` | `tokens.css` |
| Font weights 400, 600 only | Loads 500–800; uses 700/800 widely | `App.css:1,111,198` |
| Body 15px (16px forms) | 16px default; many rem sizes &lt;14px | `App.css` scattered |
| `font-variant-numeric: tabular-nums` on codes/periods | Not implemented | — |
| `motion-fast` 150ms, `motion-base` 200ms | `--duration-fast: 120ms`; toggle 220ms | `tokens.css:76`, `App.css:151` |
| MUI radius 8px controls / 12px panels | MUI global `borderRadius: 10` | `muiTheme.ts:62+` |
| Active mode: `primary` / `primary-subtle` | Active tab uses dark `--app-ink` fill | `App.css:159–162` |
| `danger-subtle` `#fef2f2` | `#fee2e2` | `tokens.css:47` |
| Selected row `#eff6ff` | Ag Grid `#dbeafe` | `AgGrid/styles.css:13` |
| Max workspace 1440px | `--max-width: 1540px` | `tokens.css:86` |

#### Token comparison table

| Spec role | Spec hex | Impl token | Impl hex | Status |
|---|---|---|---|---|
| `app-bg` | `#f9f9f9` | `--bg` | `#f9f9f9` | ✅ |
| `surface` | `#ffffff` | `--surface` | `#ffffff` | ✅ |
| `text-primary` | `#1a1a1a` | `--ink` | `#1a1a1a` | ⚠️ name |
| `primary` | `#2563eb` | `--blue` | `#2563eb` | ⚠️ name |
| `primary-subtle` | `#eff6ff` | `--blue-soft` | `#eff6ff` | ⚠️ name |
| `danger` | `#b91c1c` | `--error` | `#b91c1c` | ⚠️ name |
| `danger-subtle` | `#fef2f2` | `--error-soft` | `#fee2e2` | ❌ hex |
| `focus-ring` | `rgba(37,99,235,0.32)` | defined | same | ⚠️ not consumed via var |

---

## 3. Xếp lớp — class explorer

### Matches

| Spec | Implementation |
|---|---|
| Dense browsable table when file loaded | `AgGrid` with full `rowData` |
| Core columns present (partial) | `MaLop`, `MonHoc`, `TenGV`, `Thu`, `Tiet`, `PhongHoc`, `SoTc`, `SiSo`, `HTGD`, `NgonNgu` |
| Conflicting rows stay visible (not filtered out) | `isRowSelectable` disables but does not hide |
| Virtual scroll + pinned header | Fixed-height AG Grid with row virtualization |
| Selection syncs to store quickly | `onSelectionChanged` → `setSelectedClasses` |
| Filter persistence in session | `agGridFilterModel` stored/restored |
| No-file gate until Excel loaded | Empty branch when `!allClasses.length` |
| Overlap detection logic | `hasOverlapSchedule` / `findOverlapedClasses` |

### Gaps

#### P0

| Spec | Current | Refs |
|---|---|---|
| **No blocking modal on select** | `openTrungTkbDialog(redundant)` auto-opens on conflict | `AgGrid/utils.tsx:356–361`, `TrungTkbDialog.tsx` |
| **`Trạng thái` column** with `Đã chọn`, `Trùng {mã}` + ⚠, `Cần lớp thực hành` | No status column | `AgGrid/utils.tsx` |
| Inline `Trùng {mã lớp}` referencing conflicting code | Generic snackbar; no code in row | `AgGrid/utils.tsx:404–419` |
| **`Không trùng lịch` toggle** (default off; never hide conflicts) | Toggle absent; overlap always enforced | — |
| Per-row **`Chọn`** button; selected → `Đã chọn` on `primary-subtle` | Checkbox multi-select on `MaLop` | `AgGrid/utils.tsx:118–119` |
| Unified search across columns | Per-column AG Grid floating filters only | `AgGrid/utils.tsx:264–270` |

#### P1

| Spec | Current | Refs |
|---|---|---|
| Explorer title `Danh sách lớp` | Section title `Xếp lớp` | `App.tsx:139–140` |
| Grouped filters: Lịch học / Thuộc tính / Lọc nhanh | Column-level floating filters | `AgGrid/utils.tsx` |
| Attributes helper (`HTGD` · `Khoa QL`) | Missing | — |
| `Buổi` filter in Lịch học group | `ThuBuoi` column hidden | `AgGrid/utils.tsx:135–149` |
| Column set per spec (11 cols incl. `Trạng thái`) | Extra cols (`HỆ ĐT`, `KHÓA HỌC`, …); combined `MÔN HỌC` | `AgGrid/utils.tsx:104–262` |
| Result summary `Hiển thị 1–50 / 238 lớp` | No row-count summary | — |
| No-results copy from copy matrix | Empty grid, no message | — |
| Table `min-width: 960px` in scroll wrapper | `.grid-frame { overflow: hidden }` | `App.css:293–299` |
| Table-first hybrid desktop layout | Vertical stack | `App.tsx:138–158` |

#### P2

| Spec | Current | Refs |
|---|---|---|
| Native `<table>` + `aria-sort` + roving tabindex | AG Grid widget semantics | `AgGrid/index.tsx` |
| Filter live region `Tìm thấy 12 lớp` | Not present | — |
| Parse loading: 5–8 skeleton rows | Only lazy-import `LinearProgress` | `App.tsx:144–145` |
| Detail modal only from `Xem chi tiết` | Auto-opened `Trùng thời khóa biểu` dialog | `TrungTkbDialog.tsx:63–65` |

---

## 4. Nhập mã lớp — manual input & recommendations

### Matches

| Spec | Implementation |
|---|---|
| Manual mode toggle exists | `isChiVeTkb` in Zustand |
| Textarea accepts pasted/typed codes | `DanhSachLopInput` bound to `textareaChiVeTkb` |
| Token split on whitespace, comma, `+` | `tokenise()` in `manualInput.ts` |
| Parse + validate + bundle + recommend engine | `parseAndValidate`, `buildBundles`, `generateRecommendations` |
| Recommendations in manual mode | `selectManualRecommendations` |
| Selection updates timetable; no resolved-class list panel | `manualResolvedMaLop` → timetable only |
| Unresolved detection logic | `selectHasUnresolvedTokens` (selector exists) |
| Title `Gợi ý môn học` | `SuggestionPanel` header |
| Recommendations do not auto-apply | User must click to set `manualResolvedMaLop` |
| Practice bundles as `LT + TH` codes | `sp-tag-prac` in tag UI |

### Gaps

#### P0

| Spec | Current | Refs |
|---|---|---|
| Panel title `Nhập mã môn hoặc mã lớp` | Label `Danh sách mã lớp`; section `Mã lớp & script` | `ScriptDangKyInput.tsx:458`, `App.tsx:169` |
| Buttons `Dán`, `Xóa lỗi`, `Xếp gợi ý` | None | `ScriptDangKyInput.tsx` |
| Token chips row (errors/decisions; `✓ Tất cả mã đã hợp lệ`) | Errors in `helperText` only | `ScriptDangKyInput.tsx:494–503` |
| 40% unresolved list / 60% recommendation cards | 50/50 input ‖ wizard tags | `App.css:344–352` |
| Recommendation cards with metadata + reason + `Chọn` | Tag toggles with codes only | `ScriptDangKyInput.tsx:383–399` |
| Card labels: `Không trùng lịch`, `Trùng {mã}`, etc. | No per-option conflict labels | `ScriptDangKyInput.tsx` |
| Explicit `Xếp gợi ý` trigger (+ blur) | Auto on every keystroke; no `onBlur` | `ScriptDangKyInput.tsx:489`, `zus/index.ts:168` |
| Mode-switch confirmation gate | Direct toggle | `App.tsx:43–44` |
| **Forbidden** standalone output workspace | `OutputSection` with side-by-side fields | `App.tsx:162–179` |

#### P1

| Spec | Current | Refs |
|---|---|---|
| Textarea placeholder (multi-line VD + separator note) | Empty-state `helperText`; tooltip | `ScriptDangKyInput.tsx:47–49` |
| `Xóa lỗi` removes only invalid/not-found tokens | No action | — |
| Tokenize: semicolon + dedupe preserving order | Only `\s+|\+|,`; no dedupe | `manualInput.ts:83` |
| Inline labels: `Cần chọn lớp`, `Không hợp lệ`, etc. | Longer messages; no `Không hợp lệ` | `manualInput.ts:205–221` |
| All-valid: `✓ Tất cả mã đã hợp lệ` | `Đã xếp tất cả môn học` in panel | `ScriptDangKyInput.tsx:406` |
| Empty: `Nhập mã rồi bấm Xếp gợi ý…` | Different copy | `ScriptDangKyInput.tsx:404` |
| Editing clears resolutions on every keystroke | `setTextareChiVeTkb` wipes `manualResolvedMaLop` | `zus/index.ts:94–96` |
| Share/copy-script in work area (forbidden) | Field-level share + copy in `OutputSection` | `ScriptDangKyInput.tsx:351,461` |
| `selectHasUnresolvedTokens` wired to UI | Selector unused | `zus/index.ts:250–283` |

#### P2

| Spec | Current | Refs |
|---|---|---|
| Selected state `primary-subtle`, not filled blue CTA | Selected tag = solid blue | `App.css:534–538` |
| Explicit `Chọn` button | Click tag toggles | `ScriptDangKyInput.tsx:289–298` |
| Wizard auto-advance + `X/Y` counter | Not in spec; present | `ScriptDangKyInput.tsx:312–321,380` |

---

## 5. Timetable panel (`Thời khóa biểu`)

### Matches

| Spec | Implementation |
|---|---|
| Panel title `Thời khóa biểu` | `App.tsx:85–86` |
| Day columns `Thứ 2`–`Thứ 7` | `TableHead.tsx:7–12` |
| Period rows with time labels | `index.tsx`, `utils.ts` |
| Online / off-campus rows | `tietOnline`, `khongHocTrenTruong` |
| Cards: code, course name, lecturer, room | `ClassCell.tsx:162–169` |
| Remove via compact icon on card | `ClassCell.tsx:130–153` |
| Live sync from store | `hooks.ts:61–80` |
| Multi-period rowspan | `hooks.ts:68–76` |
| Conflict overlap detection | `utils.ts:83–120` |

### Gaps

#### P0

| Spec | Current | Refs |
|---|---|---|
| Timetable always visible (empty grid + mode copy) | `SchedulePanel` returns `null` when empty | `App.tsx:80` |
| Sticky right column at ≥1280px | Vertical flow; `position: relative` | `App.css:641–648` |
| Toolbar: `Sao chép mã lớp` · `Sao chép script` · `Chia sẻ` · `Tải ảnh TKB` | Only image download + copy image icons | `App.tsx:88–98` |
| Readiness banner `id="readiness-banner"` `role="status"` | Not implemented | `App.tsx:73–115` |
| **Forbidden** stat counters in timetable area | `grid-statusbar-v2` | `App.tsx:101–109` |
| Conflict cells: `danger-subtle` + 2px left border + `Trùng lịch` + ⚠ | Orange shadow/outline; `Bị trùng TKB` tooltip; redundant classes outside grid | `ClassCell.tsx:100–111`, `index.tsx:61–67` |
| Empty states per mode (copy matrix) | Panel hidden; no spec strings in `src/` | `App.tsx:80` |
| Undo toast `Đã xóa {mã}. Hoàn tác?` (5s) | `removeClasses` only; no undo | `ClassCell.tsx:147`, `zus/index.ts:78` |
| Export: 800px PNG, `tkb-courses-{date}.png`, success toast | `thoikhoabieu.png`; no resize; no download toast | `hooks.ts:94–97` |

#### P1

| Spec | Current | Refs |
|---|---|---|
| Card fields: code, name, lecturer, room only | Also language, `BĐ`/`KT` dates | `ClassCell.tsx:162–173` |
| Remove `aria-label="Xóa {mã lớp}"` | Tooltip `Xoá môn này`; no aria-label | `ClassCell.tsx:116–153` |
| Disabled toolbar + `aria-describedby="readiness-banner"` | Toolbar gated on selection existence | `App.tsx:80,88` |
| Web Share from timetable toolbar | URL share in `DanhSachLopInput` | `ScriptDangKyInput.tsx:467–474` |
| Print CSS for timetable only | Not implemented | — |
| Table `scope`, `caption.sr-only`, cards `role="group"` | Plain markup | `TableHead.tsx`, `ClassCell.tsx` |

#### P2

| Spec | Current | Refs |
|---|---|---|
| Conflict cell references specific `Trùng {mã}` | Generic `Bị trùng TKB` | `ClassCell.tsx:100` |
| Panel title 16px/600; headers 12–13px/400 | `font-weight: 800`, uppercase thead | `styles.css:25–34` |
| Icon toolbar targets ≥44px | 30×30px | `App.css:662–665` |

---

## 6. Journey, interactions & anti-drift

### Matches

| Spec | Implementation |
|---|---|
| Overlap/conflict detection | `findOverlapedClasses`, `hasOverlapSchedule` |
| Conflict rows non-selectable | `isRowSelectable` |
| File parse loading + basic error toasts | `SelectExcelButton.tsx` |
| Mode + selections persist (Zustand) | `zus/index.ts` persist middleware |
| Manual parse validation (inline) | `helperText` from `selectManualParseErrorMessages` |
| Timetable reflects selections | `selectSelectedClassesOutput` |
| Clipboard copy (partial) | `navigator.clipboard.writeText` in fields |
| No share modal / social picker / QR | Confirmed absent |
| No account / AI / admin UI | Confirmed absent |

### Gaps

#### P0

| Spec | Current | Refs |
|---|---|---|
| `navigator.share` + `canShare` + clipboard fallback toast | URL build + clipboard + `window.open`; no Web Share API | `ScriptDangKyInput.tsx:467–474` |
| Success toasts per copy matrix | Tooltip icon swap / generic messages | `ScriptDangKyInput.tsx:84–127` |
| File controls in header (filename + replace + remove) | Body drag-drop panel; no remove | `SelectExcelButton.tsx`, `App.tsx:64–71` |
| Complete file state matrix (10 states + confirm modals) | ~4 states only | `SelectExcelButton.tsx` |
| Live regions for all key events | Zero `aria-live` in `src/` | — |

#### P1

| Spec | Current | Refs |
|---|---|---|
| Conflict toast `Không thể chọn {mới} vì trùng {đã chọn}.` | Generic wording; no conflicting code | `AgGrid/utils.tsx:405` |
| `Không trùng lịch` toggle behavior | Not implemented | — |
| Script clipboard-only in toolbar; optional ≤3-line peek | Full readonly textarea in `OutputSection` | `ScriptDangKyInput.tsx:109–145` |
| `Xóa lỗi` undo toast | Not implemented | — |

---

## 7. Forbidden pattern audit

From `prompt_v3.md` implementation drift guardrails and research §4 / §10:

| Forbidden pattern | Status | Evidence |
|---|---|---|
| `OutputSection` / `Mã lớp & script` panel | **PRESENT** ❌ | `App.tsx:162–179` |
| Script preview as separate full-height textarea | **PRESENT** ❌ | `ScriptDangKyInput.tsx:109–145` |
| Share modal / social picker / QR / share sidebar | **ABSENT** ✅ | — |
| Stat counters (`Lớp đã chọn`, `Số tín chỉ`) | **PRESENT** ❌ | `App.tsx:101–109`; orphan `SoTinChi.tsx` |
| `ImportSection` / body `Nhập Excel` | **PRESENT** ❌ | `App.tsx:64–71` |
| Desktop vertical `single-page-flow` | **PRESENT** ❌ | `App.tsx:189` |
| Three equal desktop columns | **ABSENT** ✅ | — |
| `TrungTkbDialog` blocking on `Chọn` | **PRESENT** ❌ | `AgGrid/utils.tsx:360` |
| Selected-classes sidebar / resolved-class list | **ABSENT** ✅ | — |
| Row/course stats in header/work area | **PRESENT** ❌ | Status bar + wizard `X/Y` counter |
| Metric cards / hero KPI / decorative illustrations | **PARTIAL** ❌ | `grid-statusbar-v2`, large upload hero |
| AI confidence / ranking badges | **ABSENT** ✅ | — |
| Dashboard / account / notification / admin | **ABSENT** ✅ | — |
| Output actions only in timetable toolbar | **VIOLATED** ❌ | Copy/share/script in `OutputSection` |
| Header-only file controls | **VIOLATED** ❌ | `ImportSection` |
| Web Share + clipboard fallback toasts | **VIOLATED** ❌ | No `navigator.share` |
| Conflicts inline in row/card/timetable | **PARTIAL** ⚠️ | Logic yes; labels/modal-first no |
| `Không trùng lịch` does not hide rows | **N/A** ❌ | Toggle not implemented |
| Manual invalid uses chips, not modal-first | **PARTIAL** ⚠️ | `helperText`, no chips |
| Keyboard nav / focus order per contract | **VIOLATED** ❌ | No tablist, no roving tabindex |
| Responsive stacking order preserved | **VIOLATED** ❌ | Import precedes work area; timetable conditional |

### Research §10 guardrail checklist

| # | Item | Pass |
|---|---|---|
| 1 | Header file controls only import surface | ❌ |
| 2 | Timetable toolbar only output surface | ❌ |
| 3 | No metric cards / stats / sidebars / output panels | ❌ |
| 4 | Conflicts inline in row/card/timetable | ⚠️ partial |
| 5 | `Không trùng lịch` does not hide conflicting rows | ❌ |
| 6 | Manual chips + banners, not modal-first errors | ⚠️ partial |
| 7 | Web Share + clipboard fallback toasts | ❌ |
| 8 | Vietnamese text legible at specified sizes | ⚠️ |
| 9 | Keyboard nav / focus order | ❌ |
| 10 | Responsive stacking order | ❌ |

**Score: 0 pass · 3 partial · 7 fail**

---

## 8. Cross-cutting priority remediation

Ordered by dependency and P0 impact:

### Phase 1 — Structural shell (unblocks everything)

1. Rebuild app shell: fixed 56px `<header>` with brand, `<nav>` mode switch, right file-control zone.
2. Remove `ImportSection` and `OutputSection` from page structure.
3. Implement `≥1280px` two-column grid (58/42) with sticky right timetable panel.
4. Always render timetable panel (empty states per mode inside panel).
5. Remove `grid-statusbar-v2`; add `readiness-banner` below toolbar.

### Phase 2 — Timetable as source of truth

6. Move all output actions to timetable toolbar in spec order.
7. Implement Web Share API + clipboard fallback + spec success toasts.
8. Add undo toast on class removal (5s window).
9. Fix conflict cell styling (`danger-subtle`, left border, `Trùng lịch` + code).
10. Fix export pipeline (800px PNG, dated filename, capture region, toast).

### Phase 3 — Work areas

11. Rebuild Xếp lớp explorer: `Danh sách lớp`, unified search, grouped filters, `Không trùng lịch`, `Trạng thái` column, `Chọn` buttons.
12. Remove auto-open `TrungTkbDialog`; keep detail modal only for `Xem chi tiết`.
13. Rebuild Nhập mã lớp: manual input panel → chips → 40/60 unresolved/cards workspace.
14. Add `Dán` / `Xóa lỗi` / `Xếp gợi ý` (+ blur); mode-switch confirmation gate.

### Phase 4 — Tokens & accessibility

15. Align token names and fix `--app-primary` alias.
16. Raise table primary text to ≥14px; restrict font weights to 400/600.
17. Add skip link, landmarks, tablist mode switch, live regions, 44px icon targets.
18. Normalize motion tokens (150/200/250ms) and MUI radius (8/12px).

---

## 9. What is already worth keeping

These implementation pieces align with or support the spec and should be preserved/refactored rather than rewritten from scratch:

- **Conflict detection engine** — `findOverlapedClasses`, `hasOverlapSchedule` (`src/utils.ts`)
- **Manual input parsing** — `parseAndValidate`, `buildBundles`, `generateRecommendations` (`src/manualInput.ts`)
- **State persistence** — Zustand store with persist (`src/zus/index.ts`)
- **Timetable grid engine** — weekly layout, rowspan, online rows (`ThoiKhoaBieuTable/*`)
- **Color token values** — OKLCH foundation in `src/theme/tokens.css`
- **File import core** — XLSX parse flow in `SelectExcelButton.tsx` (relocate to header, extend state matrix)

---

## 10. Review methodology

This diff was produced by dividing the spec into six scoped reviews, executed two at a time:

| Batch | Scope | Agent focus |
|---|---|---|
| 1a | App shell & layout | Header, grid, responsive, file placement |
| 1b | Design tokens & a11y | Colors, typography, motion, WCAG |
| 2a | Xếp lớp | Class explorer, filters, conflicts, table |
| 2b | Nhập mã lớp | Manual input, chips, recommendations |
| 3a | Timetable panel | Toolbar, grid, readiness, export |
| 3b | Journey & anti-drift | Share, file states, forbidden patterns, toasts |

Each review read the relevant `src/` files and reported MATCHES, GAPS (P0/P1/P2), and file references. This document merges those findings without deduplicating cross-cutting items (e.g. layout gaps appear in shell, Xếp lớp, and timetable sections because each scope validates a different facet of the same structural debt).