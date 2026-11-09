# Kids Games

8 touch games for ages 2-5, inspired by McDonald's Italy in-store displays. Built as a PWA with SvelteKit.

## Games

| | |
|---|---|
| 🎨 **Paint** | 🌟 **Stickers** |
| <img src="static/screenshots/paint.png" width="180"> | <img src="static/screenshots/stickers.png" width="180"> |
| 🧠 **Memory** | 🧩 **Puzzle** |
| <img src="static/screenshots/memory.png" width="180"> | <img src="static/screenshots/puzzle.png" width="180"> |
| 🫧 **Pop** | ⚽ **Soccer** |
| <img src="static/screenshots/pop.png" width="180"> | <img src="static/screenshots/soccer.png" width="180"> |
| 📦 **Sorting** | 🌈 **Splash** |
| <img src="static/screenshots/sorting.png" width="180"> | <img src="static/screenshots/splash.png" width="180"> |

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

Use `pnpm deploy`, not a bare `vercel --prod`.

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
