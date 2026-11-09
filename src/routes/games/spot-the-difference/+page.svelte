<script>
  // Spot the Difference — Twin Postcards. Two stacked harbor pictures; tap a
  // changed spot in either one and both ring it. Five pictures make a set, each
  // solve adds a postcard to the album. No timer, no fail, no mistake count.
  import { onDestroy, onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { makeSeed, seedFromUrl } from '#lib/game/seed.js';
  import { _ } from '#lib/stores/locale.js';
  import { settings } from '#lib/stores/settings.js';
  import { reducedMotion } from '#lib/stores/reducedMotion.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import Harbor from '#lib/spot-difference/Harbor.svelte';
  import ProgressHud from '#lib/spot-difference/ProgressHud.svelte';
  import PostcardAlbum from '#lib/spot-difference/PostcardAlbum.svelte';
  import {
    SET_SIZE,
    ageSpec,
    findDiffAt,
    foundDiffAt,
    makeScenePuzzle,
    sceneFor
  } from '#lib/spot-difference/scene.js';
  import { addPostcard, loadPostcards } from '#lib/spot-difference/postcards.js';
  import { createHarborSound } from '#lib/spot-difference/sound.js';

  const HINT_DELAY = 8000;
  const HINT_DURATION = 2400;
  const TOAST_DURATION = 1150;

  const sound = createHarborSound();

  let setAge = $state(3);
  let baseSeed = $state(1);
  let step = $state(0);
  let setDone = $state(0);
  let puzzle = $state(null);
  let found = $state([]);
  let hintId = $state(null);
  let wrong = $state(null);
  let phase = $state('play'); // play → toast → done
  let postcards = $state([]);
  let catReacts = $state(0);
  let playAgainButton = $state(null);

  let timers = [];
  let hintTimer = null;
  let hintClearTimer = null;
  let wrongKey = 0;
  let greeted = false;

  const reduced = $derived($reducedMotion);
  const total = $derived(puzzle?.diffs.length ?? 0);
  const hintDiff = $derived(
    hintId != null && puzzle ? (puzzle.diffs.find((diff) => diff.id === hintId) ?? null) : null
  );
  const promptLabel = $derived($_('spotFindChanged'));
  const foundLabel = $derived($_('spotFoundCount', { n: found.length, m: total }));
  const setLabel = $derived(
    $_('spotSetProgress', { n: Math.min(step + 1, SET_SIZE), m: SET_SIZE })
  );
  const statusText = $derived(`${foundLabel}. ${setLabel}`);

  // The set-complete card is modal: move focus to its primary action so a
  // keyboard or switch user is not left behind on the hidden picture.
  $effect(() => {
    if (phase === 'done') {
      tick().then(() => playAgainButton?.focus());
    }
  });

  function later(fn, ms) {
    const id = setTimeout(() => {
      timers = timers.filter((timer) => timer !== id);
      fn();
    }, ms);
    timers.push(id);
    return id;
  }

  function clearHint() {
    if (hintTimer) clearTimeout(hintTimer);
    if (hintClearTimer) clearTimeout(hintClearTimer);
    hintTimer = null;
    hintClearTimer = null;
    hintId = null;
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers = [];
    clearHint();
  }

  function armHint() {
    clearHint();
    if (phase !== 'play' || !puzzle) return;
    hintTimer = setTimeout(() => {
      hintTimer = null;
      if (phase !== 'play' || !puzzle) return;
      const next = puzzle.diffs.find((diff) => !found.includes(diff.id));
      if (!next) return;
      hintId = next.id;
      hintClearTimer = setTimeout(() => {
        hintClearTimer = null;
        hintId = null;
        armHint();
      }, HINT_DURATION);
    }, HINT_DELAY);
  }

  function startPuzzle(index) {
    clearTimers();
    step = index;
    const seed = ((baseSeed + index * 97) % 1000000) || 1;
    puzzle = makeScenePuzzle(setAge, seed);
    found = [];
    hintId = null;
    wrong = null;
    greeted = false;
    phase = 'play';
    sound.reset();
    armHint();
  }

  function startSet() {
    clearTimers();
    sound.stop();
    // Read the band once: changing Settings mid-set changes the *next* set.
    setAge = ageSpec($settings.ageLevel).age;
    baseSeed = seedFromUrl(page.url) ?? makeSeed(setAge + 1);
    step = 0;
    setDone = 0;
    phase = 'play';
    postcards = loadPostcards();
    startPuzzle(0);
  }

  function pick(side, point) {
    if (phase !== 'play' || !puzzle) return;
    sound.unlock();
    // The greeting waits for a real gesture: scheduling it on mount is often
    // blocked by autoplay policy. Delay it so the find/miss cue speaks first.
    if (!greeted) {
      greeted = true;
      later(() => sound.gull(), 700);
    }
    const diff = findDiffAt(puzzle, point.px, point.py, point.w, point.h, found);
    if (diff) {
      found = [...found, diff.id];
      catReacts += 1;
      sound.find();
      clearHint();
      if (found.length === puzzle.diffs.length) solve();
      else armHint();
    } else if (foundDiffAt(puzzle, point.px, point.py, point.w, point.h, found)) {
      // Tapping a difference that is already ringed is not a wrong answer.
      return;
    } else {
      wrongKey += 1;
      wrong = { x: point.x, y: point.y, side, key: wrongKey };
      sound.miss();
      later(() => {
        wrong = null;
      }, 430);
    }
  }

  function solve() {
    phase = 'toast';
    clearHint();
    sound.jingle();
    setDone += 1;
    postcards = addPostcard({ age: setAge, seed: puzzle.seed }, postcards);
    later(() => {
      if (step < SET_SIZE - 1) {
        startPuzzle(step + 1);
      } else {
        phase = 'done';
        // Keep the accumulated session album. Re-reading storage here would
        // erase the in-memory fallback when localStorage is blocked or full.
        sound.bell();
      }
    }, TOAST_DURATION);
  }

  onMount(startSet);

  onDestroy(() => {
    clearTimers();
    sound.dispose();
  });
</script>

<GameShell accent="#7FD8FF">
  {#snippet hudLeft()}
    <ProgressHud
      found={found.length}
      total={total}
      step={setDone}
      steps={SET_SIZE}
    />
  {/snippet}

  <div
    class="twin"
    class:calm={reduced}
    data-testid="spot-root"
    data-age={setAge}
    data-step={step}
    data-solved={setDone}
    data-found={found.length}
  >
    <p class="prompt">{promptLabel}</p>

    {#if puzzle}
      <div class="panels">
        {#each ['left', 'right'] as side (side)}
          <Harbor
            scene={sceneFor(puzzle, side)}
            {side}
            diffs={puzzle.diffs}
            {found}
            hint={hintDiff}
            wrong={wrong && wrong.side === side ? wrong : null}
            onpick={(point) => pick(side, point)}
            label={side === 'left' ? $_('picture1') : $_('picture2')}
            testid={`panel-${side}`}
            catReact={catReacts}
            {reduced}
          />
        {/each}
      </div>
    {/if}

    <p class="sr-only" role="status" data-testid="spot-status">{statusText}</p>

    {#if phase === 'toast'}
      <div class="toast" data-testid="postcard-toast">✉️ {$_('postcardAdded')}</div>
    {/if}

    {#if phase === 'done'}
      <div class="card-wrap">
        <div
          class="card"
          data-testid="set-complete"
          role="dialog"
          aria-modal="true"
          aria-label={$_('spotHarborComplete')}
        >
          <p class="card-title">{$_('spotHarborComplete')}</p>
          <p class="card-sub">{$_('spotCompleteSub')}</p>
          <PostcardAlbum
            {postcards}
            limit={12}
            emptyLabel={$_('spotAlbumEmpty')}
            countLabel={$_('spotPostcardCount', { n: postcards.length })}
          />
          <div class="actions">
            <button
              class="primary"
              type="button"
              bind:this={playAgainButton}
              onclick={startSet}
            >{$_('playAgain')}</button>
            <a class="ghost" href="/" data-testid="spot-back">{$_('back')}</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</GameShell>

<style>
  .twin {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 10px 8px;
    min-height: 0;
  }
  .prompt {
    margin: 0;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-hi);
  }
  .panels {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 6px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .toast {
    position: absolute;
    left: 50%;
    top: 46%;
    transform: translate(-50%, -50%);
    z-index: 15;
    padding: 10px 18px;
    border-radius: 16px;
    background: rgba(255, 248, 236, 0.96);
    border: 2px solid #57c785;
    color: #1f5c3a;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
    animation: toastIn 0.3s ease-out;
    pointer-events: none;
  }
  .calm .toast {
    animation: none;
  }
  .card-wrap {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 10px;
    background: rgba(8, 18, 26, 0.62);
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(94%, 380px);
    max-height: 96%;
    overflow-y: auto;
    padding: 18px 20px;
    border-radius: 24px;
    background: linear-gradient(160deg, #fff8ec, #ffe7c2);
    border: 2px solid rgba(255, 212, 121, 0.85);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    animation: cardIn 0.3s ease-out;
  }
  .calm .card {
    animation: none;
  }
  .card-title {
    margin: 0;
    font-size: 21px;
    font-weight: 800;
    color: #5a3b12;
    text-align: center;
  }
  .card-sub {
    margin: 0;
    text-align: center;
    font-size: 12px;
    color: #7a5a33;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .primary {
    padding: 10px 20px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #2a1b3d;
    background: #ffd479;
    box-shadow: 0 3px 0 #c9a836;
  }
  .ghost {
    padding: 10px 18px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #5a3b12;
    background: rgba(255, 212, 121, 0.18);
    border: 2px solid rgba(90, 59, 18, 0.2);
    text-decoration: none;
  }
  .primary:active,
  .ghost:active {
    transform: translateY(1px);
  }
  @keyframes toastIn {
    from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  @keyframes cardIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
