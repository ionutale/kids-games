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
| `pnpm test:e2e:headed` | E2E tests with browser visible |
| `pnpm test:all` | All tests |
| `pnpm deploy` | Deploy to production **and** repoint the branded alias |
| `pnpm alias:brand` | Only repoint `kids-games-lac.vercel.app` at the newest production deploy |

## Stack

- **Framework:** Svelte 5 + SvelteKit
- **PWA:** @vite-pwa/sveltekit (offline support)
- **Audio:** Web Audio API (synth sounds)
- **Testing:** Vitest + Playwright
- **Deploy:** Vercel (static export)

### Deploying

Use `pnpm deploy`, not a bare `vercel --prod`.

The child-facing domain `kids-2-5.aiu-media.com` is served through a Cloudflare
proxy that fetches `kids-games-lac.vercel.app` with an `x-aiu-proxy` header.
That alias is a *manual* Vercel alias: a new production deployment moves only the
automatic aliases (`kids-games-ion-utales-projects.vercel.app`,
`kids-games-git-main-…`), so the branded domain would keep serving the old build
until the alias is re-pointed. `scripts/pin-brand-alias.mjs` does that step and
warns when the newest deployment is not your local `HEAD`.

## Age Scaling

Each game adapts to the child's age (2-5):
- **Age 2:** Big targets, 2-3 items, simple rules, always succeeds
- **Age 5:** More items, faster pace, actual challenge
