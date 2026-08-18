<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false }) // Halaman register berdiri sendiri (tanpa sidebar layout)

const name            = ref('')
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const showPass        = ref(false)
const showConfirmPass = ref(false)
const isLoading       = ref(false)
const errorMsg        = ref('')
const successMsg      = ref('')

const api       = useApi()
const router    = useRouter()
const authStore = useAuthStore()

useHead({
  title: 'Daftar Akun — Tarteel Space',
  meta: [
    { name: 'description', content: 'Daftar akun baru di Tarteel Space untuk mulai melatih dan menyempurnakan pelafalan Al-Qur\'an berbasis AI.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap' },
  ]
})

if (authStore.isLoggedIn) navigateTo('/dashboard')

let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.ts-register-header', {
      y: -15,
      opacity: 0,
      duration: 0.6,
    })
    .from('.ts-register-hero > *', {
      y: 20,
      opacity: 0,
      duration: 0.65,
      stagger: 0.08,
    }, '-=0.35')
    .from('.ts-auth-card', {
      y: 25,
      opacity: 0,
      scale: 0.98,
      duration: 0.75,
      clearProps: 'all',
    }, '-=0.45')
    .from('.ts-register-footer', {
      opacity: 0,
      duration: 0.5,
    }, '-=0.3')
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})

const handleRegister = async () => {
  if (isLoading.value) return
  errorMsg.value   = ''
  successMsg.value = ''

  // Validasi password
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Password dan konfirmasi password tidak cocok.'
    return
  }
  if (password.value.length < 8) {
    errorMsg.value = 'Password minimal harus 8 karakter.'
    return
  }

  isLoading.value = true
  try {
    // 1. Daftarkan akun
    await api.register(name.value, email.value, password.value)

    // 2. Langsung login otomatis dengan kredensial yang sama
    const data = await api.login(email.value, password.value)
    authStore.setAuth(data.access_token, data.user_id, data.user_name, data.role)

    // 3. Langsung masuk ke dashboard
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || 'Pendaftaran akun gagal. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="ts-register-root min-h-screen bg-dark-950 text-ink-0 font-sans flex flex-col justify-between items-center relative overflow-x-hidden selection:bg-primary-500 selection:text-dark-950 py-6">

    <!-- Top floating navigation bar -->
    <header class="ts-register-header w-full max-w-5xl mx-auto px-6 flex justify-between items-center relative z-20">
      <NuxtLink to="/" class="inline-flex items-center gap-2 group cursor-pointer">
        <img src="/logo.png" alt="Tarteel Space Logo" class="w-6 h-6 rounded-[6px] object-contain" />
        <span class="font-display font-semibold text-sm tracking-tight text-ink-0">Tarteel<span class="text-primary-400">Space</span></span>
      </NuxtLink>

      <NuxtLink to="/" class="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2 hover:text-ink-0 transition-colors py-1 px-3 rounded-full border border-white/5 bg-dark-900/60 hover:bg-dark-850">
        <span aria-hidden="true">←</span>
        <span>Beranda</span>
      </NuxtLink>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-[460px] px-4 sm:px-6 py-6 relative z-10 my-auto">
      
      <!-- Brand & Header -->
      <div class="ts-register-hero text-center mb-6">
        <!-- <div class="inline-flex items-center gap-2 py-1 px-3 border border-white/10 bg-dark-900 rounded-full font-mono text-[11px] text-primary-400 mb-3.5" role="status">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
          <span>PENDAFTARAN AKUN</span>
        </div> -->
        <h1 class="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-ink-0 leading-tight">
          Buat Akun<em class="font-serif italic text-primary-400 font-normal ml-1.5">Baru</em>
        </h1>
        <p class="text-ink-1 mt-1.5 text-sm max-w-[34ch] mx-auto leading-relaxed">
          Daftar sekarang untuk memulai evaluasi pelafalan hijaiyah dengan AI.
        </p>
      </div>

      <!-- Auth Card (Tier-A Hallmark Style) -->
      <div class="ts-auth-card bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">

        <!-- Success Alert -->
        <div v-if="successMsg"
          class="mb-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl px-4 py-3" role="status">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMsg }}</span>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMsg"
          class="mb-4 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded-xl px-4 py-3" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">

          <!-- Name Field -->
          <div class="space-y-1.5">
            <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Nama Lengkap</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="name"
                type="text"
                required
                placeholder="Ahmad Rizal"
                autocomplete="name"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="space-y-1.5">
            <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@email.com"
                autocomplete="email"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                required
                placeholder="Minimal 8 karakter"
                autocomplete="new-password"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-11 py-2.5 sm:py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-3 hover:text-ink-1 transition-colors"
                :aria-label="showPass ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="space-y-1.5">
            <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Konfirmasi Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                :type="showConfirmPass ? 'text' : 'password'"
                required
                placeholder="Ulangi password"
                autocomplete="new-password"
                :class="[
                  'w-full bg-dark-950 border text-ink-0 text-sm rounded-xl pl-10 pr-11 py-2.5 sm:py-3 focus:outline-none transition-all placeholder:text-ink-3 font-sans',
                  confirmPassword && confirmPassword !== password
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40'
                    : 'border-white/10 hover:border-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50'
                ]"
              />
              <button
                type="button"
                @click="showConfirmPass = !showConfirmPass"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-3 hover:text-ink-1 transition-colors"
                :aria-label="showConfirmPass ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <svg v-if="!showConfirmPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="confirmPassword && confirmPassword !== password" class="font-mono text-[11px] text-rose-400 mt-1">
              Password dan konfirmasi password tidak cocok
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="ts-auth-btn w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-dark-950 font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 relative overflow-hidden mt-2"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-dark-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span class="font-medium text-sm">{{ isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}</span>
            <span v-if="!isLoading" aria-hidden="true">→</span>
          </button>

        </form>

        <!-- Divider -->
        <div class="my-5 flex items-center gap-3">
          <span class="flex-1 border-b border-white/5"></span>
          <span class="font-mono text-[10px] text-ink-3 uppercase tracking-widest">Atau</span>
          <span class="flex-1 border-b border-white/5"></span>
        </div>

        <!-- Social OAuth -->
        <div class="grid grid-cols-2 gap-3">
          <a
            :href="`${useRuntimeConfig().public.apiBase}/auth/login/google`"
            class="flex items-center justify-center gap-2 bg-dark-950 border border-white/10 hover:border-white/20 hover:bg-dark-850 text-ink-0 font-mono text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </a>
          
          <a
            :href="`${useRuntimeConfig().public.apiBase}/auth/login/github`"
            class="flex items-center justify-center gap-2 bg-dark-950 border border-white/10 hover:border-white/20 hover:bg-dark-850 text-ink-0 font-mono text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        <!-- Footer link inside card -->
        <p class="mt-5 text-center text-xs text-ink-2">
          Sudah punya akun?
          <NuxtLink to="/login" class="font-medium text-primary-400 hover:text-primary-300 ml-1 transition-colors">
            Masuk di sini
          </NuxtLink>
        </p>
      </div>

    </main>

    <!-- Footer Copyright -->
    <footer class="ts-register-footer w-full max-w-5xl mx-auto px-6 text-center font-mono text-xs text-ink-3 relative z-10">
      © 2026 Tarteel Space · Proyek Skripsi Teknologi Informasi
    </footer>

  </div>
</template>

<style scoped>
/* Hairline grid background (DNA from Hallmark / Landing Page) */
.ts-register-root::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(244, 246, 251, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(244, 246, 251, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%);
  pointer-events: none;
}

/* Ambient radial glow */
.ts-register-root::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(800px 500px at 30% 20%, rgba(37, 99, 235, 0.16), transparent 70%),
    radial-gradient(600px 400px at 70% 80%, rgba(56, 189, 248, 0.12), transparent 65%);
  pointer-events: none;
}

/* Auth card outer subtle dashed border */
.ts-auth-card::before {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px dashed rgba(244, 246, 251, 0.07);
  border-radius: 22px;
  pointer-events: none;
}

/* Shine sweep animation on primary button */
.ts-auth-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.22) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.ts-auth-btn:hover::before {
  transform: translateX(100%);
}
</style>