# PRODUCT.md — UIT Course Planner

## Product intent
A browser-only tool for UIT students to import the official Excel timetable, choose non-conflicting classes, and copy the final class-code list or fast registration script.

## Users
UIT students preparing for course registration. They are time-constrained, compare many table rows, and need confidence that selected classes do not overlap.

## Core flow
Import Excel file → plan courses in one table → copy class list or registration script.

## Required UI behavior
- One page, not separate route steps.
- Vietnamese labels by default.
- Minimal copy. Prefer labels, status, and validation messages.
- Show only useful operational state: file, row count, selected classes, credits, generated outputs.
- Timetable data stays local in the browser.
- No telemetry or hidden data submission.

## Accessibility and resilience
- Semantic header/nav/main/section structure.
- Skip link for keyboard users.
- Visible focus rings.
- Disabled controls while importing.
- Reduced-motion support.
- Horizontally scrollable data table and timetable on small screens.
- Clear empty states when no Excel file or no selected class exists.

## Success criteria
- User can complete the workflow without reading an instruction block.
- User sees import status immediately after choosing a file.
- User can filter/select courses and see selected count and credits at a glance.
- User can copy class codes or script from the same page.
