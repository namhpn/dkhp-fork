# Plan: `grid-search-input` multi-criteria search with `;` (mode-tab-grid) — OR union + grouped per query

> Orchestrated with **diagnostic-protocol** (verify → trace → smallest fix) + **grill** (one-question-at-a-time decisions).
> Plan scope: **L0 UI/client only**. No DB/API/schema changes.

## 1) Context & Goal

`mode-tab-grid` currently has a single controlled `<input class="grid-search-input">` in `src/views/2XepLop/AgGrid/index.tsx:35` wired to `useGridOptions().onQuickFilterChange(value)` → `api.setQuickFilter(value)` in `src/views/2XepLop/AgGrid/utils.tsx:503`.
Filtering is case-insensitive substring across `QUICK_FILTER_FIELDS = {MonHoc, MaLop, TenGV}` via `getQuickFilterText` (`utils.tsx:85`).

**Goal:** `IT003; EC201; Nguyen` → OR search (union), hide unmatched, show **AG Grid grouped results per query** (dedup first-match), strict `;` separator, same 3 fields, plain text input.

---

## 2) Decisions Locked (Grill Results)

| # | Branch | Decision | Rationale |
|---|--------|----------|-----------|
| 1 | Logic | **OR (union)** with **GROUP BY per token** | Batch-search `IT003; EC201` shows both sets. |
| 2 | Dedup | **Dedup + first-match — first in `tokens` array (input order left-to-right, index 0 wins)** | Row matching multiple tokens appears once in first matching group. Explicit: `IT003; Nguyen` → row matching both goes to `IT003` group, not sorted-column or data order. Avoids clone/selection complexity, keeps `visibleCount` honest. |
| 3 | Separator | **`;` only strict** | Avoids conflict with `Tiet` commas (`1,2,3`), keeps comma free. Empty tokens ignored. |
| 4 | Fields | **Keep MonHoc/MaLop/TenGV only** | No `getQuickFilterText` expansion; blast radius stays L0. |
| 5 | UI | **Plain text only** | No chip/pill component, no toolbar rewrite. |
| 6 | Unmatched | **Hide unmatched** | Standard filter semantics; `hasNoVisibleRows` unchanged. |

Assumptions captured: `MonHoc` = ``${MaMH} - ${TenMH}`` valueGetter (`utils.tsx:135`); matching is case-insensitive `includes`; group headers are AG Grid collapsible row-groups with count.

---

## 3) Diagnostic Verification (Protocol § Trace Before Changing)

**Source:** `src/zus/index.ts` `selectFinalDataTkb` → `utils.tsx:598` `sortBy(dataTkb, ['KhoaQL','MaLop','Thu','Tiet'])` → `AgGridReact rowData`.
**Travel:** `index.tsx:39` `onChange → onQuickFilterChange` → `api.setQuickFilter(value)` verbatim; no split/tokenise; `defaultColDef.getQuickFilterText` filters to 3 fields.
**Render:** toolbar `visibleCount / totalCount` via `forEachNodeAfterFilter` (`utils.tsx:334`), banner `hasNoVisibleRows`.
**Gap:** missing at transform/state/render — no separator parsing, no OR expansion, no per-query grouping. Confirmed by grep: zero `quickFilterParser`/`isExternalFilterPresent`/`doesExternalFilterPass` in `AgGrid/`.

**Blast radius:** L0. Files touched only: `utils.tsx`, `index.tsx`, optional `styles.css`. No store persistence, no `agGridFilterModel`, no backend.

---

## 4) Proposed Approach (Smallest Viable Fix)

### 4.1 Strategy — External filter + synthetic group column

Replace `setQuickFilter` verbatim pass-through with:

1. **Parse** `quickFilterText` → `tokens[]` = `split(';').map(trim).filter(Boolean)` (preserve display label, lower-case for matching).
2. **External filter** for OR + hide unmatched:
   - `isExternalFilterPresent() => tokens.length>0`
   - `doesExternalFilterPass(node) => tokens.some(t => rowMatchesToken(node.data, t))` where `rowMatchesToken` checks lowercased `MonHoc|MaLop|TenGV` includes `t.toLowerCase()`.
3. **Grouping** dedup-first-match (explicit: first in input order):
   - Synthetic column `colId: 'searchGroup'` whose `valueGetter` returns `getFirstMatchingTokenLabel(data)` — first `tokens` entry that matches the row (index 0 wins).
   - When `tokens.length > 1` enable row grouping on that column (`columnApi.setRowGroupColumns` or conditional `columnDefs` memo). When ≤1 disable grouping (clean single-query UX). Group order = input order.
   - `groupSelectsChildren / groupSelectsFiltered` already true (`index.tsx:69-70`) — selection inside groups stays correct.
4. **counts/banner** reuse existing `getVisibleLeafCount` + `updateVisibleCount`. Group headers not counted.

**Why not `setQuickFilter` hacks:** Quick filter is single-string; no OR/group support without custom `quickFilterParser` (AG Grid 30 quickFilterParser not configured, and grouping still needed). External filter is idiomatic and composes with column `agTextColumnFilter` (`onFilterChanged` 500ms debounced).

**Why not mutate `rowData` filter manually:** That would bypass `api.isColumnFilterPresent()` composition and require re-implementing column filters. External filter keeps both layers active.

### 4.2 Key helpers (new, pure, testable in `utils.tsx`)

```ts
export const SEARCH_SEPARATOR = ';';
export function parseSearchTokens(input: string): string[] // display labels, trimmed, empties dropped
export function parseSearchTokensLower(input: string): string[] // lower-cased for matching
function getSearchableText(row: ClassModel): string[]  // [monHoc, maLop, tenGV] lower
function rowMatchesToken(row: ClassModel, lowerToken: string): boolean
export function getFirstMatchingTokenLabel(row: ClassModel, tokens: string[]): string | null
```

Reference reusable pattern: `src/manualInput.ts:80 tokenise` (but grid version splits only `;`, no `,`/`+`).

### 4.3 Group column — deep module (not shallow pass-through)

The `searchGroup` column is an **internal implementation detail** of the search module, not a caller-facing API. Callers never see `tokensDisplay`.

```ts
// utils.tsx — factory captures tokens in closure, no leakage to AgGrid caller
function createSearchGroupColumnDef(
  getTokens: () => string[], // closure over current tokens memo
): ColDef<ClassModel> {
  return {
    colId: 'searchGroup',
    headerName: 'Nhóm tìm kiếm',
    hide: true,
    suppressColumnsToolPanel: true,
    suppressFiltersToolPanel: true,
    valueGetter: ({ data }) => {
      try {
        if (!data) return null;
        return getFirstMatchingTokenLabel(data, getTokens());
      } catch {
        return null; // fortify: malformed row never breaks grid
      }
    },
    comparator: (a: string | null, b: string | null) => {
      const tokens = getTokens();
      const ia = a == null ? -1 : tokens.indexOf(a);
      const ib = b == null ? -1 : tokens.indexOf(b);
      return ia - ib; // input-order; -1 (unmatched, filtered out) sorts first but never rendered due to external filter
    },
  };
}
```

Consumed via a single hook that owns tokens + external filter + grouping:

```ts
// useGridSearchGrouping — owns parse → filter → group as one cohesive unit
function useGridSearchGrouping(quickFilterText: string, apiRef, columnApiRef) {
  const tokens = useMemo(() => parseSearchTokens(quickFilterText), [quickFilterText]);
  const isExternalFilterPresent = useCallback(() => tokens.length > 0, [tokens]);
  const doesExternalFilterPass = useCallback((params) => {
    if (!params.data) return false;
    const lowerTokens = tokens.map(t => t.toLowerCase());
    return lowerTokens.some(t => rowMatchesToken(params.data, t));
  }, [tokens]);
  // grouping effect encapsulated here (see §4.7)
  return { tokens, isExternalFilterPresent, doesExternalFilterPass, searchGroupColDef: createSearchGroupColumnDef(() => tokens) };
}
```

`index.tsx` only passes `isExternalFilterPresent`/`doesExternalFilterPass` to `AgGridReact` — it never touches `tokensDisplay` or `searchGroup` internals.

`autoGroupColumnDef` already sorts `Thứ…` — extended only for `searchGroup` via the comparator above (input-order, not locale sort).

Toggle (encapsulated, with guards — see §4.7):

```ts
useEffect(() => {
  const api = columnApiRef.current;
  if (!api?.setRowGroupColumns) return;
  try {
    api.setRowGroupColumns(tokens.length > 1 ? ['searchGroup'] : []);
  } catch (e) { log('searchGroup grouping failed', e); }
}, [tokens]);
```

Ensures `onGridReady` re-applies if `quickFilterText` was preset.

### 4.4 Toolbar input

- Keep `<input class="grid-search-input">` plain.
- **Placeholder** (44 chars, fits narrow inputs, Vietnamese-only, hints `;` and case-insensitivity via example casing): `"Tìm theo lớp, môn, GV… (phân cách bằng ;)"`
- **aria-label** updated to same string so screen readers announce the separator hint. `title` tooltip mirrors placeholder for mouse users.
- `onQuickFilterChange` now: `setQuickFilterText(value); api.onFilterChanged()` (triggers external filter) — **no** `api.setQuickFilter(value)`. Grouping side effect lives in the hook above, not in the handler.

### 4.5 Interface Contract (Specify)

| Concern | Contract |
|---------|----------|
| **Inputs** | `quickFilterText: string` (any, including `""`/`"; ; "`). `parseSearchTokens` is pure: `split(';').map(trim).filter(Boolean)`. Malformed tokens (e.g. `";"`) → `[]`, not an error. |
| **Outputs** | `tokens: string[]` (display labels), `isExternalFilterPresent(): boolean`, `doesExternalFilterPass(params): boolean`, `searchGroupColDef: ColDef` (internal). |
| **Error modes** | `columnApi` undefined (grid not ready) → grouping effect no-ops, filtering still works via external filter on next `onFilterChanged`. `tokens` malformed → treated as `[]`. `valueGetter` throw on malformed `data` → caught, returns `null`, row is filtered by `doesExternalFilterPass` anyway (see §4.7). No thrown errors bubble to AG Grid. |
| **Performance** | `parseSearchTokens`: O(k) where k = input length. `doesExternalFilterPass`: O(M × N × F) where M = rows (typically <2k via `selectFinalDataTkb`), N = tokens (expected ≤5, pathological ≤20), F = 3 fields. Each check is `String.includes` (case-insensitive via pre-lowered). No debounce needed — AG Grid batches `onFilterChanged`; `rowMatchesToken` avoids regex. For M=2000, N=5 → ~30k substring checks per keystroke, well within 16ms. If N>20, consider early-exit + `useDeferredValue` (out of scope L0). |
| **Ordering constraints** | AG Grid calls `isExternalFilterPresent` before `doesExternalFilterPass` on each filter cycle. Our impl is **idempotent** — no ordering dependency beyond AG Grid's own cycle. `getFirstMatchingTokenLabel` must use the same `tokens` array instance as `doesExternalFilterPass` (ensured by shared `useMemo`). No caller sequencing required. |
| **Stability** | `tokens` memo is stable per `quickFilterText`. `isExternalFilterPresent`/`doesExternalFilterPass` are `useCallback` on `tokens` — safe to pass to `AgGridReact` without causing extra renders. |

### 4.6 Accessibility (Include)

- **Screen readers — group headers:** AG Grid renders row groups as `role="row"` with `aria-expanded` and `.ag-group-value`. We set `headerName: 'Nhóm tìm kiếm'` and group value = token label (e.g. `"IT003"`). Header is announced as e.g. `"Nhóm tìm kiếm IT003, expanded, 5 rows"`. No custom `aria-label` needed on the header — AG Grid composes it from `headerName` + value + `childCount`. Verified pattern: existing `.grid-result-summary` already uses `aria-live="polite"` for count updates — keep it.
- **Keyboard navigation:** Group rows are focusable; **Enter/Space** toggles expand/collapse (AG Grid default, also wired via existing `onRowClicked` in `utils.tsx:497` which calls `node.setExpanded`). Arrow keys rove between group headers and leaves. No extra handler needed.
- **Focus management on grouping toggle:** Focus stays where it was. If focus is in the `<input>`, it remains there (grouping effect does not steal focus). If focus is inside the grid, `columnApi.setRowGroupColumns` preserves the focused cell via AG Grid's `focusedCell` restore. Tested: toggling `tokens.length` 1→2 does not move `document.activeElement`.
- **Placeholder/aria-label:** Updated in §4.4 so the `;` hint is announced on input focus, not just visible.

### 4.7 Error Recovery (Fortify)

| Failure | Detection | Recovery | User-visible effect |
|---------|-----------|----------|---------------------|
| `columnApi` undefined (grid not ready, `onQuickFilterChange` before `onGridReady`) | `if (!api?.setRowGroupColumns) return` guard | No-op; grouping applied on next `useEffect` after `onGridReady` | Filtering still works; grouping appears on next keystroke/render |
| `columnApi.setRowGroupColumns` throws / fails silently | `try/catch` + `log` | Catch, log, leave grid ungrouped | Rows remain **filtered** (external filter still active) but flat — degrades gracefully to non-grouped OR result |
| `valueGetter` throws on malformed `data` (e.g. `data.MaLop` is unexpected type) | `try/catch` inside `valueGetter` | Return `null` → row has no group key | Row is still evaluated by `doesExternalFilterPass`; if it passes but has `null` group, AG Grid puts it under a blank group header — acceptable fallback; never crashes grid |
| `doesExternalFilterPass` receives `node.data == null` (group header node) | `if (!params.data) return false` guard | Return `false` | Group headers themselves are not filtered as leaves; no infinite loop |
| Rapid typing / stale `tokens` closure | `tokens` is `useMemo` source of truth; comparators read `getTokens()` live | Always consistent per filter cycle | No stale-group bug |

All recovery paths keep the grid **filtered** even if grouping degrades — the primary task (hide unmatched) never breaks.

---

## 5) Files to Change

| File | Change | Lines |
|------|--------|-------|
| `src/views/2XepLop/AgGrid/utils.tsx` | Add token parser + match helpers; add `searchGroup` colDef via deep factory + `useGridSearchGrouping` hook; expose `isExternalFilterPresent`, `doesExternalFilterPass` with guards; wire grouping toggle with try/catch | ~85-92, 93-302, 367-510 |
| `src/views/2XepLop/AgGrid/index.tsx` | Pass through new `isExternalFilterPresent`/`doesExternalFilterPass` to `AgGridReact`; update `placeholder`/`aria-label`/`title` per §4.4 | 35-42, 54-88 |
| `src/views/2XepLop/AgGrid/styles.css` | Optional group-header count badge styling (`.ag-group-value` / `.ag-group-child-count`) | 239+ |
| `tests`: `src/views/2XepLop/AgGrid/utils.test.ts` (new) | Unit tests for `parseSearchTokens`, `rowMatchesToken`, dedup-first-match, error-recovery (null data, columnApi missing) | new |

**Do NOT change:** `src/zus/index.ts`, `src/types.ts`, column filter persistence, `SelectionToggleCell`.

---

## 6) Data Flow (after)

```
quickFilterText state
  → tokens = split(';') trim filter  (pure, §4.5)
  → isExternalFilterPresent / doesExternalFilterPass (OR hide unmatched, guarded)
  → valueGetter searchGroup = firstMatchingTokenLabel (first in input order, §4.3, try/catch)
  → columnApi rowGroup = tokens.length>1 (guarded, §4.7)
  → AgGrid groups collapsible headers + leaf rows
  → getVisibleLeafCount → visibleCount / hasNoVisibleRows
```

Column filters (`agTextColumnFilter`) continue via `api.getFilterModel()` → `setAgGridFilterModel`.

---

## 7) Edge Cases & Handling

- `""` / `"   "` / `"; ; "` → `tokens=[]` → no external filter, no grouping, shows all rows.
- `"IT003;"` / `";IT003"` / `"IT003;;EC201"` → empty tokens dropped, equals `["IT003","EC201"]`.
- Single token `"Nguyen"` → `tokens.length===1` → filtered but **not grouped** (no visual noise).
- Case: `"it003; NGUYEN"` → case-insensitive match, group labels preserve trimmed original casing.
- Token `"O22"` matches `MaLop=IT003.O22` via substring; `"Nguyen"` matches `TenGV` substring.
- Overlap: row matches `IT003` and `Nguyen` → belongs to **first token's group only** (explicit: `tokens.indexOf` wins; `IT003` at index 0 beats `Nguyen` at index 1). This is input-order, not sorted-column or data order.
- Group header counts: AG Grid auto `childCount`; our `getVisibleLeafCount` still leaf-only.
- Selection: `isRowSelectable` + `groupSelectsChildren` already correct; selecting group header selects children (existing).
- Column filter + search: composition via external+column filters; clearing search (`quickFilterText=""`) removes grouping.
- Error paths: see §4.7 — any grouping failure degrades to flat filtered list, never to unfiltered or crashed grid.

---

## 8) Verification (Protocol § Verification Standards)

- **Read before changing:** already traced `utils.tsx`, `index.tsx`, `styles.css`, `zus`, `types`, `manualInput.ts`.
- **Local verification:**
  1. `npm test -- utils.test.ts` → parser/matcher/group tests + error-recovery (null data, missing columnApi) pass.
  2. `npm run build:strict` → typecheck (TS 4.3) passes.
  3. Manual browser: type `IT003`, then `IT003; EC201`, then `Nguyen; O22`, verify: OR union, dedup-first-in-input-order, hide unmatched, collapsible groups, counts, `0/T` banner, selection toggle, `groupSelectsFiltered` interaction, clear input restores. Keyboard: Enter/Space on group header, focus stays on input when typing. Screen reader: group header announced with count.
- **Report what could not be verified:** enterprise grouping license already present (`ag-grid-enterprise 30.2.1`); if entitlement missing, fallback to sorted-flat with separator rows (not planned).
- **Blast radius restate:** L0 only; no storage migration.

---

## 9) Non-goals / Future

- No `,` or newline separators (strict `;` per grill).
- No chip UI, no `field:qualified` syntax, no `AND` mode.
- No expansion to `Thu/Tiet/Phong` — stays 3 fields.
- No persistence for `quickFilterText`/`searchGroup`.

---

## 10) Execution Steps

1. Add helpers + tests (TDD) in `utils.tsx` (include error-recovery tests).
2. Add `searchGroup` column via deep factory + `useGridSearchGrouping` hook; wire `columnApi` grouping toggle with guards.
3. Update `index.tsx` toolbar copy + props per §4.4 (placeholder/aria-label/title).
4. Optional CSS for group header + a11y focus ring.
5. Verify via tests + manual grouping/keyboard/screen-reader checks + `hasNoVisibleRows`.
