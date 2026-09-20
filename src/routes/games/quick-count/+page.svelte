<script>
  import TrainerLanding from '$lib/components/trainers/TrainerLanding.svelte';
  import { _ } from '$lib/stores/locale';
</script>

<TrainerLanding
  trainerId="quick-count"
  heroArt="true"
  showLevels={false}
  title={`🔢 ${$_('quickCount')}`}
  tagline={$_('howMany')}
  hero="🔢 🍓 🌟 🔢 ⭐ 🍋"
  accent="#FDBA74"
/>
