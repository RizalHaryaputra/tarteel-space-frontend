<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md'
}>(), {
  size: 'md'
})

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      role="switch"
      :aria-checked="theme === 'light'"
      @click="toggleTheme"
      :aria-label="theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
      :title="theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
      class="relative inline-flex items-center rounded-full border border-white/10 bg-dark-800/80 p-[3px] transition-colors duration-300 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
      :class="props.size === 'sm' ? 'w-[54px] h-[28px]' : 'w-[60px] h-[32px]'"
    >
      <span class="relative grid grid-cols-2 w-full h-full items-center">
        <!-- Sliding Thumb (exact 50% width so it aligns dead-center with each icon cell) -->
        <span
          aria-hidden="true"
          class="absolute inset-y-0 left-0 w-1/2 rounded-full bg-dark-900 border border-white/10 shadow-sm transition-transform duration-300 ease-out"
          :class="theme === 'dark' ? 'translate-x-full' : 'translate-x-0'"
        ></span>

        <!-- Sun Icon (Left Cell = Light) -->
        <span class="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="transition-all duration-300"
            :class="[
              props.size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
              theme === 'light' ? 'text-amber-500 scale-100' : 'text-ink-2 opacity-60 scale-90'
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>

        <!-- Moon Icon (Right Cell = Dark) -->
        <span class="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="transition-all duration-300"
            :class="[
              props.size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
              theme === 'dark' ? 'text-primary-400 scale-100' : 'text-ink-2 opacity-60 scale-90'
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </span>
      </span>
    </button>
    <template #fallback>
      <div
        class="rounded-full bg-dark-850 animate-pulse shrink-0"
        :class="props.size === 'sm' ? 'w-[54px] h-[28px]' : 'w-[60px] h-[32px]'"
      ></div>
    </template>
  </ClientOnly>
</template>
