<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  totalItems: number
  itemsPerPage: number
  modelValue: number
  pageSizeOptions?: number[]
}>(), {
  pageSizeOptions: () => [10, 50, 100]
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:itemsPerPage', value: number): void
}>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage) || 1)

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (currentPage.value - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => Math.min(currentPage.value * props.itemsPerPage, props.totalItems))

const selectPageSize = (size: number) => {
  if (size === props.itemsPerPage) return
  emit('update:itemsPerPage', size)
  emit('update:modelValue', 1)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Generate an array of page numbers to display (max 5 pages shown at a time)
const displayedPages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
      <div class="text-xs text-ink-2">
        Menampilkan <span class="font-mono font-semibold text-ink-0">{{ startItem }}</span> - <span class="font-mono font-semibold text-ink-0">{{ endItem }}</span> dari <span class="font-mono font-semibold text-ink-0">{{ totalItems }}</span> data
      </div>

      <!-- Page Size Selector -->
      <div class="inline-flex items-center gap-1.5">
        <span class="text-xs text-ink-3">Baris:</span>
        <div class="inline-flex items-center p-0.5 rounded-full bg-dark-950 border border-white/10">
          <button
            v-for="size in pageSizeOptions"
            :key="size"
            type="button"
            @click="selectPageSize(size)"
            class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all duration-200 cursor-pointer"
            :class="itemsPerPage === size
              ? 'bg-primary-500 text-dark-950 shadow-sm shadow-primary-500/25'
              : 'text-ink-2 hover:text-ink-0'"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Prev Button -->
      <button 
        type="button"
        @click="previousPage" 
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-full border border-white/10 bg-dark-950 text-ink-2 hover:text-ink-0 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center cursor-pointer shadow-sm"
        title="Halaman Sebelumnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Page Numbers -->
      <button 
        v-for="page in displayedPages" 
        :key="page"
        type="button"
        @click="currentPage = page"
        class="w-9 h-9 flex items-center justify-center rounded-full text-xs font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        :class="page === currentPage 
          ? 'bg-primary-500 text-dark-950 shadow-md shadow-primary-500/25' 
          : 'bg-dark-950 border border-white/10 text-ink-2 hover:text-ink-0 hover:border-white/20'"
      >
        {{ page }}
      </button>

      <!-- Next Button -->
      <button 
        type="button"
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="w-9 h-9 rounded-full border border-white/10 bg-dark-950 text-ink-2 hover:text-ink-0 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center cursor-pointer shadow-sm"
        title="Halaman Selanjutnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
