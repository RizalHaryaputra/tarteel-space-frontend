/**
 * Middleware 'auth' — hanya bisa diakses oleh user yang sudah login.
 *
 * Cara pakai di halaman yang ingin diproteksi:
 *   definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if (!authStore.isLoggedIn) {
        return navigateTo(`/login?redirect=${to.fullPath}`)
    }
})