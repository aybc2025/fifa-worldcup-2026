import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // For GitHub Pages: set base to your repo name
  // e.g. base: '/worldcup-2026/'
  // For custom domain or root deploy: base: '/'
  base: '/worldcup-2026/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'World Cup 2026',
        short_name: 'WC2026',
        description: 'FIFA World Cup 2026 — Live scores, groups, knockout, teams',
        theme_color: '#00cec9',
        background_color: '#080c10',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/worldcup-2026/',
        scope: '/worldcup-2026/',
        icons: [
          {
            src: '/worldcup-2026/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'flags-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openfootball-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 30 }
            }
          }
        ]
      }
    })
  ]
})
