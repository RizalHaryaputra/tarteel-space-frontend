/**
 * Middleware 'auth' — hanya bisa diakses oleh user yang sudah login.
 *
 * Cara pakai di halaman yang ingin diproteksi:
 *   definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    // Pulihkan status autentikasi dari Cookie (SSR) jika belum terisi
    if (!authStore.isLoggedIn) {
        authStore.restoreAuth()
    }

    if (!authStore.isLoggedIn) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
})
