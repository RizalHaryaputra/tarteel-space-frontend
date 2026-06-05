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
                ? {}
                : { 'Content-Type': 'application/json' }),
            ...(options.headers as Record<string, string> || {}),
        }

        const token = authStore.token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        })

        if (response.status === 401) {
            authStore.logout()
            router.push('/login')
            throw new Error('Sesi habis. Silakan login kembali.')
        }

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
            role: string
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

    const forgotPassword = (email: string) =>
        post<{ message: string }>('/auth/forgot-password', { email })

    const resetPassword = (token: string, new_password: string) =>
        post<{ message: string }>('/auth/reset-password', { token, new_password })

    // ── Letters endpoints ──────────────────────────────────────

    const getLetters = () =>
        get<Array<{
            id: number
            base_letter: string
            harakat: string
            pronunciation: string
            arabic_script: string
            model_label?: string
            audio_url?: string
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
            id: string
            letter_id: number
            base_letter: string
            harakat: string
            arabic_script: string
            accuracy_score: number
            top_prediction: string
            is_correct: boolean
            status_label: string
            feedback: string
            tajweed_grade: string
            top3_predictions: Array<{ label: string; score: number }>
        }>(url, form)
    }

    const getExplanation = (evalId: string) => {
        return get<{ explanation: string }>(`/evaluate/${evalId}/explain`)
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

    // ── Admin endpoints ─────────────────────────────────────────

    const getAdminStats = () =>
        get<{
            total_users: number
            total_evaluations: number
            average_accuracy: number
            total_feedbacks: number
            total_dataset_pool: number
        }>('/admin/stats')

    const getAdminUsers = (limit = 50, offset = 0) =>
        get<Array<{
            id: string
            name: string
            email: string
            role: string
            created_at: string
            total_evaluations: number
            average_accuracy: number
        }>>(`/admin/users?limit=${limit}&offset=${offset}`)

    const updateUserRole = (userId: string, role: string) =>
        request(`/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        })

    const deleteUser = (userId: string) =>
        request(`/admin/users/${userId}`, { method: 'DELETE' })

    const createLetter = (letter: { base_letter: string; harakat: string; pronunciation: string; arabic_script: string; model_label: string }) =>
        post<{ message: string; letter_id: number }>('/admin/letters', letter)

    const updateLetter = (letterId: number, letter: object) =>
        request(`/admin/letters/${letterId}`, {
            method: 'PUT',
            body: JSON.stringify(letter)
        })

    const deleteLetter = (letterId: number) =>
        request(`/admin/letters/${letterId}`, { method: 'DELETE' })

    const uploadLetterAudio = (letterId: number, audioBlob: Blob) => {
        const form = new FormData()
        form.append('audio', audioBlob, 'reference.wav')
        return post<{ message: string; audio_url: string }>(`/admin/letters/${letterId}/audio`, form)
    }

    const getAdminFeedbacks = (limit = 50, offset = 0) =>
        get<Array<{
            feedback_id: string
            comment: string
            created_at: string
            user_name: string
            user_email: string
            evaluation_id: string
            accuracy_score: number
            top_prediction: string
            top5_predictions: Array<{ label: string; score: number }>
            is_correct: boolean
            audio_url: string
            base_letter: string
            harakat: string
            arabic_script: string
            pronunciation: string
        }>>(`/admin/feedbacks?limit=${limit}&offset=${offset}`)

    const verifyDatasetPool = (data: { evaluation_id: string; verified_label: string; is_verified_correct: boolean; admin_notes?: string }) =>
        post<{ message: string }>('/admin/dataset-pool', data)

    const getDatasetPoolExport = () =>
        get<Array<{
            id: number
            evaluation_id: string
            verified_label: string
            is_verified_correct: boolean
            admin_notes: string | null
            verified_at: string
            audio_url: string
            accuracy_score: number
            top_prediction: string
            base_letter: string
            harakat: string
            original_target_label: string
        }>>('/admin/dataset-pool/export')

    // ── User Feedback endpoints ──────────────────────────────────────

    const submitFeedback = (evaluationId: string, comment: string) =>
        post<{ message: string; feedback_id: string }>('/feedback/', {
            evaluation_id: evaluationId,
            comment
        })

    return {
        // raw
        request, get, post,
        // auth
        login, register, forgotPassword, resetPassword,
        // letters
        getLetters, getLetter,
        // session
        startSession, endSession,
        // evaluate
        evaluate, getExplanation,
        // history
        getHistory, getWeeklyScores, getDashboard,
        // admin
        getAdminStats, getAdminUsers, updateUserRole, deleteUser,
        createLetter, updateLetter, deleteLetter, uploadLetterAudio,
        getAdminFeedbacks, verifyDatasetPool, getDatasetPoolExport,
        // feedback
        submitFeedback,
    }
}