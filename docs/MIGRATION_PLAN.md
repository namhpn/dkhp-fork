# Package Migration Plan

> **Generated:** 2025-01-15
> **Project:** dkhp-uit (courses)
> **Current state:** React 17, MUI 5, ag-grid 30, TypeScript 4

## Overview

26 packages are outdated, many by multiple major versions. This plan breaks the migration into **6 phases**, ordered to minimize breakage and ensure each phase is independently shippable and testable.

### Key constraints discovered in the codebase:
- `src/index.tsx` uses legacy `ReactDOM.render()` (not `createRoot`)
- `react-router-dom` usage is minimal (2 files: `App.tsx`, `ScrollToTop.tsx`) — only `BrowserRouter` and `useHistory`
- **13 files** import from `@mui/material` or `@mui/icons-material`
- **5 files** import from `ag-grid-community`/`ag-grid-react` (77 type references total)
- Zustand store (`src/zus/index.ts`) uses `Mutate`, `StoreApi`, `persist`, `createJSONStorage`
- `tsconfig.json` targets ES5 with `jsx: "react-jsx"` (already modern JSX transform)
- Tests use `@testing-library/react` v12 + `@types/jest` v26

---

## Phase 0: Pre-flight (no code changes)

**Goal:** Ensure the project builds and tests pass before touching anything.

```
npm ci
npm run build
npm test -- --watchAll=false
```

> **Verified drift (2026-08-15):** `package.json` declares `typescript ^4.3.5` but lock/installed is `4.9.5`; `@mui/lab` declared `^5.0.0-alpha.151` vs lock `alpha.177`. On branch start run `npm install` and commit the lock, or `rm -rf node_modules package-lock.json && npm install` — do not `npm ci` on a drifted lock or pre-flight will misreport.

Create a git branch: `chore/package-migration`

---

## Phase 1: Tooling (low risk, immediate value)

**Goal:** Update dev tooling that doesn't affect runtime code.

| Package | From | To | Notes |
|---------|------|----|-------|
| `typescript` | 4.9.5 | ~5.7 | TS 5 is mostly backward-compatible. TS 6+ may need further validation. |
| `prettier` | 2.8.8 | 3.x | Config-compatible. Run `prettier --write` after upgrade to reformat. |
| `cross-env` | 7.0.3 | 7.x (latest 7) | v10 is ESM-only. Stay on v7 unless you convert to ESM. |
| `@types/lodash` | 4.17.24 | 4.17.25 | Patch update. |

### Steps:
```bash
# 1. Upgrade TypeScript (stay on 5.x for react-scripts compatibility)
npm install --save-dev typescript@~5.7

# 2. Upgrade Prettier
npm install --save-dev prettier@^3

# 3. Reformat
npx prettier --write "src/**/*.{ts,tsx,md}"

# 4. Type check
npx tsc --noEmit

# 5. Fix any new type errors (TS 5 is stricter in some areas)
```

> **Trace break — react-scripts@5.0.1 peer warning (verified 2026-08-15, L0):** CRA pins `typescript ^4.x`. Installing `~5.7` will emit `The react-scripts package provided requires TypeScript ^4.x` but still builds (`skipLibCheck: true`, `npx tsc --noEmit` currently passes on 4.9.5). Suppress with `SKIP_PREFLIGHT_CHECK=true` in `.env` or `CI=false` (already used in `build` script), or accept the warning. No schema/query impact.

### Risk: Low
- TS 5 added `const` type parameters, `satisfies` operator improvements, and stricter decorators. Most TS 4 code compiles without changes.
- Prettier 3 may change some formatting rules — the reformat step handles this.

---

## Phase 2: React 17 → 18 (foundational — blocks MUI 6+)

**Goal:** Upgrade React and ReactDOM. This unblocks all downstream packages.

| Package | From | To |
|---------|------|----|
| `react` | 17.0.2 | 18.3.x |
| `react-dom` | 17.0.2 | 18.3.x |
| `@types/react` | 17.x | 18.x |
| `@types/react-dom` | 17.x | 18.x |

### Steps:
```bash
# 1. Install React 18
npm install react@^18 react-dom@^18
npm install --save-dev @types/react@^18 @types/react-dom@^18
```

```tsx
// 2. Migrate src/index.tsx
// BEFORE:
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// AFTER:
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

```bash
# 3. Remove deprecated StrictMode children (if used)
# 4. Type-check and test
npx tsc --noEmit
npm test -- --watchAll=false
npm run build
```

### Files to change:
- `src/index.tsx` — switch to `createRoot`
- Any component using `ReactDOM.render()` or `ReactDOM.unmountComponentAtNode()`
- Check for `componentWillMount`, `componentWillReceiveProps`, `UNSAFE_*` lifecycle methods

### Risk: Medium
- React 18's concurrent features are opt-in, so existing code should work.
- The `createRoot` migration is required — `ReactDOM.render()` is deprecated but still works with a warning in React 18.
- Some libraries may have peer dependency issues. Fix with `--legacy-peer-deps` if needed.

---

## Phase 3: Router (minimal usage — quick win)

**Goal:** Upgrade react-router-dom. Usage is tiny (2 files).

| Package | From | To |
|---------|------|----|
| `react-router-dom` | 5.3.4 | 6.x |

> **Note:** v7 is latest but v6 is the stable LTS. v7 is a Remix-influenced rewrite. Recommend v6 for now.

### API changes required:

**`src/views/App.tsx`:**
```tsx
// BEFORE (v5):
import { BrowserRouter } from 'react-router-dom';
// Usage is simple — no <Switch>, no <Route> — just <BrowserRouter> as a wrapper.
// This is already v6-compatible! Only import paths may need checking.

// AFTER (v6):
import { BrowserRouter } from 'react-router-dom';
// No changes needed — BrowserRouter API is the same.
```

**`src/views/components/ScrollToTop.tsx`:**
```tsx
// BEFORE (v5) — verified src/views/components/ScrollToTop.tsx:4:
import { useHistory } from 'react-router-dom';
function ScrollToTop() {
  const history = useHistory();
  if (history.action === 'PUSH') {
    window.scrollTo(0, 0);
  }
  return null;
}

// AFTER (v6):
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

> **Trace break — behavior shift (verified 2026-08-15, L0):** Before scrolls only on `PUSH`; after scrolls on every `pathname` change (including `POP`/`REPLACE`). Document as intentional. The `useRef(prevPathname)` pattern in the previous draft was over-engineered — `useEffect` on `pathname` is sufficient. Blast: UI/client only.

### Steps:
```bash
npm install react-router-dom@^6
# Update the 2 files above
npx tsc --noEmit
npm run build
```

### Risk: Low
- Only 2 files use react-router-dom.
- No `<Switch>`, `<Route>`, or `<Redirect>` usage found — the app uses `<BrowserRouter>` as a bare wrapper.

---

## Phase 4: MUI 5 → 6 (moderate effort)

**Goal:** Upgrade MUI to v6. This is a stepping stone — v9 is the latest but jumping from 5→9 is too risky.

| Package | From | To |
|---------|------|----|
| `@mui/material` | 5.18.0 | 6.x |
| `@mui/icons-material` | 5.18.0 | 6.x |
| `@mui/lab` | 5.0.0-alpha.177 | 6.x (or replace with `@mui/material` if components merged) |

### Key breaking changes (MUI 5 → 6):
1. **React 18 required** — done in Phase 2.
2. **Slot-based API** — some component prop renames.
3. **`sx` prop** — still supported, no changes needed.
4. **Theme** — `createTheme` API unchanged.
5. **CSS injection order** — `StyledEngineProvider injectFirst` still works.

### Steps:
```bash
npm install @mui/material@^6 @mui/icons-material@^6 @mui/lab@^6
npx tsc --noEmit
npm run build
```

### Files affected (13 files):
- `src/index.tsx`
- `src/theme/muiTheme.ts`
- `src/views/components/*.tsx` (AppShell, AppHeader, ConfirmDialog, HeaderFileControl, etc.)
- `src/views/3KetQua/*.tsx`

### Risk: Medium
- MUI 6 is relatively close to v5 in API. Most changes are internal (Emotion → Pigment CSS under the hood, but still supports Emotion).
- Test all components visually after upgrade.

---

## Phase 5: State management & utilities

**Goal:** Update zustand, constate, and smaller utility packages.

| Package | From | To | Notes |
|---------|------|----|-------|
| `zustand` | 4.5.7 | 5.x | See breaking changes below |
| `constate` | 3.3.3 | 4.x | Minor API changes |
| `proxy-memoize` | 2.0.6 | 3.x | Performance improvements |
| `use-debounce` | 7.0.1 | 10.x | API may have changed significantly |
| `react-hotkeys-hook` | 4.6.2 | 5.x | Check hook signatures |
| `notistack` | 3.0.1 | 3.x (latest) | Minor update |

### Zustand 4 → 5 breaking changes:
```ts
// BEFORE (v4) — verified src/zus/index.ts:4-5:
import { Mutate, StoreApi, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// AFTER (v5):
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Mutate and StoreApi types may have moved — check imports

// Key change: `withStorageDOMEvents` helper pattern
// v5 has built-in cross-tab sync via `persist` options:
//   persist(store, { name: '...', storage: createJSONStorage(() => localStorage) })
// The manual withStorageDOMEvents helper may still work but check the type signatures.
```

> **Trace break — `StoreWithPersist` typing (verified 2026-08-15, L1):** `src/zus/index.ts:124` declares `type StoreWithPersist = Mutate<StoreApi<TkbStore>, [['zustand/persist', unknown]]>`. Zustand 5 changed `Mutate`/`StoreApi` generics and the `persist` tuple shape — this line will fail `tsc --noEmit` after upgrade. Fix at that exact line: update import + generic per zustand 5 migration guide. Do not change the store shape.

> **Trace break — `use-debounce` v10 return type (verified 2026-08-15, L1):** `src/views/2XepLop/AgGrid/utils.tsx:614` assigns `const onFilterChanged = useDebouncedCallback(fn, 500)` as a plain callback. In v10 `useDebouncedCallback` returns `DebouncedState` (object with `.callback`/`.cancel`), not a function — passing it to `onFilterChanged` prop will type-error and break filtering. Smallest fix: keep `use-debounce@^7` (stay on 7.x) for this phase, or codemod to `useDebouncedCallback(fn, { delay: 500 })` and use `onFilterChanged.callback` / keep compatible wrapper. Verify with `npx tsc --noEmit` before proceeding.

### Steps:
```bash
npm install zustand@^5 constate@^4 proxy-memoize@^3
npm install use-debounce@^10 react-hotkeys-hook@^5
npm install notistack@latest
npx tsc --noEmit
npm test -- --watchAll=false
npm run build
```

### Risk: Medium
- Zustand 5 removed some deprecated APIs and changed TypeScript generics — `StoreWithPersist` at `src/zus/index.ts:124` is the proven break point (L1).
- `use-debounce` jumping from 7→10 may have API changes — proven break at `src/views/2XepLop/AgGrid/utils.tsx:614` (L1).
- `react-hotkeys-hook` v5 may change hook signatures.

---

## Phase 6: ag-grid & testing (highest effort)

**Goal:** Upgrade ag-grid and testing libraries.

| Package | From | To | Notes |
|---------|------|----|-------|
| `ag-grid-community` | 30.2.1 | 33.x | Stay on 33 — it's the latest stable LTS line |
| `ag-grid-enterprise` | 30.2.1 | 33.x | |
| `ag-grid-react` | 30.2.1 | 33.x | |
| `@testing-library/react` | 12.1.5 | 16.x | Requires React 18 |
| `@testing-library/jest-dom` | 5.17.0 | 6.x | |
| `@testing-library/user-event` | 13.5.0 | 14.x | |
| `@types/jest` | 26.x | 29.x | Match Jest version from react-scripts |

### ag-grid 30 → 33 breaking changes:
1. **Module-based imports** — v31+ uses modules instead of packages:
   ```tsx
   // BEFORE:
   import { ColumnApi, GridApi } from 'ag-grid-community';
   import { LicenseManager } from 'ag-grid-enterprise';

   // AFTER:
   import { ColumnApi, GridApi } from 'ag-grid-community';
   // LicenseManager import path may change — check docs
   ```
2. **`ColumnApi` deprecated** — merged into `GridApi`. Replace `ColumnApi` usage.

   > **Trace break — proven at 15 call sites (verified 2026-08-15, L2):** `src/zus/index.ts:30 ReturnType<ColumnApi['getColumnState']>` fails compile when `ColumnApi` removed. `src/views/2XepLop/AgGrid/utils.tsx` has ~15 `columnApi.` calls (`setRowGroupColumns` 2×, `getRowGroupColumns`, `applyColumnState`, `getColumnState`, `autoSizeColumns`, `getColumnState` in `onGridReady`/`onColumnChanged`/`onFirstDataRendered` and `useGridSearchGrouping:202`). Smallest fix: codemod `columnApi.*` → `gridApi` (`api`) and type `ColumnApi` → `GridApi`; merge `columnApiRef` into `agGridRef.current.api`. Verify `npx tsc --noEmit` before changing grid behavior.

3. **CSS imports** — paths may change:
   ```tsx
   // BEFORE — verified src/index.tsx:10-11:
   import 'ag-grid-enterprise/styles/ag-grid.css';
   import 'ag-grid-enterprise/styles/ag-theme-alpine.css';

   // AFTER (check exact paths in v33 docs):
   import 'ag-grid-community/styles/ag-grid.css';
   import 'ag-grid-community/styles/ag-theme-alpine.css';
   ```
4. **Row selection API** — `rowSelection="multiple"` may become `rowSelection={{ mode: 'multiRow' }}` in v33.
5. **`suppressRowClickSelection`** → `rowSelection.clickBehavior: 'none'`

### Files affected:
- `src/zus/index.ts` — `ColumnApi`, `GridApi` types (77 references across 5 files) — proven break `src/zus/index.ts:30`
- `src/views/2XepLop/AgGrid/index.tsx` — `AgGridReact` props (`rowSelection="multiple"` → `{{mode:'multiRow'}}` if on 33)
- `src/views/2XepLop/AgGrid/utils.tsx` — Grid API usage (861 lines, heaviest usage — 15 `columnApi.` sites)
- `src/views/2XepLop/AgGrid/SelectionToggleCell.tsx` — `ICellRendererParams`

### Testing library upgrade:
```bash
npm install @testing-library/react@^16
npm install @testing-library/jest-dom@^6
npm install @testing-library/user-event@^14
npm install --save-dev @types/jest@^29
```

> **Trace break — `jest-dom` import path (verified 2026-08-15, L0):** `src/setupTests.ts:5 import '@testing-library/jest-dom/extend-expect'` is removed in `jest-dom@6` — will throw `Cannot find module`. Smallest fix: change to `import '@testing-library/jest-dom'` (single line at source). No query/schema impact.

### Steps:
```bash
# 1. Upgrade ag-grid
npm install ag-grid-community@^33 ag-grid-enterprise@^33 ag-grid-react@^33

# 2. Fix imports and API changes in the 5 affected files
#    - src/zus/index.ts:30 ColumnApi type → GridApi
#    - src/views/2XepLop/AgGrid/utils.tsx: ~15 columnApi.* → api.*
#    - src/index.tsx:10-11 CSS paths → ag-grid-community/styles/*
#    - src/index.tsx:3 LicenseManager path (verify in v33 docs)

# 3. Upgrade testing libraries
npm install @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
npm install --save-dev @types/jest@^29
# 3a. Fix setupTests.ts import (see trace break above)

# 4. Fix test files for new testing-library API
#    - renderHook may have moved
#    - userEvent.setup() is now required before use

# 5. Full verification
npx tsc --noEmit
npm test -- --watchAll=false
npm run build
```

### Risk: High
- ag-grid has the most breaking changes and the heaviest usage (77 type references, 861-line `utils.tsx`, 15 proven `columnApi` sites — `ColumnApi` merged into `GridApi`).
- The `ColumnApi` deprecation requires changing every `columnApi.` usage site (proven L2 break).
- Row selection API changes may affect the selection behavior (`rowSelection="multiple"` → `{mode:'multiRow'}`).
- Testing library v16 has breaking changes around `renderHook` and `userEvent`; `setupTests.ts:5` is proven L0 break on `jest-dom@6`.

---

## Post-migration cleanup

After all phases:

```bash
# 1. Update remaining type packages
npm install --save-dev @types/node@^20

# 2. Consider upgrading eslint (separate effort — ESLint 9 is flat-config only)
# eslint-config-react-app may not support ESLint 9 yet.
# Recommendation: stay on ESLint 8 until react-scripts updates or you eject.

# 3. Run full verification
npm run build:strict
npm test -- --watchAll=false

# 4. Update browserslist
npx update-browserslist-db@latest

# 5. Remove any --legacy-peer-deps if used during migration
rm -rf node_modules package-lock.json
npm install
```

---

## Risk summary

| Phase | Effort | Risk | Rollback |
|-------|--------|------|----------|
| 0. Pre-flight | 10 min | None | — |
| 1. Tooling | 30 min | Low | git revert |
| 2. React 18 | 1-2 hrs | Medium | git revert |
| 3. Router | 30 min | Low | git revert |
| 4. MUI 6 | 2-3 hrs | Medium | git revert |
| 5. State/utilities | 2-3 hrs | Medium | git revert |
| 6. ag-grid + testing | 4-8 hrs | High | git revert |

**Total estimated effort: 1-2 days of focused work**

---

## What we're NOT upgrading (and why)

| Package | Current | Latest | Reason to skip |
|---------|---------|--------|----------------|
| `eslint` | 8.x | 10.x | ESLint 9+ requires flat config. `eslint-config-react-app` doesn't support it. Would need to eject from `react-scripts` or switch to flat config manually. |
| `react-scripts` | 5.x | 5.x | Already latest. CRA is effectively unmaintained. Consider migrating to Vite in a future effort. |
| `cross-env` | 7.x | 10.x | v10 is ESM-only. `react-scripts` uses CJS. Stay on v7. |
| `@types/node` | 16.x | 22.x | Only affects Node types. Low priority since this is a browser app. |
| React 19 | — | 19.x | React 19 is very new. Some libraries (MUI 6, notistack) may not fully support it yet. Migrate to 18 first, then evaluate 19 in 6-12 months. |
| MUI 9 | — | 9.x | Jump from 5→9 is too large. MUI 6 is a stable stepping stone. Upgrade to 7/8/9 later. |

---

## Verification checklist (per phase)

After each phase, verify:

- [ ] `npx tsc --noEmit` passes
- [ ] `npm test -- --watchAll=false` passes
- [ ] `npm run build` succeeds
- [ ] `npm run build:strict` succeeds (CI mode)
- [ ] App loads in browser without console errors
- [ ] Excel import works
- [ ] AG Grid renders, filtering/sorting works
- [ ] Manual mode (textarea) works
- [ ] Schedule image export works
- [ ] Local storage persistence works
- [ ] Cross-tab sync works
