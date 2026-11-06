/**
 * Plugin Autentikasi Universal (Server + Client).
 *
 * Dijalankan pada awal siklus request (SSR) dan hidrasi (Client).
 * Bertugas memulihkan sesi autentikasi dari Cookies (dan sinkronisasi localStorage)
 * ke Pinia store sebelum route middleware dieksekusi, sehingga user tidak terlempar
 * ke halaman login saat me-refresh halaman.
 */
export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    authStore.restoreAuth()
})

