/// <reference types="vitest/config" />
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';
import { withPwa } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    // PWA v2 wraps the SvelteKit plugin so the service worker is built before
    // the static adapter writes `public/`.
    withPwa(
      {
        // Root-absolute /_app URLs. Relative ones break when the cached shell is
        // opened at /games/..., which is every offline deep link and refresh.
        paths: { relative: false },

        adapter: adapter({
          pages: 'public',
          assets: 'public',
          fallback: 'index.html',
          precompress: false,
          strict: true
        })
      },
      {
        registerType: 'autoUpdate',
        // Registration is done from the root layout. SvelteKit writes index.html
        // after Vite's HTML transform, so an injected registerSW.js tag never lands.
        injectRegister: null,
        // The artwork sheets and puzzle photos are large but still cacheable.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        kit: {
          // SPA: the static adapter emits index.html after this plugin runs.
          // Precache it as "/" so every /games/* navigation works offline.
          adapterFallback: 'index.html',
          spa: { fallbackMapping: '/' }
        },
        manifest: {
          name: 'Kids Games',
          short_name: 'KidsGames',
          description: 'Touch games for ages 2-5',
          theme_color: '#4FC3F7',
          background_color: '#E3F2FD',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        },
        workbox: {
          // Every built file and every static asset, so one online visit caches
          // the whole app: routes, fonts, puzzle photos, and sounds.
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,gif,mp3,wav,ogg,woff,woff2,webmanifest,json,txt}'
          ],
          globIgnores: ['**/.DS_Store', 'server/**', '**/*.map'],
          // This is a pure SPA: there is no `prerendered/` output, and PWA v2
          // injects that glob by default. A non-matching glob is a warning here,
          // not a build failure.
          globStrict: false,
          navigateFallback: '/'
        }
      }
    )
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js']
  }
});
