<script>
  const KNOWN = ['star', 'heart', 'butterfly', 'flower'];

  /**
   * @type {{ type?: 'star' | 'heart' | 'butterfly' | 'flower', size?: number }}
   * `type` must match the stamp ids in `#lib/paint/tools.js`.
   * The paper shadow belongs to the UI, never inside this SVG.
   */
  let { type = 'star', size = 56 } = $props();

  const symbol = $derived(KNOWN.includes(type) ? type : 'star');
</script>

<svg
  class="paint-stamp"
  width={size}
  height={size}
  viewBox="0 0 100 100"
  aria-hidden="true"
  focusable="false"
>
  <use href={`#paint-stamp-${symbol}`} />
</svg>

<style>
  .paint-stamp {
    display: block;
    overflow: visible;
  }
</style>
