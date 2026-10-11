<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import { loadPuzzleSounds, playPickup } from '$lib/sounds/puzzleSounds.js';
  import { levelConfig } from './images.js';

  let { image, level, onclose } = $props();

  const config = $derived(levelConfig(level));
  const startHref = $derived(
    '/games/glossary-puzzle/play/' + level + '?image=' + encodeURIComponent(image.id)
  );

  // Interior cut lines in grid units (the SVG viewBox is cols × rows and stretches
  // over the full, uncropped picture box, so cells divide it evenly at any aspect).
  const vCuts = $derived(
    Array.from({ length: Math.max(0, config.cols - 1) }, (_, i) => i + 1)
  );
  const hCuts = $derived(
    Array.from({ length: Math.max(0, config.rows - 1) }, (_, i) => i + 1)
  );

  // Backdrop dismiss: only a click on the overlay itself (not its contents) closes.
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }

  onMount(async () => {
    try {
      await loadPuzzleSounds();
      playPickup();
    } catch {
      // sound is a nicety — never block the overlay on it
    }
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="gp-preview" onclick={handleBackdrop}>
  <div class="gp-preview-card">
    <button class="gp-preview-close" type="button" aria-label="Close" onclick={onclose}>✕</button>

    <div class="gp-preview-frame">
      <img class="gp-preview-img" src={image.file} alt={image.name} />
      <svg class="gp-preview-grid" viewBox="0 0 {config.cols} {config.rows}" preserveAspectRatio="none" aria-hidden="true">
        {#each vCuts as x}
          <line x1={x} y1="0" x2={x} y2={config.rows} />
        {/each}
        {#each hCuts as y}
          <line x1="0" y1={y} x2={config.cols} y2={y} />
        {/each}
      </svg>
    </div>

    <p class="gp-preview-name">{image.name}</p>
    <p class="gp-preview-pill">{$_('level')} {level} · {$_('pieces', { n: config.cols * config.rows })}</p>

    <BigButton variant="primary" class="gp-preview-start" href={startHref}>▶ {$_('start')}</BigButton>
  </div>
</div>

<style>
  .gp-preview {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(4, 8, 24, 0.72);
  }
  .gp-preview-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    animation: gpPreviewPop 0.3s ease-out;
    max-width: min(90vw, 420px);
  }
  @keyframes gpPreviewPop {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .gp-preview-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--text-hi);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
  }
  .gp-preview-close:active { background: rgba(94, 234, 212, 0.25); border-color: var(--accent); }
  .gp-preview-frame {
    position: relative;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    border-radius: 14px;
    overflow: hidden;
    background: #f0f0f0;
  }
  .gp-preview-img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 55vh;
  }
  .gp-preview-grid {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    animation: gpGridFade 2.4s ease-in-out infinite;
  }
  .gp-preview-grid line {
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }
  @keyframes gpGridFade {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  .gp-preview-name {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-hi);
    text-align: center;
  }
  .gp-preview-pill {
    padding: 4px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--panel-border);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-lo);
  }
</style>
