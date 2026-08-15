# Research 01 — Integration tier tooling (@testing-library/svelte + jsdom)

Date: 2026-08-15 · Repo: kids-games (SvelteKit 2.68.0, Svelte 5.56.4, Vitest 4.1.9, Vite 8.1.0, pnpm)

Method: primary sources only — official docs (testing-library.com, svelte.dev, vitest.dev), the npm registry, the installed packages' own source in `node_modules/`, and empirical probes run inside this repo (`npx vitest run` on throwaway test files). Probes were deleted after use.

---

## 1. @testing-library/svelte + Svelte 5 runes

### Version and peer requirements (npm registry)

- Latest version: **5.4.2** (`npm view @testing-library/svelte version`).
- Peer dependencies: `vite: *`, `svelte: ^3 || ^4 || ^5 || ^5.0.0-next.0`, `vitest: *`; `vite` and `vitest` are marked optional (`peerDependenciesMeta`) — so with Svelte 5.56.4 + Vitest 4.1.9 + Vite 8.1.0 in this repo, **peers are satisfied**. Source: `npm view @testing-library/svelte@5.4.2 peerDependencies`.
- Dependencies: `@testing-library/dom: 9.x.x || 10.x.x` and `@testing-library/svelte-core: 1.1.3` (`npm view @testing-library/svelte@5.4.2 dependencies`). `@testing-library/dom` latest is 10.4.1; the library's own docs say it is "built on top of dom-testing-library" (https://testing-library.com/docs/svelte-testing-library/intro).
- **Not installed in this repo**: no `node_modules/@testing-library/`, no `@testing-library/*` in `package.json`.

### How render() works with Svelte 5 runes components

The Svelte 5 code path (source: `packages/svelte-core/src/mount.js`, GitHub `main`):

- Detects modern Svelte and uses `mountModern`: `Svelte.mount(Component, { ...options, props })`, cleanup via `Svelte.unmount` inside `Svelte.flushSync`, and a synchronous `flushSync()` after mount — this is the Svelte 5 client-side component API, not the legacy `new Component(...)` constructor.
- Props are handed to runes components through `createProps` (`packages/svelte-core/src/props.svelte.js`): a shallow proxy over `$state.raw(initialProps)` so `$props()`-declared props react correctly, and `rerender(nextProps)` just swaps `currentProps` — **no remount on rerender**.
- Legacy Svelte 3/4 components take the old path (`new Component()`, `$set`, `$destroy`).

`render(Component, componentOptions, renderOptions)` mounts into a `<div>` appended to `document.body`; props may be passed directly or under `{ props, context, target }`; supports a `wrapper` component (`renderOptions.wrapper`, added in 5.4.0). Queries, `screen`, `fireEvent` (async, Svelte-flushing), `act` (uses Svelte `tick`) are re-exported. Sources: https://testing-library.com/docs/svelte-testing-library/api and the `svelte-core` sources above.

### Svelte 5 history / breaking-change notes (GitHub releases)

- Svelte 5 support landed in the main entry point at **v5.2.0** ("incorporate Svelte 5 support into main entry point", #375; peer range widened to `^5.0.0-next.0`, #384).
- Post-5.2.0 runes-related fixes worth knowing about (all in the current 5.4.x line):
  - 5.2.1 — synchronously flush changes after mount/unmount (#396)
  - core 1.1.1 — props proxy fix to avoid double `$effect` runs (#494)
  - core 1.1.2 — types: omit `children` from wrapper props (#495)
  - 5.4.2 — separate runes and non-runes wrapper scaffold (#497)
- The Svelte 3/4 → 5 API changes (`component.$set` → `rerender`, container/baseElement split) are documented with version cautions on the API page: https://testing-library.com/docs/svelte-testing-library/api.

### Official setup recipe (Vitest + SvelteKit)

The Setup docs give the canonical Vitest config, including the SvelteKit variant: https://testing-library.com/docs/svelte-testing-library/setup

```js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.js']
  }
});
```

- `svelteTesting` plugin does two things: adds an automatic cleanup fixture to `test.setupFiles`, and adds `browser` to `resolve.conditions` (both disableable via `autoCleanup: false` / `resolveBrowser: false`). The `browser` condition matters here because Svelte/`esm-env` condition-gate browser code (see §4).
- Recommended optional dep: `@testing-library/jest-dom` (`import '@testing-library/jest-dom/vitest'` in the setup file). Latest: 7.0.1.
- Install list from that page: `@testing-library/svelte`, `@testing-library/jest-dom`, `@sveltejs/vite-plugin-svelte`, `vitest`, `jsdom` (already have plugin + vitest).

---

## 2. Vitest 4 jsdom environment configuration

Facts from https://vitest.dev/guide/environment:

- Default environment is **`node`**; `jsdom`/`happy-dom`/`edge-runtime` are opt-in and **the `jsdom` package itself must be installed** — vitest only wraps it. This repo has **no jsdom installed**; a probe with `// @vitest-environment jsdom` failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'jsdom'` (empirical, vitest 4.1.9). Vitest 4.1.9 declares `jsdom: *` and `happy-dom: *` as optional peers (`npm view vitest@4.1.9 peerDependencies`), and vitest even prompts to auto-install missing deps (disable with `VITEST_SKIP_INSTALL_CHECKS=1`, https://vitest.dev/config).
- Per-file override: a comment at the top of a test file — `// @vitest-environment jsdom` — scopes the environment to that file.
- Whole-project override: `test.environment: 'jsdom'` in config (applies to every test file in the project).
- **Scoped per-directory**: Vitest projects (`test.projects`, formerly "workspace", deprecated since 3.2 — same feature): inline config entries can set `name`, `include`, `environment`, `setupFiles`. Key behavior: **project configs inherit nothing from the root config unless `extends: true`**, and with `test.projects` defined, the root config is no longer itself a test project (root only carries global options like reporters; plugin hooks from the root config still run). Source: https://vitest.dev/guide/projects.
- `setupFiles` is a `test` option (https://vitest.dev/config/#setupfiles): array of module paths run before each test file; the `svelteTesting` plugin appends its cleanup fixture to it.
- Vitest config resolution: if a `vitest.config.*` exists it overrides and **ignores** `vite.config.*`; otherwise vitest reads the project's `vite.config.*` (https://vitest.dev/config). This repo has only `vite.config.js` → vitest already loads the `sveltekit()` + `SvelteKitPWA` plugins (empirically confirmed: `$lib`/`$app` aliases and the `__SVELTEKIT_APP_VERSION__` define worked in probes with zero config).

jsdom version constraint: jsdom 30.0.1 engines = `^22.22.2 || ^24.15.0 || >=26.0.0` (npm registry) — fine on this machine (Node v26.1.0), but if CI runs Node 20, pin `jsdom@^28` or `^29`.

---

## 3. Stubs needed for this repo's components in jsdom

What jsdom provides natively (https://github.com/jsdom/jsdom README): DOM, `localStorage`/`sessionStorage` (with default 5 MB `storageQuota`), `window`, `navigator` basics, events, `requestAnimationFrame` (only with `pretendToBeVisual`, which vitest's jsdom env enables by default). **Not implemented**: navigation, layout, and "unimplemented parts of the web platform" (WebAudio, Fullscreen API, `navigator.vibrate`) — unimplemented API calls surface as `jsdomError`s or plain `TypeError`s.

Per-repo-file audit (paths + line numbers are the evidence):

| Module | What it touches | jsdom reality | Needed stub |
|---|---|---|---|
| `src/lib/stores/settings.js` | `localStorage.getItem` guarded at init (line 6: `typeof localStorage !== 'undefined'`); **unguarded** writes in `toggleSound`/`setAge`/`markVisited` (lines 20, 25, 30) | jsdom has real `localStorage` → no crash | None required; between tests do `localStorage.clear()`; the store is a module-level singleton so `vi.resetModules()` + re-`import` to re-initialize (pattern already used in `tests/unit/settings.test.js:19`) |
| `src/lib/sounds/audioManager.js` | `new (window.AudioContext \|\| window.webkitAudioContext)()` (line 5) inside `playTone`'s try/catch (lines 13–26); `navigator.vibrate` guarded (line 69) | jsdom has **no AudioContext** → constructor throws → caught → silent no-op; `vibrate` guard handles missing API | None required for no-crash (existing unit tests `tests/unit/audioManager.test.js` already rely on this). To assert sound output: `vi.stubGlobal('AudioContext', FakeCtx)` where `FakeCtx` has `createOscillator`/`createGain`/`destination`/`state`/`resume`/`currentTime` |
| `src/routes/+page.svelte` (hub) | `goto` from `$app/navigation` (line 2); `await document.documentElement.requestFullscreen()` in `onMount` (line 36) — wrapped in its own try/catch | `requestFullscreen` is **undefined** in jsdom → `TypeError` → swallowed by the component's own catch → harmless; `goto` hits the `BROWSER` guard (see §4) | Mock `$app/navigation` (assert on `goto` calls). Optionally stub `document.documentElement.requestFullscreen = vi.fn()` to observe fullscreen intent |
| `src/routes/+layout.svelte` | `page` from `$app/stores` (line 3), then `$page.url.pathname.startsWith('/games')` (line 11); `window.addEventListener('beforeinstallprompt'/'appinstalled')` (lines 17, 22) | Under jsdom the kit runtime returns real-but-uninitialized stores: `page.url` is undefined → `.startsWith` **throws** | **Must mock `$app/stores`** (or provide a `page` value). Event listeners work fine; test the install banner by dispatching synthetic `new Event('beforeinstallprompt')` |
| `src/lib/stores/locale.js` | `navigator` guarded (line 65: `typeof navigator === 'undefined'`), `localStorage` guarded (lines 71, 79) | jsdom provides both; `navigator.language` exists (derived from the env's user agent) | None; reset storage between tests (`localStorage.clear()`), module singleton → `vi.resetModules()` to re-detect |
| `src/lib/components/BackButton.svelte` | `goto` from `$app/navigation` (line 2) | — | via the `$app/navigation` mock |
| `src/lib/components/SoundToggle.svelte` | `settings` store + `playTap()` (audioManager) | audio no-ops (above) | none |
| `src/lib/components/AgeSelector.svelte` | `settings` store | — | none |
| game routes (e.g. `src/routes/games/memory/+page.svelte:21-31`, `glossary-puzzle/+page.svelte:196-203`) | localStorage — **all guarded** | fine | none |

Working mock pattern already in the repo: `tests/unit/settings.test.js:4-12` stubs `localStorage` via `vi.stubGlobal` — still valid in jsdom, but unnecessary there.

---

## 4. `$app/*` imports in plain Vitest

### What actually happens in THIS repo (empirical, no config added)

The `sveltekit()` plugin in `vite.config.js` is loaded by vitest, so `$app/*` **resolves to the real kit runtime** — aliases `{ find: '$app', replacement: <kit>/runtime/app }` and `{ find: '$lib', replacement: src/lib }` are installed by the plugin's config hook (`node_modules/@sveltejs/kit/src/exports/vite/index.js:327-330`; `$lib` via `get_config_aliases`, `src/exports/vite/utils.js:26-31`). The plugin also `define`s `__SVELTEKIT_APP_VERSION__` (index.js:418), which `$app/environment`'s `internal.js` references.

Probe results (vitest 4.1.9, default node env):

- `import { browser } from '$app/environment'` — **works**; resolves through `esm-env` (`runtime/app/env/index.js` re-exports `BROWSER as browser` from `esm-env`). Value in node env: `false`.
- `import { goto } from '$app/navigation'` — **imports fine**; **calling `goto()` throws** `Error: Cannot call goto(...) on the server` (`kit/src/runtime/client/client.js:2328-2331`, guarded by the `BROWSER` flag).
- `import { page } from '$app/stores'` — **imports fine**; in node env `page.subscribe` throws outside component initialization (`runtime/app/stores.js:13-18` falls back to `getContext('__svelte__')` when not BROWSER).

### Why `browser` is what it is — `esm-env` mechanics

`esm-env@1.2.2` (installed, `node_modules/.pnpm/esm-env@1.2.2/...`) exports-map for `./browser`:

```json
"./browser": {
  "browser": "./true.js",
  "development": "./false.js",
  "production": "./false.js",
  "default": "./browser-fallback.js"
}
```

- With the **`browser` resolve condition** (exactly what the `svelteTesting` plugin adds, https://testing-library.com/docs/svelte-testing-library/setup) → `true.js` (BROWSER = true).
- Otherwise (plain Vitest, as today) → falls to `browser-fallback.js`: `export default typeof window !== 'undefined';` — a **runtime check**. Consequences in this repo:
  - node env → `false` → kit runtime behaves as "server": `goto()` throws, stores need component context.
  - jsdom env (even without the plugin) → `true` → `goto()` would attempt real navigation against jsdom history (jsdom can't navigate; README caveat) and `$app/stores` returns the client runtime's uninitialized stores (`page.url` undefined). Neither is desirable.

### Standard mitigations

1. **Mock the `$app` modules** in the tests that need them: `vi.mock('$app/navigation', () => ({ goto: vi.fn() }))` etc. — **verified working in this repo** (probe: mock applied, calls asserted). Same approach for `$app/stores` (provide a fixed `page` value: `{ page: { url: new URL('http://localhost/games/memory'), ... } }`).
2. There is no separate "SvelteKit vitest plugin" to add — the `sveltekit()` plugin already in `vite.config.js` **is** the integration; kit docs point to `npx sv add vitest` for scaffolding, and the official testing-library setup page documents the SvelteKit recipe as `plugins: [sveltekit(), svelteTesting()]` (https://testing-library.com/docs/svelte-testing-library/setup). Adding `svelteTesting()` makes `browser` resolve to `true.js` under jsdom.
3. Kit's own docs note the general pattern of keeping components free of `$app` imports for testability (https://svelte.dev/docs/kit, Packaging § "You may also wish to pass in things like the current URL or a navigation action as a prop rather than relying directly on `$app/state`, `$app/navigation`").

Existing repo tests import **no `.svelte` files at all** (grep of `tests/` for `.svelte` → zero matches) — every existing Vitest test is unit-level; nothing today exercises components or `$app` in vitest, so no precedent to preserve.

---

## 5. Existing patterns in this repo

- `vite.config.js` has **no `resolve.alias` block and no `test` block**; the `$lib` alias is provided by the `sveltekit()` plugin (evidence above; confirmed working — `tests/unit/settings.test.js:23` and all unit tests import `$lib/...` and pass under plain `npx vitest`).
- **No setup files exist** (no `vitest-setup.*`, no `setupFiles` config anywhere).
- **Implicit environment today: `node`** (vitest default; no `test.environment` set).
- `package.json` scripts: `"test": "vitest run tests/unit tests/behavioral"` — path-based filtering, no config. Adding `test.projects` changes what `vitest run` executes (only listed projects), so a projects config must keep a node-env project covering `tests/unit` + `tests/behavioral` or the two approaches (paths vs projects) will interact.
- Package manager: pnpm (`node_modules/.pnpm`), so new deps are installed with `pnpm add -D`.

---

## Bottom line

### Packages to add (devDependencies)

| Package | Version | Why |
|---|---|---|
| `@testing-library/svelte` | `^5.4.2` | Latest; Svelte 5 runes support since 5.2.0; peers satisfied by current repo versions; pulls `@testing-library/dom@^10` + `@testing-library/svelte-core@1.1.3` automatically |
| `jsdom` | `^29` (or `^28` if CI runs Node < 22.22) | Required by vitest's jsdom env (optional peer `jsdom: *`); v30 needs Node ≥ 22.22.2 |
| `@testing-library/jest-dom` | `^7.0.1` | Recommended by the official setup page for DOM matchers (`toHaveTextContent`, `toBeInTheDocument`, …); optional |

All three via `pnpm add -D`. `svelte`, `vitest`, `vite`, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte` already present.

### Config snippet (recommended: projects in vite.config.js)

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), SvelteKitPWA(/* ... unchanged ... */)],
  test: {
    projects: [
      {
        extends: true,                      // inherit plugins (sveltekit, PWA) from this config
        name: 'unit',
        include: ['tests/unit/**', 'tests/behavioral/**'],
        environment: 'node'                 // explicit; keeps today's behavior
      },
      {
        extends: true,
        name: 'integration',
        include: ['tests/integration/**'],
        environment: 'jsdom',
        setupFiles: ['./tests/integration/setup.js']
      }
    ]
  }
});
```

`tests/integration/setup.js` contents: `import '@testing-library/jest-dom/vitest';` plus localStorage reset and any shared `$app` mocks (the `svelteTesting` plugin auto-appends its cleanup fixture to `setupFiles`). Alternative with zero config change: per-file `// @vitest-environment jsdom` comments — but then `setupFiles` can't be scoped to jsdom tests, so projects is the cleaner fit.

### Stubs needed for this repo's components

1. `$app/navigation` — mock (`goto: vi.fn()`), needed by hub `+page.svelte`, `BackButton.svelte`, and any route that navigates.
2. `$app/stores` — mock (`page` with a fixed `URL`), needed by `+layout.svelte` (`$page.url.pathname`) and any `page` consumers; without it the layout throws at render.
3. `localStorage` — **not** stubbed: jsdom implements it; only reset (`localStorage.clear()` + `vi.resetModules()` for store singletons) between tests.
4. `AudioContext`/`webkitAudioContext` — not required for no-crash (audioManager self-guards); stub only when asserting sounds.
5. `document.documentElement.requestFullscreen` — optional stub; hub wraps it in try/catch so it's silently swallowed in jsdom.
6. `navigator.vibrate`, `matchMedia` — all usages in src are guarded (`if (navigator.vibrate)`); no stub required.

### Key risks / notes for the design doc

- `test.projects` replaces path-filtered runs: the existing `"test": "vitest run tests/unit tests/behavioral"` script needs revisiting (either drop to `vitest run --project unit`, or keep paths — verify interaction).
- jsdom 30 engine floor (Node ≥ 22.22.2) vs. possible CI Node 20 — pin jsdom version accordingly.
- Under jsdom, `esm-env`'s `browser` resolves via the `browser` condition once `svelteTesting()` is added → kit runtime thinks it's in a browser → `goto()` calls would run real (broken) navigation code: **always mock `$app/navigation`** in tests that trigger navigation, don't rely on the "server" guard.
