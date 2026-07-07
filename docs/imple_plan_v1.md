## Implementation plan

### 0. Guardrails before editing

Run the existing checks first so the refactor has a baseline:

```bash
npm test -- --watchAll=false
npm run build:strict
```

Preserve these engines unless a step explicitly says otherwise:

`src/manualInput.ts` parsing, validation, bundle generation, and recommendations.
`src/utils.ts` overlap detection and credit calculation.
`src/zus/index.ts` mode-scoped output selector behavior.
`src/views/components/ThoiKhoaBieuTable/*` weekly timetable layout engine.
`src/views/1ChonFileExcel/utils.ts` Excel row conversion.

No tokenization expansion. No semicolon handling. No dedupe. No chips. Keep the current parser simple; only improve the visible label and placeholder.

---

## Phase 1 — State and selector cleanup

Start here because the layout depends on clear state semantics.

### 1.1 Update file replace/remove semantics in `src/zus/index.ts`

Change `setDataExcel` so replacing a file clears scheduling output instead of preserving matching row IDs.

Current behavior preserves selections:

```ts
const newSelectedClasses = newDataExcel.filter(...)
set({ dataExcel: data, selectedClasses: newSelectedClasses, agGridFilterModel: null });
```

Replace with:

```ts
set({
  dataExcel: data,
  selectedClasses: [],
  manualResolvedMaLop: [],
  agGridFilterModel: null,
});
```

Preserve:

`isChiVeTkb`
`textareaChiVeTkb`
`agGridColumnState`, unless the new file makes it invalid; for now keep it because AG Grid already tolerates missing columns.

Add a `removeDataExcel()` action:

```ts
removeDataExcel: () => {
  set({
    dataExcel: null,
    selectedClasses: [],
    manualResolvedMaLop: [],
    agGridFilterModel: null,
  });
}
```

Do not clear manual textarea on file remove/replace. The user’s typed codes are still useful after reimport and will revalidate against the next file.

### 1.2 Add explicit output selectors

Keep the current mode-scoped model but make it easier to consume from the new shell:

```ts
selectGridModeOutputClasses
selectManualModeOutputClasses
selectActiveTimetableClasses
selectActiveOutputMaLop
selectHasDestructiveFileState
```

`selectActiveTimetableClasses` can initially wrap the current `selectSelectedClassesOutput`.

`selectHasDestructiveFileState` should be true when replace/remove would clear meaningful output:

`selectedClasses.length > 0`
or `manualResolvedMaLop.length > 0`
or `selectSelectedClassesOutput(state).length > 0`

### 1.3 Keep shared URL behavior

Do not change `getUrlResolvedMaLop()` or the rule where `?self_selected=...` forces manual mode through `selectIsChiVeTkb`.

Later, move share generation into the timetable toolbar, but keep the same URL parameter.

---

## Phase 2 — Header file control

### 2.1 Split parser logic out of `SelectExcelButton`

Refactor `src/views/1ChonFileExcel/SelectExcelButton.tsx` into reusable pieces:

`useExcelImport()`
`HeaderFileControl`

Keep:

`XLSX.read`
`arrayToTkbObject`
`sheetJSFT`
current import error messages

Remove:

drag state
drag handlers
drop panel
large upload surface
success snackbar `Đã nhập {file}.`

### 2.2 Build compact header file control

New behavior:

No file: button `Tải file thời khóa biểu (.xlsx)`.

Importing: disabled control, text `Đang đọc file…`, `aria-busy="true"`.

Loaded: truncated filename, `Đổi file`, remove icon button.

Invalid/unreadable file: snackbar error only.

No drag-drop anywhere.

### 2.3 Add replace/remove confirmation only when destructive

Create a small reusable confirmation dialog, likely under:

`src/views/components/ConfirmDialog.tsx`

Use it only for replacing/removing a file when `selectHasDestructiveFileState` is true.

Copy:

Replace title: `Đổi file?`
Remove title: `Gỡ file?`
Body: `Thao tác này sẽ xóa các lớp đang chọn và kết quả đã ghép từ mã lớp.`
Primary: `Đổi file` / `Gỡ file`
Secondary: `Hủy`

No snackbar after confirm.

---

## Phase 3 — App shell and responsive layout

### 3.1 Replace the vertical shell in `src/views/App.tsx`

Remove these structural components:

`ImportSection`
`OutputSection`
body-level `Nhập Excel`
standalone `Mã lớp & script`

Replace with:

`AppShell`
`AppHeader`
`ModeTabs`
`HeaderFileControl`
`Workspace`
`GridWorkspace`
`ManualWorkspace`
`TimetablePanel`

Target structure:

```tsx
<div className="app-shell">
  <a href="#main-workspace" className="skip-link">
    Bỏ qua đến nội dung chính
  </a>

  <header className="app-header">
    <h1>Courses</h1>
    <nav aria-label="Chế độ làm việc">
      ...
    </nav>
    <HeaderFileControl />
  </header>

  <main id="main-workspace" className="workspace">
    <section className="workspace-main">
      {isChiVeTkb ? <ManualWorkspace /> : <GridWorkspace />}
    </section>

    <aside className="workspace-timetable" aria-label="Thời khóa biểu">
      <TimetablePanel />
    </aside>
  </main>
</div>
```

### 3.2 Mode switch accessibility

Mode switch should be `tablist` / `tab`.

Use:

`role="tablist"`
`role="tab"`
`aria-selected`
keyboard arrow support
no toast/snackbar on mode switch
no modal
no state clearing

Mode switch only changes the visible workspace.

### 3.3 Responsive topology

Desktop `≥1280px`:

fixed 56px header
workspace two columns
left `58–60%`
right `40–42%`
24px gap
right timetable sticky with top offset below header

Tablet `768–1279px`:

single column
work area first
timetable below
not sticky

Mobile `<768px`:

single column
header wraps into brand/mode/file rows
work area first
timetable second
grid and timetable horizontally scroll; do not squeeze columns into unreadable sizes

---

## Phase 4 — Timetable panel

### 4.1 Always render the timetable panel

Current `SchedulePanel` returns `null` when there are no classes. Remove that behavior.

Panel states:

No file: `Chưa có file`
File loaded, no grid selection: `Chưa chọn lớp`
Manual mode, no active resolved rows: `Chưa có lớp`
Rows exist: render timetable

No persistent readiness banner. No generic helper text.

### 4.2 Move all output actions into timetable toolbar

Toolbar order:

`Sao chép mã lớp`
`Sao chép script`
`Chia sẻ`
`Tải ảnh TKB`

Remove:

field-level share button in `DanhSachLopInput`
`ScriptDangKyInput` preview textarea
image-copy toolbar action
old `OutputSection`

Use existing pure logic:

`extractListMaLop(activeOutputClasses)`
`getScriptDkhp(listMaLop)`
`saveTkbImage()`

Feedback:

`Sao chép mã lớp` → `Đã sao chép mã lớp`
`Sao chép script` → `Đã sao chép script`
`Chia sẻ` clipboard fallback → `Đã sao chép link`
`Tải ảnh TKB` → silent on success, snackbar only on failure

For share:

Use `navigator.share` when available. Otherwise copy the `?self_selected=...` URL. Never call `window.open`.

### 4.3 Keep and refine stats

Keep:

`Lớp đã chọn`
`Số tín chỉ`

Improve visual hierarchy:

compact inline counters or small chips
near timetable title
active-mode scoped
no dashboard/KPI styling
warning color on credits only when `getTongSoTcJudgement()` says warning

### 4.4 Timetable image export

In `src/views/components/ThoiKhoaBieuTable/hooks.ts`:

Keep `html2canvas`.

Change filename:

```ts
tkb-courses-YYYY-MM-DD.png
```

Remove image-copy action from UI. The existing `copyTkbImageToClipboard` can remain unused temporarily, or be deleted if no references remain.

Wrap download in `try/catch`; snackbar only on failure.

### 4.5 Timetable cell density

In `ClassCell.tsx`, always-visible content should be:

`Mã lớp`
`Tên môn`
`Giảng viên`
`Phòng`

Remove always-visible `BĐ` and `KT` from normal cells. Put lower-priority details in tooltip/focus detail.

For outside-table rows, keep `Thứ` and `Tiết` visible.

### 4.6 Preserve mode-specific removal

`Xếp lớp`: timetable card remove icon remains. It removes from `selectedClasses`.

`Nhập mã lớp`: no timetable-card remove icon. Manual textarea and recommendation card toggles are the source of truth.

Add `aria-label="Xóa {mã lớp}"` to the remove button.

### 4.7 Warning styling

Keep current warning logic.

Simplify only same-subject duplicate styling:

actual timetable overlap remains visually obvious
same-subject duplicate keeps pale warning background and orange code text
remove the large warning triangle icon
avoid heavy outline for same-subject duplicate unless it is an actual time conflict

Keep the current tooltip/power behavior for group removal and `Shift+Click`.

---

## Phase 5 — `Xếp lớp` grid

### 5.1 Remove conflict modal from selection flow

Stop opening `TrungTkbDialog` from `onSelectionChanged`.

Conflicting selection should be a quiet no-op:

row remains visible
row cannot be selected
status column explains why
no modal
no snackbar
no row-click warning toast

`TrungTkbDialog` can be deleted if unused after this pass.

### 5.2 Replace checkbox selection with icon toggle column

In `src/views/2XepLop/AgGrid/utils.tsx`:

Remove `checkboxSelection: true` from `Mã lớp`.

Add first column:

icon button only
44×44 hit target
selected/unselected SVG states
disabled state for conflicts
no visible `Chọn` / `Bỏ chọn` text in every row

Accessible labels:

`Chọn EC201.Q21`
`Bỏ chọn EC201.Q21`
`Không thể chọn EC201.Q21: trùng IE108.O22`

Disable row-click selection. Row click can focus or expand groups only.

### 5.3 Add `Trạng thái` column

Second column after action.

Values:

selected → `Đã chọn`
conflict → `Trùng {mã lớp đang chọn}`
otherwise → empty or `Có thể chọn`, but recommended empty for lower noise

Do not implement `Không trùng lịch`.

### 5.4 Keep AG Grid filters; add compact global search

Keep column filters and persisted `agGridFilterModel`.

Add one search field above grid:

`Tìm lớp, môn học, giảng viên…`

Wire it to AG Grid quick filter.

Add compact result summary:

`{visibleCount} / {totalCount} lớp`

Empty states:

No file: `Chưa có file`
No search/filter result: `Không có lớp phù hợp`

No instructional paragraph.

### 5.5 Tighten default visible columns

Default visible:

action icon
`Trạng thái`
`Môn học`
`Mã lớp`
`Tên giảng viên`
`Thứ`
`Tiết`
`Phòng học`
`Số TC`
`Sĩ số`
`HTGD`
`Ngôn ngữ`

Hide by default but keep available:

`Mã MH`
`Tên môn học`
`Mã giảng viên`
`Thứ+Buổi`
`Thực hành`
`Cách tuần`
`Hệ ĐT`
`Khoa QL`
`Khóa học`
`Học kỳ`
`Năm học`
`NBD`
`NKT`
`Ghi chú`

Keep AG Grid column menu and persistence.

---

## Phase 6 — `Nhập mã lớp` manual workspace

### 6.1 Keep parser logic unchanged

Do not change `tokenise()`.

It already supports comma and newline via comma and whitespace splitting. Do not advertise `+`, even though the parser currently accepts it.

No semicolon support.
No dedupe.
No token chips.
No `Dán`.
No `Xóa lỗi`.
No `Xếp gợi ý`.

### 6.2 Rename and simplify manual input

Replace label:

`Danh sách mã lớp` → `Nhập mã môn hoặc mã lớp`

Placeholder:

```text
VD: EC201, IT003
Hoặc mỗi mã một dòng
```

Keep visible label; placeholder is only an example.

Errors stay under the textarea as current token-specific helper text:

`<MÃ>: <lý do>`

Remove the empty-state helper sentence currently shown under the field.

Remove tooltip text that teaches multiple separators. The placeholder is enough.

### 6.3 Replace wizard with guided resolution workspace

Replace `SuggestionPanel` wizard with:

`ManualResolutionWorkspace`

Structure:

textarea on top
below it, unresolved queue + recommendation cards

Desktop/wide tablet inside left workspace:

queue column around `36–40%`
cards area around `60–64%`

Mobile:

queue as compact chip row or short vertical list
cards below

Keep recommendation logic derived from current `selectManualRecommendations`.

Extract current `SuggestionPanel` combo derivation into pure helpers:

`getSubjectFromCode`
`comboFromBundle`
`compareSuggestionCombos`
`buildSubjectCombos`

Durable state remains only:

`textareaChiVeTkb`
`manualResolvedMaLop`

Active unresolved item remains local component state.

### 6.4 Recommendation card behavior

Each card should show enough to choose without opening another panel:

class/bundle code
course name if available
lecturer
day/period
room
selected state

Use icon selection state, not repeated heavy CTA buttons.

Selecting a card:

replaces the current subject’s manual resolved codes
same selected card toggles off
compatible with current `handleToggleCombo` semantics

No auto-run button. Recommendations update automatically.

Progress copy is allowed only near the queue and should be terse:

`Còn 2 mã cần chọn`

No global helper text in the timetable.

---

## Phase 7 — Design tokens and CSS cleanup

### 7.1 Add semantic aliases, no full token migration

In `src/theme/tokens.css`, add aliases while keeping old tokens:

```css
--text-primary: var(--ink);
--text-secondary: var(--ink-2);
--text-muted: var(--ink-3);

--primary: var(--blue);
--primary-subtle: var(--blue-soft);

--danger: var(--error);
--danger-subtle: var(--error-soft);

--border-strong: var(--border);
```

Fix obvious alias drift in `App.css`:

`--app-primary` should map to blue primary, not gray text.

### 7.2 Accessibility CSS

Minimum target size:

icon toolbar buttons
row action buttons
remove icons
file remove icon

Use actual 44×44 dimensions or pseudo-element hit-area expansion.

AG Grid primary text should be at least 14px.

Use fixed product type sizes. No fluid/clamp typography.

Keep reduced-motion support.

### 7.3 Remove obsolete CSS

Delete or stop using styles for:

large upload drop panel
`OutputSection`
script preview fields
wizard `X/Y` panel styling
copy-image toolbar button
old vertical `single-page-flow`

Keep timetable/grid horizontal scroll wrappers.

---

## Phase 8 — Accessibility pass

Implement this as part of the refactor, not later.

Required:

`<header>` landmark
`<nav aria-label="Chế độ làm việc">`
`<main id="main-workspace">`
skip link copy `Bỏ qua đến nội dung chính`
mode tabs with keyboard arrows
descriptive labels for icon-only controls
visible focus rings
logical focus after removal
no focus-obscured issues under fixed header
disabled states for toolbar actions

Do not add visible live/status copy except short snackbars for explicit invisible actions. Use `aria-label`, tooltip, and control state rather than helper paragraphs.

---

## Phase 9 — Tests and verification

### 9.1 Unit tests

Add or update tests for:

file replacement clears `selectedClasses` and `manualResolvedMaLop`
file replacement preserves `textareaChiVeTkb` and mode
manual `setTextareChiVeTkb` still uppercases and clears manual resolutions
shared URL still populates manual mode/output
`selectActiveTimetableClasses` returns grid output in `Xếp lớp` and manual output in `Nhập mã lớp`

### 9.2 Manual parser regression tests

Do not change tokenizer logic. Verify existing expected behavior still passes:

comma input
newline input
course ID input
class code input
practice pairing error
unknown course error
unknown class error
mixed course/class duplicate error

### 9.3 Interaction verification

Manually verify:

import file silently succeeds and filename appears in header
invalid file shows error snackbar
replace/remove confirmation appears only when output would be cleared
mode switching is instant and non-destructive
grid conflicting row is visible, disabled, and labeled inline
grid icon toggle selects/removes classes
timetable card remove works only in `Xếp lớp`
manual recommendation card selection updates timetable
manual timetable cards have no remove icon
copy class codes shows short success
copy script shows short success
share uses Web Share or clipboard fallback without opening a new tab
download image succeeds silently
download failure shows error

### 9.4 Responsive verification

Check at:

`1440px`
`1280px`
`1024px`
`768px`
`390px`

Expected:

desktop two-column workspace
tablet/mobile single-column workspace
work area before timetable
header wraps without overlap
AG Grid horizontal scroll works
timetable horizontal scroll works
no text compressed below readable sizes
icon controls remain keyboard reachable and touch sized

---

## Suggested implementation order

1. Add selectors/actions in `src/zus/index.ts`.
2. Refactor Excel import into header-safe `HeaderFileControl`, remove drag-drop.
3. Replace `App.tsx` structure with semantic shell/workspace/timetable layout.
4. Move output actions into `TimetablePanel`; remove `OutputSection` and script preview.
5. Make timetable always render with terse empty states.
6. Refactor AG Grid action/status columns and remove conflict modal flow.
7. Add global search and result summary.
8. Replace manual wizard with unresolved queue + recommendation cards.
9. Tighten timetable cell content and warning styling.
10. Apply token/CSS/accessibility cleanup.
11. Run tests, build, responsive manual QA.

---

## Explicit non-goals

Do not implement `Không trùng lịch`.

Do not implement `Dán`, `Xóa lỗi`, or `Xếp gợi ý`.

Do not add token chips.

Do not add a persistent timetable readiness banner.

Do not add undo toast for class removal.

Do not keep a script preview.

Do not keep image-copy as a primary toolbar action.

Do not open a new window on share.

Do not change manual parser semantics.

Do not merge `selectedClasses` and `manualResolvedMaLop` into one shared timetable state.
