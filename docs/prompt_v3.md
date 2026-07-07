Create high-fidelity desktop web app mockups for a Vietnamese university timetable planning tool called `Courses`.

The app helps students import an Excel timetable, select compatible classes, validate manual course/class codes, preview a weekly timetable, then copy class codes, copy a registration script, share the plan, or export the timetable image.

**Version:** `prompt_v3.md` — specification-hardened design contract  
**Remediation source:** `courses_v1_review.md`, `courses_v2_review.md`, `courses_v3_review.md`  
**Skills applied:** Intent `/journey`, `/organize`, `/fortify`, `/include`, `/articulate`, `/specify`, `/measure`; Impeccable layout, harden, audit, typeset; UI-UX Pro Max reference baseline

Before creating the final mockups, first propose 2–3 distinct mockup directions within the design system below. Each direction should explain the layout tradeoff in 3–5 concise bullets. After the directions, create the final two-page mockup using the strongest direction.

The two required pages are mode views of one app shell (not necessarily separate routes):

1. `Xếp lớp`
2. `Nhập mã lớp`

The interface must be minimal, clean, and easy to understand from a student’s standpoint. It should feel like a practical planning tool, not a marketing site, SaaS dashboard, or AI assistant interface.

The goal is speed-to-confidence:

* In `Xếp lớp`, the user should immediately understand where to browse classes, which classes are selected through the timetable, and whether the timetable works.
* In `Nhập mã lớp`, the user should immediately understand where to paste codes, which codes need attention, which suggestions are available, and whether final output is ready through the timetable.

Scope:

Design only the course-planning and timetable-building experience.

Include only these workflows:

* Import or replace an Excel timetable file
* Remove the imported timetable file
* Browse classes from the imported timetable
* Search and filter classes
* Select and remove classes
* Prevent and explain schedule conflicts
* Enter course IDs or class codes manually
* Show unresolved, invalid, or practice-required codes
* Recommend compatible class choices
* Preview the weekly timetable
* Copy final class codes
* Copy registration script
* Share the selected timetable
* Export/download timetable image

DO NOT add features outside this scope:

* DO NOT add account management
* DO NOT add login, signup, profile, avatar, or user settings
* DO NOT add notifications or notification center
* DO NOT add chat, comments, inbox, or messaging
* DO NOT add admin dashboard features
* DO NOT add analytics dashboards or metric-card summaries
* DO NOT add payment, subscription, billing, or pricing UI
* DO NOT add onboarding tours
* DO NOT add AI assistant/chatbot UI
* DO NOT add calendar integrations
* DO NOT add school portal login
* DO NOT add collaboration/multi-user editing
* DO NOT add decorative landing-page sections
* DO NOT add unrelated productivity features
* DO NOT add fake activity feeds
* DO NOT add empty illustrations
* DO NOT add excessive badges
* DO NOT add unnecessary stats, counters, or metric cards
* DO NOT add a separate data source panel
* DO NOT add a selected classes panel
* DO NOT add a resolved class list panel
* DO NOT add a separate output panel

---

## Implementation drift guardrails

These patterns are explicitly forbidden. If an existing implementation contains them, remove or refactor before visual polish. The timetable panel is the only place for selection state, readiness, and output actions.

| Forbidden pattern | Why it violates the brief | Correct replacement |
|---|---|---|
| `OutputSection` / `Mã lớp & script` panel / standalone output workspace | Duplicates timetable as source of truth; invites dashboard-style output UI | All output actions live in the **timetable header toolbar** only |
| Script preview as a separate panel or full-height textarea below the page | Same as forbidden output panel | Script is **clipboard-only** by default. Optional: one `Xem script` toggle revealing a **collapsible ≤3-line monospace peek** inside the timetable panel |
| Share modal, social picker, QR code UI, share sidebar | Bolts on forbidden output/workspace pattern | Web Share API when supported; clipboard fallback + toast. No modal |
| Stat counters / status bar (`Lớp đã chọn`, `Số tín chỉ`, credit totals) | Dashboard metric sludge | Readiness via timetable cards, row `Trạng thái`, and concise readiness banner inside timetable panel |
| `ImportSection` / body-level `Nguồn dữ liệu` / `Nhập Excel` block | File controls must stay in app shell only | Header-only file controls in top bar right zone |
| Desktop vertical `single-page-flow` (full-width table, then full-width timetable) | Breaks speed-to-confidence on desktop | Two-column shell at `≥1280px`: work area left, sticky timetable right |
| Three equally weighted desktop columns | Violates layout constraints | Max two top-level columns; `Nhập mã lớp` recommendation split is **internal to left column only** |
| `TrungTkbDialog` / blocking conflict modal on row `Chọn` | Conflicts must be inline-first | Inline row reason `Trùng {mã lớp}` + timetable cell tint/label; modal only from explicit `Xem chi tiết` |
| Separate selected-classes sidebar / resolved-class list | Timetable is sole selection representation | Selected and resolved classes appear only as timetable cards |
| Row counts, course counts, semester stats, privacy notes in header or work area | Forbidden helper/stat noise | Filename + replace/remove only when file loaded; compact import button when empty |
| Metric cards, hero KPI rows, decorative empty illustrations | Out of scope aesthetic | Short practical empty states inside timetable or table only |
| AI confidence labels, ranking badges, chatbot framing | Out of scope | Plain Vietnamese reason labels only |

**Output actions IA (toolbar-only contract):**

* Toolbar sits in the timetable panel header, same row as title `Thời khóa biểu`.
* Button order (left → right): `Sao chép mã lớp` · `Sao chép script` · `Chia sẻ` · `Tải ảnh TKB`.
* Text buttons or compact icon buttons with tooltips are both allowed; do not add a fifth “output” zone elsewhere on the page.
* When disabled, buttons use `aria-describedby` pointing to the readiness banner below the toolbar.
* Successful copy/share/export uses a short toast only — not a success panel.

---

Design inspiration research:

Before creating the final mockups, research premium UI/UX references for this specific product pattern: a compact desktop planning tool with dense tables, manual input validation, conflict resolution, and timetable/calendar preview.

Use inspiration from Mobbin, Pinterest, Dribbble, high-quality SaaS productivity tools, scheduling/calendar products, data-table-heavy admin tools, course planning or booking interfaces, and polished form validation workflows.

Use references only to improve layout hierarchy, spacing rhythm, table density, filter grouping, button grouping, empty states, error and warning states, timetable/calendar readability, inline validation behavior, responsive stacking behavior, and professional polish.

Do not copy any reference directly. Translate useful ideas into the design system tokens defined in this prompt.

Source priority:

1. Scope and feature boundaries in this prompt
2. Design system tokens in this prompt
3. Required page/component structure in this prompt
4. Provided timetable examples
5. External inspiration from Mobbin, Pinterest, Dribbble, or other premium references

Before producing the final mockups, document the references reviewed at a high level. Mockup delivery must include:

**References reviewed** — list 3–5 sources and which principles were applied (filter grouping, table density, inline validation, etc.)

**References rejected** — explicitly list patterns not adopted despite appearing in references:

* Dashboard metric cards / hero KPI rows
* Comparison-table landing layouts
* Separate output sidebars
* Modal-first conflict resolution
* Playful edtech / claymorphism templates
* Glassmorphism, gradient CTAs, decorative empty illustrations

---

## Design system constraints

Use the following tokens only. Do not invent new spacing, color, radius, shadow, or type styles unless absolutely required for accessibility.

### Spacing tokens

* `4px` — tight gaps inside compact controls, table cell internals
* `8px` — default inline gap, chip spacing, small control spacing
* `12px` — table cell padding, compact panel padding
* `16px` — standard panel padding, form groups, section spacing
* `24px` — major layout gaps, page sections
* `32px` — page outer padding or large separation only

Spacing rules:

* Tables may use the compact spacing scale: `4px`, `8px`, `12px`
* Panels and forms should use `12px` or `16px`
* Major columns should use `24px`
* Avoid oversized whitespace
* Avoid nested cards with repeated padding

### Typography

Use **Be Vietnam Pro** (400, 600) with **Noto Sans** fallback. Vietnamese diacritics coverage is mandatory. Do not use Inter as primary.

```css
font-family: "Be Vietnam Pro", "Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
```

Font loading:

* `font-display: swap` on all `@font-face` rules
* Preconnect to font CDN if using Google Fonts
* Include Vietnamese subset
* Fallback chain: `"Be Vietnam Pro", "Noto Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

Type scale:

| Token | Size | Usage |
|---|---|---|
| Page title | `20px` / 600 | Page/mode titles only |
| Panel title | `16px` / 600 | `Danh sách lớp`, `Thời khóa biểu`, etc. |
| Body | **15px** (allow **16px** in form areas) / 400 | Body copy, buttons, textarea, filter labels |
| Table primary | **14px minimum** / 400 | `Mã lớp`, `Môn học`, `Giảng viên`, `Thứ`, `Tiết`, timetable card titles |
| Table metadata | **12–13px** / 400 | `Số TC`, `Sĩ số`, `HTGD`, `Ngôn ngữ`, column headers only |
| Caption | `12px` / 400 | Helper text, chip secondary labels |

Hard rules:

* Never set primary table columns or timetable card course names below **14px**
* `13px` only for non-primary metadata columns — not class codes or course titles
* Use `font-variant-numeric: tabular-nums` on class codes, periods, credit counts
* Weights: **400** and **600** only
* Do not use display typography or oversized headings

Vietnamese diacritics QA gate — verify at 14px and 15px on `surface`:

* `Phân tích thiết kế phần mềm`
* `Nguyễn Đình Thuân`
* `Không trùng lịch`
* `Cần chọn lớp thực hành`

### Color tokens (concrete values)

Source of truth: OKLCH with hex fallbacks. Primary accent ≤10% of visible surface area.

| Role | OKLCH | Hex | Usage |
|---|---|---|---|
| `app-bg` | `oklch(97.8% 0 0)` | `#f9f9f9` | Page background |
| `surface` | `oklch(100% 0 0)` | `#ffffff` | Panels, cards, inputs |
| `surface-muted` | `oklch(95.8% 0 0)` | `#f4f4f4` | Table headers, inactive tabs, zebra |
| `border` | `oklch(88% 0 0)` | `#dcdcdc` | Default dividers, input borders |
| `border-strong` | `oklch(92% 0 0)` | `#ebebeb` | Emphasized panel edges |
| `text-primary` | `oklch(12% 0 0)` | `#1a1a1a` | Body, table primary columns (16:1 on surface) |
| `text-secondary` | `oklch(35% 0 0)` | `#4a4a4a` | Secondary labels, lecturer names |
| `text-muted` | `oklch(54% 0 0)` | `#737373` | Metadata, disabled text (4.6:1 on surface) |
| `primary` | `oklch(52% 0.22 255)` | `#2563eb` | Primary buttons, links, active tab indicator |
| `primary-subtle` | `oklch(96.5% 0.015 255)` | `#eff6ff` | Selected rows, active mode tint, selected timetable cards |
| `success` | `oklch(42% 0.13 165)` | `#047857` | Valid/resolved labels (with ✓ text) |
| `warning` | `oklch(50% 0.13 55)` | `#b45309` | Unresolved tokens, practice-needed |
| `danger` | `oklch(42% 0.18 28)` | `#b91c1c` | Conflicts, invalid codes, destructive actions |
| `focus-ring` | — | `0 0 0 3px rgba(37, 99, 235, 0.32)` | Keyboard focus on light surfaces |

Derived pairing tokens:

| Token | Value | Usage |
|---|---|---|
| `danger-subtle` | `#fef2f2` | Conflict timetable cell background |
| `warning-subtle` | `#fffbeb` | Unresolved chip background |
| `success-subtle` | `#ecfdf5` | Valid confirmation banner |

Color rules:

* `primary` (action) ≠ `primary-subtle` (selection) — see Component states
* Body text on `surface`: ≥4.5:1 contrast (SC 1.4.3)
* Focus ring: ≥3:1 against adjacent colors (SC 1.4.11)
* Color is never the only state indicator — always pair with text label and/or icon
* Do not use primary color decoratively
* Do not add gradients or colorful dashboard cards

### Radius tokens

* `8px` — inputs, buttons, chips, table row highlights
* `12px` — panels, cards, popovers, timetable container (preferred for all utility panels)
* Full pill radius only for small chips (height ≤28px) or segmented controls
* Do **not** use `16px` radius for utility containers

### Elevation rules

* Default surfaces use border only
* Use no elevation for table rows, filters, inputs, and timetable cells
* Use one small shadow only for popovers/dropdowns if needed
* Do not combine heavy shadows with borders
* No glassmorphism or blurred panels

### Motion tokens

| Token | Value | Usage |
|---|---|---|
| `motion-fast` | `150ms` | Hover bg, border color, chip appear |
| `motion-base` | `200ms` | Selection state, tab switch, row highlight |
| `motion-slow` | `250ms` | Maximum for any UI transition |

* Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
* Animate only `background-color`, `border-color`, `color`, `opacity`, `transform` (translateY ≤4px for toast)
* Respect `prefers-reduced-motion: reduce` — disable shimmer, slide animations; use instant opacity or static text `Đang xử lý...`

### Component states

Every interactive component must have these states where relevant: Default, Hover, Focus, Active/pressed, Selected, Disabled, Loading, Error, Warning, Empty.

**Primary action vs selected state:**

| | `primary` (action) | `primary-subtle` (selection) |
|---|---|---|
| Use for | `Chọn`, `Dán`, `Đổi file`, `Tải file…` | Selected table row, active recommendation card, selected timetable card |
| Background | `#2563eb` solid | `#eff6ff` solid |
| Text | `#ffffff` 14–15px semibold | `#1a1a1a` (text-primary) |
| Affordance | Filled button | Row/card highlight + `Đã chọn` text or ✓ — **not** a filled blue button |

**Focus state:** `:focus-visible` → `focus-ring` (3px rgba blue, **2px offset**). On `primary` filled buttons: white inner ring variant.

**Disabled button:**

* `opacity: 0.55`; `cursor: not-allowed`
* `aria-describedby` → readiness banner or inline reason
* Tooltip mirrors reason text
* No hover change when disabled

**Conflict & warning (color independence):**

* Table row: `Trùng {mã}` in `danger` text + ⚠ icon; `aria-disabled="true"`
* Timetable cell: `danger-subtle` bg + 2px left border `danger` + label `Trùng lịch`
* Chip: `warning-subtle` bg + `warning` text + label text

State rules:

* Prefer inline validation over modal validation
* Disabled states must explain why when the reason affects task completion
* Conflict states must be visible at the row/card/timetable level
* Loading states use skeleton or inline loading, not full-page spinners
* Empty states should be short and practical

### Button and icon rules

* Buttons may use text, functional SVG icons, or icon + text
* Icon-only buttons must have obvious meaning, accessible labels, and tooltip text
* Icon-only hit targets: **minimum 44×44px** (visual icon may be 16–20px with padding)
* Use icons only for functional actions: upload, replace file, remove file, copy, share, download, remove class, expand detail
* Do not use decorative icons
* Primary actions should be visually clear without adding new colors
* Timetable action buttons may be compact icon buttons

---

## Accessibility contract

**WCAG target:** Level AA per **WCAG 2.2**. Blocking for mockup sign-off; P0 if shipped without it.

### Global structure

* Skip link (first focusable): `Bỏ qua đến nội dung chính` → `#main-workspace` — visible on `:focus-visible` only
* Landmarks: `<header>` app shell; `<nav aria-label="Chế độ làm việc">` mode switch; `<main id="main-workspace">`
* `<html lang="vi">`
* Document title: `Courses — Xếp lớp` / `Courses — Nhập mã lớp`
* Confirmation/detail modals: `role="dialog"` + `aria-modal="true"`; focus trap; `Escape` closes; restore focus to trigger

### Keyboard navigation & tab order

1. Skip link
2. Mode switch (`Xếp lớp` / `Nhập mã lớp`)
3. File controls (import / replace / remove)
4. Left work column (search → filters → table/input → recommendations)
5. Timetable toolbar actions
6. Timetable grid

**Roving tabindex** (Arrow keys inside region; `Tab` enters/exits):

* **Filter bar:** one tab stop; Arrow Left/Right among filters
* **Class table body:** one tab stop; Up/Down moves row focus; `Enter`/`Space` activates `Chọn` when not disabled
* **Unresolved list:** Up/Down selects active unresolved item

**Mode switch:** `role="tablist"` with `role="tab"` buttons; `aria-selected`; Arrow Left/Right; announce `Đã chuyển sang chế độ [tên]`.

**Class table:** Native `<table>` with `<caption class="sr-only">`; sortable columns use `aria-sort`; disabled rows use `aria-disabled` + `aria-describedby` pointing to reason text. Sticky `<thead>` when table scrolls vertically.

**Filters:** Visible `<label>` on every filter — placeholders are not labels.

**Timetable:** Prefer native `<table>` markup with `scope` on headers. Class cards: `role="group"` + `aria-label`. Remove icon: `aria-label="Xóa {mã lớp}"`.

**Toolbar disabled buttons:** `aria-describedby="readiness-banner"` when readiness banner visible.

### Live regions

| Event | Politeness | Example |
|---|---|---|
| Class selected/removed | `polite` | `Đã thêm IE108.O22 vào thời khóa biểu` |
| Conflict on select | `polite` | `Không thể chọn IS403.O21 vì trùng IE108.O22` |
| Copy/share success | `polite` | `Đã sao chép 4 mã lớp` |
| File parse error | `assertive` | `File không đúng định dạng` |
| Filter/search count change | `polite` | `Tìm thấy 12 lớp` |

### Focus ring & color independence

* `:focus-visible` on all interactives — 2px solid `#2563eb`, 2px offset, ≥3:1 contrast
* Color is never the only indicator — always pair with text label and/or icon (SC 1.4.1)
* Body text contrast ≥4.5:1; UI boundaries ≥3:1
* Touch targets ≥44×44px on tablet/mobile; ≥8px gap between adjacent icon buttons
* `prefers-reduced-motion: reduce` — disable shimmer, slide animations; use static placeholders or `Đang xử lý...`

---

## Layout & grid specification

### Desktop (≥1280px)

| Property | Value |
|---|---|
| Target frame width | `1440px` (max workspace width; `32px` outer padding) |
| App shell height | `56px` fixed |
| Main workspace top padding | `24px` below shell |
| Column split | **58/42** (preferred) or **60/40** — left = work area, right = timetable |
| Column gap | `24px` |

**`Xếp lớp` left column:** Class explorer (title → search → filters → table)

**`Nhập mã lớp` left column** (single column; no third desktop column):

1. Manual input panel
2. Token chips row (conditional)
3. Recommendation workspace — **internal horizontal split inside left column only:**
   * Left sub-panel (40%): unresolved list
   * Right sub-panel (60%): recommendation cards
   * Sub-panel gap: `16px`

**Right column (both modes):** Timetable panel title + toolbar → weekly grid

### Sticky timetable

* `position: sticky` on right-column timetable panel
* `top: 72px` (shell 56px + 16px offset)
* `max-height: calc(100vh - 72px - 32px)` — panel scrolls internally if needed
* Background: `surface` — no bleed-through on scroll

### Responsive breakpoints

| Breakpoint | Range | Layout |
|---|---|---|
| Desktop | `≥1280px` | Two-column grid, `24px` gap, sticky right timetable |
| Tablet | `768px–1279px` | Stack if table readable width <480px; else narrow two-column (55/45), `16px` gap |
| Mobile | `<768px` | Single column — explicit stack order below |

**Mobile stack order (top → bottom):**

1. App shell (mode switch + file controls)
2. Active mode work area:
   * `Xếp lớp`: search → filters → class table
   * `Nhập mã lớp`: manual input → chips → unresolved list → recommendation cards (stack vertically)
3. Timetable preview (toolbar stays in timetable header)

**Forbidden on desktop:** vertical single-page-flow; three columns; full-width timetable below full-width table at ≥1280px.

---

## Shared app shell

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Courses]  [Xếp lớp | Nhập mã lớp]                    [file control zone]  │  56px
└─────────────────────────────────────────────────────────────────────────────┘
```

* Left: app name `Courses` (`16px`, weight `600`)
* Center-left: segmented mode switch
* Right: file control zone only — no stats, no `Nguồn dữ liệu` block
* Light theme only

### File control states

| State | Header UI | Copy (VI) |
|---|---|---|
| **no_file** | Compact button `Tải file thời khóa biểu (.xlsx)` | Work-area note: `Tải file thời khóa biểu để xem danh sách lớp.` |
| **parsing** | Spinner + `Đang đọc file...`; replace/remove disabled | Class table skeleton (5–8 rows) |
| **success** | `tkb(1).xlsx` + `Đổi file` + remove icon (tooltip `Xóa file`) | `Đã tải tkb(1).xlsx` (aria-live polite, once) |
| **wrong_type** | Import button + inline error | `File không đúng định dạng. Vui lòng chọn file .xlsx.` |
| **missing_columns** | Inline error | `File thiếu cột cần thiết: Mã lớp, Môn học, Thứ, Tiết.` |
| **corrupt** | Import + retry | `Không đọc được file. Thử xuất lại file Excel rồi tải lại.` |
| **empty_sheet** | Warning state | `Không tìm thấy lớp học nào trong file.` |
| **huge_file** | Progress indicator | `File lớn, quá trình đọc có thể mất vài giây.` |
| **replace_confirm** | Modal when `Đổi file` clicked and ≥1 class selected | `Đổi file sẽ xóa các lớp đã chọn. Tiếp tục?` — `Tiếp tục` / `Hủy` |
| **remove_confirm** | Modal when remove clicked and ≥1 class selected | `Các lớp đã chọn sẽ bị xóa.` — `Xóa file` / `Hủy` |

Do not create a separate `Nguồn dữ liệu` section. Do not show row counts, course counts, semester stats, or long helper text.

---

## Journey & interaction specification

### Core principles

| Principle | Rule |
|---|---|
| Timetable as source of truth | Selected/resolved classes appear only as timetable cards |
| Immediate feedback | Every selection/removal updates timetable synchronously — no manual refresh |
| Inline over modal | Validation and conflicts live inline; modals for confirmations and optional detail only |
| Color + text/icon | Success, warning, danger, conflict always pair color with text and/or icon |

### Timetable live-update contract

| Trigger | Behavior | Latency |
|---|---|---|
| Click `Chọn` on class row | Class card appears in correct cell(s) immediately | ≤150ms |
| Click `Chọn` on recommendation card | Resolved bundle appears in timetable immediately | ≤150ms |
| Remove class from timetable card | Card disappears; conflicts re-evaluate | ≤150ms |
| File import succeeds | Timetable clears; empty state until new selections | After parse |

**Forbidden:** full-timetable loading overlay for add/remove; user-initiated refresh control.

**Undo on remove:** Toast `Đã xóa {mã lớp}. Hoàn tác?` — 5-second window.

### Mode switch state rules

Mode switch toggles view layout only — single app session state.

**Always persists:** imported file, timetable cards, `Xếp lớp` search/filter values, `Nhập mã lớp` textarea + chips + active unresolved item.

**Confirmation gate:** Show dialog only when switching **away from** `Nhập mã lớp` with non-empty textarea containing ≥1 unresolved or invalid chip.

* Title: `Chuyển chế độ?`
* Body: `Các mã chưa xử lý trong ô nhập sẽ bị xóa. Thời khóa biểu đã chọn vẫn giữ nguyên.`
* Primary: `Chuyển` / Secondary: `Ở lại`
* On confirm: clear textarea + chips + recommendations; **keep timetable**

Switching into `Nhập mã lớp` requires no confirmation. Do not auto-populate textarea from timetable selections.

### Conflict model

**Never blocking on select.** No auto-open modal on failed `Chọn`.

| Surface | Treatment |
|---|---|
| Class table row | `aria-disabled`; `surface-muted` bg; `Trùng {mã lớp}` + ⚠ icon in `Trạng thái` |
| Recommendation card | `danger` border; `Chọn` disabled; `Trùng {mã lớp}` + ⚠ icon |
| Timetable cell | `danger-subtle` bg; label `Trùng lịch` + ⚠ icon |
| Optional toast | `Không thể chọn {mã mới} vì trùng {mã đã chọn}.` — auto-dismiss 4s |

**Detail modal (allowed only from `Xem chi tiết`):** Title `Chi tiết trùng lịch`; lists both classes' day/period/room; button `Đóng`.

Row reason and timetable cell tint must reference the **same** conflicting class code.

### `Không trùng lịch` filter behavior

Toggle default **off**. When ON and ≥1 class selected: **do not hide** conflicting rows — keep visible, disabled, with inline reason `Trùng {mã lớp}`. Non-conflicting rows remain selectable. Toggle does not change timetable.

### Output & readiness model

All output lives in **timetable header toolbar** only. No standalone output section.

| Action | Enabled when | Disabled reason |
|---|---|---|
| `Sao chép mã lớp` | Timetable has ≥1 class card | `no_selection` |
| `Sao chép script` | Script generated for current timetable | `no_script` |
| `Chia sẻ` | Same as copy codes | `no_selection` / `not_ready` |
| `Tải ảnh TKB` | Timetable has ≥1 class card | `no_selection` |

**Readiness banner** (below toolbar, inside timetable panel, `id="readiness-banner"`, `role="status"`):

| Context | Copy |
|---|---|
| Invalid/unresolved tokens | `Còn {N} mã chưa hợp lệ.` |
| Unresolved choices remain | `Còn {N} mã cần chọn lớp.` |
| No selection | `Chọn ít nhất một lớp để sao chép hoặc chia sẻ.` |
| Script not ready | `Chưa có script đăng ký cho thời khóa biểu hiện tại.` |
| Active conflicts | `Thời khóa biểu đang có trùng lịch. Xem chi tiết trên bảng.` |

Disabled toolbar buttons: `aria-describedby="readiness-banner"`.

**Optional script peek:** Single `Xem script` toggle may reveal collapsible max-3-line monospace snippet below toolbar, inside timetable panel only. Default collapsed.

### Share model

**Preferred:** Web Share API when `navigator.share` available.

* `title`: `Thời khóa biểu — Courses`
* `text`: `Mã lớp:\n{code1}\n{code2}...`
* `files`: optional PNG blob when `navigator.canShare({ files })` is true

**Fallback:** Copy text to clipboard → toast `Thiết bị không hỗ trợ chia sẻ trực tiếp. Đã sao chép nội dung.`

**Forbidden:** share modal, social picker panel, QR code UI, separate share sidebar.

### Export & print

**Timetable image export (`Tải ảnh TKB`):**

* Captured region: timetable body only (grid + online row + class cards)
* Excluded: app shell, class table, filters, toolbar buttons (default)
* Frame padding: `16px` on `surface`
* Output: PNG, width `800px`, height auto
* Filename: `tkb-courses-{YYYY-MM-DD}.png`
* Success toast: `Đã tải ảnh thời khóa biểu.`

**Print CSS (`@media print`):**

* Print target: timetable panel only
* Hide: app shell, left column, toolbars, toasts, filters
* `@page { size: A4 landscape; margin: 12mm; }`
* Conflict cells: hatch or ⚠ icon + label — not color-only

---

## Copy matrix

### Empty states

| Location | Copy |
|---|---|
| Timetable (`Xếp lớp`) | `Chọn lớp từ bảng để xem thời khóa biểu.` |
| Timetable (`Nhập mã lớp`) | `Nhập mã lớp hoặc chọn gợi ý để xem thời khóa biểu.` |
| Search/filter no results | `Không tìm thấy lớp nào phù hợp. Thử từ khóa khác hoặc bỏ bộ lọc.` |
| No suggestions | `Không có gợi ý cho {mã}. Kiểm tra mã hoặc thử mã khác.` |
| No file loaded | `Tải file thời khóa biểu (.xlsx) ở góc trên để xem danh sách lớp.` |
| Recommendations not run | `Nhập mã rồi bấm Xếp gợi ý để xem lựa chọn.` |

### Success toasts

| Action | Copy | Duration |
|---|---|---|
| Copy class codes | `Đã sao chép {N} mã lớp.` | 3s |
| Copy script | `Đã sao chép script đăng ký.` | 3s |
| Share fallback | `Thiết bị không hỗ trợ chia sẻ trực tiếp. Đã sao chép nội dung.` | 4s |
| Export image | `Đã tải ảnh thời khóa biểu.` | 3s |

### Undo toasts (5-second window)

| Action | Copy |
|---|---|
| Remove class from timetable | `Đã xóa {mã lớp}. Hoàn tác?` |
| `Xóa lỗi` removes invalid tokens | `Đã xóa {N} mã lỗi. Hoàn tác?` |

### Inline validation labels

| Status | Label |
|---|---|
| Unresolved course ID | `Cần chọn lớp` |
| Needs practice | `Cần chọn thực hành` |
| Not found | `Không tìm thấy` |
| Invalid format | `Không hợp lệ` |
| Compatible | `Không trùng lịch` |
| Conflict | `Trùng {mã lớp}` |
| Selected | `Đã chọn` |
| All valid (no chips) | `✓ Tất cả mã đã hợp lệ` |

---

## Loading & feedback patterns

| Action | Loading UI | Completion |
|---|---|---|
| File parse | Header `Đang đọc file...` + thin progress bar if >1s | Success header or inline error |
| Huge file | `File lớn...` + % after 3s | Table fade-in |
| `Xếp gợi ý` | Button spinner; recommendation skeleton (2–3 cards) | Chips + unresolved list populated |
| Class `Chọn` | No spinner (sync) | Immediate card + row `Đã chọn` |
| Copy/share/export | Button micro-spinner ≤500ms | Toast |
| Conflict recompute | None visible | Row/cell update ≤150ms |
| Search/filter | Trailing spinner on input if >300ms | `Đang lọc kết quả...` optional |

**Skeleton patterns:**

* Class table parsing: 5–8 skeleton rows; `surface-muted` bars
* Recommendation panel: 2–3 card placeholders, height ≈88px
* Timetable: do not skeleton for add/remove; show existing cards throughout

Busy buttons: `aria-busy="true"` while loading.

---

Use realistic timetable data:

* `IE108.O22` — `Phân tích thiết kế phần mềm` — `Võ Tấn Khoa` — `Thứ 4` — `Tiết 6789` — `LT` — `VN`
* `IS403.O21` — `Phân tích dữ liệu kinh doanh` — `Nguyễn Đình Thuân` — `Thứ 4` — `Tiết 1234` — `LT` — `VN`
* `CE201.O21` — `Đồ án 1` — `Online` — `Tiết *` — `ĐA` — `VN`
* `IS405.O22.1` — `Dữ liệu lớn` — `Nguyễn Hồ Duy Tri` — `Thứ 4` — `Tiết 67890` — `HT1` — `VN`
* `IS405.O22.2` — `Dữ liệu lớn` — `Nguyễn Hồ Duy Tri` — `Thứ 4` — `Tiết 67890` — `HT1` — `VN`
* `CE409.O21.1` — `Kỹ thuật thiết kế kiểm tra` — `Phạm Thanh Hùng` — `Online` — `Tiết *` — `HT2` — `VN`
* `IT003.O21.TTNT` — `Cấu trúc dữ liệu và giải thuật` — `Thứ 3` — `Tiết 12345`
* `EC201` as a course-only input that needs class selection

---

## PAGE 1 — `Xếp lớp`

Purpose: browse available classes and build a compatible timetable.

Layout: two-column workspace per Layout specification. Left = class explorer. Right = sticky timetable preview + toolbar.

Do not include a separate selected classes panel. Selected classes must be visible directly in the timetable.

### Class explorer

* Title: `Danh sách lớp`
* Search placeholder: `Tìm mã môn, mã lớp, tên môn, giảng viên…`
* Filter groups (one row, wrap on narrow widths):

**Lịch học:** `Thứ`, `Buổi`

**Thuộc tính:** `HTGD`, `Ngôn ngữ`, `Khoa QL`

Helper under Attributes (`12px`, `text-secondary`): `HTGD` = hình thức giảng dạy · `Khoa QL` = khoa quản lý môn

Per-filter tooltips on hover/focus.

**Lọc nhanh:** `Không trùng lịch` (toggle, default **off**)

`Không trùng lịch` behavior: when ON and ≥1 class selected, **do not hide** conflicting rows — keep visible, disabled, with inline reason `Trùng {mã lớp}`. Non-conflicting rows remain selectable.

Dense table columns: `Mã lớp`, `Môn học`, `Giảng viên`, `Thứ`, `Tiết`, `Phòng`, `Số TC`, `Sĩ số`, `HTGD`, `Ngôn ngữ`, `Trạng thái`

Table row states:

* Selectable row with action `Chọn` (`primary` button)
* Selected row with state `Đã chọn` (`primary-subtle` bg — not filled blue button)
* Disabled row with reason `Trùng IS403.O21` + ⚠ icon
* Row needing companion: `Cần lớp thực hành`

**Large table handling:** paginate at 50 rows (`Trước` / `Sau` + `Trang {n}/{total}`) or virtual scroll with sticky header. Search/filter resets to page 1. Table min-width `960px` in `overflow-x: auto` wrapper. Result summary: `Hiển thị 1–50 / 238 lớp`.

### Timetable preview

* Title: `Thời khóa biểu`
* Weekly grid `Thứ 2` to `Thứ 7`; period rows; online row for `Thứ *` / `Tiết *`
* Class cards: class code, short course name, lecturer, room
* Remove via compact icon button on card (`aria-label="Xóa {mã lớp}"`)
* Conflict cells: `danger-subtle` bg + `Trùng lịch` label + ⚠ icon

Timetable header toolbar:

* `Sao chép mã lớp`
* `Sao chép script`
* `Chia sẻ`
* `Tải ảnh TKB`

Empty timetable: `Chọn lớp từ bảng để xem thời khóa biểu.` Disable output actions when no class selected.

---

## PAGE 2 — `Nhập mã lớp`

Purpose: validate course/class codes, resolve missing choices, produce final class codes.

Layout: two-column per Layout specification. Left = manual input + recommendation workspace (internal 40/60 split). Right = sticky timetable + toolbar.

Do not include a separate resolved class list.

### Manual input panel

* Title: `Nhập mã môn hoặc mã lớp`
* Visible `<label>` always present
* Textarea placeholder:

```
VD: EC201 IT003.O21 IS405.O22
Lưu ý: Cách nhau bằng khoảng trắng, dấu phẩy hoặc dấu +.
```

Buttons:

| Action | Behavior |
|---|---|
| `Dán` | Reads clipboard → inserts at cursor → tokenizes → updates chips. Does not auto-select classes. |
| `Xóa lỗi` | Removes only `Không tìm thấy` / `Không hợp lệ` tokens. Preserves valid/unresolved tokens. |
| `Xếp gợi ý` | Runs resolution pass → populates unresolved list → loads cards for first unresolved item. Also triggers on textarea blur if content changed. Does not auto-apply recommendations. |

Tokenize: split on whitespace, comma, `+`, semicolon; trim; dedupe preserving order.

Token chips: show only when errors or decisions needed. When all valid: hide chips; show `✓ Tất cả mã đã hợp lệ` (success text + check icon).

Example chips: `EC201` — `Cần chọn lớp`; `IS405.O22` — `Cần chọn thực hành`; `ABC123` — `Không tìm thấy`

### Recommendation workspace

* Title: `Gợi ý môn học`
* Left: unresolved list (`EC201`, `IS405.O22`, `IT003`); first unresolved selected by default
* Right: recommendation cards for active item

Each card: class code/bundle, course name, lecturer, day/period, room, state, `Chọn` action.

Examples:

* `EC201.Q21` — `Không trùng lịch` — `Chọn`
* `EC201.Q22` — `Trùng IE108.O22` — disabled + ⚠
* `IS405.O22 + IS405.O22.1` — `Lý thuyết + thực hành` — `Chọn`

Reason labels: `Không trùng lịch`, `Trùng IE108.O22`, `Cần chọn 1 lớp thực hành`, `Đã chọn`. No fake scoring or AI confidence labels.

`Chọn` on card → resolves token(s) → timetable updates immediately.

### Timetable preview

Same component as `Xếp lớp`. Show locked manual classes and selected suggestions together. Conflict inline + timetable cell highlight.

Empty timetable: `Nhập mã lớp hoặc chọn gợi ý để xem thời khóa biểu.`

Disabled output: when unresolved/invalid tokens remain — disable copy/share/export; show readiness banner per Output & readiness model.

---

## Mockup direction requirement

Before finalizing, present 2–3 directions using the same tokens and scope.

**Required final direction:**

| Mode | Direction |
|---|---|
| `Xếp lớp` | **Table-first hybrid** — class table dominates left; timetable sticky right at ~42% |
| `Nhập mã lớp` | **Resolution-first** — manual input + unresolved/recommendation split dominates left; timetable shows resolved state sticky right |

Each direction documents in 3–5 bullets: layout idea, best user scenario, main tradeoff, token fit.

### Deliverable frames

| Frame | Width | Required states |
|---|---|---|
| Desktop | `1440px` | Both modes, file loaded, at least one conflict |
| Stacked | `768px` | `Xếp lớp` stack order visible |
| Optional | `375px` | Table overflow behavior |

Include states: no-file, loaded-file, conflict, invalid manual input, ready-to-copy.

---

## Final quality bar

* Vietnamese UI labels
* Minimal, clean, easy-to-understand product UI
* Light theme only
* Compact layout with dense but legible table (14px minimum primary content)
* Standard form controls with visible labels
* Clear interaction states with color + text/icon independence
* Header-level file controls only
* Timetable-level output actions only
* No separate data source, selected-class, resolved-class, or output panels
* No dashboard metric cards
* No generic helper paragraphs
* No decorative hero area
* No unnecessary stats
* No fake AI assistant framing
* No account, notification, profile, or admin features
* WCAG 2.2 AA accessibility contract satisfied
* All P1 specification gaps from design review resolved before treating mockups as canonical

---

## Engineering handoff checklist

### Tokens & CSS

- [ ] All 13 color roles as CSS custom properties matching token table
- [ ] `focus-ring` on all interactives via `:focus-visible`
- [ ] `primary` vs `primary-subtle` visually distinct
- [ ] Panel radius 12px; no 16px utility containers
- [ ] Motion 150/200ms; `prefers-reduced-motion` present

### Typography

- [ ] Be Vietnam Pro + Noto Sans with `font-display: swap`
- [ ] Body 15–16px; table primary ≥14px; metadata 12–13px only
- [ ] Vietnamese diacritics QA pass at 14px and 15px

### Accessibility

- [ ] Skip link; mode switch `tablist`/`tab`; labeled filters; `aria-sort`; `aria-disabled` + reason; live regions; 44×44px icon targets; color independence

### Functional

- [ ] File import loading + error recovery for all states in matrix
- [ ] Class selection immediately updates timetable
- [ ] Conflict in both table row and timetable cell
- [ ] Mode switch preserves timetable; confirms only for unresolved input
- [ ] Copy/share/export show success toast; removal shows undo toast
- [ ] Disabled toolbar explains via readiness banner

### Anti-drift

- [ ] No output panel, stat cards, ImportSection, blocking conflict modal, desktop vertical flow

### Breakpoints

- [ ] Tested: 375, 768, 1024, 1440

---

## Success metrics

Measurable UX outcomes for post-launch validation (Intent `/measure`):

| Metric | Target | Measurement |
|---|---|---|
| **Time-to-first-timetable** | ≤30s for first-time user (import → select → see card) | Session replay / task test, n≥10 |
| **Conflict comprehension** | ≥90% identify conflicting class code without opening modal | Moderated test: conflict scenario |
| **Disabled-action clarity** | ≥85% correctly explain why copy/share is disabled | Survey after blocked toolbar interaction |
| **Manual-code resolution rate** | ≥80% complete valid timetable from mixed paste in one session | Analytics: `Nhập mã lớp` → ready-to-copy |
| **Mode-switch data loss** | 0 silent loss of timetable selections across mode switch | Automated + manual regression |