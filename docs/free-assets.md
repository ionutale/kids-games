# Free Assets Guide

Inventory of every sound in this repo, plus curated free-license sites for future assets.

## Planned: Brain Trainers Asset Batch (2026-08)

The 4 brain trainers add a hybrid audio/art layer ([spec](superpowers/specs/2026-08-23-trainers-assets-design.md)).

**✅ Shipped 2026-08-23:**

| Asset | Source & license | Notes |
|-------|------------------|-------|
| `static/sounds/fanfare.mp3` | `jingles_NES00.ogg` — [Kenney "Music Jingles"](https://kenney.nl/assets/music-jingles), **CC0** | shared level-up sting; pitch-shifted per trainer via `playbackRate` |
| `static/sounds/music/focus-tap.mp3` | "Carefree" — Kevin MacLeod (incompetech.com), **CC-BY 4.0** | trimmed 28.5s, mono 96 kbps (~344 KB) |
| `static/sounds/music/quick-count.mp3` | "Fluffing a Duck" — Kevin MacLeod, **CC-BY 4.0** | same treatment |
| `static/sounds/music/speed-match.mp3` | "Life of Riley" — Kevin MacLeod, **CC-BY 4.0** | same treatment |
| `static/sounds/music/what-comes-next.mp3` | "Bright Wish" — Kevin MacLeod, **CC-BY 4.0** | 26s @ ~121 kbps (~393 KB) |
| `static/art/trainers/{trainer}/win-badge.png`, `hero-star.png` | [Kenney "UI Pack"](https://kenney.nl/assets/ui-pack), **CC0** | Red/Yellow/Blue/Green star variants per trainer |

> **Attribution (required by CC-BY):** Music by Kevin MacLeod ("Carefree", "Fluffing a Duck", "Life of Riley", "Bright Wish"), licensed under CC BY 4.0. Tracks converted to mono loops for in-app background playback.

## Audio Inventory (this repo)

No songs/background music exist yet — only short SFX mp3s and Web Audio synthesized tones.

### MP3 Files

| File | `static/sounds/` | `public/sounds/` | Size | Purpose |
|------|------------------|------------------|------|---------|
| `tap.mp3` | ✅ | ✅ | 8K | generic tap |
| `pickup.mp3` | ✅ | ✅ | 24K | puzzle piece pickup — cardboard slide "shff" |
| `drag-loop.mp3` | ✅ | ✅ | 20K | continuous cardboard friction while dragging (looped at low volume) |
| `snap.mp3` | ✅ | ✅ | 10K | puzzle piece seating — small wood click |
| `nudge.mp3` | ✅ | ✅ | 223K | idle nudge hint |
| `victory.mp3` | ✅ | ✅ | 49K | win jingle |
| `kids-cheer.mp3` | ✅ | ❌ **missing** | 89K | win cheer |

**Known gap:** `public/sounds/kids-cheer.mp3` does not exist. It is fetched at runtime by
`playWinCheer()` (`src/lib/sounds/audioManager.js:59`) from `/sounds/kids-cheer.mp3`. If `public/`
is what gets served, the cheer silently falls back to the synthesized win tone. Copy the file from
`static/sounds/` to fix.

`static/sounds/` is the SvelteKit source dir; `public/sounds/` is produced by the static build
(`npm run build` copies it) — add new files to `static/sounds/` only.

### Sound Sources & Credits

All SFX are CC0 / license-free; sources recorded for provenance (no attribution required):

- `pickup.mp3` — ["Cardboard_Slide_01"](https://freesound.org/people/BenDrain/sounds/487850/) by BenDrain (Freesound, CC0)
- `drag-loop.mp3` — ["Dragging Cardboard Box"](https://freesound.org/people/IENBA/sounds/864763/) by IENBA (Freesound, CC0), trimmed to a steady 2.5s segment with seam fades
- `snap.mp3` — ["Small Wood Piece Sound"](https://freesound.org/people/qubodup/sounds/822567/) by qubodup (Freesound, CC0)
- `tap.mp3`, `nudge.mp3`, `victory.mp3`, `kids-cheer.mp3` — Mixkit CC0 (original set)

To swap any sound for a better recording: replace the mp3 in `static/sounds/` keeping the same
filename — no code changes needed.

### Synthesized Sounds (Web Audio API)

All live in `src/lib/sounds/audioManager.js` — no files needed, generated via oscillators.

| Export | Sound | Details |
|--------|-------|---------|
| `playTap()` | tap | 600 Hz sine, 80 ms |
| `playPop()` | pop | 400→600 Hz sine pair, 60 ms apart |
| `playMatch()` | match chime | C5-E5-G5 arpeggio (523/659/784 Hz) |
| `playWin()` | win scale | C5-D5-E5-G5-A5-C6, 6 notes × 80 ms |
| `playWinCheer()` | kids cheer | plays `kids-cheer.mp3`; falls back to `playWin()` if load fails |
| `playError()` | error buzz | 200 Hz sawtooth, 200 ms (used sparingly — repo policy is positive-only audio) |
| `playSplash()` | water splash | 5 random bubbles, 300–700 Hz sine |
| `playGoal()` | goal fanfare | `playWin()` + high triangle note |

Also exports `vibrate(pattern)` for haptic feedback (guarded).

### Puzzle Sound Loader

`src/lib/sounds/puzzleSounds.js:21-25` maps keys → mp3 URLs:

| Key | File |
|-----|------|
| `pickup` | `/sounds/pickup.mp3` |
| `snap` | `/sounds/snap.mp3` |
| `victory` | `/sounds/victory.mp3` |
| `nudge` | `/sounds/nudge.mp3` |
| `tap` | `/sounds/tap.mp3` |

## Free-License Source Sites

License rule of thumb for this repo: **prefer CC0** (zero bookkeeping). CC-BY is fine if you keep a
CREDITS file. Avoid CC BY-NC (non-commercial) and "royalty-free" sites that gate downloads behind
runtime licenses.

### Sound Effects

- [freesound.org](https://freesound.org) — huge community library; filter per-file license to CC0
- [pixabay.com/sound-effects](https://pixabay.com/sound-effects) — Pixabay license, no attribution, commercial-safe
- [zapsplat.com](https://zapsplat.com) — free with attribution (paid tier removes it); very kid-friendly SFX
- [mixkit.co/free-sound-effects](https://mixkit.co/free-sound-effects) — free license, no attribution

### Music / Songs

- [incompetech.com](https://incompetech.com) — Kevin MacLeod, CC-BY (attribution required); tons of playful tracks
- [freemusicarchive.org](https://freemusicarchive.org) — filter by CC0/CC-BY
- [pixabay.com/music](https://pixabay.com/music) — no-attribution royalty-free tracks
- [opengameart.org](https://opengameart.org) — game-focused, mostly CC0/CC-BY; good chiptune/8-bit packs
- [kenney.nl/assets](https://kenney.nl/assets) — CC0 audio packs; ideal for kids games

### Images / Photos

- [pixabay.com/images](https://pixabay.com/images) — Pixabay license, no attribution
- [unsplash.com](https://unsplash.com) — Unsplash license, no attribution, high-quality photography
- [pexels.com](https://pexels.com) — Pexels license, no attribution

### Icons

- [iconify.design](https://iconify.design) — aggregator of 150+ open icon sets (MIT/CC0/Apache), one API
- [heroicons.com](https://heroicons.com), [lucide.dev](https://lucide.dev) — MIT, clean SVG sets
- [game-icons.net](https://game-icons.net) — 4000+ CC-BY game-themed SVG icons
- [icons8.com](https://icons8.com) / [flaticon.com](https://flaticon.com) — free tier requires attribution; paid removes it

### Sprites / 2D Game Art

- [kenney.nl/assets](https://kenney.nl/assets) — CC0, huge catalog (platformers, UI, emoji-style characters); safest choice
- [opengameart.org](https://opengameart.org) — CC0/CC-BY filterable; kid-friendly tilesets and sprites
- [itch.io/game-assets/free](https://itch.io/game-assets/free) — CC0/CC-BY filters; polished pixel art packs
- [craftpix.net/freebies](https://craftpix.net/freebies) — free tier, attribution-free per their license
- [openclipart.org](https://openclipart.org) — pure CC0 clipart/SVG

### 3D Meshes

- [polyhaven.com](https://polyhaven.com) — CC0 models, textures, HDRIs; top quality
- [quaternius.com](https://quaternius.com) — CC0 low-poly model packs; great for casual games
- [kenney.nl/assets](https://kenney.nl/assets) — CC0 3D kits
- [sketchfab.com](https://sketchfab.com) — downloadable filter by CC license; check each model
- [ambientcg.com](https://ambientcg.com) — CC0 textures/materials (pairs well with mesh sites)

## Code Pointers

- `src/lib/sounds/audioManager.js` — synthesized tones + kids-cheer playback + vibration
- `src/lib/sounds/puzzleSounds.js` — mp3 loader for the jigsaw game
- `src/lib/sounds/trainerSounds.js`, `src/lib/sounds/trainerMusic.js` — *planned* trainer synth SFX + Theme Loop loader (see spec above)
- `static/sounds/` — mp3 sources (add new files here first)
