<script>
  let { icon = '', label, tone = 'default' } = $props();
</script>

<span class="hud-item" class:hud-warn={tone === 'warn'}>
  {#if icon}<span class="hud-icon">{icon}</span>{/if}{label}
</span>

<style>
  .hud-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-hi);
    min-height: calc(var(--touch-min) * 0.66);
  }
  .hud-icon { font-size: 15px; }
  .hud-warn {
    color: var(--warn);
    border-color: rgba(255,155,155,0.45);
    animation: glowPulse 1.2s ease-in-out infinite;
    --accent-glow: rgba(255,155,155,0.4);
  }
</style>
