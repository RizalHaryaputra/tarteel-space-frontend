/**
 * Auth Store — mengelola state autentikasi secara global.
 *
 * State disimpan di localStorage agar tetap ada saat halaman di-refresh.
 * Diakses via useAuthStore() di seluruh aplikasi.
 */
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null as string | null,
        userId: null as string | null,
        userName: null as string | null,
    }),

    getters: {
        // true jika user sudah login
        isLoggedIn: (state) => !!state.token,

        // Ambil inisial nama untuk avatar
        initials: (state) => {
            if (!state.userName) return '?'
            return state.userName
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
        },
    },

    actions: {
        /**
         * Dipanggil setelah login berhasil.
         * Simpan token + info user ke state dan localStorage.
         */
        setAuth(token: string, userId: string, userName: string) {
            this.token = token
            this.userId = userId
            this.userName = userName

            // Persisten di localStorage
            if (import.meta.client) {
                localStorage.setItem('tarteel_token', token)
                localStorage.setItem('tarteel_user_id', userId)
                localStorage.setItem('tarteel_username', userName)
            }
        },

        /**
         * Dipanggil saat app dimuat — restore state dari localStorage.
         */
        restoreAuth() {
            if (!import.meta.client) return
            const token = localStorage.getItem('tarteel_token')
            const userId = localStorage.getItem('tarteel_user_id')
            const userName = localStorage.getItem('tarteel_username')
            if (token && userId && userName) {
                this.token = token
                this.userId = userId
                this.userName = userName
            }
        },

        /**
         * Logout — hapus semua state dan localStorage.
         */
        logout() {
            this.token = null
            this.userId = null
            this.userName = null
            if (import.meta.client) {
                localStorage.removeItem('tarteel_token')
                localStorage.removeItem('tarteel_user_id')
                localStorage.removeItem('tarteel_username')
            }
        },
    },
})