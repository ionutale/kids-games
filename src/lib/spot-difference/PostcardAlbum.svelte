<script>
  // The latest twelve harbor postcards, newest first.
  import Postcard from './Postcard.svelte';
  import { latestPostcards } from './postcards.js';

  let {
    postcards = [],
    limit = 12,
    emptyLabel = '',
    countLabel = ''
  } = $props();

  const shown = $derived(latestPostcards(postcards, limit));
</script>

<div class="album" data-testid="postcard-album">
  {#if shown.length}
    <div class="grid">
      {#each shown as card, i (i)}
        <Postcard age={card.age ?? 3} />
      {/each}
    </div>
    {#if countLabel}<p class="count">{countLabel}</p>{/if}
  {:else}
    <p class="empty">{emptyLabel}</p>
  {/if}
</div>

<style>
  .album {
    width: 100%;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    max-height: 128px;
    overflow-y: auto;
    padding: 2px;
  }
  .count {
    margin: 6px 0 0;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #7a5a33;
  }
  .empty {
    margin: 4px 0;
    text-align: center;
    font-size: 12px;
    color: #7a5a33;
  }
</style>
