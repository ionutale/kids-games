<script>
  import TrainerLanding from '$lib/components/trainers/TrainerLanding.svelte';
  import { _ } from '$lib/stores/locale';
</script>

<TrainerLanding
  trainerId="speed-match"
  title={`🃏 ${$_('speedMatch')}`}
  tagline={`${$_('samePair')} · ${$_('diffPair')}`}
  hero="🃏 🍎🍎 🃏 🐶🐺 🃏"
  accent="#93C5FD"
/>
