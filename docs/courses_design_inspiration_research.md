# Courses — Design Inspiration Research

**Project:** Vietnamese university timetable planning tool  
**Artifact:** Design inspiration research markdown  
**Status:** Prepared after approved mockup review  
**Date:** 2026-07-06

## 1. Research objective

The research goal was to ground the approved `Courses` mockup in proven UI/UX patterns for a compact desktop planning tool with dense data tables, manual code validation, schedule conflict resolution, and weekly timetable preview.

The final design must remain a practical student workflow tool. It should not drift into a dashboard, marketing site, admin console, collaboration product, account system, or AI assistant. The key product outcome is **speed-to-confidence**: students should quickly understand what they can choose, what is already selected, what conflicts, and whether the timetable output is ready.

## 2. Primary source hierarchy

The design was evaluated against this source hierarchy:

1. **Product specification and scope boundary** — the `prompt_v3.md` contract defines the allowed workflows, forbidden patterns, required pages, and anti-drift rules.
2. **Design system tokens** — spacing, typography, color, radius, elevation, motion, and state rules are the binding visual system.
3. **Required component structure** — app shell, class explorer, manual input panel, recommendation workspace, and timetable panel.
4. **Provided timetable examples** — Vietnamese class data, course codes, teacher names, period bands, and conflict scenarios.
5. **External inspiration references** — used only for hierarchy, spacing rhythm, table density, validation behavior, calendar readability, and responsive stacking. No visual reference was copied directly.

## 3. References reviewed

### 3.1 Mobbin — real product flow and utility UI pattern library

**Reviewed for:** compact web-app hierarchy, dense utility interfaces, table actions, filter grouping, restrained product polish.

**Observed principles:**

- Product screens often preserve task context by keeping primary work controls close to the work surface.
- Utility interfaces benefit from restrained color usage, compact controls, and clear action grouping.
- Dense layouts work when secondary information is visually subdued and primary actions remain obvious.

**Applied to Courses:**

- Kept the header as a functional app shell with brand, mode switch, and file controls only.
- Grouped filters directly above the class table rather than adding a separate data-source section.
- Used subdued surfaces and borders instead of decorative cards or dashboard-style summaries.

**Not copied:** individual screen layouts, app branding, icon styles, or exact component styling.

Source: https://mobbin.com/

### 3.2 Dribbble schedule/calendar UI references

**Reviewed for:** visual treatment of schedule grids, weekly calendar hierarchy, class/event card readability, and desktop planning composition.

**Observed principles:**

- Calendar grids become easier to scan when day headers, time/period labels, and event cards have clear visual separation.
- Event cards should expose the most task-critical information first: code/title, then metadata.
- Many portfolio designs overuse gradients, oversized cards, rounded hero layouts, and decorative illustrations.

**Applied to Courses:**

- Timetable cards show class code first, then course title, lecturer, and room/format.
- Weekly grid uses clear day columns and period rows to support immediate conflict comprehension.
- Visual styling stays utilitarian: no gradients, no claymorphism, no decorative empty-state illustration.

Source: https://dribbble.com/tags/schedule

### 3.3 Nielsen Norman Group — data table task model

**Reviewed for:** how users work with dense tables, especially finding, comparing, and acting on records.

**Observed principles:**

- Data tables should support users finding records that fit criteria, comparing records, viewing/editing a row, and taking actions on records.
- A table-heavy interface should keep filtering/searching close to the table, not in an unrelated side area.
- Row-level actions are appropriate when the decision belongs to a specific record.

**Applied to Courses:**

- The `Xếp lớp` page uses a table-first layout because the primary task is browsing and selecting class rows.
- Search and filters are placed immediately above the table.
- Each row exposes its state: `Chọn`, `Đã chọn`, `Trùng {mã lớp}`, or a companion/practice requirement.

Source: https://www.nngroup.com/articles/data-tables/

### 3.4 MUI X Data Grid documentation — filtering and quick-filter behavior

**Reviewed for:** data grid filtering conventions, toolbar placement, quick filter behavior, and column-level filtering affordances.

**Observed principles:**

- Quick filters are useful when users need one text input to filter across multiple columns.
- Explicit filter controls remain useful for structured criteria.
- Dense grids need predictable toolbar/filter placement and a stable header.

**Applied to Courses:**

- The class explorer combines a broad search field with structured filters for day, session, teaching format, language, and managing faculty.
- Filters remain visible and labeled; placeholders are not used as labels.
- The table keeps a stable header and pagination/overflow behavior for large datasets.

Sources:  
- https://mui.com/x/react-data-grid/filtering/  
- https://mui.com/x/react-data-grid/filtering/quick-filter/

### 3.5 FullCalendar TimeGrid — schedule grid structure

**Reviewed for:** weekly schedule layout, horizontal day columns, vertical time/slot axis, and slot readability.

**Observed principles:**

- TimeGrid-style views display days horizontally and time vertically.
- A weekly view supports planning because users can compare conflicts spatially.
- Narrower calendar surfaces need careful handling of day cell widths and readable event cards.

**Applied to Courses:**

- The timetable preview uses `Thứ 2` through `Thứ 7` as day columns and period bands as rows.
- Online classes use a dedicated row instead of forcing them into a time slot.
- The timetable is sticky on desktop so selected/resolved classes remain visible while the user browses or resolves codes.

Source: https://fullcalendar.io/docs/timegrid-view

### 3.6 GOV.UK Design System — validation and error recovery

**Reviewed for:** inline validation wording, explaining what went wrong, and giving actionable recovery.

**Observed principles:**

- Validation messages should explain what went wrong and how to fix it.
- Error feedback should be close to the field or item that caused the error.
- Error state must not rely on color alone.

**Applied to Courses:**

- Manual-code validation uses chips such as `Cần chọn lớp`, `Cần chọn thực hành`, and `Không tìm thấy`.
- Recommendation cards explain conflicts inline with `Trùng IE108.O22` rather than opening a blocking modal.
- Disabled toolbar actions reference the readiness banner so the user can understand the block.

Sources:  
- https://design-system.service.gov.uk/components/error-message/  
- https://design-system.service.gov.uk/patterns/validation/

### 3.7 WAI-ARIA APG and WCAG — keyboard behavior, focus, and color independence

**Reviewed for:** accessible tabs, focus order, keyboard interaction, contrast, and color-independent state communication.

**Observed principles:**

- Tabbed interfaces should use `tablist`/`tab` semantics and arrow-key navigation.
- WCAG guidance supports accessible content through perceivable, operable, understandable, and robust interactions.
- Focus indicators need sufficient visual contrast and should be visible on all interactive controls.

**Applied to Courses:**

- Mode switch is specified as a tablist with `aria-selected` and arrow navigation.
- Class table, timetable, and unresolved list have keyboard navigation expectations.
- States combine color with text/icon labels: `⚠ Trùng IE108.O22`, `✓ Không trùng lịch`, `Cần chọn lớp`.

Sources:  
- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/  
- https://www.w3.org/WAI/standards-guidelines/wcag/  
- https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html

### 3.8 MDN Web APIs — share and clipboard behavior

**Reviewed for:** native share affordance, file sharing support detection, clipboard fallback, and user-activation constraints.

**Observed principles:**

- `navigator.share()` can invoke the device-native share sheet.
- File sharing should be checked with `navigator.canShare()` before passing files.
- Clipboard access has browser permission and user-activation considerations.

**Applied to Courses:**

- `Chia sẻ` uses native Web Share when supported.
- Fallback copies text to the clipboard and shows a short toast.
- No share modal, social picker, QR code panel, or separate share sidebar is introduced.

Sources:  
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share  
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API  
- https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

## 4. References rejected

These patterns appeared commonly in inspiration searches but were rejected because they violate the product contract or slow the task.

| Rejected pattern | Why rejected | Courses replacement |
|---|---|---|
| Dashboard metric cards / KPI rows | They frame the product as an analytics dashboard and consume space without helping class selection. | Readiness appears through timetable cards, row states, and concise readiness banners. |
| Comparison-table landing layouts | They optimize for marketing comparison, not course-planning action. | Dense class table plus sticky timetable preview. |
| Separate output sidebar or output panel | It duplicates the timetable as source of truth and creates another workspace. | Output actions stay in the timetable header toolbar only. |
| Modal-first conflict resolution | It interrupts scanning and comparison. | Conflict reason appears inline in table rows, recommendation cards, and timetable cells. |
| Playful edtech / claymorphism templates | They reduce perceived utility and often use inflated cards and decorative empty states. | Plain utility panels, compact controls, practical copy. |
| Glassmorphism, gradients, and decorative CTAs | They add visual noise and conflict with the light utility design system. | Flat surfaces, subtle borders, restrained blue accent. |
| Chatbot or AI assistant framing | It is outside scope and can imply automation/confidence scoring. | Plain Vietnamese reason labels and deterministic suggestions. |
| Account/profile/notification/admin UI | Outside product scope. | No account, avatar, notification center, or admin navigation. |

## 5. Direction review

### Direction A — Table-first hybrid

**Best for:** browsing classes from an imported Excel timetable.

- The left column prioritizes `Danh sách lớp` with search, filters, and dense rows.
- The right column keeps `Thời khóa biểu` sticky so selected classes remain visible.
- Strong fit for the `Xếp lớp` mode because the user scans and chooses from a large imported dataset.
- Main tradeoff: requires desktop width and careful overflow handling.
- Token fit: compact spacing, 14px table primary text, `primary-subtle` row/card selection, restrained borders.

**Decision:** adopted for `Xếp lớp`.

### Direction B — Resolution-first

**Best for:** pasted or typed course/class codes with missing decisions.

- The left column starts with manual input and token-level validation.
- The recommendation workspace uses an internal split: unresolved items on the left, recommendation cards on the right.
- The sticky timetable shows resolved state and readiness without adding a resolved-list panel.
- Main tradeoff: introduces a two-step mental model — paste codes, then resolve choices.
- Token fit: chips, inline warning/danger labels, action cards, disabled states with reasons.

**Decision:** adopted for `Nhập mã lớp`.

### Direction C — Compact stacked utility

**Best for:** tablet and narrower screens.

- Work area stacks above the timetable preview.
- The same component hierarchy is preserved; no new feature surfaces appear.
- The no-file state becomes a short practical message rather than a decorative illustration.
- Main tradeoff: reduced side-by-side comparison.
- Token fit: 16px gaps, 12px panels, compact form/table controls, 44px touch targets.

**Decision:** adopted for the 768px stacked frame and responsive behavior.

## 6. Final design implications

### 6.1 App shell

- Keep the shell at 56px height.
- Left: `Courses` brand.
- Center-left: mode switch only.
- Right: file control zone only.
- Do not add stats, profile, notifications, settings, portal login, or onboarding.

### 6.2 `Xếp lớp` work area

- Use a table-first class explorer.
- Search and filters sit directly above the table.
- The `Không trùng lịch` toggle must not hide conflicting rows; it keeps them visible but disabled with inline reasons.
- Row state must be explicit and color-independent.

### 6.3 `Nhập mã lớp` work area

- The manual input panel owns parsing and tokenization.
- Chips appear only for errors or decisions needed.
- Recommendation cards resolve tokens; they do not auto-apply choices.
- Do not add a resolved classes panel; resolved classes appear only in the timetable.

### 6.4 Timetable panel

- Timetable remains the source of truth for selected/resolved classes.
- Output actions stay in the timetable header toolbar only, ordered exactly as specified:
  `Sao chép mã lớp` · `Sao chép script` · `Chia sẻ` · `Tải ảnh TKB`.
- Readiness status appears as a concise banner inside the timetable panel.
- Class removal happens directly from timetable cards.

### 6.5 Conflict treatment

- Conflict row/card states must reference the exact conflicting class code.
- Timetable conflict cells use danger-subtle background, left border, text label, and icon.
- No automatic blocking modal opens on conflict.
- A detail modal is only allowed from an explicit `Xem chi tiết` action.

### 6.6 Responsive behavior

- Desktop uses a two-column workspace with sticky timetable.
- Tablet can stack when table readability drops below the useful width.
- Mobile and compact tablet order: app shell, active work area, timetable preview.
- Do not switch desktop into a full-width vertical flow at 1280px and above.

## 7. Visual system decisions

| Area | Decision |
|---|---|
| Typography | Use Be Vietnam Pro with Noto Sans fallback; keep table primary text at 14px minimum. |
| Color | Use blue only for action/active state; separate solid `primary` from `primary-subtle` selected state. |
| Density | Use compact table spacing but preserve readable Vietnamese diacritics. |
| Surfaces | Border-only panels; no heavy shadows, glassmorphism, or blurred layers. |
| Empty states | Short practical copy inside the relevant panel. No decorative illustrations. |
| Motion | Use short state transitions only; no full-page spinners or decorative animations. |

## 8. Accessibility design notes

- The mode switch should implement tab semantics and arrow-key navigation.
- Class table should use native table semantics with sticky header behavior.
- Filters need visible labels; placeholders are not labels.
- Disabled rows and disabled toolbar buttons need programmatic reasons via `aria-describedby`.
- Live regions should announce selection, removal, conflicts, copy/share/export success, file parse errors, and filter count changes.
- Color is never the only state signal; every state uses text and/or icon.
- Focus rings must remain visible on all controls, including compact toolbar/icon buttons.

## 9. Approved mockup audit summary

The approved mockup aligns with the research direction in these ways:

- The top design board documents three directions and explicitly marks `Table-first hybrid` as selected.
- Page 1 uses a dense class table and sticky timetable preview, matching the table-first strategy.
- Page 2 uses manual-code validation, issue chips, unresolved list, and recommendation cards, matching the resolution-first strategy.
- The timetable panel owns readiness and output actions; there is no separate selected-class panel or output workspace.
- The bottom 768px frame demonstrates stacked behavior and no-file state without adding out-of-scope UI.

## 10. Implementation guardrail checklist

Before converting the mockup into production UI, verify:

- [ ] Header file controls are the only import/replace/remove surface.
- [ ] Timetable toolbar is the only output-action surface.
- [ ] No metric cards, stats strips, selected-class sidebars, resolved-class panels, or output panels exist.
- [ ] Conflicts are visible inline in row/card/timetable surfaces.
- [ ] `Không trùng lịch` does not hide conflicting rows.
- [ ] Manual invalid/unresolved codes use chips and readiness banners, not modal-first error handling.
- [ ] Web Share and clipboard actions have fallback toasts.
- [ ] All primary text remains legible in Vietnamese at the specified sizes.
- [ ] Keyboard navigation and focus order match the accessibility contract.
- [ ] Responsive stacking preserves the specified order.

## 11. Source index

### Project source

- `prompt_v3.md` / uploaded design contract: product scope, anti-drift rules, design tokens, accessibility contract, layout specification, page requirements, timetable data, and success metrics.

### External sources

1. Mobbin — UI & UX design inspiration for mobile and web apps: https://mobbin.com/
2. Dribbble schedule tag: https://dribbble.com/tags/schedule
3. Nielsen Norman Group — Data Tables: Four Major User Tasks: https://www.nngroup.com/articles/data-tables/
4. MUI X Data Grid filtering: https://mui.com/x/react-data-grid/filtering/
5. MUI X Data Grid quick filter: https://mui.com/x/react-data-grid/filtering/quick-filter/
6. FullCalendar TimeGrid View: https://fullcalendar.io/docs/timegrid-view
7. GOV.UK Design System error message: https://design-system.service.gov.uk/components/error-message/
8. GOV.UK validation pattern: https://design-system.service.gov.uk/patterns/validation/
9. WAI-ARIA APG tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
10. WAI WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
11. WCAG 2.2 focus appearance understanding: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
12. MDN Navigator.share: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
13. MDN Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
14. MDN Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
