# How to Add Puzzle Images

The glossary puzzle library lives in two places: the image files under
`static/puzzles/` and the entry list in `src/lib/glossary-puzzle/images.js`.
Adding a puzzle means touching both.

## 1. Drop the file in `static/puzzles/`

- Stock photos: `static/puzzles/<slug>.jpg`, cropped to **4:3** with the **long
  edge ≥ 800px** (880×660 is the shipped size) and **≤ 100 KB**.
- Character illustrations: `static/puzzles/characters/<slug>.svg` (flat style,
  `viewBox="0 0 800 600"`, self-contained — no external refs).
- Slug is lowercase kebab-case and matches the `id` in step 2.

Prepare a photo (macOS, using ImageMagick — already available):

```sh
# 4:3 center-crop at the shipped size and cap the file at 100 KB
magick raw.jpg -resize 880x660^ -gravity center -extent 880x660 \
  -strip -define jpeg:extent=100KB static/puzzles/<slug>.jpg

# verify
sips -g pixelWidth -g pixelHeight static/puzzles/<slug>.jpg
stat -f%z static/puzzles/<slug>.jpg   # must be ≤ 102400
```

`sips` alone works too: `sips -Z 900 in.jpg --out /tmp/p.jpg`, then
`sips -c 660 880 /tmp/p.jpg --out static/puzzles/<slug>.jpg`, then
`sips -s format jpeg -s formatOptions 65 static/puzzles/<slug>.jpg`.

## 2. Add the entry to `PUZZLE_IMAGES`

Append the entry next to its category's existing entries (the list is grouped by
category, and `buildImageList` re-sorts through `CATEGORY_ORDER` anyway):

```js
// Pexels (free license) #1234567 — https://www.pexels.com/photo/1234567/
{
  id: 'slug',
  name: 'Display Name',
  category: 'nature',            // nature | adventure | food | animals | vehicles | shows
  icon: '🦋',
  file: '/puzzles/<slug>.jpg',
  thumbEmoji: '🦋',
},
```

- Put a one-line provenance comment above the entry: the source page URL for
  stock art, or `original illustration authored for this project` for SVG art.
- `category` must be a key in `CATEGORY_META`; a brand-new category also needs
  an entry there and in `CATEGORY_ORDER`.
- The character SVGs live under `characters/` but use `category: 'vehicles'`.

## 3. `pnpm test`

```sh
pnpm test
```

If you added or removed images, update the two literal counts at the top of
`tests/unit/glossary-puzzle.test.js` (`has N images`, `has N categories`).

## 4. `pnpm build` and commit `public/`

```sh
pnpm build
```

Vite copies `static/puzzles/**` into `public/puzzles/**`, and those built copies
are tracked in git — commit the new files under `public/` along with the source
assets and `images.js`.

## 5. Owner-supplied show images

Branded show-character promo art is added only when the project owner supplies
it for personal use. Mark those entries with the same comment used for Blippi:

```js
// Show-character promo images supplied by the project owner (personal use).
```

Do not download branded characters yourself.
