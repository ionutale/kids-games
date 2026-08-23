# Category Sort — Design Spec

## Problem Statement

The app has a Sorting game already, but it uses baskets and items. This version focuses on **categorization logic** — identifying which category an emoji belongs to and placing it in the correct bin. Categorization is a fundamental cognitive skill underlying logic, taxonomy, and language development.

## Solution

2-3 category bins displayed at the top of the screen. Emojis appear one at a time at the bottom. Player drags each emoji into the correct bin. Categories cycle across rounds (animals, food, vehicles, clothes, nature, colors, shapes, etc.).

## User Stories

1. As a child, I want to see 2-3 category bins with labels and icons, so that I know what to sort into.
2. As a child, I want emojis to appear one at a time, so that I focus on one item at a time.
3. As a child, I want to drag an emoji into a bin and see it land there, so that I get clear feedback.
4. As a child, I want a correct placement to get a positive reaction, so that I feel encouraged.
5. As a child, I want a wrong bin to reject the emoji gently (it bounces back), so that I can try again.
6. As a child, I want a round of 8-10 emojis, so that the session feels complete.
7. As a child, I want to unlock new category sets as I play more, so that there's variety.
8. As a child, I want a celebration when all emojis in a round are sorted correctly, so that I feel done.

## Implementation Decisions

### Categories
Round-robin through category sets:
- Animals (🐶🐱🐰🐸🦁🐘🦊🐼) vs Food (🍎🍕🍦🍪🍌🍇🍩🍭)
- Vehicles (🚗🚌🚲✈️🚢🚁🚂🏎️) vs Nature (🌳🌺🌻🌊⛰️🌈🌙☀️)
- Clothes (👕👖👗🧢👟🧥🧦🧣) vs Toys (🧸🎲🎨🪁🎪🎭🎯🎮)
- Plus 3-bin rounds: Animal vs Food vs Vehicle

### Category data
Static data file: `src/lib/category-sort/categories.js`
- Each category has id, name, icon, and list of emoji items
- Each item: { emoji, label, categoryId }

### Game flow
1. Show category bins at top with icon + label
2. Show first emoji at bottom (centered, large)
3. Player drags emoji into a bin
4. Correct → emoji slides into bin with animation + chime
5. Wrong → emoji bounces back + gentle buzz. Score not penalized.
6. Next emoji appears
7. After all emojis sorted → celebration + next round (new category set)
8. Endless rounds

### Drag mechanics
- Touch/drag the emoji (no need to long-press)
- Emoji follows finger
- Drop zone detection: if emoji center overlaps with a bin, snap to that bin
- If dropped outside any bin, bounce back to center

### Scoring
- Correct placements count (running total)
- No penalty for wrong attempts
- Rounds completed count
- No high score (play for mastery, not competition)

### Architecture
- `src/lib/category-sort/categories.js` — category/item data (can be tested independently)
- `src/routes/games/category-sort/+page.svelte`
- SSR config: `+page.js`

### Sound
- Correct placement: happy chime (playMatch)
- Wrong placement: gentle buzz (playError)
- Round complete: celebration jingle (playWin)

## Testing Decisions

### Unit tests
- Category data: correct structure, no orphan items
- Each item belongs to exactly one category
- Category sets have sufficient items for rounds

### Behavioral tests
- Drag-drop collision detection logic
- Correct/wrong placement validation
- Round progression (next category set)

### E2E tests
- Page loads with bins visible
- Emoji appears at bottom
- Drag to correct bin works

## Out of Scope
- Timed rounds
- Score penalties for wrong answers
- Custom category creation
- Multi-player
- 4+ category bins in one round
