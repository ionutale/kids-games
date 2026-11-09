<script>
  // The jar is the score: it fills by points and keeps the collected trinkets.
  // A star sticker appears on the rim when a star pops or the jar fills.
  import Icons from '#lib/pop/Icons.svelte';
  import { jarPercent, jarIsFull } from '#lib/pop/config.js';

  let { items = [], target = 6, star = false, reduced = false, label = '' } = $props();

  const pct = $derived(jarPercent(items.length, target));
  const full = $derived(jarIsFull(items.length, target));
  // A full round can hold at most 16 points (a 15-point target finished by a
  // giant/star), so every collected trinket gets a mini. Above ten points the
  // minis shrink a little so the whole collection still fits.
  const miniSize = $derived(items.length > 10 ? 11 : 14);
</script>

<div
  class="jar"
  class:still={reduced}
  role="img"
  aria-label={label}
  data-testid="pop-jar"
  data-filled={items.length}
  data-target={target}
  data-full={full}
  data-sticker={star}
>
  <span class="lid" aria-hidden="true"></span>
  <div class="glass">
    <span class="fill" data-testid="jar-fill" data-percent={Math.round(pct * 100)} style:height="{pct * 100}%"></span>
    <div class="contents" aria-hidden="true">
      {#each items as item (item.id)}
        <span
          class="mini"
          style:--fly-x="{item.dx ?? 0}px"
          style:--fly-y="{item.dy ?? 0}px"
        ><Icons id={item.kind} size={miniSize} /></span>
      {/each}
    </div>
    <span class="shine" aria-hidden="true"></span>
  </div>
  {#if star}
    <span class="sticker" data-testid="pop-sticker" aria-hidden="true"><Icons id="star" size={18} /></span>
  {/if}
  <span class="base" aria-hidden="true"></span>
</div>

<style>
  .jar {
    position: relative;
    width: 70px;
    height: 94px;
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.3));
  }
  .lid {
    width: 42px;
    height: 9px;
    border-radius: 5px 5px 3px 3px;
    background: linear-gradient(180deg, #f6b26b, #c98445);
    border: 2px solid #3a271b;
    z-index: 2;
  }
  .glass {
    position: relative;
    width: 58px;
    flex: 1;
    margin-top: -2px;
    border-radius: 9px 9px 13px 13px;
    background: linear-gradient(180deg, rgba(196, 181, 253, 0.2), rgba(127, 216, 255, 0.13));
    border: 2px solid rgba(255, 255, 255, 0.6);
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }
  .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(196, 181, 253, 0.65), rgba(127, 216, 255, 0.55));
    transition: height 0.35s ease;
  }
  .contents {
    position: absolute;
    inset: 4px 3px 3px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-end;
    justify-content: center;
    gap: 1px;
    z-index: 2;
  }
  .mini {
    display: grid;
    place-items: center;
    animation: flyIn 0.45s ease-out backwards;
  }
  .still .mini {
    animation: none;
  }
  .shine {
    position: absolute;
    top: 8px;
    left: 7px;
    width: 7px;
    height: 28px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.35);
    transform: rotate(8deg);
  }
  .base {
    width: 54px;
    height: 5px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.25);
  }
  .sticker {
    position: absolute;
    top: -9px;
    right: -7px;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 0 8px rgba(242, 193, 78, 0.85));
    animation: popIn 0.3s ease-out;
  }
  @keyframes flyIn {
    0% {
      opacity: 0;
      transform: translate(var(--fly-x, 0), var(--fly-y, 0)) scale(1.8) rotate(20deg);
    }
    70% {
      opacity: 1;
      transform: translate(0, 0) scale(1.1) rotate(-8deg);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0) scale(1) rotate(0);
    }
  }
  @media (max-width: 360px) {
    .jar {
      width: 62px;
      height: 86px;
    }
    .glass {
      width: 52px;
    }
    .lid {
      width: 38px;
    }
    .base {
      width: 48px;
    }
  }
</style>
