/**
 * Plugin ini dijalankan sekali saat aplikasi pertama kali dimuat di browser.
 * Tugasnya: restore token dari localStorage ke Pinia store
 * sehingga user tidak perlu login ulang setiap refresh halaman.
 */
export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    authStore.restoreAuth()
})