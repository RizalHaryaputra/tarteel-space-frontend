/**
 * Middleware 'admin' — memproteksi halaman agar hanya bisa diakses oleh Admin.
 * Jika belum login, redirect ke halaman login.
 * Jika sudah login tapi bukan admin, redirect ke dashboard utama.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }

  if (!authStore.isAdmin) {
    return navigateTo('/dashboard')
  }
})
