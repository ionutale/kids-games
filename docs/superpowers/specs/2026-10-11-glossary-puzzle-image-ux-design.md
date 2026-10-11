# Glossary Puzzle — Image UX: pick → preview → My Photos

**Date:** 2026-10-11
**Status:** Approved design (brainstorming session)
**Game:** Glossary Puzzle — the image jigsaw (`/games/glossary-puzzle`)
**Audience:** ages 2–5, portrait phones, PWA, offline-capable, no backend

## Problem & Goals

The image jigsaw's pictures are its content and its interface, but today's journey is bare:

- The gallery is a flat 2-column grid of 1:1 center-cropped thumbnails; a kid never sees the full picture before committing, and small thumbs misrepresent the 4:3 board.
- The only resume affordance is a cryptic "▶ replay" button.
- The library is 10 fixed photos; nothing personal, nothing new without a developer.
- Nothing shows which pictures are already solved.

**Goal:** make picking a picture delightful and safe for a pre-reader, let the family's own photos become puzzles, and keep the library growing — without a backend.

## Decisions locked in brainstorming

1. **Tap card → full-picture preview overlay → giant ▶ Start.** No accidental starts; the kid sees the complete target image first. (Matches the app-wide "landing hero + Play" pattern.)
2. **Shelf stays a 2-column grid**, but thumbnails become **4:3 (true board ratio)** and categories stay emoji-first, wrapping.
3. **My Photos**: a parent adds phone photos via a 3s long-press gate; photos are downscaled on-device and stored in IndexedDB; they play exactly like built-in images.
4. **Content**: ~10–14 curated stock photos; 5 authored SVG "vehicle characters" (CC0-safe originals, not branded-show copies); owner-supplied real characters committed like Blippi (accepted: repo is public).
5. **Solved badges**: ✓ per picture solved at the current level; gold rim + 🎓 at level 10.
6. **Resume skips the preview**: the Continue card jumps straight back onto the board.
7. **YAGNI cuts**: no backend/sync, no photo renaming, no filters/stickers, no per-card difficulty picker, no stars beyond ✓/🎓, no import-from-URL.

## 1. Shelf (gallery page)

`src/routes/games/glossary-puzzle/+page.svelte`

- Category chip row (wrap, emoji-first): **All · My Photos ⭐ · Nature 🌿 · Animals 🐾 · Food 🍎 · Adventure 🧭 · Vehicles 🚌 · Shows 🧢** — only categories that have images, plus All/My Photos always. Tapping the active chip returns to All.
- "My Photos" chip is **always visible** (it is the only door into the parent flow). The add-photo card lives inside the My Photos category view.
- Cards: 2-column grid, **4:3 thumbnail** (`<img loading="lazy" decoding="async">`), name small under the thumb. Badge overlays:
  - `check` → small ✓ badge (top-right).
  - `gold` → gold border + 🎓 badge.
- **Continue card** at the top when a save exists: picture thumb + progress ring + `placed/total` (total = `cols*rows` from `levelConfig(save.level)`), tap → straight to the board (`?resume=1` handoff, existing flow). If the saved image no longer resolves (deleted photo), `clearSave()` and skip the card — never crash.
- Category labels come from the locale store (keys in §7); fallback to capitalized key.
- Card tap → open **Preview overlay** (§2).

## 2. Preview overlay

`src/lib/glossary-puzzle/PreviewOverlay.svelte` (gallery-internal; no new route)

- Full-bleed overlay: complete uncropped image on a soft backdrop; name in big friendly type.
- A faint **grid tease**: `levelConfig(level)` cols/rows drawn as a simple square-grid SVG (not the jigsaw piece paths) fading in/out once.
- Pill: `Level {n} · {pieces} pieces` (parents/older kids).
- Primary action: **▶ Start** (localized), a `<BigButton href>` to `/games/glossary-puzzle/play/{level}?image={encodeURIComponent(id)}`. Close via big ✕ or backdrop tap.
- Sound: `playPickup()` once when the overlay opens (gallery loads the puzzle sound module on first open).

## 3. Resume & solved badges

- Resume flow unchanged underneath (`readSave`/`stashHandoff`/`restorePlaced`), new presentation only (§1).
- New `src/lib/glossary-puzzle/solved.js`:
  - localStorage key `glossary-puzzle-solved` → `{ [imageId]: highestLevelSolved }`.
  - `loadSolved()`, `recordSolved(imageId, level)` (stores `max(prev, level)`), `badgeFor(solvedMap, imageId, currentLevel)` → `'none' | 'check' | 'gold'`, evaluated in order: `gold` when `highest >= MAX_LEVEL`, else `check` when `highest >= currentLevel`, else `none`.
- `PuzzleBoard.svelte`: `startCelebration()` additionally calls `recordSolved(image.id, level)` (one-line change; board is otherwise untouched).

## 4. My Photos subsystem

### Parent gate

`src/lib/glossary-puzzle/ParentGate.svelte` — a wrapped target that reports `onpass` only after a **3-second continuous press**; ring progress fills during the hold; releases/cancels reset. `preventDefault`, `-webkit-touch-callout: none`, `user-select: none` so iOS does not pop a context menu.

Entry points: the 🔒 add-photo card inside My Photos (label: `addPhotos` + `forGrownUps`/`holdToAdd`). Passing the gate opens the Photos Manager.

### Photos Manager

`src/lib/glossary-puzzle/PhotosManager.svelte` — modal panel (gated parent surface):

- **＋ addPhotos** → hidden `<input type="file" accept="image/*" multiple>` (no forced `capture`; OS offers camera/library).
- Photo list: thumbs + ✕ per photo (`deletePhoto` aria-label).
- Line: `photoStorageNote` ("Photos stay on this device only").
- Errors shown inline (non-fatal): `photoError` (decode), `photoLimit` (count/bytes cap), multi-file adds continue past failures.

### Storage & pipeline

`src/lib/glossary-puzzle/photos.js` — IndexedDB DB `kids-games-photos`, version 1, object store `photos` (keyPath `id`).

```
PhotoRecord = { id, seq, blob, thumb, w, h, createdAt }
id: crypto.randomUUID() with Date+random fallback
seq: creation sequence number, used for the localized display name (name = $_('photoName', {n: seq}))
```

- `addPhotoFromFile(file)` — decode → EXIF-orient → fit longest edge **1600px** → JPEG q0.85 as `blob`; thumb longest edge **400px** q0.8. Decode order: `createImageBitmap(file, {imageOrientation:'from-image'})` → `createImageBitmap(file)` → `HTMLImageElement`. Errors throw typed codes: `decode | limit | quota`.
- Caps: **30 photos** and **~50MB total**; enforced before insert; rejected adds surface `photoLimit`.
- `listPhotos()`, `getPhoto(id)`, `deletePhoto(id)`, `photosStats()`.
- iPhone HEIC works because Safari hands the file input a JPEG; undecodable files get `photoError`.

## 5. Image model, resolution, save/resume

`src/lib/glossary-puzzle/images.js`

- `PUZZLE_IMAGES` — builtin entries; category `blippi` renamed to **`shows`**; new stock + vehicle-character entries added (all new files under `static/puzzles/`, descriptive slugs).
- `CATEGORY_META` — `myPhotos:'⭐', nature:'🌿', animals:'🐾', food:'🍎', adventure:'🧭', vehicles:'🚌', shows:'🧢'`.
- `CATEGORY_ORDER` — `['myPhotos', 'nature', 'animals', 'food', 'adventure', 'vehicles', 'shows']`; drives both the chip row (§1) and `buildImageList`.
- ImageVM (one shape for builtin and photos):
  ```
  { id, name, category, icon, file, thumb, source: 'builtin'|'photo' }
  builtin id: 'garden' …            file/thumb: '/puzzles/….jpg|svg'
  photo  id: `photo:${uuid}`        file/thumb: session object URLs
  ```
- `photoToVM(record, t)` creates the object URLs; `revokeVM(vm)` revokes when `source === 'photo'`.
- `buildImageList(builtins, photoVMs)` — pure ordering: My Photos first when non-empty, then category order, builtin order within category (unit-testable).
- `resolveImage(id)` — builtin → `getPhoto` → `null`.

Pages:

- **Gallery**: on mount, async `listPhotos()` → VMs → `buildImageList`; re-refresh after the manager closes; revoke owned URLs on destroy.
- **Play pages** (`play/[level]`, `play`): replace sync `PUZZLE_IMAGES.find` with async `resolveImage(requestedId)`; while resolving render a light loading state; unknown/deleted id → existing rotation fallback (`PUZZLE_IMAGES[(level−1) % len]`); revoke photo URLs on destroy; `<link rel="preload">` only for builtin files. The resume first-mount decision (`restorePlaced`) runs once when the image first resolves, same semantics as today.
- **Save**: stores `imageId`; photo ids are stable in IndexedDB, so cross-session resume works. A save pointing at a deleted photo is cleared gracefully (§1).

## 6. Content plan

- **Stock (~10–14)**: themes — dinosaurs 🦕, farm animals, sea animals, real vehicles, fruits/food, space, seasons, toys. Criteria: one clear subject, strong shapes/contrast (jigsaw-readable at 5×5+), 4:3-ish, ≥1200px source, ≤100KB shipped. Sources: Pixabay/Pexels/Unsplash; each entry gets a source-URL comment in `images.js` like today.
- **Vehicle characters (5)**: train, bus, monster truck, fire engine, digger — authored **flat SVG originals** in `static/puzzles/characters/` (e.g. `vc-train.svg`, 800×600 viewBox, rounded shapes, bright palette, friendly faces). Originals only — not copies of Bob the Train/Pinkfong/Gecko's Garage. SVGs render natively in the board background and the SVG pieces, and stay crisp at every level. If authored art proves weak, fallback: CC0 packs (e.g. Kenney) — not branded characters.
- **Owner-supplied real characters**: files dropped into `static/puzzles/` (e.g. `11-<name>.jpg`) + one `PUZZLE_IMAGES` entry under `shows`, exactly like Blippi. Accepted: repo is public; entries get a "supplied by the project owner (personal use)" comment.
- **How-to**: `docs/how-to-add-puzzle-images.md` — drop file, add entry (name/category/icon), run tests — so adding an image is a 5-minute repeatable task.
- PWA precache picks up new `static/puzzles/**` automatically (glob includes jpg/png/svg); no config change.

## 7. Locale strings

Add to all 6 locales (`src/lib/stores/locale.js`), matching existing informal tone:

| key | en | it | ro | de | fr | zh |
|---|---|---|---|---|---|---|
| all | All | Tutto | Toate | Alle | Tout | 全部 |
| myPhotos | My Photos | Le mie foto | Fotografiile mele | Meine Fotos | Mes photos | 我的照片 |
| addPhotos | Add photos | Aggiungi foto | Adaugă poze | Fotos hinzufügen | Ajouter des photos | 添加照片 |
| forGrownUps | For grown-ups | Per i grandi | Pentru părinți | Für Erwachsene | Pour les grands | 给大人 |
| holdToAdd | Press and hold | Tieni premuto | Ține apăsat | Gedrückt halten | Appuie longuement | 长按 |
| start | Start | Inizia | Începe | Start | Commencer | 开始 |
| pieces | {n} pieces | {n} pezzi | {n} piese | {n} Teile | {n} pièces | {n} 块 |
| solved | Solved | Risolto | Rezolvat | Gelöst | Résolu | 已完成 |
| noPhotos | No photos yet | Ancora nessuna foto | Încă nicio poză | Noch keine Fotos | Pas encore de photos | 还没有照片 |
| photoName | My photo {n} | Foto {n} | Poza mea {n} | Foto {n} | Photo {n} | 我的照片 {n} |
| photoStorageNote | Photos stay on this device | Le foto restano su questo dispositivo | Pozele rămân pe acest dispozitiv | Fotos bleiben nur auf diesem Gerät | Les photos restent sur cet appareil | 照片仅保存在本设备上 |
| photoError | This photo can't be used | Questa foto non va bene | Poza nu poate fi folosită | Dieses Foto geht nicht | Cette photo ne marche pas | 这张照片不能使用 |
| photoLimit | Photo limit reached | Troppe foto | Prea multe poze | Foto-Limit erreicht | Limite de photos atteinte | 照片数量已达上限 |
| deletePhoto | Delete photo | Elimina foto | Șterge poza | Foto löschen | Supprimer la photo | 删除照片 |
| shows | Shows | Cartoni | Desene | Serien | Dessins | 动画 |
| adventure | Adventure | Avventura | Aventură | Abenteuer | Aventure | 探险 |

Existing keys reused: `resume`, `play`, `back`, `level`, `puzzleDone`, `nextLevel`, `playAgain`, `vehicles`, `nature`, `animals`, `food`.

## 8. Files touched

Create:

- `src/lib/glossary-puzzle/photos.js` — IndexedDB store + decode/downscale pipeline
- `src/lib/glossary-puzzle/solved.js` — per-image solved levels
- `src/lib/glossary-puzzle/ParentGate.svelte`
- `src/lib/glossary-puzzle/PhotosManager.svelte`
- `src/lib/glossary-puzzle/PreviewOverlay.svelte`
- `static/puzzles/characters/vc-*.svg` (5) + `static/puzzles/<slug>.jpg` (stock)
- `docs/how-to-add-puzzle-images.md`
- `tests/e2e/glossary-puzzle-photos.test.js`, `tests/fixtures/photo.png`, `tests/fixtures/not-a-photo.bin`
- `tests/unit/glossary-puzzle-solved.test.js`, `tests/unit/glossary-puzzle-images.test.js`

Modify:

- `src/routes/games/glossary-puzzle/+page.svelte` — full shelf UX
- `src/lib/glossary-puzzle/images.js` — categories, ImageVM, buildImageList, resolveImage, new entries
- `src/routes/games/glossary-puzzle/play/[level]/+page.svelte` + `play/+page.svelte` — async resolve
- `src/lib/glossary-puzzle/PuzzleBoard.svelte` — `recordSolved` only
- `src/lib/stores/locale.js` — §7 keys

Unchanged: `pieces.js`, `rendering.js` (SVG pieces already accept any image URL), `save.js` contract, `vite.config.js`.

## 9. Testing & acceptance

- **Unit (vitest)**: `solved.js` badge logic; `buildImageList` ordering (my-photos first, category order, builtin order); `photoToVM` mapping (pure part).
- **E2E (Playwright, existing config)**:
  1. Gate: short press does not open the manager; 3s press does.
  2. Add photo (fixture PNG) → My Photos chip + card appear; manager shows storage note; error fixture → `photoError` line, no record.
  3. Delete photo → card disappears.
  4. Preview → Start → board opens with the photo; seeded debug `?place=` completion still works with a photo id.
  5. Resume with a photo: place → Continue card (thumb + ring) → tap → board restored.
  6. Badge: complete → ✓ on the card; recorded level 10 → gold.
  7. Deleted-photo-with-live-save → gallery renders, save cleared, no crash.
- **Manual iPhone checklist**: HEIC add works; long-press gate shows no iOS callout; offline reload keeps photos and plays; thumbnails lazy-load.
- **Gates**: `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` all green; existing glossary-puzzle e2e untouched and passing.

**Done means:** a kid reaches Start in ≤2 taps from the shelf; a parent adds a phone photo in under a minute; photos survive restarts and offline; deep links and resume never break on a deleted photo.

## 10. Edge cases & risks

1. HEIC/undecodable file → typed `decode` error → `photoError`, no record, no crash.
2. Quota/limit mid-add → typed `limit|quota` error → `photoLimit`; cap checked before insert.
3. Deleted photo referenced by save/resume URL → graceful fallback (rotation) + `clearSave()`.
4. Object URL lifecycle → every page revokes what it creates on destroy.
5. iOS context menu on the 3s hold → prevented (callout CSS + preventDefault).
6. Multi-file partial failure → continue past failures, summarize.
7. `crypto.randomUUID` missing → fallback id.
8. Per-device reality: photos are local to each phone/browser; site-data clear wipes them (noted in the manager).
9. Public repo: owner-supplied show images are visible to everyone — owner-accepted; stock and authored art carry provenance comments.
10. Gallery scale (~45 cards worst case) → lazy `<img>`, small thumbs.

## 11. Out of scope

Backend/sync/sharing; photo renaming/filters/stickers/effects; per-card difficulty picker; stars beyond ✓/🎓; import from URL; video/GIF puzzles; localization of image names.
