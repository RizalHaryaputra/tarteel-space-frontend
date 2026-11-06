/**
 * Auth Store — mengelola state autentikasi secara global.
 *
 * Menggunakan kombinasi useCookie (untuk persistensi SSR & mencegah redirect saat refresh)
 * dan localStorage (sebagai cadangan client-side).
 * Diakses via useAuthStore() di seluruh aplikasi.
 */
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null as string | null,
        userId: null as string | null,
        userName: null as string | null,
        role: null as string | null,
        avatarUrl: null as string | null,
    }),

    getters: {
        // true jika user sudah login
        isLoggedIn: (state) => !!state.token,

        // true jika user adalah admin
        isAdmin: (state) => state.role === 'admin',

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
         * Simpan token + info user ke state, Cookies (SSR-ready), dan localStorage.
         */
        setAuth(token: string, userId: string, userName: string, role: string = 'user', avatarUrl: string | null = null) {
            this.token = token
            this.userId = userId
            this.userName = userName
            this.role = role
            this.avatarUrl = avatarUrl

            // 1. Simpan ke Cookie agar langsung terbaca di Server-Side Rendering (SSR) saat refresh
            const cookieOptions = {
                maxAge: 60 * 60 * 24 * 7, // 7 hari
                path: '/',
                sameSite: 'lax' as const,
            }

            try {
                const tokenCookie = useCookie<string | null>('tarteel_token', cookieOptions)
                const userIdCookie = useCookie<string | null>('tarteel_user_id', cookieOptions)
                const userNameCookie = useCookie<string | null>('tarteel_username', cookieOptions)
                const roleCookie = useCookie<string | null>('tarteel_role', cookieOptions)
                const avatarCookie = useCookie<string | null>('tarteel_avatar_url', cookieOptions)

                tokenCookie.value = token
                userIdCookie.value = userId
                userNameCookie.value = userName
                roleCookie.value = role
                avatarCookie.value = avatarUrl || null
            } catch {
                // Fallback jika dipanggil di luar konteks Nuxt
            }

            // 2. Persistensi cadangan di localStorage
            if (import.meta.client) {
                localStorage.setItem('tarteel_token', token)
                localStorage.setItem('tarteel_user_id', userId)
                localStorage.setItem('tarteel_username', userName)
                localStorage.setItem('tarteel_role', role)
                if (avatarUrl) localStorage.setItem('tarteel_avatar_url', avatarUrl)
                else localStorage.removeItem('tarteel_avatar_url')
            }
        },

        /**
         * Dipanggil saat app/middleware dimuat — restore state dari Cookie & localStorage.
         * Bekerja di sisi Server (SSR) via useCookie dan Client via localStorage.
         */
        restoreAuth() {
            let token: string | null = null
            let userId: string | null = null
            let userName: string | null = null
            let role: string = 'user'
            let avatarUrl: string | null = null

            // 1. Coba baca dari useCookie (tersedia di SSR maupun Client)
            try {
                const cookieOptions = {
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                    sameSite: 'lax' as const,
                }
                const tokenCookie = useCookie<string | null>('tarteel_token', cookieOptions)
                const userIdCookie = useCookie<string | null>('tarteel_user_id', cookieOptions)
                const userNameCookie = useCookie<string | null>('tarteel_username', cookieOptions)
                const roleCookie = useCookie<string | null>('tarteel_role', cookieOptions)
                const avatarCookie = useCookie<string | null>('tarteel_avatar_url', cookieOptions)

                if (tokenCookie.value) token = tokenCookie.value
                if (userIdCookie.value) userId = userIdCookie.value
                if (userNameCookie.value) userName = userNameCookie.value
                if (roleCookie.value) role = roleCookie.value
                if (avatarCookie.value) avatarUrl = avatarCookie.value

                // 2. Jika di client cookies belum ada (misal login sebelum migrasi cookie), baca dari localStorage
                if (import.meta.client && !token) {
                    const localToken = localStorage.getItem('tarteel_token')
                    const localUserId = localStorage.getItem('tarteel_user_id')
                    const localUserName = localStorage.getItem('tarteel_username')
                    const localRole = localStorage.getItem('tarteel_role') || 'user'
                    const localAvatar = localStorage.getItem('tarteel_avatar_url')

                    if (localToken && localUserId && localUserName) {
                        token = localToken
                        userId = localUserId
                        userName = localUserName
                        role = localRole
                        avatarUrl = localAvatar

                        // Sinkronkan balik ke cookies agar refresh berikutnya langsung aman di SSR
                        tokenCookie.value = token
                        userIdCookie.value = userId
                        userNameCookie.value = userName
                        roleCookie.value = role
                        avatarCookie.value = avatarUrl
                    }
                }
            } catch {
                // Fallback jika useCookie tidak tersedia
                if (import.meta.client) {
                    token = localStorage.getItem('tarteel_token')
                    userId = localStorage.getItem('tarteel_user_id')
                    userName = localStorage.getItem('tarteel_username')
                    role = localStorage.getItem('tarteel_role') || 'user'
                    avatarUrl = localStorage.getItem('tarteel_avatar_url')
                }
            }

            if (token && userId && userName) {
                this.token = token
                this.userId = userId
                this.userName = userName
                this.role = role
                this.avatarUrl = avatarUrl
            }
        },

        /**
         * Logout — hapus semua state, Cookie, dan localStorage.
         */
        logout() {
            this.token = null
            this.userId = null
            this.userName = null
            this.role = null
            this.avatarUrl = null

            try {
                const cookieOptions = { path: '/' }
                useCookie('tarteel_token', cookieOptions).value = null
                useCookie('tarteel_user_id', cookieOptions).value = null
                useCookie('tarteel_username', cookieOptions).value = null
                useCookie('tarteel_role', cookieOptions).value = null
                useCookie('tarteel_avatar_url', cookieOptions).value = null
            } catch {
                // Ignore
            }

            if (import.meta.client) {
                localStorage.removeItem('tarteel_token')
                localStorage.removeItem('tarteel_user_id')
                localStorage.removeItem('tarteel_username')
                localStorage.removeItem('tarteel_role')
                localStorage.removeItem('tarteel_avatar_url')
            }
        },
    },
})
