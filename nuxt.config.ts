// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
 
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/main.css',
  ],
 
  // Konfigurasi URL backend — baca dari .env
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Tarteel Space — Evaluasi Pelafalan Hijaiyah Berbasis AI',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b0d11' },
        { name: 'description', content: 'Tarteel Space mengevaluasi akurasi pelafalan huruf hijaiyah Anda secara real-time menggunakan teknologi Deep Learning — tanpa batasan waktu atau tempat.' },
        { name: 'keywords', content: 'tarteel space, belajar tajwid, makhraj huruf, hijaiyah AI, evaluasi pelafalan quran, deep learning cnn, tartil quran' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'canonical', href: 'https://tarteelspace.web.id/' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
        },
      ],
      style: [
        {
          innerHTML: `
            html, body { background-color: #0b0d11; margin: 0; padding: 0; }
            html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          `
        }
      ]
    },
  },
 
  devtools: { enabled: true },

  nitro: {
    compressPublicAssets: true,
  },

  routeRules: {
    // Cache static immutable assets untuk 1 tahun (performa & audit PageSpeed)
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/logo.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  vite: {
    server: {
      allowedHosts: true
    }
  }
})