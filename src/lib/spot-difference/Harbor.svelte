<script>
  // One harbor picture: illustrated backdrop, emoji props, found rings, the
  // idle hint pulse, the wrong-tap wobble and the pier cat.
  import HarborCat from './HarborCat.svelte';

  let {
    scene = [],
    side = 'left',
    diffs = [],
    found = [],
    hint = null,
    wrong = null,
    onpick = null,
    label = '',
    reduced = false,
    testid = null
  } = $props();

  function pick(event) {
    if (!onpick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onpick({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      px: event.clientX - rect.left,
      py: event.clientY - rect.top,
      w: rect.width,
      h: rect.height
    });
  }

  function ringPoints(diff) {
    if (diff.type === 'missing') {
      // The empty spot in Picture 2 is the answer; the ring there is dashed.
      return [{ x: diff.left.x, y: diff.left.y, ghost: side === 'right', badge: true }];
    }
    if (diff.type === 'moved' && diff.right) {
      return [
        {
          x: diff.left.x,
          y: diff.left.y,
          ghost: false,
          badge: side === 'left'
        },
        {
          x: diff.right.x,
          y: diff.right.y,
          ghost: false,
          badge: side === 'right'
        }
      ];
    }
    const point = diff[side] ?? diff.left;
    return [{ x: point.x, y: point.y, ghost: false, badge: true }];
  }

  function hintPoints(diff) {
    if (!diff) return [];
    if (diff.type === 'moved' && diff.right) {
      return [
        { x: diff.left.x, y: diff.left.y },
        { x: diff.right.x, y: diff.right.y }
      ];
    }
    return [{ x: diff.left.x, y: diff.left.y }];
  }

  const foundDiffs = $derived(diffs.filter((diff) => found.includes(diff.id)));
  const rings = $derived(foundDiffs.flatMap((diff) => ringPoints(diff).map((point) => ({ ...point, diff }))));
  const hints = $derived(hintPoints(hint));
</script>

<div
  class="harbor"
  class:calm={reduced}
  data-testid={testid}
  data-side={side}
  role="group"
  aria-label={label}
  onpointerdown={pick}
>
  <svg class="backdrop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <circle cx="82" cy="11" r="6.4" fill="#FFE9B8" opacity=".95" />
    <g fill="#FFFFFF" opacity=".85">
      <ellipse cx="16" cy="12" rx="10" ry="3.4" />
      <ellipse cx="24" cy="10" rx="6" ry="2.8" />
      <ellipse cx="60" cy="18" rx="8" ry="3" />
      <ellipse cx="66" cy="17" rx="5" ry="2.4" />
    </g>

    <g stroke="#2A2035" stroke-width="1" stroke-linejoin="round">
      <!-- Lighthouse on the left. -->
      <path d="M6 80 L10 26 L16 26 L20 80 Z" fill="#FFF8EC" />
      <path d="M9.6 40 L16.4 40 L17.8 54 L8.2 54 Z" fill="#E4572E" opacity=".9" />
      <path d="M8.9 62 L17.1 62 L18.2 72 L7.8 72 Z" fill="#E4572E" opacity=".9" />
      <rect x="9" y="19" width="8" height="7" rx="1.2" fill="#2A2035" />
      <circle cx="13" cy="22.5" r="2.4" fill="#FFE082" stroke="none" />
      <path d="M7 26h12" />
      <path d="M20 24 L34 14 L34 34 Z" fill="#FFF3C4" opacity=".28" stroke="none" />
      <path d="M6 24 L-8 14 L-8 34 Z" fill="#FFF3C4" opacity=".22" stroke="none" />
    </g>

    <ellipse cx="16" cy="81" rx="13" ry="4" fill="#7C6A55" opacity=".9" />
    <ellipse cx="7" cy="82" rx="8" ry="3" fill="#8D7A63" opacity=".9" />

    <!-- Distant sailboat and the little hut. -->
    <g>
      <path d="M46 52 L46 42 L56 52 Z" fill="#FFF8EC" stroke="#2A2035" stroke-width="1" />
      <path d="M43 53 L59 53 L56 57 L46 57 Z" fill="#8A5A34" stroke="#5A3A22" stroke-width="1" />
    </g>
    <g>
      <path d="M63 42h10l3 4H61z" fill="#5C8FA8" stroke="#2A2035" stroke-width="1" />
      <path d="M66 38v4" stroke="#2A2035" stroke-width="1" />
    </g>

    <!-- The pier on the right. -->
    <g>
      <rect x="66" y="62" width="38" height="4" fill="#A9702F" stroke="#5A3A22" stroke-width="1" />
      <rect x="68" y="66" width="2.4" height="16" fill="#6B4326" />
      <rect x="80" y="66" width="2.4" height="16" fill="#6B4326" />
      <rect x="92" y="66" width="2.4" height="16" fill="#6B4326" />
      <rect x="63" y="58" width="3" height="8" fill="#6B4326" />
    </g>

    <path d="M38 20 q2 -2 4 0 q2 -2 4 0" stroke="#4A5A6A" stroke-width="1.1" fill="none" />
    <path d="M56 30 q1.5 -1.5 3 0 q1.5 -1.5 3 0" stroke="#4A5A6A" stroke-width="1" fill="none" />

    <g stroke="#FFFFFF" stroke-width="0.8" opacity=".35">
      <path d="M4 66 q4 -2 8 0 q4 2 8 0" />
      <path d="M22 72 q4 -2 8 0 q4 2 8 0" />
      <path d="M40 68 q4 -2 8 0 q4 2 8 0" />
    </g>
  </svg>

  {#each scene as prop (prop.id)}
    <span
      class="prop"
      data-prop-id={prop.id}
      data-prop-x={prop.x}
      data-prop-y={prop.y}
      data-scale={prop.scale}
      data-diff-type={prop.diffType ?? undefined}
      style:left="{prop.x}%"
      style:top="{prop.y}%"
      style:transform="translate(-50%, -50%) scale({prop.scale})"
      aria-hidden="true"
    >{prop.emoji}</span>
  {/each}

  {#each rings as ring (ring.diff.id + '-' + ring.x + '-' + ring.y)}
    <span
      class="ring"
      class:ghost={ring.ghost}
      data-diff-id={ring.diff.id}
      data-diff-type={ring.diff.type}
      data-ghost={ring.ghost ? 'true' : undefined}
      style:left="{ring.x}%"
      style:top="{ring.y}%"
      aria-hidden="true"
    >
      {#if ring.badge}<span class="check">✓</span>{/if}
    </span>
  {/each}

  {#each hints as point, index (index)}
    <span
      class="hint"
      data-diff-id={hint?.id}
      style:left="{point.x}%"
      style:top="{point.y}%"
      aria-hidden="true"
    ></span>
  {/each}

  {#if wrong}
    {#key wrong.key}
      <span
        class="wrong"
        data-wrong="true"
        style:left="{wrong.x}%"
        style:top="{wrong.y}%"
        aria-hidden="true"
      ></span>
    {/key}
  {/if}

  <HarborCat {reduced} />
  {#if label}<span class="label">{label}</span>{/if}
</div>

<style>
  .harbor {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: 16px;
    border: 2px solid rgba(127, 216, 255, 0.45);
    background: linear-gradient(
      180deg,
      #cfeff4 0%,
      #a9dee9 42%,
      #6fb6c8 47%,
      #4a9cb4 76%,
      #ead9a8 77%,
      #f3e4ba 100%
    );
    box-shadow: inset 0 8px 20px rgba(0, 0, 0, 0.18), 0 6px 16px rgba(0, 0, 0, 0.22);
    touch-action: manipulation;
    user-select: none;
    cursor: pointer;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .prop {
    position: absolute;
    font-size: clamp(20px, 7.4vw, 30px);
    line-height: 1;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.18));
    pointer-events: none;
    z-index: 2;
  }
  .ring {
    position: absolute;
    width: clamp(38px, 13%, 58px);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 3px solid #57c785;
    background: rgba(87, 199, 133, 0.12);
    box-shadow: 0 0 0 3px rgba(87, 199, 133, 0.22), 0 0 14px rgba(87, 199, 133, 0.55);
    z-index: 4;
    pointer-events: none;
    animation: ringIn 0.24s ease-out;
  }
  .ring.ghost {
    border-style: dashed;
    background: rgba(87, 199, 133, 0.05);
  }
  .check {
    position: absolute;
    right: -7px;
    top: -9px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #57c785;
    color: #10301f;
    font-size: 11px;
    font-weight: 800;
    display: grid;
    place-items: center;
  }
  .hint {
    position: absolute;
    width: clamp(40px, 15%, 62px);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 3px dashed #ffd479;
    box-shadow: 0 0 16px rgba(255, 212, 121, 0.55);
    z-index: 3;
    pointer-events: none;
    animation: hintPulse 1.3s ease-in-out infinite;
  }
  .wrong {
    position: absolute;
    width: 30px;
    height: 30px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 3px solid #e88a8a;
    z-index: 4;
    pointer-events: none;
    animation: wrongWobble 0.42s ease-in-out;
  }
  .label {
    position: absolute;
    left: 6px;
    top: 6px;
    z-index: 5;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: #2a2035;
    background: rgba(255, 248, 236, 0.88);
    padding: 2px 7px;
    border-radius: 999px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  .calm .ring {
    animation: none;
  }
  .calm .hint {
    animation: none;
    opacity: 0.8;
  }
  .calm .wrong {
    animation: wrongFade 0.4s ease-out;
  }

  @keyframes ringIn {
    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  @keyframes hintPulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.92); }
    50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.06); }
  }
  @keyframes wrongWobble {
    0%, 100% { transform: translate(-50%, -50%) translateX(0); opacity: 1; }
    25% { transform: translate(-50%, -50%) translateX(-5px); }
    70% { transform: translate(-50%, -50%) translateX(5px); opacity: 0.6; }
  }
  @keyframes wrongFade {
    from { opacity: 1; }
    to { opacity: 0; }
  }
</style>
