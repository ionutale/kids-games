# Kids Games

26 touch games and 14 coloring papers for ages 2-5, inspired by McDonald's Italy in-store displays. Built as a PWA with SvelteKit.

## Games

### Creative

| | | | |
|---|---|---|---|
| <img src="static/screenshots/paint.png" width="150" alt="Paint"><br>**Paint** | <img src="static/screenshots/stickers.png" width="150" alt="Stickers"><br>**Stickers** | <img src="static/screenshots/splash.png" width="150" alt="Splash"><br>**Splash** | |

### Puzzles

| | | | |
|---|---|---|---|
| <img src="static/screenshots/memory.png" width="150" alt="Memory"><br>**Memory** | <img src="static/screenshots/puzzle.png" width="150" alt="Puzzle"><br>**Puzzle** | <img src="static/screenshots/glossary-puzzle.png" width="150" alt="Photo Puzzle"><br>**Photo Puzzle** | <img src="static/screenshots/sorting.png" width="150" alt="Sorting"><br>**Sorting** |
| <img src="static/screenshots/category-sort.png" width="150" alt="Category Sort"><br>**Category Sort** | <img src="static/screenshots/path-builder.png" width="150" alt="Path Builder"><br>**Path Builder** | | |

### Arcade

| | | | |
|---|---|---|---|
| <img src="static/screenshots/pop.png" width="150" alt="Pop"><br>**Pop** | <img src="static/screenshots/soccer.png" width="150" alt="Soccer"><br>**Soccer** | | |

### Quizzes

| | | | |
|---|---|---|---|
| <img src="static/screenshots/animal-quiz.png" width="150" alt="Animal Quiz"><br>**Animals** | <img src="static/screenshots/food-quiz.png" width="150" alt="Food Quiz"><br>**Food** | <img src="static/screenshots/vehicle-quiz.png" width="150" alt="Vehicle Quiz"><br>**Vehicles** | <img src="static/screenshots/color-shape-quiz.png" width="150" alt="Colors and Shapes"><br>**Colors & Shapes** |
| <img src="static/screenshots/clothes-quiz.png" width="150" alt="Clothes Quiz"><br>**Clothes** | <img src="static/screenshots/toy-quiz.png" width="150" alt="Toy Quiz"><br>**Toys** | <img src="static/screenshots/instrument-quiz.png" width="150" alt="Instrument Quiz"><br>**Instruments** | <img src="static/screenshots/grammar.png" width="150" alt="Italian Grammar"><br>**Italian Grammar** |

### Brain

| | | | |
|---|---|---|---|
| <img src="static/screenshots/focus-tap.png" width="150" alt="Focus Tap"><br>**Focus Tap** | <img src="static/screenshots/quick-count.png" width="150" alt="Quick Count"><br>**Quick Count** | <img src="static/screenshots/speed-match.png" width="150" alt="Speed Match"><br>**Speed Match** | <img src="static/screenshots/what-comes-next.png" width="150" alt="What Comes Next"><br>**What Comes Next** |
| <img src="static/screenshots/sequence-memory.png" width="150" alt="Sequence Memory"><br>**Sequence Memory** | <img src="static/screenshots/emoji-math.png" width="150" alt="Emoji Math"><br>**Emoji Math** | <img src="static/screenshots/spot-the-difference.png" width="150" alt="Spot the Difference"><br>**Spot the Difference** | |

### Paint papers

| | | | |
|---|---|---|---|
| <img src="static/screenshots/papers/blank.png" width="150" alt="Blank paper"><br>**Blank** | <img src="static/screenshots/papers/dino-valley.png" width="150" alt="Dino Valley"><br>**Dino Valley** | <img src="static/screenshots/papers/butterfly-garden.png" width="150" alt="Butterfly Garden"><br>**Butterfly Garden** | <img src="static/screenshots/papers/under-the-sea.png" width="150" alt="Under the Sea"><br>**Under the Sea** |
| <img src="static/screenshots/papers/farm.png" width="150" alt="Farm"><br>**Farm** | <img src="static/screenshots/papers/space.png" width="150" alt="Space"><br>**Space** | <img src="static/screenshots/papers/jungle.png" width="150" alt="Jungle"><br>**Jungle** | <img src="static/screenshots/papers/arctic.png" width="150" alt="Arctic"><br>**Arctic** |
| <img src="static/screenshots/papers/castle.png" width="150" alt="Castle"><br>**Castle** | <img src="static/screenshots/papers/vehicles.png" width="150" alt="Vehicles"><br>**Vehicles** | <img src="static/screenshots/papers/princesses.png" width="150" alt="Princesses"><br>**Princesses** | <img src="static/screenshots/papers/snow.png" width="150" alt="Snow"><br>**Snow** |
| <img src="static/screenshots/papers/ocean.png" width="150" alt="Ocean"><br>**Ocean** | <img src="static/screenshots/papers/robot.png" width="150" alt="Robot"><br>**Robot** | | |

## Development

```sh
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check` | Svelte type check |
| `pnpm lint` | Svelte lint |
| `pnpm test` | Unit + behavioral tests (vitest) |
| `pnpm test:e2e` | E2E tests (Playwright, headless) |
| `pnpm test:e2e:pwa` | Offline service-worker E2E only |
| `pnpm test:e2e:headed` | E2E tests with browser visible |
| `pnpm test:all` | All tests |
| `pnpm deploy` | Deploy to production **and** repoint the branded alias |
| `pnpm deploy:cloudflare` | Build and deploy the static Worker to Cloudflare |
| `pnpm alias:brand` | Only repoint `kids-games-lac.vercel.app` at the newest production deploy |

## Stack

- **Framework:** Svelte 5 + SvelteKit
- **PWA:** @vite-pwa/sveltekit (offline support)
- **Audio:** Web Audio API (synth sounds)
- **Testing:** Vitest + Playwright
- **Deploy:** Vercel (static export) and Cloudflare Workers (static assets)

### Deploying to Vercel

Use `pnpm deploy`, not a bare `vercel --prod`. The Vercel CLI is pinned to
`65.12.1` (override with `VERCEL_CLI`) so the alias step is reproducible.

The child-facing domain `kids-2-5.aiu-media.com` is served through a Cloudflare
proxy that fetches `kids-games-lac.vercel.app` with an `x-aiu-proxy` header.
That alias is a *manual* Vercel alias: a new production deployment moves only the
automatic aliases (`kids-games-ion-utales-projects.vercel.app`,
`kids-games-git-main-…`), so the branded domain would keep serving the old build
until the alias is re-pointed. `scripts/pin-brand-alias.mjs` does that step and
warns when the newest deployment is not your local `HEAD`.

### Deploying to Cloudflare Workers

A separate static-assets Worker lives at
<https://kids-games.alexionutale.workers.dev> (not the branded Vercel domain):

```sh
pnpm deploy:cloudflare
```

The script builds first: `public/index.html`, `sw.js` and `_headers` are tracked,
but `public/_app/` is generated and gitignored, so a checkout must be built
before deploying. Authenticate once with `wrangler login`, or set
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for non-interactive deploys.

`wrangler.jsonc` serves `public/` with
`not_found_handling: "single-page-application"`, so deep links such as
`/games/pop/play/3` receive the app shell; `static/_headers` keeps `sw.js` and
`index.html` uncached. `workers_dev` is enabled and preview URLs are off.

The script sets `NODE_OPTIONS=--no-network-family-autoselection` because Node's
IPv6 Happy Eyeballs path can stall against Cloudflare on some networks; it is
harmless elsewhere. To attach a custom domain, add a `routes` entry to
`wrangler.jsonc`; changing the branded DNS is a separate decision.

### Local E2E port

Playwright serves the production build on port 4173. If another local app owns
that port, pick a free one:

```sh
PLAYWRIGHT_PORT=4273 pnpm test:e2e
```

## Age Scaling

Each game adapts to the child's age (2-5):
- **Age 2:** Big targets, 2-3 items, simple rules, always succeeds
- **Age 5:** More items, faster pace, actual challenge
