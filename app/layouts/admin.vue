<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  {
    name: 'Ringkasan',
    path: '/admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
  },
  {
    name: 'Manajemen User',
    path: '/admin/users',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
  },
  {
    name: 'Manajemen Huruf',
    path: '/admin/letters',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>`
  },
  {
    name: 'Keluhan & Feedback',
    path: '/admin/feedbacks',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>`
  },
  {
    name: 'Dataset Pool',
    path: '/admin/dataset',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>`
  }
]

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin' // Exact match for Ringkasan to prevent other routes from activating it
  }
  return route.path.startsWith(path)
}

const pageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path !== '/dashboard' && route.path.startsWith(item.path))
  return currentItem ? currentItem.name : 'Panel Admin'
})

const isDropdownOpen = ref(false)
const isMobileDropdownOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-dark-950 text-white font-sans flex flex-col md:flex-row relative overflow-hidden">
    <!-- Global Background Glow -->
    <div class="fixed top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-40 z-0"></div>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside
      class="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-dark-900/60 backdrop-blur-xl border-r border-dark-800 z-20">
      <!-- Logo -->
      <div class="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Tarteel Space Logo"
          class="w-10 rounded-lg h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <span class="text-xl font-bold tracking-tight">Tarteel<span class="text-primary-400">Space</span></span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
          :class="isActive(item.path) ? 'bg-primary-500/10 text-primary-400 shadow-sm shadow-primary-500/5' : 'text-slate-400 hover:bg-dark-800/50 hover:text-slate-200'">
          <div v-html="item.icon"
            :class="isActive(item.path) ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'" />
          <span class="font-medium text-sm">{{ item.name }}</span>

          <!-- Active Indicator dot -->
          <div v-if="isActive(item.path)"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
        </NuxtLink>
      </nav>

      <!-- Bottom switch menu (Admin -> User) -->
      <div class="p-4 border-t border-dark-800 mt-auto">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-dark-800/50 hover:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span class="font-medium text-sm">Beralih ke User</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 relative z-10 w-full overflow-y-auto h-screen pb-20 md:pb-0 flex flex-col">
      <!-- Desktop Header -->
      <header
        class="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 z-30">
        <h1 class="text-2xl font-bold text-white tracking-tight">{{ pageTitle }}</h1>

        <!-- User Profile Dropdown (Desktop) -->
        <div class="relative">
          <div @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-900/50 border border-dark-800 hover:bg-dark-800 transition-colors cursor-pointer group">
            <div class="text-right">
              <p class="text-sm font-medium text-white">{{ authStore.userName || 'Admin' }}</p>
              <p class="text-xs text-primary-400 font-medium">Administrator</p>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
              {{ authStore.initials || 'A' }}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-slate-400 group-hover:text-white transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Dropdown Overlay -->
          <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-40"></div>

          <!-- Dropdown Menu -->
          <div v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-64 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden z-50">
            <div class="py-2">
              <button @click="navigateTo('/'); isDropdownOpen = false"
                class="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Halaman Utama
              </button>
              <button @click="authStore.logout(); navigateTo('/login')"
                class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark-800 hover:text-red-300 transition-colors flex items-center gap-3 border-t border-dark-800 mt-1 pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400/70" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full max-w-6xl mx-auto py-8 px-4 md:py-8 md:px-8 lg:px-10 flex-1">
        <!-- Dashboard Header (Mobile Only) -->
        <header class="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-dark-800">
          <div class="flex items-center gap-2">
            <img src="/logo.png" alt="Tarteel Space Logo"
              class="w-8 h-8 rounded-lg object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span class="text-lg font-bold tracking-tight">Tarteel<span class="text-primary-400">Space</span></span>
          </div>

          <div class="relative">
            <div @click="isMobileDropdownOpen = !isMobileDropdownOpen"
              class="flex items-center gap-2 sm:gap-3 p-1.5 sm:px-4 sm:py-2 rounded-full sm:rounded-xl bg-dark-900/50 border border-dark-800 hover:bg-dark-800 transition-colors cursor-pointer group">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-white">{{ authStore.userName || 'Admin' }}</p>
                <p class="text-xs text-primary-400 font-medium">Administrator</p>
              </div>
              <div
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary-500/20">
                {{ authStore.initials || 'A' }}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-slate-400 group-hover:text-white transition-transform duration-200 hidden sm:block"
                :class="{ 'rotate-180': isMobileDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7-7-7-7" />
              </svg>
            </div>

            <!-- Dropdown Overlay -->
            <div v-if="isMobileDropdownOpen" @click="isMobileDropdownOpen = false" class="fixed inset-0 z-40"></div>

            <!-- Dropdown Menu -->
            <div v-if="isMobileDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div class="py-2">
                <div class="px-4 py-3 border-b border-dark-800 mb-1">
                  <p class="text-sm font-medium text-white">{{ authStore.userName || 'Admin' }}</p>
                  <p class="text-xs text-primary-400 font-medium">Administrator</p>
                </div>
                <button @click="navigateTo('/dashboard'); isMobileDropdownOpen = false"
                  class="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Kembali ke User Dashboard
                </button>
                <button @click="authStore.logout(); navigateTo('/login')"
                  class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark-800 hover:text-red-300 transition-colors flex items-center gap-3 border-t border-dark-800 mt-1 pt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400/70" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Nuxt Page Content Gets Injected Here -->
        <NuxtPage :transition="{ name: 'dash-page', mode: 'out-in' }" />
      </div>
    </main>

    <!-- Mobile Bottom Navigation (Hidden on Desktop) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 w-full bg-dark-900/80 backdrop-blur-xl border-t border-dark-800 z-50 px-6 py-2 pb-safe flex justify-between items-center">
      <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200"
        :class="isActive(item.path) ? 'text-primary-400' : 'text-slate-500'">
        <div v-html="item.icon" class="w-6 h-6" />
        <span class="text-[10px] font-medium">{{ item.name }}</span>
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
