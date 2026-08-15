# Deployment Performance Diagnosis — 2026-08-16

**Symptom:** Cloudflare Workers Builds deploy (`npm run build` + `npx wrangler deploy`) takes ~3m 14s.

**Root cause (one sentence):** The pipeline builds the app **twice** and downloads wrangler **every deploy**, because no `wrangler.jsonc` is committed to the repo and wrangler is not a devDependency — so `npx wrangler deploy` runs its setup wizard in CI, which re-runs the entire `npm run build` before uploading.

**Scope of investigation:** Log analysis of the 2026-08-15 build (16:04:28 → 16:07:42 UTC) plus verification against the repo. No files were changed during diagnosis.

---

## Timeline breakdown

Total: **16:04:28.107 → 16:07:42.585 ≈ 3m 14s**

| Phase | Window | Duration | Necessary? |
|---|---|---|---|
| Env init + git clone | 16:04:28 → 16:04:36 | ~9s | yes |
| `npm clean-install` (1,492 packages) | 16:04:44 → 16:05:13 | ~30s | yes (CRA dep tree) |
| Build **#1** — `npm run build` | 16:05:14 → 16:06:19 | ~65s | yes |
| `npx` downloads wrangler@4.123.0 (unpinned) | 16:06:20 → 16:06:33 | ~13s | **waste** |
| Setup wizard + installs wrangler again into project | 16:06:33 → 16:06:40 | ~7s | **waste** |
| Build **#2** — wizard re-runs `npm run build` | 16:06:41 → 16:07:28 | ~47s | **waste** |
| Asset upload + deploy | 16:07:29 → 16:07:35 | ~6s | yes |
| Dependency cache upload | 16:07:35 → 16:07:42 | ~7s | yes |

Wasted time: **~67s**. Build #2 is provably pure waste: it produces byte-identical output to build #1 (`main.ef348973.js`, `main.d1220d9b.css` — same hashes both runs).

---

## Findings (verified against the repo)

### F1 — No wrangler config committed → second build + setup wizard every deploy

There is no `wrangler.toml`/`wrangler.jsonc` anywhere in the repo (verified with `find`). Because of this, `npx wrangler deploy` enters framework detection / interactive setup mode. The log shows:

```
Detected Project Settings:
 - Worker Name: dkhp-fork
 - Framework: Static
 - Build Command: npm run build
 - Output Directory: build
...
? Proceed with setup?
🤖 Using fallback value in non-interactive context: yes
...
[build] Running: npm run build        ← second full build
```

The wizard also mutates `.gitignore`, `package.json`, and creates `wrangler.jsonc` — **in the ephemeral CI environment only**, thrown away after every deploy.

### F2 — wrangler not a dependency → downloaded fresh every deploy, unpinned

- `npx warn exec The following package was not found and will be installed: wrangler@4.123.0` (~13s)
- wrangler is absent from `package.json` devDependencies and from `package-lock.json` (verified with grep).

Consequences: ~13s download per deploy, no version pinning (a future wrangler release could silently change deploy behavior), and the wizard then installs wrangler *again* into the project (~7s).

### F3 — Deploy script targets the wrong product

`package.json` `deploy` script is:

```
npx wrangler pages deploy build --project-name=... --branch=...
```

That is **Cloudflare Pages** (`wrangler pages deploy`), while CI actually runs **`npx wrangler deploy`** — Workers static assets. The Workers path is what deployed to `dkhp-fork.namsmithitz.workers.dev`. Two different deployment targets defined in two places.

### F4 — CRA is the remaining floor (~1m 40s)

Even after fixing F1–F3, the pipeline keeps: ~30s install of 1,492 packages and ~65s compile, because `react-scripts@5` (Create React App) is deprecated, has an enormous dependency tree, and emits a 985 kB unsplit main bundle. It is also the source of most of the 31 `npm audit` vulnerabilities and the deprecation-warning noise in the log.

---

## Improvement plan

### Phase 1 — Commit config; kill ~70s and the nondeterminism (no source changes)

1. **Commit `wrangler.jsonc` at repo root:**

   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "dkhp-fork",
     "compatibility_date": "2026-08-15",
     "observability": { "enabled": true },
     "assets": {
       "directory": "build",
       "not_found_handling": "single-page-application"
     }
   }
   ```

   With a config present, `wrangler deploy` skips the setup wizard **and** the second build — it deploys the existing `build/` directory as-is. `not_found_handling: "single-page-application"` gives SPA fallback for the app's `BrowserRouter` deep links (currently unmatched paths return a plain 404).

2. **Pin wrangler as a devDependency:** `npm install -D wrangler` (updates `package.json` + lockfile). `npx wrangler deploy` then resolves to the cached local install — no per-deploy download, no version drift.

3. **Fix the `deploy` script** to match the actual target:

   ```
   "deploy": "npm run build && wrangler deploy"
   ```

4. No Cloudflare dashboard changes needed — build command (`npm run build`) and deploy command (`npx wrangler deploy`) remain correct once the config is committed.

**Expected result:** ~3m14s → **~2m05s**, deterministic. Blast radius: config files + one devDependency only; no runtime behavior change (SPA 404 fallback actually improves deep links).

**Verification:** push and watch the Workers Builds log — expect no "Detected Project Settings" wizard block, no second `[build] Running: npm run build` pass, single compile, total ≈ 2m. Locally, `npx wrangler deploy --dry-run` validates the config.

### Phase 2 — Optional follow-up: CRA → Vite migration

Attacks the remaining ~1m 40s. `react-scripts` is deprecated; Vite typically cuts install + compile to ~15–25s total and enables code splitting (lazy-load `ag-grid-enterprise`, `exceljs`, `html2canvas`, MUI — the 985 kB main bundle). Larger change (env vars, tsconfig/jsx config, test runner), worth a separate PR. Also resolves most `npm audit` findings, which live in the react-scripts tree.

---

## Not proposed

- `npm audit fix` — most findings are in the react-scripts tree; superseded by Phase 2.
- Build output caching — the log states "Skipping build output cache as it's not supported for your project"; nothing actionable.
