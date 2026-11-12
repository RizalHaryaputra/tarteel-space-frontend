<script setup lang="ts">
import { computed } from 'vue'

export interface WeeklyScoreItem {
  tanggal: string
  rata_rata: number
}

const props = withDefaults(defineProps<{
  data?: WeeklyScoreItem[] | null
  loading?: boolean
  error?: any
  emptyTitle?: string
  emptyDescription?: string
  svgWidth?: number
  svgHeight?: number
}>(), {
  data: null,
  loading: false,
  error: null,
  emptyTitle: 'Belum Ada Data Skor',
  emptyDescription: 'Selesaikan sesi latihan untuk mulai melihat grafik perkembangan skor Anda.',
  svgWidth: 800,
  svgHeight: 220
})

const maxScore = 100
const minScore = 0
const topPadding = 35
const bottomPadding = 25

const points = computed(() => {
  const dataList = props.data
  if (!Array.isArray(dataList) || dataList.length === 0) return []

  const chartHeight = props.svgHeight - topPadding - bottomPadding

  if (dataList.length === 1) {
    const firstWeekly = dataList[0]
    if (!firstWeekly) return []
    const normalizedScore = Math.max(0, Math.min(1, (firstWeekly.rata_rata - minScore) / (maxScore - minScore)))
    const y = topPadding + chartHeight * (1 - normalizedScore)
    const dateStr = new Date(firstWeekly.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })

    return [
      { x: 0, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true },
      { x: props.svgWidth / 2, y, score: Math.round(firstWeekly.rata_rata), date: dateStr },
      { x: props.svgWidth, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true }
    ]
  }

  const paddingX = 55
  const availableWidth = props.svgWidth - (paddingX * 2)

  return dataList.map((item, index) => {
    if (!item) return null
    const x = paddingX + (index / (dataList.length - 1)) * availableWidth
    const normalizedScore = Math.max(0, Math.min(1, (item.rata_rata - minScore) / (maxScore - minScore)))
    const y = topPadding + chartHeight * (1 - normalizedScore)
    return {
      x,
      y,
      score: Math.round(item.rata_rata),
      date: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
    }
  }).filter((p): p is { x: number; y: number; score: number; date: string; isFake?: boolean } => p !== null)
})

const midY = computed(() => {
  const chartHeight = props.svgHeight - topPadding - bottomPadding
  return topPadding + chartHeight / 2
})

const polylinePoints = computed(() => {
  if (points.value.length === 0) return ''
  if (points.value.length === 1) {
    const p = points.value[0]
    return p ? `${p.x},${p.y}` : ''
  }
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
})

const polygonPoints = computed(() => {
  if (points.value.length === 0) return ''
  if (points.value.length === 1) {
    const p = points.value[0]
    return p ? `${p.x},${p.y} ${p.x},${props.svgHeight} ${p.x},${props.svgHeight}` : ''
  }

  const firstP = points.value[0]
  const lastP = points.value[points.value.length - 1]
  if (!firstP || !lastP) return ''

  return `${firstP.x},${props.svgHeight} ${polylinePoints.value} ${lastP.x},${props.svgHeight}`
})
</script>

<template>
  <div class="w-full relative z-10 overflow-x-auto custom-scrollbar">
    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-center justify-center py-16 text-center">
      <p class="font-mono text-sm text-rose-400 mb-1 font-semibold">Gagal Memuat Data Grafik</p>
      <p class="font-sans text-xs sm:text-sm text-ink-2 max-w-sm mx-auto">{{ error.message || 'Terjadi kesalahan saat menghubungi server.' }}</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4 mx-auto"></div>
      <p class="font-sans text-sm text-ink-2">Memuat grafik skor...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!points.length" class="flex flex-col items-center justify-center py-16 text-center bg-dark-950/40 rounded-2xl border border-dashed border-white/10">
      <p class="font-semibold text-sm text-ink-1 mb-1">{{ emptyTitle }}</p>
      <p class="font-sans text-xs sm:text-sm text-ink-2 max-w-sm mx-auto">{{ emptyDescription }}</p>
    </div>

    <!-- SVG Line Chart -->
    <div v-else class="min-w-[540px]">
      <svg :viewBox="`0 0 ${svgWidth} ${svgHeight + 36}`" class="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="weekly-score-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(37, 99, 235, 0.25)" />
            <stop offset="100%" stop-color="rgba(37, 99, 235, 0.0)" />
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="0" :y1="topPadding" :x2="svgWidth" :y2="topPadding" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="0" :y1="midY" :x2="svgWidth" :y2="midY" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="0" :y1="svgHeight" :x2="svgWidth" :y2="svgHeight" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

        <!-- Filled Area -->
        <polygon
          :points="polygonPoints"
          fill="url(#weekly-score-area-gradient)"
          class="transition-all duration-700 ease-in-out"
        />

        <!-- Line Path -->
        <polyline
          :points="polylinePoints"
          fill="none"
          stroke="rgba(59,130,246,0.85)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-700 ease-in-out"
        />

        <!-- Data Points -->
        <g v-for="(point, i) in points" :key="i" class="group/point cursor-crosshair">
          <template v-if="!point.isFake">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="5"
              fill="#0b0d11"
              stroke="#3b82f6"
              stroke-width="2.5"
              class="group-hover/point:r-7 group-hover/point:fill-[#3b82f6] transition-all duration-200"
            />

            <text
              :x="point.x"
              :y="point.y - 12"
              fill="#f4f6fb"
              font-family="'Geist Mono', monospace"
              font-size="13"
              font-weight="700"
              text-anchor="middle"
              class="select-none pointer-events-none"
            >
              {{ point.score }}%
            </text>

            <text
              :x="point.x"
              :y="svgHeight + 22"
              fill="#6c7a9c"
              font-family="'Geist Mono', monospace"
              font-size="12"
              text-anchor="middle"
              class="select-none pointer-events-none font-semibold"
            >
              {{ point.date }}
            </text>
          </template>
        </g>
      </svg>
    </div>
  </div>
</template>

