<script>
  import { settings } from '$lib/stores/settings';

  let age = $derived($settings.ageLevel);
</script>

<div class="age-selector">
  <span class="label">Age:</span>
  <div class="slider-track">
    <input
      type="range"
      min="2"
      max="5"
      step="1"
      value={age}
      oninput={(e) => settings.setAge(parseInt(e.target.value))}
      aria-label="Select age level"
    />
  </div>
  <span class="value">{age}</span>
</div>

<style>
  .age-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255,255,255,0.8);
    border-radius: 20px;
    font-size: 16px;
  }
  .label { font-weight: 600; }
  .slider-track {
    width: 80px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
  }
  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .value {
    font-weight: 700;
    font-size: 18px;
    min-width: 20px;
    text-align: center;
    color: var(--color-primary);
  }
</style>
