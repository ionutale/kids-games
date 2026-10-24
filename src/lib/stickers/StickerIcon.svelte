<script>
  let { type, size = 64 } = $props();
</script>

<svg
  class="sticker-icon"
  viewBox="0 0 100 100"
  width={size}
  height={size}
  aria-hidden="true"
  focusable="false"
>
  <use href={`#sticker-${type}`} />
</svg>

<style>
  .sticker-icon {
    display: block;
    overflow: visible;
  }
</style>
