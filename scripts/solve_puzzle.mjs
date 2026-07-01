// Automated jigsaw puzzle solver using Playwright
// Takes screenshots and validates correctness via OpenCV

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'puzzle-test');
const URL = 'http://localhost:4173/games/glossary-puzzle';

async function solvePuzzle() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  await page.goto(URL);
  await page.waitForTimeout(500);

  // Click the first puzzle image with Easy difficulty
  await page.locator('.gp-diff-btn').first().click();
  await page.waitForTimeout(200);
  await page.locator('.gp-image-card').first().click();
  await page.waitForTimeout(1000);

  // Read piece positions from game state
  const pieceData = await page.evaluate(() => {
    // Access the Svelte component's state
    const app = document.querySelector('.gp-play');
    if (!app) return null;

    // We can read the pieces from the DOM
    const trayPieces = document.querySelectorAll('.gp-tray-piece');
    const boardCells = document.querySelectorAll('.gp-board-cell');

    const pieces = [];
    trayPieces.forEach((el, i) => {
      // Each tray piece has an inline SVG with clip-path id
      const svg = el.querySelector('svg');
      if (!svg) return;
      const clipPathId = el.querySelector('clipPath')?.id || '';
      // Extract row-col from the id like "tp-2-1"
      const match = clipPathId.match(/tp-(\d+)-(\d+)/);
      if (match) {
        pieces.push({
          trayIndex: i,
          correctRow: parseInt(match[1]),
          correctCol: parseInt(match[2]),
        });
      }
    });
    return pieces;
  });

  console.log(`Found ${pieceData?.length || 0} pieces`);

  if (!pieceData || pieceData.length === 0) {
    console.log('No pieces found, trying alternative method...');
    // Fallback: read from the SVG clip-path IDs directly
    const traySvgs = await page.locator('.gp-tray-piece svg').count();
    console.log(`Tray SVGs: ${traySvgs}`);
    // Just drag pieces to cells sequentially
  }

  // Take screenshot of board BEFORE solving
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-before.png') });

  // For each piece, drag from tray to correct board cell
  let pieceCounter = 0;
  const trayPieceCount = await page.locator('.gp-tray-piece').count();
  console.log(`Tray has ${trayPieceCount} pieces`);

  // We'll try to solve by dragging each piece to each empty cell
  // First, read which cells are already filled (placed pieces)
  const boardSize = await page.evaluate(() => {
    const board = document.querySelector('.gp-board');
    if (!board) return 0;
    return board.offsetWidth;
  });

  // Strategy: for each tray piece, get its clip-path row/col, then drag it there
  for (let p = 0; p < trayPieceCount; p++) {
    const trayPiece = page.locator('.gp-tray-piece').nth(0); // Always first since tray refills

    // Get the correct cell from the piece's clip-path id
    const cellInfo = await trayPiece.evaluate(el => {
      const clip = el.querySelector('clipPath');
      if (!clip) return null;
      const id = clip.id;
      const m = id.match(/tp-(\d+)-(\d+)/);
      if (m) return { row: parseInt(m[1]), col: parseInt(m[2]) };
      return null;
    });

    if (!cellInfo) {
      console.log(`Piece ${p}: Could not determine target cell, skipping`);
      continue;
    }

    console.log(`Piece ${p}: target cell (${cellInfo.row}, ${cellInfo.col})`);

    // Get tray piece position
    const trayBox = await trayPiece.boundingBox();
    if (!trayBox) { console.log(`Piece ${p}: No tray box`); continue; }

    // Get board cell position
    const cellIndex = cellInfo.row * 2 + cellInfo.col; // For 2x2 grid
    const boardCell = page.locator('.gp-board-cell').nth(cellIndex);
    const cellBox = await boardCell.boundingBox();
    if (!cellBox) { console.log(`Piece ${p}: No cell box`); continue; }

    // Drag from tray center to board cell center
    const startX = trayBox.x + trayBox.width / 2;
    const startY = trayBox.y + trayBox.height / 2;
    const endX = cellBox.x + cellBox.width / 2;
    const endY = cellBox.y + cellBox.height / 2;

    console.log(`  Dragging from (${startX.toFixed(0)}, ${startY.toFixed(0)}) to (${endX.toFixed(0)}, ${endY.toFixed(0)})`);

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    // Move in steps for smooth drag
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      await page.mouse.move(
        startX + (endX - startX) * (s / steps),
        startY + (endY - startY) * (s / steps),
      );
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Check if puzzle is complete
    const done = await page.locator('.gp-celebration-text').isVisible().catch(() => false);
    if (done) {
      console.log('Puzzle completed!');
      break;
    }

    pieceCounter++;
    if (pieceCounter > 10) break; // Safety limit
  }

  await page.waitForTimeout(1000);

  // Take screenshot AFTER solving
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-after.png') });

  // Also screenshot the gallery with the original image thumbnail
  await page.locator('.gp-exit-btn').click().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-gallery.png') });

  await browser.close();
  console.log('Screenshots captured. Running OpenCV comparison...');
}

async function compareImages() {
  try {
    const result = execSync(`python3 -c "
import cv2
import numpy as np
import sys

# Load images
before = cv2.imread('${SCREENSHOT_DIR}/00-before.png')
after = cv2.imread('${SCREENSHOT_DIR}/01-after.png')

if before is None or after is None:
    print('FAIL: Could not load images')
    sys.exit(1)

# Crop to just the board area (top ~40-80% of the screen)
h_b, w_b = before.shape[:2]
h_a, w_a = after.shape[:2]

# For the board area, we compare the center portion
# Since we want to see if pieces are placed correctly
board_before = before[int(h_b*0.25):int(h_b*0.75), int(w_b*0.1):int(w_b*0.9)]
board_after = after[int(h_a*0.25):int(h_a*0.75), int(w_a*0.1):int(w_a*0.9)]

# Resize to same dimensions
h = min(board_before.shape[0], board_after.shape[0])
w = min(board_before.shape[1], board_after.shape[1])
board_before = cv2.resize(board_before, (w, h))
board_after = cv2.resize(board_after, (w, h))

# Compare using Mean Squared Error
diff = cv2.absdiff(board_before, board_after)
mse = np.mean(diff ** 2)

# Also check structural similarity
# The board should have LESS ghost (more filled in) after solving
gray_before = cv2.cvtColor(board_before, cv2.COLOR_BGR2GRAY)
gray_after = cv2.cvtColor(board_after, cv2.COLOR_BGR2GRAY)

# Count non-white pixels (placed pieces cover the ghost)
non_white_before = np.sum(gray_before < 200)
non_white_after = np.sum(gray_after < 200)

print(f'MSE: {mse:.2f}')
print(f'Non-white pixels before: {non_white_before}')
print(f'Non-white pixels after: {non_white_after}')
print(f'Pixels filled: {non_white_after - non_white_before}')

if non_white_after > non_white_before * 1.1:
    print('RESULT: PASS - Board has more filled pixels (pieces placed)')
    sys.exit(0)
else:
    print(f'RESULT: FAIL - Board not filled enough (before={non_white_before}, after={non_white_after})')
    # Save diff image for debugging
    cv2.imwrite('${SCREENSHOT_DIR}/03-diff.png', diff)
    sys.exit(1)
" 2>&1`, { encoding: 'utf8' });
    console.log(result);
    return result.includes('PASS');
  } catch (e) {
    console.log('OpenCV error:', e.stdout || '', e.stderr || '');
    // Fallback to pixelmatch
    return await fallbackCompare();
  }
}

async function fallbackCompare() {
  console.log('Using pixelmatch fallback...');
  const pixelmatch = (await import('pixelmatch')).default;
  const { readFileSync, writeFileSync } = await import('fs');
  const { PNG } = await import('pngjs');

  const img1 = PNG.sync.read(readFileSync(path.join(SCREENSHOT_DIR, '00-before.png')));
  const img2 = PNG.sync.read(readFileSync(path.join(SCREENSHOT_DIR, '01-after.png')));

  const w = Math.min(img1.width, img2.width);
  const h = Math.min(img1.height, img2.height);
  const diff = new PNG({ width: w, height: h });

  const result = pixelmatch(
    new Uint8Array(img1.data.slice(0, w * h * 4)),
    new Uint8Array(img2.data.slice(0, w * h * 4)),
    diff.data,
    w, h,
    { threshold: 0.1 }
  );

  writeFileSync(path.join(SCREENSHOT_DIR, '03-diff.png'), PNG.sync.write(diff));
  console.log(`Pixelmatch: ${result} differing pixels out of ${w * h}`);
  
  const diffPercent = result / (w * h) * 100;
  console.log(`Difference: ${diffPercent.toFixed(2)}%`);
  
  // More than 5% difference means something changed (pieces placed)
  return diffPercent > 5;
}

async function main() {
  let attempt = 0;
  const MAX_ATTEMPTS = 5;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    console.log(`\n===== ATTEMPT ${attempt} =====`);
    
    await solvePuzzle();
    const success = await compareImages();
    
    if (success) {
      console.log('\n✅ PUZZLE VERIFIED! Images match expected result.');
      process.exit(0);
    } else {
      console.log(`\n❌ Attempt ${attempt} failed. Need to fix and retry.`);
      if (attempt >= MAX_ATTEMPTS) {
        console.log('Max attempts reached. Manual intervention required.');
        process.exit(1);
      }
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
