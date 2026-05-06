<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`
  },
  {
    name: 'Ruang Latihan',
    path: '/dashboard/practice',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`
  },
  {
    name: 'Riwayat',
    path: '/dashboard/history',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
  }
]

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

import { computed, ref } from 'vue'

const pageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path === route.path || (item.path !== '/dashboard' && route.path.startsWith(item.path)))
  return currentItem ? currentItem.name : 'Dashboard'
})

const isDropdownOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-dark-950 text-white font-sans flex flex-col md:flex-row relative overflow-hidden">
    <!-- Global Background Glow -->
    <div class="fixed top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-40 z-0"></div>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside class="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-dark-900/60 backdrop-blur-xl border-r border-dark-800 z-20">
      <!-- Logo -->
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">Tarteel<span class="text-primary-400">Space</span></span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
          :class="isActive(item.path) ? 'bg-primary-500/10 text-primary-400 shadow-sm shadow-primary-500/5' : 'text-slate-400 hover:bg-dark-800/50 hover:text-slate-200'"
        >
          <div v-html="item.icon" :class="isActive(item.path) ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'"/>
          <span class="font-medium text-sm">{{ item.name }}</span>
          
          <!-- Active Indicator dot -->
          <div v-if="isActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
        </NuxtLink>
      </nav>

    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 relative z-10 w-full overflow-y-auto h-screen pb-20 md:pb-0 flex flex-col">
      
      <!-- Desktop Header -->
      <header class="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 z-30">
        <h1 class="text-2xl font-bold text-white tracking-tight">{{ pageTitle }}</h1>
        
        <!-- User Profile Dropdown (Desktop) -->
        <div class="relative">
          <div @click="isDropdownOpen = !isDropdownOpen" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-900/50 border border-dark-800 hover:bg-dark-800 transition-colors cursor-pointer group">
            <div class="text-right">
              <p class="text-sm font-medium text-white">{{ authStore.userName || 'Pengguna' }}</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
              {{ authStore.initials || '?' }}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-white transition-transform duration-200" :class="{'rotate-180': isDropdownOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <!-- Dropdown Overlay -->
          <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-40"></div>

          <!-- Dropdown Menu -->
          <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-64 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden z-50">
            <div class="py-2">
              <button @click="navigateTo('/'); isDropdownOpen = false" class="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Halaman Utama
              </button>
              <button @click="authStore.logout(); navigateTo('/login')" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark-800 hover:text-red-300 transition-colors flex items-center gap-3 border-t border-dark-800 mt-1 pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full h-full max-w-6xl mx-auto p-4 md:p-8 lg:p-10 flex-1">
        <!-- Dashboard Header (Mobile Only) -->
        <header class="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-dark-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span class="text-lg font-bold tracking-tight">Tarteel<span class="text-primary-400">Space</span></span>
          </div>
          
          <div class="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </header>

        <!-- Nuxt Page Content Gets Injected Here -->
        <NuxtPage />
      </div>
    </main>

    <!-- Mobile Bottom Navigation (Hidden on Desktop) -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full bg-dark-900/80 backdrop-blur-xl border-t border-dark-800 z-50 px-6 py-2 pb-safe flex justify-between items-center">
      <NuxtLink 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200"
        :class="isActive(item.path) ? 'text-primary-400' : 'text-slate-500'"
      >
        <div v-html="item.icon" class="w-6 h-6"/>
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
</style>
