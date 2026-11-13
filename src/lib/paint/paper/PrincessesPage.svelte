<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    PRINCESSES_VIEWBOX,
    PRINCESSES_REGIONS,
    PRINCESSES_LINES,
    PRINCESSES_DOTS,
    PRINCESSES_SMILES
  } from './princesses.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={PRINCESSES_VIEWBOX}
  regions={PRINCESSES_REGIONS}
  lines={PRINCESSES_LINES}
  dots={PRINCESSES_DOTS}
  smiles={PRINCESSES_SMILES}
/>
