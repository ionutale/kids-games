<script>
  import GrammarGame from '$lib/components/GrammarGame.svelte';

  let { data } = $props();
</script>

<GrammarGame level={data.level} seed={data.seed} />
