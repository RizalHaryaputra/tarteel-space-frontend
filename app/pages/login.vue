<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false })

const email       = ref('')
const password    = ref('')
const showPass    = ref(false)
const isLoading   = ref(false)
const errorMsg    = ref('')

const api       = useApi()
const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

useHead({
  title: 'Masuk — Tarteel Space',
  meta: [
    { name: 'description', content: 'Masuk ke akun Tarteel Space untuk melanjutkan latihan pelafalan Al-Qur\'an berbasis AI.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap' },
  ]
})

// Jika sudah login, langsung ke dashboard atau halaman tujuan
if (authStore.isLoggedIn) {
  let redirect = route.query.redirect as string || '/dashboard'
  if (!route.query.redirect && authStore.isAdmin) {
    redirect = '/admin'
  }
  navigateTo(redirect)
}

let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.ts-auth-split-card', {
      y: 30,
      opacity: 0,
      scale: 0.98,
      duration: 0.85,
      clearProps: 'all',
    })
    .from('.ts-auth-left > *', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
    }, '-=0.5')
    .from('.ts-auth-right form > *', {
      y: 15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      clearProps: 'all',
    }, '-=0.4')
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})

const handleLogin = async () => {
  if (isLoading.value) return
  errorMsg.value  = ''
  isLoading.value = true

  try {
    const data = await api.login(email.value, password.value)
    authStore.setAuth(data.access_token, data.user_id, data.user_name, data.role)

    // Redirect ke halaman yang dituju sebelumnya, atau admin/dashboard
    let redirect = route.query.redirect as string || '/dashboard'
    if (!route.query.redirect && data.role === 'admin') {
      redirect = '/admin'
    }
    router.push(redirect)
  } catch (err: any) {
    errorMsg.value = err.message || 'Login gagal. Periksa email dan password Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="ts-auth-root min-h-screen bg-dark-950 text-ink-0 font-sans flex flex-col justify-center items-center relative overflow-x-hidden selection:bg-primary-500 selection:text-dark-950 p-4 sm:p-6 lg:p-8">

    <!-- Main Container Card (Split 2-Column Showcase) -->
    <main class="w-full max-w-[1000px] my-auto relative z-10">
      <div class="ts-auth-split-card bg-dark-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 sm:p-4 lg:p-5 shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        <!-- Left Column: Visual Showcase Art Panel (Dark Palette Aligned with Landing Page) -->
        <div class="ts-auth-left hidden lg:flex lg:col-span-5 rounded-[22px] p-7 flex-col justify-between relative overflow-hidden text-ink-0 border border-white/10 shadow-inner">
          
          <!-- Top: Logo Brand & Back to Home Button -->
          <div class="relative z-10 flex items-center justify-between">
            <NuxtLink to="/" class="inline-flex items-center gap-2 group cursor-pointer">
              <img src="/logo.png" alt="Tarteel Space Logo" class="w-6 h-6 rounded-[6px] object-contain" />
              <span class="font-display font-semibold text-sm tracking-tight text-ink-0 group-hover:text-primary-400 transition-colors">Tarteel<span class="text-primary-400">Space</span></span>
            </NuxtLink>

            <NuxtLink to="/" class="inline-flex items-center gap-1 font-mono text-[11px] text-ink-2 hover:text-ink-0 transition-colors py-1 px-3 rounded-full border border-white/10 bg-dark-900/80 hover:bg-dark-850">
              <span aria-hidden="true">←</span>
              <span>Beranda</span>
            </NuxtLink>
          </div>

          <!-- Center Visual Accent -->
          <div class="my-auto py-8 relative z-10 flex flex-col items-center justify-center">
            <div class="relative w-28 h-28 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse"></div>
              <div class="relative w-24 h-24 rounded-2xl bg-dark-900/90 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <span class="text-4xl font-sans font-semibold text-ink-0 drop-shadow-md">بَ</span>
              </div>
              <div class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold tracking-wider shadow-lg">
                96.4%
              </div>
            </div>
          </div>

          <!-- Bottom Value Proposition -->
          <div class="relative z-10 space-y-2">
            <span class="font-mono text-[10px] text-primary-400 uppercase tracking-wider font-semibold">
              Evaluasi Pelafalan Hijaiyah
            </span>
            <h2 class="font-display font-semibold text-xl leading-snug text-ink-0">
              Sempurnakan makhraj & pelafalan Al-Qur'an secara presisi dengan <em class="font-serif italic text-primary-400 font-normal">AI.</em>
            </h2>
            <p class="text-xs text-ink-2 font-sans leading-relaxed">
              Dapatkan umpan balik akurasi seketika langsung dari mikrofon peramban Anda.
            </p>
          </div>
        </div>

        <!-- Right Column: Form Panel -->
        <div class="ts-auth-right lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
          
          <!-- Mobile Brand & Back Header (Visible on screens < 1024px) -->
          <div class="flex lg:hidden items-center justify-between mb-6 pb-4 border-b border-white/5">
            <NuxtLink to="/" class="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Tarteel Space Logo" class="w-5 h-5 rounded-[5px] object-contain" />
              <span class="font-display font-semibold text-sm tracking-tight text-ink-0">Tarteel<span class="text-primary-400">Space</span></span>
            </NuxtLink>

            <NuxtLink to="/" class="inline-flex items-center gap-1 font-mono text-[11px] text-ink-2 hover:text-ink-0 py-1 px-2.5 rounded-full border border-white/10 bg-dark-950">
              <span aria-hidden="true">←</span>
              <span>Beranda</span>
            </NuxtLink>
          </div>

          <div class="mb-6 sm:mb-8">
            <h1 class="font-display font-semibold text-2xl sm:text-3xl text-ink-0 tracking-tight">
              Selamat Datang<em class="font-serif italic text-primary-400 font-normal ml-1.5">Kembali</em>
            </h1>
            <p class="text-ink-1 mt-1.5 text-xs sm:text-sm leading-relaxed">
              Masuk ke akun Anda untuk melanjutkan latihan pelafalan Al-Qur'an.
            </p>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMsg"
            class="mb-5 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded-xl px-4 py-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-5">
            
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
              <div class="flex items-center justify-between">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Password</label>
                <NuxtLink to="/forgot-password" class="font-mono text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Lupa password?
                </NuxtLink>
              </div>
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
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-11 py-2.5 sm:py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
                />
                <button
                  type="button"
                  @click="showPass = !showPass"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-3 hover:text-ink-1 transition-colors"
                  aria-label="Toggle password"
                >
                  <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-if="showPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Button (Pill Shape Matching Landing Page .ts-btn--primary) -->
            <button
              type="submit"
              :disabled="isLoading"
              class="ts-auth-btn w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-dark-950 font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 relative overflow-hidden cursor-pointer"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-dark-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span class="font-medium text-sm">{{ isLoading ? 'Memproses...' : 'Masuk ke Akun' }}</span>
              <span v-if="!isLoading" aria-hidden="true">→</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="my-5 flex items-center gap-3">
            <span class="flex-1 border-b border-white/5"></span>
            <span class="font-mono text-[10px] text-ink-3 uppercase tracking-widest">Atau lanjutkan dengan</span>
            <span class="flex-1 border-b border-white/5"></span>
          </div>

          <!-- Social OAuth Buttons (Pill Shape) -->
          <div class="grid grid-cols-2 gap-3">
            <a
              :href="`${useRuntimeConfig().public.apiBase}/auth/login/google`"
              class="flex items-center justify-center gap-2 bg-dark-950 border border-white/10 hover:border-white/20 hover:bg-dark-850 text-ink-0 font-mono text-xs uppercase tracking-wider py-2.5 px-4 rounded-full transition-all"
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
              class="flex items-center justify-center gap-2 bg-dark-950 border border-white/10 hover:border-white/20 hover:bg-dark-850 text-ink-0 font-mono text-xs uppercase tracking-wider py-2.5 px-4 rounded-full transition-all"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          <!-- Footer Link inside card -->
          <p class="mt-6 text-center text-xs text-ink-2">
            Belum punya akun?
            <NuxtLink to="/register" class="font-medium text-primary-400 hover:text-primary-300 ml-1 transition-colors">
              Daftar sekarang
            </NuxtLink>
          </p>
        </div>

      </div>
    </main>

    <!-- Footer Copyright -->
    <footer class="w-full max-w-5xl mx-auto text-center font-mono text-xs text-ink-3 relative z-10 mt-4">
      © 2026 Tarteel Space · Proyek Skripsi Teknologi Informasi
    </footer>

  </div>
</template>

<style scoped>
/* Hairline grid background */
.ts-auth-root::before {
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
.ts-auth-root::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 550px at 25% 25%, rgba(37, 99, 235, 0.18), transparent 70%),
    radial-gradient(700px 450px at 75% 75%, rgba(56, 189, 248, 0.12), transparent 65%);
  pointer-events: none;
}

/* Split card outer subtle dashed border */
.ts-auth-split-card::before {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px dashed rgba(244, 246, 251, 0.07);
  border-radius: 30px;
  pointer-events: none;
}

/* Left Showcase Panel Dark Background */
.ts-auth-left {
  background: #0e121a;
  position: relative;
}

.ts-auth-left::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(244, 246, 251, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(244, 246, 251, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%);
  pointer-events: none;
}

.ts-auth-left::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(400px 300px at 30% 20%, rgba(37, 99, 235, 0.22), transparent 70%),
    radial-gradient(350px 250px at 70% 80%, rgba(56, 189, 248, 0.14), transparent 65%);
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