import { defineConfig } from '@playwright/test';

// `PLAYWRIGHT_PORT=4273 pnpm test:e2e` avoids 4173 when another local app owns it.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // 1 worker: parallel browsers starve the games' timers on modest machines
  // (symptom was one random timing-test failure per run). CI also uses 1.
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    headless: !process.env.HEADED,
    viewport: { width: 390, height: 844 },
    hasTouch: true, // mobile-first app: drive input with touch-originated pointer events
    actionTimeout: 5000,
    // deterministic tests: never let the PWA service worker swap shells mid-run
    serviceWorkers: 'block'
  },
  webServer: {
    command: `pnpm build && pnpm preview --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'app', testIgnore: /offline-pwa\.test\.js/ },
    { name: 'pwa', testMatch: /offline-pwa\.test\.js/, use: { serviceWorkers: 'allow' } }
  ]
});
