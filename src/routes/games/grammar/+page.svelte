<script>
  import TrainerLanding from '$lib/components/trainers/TrainerLanding.svelte';
  import { _ } from '$lib/stores/locale';
</script>

<TrainerLanding
  trainerId="grammar"
  showLevels={false}
  music={false}
  title={`✏️ ${$_('grammar')}`}
  tagline={$_('grammarTagline')}
  hero="🇮🇹 ✏️ 📖"
  accent="#86EFAC"
/>
