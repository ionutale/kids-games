import { defineConfig } from '@playwright/test';

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
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    headless: !process.env.HEADED,
    viewport: { width: 390, height: 844 },
    actionTimeout: 5000,
    // deterministic tests: never let the PWA service worker swap shells mid-run
    serviceWorkers: 'block'
  },
  webServer: {
    command: 'pnpm build && pnpm preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
