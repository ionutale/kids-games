<svg class="paint-stamp-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <!-- Paper-cut bodies. The white die-cut border is a stroked copy of each
         body drawn underneath the fills, so interior cuts stay invisible. -->
    <g id="paint-stamp-body-star">
      <path
        d="M 50 8 L 61.5 35 L 90 38.5 L 68.5 58 L 75 86.5 L 50 72 L 25 86.5 L 31.5 58 L 10 38.5 L 38.5 35 Z"
        fill="#FFD54F"
      />
      <path d="M 50 20 L 56 36 L 43 36 Z" fill="#FFE28A" />
    </g>

    <g id="paint-stamp-body-heart">
      <path
        d="M 50 89 C 25 71 11 54 14 39 C 17 24 37 20 50 36 C 63 20 83 24 86 39 C 89 54 75 71 50 89 Z"
        fill="#FF8FB1"
      />
      <path d="M 31 37 C 27 43 29 52 36 61 C 30 50 28 42 35 36 Z" fill="#FFC9DA" />
      <circle cx="38" cy="32" r="3.2" fill="#FFC9DA" />
    </g>

    <g id="paint-stamp-body-butterfly">
      <path d="M 46 47 C 34 27 14 20 10 32 C 6 44 22 55 44 55 Z" fill="#8ECDF5" />
      <path d="M 54 47 C 66 27 86 20 90 32 C 94 44 78 55 56 55 Z" fill="#8ECDF5" />
      <path d="M 45 55 C 30 57 18 67 22 77 C 26 87 40 81 47 65 Z" fill="#B9E4FF" />
      <path d="M 55 55 C 70 57 82 67 78 77 C 74 87 60 81 53 65 Z" fill="#B9E4FF" />
      <path d="M 47 41 C 47 35 53 35 53 41 L 53 75 C 53 81 47 81 47 75 Z" fill="#8A6FD1" />
      <circle cx="50" cy="32" r="6.5" fill="#8A6FD1" />
    </g>

    <g id="paint-stamp-body-flower">
      <circle cx="50" cy="27" r="13" fill="#FFB3C8" />
      <circle cx="71" cy="42" r="13" fill="#FFB3C8" />
      <circle cx="63" cy="67" r="13" fill="#FFB3C8" />
      <circle cx="37" cy="67" r="13" fill="#FFB3C8" />
      <circle cx="29" cy="42" r="13" fill="#FFB3C8" />
      <circle cx="50" cy="50" r="13" fill="#FFD54F" />
      <circle cx="50" cy="50" r="6" fill="#FFE28A" />
    </g>
  </defs>

  <symbol id="paint-stamp-star" viewBox="0 0 100 100">
    <use
      href="#paint-stamp-body-star"
      stroke="#FFFDF5"
      stroke-width="9"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <use href="#paint-stamp-body-star" />
    <circle cx="44" cy="50" r="3.4" fill="#3A2E28" />
    <circle cx="56" cy="50" r="3.4" fill="#3A2E28" />
    <path d="M 43 59 Q 50 65 57 59" stroke="#3A2E28" stroke-width="3" fill="none" stroke-linecap="round" />
  </symbol>

  <symbol id="paint-stamp-heart" viewBox="0 0 100 100">
    <use
      href="#paint-stamp-body-heart"
      stroke="#FFFDF5"
      stroke-width="9"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <use href="#paint-stamp-body-heart" />
  </symbol>

  <symbol id="paint-stamp-butterfly" viewBox="0 0 100 100">
    <use
      href="#paint-stamp-body-butterfly"
      stroke="#FFFDF5"
      stroke-width="9"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <use href="#paint-stamp-body-butterfly" />
    <circle cx="28" cy="36" r="4" fill="#FFF3D1" opacity="0.9" />
    <circle cx="72" cy="36" r="4" fill="#FFF3D1" opacity="0.9" />
    <circle cx="32" cy="70" r="3" fill="#FFF3D1" opacity="0.9" />
    <circle cx="68" cy="70" r="3" fill="#FFF3D1" opacity="0.9" />
    <path d="M 46 26 C 43 21 39 18 35 17" stroke="#8A6FD1" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <path d="M 54 26 C 57 21 61 18 65 17" stroke="#8A6FD1" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <circle cx="34" cy="16" r="2.2" fill="#8A6FD1" />
    <circle cx="66" cy="16" r="2.2" fill="#8A6FD1" />
  </symbol>

  <symbol id="paint-stamp-flower" viewBox="0 0 100 100">
    <use
      href="#paint-stamp-body-flower"
      stroke="#FFFDF5"
      stroke-width="9"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <use href="#paint-stamp-body-flower" />
    <circle cx="46" cy="46" r="2.6" fill="#FFF3D1" />
    <circle cx="54" cy="54" r="2.6" fill="#FFF3D1" />
    <circle cx="56" cy="46" r="2" fill="#F7C33E" />
    <circle cx="44" cy="54" r="2" fill="#F7C33E" />
  </symbol>
</svg>

<style>
  .paint-stamp-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }
</style>
