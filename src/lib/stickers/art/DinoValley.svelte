<script>
  const lakePath = 'M0 596 C28 574 58 580 88 568 C126 552 166 574 206 566 C236 560 254 582 246 610 C238 642 202 662 162 668 C112 674 62 662 30 644 C10 632 0 614 0 596 Z';

  const clouds = [
    { points: '24,132 44,112 70,116 88,132 80,146 36,148', fill: '#FFFDF5', opacity: 0.92 },
    { points: '42,128 60,116 78,122 84,134 50,138', fill: '#E4F5FF', opacity: 0.85 },
    { points: '176,104 196,88 220,94 236,108 226,120 184,120', fill: '#FFFDF5', opacity: 0.82 },
    { points: '190,102 208,94 224,100 228,110 198,112', fill: '#E4F5FF', opacity: 0.72 },
    { points: '300,214 318,198 340,204 354,218 344,230 308,230', fill: '#FFFDF5', opacity: 0.78 },
    { points: '316,214 332,206 346,212 350,222 320,224', fill: '#E4F5FF', opacity: 0.62 }
  ];

  const mountains = [
    { points: '0,560 34,438 68,468 104,396 138,454 168,500 198,560', fill: '#7E93B5' },
    { points: '0,560 22,486 58,510 88,466 118,516 150,560', fill: '#6C82A6' },
    { points: '206,560 238,438 270,470 306,392 340,454 366,420 390,444 390,560', fill: '#7187A7' },
    { points: '222,560 252,486 286,510 318,462 352,512 390,480 390,560', fill: '#5F7696' }
  ];

  const snow = [
    { points: '104,396 118,420 92,422', fill: '#EAF4FF' },
    { points: '306,392 322,418 292,420', fill: '#EAF4FF' },
    { points: '366,420 378,438 356,440', fill: '#EAF4FF' }
  ];

  const smoke = [
    { points: '88,300 66,264 88,224 122,190 158,214 152,252 126,292', fill: '#D9D2C7', opacity: 0.55 },
    { points: '104,284 90,252 108,220 134,204 148,228 136,260 116,286', fill: '#EFE8DC', opacity: 0.5 },
    { points: '72,312 56,286 70,260 92,268 96,294', fill: '#CFC7BB', opacity: 0.4 }
  ];

  const volcano = [
    { points: '8,560 40,440 78,340 92,360 60,470 35,560', fill: '#8A5C47' },
    { points: '78,340 108,300 138,340 172,440 190,560 150,560 128,420 100,470 60,470', fill: '#6D4A3B' },
    { points: '108,300 138,340 172,440 190,560 150,560 128,420', fill: '#4A302A' },
    { points: '78,340 108,300 122,340 104,390 88,370', fill: '#7B5341' }
  ];

  const lava = [
    { points: '96,326 108,310 120,326 114,338 102,338', fill: '#FF7A3D' },
    { points: '100,338 108,338 116,400 104,420 96,380', fill: '#FF7A3D' },
    { points: '88,338 96,338 90,380 82,370', fill: '#FFB45C' },
    { points: '116,338 124,338 132,390 122,410', fill: '#FFB45C' }
  ];

  const hills = [
    { points: '0,560 70,522 140,552 210,520 290,556 390,520 390,720 0,720', fill: '#73C45E' },
    { points: '0,620 60,590 130,612 200,586 280,616 390,586 390,740 0,740', fill: '#62B34F' }
  ];

  const lakeFacets = [
    { d: 'M0 610 C40 590 80 596 120 588 C170 578 220 590 260 584 L260 620 C220 640 160 650 110 646 C70 642 30 630 0 620 Z', fill: '#A8EEF5', opacity: 0.35 },
    { d: 'M0 630 C50 620 100 630 150 620 C190 612 230 620 260 614 L260 660 C210 670 150 672 100 664 C60 658 20 646 0 640 Z', fill: '#2E9FB8', opacity: 0.35 },
    { d: 'M80 590 C100 586 120 588 140 584 L150 600 C130 604 110 602 90 606 Z', fill: '#DFFBFF', opacity: 0.5 }
  ];

  const groundFacets = [
    { d: 'M0 700 C70 686 140 704 210 690 C280 678 340 694 390 686 L390 728 L0 728 Z', fill: '#5FAF4A', opacity: 0.55 },
    { d: 'M0 736 C80 720 160 736 240 724 C310 714 350 726 390 718 L390 780 L0 780 Z', fill: '#5FAF4A', opacity: 0.45 },
    { d: 'M0 800 C90 780 180 790 270 776 C330 766 370 778 390 772 L390 844 L0 844 Z', fill: '#3F7F3A' }
  ];

  const pines = [
    { x: -20, y: 560, s: 0.8 },
    { x: 20, y: 660, s: 0.58 },
    { x: 300, y: 540, s: 0.9 },
    { x: 270, y: 600, s: 0.55 },
    { x: 340, y: 600, s: 0.7 }
  ];

  const ferns = [
    { x: 0, y: 640, s: 0.7 },
    { x: 45, y: 680, s: 0.9 },
    { x: 120, y: 700, s: 0.5 },
    { x: 300, y: 690, s: 0.8 },
    { x: 355, y: 650, s: 0.55 }
  ];

  const rocks = [
    { x: 18, y: 650, s: 0.5 },
    { x: 214, y: 654, s: 0.4 },
    { x: 70, y: 716, s: 0.6 },
    { x: 250, y: 720, s: 0.35 }
  ];

  const flowers = [
    { x: 60, y: 660, s: 0.35 },
    { x: 100, y: 690, s: 0.5 },
    { x: 260, y: 700, s: 0.45 },
    { x: 330, y: 680, s: 0.4 }
  ];

  const grass = [
    { x: 135, y: 706, s: 0.4 },
    { x: 235, y: 710, s: 0.35 },
    { x: 300, y: 724, s: 0.3 }
  ];
</script>

<svg
  class="dino-valley"
  viewBox="0 0 390 844"
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
  focusable="false"
>
  <defs>
    <linearGradient id="dv-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#67C4EF" />
      <stop offset="0.42" stop-color="#B8E9FF" />
      <stop offset="0.72" stop-color="#FFE8C4" />
      <stop offset="1" stop-color="#FFD7A0" />
    </linearGradient>
    <linearGradient id="dv-lake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#79E1EF" />
      <stop offset="1" stop-color="#2E9FB8" />
    </linearGradient>
    <radialGradient id="dv-sun-glow">
      <stop offset="0" stop-color="#FFE8A3" stop-opacity="0.55" />
      <stop offset="1" stop-color="#FFE8A3" stop-opacity="0" />
    </radialGradient>
    <clipPath id="dv-lake-clip">
      <path d={lakePath} />
    </clipPath>

    <g id="dv-pine">
      <rect x="46" y="68" width="8" height="30" fill="#7A5135" />
      <path d="M50 0 L12 62 L88 62 Z" fill="#2F6B3A" />
      <path d="M50 18 L18 78 L82 78 Z" fill="#3F8A4A" />
      <path d="M50 36 L24 94 L76 94 Z" fill="#2F6B3A" />
    </g>

    <g id="dv-fern">
      <path d="M50 100 C48 74 49 48 53 24" stroke="#2F6B3A" stroke-width="3" fill="none" />
      <path d="M50 88 C32 82 20 70 16 54 C34 58 46 70 52 84 Z" fill="#4E9B45" />
      <path d="M50 88 C68 82 80 70 84 54 C66 58 54 70 48 84 Z" fill="#5FAF4A" />
      <path d="M50 72 C36 66 26 56 22 42 C38 46 48 58 52 68 Z" fill="#4E9B45" />
      <path d="M50 72 C64 66 74 56 78 42 C62 46 52 58 48 68 Z" fill="#5FAF4A" />
      <path d="M50 56 C40 50 32 42 30 30 C42 34 50 44 52 52 Z" fill="#4E9B45" />
      <path d="M50 56 C60 50 68 42 70 30 C58 34 50 44 48 52 Z" fill="#5FAF4A" />
      <path d="M50 40 C44 34 40 28 40 18 C48 22 52 30 52 36 Z" fill="#4E9B45" />
      <path d="M50 40 C56 34 60 28 60 18 C52 22 48 30 48 36 Z" fill="#5FAF4A" />
    </g>

    <g id="dv-rock">
      <path d="M10 80 L22 40 L52 26 L82 44 L90 80 Z" fill="#8A8F98" />
      <path d="M22 40 L52 26 L58 55 L34 62 Z" fill="#B4B9C0" />
      <path d="M58 55 L82 44 L90 80 L62 80 Z" fill="#6E737C" />
    </g>

    <g id="dv-flower">
      <path d="M50 100 V58" stroke="#3F7F3A" stroke-width="4" />
      <circle cx="50" cy="50" r="12" fill="#FFD166" />
      <circle cx="50" cy="50" r="5" fill="#FF8FA3" />
    </g>

    <g id="dv-grass">
      <path d="M50 100 C46 76 38 58 28 42" stroke="#3F7F3A" stroke-width="4" fill="none" />
      <path d="M50 100 C50 72 50 52 50 34" stroke="#4E9B45" stroke-width="4" fill="none" />
      <path d="M50 100 C54 76 62 58 72 42" stroke="#3F7F3A" stroke-width="4" fill="none" />
    </g>
  </defs>

  <rect width="390" height="844" fill="url(#dv-sky)" />

  <circle cx="310" cy="124" r="76" fill="url(#dv-sun-glow)" />
  <circle cx="310" cy="124" r="39" fill="#FFE28A" />
  <circle cx="310" cy="124" r="30" fill="#FFF0B8" />

  {#each clouds as cloud}
    <polygon points={cloud.points} fill={cloud.fill} opacity={cloud.opacity} />
  {/each}

  <path d="M238 298 A 62 62 0 0 1 362 298" fill="none" stroke="#FF8FA3" stroke-width="9" opacity="0.5" />
  <path d="M248 298 A 52 52 0 0 1 352 298" fill="none" stroke="#FFD166" stroke-width="9" opacity="0.5" />
  <path d="M258 298 A 42 42 0 0 1 342 298" fill="none" stroke="#7FD8FF" stroke-width="9" opacity="0.5" />

  <path d="M146 190 Q152 184 158 190" fill="none" stroke="#4A5A72" stroke-width="2.5" stroke-linecap="round" />
  <path d="M174 206 Q180 200 186 206" fill="none" stroke="#4A5A72" stroke-width="2.5" stroke-linecap="round" />
  <path d="M120 222 Q126 216 132 222" fill="none" stroke="#4A5A72" stroke-width="2.5" stroke-linecap="round" />

  <g id="dv-balloon">
    <path d="M82 190 C64 198 56 218 62 238 C66 252 76 260 82 266 C88 260 98 252 102 238 C108 218 100 198 82 190 Z" fill="#FF7A59" />
    <path d="M82 190 C74 206 74 244 82 266 C90 244 90 206 82 190 Z" fill="#FFE2A8" />
    <path d="M62 238 C70 232 94 232 102 238" stroke="#FFF3D1" stroke-width="3" fill="none" opacity="0.8" />
    <path d="M74 266 L76 282 L88 282 L90 266" stroke="#7A5135" stroke-width="2" fill="none" />
    <rect x="74" y="282" width="16" height="10" rx="2" fill="#8B5A3C" />
  </g>

  {#each mountains as mountain}
    <polygon points={mountain.points} fill={mountain.fill} />
  {/each}
  {#each snow as cap}
    <polygon points={cap.points} fill={cap.fill} />
  {/each}

  {#each smoke as puff}
    <polygon points={puff.points} fill={puff.fill} opacity={puff.opacity} />
  {/each}

  <circle cx="108" cy="320" r="56" fill="#FFB45C" opacity="0.12" />
  {#each volcano as facet}
    <polygon points={facet.points} fill={facet.fill} />
  {/each}
  <path d="M84 322 L108 300 L132 322 L122 340 L94 340 Z" fill="#3F2A26" />
  {#each lava as streak}
    <polygon points={streak.points} fill={streak.fill} />
  {/each}

  {#each hills as hill}
    <polygon points={hill.points} fill={hill.fill} />
  {/each}

  <path d={lakePath} fill="url(#dv-lake)" />
  <g clip-path="url(#dv-lake-clip)">
    {#each lakeFacets as facet}
      <path d={facet.d} fill={facet.fill} opacity={facet.opacity} />
    {/each}
  </g>
  <path
    d="M0 596 C28 574 58 580 88 568 C126 552 166 574 206 566 C236 560 254 582 246 610"
    fill="none"
    stroke="#F3E2B8"
    stroke-width="5"
    opacity="0.55"
  />

  <g id="dv-boat">
    <path d="M88 606 L124 606 L116 618 L96 618 Z" fill="#8B5A3C" />
    <path d="M106 566 L106 604" stroke="#7A5135" stroke-width="3" />
    <path d="M106 568 L126 600 L106 600 Z" fill="#FFF3D1" />
    <path d="M104 568 L84 598 L104 600 Z" fill="#FFE2A8" />
    <ellipse cx="106" cy="620" rx="22" ry="4" fill="#DFFBFF" opacity="0.35" />
  </g>

  <path d="M0 690 C70 672 140 694 210 680 C280 666 340 684 390 676 L390 844 L0 844 Z" fill="#4E9B42" />
  {#each groundFacets as facet}
    <path d={facet.d} fill={facet.fill} opacity={facet.opacity} />
  {/each}

  <path d="M150 844 L210 844 L220 780 C210 748 198 720 190 690 L166 690 C160 720 170 750 185 780 Z" fill="#D8B77A" />
  <path d="M170 844 L190 844 L198 790 C190 760 184 730 180 700 L172 700 C168 730 174 760 182 790 Z" fill="#C29A5E" opacity="0.55" />

  <polygon points="158,760 168,752 178,762 168,770" fill="#8A8F98" />
  <polygon points="190,736 198,730 206,740 198,746" fill="#B4B9C0" />
  <polygon points="174,708 181,702 188,710 181,716" fill="#6E737C" />

  {#each pines as pine}
    <use href="#dv-pine" transform={`translate(${pine.x} ${pine.y}) scale(${pine.s})`} />
  {/each}

  {#each ferns as fern}
    <use href="#dv-fern" transform={`translate(${fern.x} ${fern.y}) scale(${fern.s})`} />
  {/each}

  {#each rocks as rock}
    <use href="#dv-rock" transform={`translate(${rock.x} ${rock.y}) scale(${rock.s})`} />
  {/each}

  {#each flowers as flower}
    <use href="#dv-flower" transform={`translate(${flower.x} ${flower.y}) scale(${flower.s})`} />
  {/each}

  {#each grass as tuft}
    <use href="#dv-grass" transform={`translate(${tuft.x} ${tuft.y}) scale(${tuft.s})`} />
  {/each}
</svg>

<style>
  .dino-valley {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
