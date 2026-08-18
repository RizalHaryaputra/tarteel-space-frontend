<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false })

const email     = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMsg  = ref('')
const api       = useApi()

useHead({
  title: 'Lupa Password — Tarteel Space',
  meta: [
    { name: 'description', content: 'Kirim tautan pemulihan kata sandi untuk akun Tarteel Space Anda.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap' },
  ]
})

let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.ts-auth-header', {
      y: -15,
      opacity: 0,
      duration: 0.6,
    })
    .from('.ts-auth-hero > *', {
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
    .from('.ts-auth-footer', {
      opacity: 0,
      duration: 0.5,
    }, '-=0.3')
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})

const handleSubmit = async () => {
  if (isLoading.value) return
  isLoading.value = true
  errorMsg.value  = ''

  try {
    await api.forgotPassword(email.value)
    isSuccess.value = true
  } catch (err: any) {
    errorMsg.value = err.message || 'Terjadi kesalahan saat mengirim link. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="ts-auth-root min-h-screen bg-dark-950 text-ink-0 font-sans flex flex-col justify-between items-center relative overflow-x-hidden selection:bg-primary-500 selection:text-dark-950 py-6">

    <!-- Top floating navigation bar -->
    <header class="ts-auth-header w-full max-w-5xl mx-auto px-6 flex justify-between items-center relative z-20">
      <NuxtLink to="/" class="inline-flex items-center gap-2 group cursor-pointer">
        <img src="/logo.png" alt="Tarteel Space Logo" class="w-6 h-6 rounded-[6px] object-contain" />
        <span class="font-display font-semibold text-sm tracking-tight text-ink-0">Tarteel<span class="text-primary-400">Space</span></span>
      </NuxtLink>

      <NuxtLink to="/login" class="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2 hover:text-ink-0 transition-colors py-1 px-3 rounded-full border border-white/5 bg-dark-900/60 hover:bg-dark-850">
        <span aria-hidden="true">←</span>
        <span>Masuk</span>
      </NuxtLink>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-[440px] px-4 sm:px-6 py-8 relative z-10 my-auto">
      
      <!-- Brand & Header -->
      <div class="ts-auth-hero text-center mb-8">
        <h1 class="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-ink-0 leading-tight">
          Lupa<em class="font-serif italic text-primary-400 font-normal ml-1.5">Password?</em>
        </h1>
        <p class="text-ink-1 mt-2 text-sm max-w-[34ch] mx-auto leading-relaxed">
          Masukkan email Anda dan kami akan mengirimkan link untuk mereset kata sandi.
        </p>
      </div>

      <!-- Auth Card (Tier-A Hallmark Style) -->
      <div class="ts-auth-card bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">

        <!-- Success State -->
        <div v-if="isSuccess" class="text-center py-2">
          <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="font-display font-semibold text-xl text-ink-0 mb-1.5">Cek Email Anda</h2>
          <p class="text-xs sm:text-sm text-ink-2 mb-6 leading-relaxed">
            Link pemulihan kata sandi telah dikirim ke <span class="text-ink-0 font-medium">{{ email }}</span>. Periksa juga folder <em>spam</em> bila belum masuk.
          </p>
          <NuxtLink
            to="/login"
            class="ts-auth-btn w-full bg-dark-950 border border-white/10 hover:border-white/20 hover:bg-dark-850 text-ink-0 font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-full transition-all block text-center"
          >
            ← Kembali ke Halaman Masuk
          </NuxtLink>
        </div>

        <!-- Form State -->
        <template v-else>
          <!-- Error Alert -->
          <div v-if="errorMsg"
            class="mb-5 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded-xl px-4 py-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Email Field -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Email Terdaftar</label>
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
                  class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="ts-auth-btn w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-dark-950 font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 relative overflow-hidden"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-dark-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span class="font-medium text-sm">{{ isLoading ? 'Mengirim...' : 'Kirim Link Pemulihan' }}</span>
              <span v-if="!isLoading" aria-hidden="true">→</span>
            </button>
          </form>

          <div class="mt-5 pt-5 border-t border-white/5 text-center">
            <p class="text-xs text-ink-3 leading-relaxed mb-3">
              *Hanya berlaku untuk akun yang didaftarkan manual dengan email & password.
            </p>
            <p class="text-xs text-ink-2">
              Ingat password Anda?
              <NuxtLink to="/login" class="font-medium text-primary-400 hover:text-primary-300 ml-1 transition-colors">
                Masuk di sini
              </NuxtLink>
            </p>
          </div>
        </template>
      </div>

    </main>

    <!-- Footer Copyright -->
    <footer class="ts-auth-footer w-full max-w-5xl mx-auto px-6 text-center font-mono text-xs text-ink-3 relative z-10">
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
