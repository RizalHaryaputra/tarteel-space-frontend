<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const authStore = useAuthStore()
const router = useRouter()

// Reactive state
const showDetails = ref(false)
const copied = ref(false)
const isDev = import.meta.dev

// Ambil kode status
const statusCode = computed(() => {
  const code = Number(props.error?.statusCode)
  return isNaN(code) || code === 0 ? 500 : code
})

// Konfigurasi konten error berdasarkan status code
interface ErrorMeta {
  code: number | string
  badge: string
  title: string
  italicAccent: string
  description: string
  solution: string
  icon: 'not-found' | 'forbidden' | 'unauthorized' | 'server' | 'timeout' | 'generic'
  accentColor: 'blue' | 'amber' | 'rose' | 'emerald'
}

const errorConfig = computed<ErrorMeta>(() => {
  const code = statusCode.value

  switch (code) {
    case 404:
      return {
        code: 404,
        badge: 'HTTP 404 · Not Found',
        title: 'Halaman Tidak Ditemukan',
        italicAccent: 'tersesat di antariksa',
        description: 'Halaman atau rute yang Anda tuju tidak ditemukan di server kami. Tautan mungkin telah kedaluwarsa, dipindahkan, atau alamat URL yang dimasukkan salah.',
        solution: 'Periksa kembali penulisan URL atau kembali ke halaman utama untuk melanjutkan navigasi.',
        icon: 'not-found',
        accentColor: 'blue',
      }
    case 401:
      return {
        code: 401,
        badge: 'HTTP 401 · Unauthorized',
        title: 'Sesi Tidak Terautentikasi',
        italicAccent: 'perlu login kembali',
        description: 'Sesi akun Anda telah berakhir atau Anda belum masuk ke Tarteel Space. Halaman ini memerlukan identitas akun aktif.',
        solution: 'Silakan masuk ke akun Anda untuk mendapatkan izin akses ke fitur ini.',
        icon: 'unauthorized',
        accentColor: 'amber',
      }
    case 403:
      return {
        code: 403,
        badge: 'HTTP 403 · Forbidden',
        title: 'Akses Ditolak',
        italicAccent: 'hak akses terbatas',
        description: 'Akun Anda tidak memiliki izin yang memadai untuk membuka halaman atau data ini (khusus Administrator atau peran tertentu).',
        solution: 'Jika Anda yakin ini adalah kekeliruan, silakan hubungi pengelola sistem atau beralih ke akun yang berwenang.',
        icon: 'forbidden',
        accentColor: 'rose',
      }
    case 408:
      return {
        code: 408,
        badge: 'HTTP 408 · Request Timeout',
        title: 'Waktu Permintaan Habis',
        italicAccent: 'koneksi terputus',
        description: 'Koneksi jaringan memakan waktu terlalu lama untuk merespons. Server memutuskan sambungan untuk menjaga stabilitas.',
        solution: 'Pastikan koneksi internet Anda stabil, lalu muat ulang halaman ini.',
        icon: 'timeout',
        accentColor: 'amber',
      }
    case 429:
      return {
        code: 429,
        badge: 'HTTP 429 · Too Many Requests',
        title: 'Batas Permintaan Terlampaui',
        italicAccent: 'harap jeda sejenak',
        description: 'Terlalu banyak permintaan yang dikirimkan dalam kurun waktu singkat. Sistem membatasi sementara demi keamanan dan performa.',
        solution: 'Silakan tunggu beberapa detik sebelum mencoba kembali interaksi Anda.',
        icon: 'timeout',
        accentColor: 'amber',
      }
    case 500:
      return {
        code: 500,
        badge: 'HTTP 500 · Internal Server Error',
        title: 'Terjadi Kendala pada Server',
        italicAccent: 'sedang kami selidiki',
        description: 'Sistem Tarteel Space mengalami kesalahan tak terduga saat memproses permintaan Anda. Tenang, data latihan Anda tetap aman tersimpan.',
        solution: 'Tim teknis kami otomatis menerima laporan kendala ini. Silakan coba muat ulang halaman beberapa saat lagi.',
        icon: 'server',
        accentColor: 'rose',
      }
    case 502:
    case 503:
    case 504:
      return {
        code,
        badge: `HTTP ${code} · Service Unavailable`,
        title: 'Layanan Sedang Tidak Tersedia',
        italicAccent: 'pemeliharaan berkala',
        description: 'Server aplikasi atau kecerdasan buatan (AI) Tarteel Space sedang dalam pemeliharaan berkala atau mengalami lonjakan antrean pemrosesan.',
        solution: 'Kami sedang mengoptimalkan server kembali. Silakan coba lagi dalam beberapa menit.',
        icon: 'server',
        accentColor: 'amber',
      }
    default:
      return {
        code,
        badge: `HTTP ${code} · Error`,
        title: 'Terjadi Kendala Teknis',
        italicAccent: 'kesalahan tak terduga',
        description: props.error?.message || props.error?.statusMessage || 'Aplikasi mendeteksi anomali pada pemuatan halaman ini.',
        solution: 'Coba muat ulang halaman atau kembali ke beranda untuk memulai kembali.',
        icon: 'generic',
        accentColor: 'blue',
      }
  }
})

// URL default untuk kembali
const homeTarget = computed(() => {
  if (authStore.isLoggedIn) {
    return authStore.isAdmin ? '/admin' : '/dashboard'
  }
  return '/'
})

const homeLabel = computed(() => {
  if (authStore.isLoggedIn) {
    return authStore.isAdmin ? 'Ke Portal Admin' : 'Ke Dashboard'
  }
  return 'Kembali ke Beranda'
})

// Actions
const handleClearError = (target?: string) => {
  clearError({ redirect: target || homeTarget.value })
}

const handleReload = () => {
  if (import.meta.client) {
    clearError()
    window.location.reload()
  } else {
    clearError({ redirect: '/' })
  }
}

const handleGoBack = () => {
  if (import.meta.client && window.history.length > 1) {
    clearError()
    router.back()
  } else {
    handleClearError()
  }
}

const copyErrorDetails = async () => {
  if (!import.meta.client) return
  const text = [
    `Status Code: ${statusCode.value}`,
    `Message: ${props.error?.message || props.error?.statusMessage || 'Unknown'}`,
    `URL: ${props.error?.url || window.location.href}`,
    `Timestamp: ${new Date().toISOString()}`,
    props.error?.stack ? `\nStack:\n${props.error.stack}` : ''
  ].filter(Boolean).join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    // Fallback if clipboard fails
  }
}

useHead({
  title: computed(() => `${statusCode.value} — ${errorConfig.value.title} | Tarteel Space`),
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: computed(() => errorConfig.value.description) }
  ]
})
</script>

<template>
  <div class="ts-error-root min-h-screen bg-dark-950 text-ink-0 font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-500 selection:text-white antialiased">
    <!-- Ambient Celestial Lighting Background -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div
        class="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full blur-[140px] opacity-25"
        :class="{
          'bg-primary-500': errorConfig.accentColor === 'blue',
          'bg-amber-500': errorConfig.accentColor === 'amber',
          'bg-rose-500': errorConfig.accentColor === 'rose',
          'bg-emerald-500': errorConfig.accentColor === 'emerald'
        }"
      ></div>
      <div class="absolute bottom-0 right-10 w-[420px] h-[320px] bg-primary-900/30 rounded-full blur-[120px] opacity-40"></div>
      <!-- Subtle Grid Overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px] opacity-60"></div>
    </div>

    <!-- Top Navigation Header -->
    <header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
      <button
        @click="handleClearError('/')"
        class="inline-flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg"
      >
        <img src="/logo.png" alt="Tarteel Space Logo" class="w-7 h-7 rounded-lg object-contain shadow-md" />
        <span class="font-display font-semibold text-base tracking-tight text-ink-0 group-hover:text-primary-400 transition-colors">
          Tarteel<span class="text-primary-400">Space</span>
        </span>
      </button>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-dark-900/90 border border-white/10 text-ink-2 shadow-sm">
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-primary-400': errorConfig.accentColor === 'blue',
              'bg-amber-400': errorConfig.accentColor === 'amber',
              'bg-rose-400': errorConfig.accentColor === 'rose',
              'bg-emerald-400': errorConfig.accentColor === 'emerald'
            }"
          ></span>
          <span>Status: {{ statusCode }}</span>
        </span>
      </div>
    </header>

    <!-- Main Error Content Container -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div class="w-full max-w-2xl text-center flex flex-col items-center">

        <!-- Giant Floating Holographic Status Code -->
        <div class="relative mb-2 select-none">
          <div
            class="font-mono font-bold text-7xl sm:text-9xl tracking-tighter opacity-15 bg-gradient-to-b from-white via-ink-1 to-transparent bg-clip-text text-transparent transform -translate-y-2 pointer-events-none"
          >
            {{ statusCode }}
          </div>
          
          <!-- Context Icon Center Overlay -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-dark-900/90 border flex items-center justify-center shadow-2xl backdrop-blur-xl"
              :class="{
                'border-primary-500/30 text-primary-400 shadow-primary-500/10': errorConfig.accentColor === 'blue',
                'border-amber-500/30 text-amber-400 shadow-amber-500/10': errorConfig.accentColor === 'amber',
                'border-rose-500/30 text-rose-400 shadow-rose-500/10': errorConfig.accentColor === 'rose',
                'border-emerald-500/30 text-emerald-400 shadow-emerald-500/10': errorConfig.accentColor === 'emerald'
              }"
            >
              <!-- 404 Not Found Icon -->
              <svg v-if="errorConfig.icon === 'not-found'" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125 0 1.125-1.5 1.5-1.5 2.25" />
              </svg>

              <!-- 401 Unauthorized Icon -->
              <svg v-else-if="errorConfig.icon === 'unauthorized'" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>

              <!-- 403 Forbidden Icon -->
              <svg v-else-if="errorConfig.icon === 'forbidden'" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>

              <!-- 500 / 502 / 503 Server Icon -->
              <svg v-else-if="errorConfig.icon === 'server'" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.25A3 3 0 018.1 4h7.8a3 3 0 012.35 1.25l2.1 3.3a4.5 4.5 0 01.9 2.7" />
              </svg>

              <!-- Timeout Icon -->
              <svg v-else-if="errorConfig.icon === 'timeout'" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <!-- Generic Alert Icon -->
              <svg v-else class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pill Badge -->
        <div class="mb-4">
          <span
            class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-medium border"
            :class="{
              'bg-primary-950/80 border-primary-500/30 text-primary-300': errorConfig.accentColor === 'blue',
              'bg-amber-950/80 border-amber-500/30 text-amber-300': errorConfig.accentColor === 'amber',
              'bg-rose-950/80 border-rose-500/30 text-rose-300': errorConfig.accentColor === 'rose',
              'bg-emerald-950/80 border-emerald-500/30 text-emerald-300': errorConfig.accentColor === 'emerald'
            }"
          >
            {{ errorConfig.badge }}
          </span>
        </div>

        <!-- Error Heading -->
        <h1 class="font-display font-bold text-2xl sm:text-4xl text-ink-0 tracking-tight leading-tight mb-3">
          {{ errorConfig.title }}
          <span class="block sm:inline font-serif italic text-primary-400 font-normal">
            — {{ errorConfig.italicAccent }}.
          </span>
        </h1>

        <!-- Error Description -->
        <p class="font-sans text-sm sm:text-base text-ink-1 leading-relaxed max-w-xl mb-2">
          {{ errorConfig.description }}
        </p>

        <!-- Suggested Solution Note -->
        <p class="font-sans text-xs sm:text-sm text-ink-2 max-w-lg mb-8">
          {{ errorConfig.solution }}
        </p>

        <!-- Primary & Secondary Interactive Action Buttons -->
        <div class="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          
          <!-- Special Action for 401 Unauthorized -->
          <button
            v-if="statusCode === 401"
            @click="handleClearError('/login')"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/25 active:scale-[0.98] cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Masuk ke Akun</span>
          </button>

          <!-- Primary Home / Dashboard Action -->
          <button
            v-else
            @click="handleClearError()"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/25 active:scale-[0.98] cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>{{ homeLabel }}</span>
          </button>

          <!-- Reload / Retry Action for Server / Timeout Errors -->
          <button
            v-if="[500, 502, 503, 504, 408].includes(statusCode)"
            @click="handleReload"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm text-ink-1 hover:text-ink-0 bg-dark-850 hover:bg-dark-800 border border-white/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Muat Ulang Halaman</span>
          </button>

          <!-- Back Action -->
          <button
            v-else
            @click="handleGoBack"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm text-ink-1 hover:text-ink-0 bg-dark-850 hover:bg-dark-800 border border-white/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>
        </div>

        <!-- Collapsible Technical Debug Information (Hanya muncul saat Development) -->
        <div
          v-if="isDev"
          class="w-full max-w-xl text-left border border-white/10 rounded-2xl bg-dark-900/80 backdrop-blur-md overflow-hidden"
        >
          <button
            @click="showDetails = !showDetails"
            class="w-full px-4 py-3 flex items-center justify-between text-xs font-mono text-ink-2 hover:text-ink-1 transition-colors cursor-pointer select-none"
            :aria-expanded="showDetails"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <span>Detail Diagnostik & Teknis</span>
            </span>
            <span class="flex items-center gap-1.5 text-[11px]">
              <span>{{ showDetails ? 'Sembunyikan' : 'Tampilkan' }}</span>
              <svg
                class="w-3.5 h-3.5 transform transition-transform duration-200"
                :class="{ 'rotate-180': showDetails }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </button>

          <div v-show="showDetails" class="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div class="bg-dark-950/80 p-2.5 rounded-lg border border-white/5">
                <span class="text-ink-3 block text-[10px] uppercase tracking-wider">Status Code</span>
                <span class="text-ink-0 font-semibold">{{ statusCode }} ({{ errorConfig.badge }})</span>
              </div>
              <div class="bg-dark-950/80 p-2.5 rounded-lg border border-white/5 truncate">
                <span class="text-ink-3 block text-[10px] uppercase tracking-wider">URL Permintaan</span>
                <span class="text-ink-1 truncate block" :title="error?.url || '—'">{{ error?.url || 'Internal' }}</span>
              </div>
            </div>

            <!-- Error Message Field -->
            <div v-if="error?.message" class="bg-dark-950/80 p-3 rounded-lg border border-white/5 text-xs font-mono">
              <span class="text-ink-3 block text-[10px] uppercase tracking-wider mb-1">Pesan Kesalahan</span>
              <p class="text-rose-400 break-words leading-relaxed">{{ error.message }}</p>
            </div>

            <!-- Stack Trace (jika tersedia di dev mode atau uncaught exception) -->
            <div v-if="error?.stack" class="bg-dark-950/80 p-3 rounded-lg border border-white/5 text-xs font-mono">
              <span class="text-ink-3 block text-[10px] uppercase tracking-wider mb-1">Stack Trace</span>
              <pre class="text-[11px] text-ink-2 overflow-x-auto max-h-48 whitespace-pre leading-normal">{{ error.stack }}</pre>
            </div>

            <!-- Action Bar in Debug Drawer -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-[11px] font-mono text-ink-3">
                Sertakan detail ini jika melaporkan masalah ke pengembang.
              </span>
              <button
                @click="copyErrorDetails"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium bg-dark-850 hover:bg-dark-800 text-ink-1 hover:text-ink-0 border border-white/10 transition-colors cursor-pointer"
              >
                <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                <svg v-else class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{{ copied ? 'Tersalin!' : 'Salin Laporan' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Footer Help & Quick Navigation -->
    <footer class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-ink-2">
      <div class="flex items-center gap-2">
        <span>&copy; {{ new Date().getFullYear() }} Tarteel Space. Evaluasi Pelafalan Hijaiyah Real-Time.</span>
      </div>
      <div class="flex items-center gap-6 font-mono text-[11px]">
        <button @click="handleClearError('/')" class="hover:text-ink-0 transition-colors cursor-pointer">Beranda</button>
        <button @click="handleClearError('/dashboard')" class="hover:text-ink-0 transition-colors cursor-pointer">Latihan</button>
        <a href="mailto:support@tarteelspace.web.id" class="text-primary-400 hover:text-primary-300 transition-colors">Bantuan Teknis</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.ts-error-root {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>

