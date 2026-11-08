<script>
  // The picnic bear. The SVG is decorative; the speech bubble is the visible
  // question and stays in the accessibility tree.
  import { _ } from '#lib/stores/locale.js';

  let { ask = $_('howMany'), size = 96, questionId = undefined } = $props();
</script>

<div class="bear" style:width="{size}px">
  <div class="bubble" id={questionId} data-testid="question">{ask}</div>
  <svg
    viewBox="0 0 120 100"
    width="100%"
    height="auto"
    aria-hidden="true"
    fill="none"
    stroke="#2A2035"
    stroke-width="2.4"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <circle cx="34" cy="26" r="12" fill="#A9702F" />
    <circle cx="86" cy="26" r="12" fill="#A9702F" />
    <circle cx="60" cy="40" r="30" fill="#C98A5E" />
    <ellipse cx="60" cy="52" rx="16" ry="12" fill="#F2C9A0" />
    <circle cx="48" cy="36" r="3" fill="#2A2035" stroke="none" />
    <circle cx="72" cy="36" r="3" fill="#2A2035" stroke="none" />
    <circle cx="60" cy="48" r="4" fill="#2A2035" stroke="none" />
    <path d="M52 56c4 4 12 4 16 0" />
    <path d="M24 74c14-10 58-10 72 0" stroke="#C98A5E" stroke-width="12" />
  </svg>
</div>

<style>
  .bear {
    position: relative;
    filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.35));
    pointer-events: none;
  }
  .bubble {
    position: absolute;
    left: 50%;
    top: -30px;
    transform: translateX(-50%);
    min-width: 72px;
    max-width: 150px;
    padding: 6px 10px;
    border-radius: 14px;
    background: #fff8ec;
    border: 3px solid #8a5a34;
    color: #4a2e1b;
    font-size: clamp(12px, 3.6vw, 15px);
    font-weight: 700;
    line-height: 1.15;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 4px 0 rgba(52, 28, 16, 0.35);
    z-index: 2;
  }
  .bubble::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -9px;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 9px solid #8a5a34;
  }
</style>
