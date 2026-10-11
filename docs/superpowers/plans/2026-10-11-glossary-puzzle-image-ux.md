# Glossary Puzzle Image UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the pick → preview → My Photos experience for the image jigsaw: a preview-first shelf, per-image solved badges, an on-device parent-added photo library, and a grown image collection.

**Architecture:** All work lives in `src/lib/glossary-puzzle/` + the two gallery/play routes. A new `photos.js` (IndexedDB) and `solved.js` (localStorage) module back the features; `images.js` grows a merged image model (`photoToVM`, `buildImageList`, `resolveImage`) that keeps built-in and user photos in one shape. `PuzzleBoard.svelte` gains exactly one call (`recordSolved`); its rendering already accepts any image URL, including blob URLs and SVGs.

**Tech Stack:** Svelte 5 runes, SvelteKit static adapter PWA (Workbox precache), vitest (unit/behavioral), Playwright (e2e, port 4173), pnpm.

**Spec:** `docs/superpowers/specs/2026-10-11-glossary-puzzle-image-ux-design.md`

## Global Constraints

- **pnpm only**; **no new dependencies** (runtime or dev) — photos pipeline uses canvas + IndexedDB directly.
- Svelte 5 **runes** (`$state/$derived/$props/$effect/$derived.by`); scoped CSS per component; match existing file style (2-space indent, semicolons, comments explain *why*).
- **Every user-facing string** goes through `$_()` (or `get(_)` in plain script) and exists in all 6 locales: `en, it, ro, de, fr, zh` (spec §7 table is the copy source).
- **Touch-first**: pointer events only, targets ≥44px, nothing hover-only.
- **Class-name contract**: keep `.gp-gallery`, `.gp-image-card`, `.gp-cat-btn`, `.gp-resume-btn`, `.gp-board`, `.gp-tray-piece`, `.gp-top-bar`, `.hud-item`, `.gp-celebration-btn` on their existing elements (e2e depends on them).
- Photo pipeline limits (spec §4): full image longest edge **1600px** q**0.85**, thumb **400px** q**0.8**, caps **30 photos / 50MB**, parent gate hold **3000 ms**.
- Asset convention: sources in `static/puzzles/`; `public/puzzles/` + `public/sw.js` are built copies and **tracked** — regenerate with `pnpm build` and commit (done once in Task 11).
- Commits: conventional style with `glossary-puzzle` scope, e.g. `feat(glossary-puzzle): …`.
- Playwright runs `pnpm build && pnpm preview` itself before e2e; targeted runs: `pnpm exec playwright test <file>`.

## Review Focus

(Input classes / failure modes the spec implies but no happy-path test exercises; each is pinned by a test in the owning task.)

1. **Undecodable file during add** → `photoError` surfaced in the manager, nothing written (Task 10 e2e).
2. **Save points at a deleted photo** → gallery clears it, resume URL falls back without crashing (Task 10 e2e).
3. **Gate release mid-hold** → ring resets, `onpass` never fires; 3s hold fires exactly once (Task 7 unit-able math + Task 10 e2e both timings).
4. **Object URL leaks** across repeated gallery↔play navigation → `revokeVM` revokes both URLs (Task 3 unit + cleanup wiring reviewed in Tasks 8–9).
5. **Photo cap math** — count/bytes cap rejects before insert, existing photos intact (Task 4 pure `canAdd` unit test).

---

## Task 1: Per-image solved store (`solved.js`) + board recording

**Files:**
- Create: `src/lib/glossary-puzzle/solved.js`
- Create: `tests/unit/glossary-puzzle-solved.test.js`
- Modify: `src/lib/glossary-puzzle/PuzzleBoard.svelte` (import + one call in `startCelebration`)

**Interfaces:**
- Produces: `loadSolved(): Record<string, number>`, `recordSolved(imageId: string, level: number): void`, `badgeFor(solvedMap, imageId, currentLevel): 'none' | 'check' | 'gold'`; localStorage key `glossary-puzzle-solved`.
- Consumes: `MAX_LEVEL` from `$lib/ladder/progress.js`.

- [ ] **Step 1: Write the failing test** — `tests/unit/glossary-puzzle-solved.test.js`, mirroring `tests/unit/ladder/progress.test.js` (stub `localStorage` via `vi.stubGlobal`, `await import(...)` inside tests):

Assertions:
- `loadSolved()` with nothing stored → `{}`; with corrupt JSON (`'{oops'`) → `{}`.
- `recordSolved('garden', 3)` then `loadSolved().garden === 3`; `recordSolved('garden', 2)` → stays 3; `recordSolved('garden', 5)` → 5.
- `badgeFor({ garden: 3 }, 'garden', 3)` → `'check'`; `('garden', 2)` → `'check'`; `('garden', 5)` → `'none'`; `({ garden: 10 }, 'garden', 10)` → `'gold'`; `({}, 'ocean', 1)` → `'none'`.

- [ ] **Step 2: Run it to verify it fails** — `pnpm exec vitest run tests/unit/glossary-puzzle-solved.test.js` → FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/glossary-puzzle/solved.js`** — same guard style as `save.js`/`progress.js` (`typeof localStorage === 'undefined'` guards, try/catch around JSON). `recordSolved` stores `Math.max(prev, level)`.

- [ ] **Step 4: Run test → PASS.** `pnpm exec vitest run tests/unit/glossary-puzzle-solved.test.js`

- [ ] **Step 5: Wire the board** — in `PuzzleBoard.svelte` `startCelebration()`, after `saveLevel('glossary-puzzle', level)`, add `recordSolved(image.id, level);` (+ import). Do not touch anything else in the board.

- [ ] **Step 6: Run `pnpm test` → all green** (board stays compatible with all behavioral tests).

- [ ] **Step 7: Commit** — `git add src/lib/glossary-puzzle/solved.js tests/unit/glossary-puzzle-solved.test.js src/lib/glossary-puzzle/PuzzleBoard.svelte && git commit -m "feat(glossary-puzzle): per-image solved store + board recording"`

---

## Task 2: Locale strings (16 keys × 6 languages)

**Files:**
- Modify: `src/lib/stores/locale.js` (add keys to every locale object)
- Create: `tests/unit/glossary-puzzle-locale.test.js`

**Interfaces:**
- Produces: keys `all, myPhotos, addPhotos, forGrownUps, holdToAdd, start, pieces, solved, noPhotos, photoName, photoStorageNote, photoError, photoLimit, deletePhoto, shows, adventure` — exact translations in spec §7.
- Consumes: existing `locale` store + `_` derived accessor.

- [ ] **Step 1: Write the failing test** — for each locale id `['en','it','ro','de','fr','zh']`: `locale.setLang(id)`, then for each of the 16 keys assert `get(_)(key) !== key` and `get(_)(key).length > 0`. (Note: `photoName` includes `{n}` — assert it contains `'{n}'`.)

- [ ] **Step 2: Run → FAIL** (`pnpm exec vitest run tests/unit/glossary-puzzle-locale.test.js`).

- [ ] **Step 3: Add all 16 keys to all 6 locales** from the spec §7 table, matching each language's existing tone.

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit** — `git commit -m "feat(glossary-puzzle): image UX locale strings"`

---

## Task 3: Image model (`images.js`) — categories, VMs, merge

**Files:**
- Modify: `src/lib/glossary-puzzle/images.js`
- Create: `tests/unit/glossary-puzzle-images.test.js`
- Modify: `tests/unit/glossary-puzzle.test.js` only if counts shift here (they should not: `blippi → shows` is a rename, category count stays 5).

**Interfaces:**
- Produces:
  - `CATEGORY_ORDER = ['myPhotos','nature','animals','food','adventure','vehicles','shows']`
  - `CATEGORY_META = { myPhotos: '⭐', nature: '🌿', adventure: '🧭', food: '🍎', animals: '🐾', vehicles: '🚌', shows: '🧢' }`
  - `photoToVM(record, t): ImageVM` — `{ id: 'photo:' + record.id, name: t('photoName', { n: record.seq }), category: 'myPhotos', icon: '⭐', file: URL.createObjectURL(record.blob), thumb: URL.createObjectURL(record.thumb), source: 'photo' }`
  - `revokeVM(vm)` — revokes `file` + `thumb` when `vm.source === 'photo'`
  - `buildImageList(builtins = PUZZLE_IMAGES, photoVMs = []): ImageVM[]` — pure ordering: photo VMs first; builtins grouped by `CATEGORY_ORDER`, original relative order inside a category; unknown categories appended last; builtin VMs get `source: 'builtin'` and `thumb: img.file`
- Consumes: nothing new.

- [ ] **Step 1: Rename the category** — the two Blippi entries become `category: 'shows'`; `CATEGORY_META` swaps `blippi` for `shows` and gains `myPhotos`/`vehicles`. (`getCategories()` keeps its existing signature/behavior — old gallery and unit tests must not break yet.)

- [ ] **Step 2: Write the failing test** — `tests/unit/glossary-puzzle-images.test.js`:
  - every `category` in `PUZZLE_IMAGES` is a key of `CATEGORY_META`; every `CATEGORY_ORDER` entry is in `CATEGORY_META`; `CATEGORY_ORDER[0] === 'myPhotos'`.
  - `buildImageList(allBuiltins, [fakePhotoVM])` → first element is the photo; a `shows` image keeps relative order relative to other `shows` images; an unknown-category entry lands after all known categories.
  - `photoToVM` maps id/name/category/icon and calls `URL.createObjectURL` twice — stub `URL.createObjectURL`/`URL.revokeObjectURL` with `vi.spyOn`/`vi.stubGlobal`; `revokeVM` revokes both; `revokeVM` on a builtin VM revokes nothing.

- [ ] **Step 3: Run → FAIL**, implement Step 1's functions, **run → PASS**.

- [ ] **Step 4: Run `pnpm test`** — existing `glossary-puzzle.test.js` (`5 categories`, capitalized names) must stay green.

- [ ] **Step 5: Commit** — `git commit -m "feat(glossary-puzzle): merged image model (categories, photo VMs, ordering)"`

---

## Task 4: Photos subsystem (`photos.js`) + `resolveImage`

**Files:**
- Create: `src/lib/glossary-puzzle/photos.js`
- Modify: `src/lib/glossary-puzzle/images.js` (add `resolveImage`)
- Create: `tests/unit/glossary-puzzle-photos.test.js` (pure helpers only)

**Interfaces:**
- Produces (photos.js):
  - `PHOTO_LIMIT = 30`, `MAX_PHOTO_BYTES = 50 * 1024 * 1024`
  - `class PhotoError extends Error { code: 'decode'|'limit'|'quota' }`
  - `fitDims(w, h, maxEdge) → { w, h }` — pure; scales so `max(w,h) <= maxEdge`, never upscales.
  - `canAdd({ count, bytes }, fileBytes) → boolean` — pure; `count < PHOTO_LIMIT && bytes + fileBytes <= MAX_PHOTO_BYTES`.
  - `addPhotoFromFile(file) → Promise<PhotoRecord>` — throws `PhotoError`; `PhotoRecord = { id, seq, blob, thumb, w, h, createdAt }`
  - `listPhotos() → Promise<PhotoRecord[]>` (ascending `createdAt`), `getPhoto(id)`, `deletePhoto(id)`, `photosStats() → Promise<{ count, bytes }>`
- Produces (images.js): `resolveImage(id, t = (k) => k) → Promise<ImageVM | null>` — builtin hit returns the builtin VM synchronously-wrapped; `photo:<uuid>` → `getPhoto` → `photoToVM`; else `null`.
- Consumes: `photoToVM` (Task 3).

- [ ] **Step 1: Write the failing unit test** — `fitDims(1600, 1200, 1600)` → `{1600,1200}`; `fitDims(3200, 2400, 1600)` → `{1600,1200}`; `fitDims(300, 200, 1600)` → unchanged; portrait case. `canAdd` at 29 photos with a 1MB file → true; at 30 → false; bytes just over → false. `new PhotoError('decode')` has `.code`.

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `photos.js`.** Pin these internals:
  - DB: `indexedDB.open('kids-games-photos', 1)`, `onupgradeneeded` creates object store `photos` (keyPath `id`).
  - `id`: `crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)`.
  - `seq = (await photosStats()).count + 1`.
  - Decode chain (pin — Safari/EXIF is the reason):
    ```js
    async function decode(file) {
      if (typeof createImageBitmap === 'function') {
        try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
        catch { try { return await createImageBitmap(file); } catch {} }
      }
      return await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
        img.src = url;
      });
    }
    ```
  - Draw: `canvas.getContext('2d').drawImage(src, 0, 0, w, h)` where `(w, h) = fitDims(src.width ?? naturalWidth, …, 1600)`; `canvas.toBlob(cb, 'image/jpeg', 0.85)` (promise-wrapped — `toBlob` can yield `null`, treat as decode error); same with `400` / `0.8` for the thumb. Free the bitmap (`bitmap.close?.()`).
  - Caps: after decode, compute blob+thumb sizes and `canAdd(stats, size)` — else `PhotoError('limit')`. IDB write failures classified `quota` when `err.name` matches `/quota/i`, else rethrow.
  - `resolveImage` in `images.js` imports `getPhoto` from `./photos.js` and `photoToVM` locally.

- [ ] **Step 4: Run unit test → PASS; run `pnpm test` → green.**

- [ ] **Step 5: Commit** — `git commit -m "feat(glossary-puzzle): on-device photo store + pipeline"`

---

## Task 5: Content — 12 stock photos, 5 character SVGs, how-to doc

**Files:**
- Create: `static/puzzles/<slug>.jpg` ×12, `static/puzzles/characters/vc-*.svg` ×5
- Modify: `src/lib/glossary-puzzle/images.js` (entries with provenance comments)
- Modify: `tests/unit/glossary-puzzle.test.js` (`10 images` → `27`; `5 categories` → `6`)
- Create: `docs/how-to-add-puzzle-images.md`

**Interfaces:**
- Produces: 17 new `PUZZLE_IMAGES` entries (below); category `vehicles` now non-empty.
- Consumes: nothing.

Stock entries (search Pixabay/Pexels/Unsplash for each theme; 4:3 crop; long edge ≥800px shipped; **≤100KB**; tune with `sips -Z 800 -s format jpeg -s formatOptions 70 <in> --out static/puzzles/<slug>.jpg`; one comment line per entry with the source URL):

| id | name | category | icon | file |
|---|---|---|---|---|
| dinosaurs | Dinosaurs | animals | 🦖 | dinosaurs.jpg |
| puppy | Puppy | animals | 🐶 | puppy.jpg |
| kitten | Kitten | animals | 🐱 | kitten.jpg |
| sea-turtle | Sea Turtle | animals | 🐢 | sea-turtle.jpg |
| butterfly | Butterfly | nature | 🦋 | butterfly.jpg |
| rainbow | Rainbow | nature | 🌈 | rainbow.jpg |
| fruits | Fruits | food | 🍓 | fruits.jpg |
| cupcakes | Cupcakes | food | 🧁 | cupcakes.jpg |
| fire-truck | Fire Truck | vehicles | 🚒 | fire-truck.jpg |
| digger | Digger | vehicles | 🚜 | digger.jpg |
| rocket | Rocket | adventure | 🚀 | rocket.jpg |
| pirate-ship | Pirate Ship | adventure | 🏴‍☠️ | pirate-ship.jpg |

Character SVGs (authored originals — NOT copies of branded shows) — `static/puzzles/characters/`: `vc-train.svg` (Train Buddy 🚂), `vc-bus.svg` (Bus Buddy 🚌), `vc-monster-truck.svg` (Monster Truck 🛻), `vc-fire-engine.svg` (Fire Engine 🚒), `vc-digger.svg` (Digger Buddy 🚜). All: `viewBox="0 0 800 600"`, category `vehicles`, flat style — rounded shapes, thick forms, a cute face (two dot eyes + smile arc) on the vehicle body, two-tone background (pastel sky band ~⅔, ground band ~⅓) plus 2–3 clouds/dots so jigsaw piece edges are readable; palette from app accents (`#4FC3F7`, `#FFD54F`, `#EF5350`, `#66BB6A`) + neutrals.

How-to doc outline (short): 1) drop the file in `static/puzzles/`, 2) add the entry to `PUZZLE_IMAGES` (id/name/category/icon/file + source comment), 3) `pnpm test`, 4) `pnpm build` and commit `public/` (built copies are tracked), 5) note for owner-supplied show images: comment `supplied by the project owner (personal use)` like Blippi.

- [ ] **Step 1: Source/author all 17 assets**; verify each JPG ≤100KB and each SVG opens standalone in a browser.
- [ ] **Step 2: Add the 17 entries** to `images.js` with provenance comments; keep entries adjacent to their category's existing entries.
- [ ] **Step 3: Update the two literal counts** in `tests/unit/glossary-puzzle.test.js`.
- [ ] **Step 4: `pnpm test` → green.**
- [ ] **Step 5: Smoke-check in dev** — `pnpm dev`, open `/games/glossary-puzzle/play/3?image=vc-train` and one new photo: board ghost + pieces render (SVG-in-SVG check; if a character SVG fails to render on **iPhone Safari** it was verified here in Chrome — flag for Task 11 manual checklist).
- [ ] **Step 6: Commit** — `git commit -m "feat(glossary-puzzle): grow the puzzle library (12 photos, 5 character illustrations)"`

---

## Task 6: `PreviewOverlay.svelte`

**Files:**
- Create: `src/lib/glossary-puzzle/PreviewOverlay.svelte`

**Interfaces:**
- Props: `{ image, level, onclose }` — `image: ImageVM`, `level: number`, `onclose: () => void`.
- Consumes: `levelConfig` + `BigButton` + `loadPuzzleSounds`/`playPickup`.
- Produces (DOM contract for e2e): root `.gp-preview` (fixed overlay, z-index 60, backdrop click closes), `.gp-preview-close` (≥44px), `.gp-preview-img`, `.gp-preview-name`, `.gp-preview-pill` (`$_('level') n · $_('pieces', {n})`), `.gp-preview-grid` (square grid of `cols × rows` lines from `levelConfig(level)` as inline SVG, pointer-events none, one fade-in/out keyframe loop), `.gp-preview-start` (`BigButton href={/games/glossary-puzzle/play/${level}?image=${encodeURIComponent(image.id)}}`, label `▶ $_('start')`).

- [ ] **Step 1: Implement the component** per the contract. On mount: `loadPuzzleSounds()` then `playPickup()` once. Backdrop click: close only when the event target is the root.
- [ ] **Step 2: `pnpm check` → no errors.**
- [ ] **Step 3: Commit** — `git commit -m "feat(glossary-puzzle): full-picture preview overlay"`

---

## Task 7: `ParentGate.svelte` + `PhotosManager.svelte`

**Files:**
- Create: `src/lib/glossary-puzzle/ParentGate.svelte`
- Create: `src/lib/glossary-puzzle/PhotosManager.svelte`

**Interfaces:**
- ParentGate props: `{ onpass }`; default slot = the card content. DOM: `.gp-gate` (touch-action none, user-select none, `-webkit-touch-callout: none`), `.gp-gate-ring` (SVG ring whose `stroke-dashoffset` tracks hold progress). Pin: `HOLD_MS = 3000`; a `requestAnimationFrame` loop from document delta; `pointerup`/`pointercancel`/`pointerleave` reset to 0 and cancel; fires `onpass()` exactly once when progress ≥ 1 (then resets).
- PhotosManager props: `{ onclose }` — `onclose(changed: boolean)`. DOM: `.gp-photos-manager` (fixed overlay, z-index 70), `.gp-photos-close`, `.gp-photos-add`, hidden `.gp-photos-input` (`type="file" multiple accept="image/*"`), `.gp-photo-item` per photo with `.gp-photo-del` (aria-label `$_('deletePhoto')`), `.gp-photos-note` (`$_('photoStorageNote')`), `.gp-photos-error` (single line, cleared on next successful add), `.gp-photos-empty` (`$_('noPhotos')`).
- Consumes: `listPhotos`, `addPhotoFromFile`, `deletePhoto`, `PhotoError` (Task 4); locale keys (Task 2).

- [ ] **Step 1: Implement PhotosManager** — on mount `listPhotos()`; add flow: for each file `try { await addPhotoFromFile(f); changed = true } catch (e) { error = $_('photoError' | 'photoLimit') }` (map `e.code`; `quota` → `photoLimit`), continue past failures, re-list at the end; delete → `deletePhoto(id)` + re-list, `changed = true`; close → `onclose(changed)`.
- [ ] **Step 2: Implement ParentGate** per contract.
- [ ] **Step 3: `pnpm check` → no errors.**
- [ ] **Step 4: Commit** — `git commit -m "feat(glossary-puzzle): parent gate + photos manager"`

---

## Task 8: Gallery rework (shelf, chips, badges, Continue card, preview + gate wiring)

**Files:**
- Modify: `src/routes/games/glossary-puzzle/+page.svelte`
- Modify: `tests/e2e/glossary-puzzle.test.js` (two tests that encode the old interaction)

**Interfaces:**
- Consumes: everything above.
- Produces (DOM contract): chips `.gp-cat-btn[data-cat]` (All first, then `myPhotos` always, then non-empty categories in `CATEGORY_ORDER`); cards `button.gp-image-card[data-id]` with `.gp-thumb` (`<img>`, 4:3, lazy) + `.gp-thumb-name` + optional `.gp-badge-check` / gold `.gp-badge-gold` (aria-label `$_('solved')`); Continue card keeps class `.gp-resume-btn` (thumb + ring + `placed/total`); My Photos view shows `.gp-lock-card` (wraps ParentGate, content: 🔒 + `$_('addPhotos')` + `$_('holdToAdd')`) with the grid after it; `noPhotos` empty text when none.

- [ ] **Step 1: Rework the page script** — state: `images`, `ownedVMs`, `activeCat='all'`, `previewImage=null`, `managerOpen=false`, `solvedMap`, `save`; `refresh()`: `listPhotos()` → `photos.map(r => photoToVM(r, get(_)))` (revoke previous `ownedVMs` first) → `buildImageList(PUZZLE_IMAGES, photoVMs)`; resolve Continue: VM lookup by `save.imageId`, `clearSave()` when missing; `piecesTotal = cols*rows` from `levelConfig(save.level)`; on destroy revoke `ownedVMs`. Keep LadderBar, `?level=`, `stashHandoff` + `goto` resume logic as-is.
- [ ] **Step 2: Rework the markup** per DOM contract; card click sets `previewImage`; PreviewOverlay `Start` handles navigation (href); `onclose` of overlay clears `previewImage`; manager `onclose(changed)` → close + `refresh()` when changed.
- [ ] **Step 3: Update the two existing e2e tests**:
  - `image cards carry the selected level`: click the first card → `.gp-preview` visible → `.gp-preview-start` href matches `/\/play\/4\?image=/` → close.
  - `category filter works`: click `.gp-cat-btn[data-cat="nature"]` → each visible `.gp-image-card` has `data-cat="nature"`.
- [ ] **Step 4: Run the file** — `pnpm exec playwright test tests/e2e/glossary-puzzle.test.js` → green (this builds the app itself).
- [ ] **Step 5: Run `pnpm test`** → green.
- [ ] **Step 6: Commit** — `git commit -m "feat(glossary-puzzle): preview-first shelf, chips, badges, continue card"`

---

## Task 9: Play routes — async photo resolution (consume-once resume preserved)

**Files:**
- Modify: `src/routes/games/glossary-puzzle/play/[level]/+page.svelte`
- Modify: `src/routes/games/glossary-puzzle/play/+page.svelte`

**Interfaces:**
- Consumes: `resolveImage`, `photoToVM`/`revokeVM`.
- Produces: board renders for `?image=photo:<uuid>`; quick-blank (no spinner) while resolving; unknown/deleted id → existing rotation fallback; `<link rel="preload">` only when the final image is builtin.

**Critical pin — resume consume-once:** `takeHandoff()`/`restorePlaced()` must run exactly once per navigation, and the board must not mount before the image is resolved, or a photo resume will mount with the builtin fallback and never remount (the `{#key}` is the URL, which does not change). Structure for `play/[level]`:

```js
let state = $state({ image: null, initialPlaced: null, ready: false });

$effect(() => {
  const href = $page.url.href;
  let alive = true;
  (async () => {
    const params = new URL(href).searchParams;
    const requested = params.get('image');
    const lvl = Math.min(MAX_LEVEL, Math.max(1, parseInt($page.params.level, 10) || 1));
    const resume = params.get('resume') === '1';
    const vm = requested?.startsWith('photo:') ? await resolveImage(requested, get(_)) : null;
    if (!alive) return;
    const image = vm
      ?? PUZZLE_IMAGES.find(i => i.id === requested)
      ?? PUZZLE_IMAGES[(lvl - 1) % PUZZLE_IMAGES.length];
    const initialPlaced = resume
      ? restorePlaced({ handoff: takeHandoff(), stored: readSave(), imageId: image?.id, level: lvl })
      : null;
    state = { image, initialPlaced, ready: true };
  })();
  return () => { alive = false; revokeVM(state.image); }; // cancel stale resolution
});
```

Render the board only when `state.ready && state.image`, still wrapped in `{#key $page.url.href}`. `play/+page.svelte` gets the same treatment adapted to its existing precedence (saved → param → redirect), keeping `clearSave()` behavior and `saved.placedIds` as `initialPlaced` when the saved image resolves; a save whose photo no longer resolves falls back to the param image (or redirects) — never crashes.

- [ ] **Step 1: Rewrite `play/[level]/+page.svelte`** per pin.
- [ ] **Step 2: Rewrite `play/+page.svelte`** per pin.
- [ ] **Step 3: Run existing e2e** — `pnpm exec playwright test tests/e2e/glossary-puzzle.test.js` → green (builtin everything: rotation, resume, place-debug, next level).
- [ ] **Step 4: `pnpm check`** → clean.
- [ ] **Step 5: Commit** — `git commit -m "feat(glossary-puzzle): play routes resolve on-device photos"`

---

## Task 10: E2E suite for the new flows + fixtures

**Files:**
- Create: `tests/fixtures/photo.png` (generate: `sips -Z 64 static/screenshots/paint.png --out tests/fixtures/photo.png`), `tests/fixtures/not-a-photo.bin` (`printf 'not an image' > tests/fixtures/not-a-photo.bin`)
- Create: `tests/e2e/glossary-puzzle-photos.test.js`

**Interfaces:**
- Consumes: DOM contracts from Tasks 6–9; `?place=` + `?debug=1` seam (existing); localStorage keys `glossary-puzzle-save`, `glossary-puzzle-solved`.

Tests (one `test.describe('Glossary Puzzle — My Photos')`; drive the gate with raw pointer events like the existing `GP-touch-pickup` test — `pointerdown` on `.gp-lock-card`, wait, `pointerup`):

- [ ] **Step 1: Add the six tests:**
  1. **gate timing** — 1s hold on `.gp-lock-card` → `.gp-photos-manager` hidden; 3.2s hold → visible.
  2. **add + play** — gate open; `setInputFiles` on `.gp-photos-input` with the PNG → one `.gp-photo-item`; close manager; click the chip `.gp-cat-btn[data-cat="myPhotos"]`; card `[data-id^="photo:"]` visible; click it → `.gp-preview` + `.gp-preview-start` href `/\/play\/1\?image=photo/`; capture the href, extract the id.
  3. **error file** — add `not-a-photo.bin` → `.gp-photos-error` visible, `.gp-photo-item` count unchanged.
  4. **resume with a photo** — with the photo added, `goto('/games/glossary-puzzle/play/1?image=' + id + '&place=0-0&debug=1')` → HUD `1/4`; back to gallery → `.gp-resume-btn` visible → click → URL has `resume=1` → HUD `1/4`.
  5. **badge ✓ + gold** — solve L1 for the photo via `place=0-0,0-1,1-0,1-1&debug=1` → win overlay → gallery: `[data-id="<id>"] .gp-badge-check` visible. Then seed `localStorage` `glossary-puzzle-solved` `{"garden":10}` and open `/games/glossary-puzzle?level=10` → `.gp-badge-gold` on the garden card.
  6. **deleted-photo save clears gracefully** — photo + save from test 4 state; open manager, `.gp-photo-del` → close; gallery → no `.gp-resume-btn`, no crash; `/play/1?image=<deleted>&resume=1` → board renders the fallback image, save cleared.
- [ ] **Step 2: Run the new file** — `pnpm exec playwright test tests/e2e/glossary-puzzle-photos.test.js` → green (repeat flaky timing tests; retries are playbook-default).
- [ ] **Step 3: Run the FULL e2e suite** — `pnpm test:e2e` → green (this catches any unknown test that touched changed behavior).
- [ ] **Step 4: Commit** — `git commit -m "test(glossary-puzzle): e2e for gate, photos, preview, badges, resume"`

---

## Task 11: Docs, full gates, built-asset sync

**Files:**
- Modify: `CONTEXT.md` (Game glossary section)
- Modify: `public/**` via build (tracked built copies + `sw.js` precache)

- [ ] **Step 1: Update `CONTEXT.md`** — in "Glossary Puzzle (Jigsaw) Game": add **Preview Screen**, **My Photos** (parent-gated, on-device IndexedDB, per-device), **Solved Badge** (✓ at current level, 🎓 gold at level 10, key `glossary-puzzle-solved`), **Photo Pipeline** limits (1600px/400px, 30 photos/50MB); update the Blippi category to **Shows**; mention the merged image source (`resolveImage`: builtin → photo).
- [ ] **Step 2: Full gates** — `pnpm check && pnpm lint && pnpm test && pnpm test:e2e` all green.
- [ ] **Step 3: Build + verify precache** — `pnpm build`; `grep -c "puzzles/characters" public/sw.js` → ≥5; `grep -c "<slug>.jpg" public/sw.js` for 2–3 of the new stock files → ≥1 each.
- [ ] **Step 4: Commit built assets** — `git add CONTEXT.md static public && git commit -m "chore(glossary-puzzle): docs + rebuilt PWA assets"` (respect `.gitignore`: `public/_app` stays out).
- [ ] **Step 5: Human verification (not CI — hand to the owner):**
  - iPhone Safari: add a **HEIC** photo from the library → appears and plays.
  - Long-press the lock card on iPhone: ring fills, no iOS context-menu/callout appears; releasing early resets.
  - Airplane mode: reload the app offline → shelf, photos, and a builtin puzzle all work.
  - One full kid pass: shelf → preview → Start → solve → ✓ badge → Continue card.

---

## Self-Review (completed during writing)

- **Spec coverage:** §1 shelf → T8; §2 preview → T6/T8; §3 resume+badges → T1/T8; §4 photos subsystem → T4/T7/T8; §5 image model/routes → T3/T4/T9; §6 content + how-to → T5(+T11); §7 locales → T2; §8 file map → matches task Files lists; §9 testing → T10/T11; §10 edge cases → Review Focus + T4 caps + T8/T9 fallbacks (edge cases 1–3,5,6,7 have tests; 4,8,9,10 are handled by design + T11 human checklist).
- **Type consistency check:** `photo:<uuid>` id prefix consistent T3/T4/T9/T10; `photoToVM(record, t)` arity consistent T3/T4/T9; `badgeFor`/`recordSolved` names consistent T1/T8; class names in T6–T8 match T10 selectors; the My Photos category key is `myPhotos` everywhere — photo VM category (T3), chip `data-cat` (T8), e2e selector (T10).
- **Proportion:** plan ≈2× spec; code blocks limited to the pinned algorithms (decode chain, route load) and DOM contracts.
