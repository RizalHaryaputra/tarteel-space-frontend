// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
 
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
 
  // Konfigurasi URL backend — baca dari .env
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ],
      // Fix: Set dark background di level HTML agar tidak ada white flash saat transisi
      style: [
        { innerHTML: 'html, body { background-color: #0b0d11; margin: 0; padding: 0; }' }
      ]
    },
  },
 
  devtools: { enabled: true },
})
 