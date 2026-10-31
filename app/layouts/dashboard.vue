<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const route = useRoute()
const authStore = useAuthStore()

const baseMenuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`
  },
  {
    name: 'Ruang Latihan',
    path: '/dashboard/practice',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`
  },
  {
    name: 'Riwayat',
    path: '/dashboard/history',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
  },
  {
    name: 'Kelola Profil',
    path: '/dashboard/profile',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
  }
]

const menuItems = computed(() => {
  return [...baseMenuItems]
})

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

const pageTitle = computed(() => {
  const currentItem = menuItems.value.find(item => item.path === route.path || (item.path !== '/dashboard' && route.path.startsWith(item.path)))
  return currentItem ? currentItem.name : 'Dashboard'
})

const isDropdownOpen = ref(false)
const isMobileDropdownOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-dark-950 text-ink-0 font-sans flex flex-col md:flex-row relative overflow-hidden selection:bg-primary-500 selection:text-dark-950 antialiased">
    <!-- Global Background Glow -->
    <div class="fixed top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-40 z-0"></div>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside
      class="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-dark-900/80 backdrop-blur-2xl border-r border-white/10 z-20">
      <!-- Logo -->
      <NuxtLink to="/" class="h-20 px-6 flex items-center gap-3 group cursor-pointer border-b border-white/10 shrink-0">
        <img src="/logo.png" alt="Tarteel Space Logo"
          class="w-9 h-9 rounded-[8px] object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
        <span class="font-display font-semibold text-xl tracking-tight text-ink-0 group-hover:text-primary-400 transition-colors">Tarteel<span class="text-primary-400">Space</span></span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path"
          class="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-sans"
          :class="isActive(item.path) ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 font-semibold' : 'text-ink-1 hover:bg-dark-850 hover:text-ink-0 border border-transparent font-medium'">
          <div v-html="item.icon"
            :class="isActive(item.path) ? 'text-primary-400' : 'text-ink-2 group-hover:text-ink-0'" />
          <span class="text-sm sm:text-base">{{ item.name }}</span>

          <!-- Active Indicator dot -->
          <div v-if="isActive(item.path)"
            class="ml-auto w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
        </NuxtLink>
      </nav>

      <!-- Bottom switch menu (Admin <-> User) -->
      <div v-if="authStore.isAdmin" class="p-4 border-t border-white/10 mt-auto">
        <NuxtLink to="/admin" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-ink-2 hover:bg-dark-850 hover:text-ink-0 text-sm font-mono uppercase tracking-wider font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs">Beralih ke Admin</span>
        </NuxtLink>
      </div>

    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 relative z-10 w-full overflow-y-auto h-screen pb-20 md:pb-0 flex flex-col">

      <!-- Desktop Header -->
      <header
        class="hidden md:flex items-center justify-between h-20 px-8 sm:px-10 sticky top-0 bg-dark-950/80 backdrop-blur-2xl border-b border-white/10 z-30 shrink-0">
        <h1 class="font-display font-semibold text-2xl sm:text-3xl text-ink-0 tracking-tight">{{ pageTitle }}</h1>

        <!-- User Profile Dropdown (Desktop) -->
        <div class="relative">
          <div @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-3 px-4 py-2 rounded-full bg-dark-900/90 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
            <div class="text-right">
              <p class="font-sans text-sm sm:text-base font-semibold text-ink-0">{{ authStore.userName || 'Pengguna' }}</p>
            </div>
            
            <!-- Avatar Desktop -->
            <div v-if="authStore.avatarUrl" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/10">
              <img :src="authStore.avatarUrl" class="w-full h-full object-cover" alt="Avatar">
            </div>
            <div v-else
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark-850 border border-white/10 flex items-center justify-center text-ink-1 font-mono font-semibold text-xs sm:text-sm">
              {{ authStore.initials || '?' }}
            </div>

            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-ink-3 group-hover:text-ink-1 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Dropdown Overlay -->
          <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-40"></div>

          <!-- Dropdown Menu (Uniform with Landing Page) -->
          <div v-if="isDropdownOpen"
            class="absolute right-0 mt-2.5 w-56 bg-dark-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 font-sans animate-fade-in">
            <button @click="navigateTo('/'); isDropdownOpen = false"
              class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-ink-1 hover:bg-dark-850 hover:text-ink-0 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink-3 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Halaman Utama</span>
            </button>

            <button v-if="authStore.isAdmin" @click="navigateTo('/admin'); isDropdownOpen = false"
              class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-ink-1 hover:bg-dark-850 hover:text-ink-0 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink-3 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Halaman Admin</span>
            </button>

            <button @click="authStore.logout(); navigateTo('/login')"
              class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2.5 mt-1 border-t border-white/5 pt-2.5 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-400/80 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div class="w-full max-w-6xl mx-auto py-8 px-4 md:py-8 md:px-8 lg:px-10 flex-1">
        <!-- Dashboard Header (Mobile Only) -->
        <header class="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img src="/logo.png" alt="Tarteel Space Logo"
              class="w-7 h-7 rounded-lg object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span class="font-display font-semibold text-lg tracking-tight text-ink-0">Tarteel<span class="text-primary-400">Space</span></span>
          </NuxtLink>

          <div class="relative">
            <div @click="isMobileDropdownOpen = !isMobileDropdownOpen"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
              <div class="text-right hidden sm:block">
                <p class="text-xs font-medium text-ink-0">{{ authStore.userName || 'Pengguna' }}</p>
              </div>

              <!-- Avatar Mobile -->
              <div v-if="authStore.avatarUrl" class="w-7 h-7 rounded-full overflow-hidden border border-white/10">
                <img :src="authStore.avatarUrl" class="w-full h-full object-cover" alt="Avatar">
              </div>
              <div v-else
                class="w-7 h-7 rounded-full bg-dark-850 border border-white/10 flex items-center justify-center text-ink-1 font-mono font-medium text-xs">
                {{ authStore.initials || '?' }}
              </div>

              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-ink-3 transition-transform duration-200"
                :class="{ 'rotate-180': isMobileDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Dropdown Overlay -->
            <div v-if="isMobileDropdownOpen" @click="isMobileDropdownOpen = false" class="fixed inset-0 z-40"></div>

            <!-- Dropdown Menu -->
            <div v-if="isMobileDropdownOpen"
              class="absolute right-0 mt-2.5 w-56 bg-dark-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 font-sans animate-fade-in">
              <div class="px-3.5 py-2 border-b border-white/5 mb-1">
                <p class="font-sans text-sm font-semibold text-ink-0">{{ authStore.userName || 'Pengguna' }}</p>
              </div>
              <button @click="navigateTo('/'); isMobileDropdownOpen = false"
                class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-ink-1 hover:bg-dark-850 hover:text-ink-0 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink-3 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Halaman Utama</span>
              </button>

              <button v-if="authStore.isAdmin" @click="navigateTo('/admin'); isMobileDropdownOpen = false"
                class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-ink-1 hover:bg-dark-850 hover:text-ink-0 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink-3 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Halaman Admin</span>
              </button>

              <button @click="authStore.logout(); navigateTo('/login')"
                class="w-full text-left px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2.5 mt-1 border-t border-white/5 pt-2.5 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-400/80 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Nuxt Page Content Gets Injected Here -->
        <NuxtPage :transition="{ name: 'dash-page', mode: 'out-in' }" />
      </div>
    </main>

    <!-- Mobile Bottom Navigation (Hidden on Desktop) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 w-full bg-dark-900/90 backdrop-blur-2xl border-t border-white/10 z-50 px-6 pt-2 pb-4 sm:pb-safe flex justify-around items-center">
      <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path"
        class="flex flex-col items-center p-2.5 rounded-xl transition-all duration-200"
        :class="isActive(item.path) ? 'text-primary-400 bg-primary-500/10' : 'text-ink-2 hover:text-ink-0 hover:bg-dark-850'">
        <div v-html="item.icon" class="w-5 h-5" />
      </NuxtLink>
    </nav>
  </div>
</template>

<style>
/* Safe area for iOS bottom bar */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}

/* ============================================================
   DASHBOARD INNER PAGE TRANSITION
   Perpindahan antar sub-halaman di dalam dashboard
   Efek: Fade + slide ke atas yang ringan
   ============================================================ */
.dash-page-enter-active,
.dash-page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dash-page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.dash-page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
