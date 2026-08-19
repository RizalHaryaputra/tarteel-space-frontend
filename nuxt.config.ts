// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
 
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: [
    '~/assets/css/fonts.css',
  ],
 
  // Konfigurasi URL backend — baca dari .env
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap',
        },
      ],
      // Fix: Set dark background di level HTML agar tidak ada white flash saat transisi
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
})