<script>
  import { settings } from '#lib/stores/settings.js';
  import { _ } from '#lib/stores/locale.js';
  import { playTap } from '#lib/sounds/audioManager.js';

  let soundOn = $derived($settings.soundEnabled);

  function handleToggle() {
    settings.toggleSound();
    playTap();
  }
</script>

<button
  class="sound-btn"
  onclick={handleToggle}
  aria-label={$_('sound')}
>
  {soundOn ? '🔊' : '🔇'}
</button>

<style>
  .sound-btn {
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
  }
</style>
