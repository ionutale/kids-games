<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    ROBOT_VIEWBOX,
    ROBOT_REGIONS,
    ROBOT_LINES,
    ROBOT_DOTS,
    ROBOT_SMILES
  } from './robot.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={ROBOT_VIEWBOX}
  regions={ROBOT_REGIONS}
  lines={ROBOT_LINES}
  dots={ROBOT_DOTS}
  smiles={ROBOT_SMILES}
/>
