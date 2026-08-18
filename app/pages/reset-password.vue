<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false })

const route     = useRoute()
const router    = useRouter()
const api       = useApi()

const token           = computed(() => route.query.token as string || '')
const newPassword     = ref('')
const confirmPass     = ref('')
const showPass        = ref(false)
const showConfirmPass = ref(false)
const isLoading       = ref(false)
const isSuccess       = ref(false)
const errorMsg        = ref('')

const confirmPassClass = computed(() => {
  if (confirmPass.value && confirmPass.value !== newPassword.value) {
    return 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40'
  }
  return 'border-white/10 hover:border-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50'
})

useHead({
  title: 'Reset Password — Tarteel Space',
  meta: [
    { name: 'description', content: 'Buat kata sandi baru untuk akun Tarteel Space Anda.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap' },
  ]
})

// Jika tidak ada token di URL, redirect ke forgot-password
onMounted(() => {
  if (!token.value) {
    navigateTo('/forgot-password')
  }
})

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

const handleSubmit = async () => {
  if (isLoading.value) return
  errorMsg.value = ''

  if (newPassword.value.length < 8) {
    errorMsg.value = 'Password baru minimal 8 karakter.'
    return
  }
  if (newPassword.value !== confirmPass.value) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }

  isLoading.value = true
  try {
    await api.resetPassword(token.value, newPassword.value)
    isSuccess.value = true
    // Redirect ke login setelah 3 detik
    setTimeout(() => router.push('/login'), 3000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Tautan tidak valid atau sudah kedaluwarsa.'
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
          
          <!-- Top: Logo Brand & Back to Login Button -->
          <div class="relative z-10 flex items-center justify-between">
            <NuxtLink to="/" class="inline-flex items-center gap-2 group cursor-pointer">
              <img src="/logo.png" alt="Tarteel Space Logo" class="w-6 h-6 rounded-[6px] object-contain" />
              <span class="font-display font-semibold text-sm tracking-tight text-ink-0 group-hover:text-primary-400 transition-colors">Tarteel<span class="text-primary-400">Space</span></span>
            </NuxtLink>

            <NuxtLink to="/login" class="inline-flex items-center gap-1 font-mono text-[11px] text-ink-2 hover:text-ink-0 transition-colors py-1 px-3 rounded-full border border-white/10 bg-dark-900/80 hover:bg-dark-850">
              <span aria-hidden="true">←</span>
              <span>Masuk</span>
            </NuxtLink>
          </div>

          <!-- Center Visual Accent -->
          <div class="my-auto py-8 relative z-10 flex flex-col items-center justify-center">
            <div class="w-20 h-20 rounded-2xl bg-dark-900/90 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <!-- Bottom Value Proposition -->
          <div class="relative z-10 space-y-2">
            <span class="font-mono text-[10px] text-primary-400 uppercase tracking-wider font-semibold">
              Perlindungan Akun
            </span>
            <h2 class="font-display font-semibold text-xl leading-snug text-ink-0">
              Amankan kata sandi baru untuk menjaga progres dan riwayat evaluasi <em class="font-serif italic text-primary-400 font-normal">Anda.</em>
            </h2>
            <p class="text-xs text-ink-2 font-sans leading-relaxed">
              Gunakan kombinasi minimal 8 karakter yang kuat dan mudah diingat.
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

            <NuxtLink to="/login" class="inline-flex items-center gap-1 font-mono text-[11px] text-ink-2 hover:text-ink-0 py-1 px-2.5 rounded-full border border-white/10 bg-dark-950">
              <span aria-hidden="true">←</span>
              <span>Masuk</span>
            </NuxtLink>
          </div>

          <!-- Success State -->
          <div v-if="isSuccess" class="text-center py-4 sm:py-6">
            <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="font-display font-semibold text-2xl text-ink-0 mb-2">Password Diperbarui!</h2>
            <p class="text-xs sm:text-sm text-ink-2 mb-6 leading-relaxed max-w-[36ch] mx-auto">
              Kata sandi Anda telah berhasil diubah. Anda akan diarahkan ke halaman masuk secara otomatis...
            </p>
            <NuxtLink
              to="/login"
              class="ts-auth-btn w-full max-w-xs mx-auto bg-primary-500 hover:bg-primary-400 text-dark-950 font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/25 block text-center text-sm"
            >
              Masuk Sekarang →
            </NuxtLink>
          </div>

          <!-- Form State -->
          <template v-else>
            <div class="mb-5 sm:mb-6">
              <h1 class="font-display font-semibold text-2xl sm:text-3xl text-ink-0 tracking-tight">
                Kata Sandi<em class="font-serif italic text-primary-400 font-normal ml-1.5">Baru</em>
              </h1>
              <p class="text-ink-1 mt-1 text-xs sm:text-sm leading-relaxed">
                Buat dan simpan kata sandi baru untuk akun Tarteel Space Anda.
              </p>
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

            <form @submit.prevent="handleSubmit" class="space-y-4">
              
              <!-- New Password -->
              <div class="space-y-1">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Password Baru</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    v-model="newPassword"
                    :type="showPass ? 'text' : 'password'"
                    required
                    placeholder="Minimal 8 karakter"
                    autocomplete="new-password"
                    class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl pl-10 pr-11 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans"
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

              <!-- Confirm Password -->
              <div class="space-y-1">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Konfirmasi Password</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    v-model="confirmPass"
                    :type="showConfirmPass ? 'text' : 'password'"
                    required
                    placeholder="Ulangi password baru"
                    autocomplete="new-password"
                    class="w-full bg-dark-950 border text-ink-0 text-sm rounded-xl pl-10 pr-11 py-2.5 focus:outline-none transition-all placeholder:text-ink-3 font-sans"
                    :class="confirmPassClass"
                  />
                  <button
                    type="button"
                    @click="showConfirmPass = !showConfirmPass"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-3 hover:text-ink-1 transition-colors"
                    aria-label="Toggle confirm password"
                  >
                    <svg v-if="!showConfirmPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-if="showConfirmPass" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </div>
                <p v-if="confirmPass && confirmPass !== newPassword" class="font-mono text-[11px] text-rose-400 mt-1">
                  Password dan konfirmasi password tidak cocok
                </p>
              </div>

              <!-- Submit Button (Pill Shape Matching Landing Page .ts-btn--primary) -->
              <button
                type="submit"
                :disabled="isLoading"
                class="ts-auth-btn w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-dark-950 font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 relative overflow-hidden mt-1 cursor-pointer"
              >
                <svg v-if="isLoading" class="animate-spin h-4 w-4 text-dark-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span class="font-medium text-sm">{{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}</span>
                <span v-if="!isLoading" aria-hidden="true">→</span>
              </button>
            </form>

            <p class="mt-5 text-center text-xs text-ink-2">
              Sudah ingat password lama?
              <NuxtLink to="/login" class="font-medium text-primary-400 hover:text-primary-300 ml-1 transition-colors">
                Masuk di sini
              </NuxtLink>
            </p>
          </template>
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
