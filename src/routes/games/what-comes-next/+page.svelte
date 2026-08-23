<script>
  import TrainerLanding from '$lib/components/trainers/TrainerLanding.svelte';
  import { _ } from '$lib/stores/locale';
</script>

<TrainerLanding
  trainerId="what-comes-next"
  title={`🔁 ${$_('whatComesNext')}`}
  tagline={$_('whatsNext')}
  hero="🍎🍌🍎🍌 ❓ 🔁"
  accent="#6EE7B7"
/>
