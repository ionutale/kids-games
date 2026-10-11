<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { listPhotos, addPhotoFromFile, deletePhoto } from './photos.js';

  let { onclose } = $props();

  let photos = $state([]);
  let error = $state('');
  let inputEl = $state(null);
  let changed = false;

  // Object URLs live only as long as the manager is mounted; re-listing revokes
  // the previous batch so a delete cannot leak its thumbnail.
  function setPhotos(records) {
    for (const p of photos) URL.revokeObjectURL(p.url);
    photos = records.map(r => ({ ...r, url: URL.createObjectURL(r.thumb) }));
  }

  async function refresh() {
    try {
      setPhotos(await listPhotos());
    } catch {
      error = $_('photoError');
    }
  }

  function mapCode(e) {
    return e?.code === 'limit' || e?.code === 'quota' ? $_('photoLimit') : $_('photoError');
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // let the same file be picked again after a failure
    for (const file of files) {
      try {
        await addPhotoFromFile(file);
        changed = true;
        error = '';
      } catch (err) {
        error = mapCode(err);
      }
    }
    await refresh();
  }

  async function remove(id) {
    try {
      await deletePhoto(id);
      changed = true;
    } catch {
      error = $_('photoError');
    }
    await refresh();
  }

  function close() {
    onclose(changed);
  }

  onMount(refresh);
  onDestroy(() => {
    for (const p of photos) URL.revokeObjectURL(p.url);
  });
</script>

<div class="gp-photos-manager" role="dialog" aria-modal="true" aria-label={$_('forGrownUps')}>
  <div class="gp-photos-card">
    <button class="gp-photos-close" type="button" aria-label={$_('close')} onclick={close}>✕</button>

    <h2 class="gp-photos-title">{$_('myPhotos')}</h2>

    <button class="gp-photos-add" type="button" onclick={() => inputEl?.click()}>
      ＋ {$_('addPhotos')}
    </button>
    <input
      class="gp-photos-input"
      type="file"
      multiple
      accept="image/*"
      bind:this={inputEl}
      onchange={handleFiles}
    />

    {#if error}
      <p class="gp-photos-error" role="alert">{error}</p>
    {/if}

    {#if photos.length === 0}
      <p class="gp-photos-empty">{$_('noPhotos')}</p>
    {:else}
      <div class="gp-photos-grid">
        {#each photos as photo (photo.id)}
          <div class="gp-photo-item">
            <img class="gp-photo-thumb" src={photo.url} alt={$_('photoName', { n: photo.seq })} />
            <button
              class="gp-photo-del"
              type="button"
              aria-label={$_('deletePhoto')}
              onclick={() => remove(photo.id)}
            >✕</button>
          </div>
        {/each}
      </div>
    {/if}

    <p class="gp-photos-note">{$_('photoStorageNote')}</p>
  </div>
</div>

<style>
  .gp-photos-manager {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(4, 8, 24, 0.72);
  }
  .gp-photos-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: min(92vw, 460px);
    max-height: 86vh;
    padding: 20px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    overflow: auto;
  }
  .gp-photos-close {
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
  .gp-photos-close:active { background: rgba(94, 234, 212, 0.25); border-color: var(--accent); }
  .gp-photos-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-hi);
  }
  .gp-photos-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 10px 24px;
    border-radius: 14px;
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
  }
  .gp-photos-add:active { transform: scale(0.95); }
  .gp-photos-input { display: none; }
  .gp-photos-error {
    margin: 0;
    max-width: 100%;
    font-size: 14px;
    font-weight: 600;
    color: #ffb4a2;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .gp-photos-empty {
    margin: 0;
    padding: 12px 0;
    font-size: 16px;
    color: var(--text-lo);
    text-align: center;
  }
  .gp-photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 8px;
    width: 100%;
  }
  .gp-photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.25);
  }
  .gp-photo-thumb {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .gp-photo-del {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--text-hi);
    background: rgba(4, 8, 24, 0.6);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
  }
  .gp-photo-del:active { background: rgba(255, 107, 107, 0.4); border-color: #ff6b6b; }
  .gp-photos-note {
    margin: 0;
    font-size: 13px;
    color: var(--text-lo);
    text-align: center;
  }
</style>
