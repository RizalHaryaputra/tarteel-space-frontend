/**
 * useApi — composable dasar untuk semua request ke FastAPI backend.
 *
 * Secara otomatis:
 *  - Membaca base URL dari runtimeConfig
 *  - Menyisipkan Authorization header jika token tersedia
 *  - Menangani error 401 (redirect ke login)
 */
export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const router = useRouter()

    const BASE_URL = config.public.apiBase

    /**
     * Request umum — semua method (GET, POST, dll)
     */
    const request = async <T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {
        const headers: Record<string, string> = {
            ...(options.body instanceof FormData
                ? {}                                          // jangan set Content-Type untuk FormData
                : { 'Content-Type': 'application/json' }),
            ...(options.headers as Record<string, string> || {}),
        }

        // Sisipkan token JWT jika ada
        const token = authStore.token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        })

        // Token kadaluarsa → paksa logout & redirect ke login
        if (response.status === 401) {
            authStore.logout()
            router.push('/login')
            throw new Error('Sesi habis. Silakan login kembali.')
        }

        // Error lainnya
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || `Error ${response.status}`)
        }

        // Kembalikan JSON, atau null jika response kosong (204)
        if (response.status === 204) return null as T
        return response.json() as Promise<T>
    }

    // ── Shorthand methods ──────────────────────────────────────

    const get = <T = any>(endpoint: string) =>
        request<T>(endpoint, { method: 'GET' })

    const post = <T = any>(endpoint: string, body: object | FormData) =>
        request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        })

    // ── Auth endpoints ─────────────────────────────────────────

    const login = (email: string, password: string) => {
        // FastAPI OAuth2 butuh form-urlencoded, bukan JSON
        const form = new URLSearchParams()
        form.append('username', email)   // FastAPI pakai 'username'
        form.append('password', password)
        return request<{
            access_token: string
            user_name: string
            user_id: string
        }>('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString(),
        })
    }

    const register = (name: string, email: string, password: string) =>
        post<{ message: string; user_id: string }>('/auth/register', {
            name, email, password,
        })

    // ── Letters endpoints ──────────────────────────────────────

    const getLetters = () =>
        get<Array<{
            id: number
            base_letter: string
            harakat: string
            pronunciation: string
            arabic_script: string
        }>>('/letters/')

    const getLetter = (id: number) =>
        get(`/letters/${id}`)

    // ── Session endpoints ──────────────────────────────────────

    const startSession = () =>
        post<{ session_id: string; started_at: string }>('/sessions/start', {})

    const endSession = (sessionId: string) =>
        post(`/sessions/${sessionId}/end`, {})

    // ── Evaluation endpoint ────────────────────────────────────

    const evaluate = (letterId: number, audioBlob: Blob, sessionId?: string) => {
        const form = new FormData()
        form.append('audio', audioBlob, 'recording.wav')
        const url = sessionId
            ? `/evaluate/${letterId}?session_id=${sessionId}`
            : `/evaluate/${letterId}`
        return post<{
            letter_id: number
            base_letter: string
            harakat: string
            arabic_script: string
            accuracy_score: number
            top_prediction: string
            is_correct: boolean
            status_label: string
            feedback: string
        }>(url, form)
    }

    // ── History endpoints ──────────────────────────────────────

    const getHistory = (limit = 20, offset = 0) =>
        get(`/history/?limit=${limit}&offset=${offset}`)

    const getWeeklyScores = () =>
        get<Array<{
            tanggal: string
            rata_rata: number
            jumlah_latihan: number
        }>>('/history/weekly')

    const getDashboard = () =>
        get<{
            total_latihan: number
            rata_rata_akurasi: number
            streak_hari: number
            huruf_terlemah: string | null
            huruf_terkuat: string | null
        }>('/history/dashboard')

    return {
        // raw
        request, get, post,
        // auth
        login, register,
        // letters
        getLetters, getLetter,
        // session
        startSession, endSession,
        // evaluate
        evaluate,
        // history
        getHistory, getWeeklyScores, getDashboard,
    }
}