# SvelteKit 3 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the kids-games repo from SvelteKit 2.70.2 to SvelteKit 3.1.x with no behavior, saved-data, or offline regressions.

**Architecture:** The app is a static SPA (`ssr = false`, `prerender = false`) built with `adapter-static`, served from `public/`, and precached by `@vite-pwa/sveltekit`. SvelteKit 3 moves all project config into the `sveltekit()` Vite plugin, removes the automatic `$lib` alias in favor of a `package.json` `#lib` subpath import, and moves `$app/stores` to `$app/state`. The migration is done in reversible slices on a dedicated branch; the game code and storage keys do not change.

**Tech Stack:** SvelteKit 3.1.1, Svelte 5.57.x, Vite 8.3.x, `@sveltejs/vite-plugin-svelte` 7.3.x, `@sveltejs/adapter-static` 4.0.1, `@vite-pwa/sveltekit` 2.0.1, Vitest 5.1.0, Playwright, TypeScript 7 (the v3 minimum is 6), Node 24.15 (minimum 22.17), pnpm 11.

**Spec:** `/Users/ionutale/developer-playground/AGENTS.md` (workspace defaults) and the official SvelteKit 3 migration guide: `https://github.com/sveltejs/kit/blob/@sveltejs/kit@3.1.1/documentation/docs/60-appendix/35-migrating-to-sveltekit-3.md`

## Global Constraints

- Node **>= 22.17**; TypeScript **>= 6** (latest 7.0.2); Svelte **>= 5.57.1**; Vite **>= 8.0.12**; `@sveltejs/vite-plugin-svelte` **>= 7**.
- SvelteKit **3.1.1**; `@sveltejs/adapter-static` **4.0.1**; `@vite-pwa/sveltekit` **2.0.1**; Vitest **5.1.0**.
- No `svelte.config.js`. All former `kit.*` options go to `sveltekit({ ... })` in `vite.config.ts`.
- No `$lib`. `#lib` is declared in `package.json#imports`; source imports use `#lib/...`, test imports use relative paths.
- Imports carry explicit `.js` extensions after the alias change.
- `src/routes/+layout.ts` keeps `ssr = false` and `prerender = false`.
- Keep every storage key and data shape unchanged: `kids-games-settings`, `kids-games-locale`, `{game}Level`, `{game}Mastered`, `soccerStars`, `spotPostcards`, sticker/paint saves, and photo IndexedDB records.
- Keep the game routes, hub, copy keys, PWA manifest, and service-worker update behavior unchanged.
- New dependencies are dev-only: TypeScript, jsdom, Testing Library. No new runtime dependencies.

## Review Focus

1. **Offline deep links** — after the fallback change, a cold reload of `/games/focus-tap/play/1` while offline must still boot from the precached shell, not show a 404.
2. **`#lib` resolution** — the alias must resolve in `.svelte`, `.js`, Vitest and `svelte-check`, including the explicit `.js` extensions; a missed extension is a silent build-only failure.
3. **`$app/state` conversion** — the three glossary routes read `$page`; after conversion every `$page` must become `page` and the template keys must still re-render on navigation.
4. **PWA cache after the upgrade** — a returning visitor may hold the old service worker; `registerType: 'autoUpdate'` and the `controllerchange` reload must still replace the shell without a stale-route loop.
5. **Saved data** — settings, locale, ladder progress, stars, postcards, stickers, paint and photos must survive the upgrade; a changed origin or cache clear would look like data loss.

---

## Current Inventory

- **Post-codemod state (SvelteKit 3.1.1):** `vite.config.js` uses `withPwa(sveltekitOptions, pwaOptions)` and keeps the `index.html` fallback; `svelte.config.js` is gone; `jsconfig.json` extends `$app/tsconfig`; PWA is 2.0.1; Vitest is 5.1.0. Task 4 renames the config to `.ts`; Task 10 cleans the PWA warnings.
- **Original pre-migration state:** SvelteKit 2.70.2, adapter-static 3.0.10, svelte 5.56.4, vite 8.1.0, PWA 1.1.0, Vitest 4.1.9.
- **120 files** and **425 occurrences** of `$lib` — 72 in `src`, 48 in `tests`; 66 `.js`, 54 `.svelte`.
- **`$app/stores`** in 3 files: `src/routes/games/glossary-puzzle/+page.svelte`, `.../play/+page.svelte`, `.../play/[level]/+page.svelte`. They read `$page.url` and `$page.params`.
- **`$app/environment`** in `src/routes/+layout.svelte` (`dev`).
- **`goto`** in `LadderActions.svelte`, `BackButton.svelte`, the hub, paint, stickers and glossary; all calls are simple `goto(href)` with no v2-only options.
- **`redirect`** from `@sveltejs/kit` in five play parent routes; all redirects are internal, so the v3 external-redirect option is not needed.
- **Not present:** `$app/paths`, `invalidateAll`, `pushState`/`replaceState`, `json`/`text`, `data-sveltekit-*="off"`, server files, hooks, param matchers, `$env`, service-worker source.
- **Config today:** `svelte.config.js` has `kit.paths.relative = false` and `adapter({ pages:'public', assets:'public', fallback:'index.html', precompress:false, strict:true })`. `vite.config.js` has `SvelteKitPWA({ kit:{ adapterFallback:'index.html', spa:{ fallbackMapping:'/' } }, manifest, workbox })`.
- **Types today:** `jsconfig.json` extends `./.svelte-kit/tsconfig.json`; `check` and `lint` pass `--tsconfig ./jsconfig.json`.
- **Layout today:** `src/routes/+layout.js` is already `prerender = false; ssr = false;`.
- **Baseline:** `pnpm test` 515/515; `pnpm check` 0 errors, one pre-existing speed-match warning.

## File Structure

- Create: `vite.config.ts` (replaces `vite.config.js`).
- Delete: `svelte.config.js`.
- Rename: `jsconfig.json` → `tsconfig.json`; `src/routes/+layout.js` → `src/routes/+layout.ts`.
- Create: `tests/setup.js` (jest-dom, Testing Library cleanup, Map-backed localStorage fallback).
- Create: `scripts/migrate-lib-imports.mjs` (one-off source + test codemod, `--check` mode).
- Create: `docs/superpowers/plans/2026-11-08-sveltekit-3-migration.md` (this plan).
- Modify: `package.json` (`imports`, devDependencies, `check`/`lint` scripts).
- Modify: `src/routes/games/glossary-puzzle/+page.svelte`, `.../play/+page.svelte`, `.../play/[level]/+page.svelte` (`$app/state`).
- Modify: `src/routes/+layout.svelte` (`$app/env`).
- Modify: 72 `src` files with `$lib` → `#lib` (automated).
- Modify: 48 test files with `$lib` → relative paths (automated).

---

### Task 1: Baseline, branch and rollback point

**Files:** none (git only).

**Interfaces:** none.

- [ ] **Step 1: Record the clean baseline**

Run:
```bash
pnpm check
pnpm test
pnpm build
```
Expected: check 0 errors (the speed-match warning is known); tests 515/515; build succeeds and writes `public/`.

- [ ] **Step 2: Record the e2e baseline**

Run:
```bash
pnpm test:e2e
```
Expected: the existing suite passes. If the local port is occupied, use the untracked `playwright.local.config.js` and record which config was used.

- [ ] **Step 3: Create the rollback point**

```bash
git tag pre-sveltekit-3
git switch -c migration/sveltekit-3
```

- [ ] **Step 4: Commit the plan**

```bash
git add docs/superpowers/plans/2026-11-08-sveltekit-3-migration.md
git commit -m "docs(plan): add the SvelteKit 3 migration plan"
```

Rollback point: the `pre-sveltekit-3` tag and `main`. No data changes yet.

---

### Task 2: Upgrade to the latest 2.x and verify

**Files:** `package.json`, `pnpm-lock.yaml`.

**Interfaces:** produces a clean 2.70.4 baseline before the major jump.

- [ ] **Step 1: Upgrade only the 2.x patch line**

```bash
pnpm add -D @sveltejs/kit@2.70.4
pnpm install
```

- [ ] **Step 2: Run the full gate**

```bash
pnpm check
pnpm test
pnpm build
```
Expected: unchanged green. Fix any 2.70.4 deprecation warning now; do not mix it with the v3 changes.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): upgrade SvelteKit to the latest 2.x"
```

---

### Task 3: Run the official migration codemod

**Files:** whatever `sv migrate` changes.

**Interfaces:** produces the automated portion of the v3 upgrade; the diff is reviewed before editing anything else.

- [ ] **Step 1: Run the codemod on the migration branch**

```bash
npx sv migrate sveltekit-3
```
Expected: dependency bumps, `svelte.config.js` removal, `vite.config` changes, alias/extension rewrites, and `$app` rewrites where supported. The command may stop on a manual step; read its output.

- [ ] **Step 2: Review the diff before running anything**

```bash
git diff --stat
git diff -- package.json svelte.config.js vite.config.js jsconfig.json tsconfig.json | head -200
```
Expected: no game logic rewritten; no storage keys touched. If the codemod touched tests, record which files; Task 6 normalizes them.

- [ ] **Step 3: Install and fix only what the codemod reports**

```bash
pnpm install
```
Expected: lockfile resolves SvelteKit 3.1.1, adapter-static 4.0.1, PWA 2.0.1, Vitest 5.1.0, Svelte >=5.57.1, Vite >=8.0.12.

- [ ] **Step 4: Commit the automated pass**

```bash
git add -A
git commit -m "chore(migration): apply the SvelteKit 3 codemod"
```

If the codemod already produced a valid `vite.config.ts` and `package.json#imports`, Task 4 and Task 5 become verification tasks, not rewrites.

---

### Task 4: Move configuration into `vite.config.ts`

**Files:**
- Create: `vite.config.ts` (from `vite.config.js`)
- Delete: `svelte.config.js`
- Modify: `package.json` scripts if the codemod has not already

**Interfaces:** consumes the current adapter/PWA options and `paths.relative = false`; produces a build with no `svelte.config.js`.

- [ ] **Step 1: Write `vite.config.ts`**

Keep the existing PWA manifest and workbox blocks verbatim. The skeleton must be:

```ts
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';
import { withPwa } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    // PWA v2 wraps the SvelteKit plugin and builds the service worker before
    // the static adapter writes `public/`.
    withPwa(
      {
        // Former svelte.config.js: kit.paths.relative === false
        paths: { relative: false },
        adapter: adapter({
          pages: 'public',
          assets: 'public',
          fallback: 'index.html',
          precompress: false,
          strict: true
        })
      },
      {
        registerType: 'autoUpdate',
        injectRegister: null,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        kit: {
          adapterFallback: 'index.html',
          spa: { fallbackMapping: '/' }
        },
        manifest: {
          // Copy the current manifest block unchanged.
        },
        workbox: {
          // Copy the current workbox block unchanged; Task 10 renames the key
          // to `generateSW` if the v2 warning still applies.
        }
      }
    )
  ]
});
```

- [ ] **Step 2: Remove the old config**

```bash
git rm vite.config.js
```
`svelte.config.js` is already removed by the codemod. The new file keeps `withPwa`; do not reintroduce the removed `SvelteKitPWA` export.

- [ ] **Step 3: Verify the fallback artifact**

```bash
pnpm build
ls public/index.html
```
Expected: `public/index.html` exists. The repo already ships `index.html` with `adapterFallback: 'index.html'`; do not switch to `200.html` in this task. Task 10 verifies the offline deep link and owns any fallback change.

- [ ] **Step 4: Check**

```bash
pnpm check
```
Expected: 0 errors. A `paths` or `adapter` type error means the plugin option shape is wrong; compare with the v3 config docs before continuing.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts package.json pnpm-lock.yaml
git commit -m "refactor(config): move SvelteKit config into the Vite plugin"
```

---

### Task 5: Add `#lib` and convert source imports

**Files:**
- Modify: `package.json`
- Modify: 72 `src` files containing `$lib`
- Test: existing suite

**Interfaces:** produces `import { x } from '#lib/path/file.js'` in every source file.

- [ ] **Step 1: Declare the alias**

Add at the top level of `package.json` (not inside `devDependencies`):

```json
"imports": {
  "#lib/*": "./src/lib/*"
}
```

Only the wildcard is needed; the repo has no `src/lib/index.js`.

- [ ] **Step 2: Convert source imports and add extensions**

Run the codemod in check mode, then apply:

```bash
node scripts/migrate-lib-imports.mjs --check
node scripts/migrate-lib-imports.mjs
```

The script must:
- target `src/**/*.{js,svelte}`;
- replace `$lib/` with `#lib/`;
- append `.js` when the specifier has no extension and the target `src/lib/<sub>.js` exists;
- leave `$app/*`, `svelte`, and package imports alone;
- fail `--check` if any `$lib` remains.

- [ ] **Step 3: Verify resolution**

```bash
grep -rn '\$lib' src || true
pnpm check
```
Expected: no `$lib`; check 0 errors. A missing-extension error is fixed by adding `.js`, not by reintroducing `$lib`.

- [ ] **Step 4: Commit**

```bash
git add package.json src
git commit -m "refactor(imports): replace \$lib with #lib in source"
```

---

### Task 6: Convert test imports to relative paths

**Files:**
- Modify: 48 `tests/**` files containing `$lib` (or `#lib` after the codemod)
- Test: `tests/unit`, `tests/behavioral`, `tests/e2e`

**Interfaces:** produces `import { x } from '../../src/lib/path/file.js'`; tests no longer depend on a framework alias.

- [ ] **Step 1: Extend the codemod for tests**

For each test file, resolve `tests/<dir>/<file>` to `src/lib/<sub>` and write the relative specifier:

```js
const rel = relative(dirname(file), join('src/lib', sub)).replaceAll('\\', '/');
const spec = rel.startsWith('.') ? rel : `./${rel}`;
```

Append `.js` when the target is a `.js` file and the specifier has no extension. Handle both static `from '...'` and dynamic `import('...')`.

- [ ] **Step 2: Apply and verify**

```bash
node scripts/migrate-lib-imports.mjs --tests --check
node scripts/migrate-lib-imports.mjs --tests
grep -rn '\$lib\|#lib' tests || true
pnpm test
```
Expected: no alias imports in tests; 515/515.

- [ ] **Step 3: Commit**

```bash
git add tests scripts/migrate-lib-imports.mjs
git commit -m "test(imports): use relative paths in tests"
```

---

### Task 7: `tsconfig`, layout and check scripts

**Files:**
- Rename: `jsconfig.json` → `tsconfig.json`
- Rename: `src/routes/+layout.js` → `src/routes/+layout.ts`
- Modify: `package.json` (`check`, `lint`)
- Test: `pnpm check`

**Interfaces:** consumes `$app/tsconfig`; produces the same include/exclude coverage as today.

- [ ] **Step 1: Replace the jsconfig**

```json
{
  "extends": "$app/tsconfig",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "moduleResolution": "bundler"
  },
  "include": ["src", "tests", "scripts", "*.js", "*.ts"],
  "exclude": ["src/service-worker"]
}
```

- [ ] **Step 2: Rename the layout and the scripts**

```bash
git mv jsconfig.json tsconfig.json
git mv src/routes/+layout.js src/routes/+layout.ts
```
Change `check` and `lint` to `svelte-check --tsconfig ./tsconfig.json`.

- [ ] **Step 3: Run the check**

```bash
pnpm check
```
Expected: 0 errors. If `$app/tsconfig` cannot be resolved, run `pnpm prepare` (`svelte-kit sync`) first.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json src/routes/+layout.ts
git commit -m "chore(types): adopt \$app/tsconfig and the v3 layout"
```

---

### Task 8: Verify the remaining v3 app APIs (codemod already converted)

**Post-codemod note:** the 3.1.1 codemod already rewrote `$app/stores` to `$app/state` and `$app/environment` to `$app/env`; the current tree greps clean. Run the steps below as verification and fix only a residual hit.

**Files:**
- Modify: `src/routes/games/glossary-puzzle/+page.svelte`
- Modify: `src/routes/games/glossary-puzzle/play/+page.svelte`
- Modify: `src/routes/games/glossary-puzzle/play/[level]/+page.svelte`
- Modify: `src/routes/+layout.svelte`
- Test: `pnpm check`, `pnpm test`, a manual glossary-puzzle pass

**Interfaces:** `$app/state` and `$app/env`; no `$app/stores` or `$app/environment` remain.

- [ ] **Step 1: Replace the stores module**

In each glossary file:
```js
-import { page } from '$app/stores';
+import { page } from '$app/state';
```
Replace `$page.url` with `page.url`, `$page.params` with `page.params`, and in templates `$page` with `page` (for example `{#key page.url.href}`). Remove the `$` store prefix everywhere; `page.url` is a `ReadonlyURL` and must not be mutated.

- [ ] **Step 2: Replace the environment module**

In `src/routes/+layout.svelte`:
```js
-import { dev } from '$app/environment';
+import { dev } from '$app/env';
```

- [ ] **Step 3: Verify the rest of the v3 inventory**

```bash
grep -rn "\$app/stores\|\$app/environment" src tests || true
grep -rn "invalidateAll\|pushState\|replaceState\|data-sveltekit-[a-z-]*=\"off\"" src || true
pnpm check
```
Expected: no hits; 0 errors. The `redirect` imports and simple `goto(href)` calls are already v3-safe on this branch.

- [ ] **Step 4: Manual glossary check**

Start `pnpm dev`, open `/games/glossary-puzzle`, open a puzzle, use the level query and a photo flow. Expected: the page reads the URL, `{#key page.url.href}` remounts on navigation, no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes
git commit -m "refactor(app): migrate to \$app/state and \$app/env"
```

---

### Task 9: Test setup, jsdom and the localStorage fallback

**Files:**
- Create: `tests/setup.js`
- Modify: `vite.config.ts`, `package.json`
- Test: `pnpm test`

**Interfaces:** every test runs with a working `localStorage`; Testing Library cleans up between tests.

- [ ] **Step 1: Add the dev dependencies**

```bash
pnpm add -D jsdom @testing-library/svelte @testing-library/jest-dom
```

- [ ] **Step 2: Write `tests/setup.js`**

```js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

function installMapLocalStorage() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true
  });
}

try {
  globalThis.localStorage.setItem('__probe__', '1');
  globalThis.localStorage.removeItem('__probe__');
} catch {
  installMapLocalStorage();
}
```
If `localStorage` is `undefined`, the `try` throws and the fallback installs. The same fallback also covers an opaque-origin jsdom.

- [ ] **Step 3: Add the Vitest test block**

Task 4 deliberately leaves the test block out (the setup file does not exist yet). Add it to `vite.config.ts`:
```ts
/// <reference types="vitest/config" />
// ... existing imports ...
export default defineConfig({
  // ... plugins ...
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js']
  }
});
```
If TypeScript complains about `test`, keep the triple-slash reference or import `defineConfig` from `vitest/config`.

- [ ] **Step 4: Run the suite**

```bash
pnpm test
```
Expected: 515/515. Tests that call `vi.stubGlobal('localStorage', ...)` or `vi.stubGlobal('window', ...)` still override the setup for their own scope.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tests/setup.js
git commit -m "test(setup): add jsdom and a Map-backed localStorage fallback"
```

---

### Task 10: PWA cleanup, fallback and offline verification

**Files:** `vite.config.ts`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.

**Interfaces:** produces a precached shell that boots a deep link offline.

- [ ] **Step 0: Clean the PWA dependencies and the v2 warning**

- Remove the now-unused `vite-plugin-pwa` devDependency (`@vite-pwa/sveltekit@2` uses `@unplugin-pwa/*`).
- Rename the `workbox` option to `generateSW` if `pnpm build` still prints the deprecation warning; `globStrict` is valid there.
- Remove the stale `cookie@0.7.0` `minimumReleaseAgeExclude` and the redundant `overrides.cookie` if the sole consumer already requires `^2.0.1`.
- Keep `index.html` in both `fallback` and `adapterFallback`.

- [ ] **Step 1: Build and preview**

```bash
pnpm build
pnpm preview
```
Expected: build succeeds; the preview serves `/` and `/games/focus-tap/play/1`.

- [ ] **Step 2: Check the service worker and the fallback**

Open the preview in a fresh profile, load `/`, wait for the service worker to activate, then reload `/games/focus-tap/play/1` with DevTools offline. Expected: the game boots from the precached shell; no 404; no stale-route loop. Keep `index.html` in both `fallback` and `adapterFallback`; if a fallback change is ever needed, change both names in the same commit.

- [ ] **Step 3: Check the upgrade path**

With an old build still registered, load the new build and confirm `controllerchange` reloads once and the routes match the new shell. Expected: one reload, no loop.

- [ ] **Step 4: Commit only if the fallback changed**

```bash
git add vite.config.ts
git commit -m "chore(pwa): align the adapter fallback"
```

---

### Task 11: Full gate, data preservation and handoff

**Files:** none.

**Interfaces:** proves the migration is complete and reversible.

- [ ] **Step 1: Run every gate**

```bash
pnpm test
pnpm check
pnpm build
CI=1 pnpm test:e2e
```
Expected: 515+/515; 0 errors (the known warning is fine); build succeeds; e2e green on a fresh server (`CI=1` avoids reuse of the stale preview on 4173).

- [ ] **Step 2: Verify saved data**

In one profile: set a sound preference, change the locale, advance a ladder level, earn a soccer star, add a spot postcard, place a sticker and paint a stroke. Reload. Expected: every value survives; no key was renamed. Do not clear site data.

- [ ] **Step 3: Verify the five Review Focus cases**

- offline deep link;
- a `#lib` import in a `.svelte` file, a `.js` file and a test;
- `$page`-free glossary navigation;
- an old service worker upgrading;
- the saved-data pass.

- [ ] **Step 4: Refresh the tracked static site and drop the codemod checklist**

```bash
pnpm build
git add public
git rm MIGRATION_TASKS.md
git commit -m "chore(build): refresh the static site and drop the migration checklist"
```
Expected: `public/` contains the new `index.html`, `sw.js` and workbox bundle; `MIGRATION_TASKS.md` is gone.

- [ ] **Step 5: Record the result and tag**

```bash
git tag sveltekit-3
```
Write the versions and the e2e config used in the commit message or the plan.

- [ ] **Step 6: Handoff**

The branch is ready to merge only when all gates pass. The old `main` and the `pre-sveltekit-3` tag remain the rollback path.

---

## Rollback

- **Code:** `git switch main` (or `git switch --detach pre-sveltekit-3`); the migration branch contains no data migrations.
- **Deploy:** redeploy the prior `public/` build. The storage keys are unchanged, so saved data remains readable.
- **Service worker:** a returning client may keep the new shell; if a rollback needs an immediate reset, bump the cache name or unregister the worker and reload once. Do not clear user data.
- **Fallback:** the migration keeps `index.html` in both `fallback` and `adapterFallback`; if a later change to `200.html` causes an offline regression, revert both names together in one commit and re-run Task 10.

## Self-Review Notes

- **Spec coverage:** config move (Task 4), `#lib` (Task 5), relative tests (Task 6), `$app/state`/`$app/env` verification (Task 8), test setup/localStorage (Task 9), PWA cleanup/offline (Task 10), final gate + tracked build (Task 11). The workspace's "no `svelte.config.js`", "tests relative", and "Map-backed localStorage" rules each have a task.
- **Post-codemod corrections:** the PWA v2 helper is `withPwa`, not `SvelteKitPWA`; Task 4 preserves the working `index.html` fallback and does not reintroduce the removed export.
- **Type consistency:** the alias is `#lib/*` everywhere; the fallback is `index.html` in both configs; the test setup path is `./tests/setup.js`.
- **Out of scope:** rewriting the pure-logic behavioral tests to Testing Library, changing the game implementations, merging the prototype branches, and migrating the prototype `?variant=` hooks (they live on other branches and are not on `main`).
