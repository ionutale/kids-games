<script>
  import TrainerLanding from '$lib/components/trainers/TrainerLanding.svelte';
  import { _ } from '$lib/stores/locale';
</script>

<TrainerLanding
  trainerId="focus-tap"
  heroArt="true"
  title={`🎯 ${$_('focusTap')}`}
  tagline={$_('catchTarget', { e: '🍎' })}
  hero="🎯 ⭐ 🍎 ⭐ 🐶 ⭐ 🎯"
  accent="#F87171"
/>
