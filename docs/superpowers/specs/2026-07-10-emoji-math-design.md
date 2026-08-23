# Emoji Math — Design Spec

## Problem Statement

The app has memory games, puzzles, and quizzes — but no math/arithmetic game. Basic counting and simple arithmetic are core early-learning skills. An emoji-based math game makes abstract concepts concrete by letting kids count visual objects.

## Solution

Players see arithmetic equations represented with emoji counts: `🍎 + 🍎 = ?` with 4 multiple-choice answers to pick from. Difficulty adapts to age: counting (toddlers), simple addition up to 10 (preschool), addition up to 20 and comparison (kindergarten+).

## User Stories

1. As a child, I want to see emoji-based equations, so that I can count objects to find the answer.
2. As a child, I want to tap the correct answer from 4 choices, so that I can progress.
3. As a child, I want immediate feedback (correct/wrong) after each answer, so that I learn from mistakes.
4. As a child, I want the difficulty to match my age (counting → simple addition → harder addition), so that I'm neither bored nor frustrated.
5. As a child, I want a running score of correct answers, so that I can track my progress.
6. As a parent, I want the game to adapt to my child's age from the global settings, so that I don't need separate configuration.
7. As a child, I want a "10 correct = celebration" milestone, so that sessions feel rewarding.

## Implementation Decisions

### Equation types by age
- **Age 2-3**: "Count the emojis" — how many 🍎? with numeric answers. Single emoji type per question.
- **Age 4**: Simple addition with 2 groups: `🍎 + 🍎 = ?` — result ≤ 10.
- **Age 5**: Addition up to 20: `🍎🍎 + 🍎🍎🍎 = ?`
- **Age 5+**: Comparison: `🍎🍎🍎 🍎🍎` — which side has more? Or mixed.

### Emoji pool for equations
- Fruits: 🍎 🍌 🍊 🍇 🍓 (concrete, countable)
- One emoji type per question to avoid confusion

### Answer format
- 4 multiple-choice answer buttons below the equation
- Answers are numbers (not emoji counts)
- 3 wrong answers are distractors: ±1 and ±2 from the correct answer

### Game flow
1. Question displayed: emoji count equation
2. Player taps one of 4 answer buttons
3. Correct → green flash + chime + next question
4. Wrong → red shake + gentle buzz + show correct answer, then next question
5. After 10 correct → brief celebration + continue
6. No game over — endless practice. Player leaves via Home.

### Scoring
- Running count: "10 correct" milestones with celebration
- Correct streak counter shown
- High score = longest streak

### Architecture
Single file: `src/routes/games/emoji-math/+page.svelte`
SSR config: `+page.js`

### Sound
- Correct: ascending chime (playMatch)
- Wrong: gentle buzz (playError)
- Milestone (10 correct): celebration jingle (playWin)

## Testing Decisions

### Behavioral tests
- Equation generation produces correct counts for given difficulty
- Answer options include correct + distractors
- Age level maps to correct equation type

### Unit tests
- Equation data formats

## Out of Scope
- Subtraction or multiplication
- Timed rounds
- Written numbers as words
- Custom equation creation
