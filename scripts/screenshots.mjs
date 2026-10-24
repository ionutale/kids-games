import { chromium } from '@playwright/test';

const games = [
  { id: 'paint', name: 'Paint' },
  { id: 'stickers', name: 'Stickers' },
  { id: 'memory', name: 'Memory' },
  { id: 'puzzle', name: 'Puzzle' },
  { id: 'pop', name: 'Pop' },
  { id: 'soccer', name: 'Soccer' },
  { id: 'sorting', name: 'Sorting' },
  { id: 'splash', name: 'Splash' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// Verify server is running
try {
  const resp = await fetch('http://localhost:4173');
  if (resp.status !== 200) throw new Error(`Status ${resp.status}`);
} catch {
  console.error('Preview server not running. Run: pnpm build && pnpm preview');
  process.exit(1);
}

for (const game of games) {
  // Seed before the app boots. Setting this after load would be overwritten by
  // the pagehide save when the page reloads.
  if (game.id === 'stickers') {
    await page.addInitScript(() => {
      if (location.pathname !== '/games/stickers') return;
      const placed = [
        { id: 'shot-trex', type: 'trex', x: 34, y: 47 },
        { id: 'shot-triceratops', type: 'triceratops', x: 55, y: 64 },
        { id: 'shot-stegosaurus', type: 'stegosaurus', x: 68, y: 44 },
        { id: 'shot-pteranodon', type: 'pteranodon', x: 46, y: 30 },
        { id: 'shot-tent', type: 'tent', x: 72, y: 72 }
      ];
      localStorage.setItem('kids-games-stickers', JSON.stringify({
        version: 1,
        worlds: { 'dino-valley': { placed } }
      }));
    });
  }

  try {
    await page.goto(`http://localhost:4173/games/${game.id}`, { waitUntil: 'load', timeout: 10000 });
  } catch {
    console.log(`  (navigating to ${game.name})`);
    await page.goto(`http://localhost:4173/games/${game.id}`, { waitUntil: 'load', timeout: 10000 });
  }
  await page.waitForTimeout(1500);

  // For memory, flip a card so it's more interesting
  if (game.id === 'memory') {
    const cards = page.locator('.card');
    const count = await cards.count();
    if (count > 0) await cards.first().click();
    await page.waitForTimeout(500);
  }

  // For pop, wait for bubbles
  if (game.id === 'pop') {
    await page.waitForTimeout(3000);
  }

  // For splash, tap to create effects
  if (game.id === 'splash') {
    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await page.waitForTimeout(300);
    await page.locator('.splash-game').click({ position: { x: 200, y: 400 } });
    await page.waitForTimeout(200);
  }

  // For sorting, select an item
  if (game.id === 'sorting') {
    const item = page.locator('.item').first();
    if (await item.isVisible()) await item.click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: `static/screenshots/${game.id}.png`, fullPage: false });
  console.log(`✓ ${game.name}`);
}

await browser.close();
console.log('All screenshots saved to static/screenshots/');
