<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalItems: number
  itemsPerPage: number
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
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
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
    <div class="text-sm text-slate-400">
      Menampilkan <span class="font-medium text-white">{{ startItem }}</span> hingga <span class="font-medium text-white">{{ endItem }}</span> dari <span class="font-medium text-white">{{ totalItems }}</span> entri
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Prev Button -->
      <button 
        @click="previousPage" 
        :disabled="currentPage === 1"
        class="p-2 rounded-xl border border-dark-800 bg-dark-950/60 text-slate-400 hover:text-white hover:bg-dark-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Page Numbers -->
      <button 
        v-for="page in displayedPages" 
        :key="page"
        @click="currentPage = page"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all border"
        :class="page === currentPage 
          ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' 
          : 'bg-dark-950/60 border-dark-800 text-slate-400 hover:text-white hover:bg-dark-800'"
      >
        {{ page }}
      </button>

      <!-- Next Button -->
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="p-2 rounded-xl border border-dark-800 bg-dark-950/60 text-slate-400 hover:text-white hover:bg-dark-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
