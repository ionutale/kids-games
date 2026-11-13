<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    SPACE_VIEWBOX,
    SPACE_REGIONS,
    SPACE_LINES,
    SPACE_DOTS,
    SPACE_SMILES
  } from './space.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={SPACE_VIEWBOX}
  regions={SPACE_REGIONS}
  lines={SPACE_LINES}
  dots={SPACE_DOTS}
  smiles={SPACE_SMILES}
/>
