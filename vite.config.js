import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      // Registration is done from the root layout. SvelteKit writes index.html
      // after Vite's HTML transform, so an injected registerSW.js tag never lands.
      injectRegister: null,
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
        navigateFallback: '/',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ]
});
