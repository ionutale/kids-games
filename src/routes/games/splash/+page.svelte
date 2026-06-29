<script>
  import { settings } from '$lib/stores/settings';
  import { playSplash } from '$lib/sounds/audioManager';

  const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65', '#E57373', '#64B5F6'];
  const emojis = ['⭐', '🌸', '🦋', '💫', '🎈', '🌈', '✨', '❤️'];
  let splashes = $state([]);

  function createSplash(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const count = $settings.ageLevel <= 2 ? 3 : 6;
    const newSplashes = [];

    for (let i = 0; i < count; i++) {
      newSplashes.push({
        id: Math.random(),
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * ($settings.ageLevel <= 2 ? 30 : 20),
        delay: Math.random() * 0.2
      });
    }

    splashes = [...splashes, ...newSplashes];
    if ($settings.soundEnabled) playSplash();

    setTimeout(() => {
      const ids = new Set(newSplashes.map(s => s.id));
      splashes = splashes.filter(s => !ids.has(s.id));
    }, 1500);
  }

  function handleMove(e) {
    e.preventDefault();
    if (e.buttons || (e.touches && e.touches.length > 0)) {
      createSplash(e);
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="splash-game"
  role="application"
  ontouchstart={createSplash}
  ontouchmove={handleMove}
  onmousedown={createSplash}
  onmousemove={handleMove}
>
  {#each splashes as s (s.id)}
    <span
      class="splash"
      style:left="{s.x}%"
      style:top="{s.y}%"
      style:font-size="{s.size}px"
      style:--delay="{s.delay}s"
      style:--color="{s.color}"
    >
      {s.emoji}
    </span>
  {/each}
</div>

<style>
  .splash-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    cursor: crosshair;
  }
  .splash {
    position: absolute;
    transform: translate(-50%, -50%);
    animation: splashOut 1.5s ease-out forwards;
    animation-delay: var(--delay);
    pointer-events: none;
    filter: drop-shadow(0 0 6px var(--color));
  }
  @keyframes splashOut {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
</style>
