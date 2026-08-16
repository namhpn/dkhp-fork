# Web App Optimization Diagnosis — 2026-08-16

Follow-up to [DEPLOY-DIAGNOSIS-2026-08-16.md](./DEPLOY-DIAGNOSIS-2026-08-16.md) (deploy pipeline). This doc covers the app itself: runtime payload and the remaining build floor.

**Symptom:** CRA flags the production bundle as "significantly larger than recommended" — a single **985 kB gzip** entry chunk (`main.*.js`, 3.63 MB minified) — and the post-Phase-1 deploy still spends ~2 min on CRA install + compile with 31 `npm audit` findings.

**Root cause (one sentence):** ~86 % of the entry chunk (ag-grid 53 %, exceljs 27 %, html2canvas 6 %) is statically imported from always-rendered code even though each library runs only after an explicit user action, and the remaining floor is the deprecated `react-scripts@5` toolchain.

**Scope of investigation:** A local instrumented build (`GENERATE_SOURCEMAP=true`; `build/` is gitignored) whose entry chunk matches production within 49 bytes (985.53 vs 985.48 kB gzip — same content as deployed `main.a8f67aa8.js`), byte-attribution from its source map, `npm audit`, and the 2026-08-15 19:43 UTC deploy log. No source files were changed during diagnosis.

---

## Phase 1 verification (deploy diagnosis)

The deploy log confirms Phase 1 of the deploy diagnosis works: **no setup wizard, no second build, no per-deploy wrangler download** — `wrangler 4.123.0` runs from the local install and reads the existing `build/` directory ("Read 14 files from the assets directory").

| Phase | Window (UTC) | Duration | vs. old log |
|---|---|---|---|
| Env init + clone + cache restore | 19:43:12.7 → 19:43:35.4 | ~23s | ~equal |
| `npm clean-install` (1,527 pkgs) | 19:43:35.4 → 19:44:17.2 | ~42s | +12s (wrangler now in tree) |
| Build — **single** pass | 19:44:17.5 → 19:45:41.1 | ~84s | −47s (second build gone) |
| `npx wrangler deploy` (no download) | 19:45:41.3 → 19:45:49.5 | ~8s | −20s (download + wizard gone) |
| Dependency cache upload | 19:45:49.6 → 19:45:54.3 | ~5s | ~equal |

Total: **3m 14s → 2m 42s**. The predicted 2m 05s wasn't reached: this run's install and compile were each ~12–15s slower than the reference run (wrangler in the dependency tree + run-to-run variance). The ~67s of *structural* waste is verifiably absent from the log; what remains is the toolchain itself (findings F4–F5 below).

---

## Measured bundle composition

Byte attribution per package from the entry chunk's source map (3.46 MB of the 3.63 MB file is mapped; sizes are minified bytes):

| Package (subtree) | Size | Share | Why it's in the entry chunk |
|---|---|---|---|
| ag-grid-enterprise | 930 KB | 27 % | statically registered in `src/index.tsx:3,13` |
| exceljs (incl. jszip/pako/buffer) | ≥ 921 KB | 27 % | static import in `useExcelImport.ts:1`, reachable from the always-rendered header |
| ag-grid-community | 910 KB | 26 % | pulled in by the enterprise registration |
| @mui/material (+emotion/popper) | ~250 KB | 7 % | needed at first paint — legitimate |
| html2canvas (+css-line-break tree) | ~219 KB | 6 % | static import in `ThoiKhoaBieuTable/hooks.ts:2` |
| react-dom + react | ~134 KB | 4 % | legitimate |
| lodash | 90 KB | 3 % | one barrel import (`src/zus/index.ts:2`), rest per-path |
| app code (`src/**`) | ~51 KB | 1.5 % | legitimate |

Other chunks: lazy `AgGrid` chunk 52.7 KB (15.3 kB gzip) — the only code currently split; shared chunk 16.2 KB (5.7 kB gzip). CSS: 235 KB total (37.1 kB gzip), including both global ag-grid stylesheets.

**The three lazy-load candidates total ~2,980 KB = 86 % of the entry chunk**, and each is used only after an explicit user action (see F1–F3).

---

## Findings (verified against the repo)

### F1 — ag-grid enterprise registered in the entry chunk, defying the existing lazy split

`src/index.tsx:3,13` statically imports `AllEnterpriseModule` + `LicenseManager`, registers all modules, and imports both theme CSS files globally (`src/index.tsx:10-11`). `GridWorkspace.tsx:5` already lazy-loads `../2XepLop/AgGrid`, but that split only carves out 15.3 kB gzip — the grid itself (1.84 MB, 53 % of the chunk) is already in the entry. The grid is the default workspace (`isChiVeTkb: false` renders `GridWorkspace` — `Workspace.tsx:24`), but it renders nothing until `dataExcel` exists, which only the Excel-import flow sets (`useExcelImport.ts:52`).

### F2 — exceljs statically imported for a once-per-file-picker action

`useExcelImport.ts:1` (`import ExcelJS from 'exceljs'`) is called by the always-rendered `HeaderFileControl`; exceljs + JSZip + pako + the Node `buffer` polyfill land in the entry chunk (confirmed in the bundle's LICENSE.txt). It executes only inside the file-picker handler.

### F3 — html2canvas statically imported for an export click

`ThoiKhoaBieuTable/hooks.ts:2`; used only at the PNG-export call (line ~117). ~219 KB incl. its `css-line-break` subtree, in the entry chunk via the always-rendered `TimetablePanel`.

### F4 — CRA is the build floor (~2m 06s) and the source of 29/31 audit findings

Install: ~42s for 1,527 packages. Compile: ~80s. `npm audit`: 31 findings (9 low, 8 moderate, 14 high) — identical with `--omit=dev` because CRA convention puts everything in `dependencies`. Top offenders are all in the react-scripts tree: `webpack-dev-server` (6), `postcss` (5), `serialize-javascript` (2), `svgo` (1)… Plus the Node 24 `DEP0176` warning and the ~25 deprecation warnings in every install log. The build script's `CI=false` also silences the bundle-size warning that would otherwise appear on every build.

### F5 — dependency hygiene

- **Unused dependencies** (zero imports in `src/`, verified by grep): `@mui/lab`, `yaml`, `@testing-library/user-event`.
- **Misplaced:** `eslint`, `eslint-config-react-app`, `@testing-library/dom|jest-dom|react` sit in `dependencies` — they're build/test-only.
- **`react-router-dom` v6.30.4 has no routes** — the router exists only for `BrowserRouter basename` (`App.tsx:25`) and `ScrollToTop`'s `useLocation`. It also carries the **only audit finding in production code**: a moderate-severity advisory affecting 6.0.0–7.17.0 (fix = v7). Removing the router (ScrollToTop is replaceable with a plain effect) drops the dependency *and* the advisory. Its types package `@types/react-router-dom@^5.1.8` is additionally the wrong major and deprecated.
- **Hardcoded ag-grid license key** at `src/index.tsx:14`, although `.env.example` already defines `REACT_APP_AG_GRID_LICENSE_KEY` — which nothing reads.

### F6 — render-blocking Google Fonts

`public/index.html` loads an external stylesheet for Be Vietnam Pro + Noto Sans (has `preconnect` + `display=swap`, but the stylesheet itself still blocks first render; ~200–400ms on slow links).

### Update 2026-08-16 — modular enterprise registration implemented (Tier 3)

`src/index.tsx` and `src/setupTests.ts` now register `[AllCommunityModule, RowGroupingModule, ContextMenuModule]` instead of `AllEnterpriseModule` (`ModuleRegistry` auto-registers each module's transitive `dependsOn`, verified in the installed 33.3.2 source). Features and license key unchanged. Measured:

| Variant | Entry chunk (gzip) | `ag-grid-enterprise` subtree (raw) |
|---|---|---|
| Baseline — `AllEnterpriseModule` | 985.53 kB | 930 KB |
| Community + RowGrouping + ContextMenu (**shipped**) | **927.66 kB** | 707 KB |
| Community + `LicenseManager` import only | 912.67 kB | 655 KB |
| Community only, zero enterprise import | 729.21 kB | 0 KB |

**Anchor finding:** any import from the `ag-grid-enterprise` root — even just `LicenseManager` — retains ~655 KB raw (~183 kB gzip), because the package's single-file ESM entry (`dist/package/main.esm.mjs`, 1.76 MB) *inlines a copy of community code* that webpack cannot fully tree-shake. The two feature modules' true marginal cost is only ~15 kB gzip. Verified in-browser: grid renders, multi-token search groups (`tin`/`toán` groups, 8/12 filtered), context menu with all custom actions, pinned action column, license watermark hidden; 82 tests green. Conclusion: the swap is correct hygiene, but the entry-chunk win stays modest (−57.9 kB) until registration + CSS move into the lazy `AgGrid` chunk (Phase 1 item 1), which removes the anchor from the entry entirely.

### F7 — legacy output targets (minor)

`tsconfig.json` `target: es5` forces downleveling helpers; `ag-theme-alpine` legacy CSS is imported wholesale rather than via ag-grid's modular theming API (CSS chunk 235 KB / 37 kB gzip).

---

## Improvement plan

### Phase 1 — bundle diet (no toolchain change; entry ~985 kB → ~250 kB gzip)

1. **Move ag-grid into the existing lazy chunk:** relocate `ModuleRegistry.registerModules` (already modular — see the update above), `LicenseManager.setLicenseKey`, and the two CSS imports from `src/index.tsx` into `src/views/2XepLop/AgGrid/` (module scope of the already-lazy `index.tsx`). This also moves the ~183 kB-gzip enterprise anchor out of the entry. The existing `<Suspense fallback={<LinearProgress/>}>` covers loading. `setupTests.ts` keeps its own registration for tests.
2. **Dynamic-import exceljs** inside the import handler of `useExcelImport.ts` (`const ExcelJS = await import('exceljs')`); the action is already async with an `isImporting` state.
3. **Dynamic-import html2canvas** at the PNG-export call in `ThoiKhoaBieuTable/hooks.ts` (the one test that touches it already `jest.mock`s it).
4. ~~License key → env var~~ — **decided against (2026-08-16):** the key stays hardcoded in `src/index.tsx`; the `.env.example` entry is vestigial.
5. **Dependency hygiene:** `npm uninstall @mui/lab yaml @testing-library/user-event`; move `eslint`, `eslint-config-react-app`, `@testing-library/*` to devDependencies; remove `react-router-dom` + `@types/react-router-dom` by replacing `BrowserRouter`/`ScrollToTop` with a plain scroll effect in `App.tsx` (fixes the only production-code audit finding).

**Expected result:** entry chunk ≈ 3.63 MB − 2.98 MB ≈ 0.65 MB minified ≈ **200–250 kB gzip** (~75 % smaller; the bundle's overall gzip ratio is ~27 %). The grid chunk (~800 kB gzip) and exceljs (~250 kB gzip) load on first use, once, cached thereafter. Blast radius: entry files + import sites only; no behavior change — grid/excel/export all already have loading or async UI states.

**Verification:** `npm run build` — expect CRA's "significantly larger than recommended" warning gone and the size table showing main ≈ 250 kB gzip + a large lazy chunk; `npm test` (13 suites) green; manual smoke via `npm start`: import an .xlsx (exceljs chunk loads), switch to grid mode (grid chunk loads, license watermark absent), export timetable PNG (html2canvas chunk loads).

### Phase 2 — CRA → Vite migration (kills the remaining ~2m build floor)

Operationalizes the deploy diagnosis's Phase 2. Compile ~80s → ~15–25s and a much smaller install tree (the 1,527-package count is dominated by react-scripts); resolves ~29 of the 31 audit findings; removes the Node deprecation warnings and the unmaintained-toolchain risk. Migration surface is small: env vars are only `NODE_ENV`, `PUBLIC_URL`, and the license key (F1.4); 13 jest test files move to vitest; `tsconfig` target modernizes. Worth its own PR after Phase 1 lands (Phase 1's lazy chunks carry over unchanged — Vite/Rollup will re-split them automatically).

### Phase 3 — optional polish

- Self-host fonts (`@fontsource`) or load the Google Fonts stylesheet non-blocking — removes the last render-blocking request (F6).
- Raise `browserslist`/tsconfig targets to modern browsers; adopt ag-grid's theming API for modular CSS (F7).
- Consider `import type` for the `ag-grid-community` type-only imports (`src/zus/index.ts:1`) and per-path lodash imports to shave the remaining shared bits.

---

## Implementation record — 2026-08-16 (Phases 1 + 3)

Phase 2 (CRA → Vite) intentionally not attempted. Item 1.4 stays decided-against (license key hardcoded, now relocated with the registration).

**Landed:**

- **P1.1** ag-grid registration (`ModuleRegistry.registerModules`, `LicenseManager.setLicenseKey`) and both theme stylesheets moved from `src/index.tsx` into module scope of the lazy `src/views/2XepLop/AgGrid/index.tsx`. `setupTests.ts` keeps its own registration.
- **P1.2** exceljs dynamic-imported inside the file-picker handler (`const { Workbook } = await import('exceljs')`; `Worksheet` via `import type`). The UMD browser build exposes `Workbook` as an enumerable named export (verified: `typeof require('exceljs.min.js').Workbook === 'function'`, no `__esModule`), so webpack's `import()` interop serves the destructure.
- **P1.3** html2canvas dynamic-imported at the PNG-export call (`{ default: html2canvas }`). `saveTkbImage.test.tsx`'s `jest.mock` still intercepts the dynamic import — unchanged and green.
- **P1.5** Removed `@mui/lab`, `yaml`, `@testing-library/user-event`, `react-router-dom`, `@types/react-router-dom`; moved `eslint`, `eslint-config-react-app`, `@testing-library/dom|jest-dom|react` to devDependencies; `BrowserRouter`/`ScrollToTop` replaced with a plain mount-time `window.scrollTo(0, 0)` effect in `App.tsx` (`ScrollToTop.tsx` deleted).
- **P3** Fonts self-hosted via `@fontsource/be-vietnam-pro` + `@fontsource/noto-sans` (latin + vietnamese subsets, exactly the weights the theme uses); Google Fonts `<link>`s and preconnects removed from `public/index.html`. tsconfig `target: es5 → es2017` (`downlevelIteration` dropped); browserslist production raised to `>0.3%, not dead, not op_mini all, supports es6-module-dynamic-import` — the dynamic-import floor is required now that chunk loading is lazy. `src/zus/index.ts` uses `import type { GridApi }` + `lodash/partition`.
- **P3 theming API: not done.** The grid skin (`AgGrid/styles.css`) is written against legacy alpine internals (`--ag-alpine-active-color`, `.ag-row-selected::before` layering, `--ag-icon-font-code-pin`); a Theming-API port has no 1:1 mapping and needs visual QA. Deferred; most of the CSS win is already captured by the stylesheets moving into the lazy chunk.

**Measured (local build, same method as the tables above):**

| Asset | Before | After |
|---|---|---|
| Entry chunk `main.*.js` (gzip) | 985.53 kB | **173.11 kB** (−82 %) |
| Lazy chunks (gzip) | 15.3 kB (AgGrid code only) | 475.4 kB ag-grid · 257 kB exceljs · 46.3 kB html2canvas · 6.1 kB shared |
| `main.*.css` (gzip) | 37.1 kB total CSS | 6.0 kB entry + 32.4 kB grid-chunk CSS |
| `npm audit --omit=dev` | 31 | 29 (all in the react-scripts tree; the only production-code finding — react-router-dom — is gone) |

The entry beat the ~250 kB estimate largely thanks to the browserslist/es2017 raise (babel stops downleveling modern syntax).

**Verified:** 82 tests / 13 suites green; `npm run build` compiles with no bundle-size warning. Runtime smoke against the served production build: first paint fetches only `main.js` + `main.css` + needed woff2 subsets (zero `fonts.googleapis.com` requests); seeding `dataExcel` fetches the ag-grid chunk + its CSS on demand and renders the grid with the license watermark hidden (`.ag-watermark` present but `visible: false`). exceljs/html2canvas chunk-on-demand paths covered by build output + unit tests + the UMD export check above.

---

## Not proposed

- `npm audit fix` — most fixes are semver-major inside the react-scripts tree; superseded by Phase 2.
- Code-splitting MUI — already tree-shaken via per-path imports; ~250 KB is near the floor for MUI + emotion and it's needed at first paint.
- Build output caching — the deploy log states it's unsupported for this project.
- Enabling source maps in production builds — `GENERATE_SOURCEMAP=false` is the right call; maps were generated only locally for this analysis.
