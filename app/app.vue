<script setup>
import { onMounted } from 'vue'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Background adaptif di root agar tidak ada flash */
html,
body {
  background-color: rgb(var(--ts-dark-950));
  margin: 0;
  padding: 0;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* ── Global Typography Baseline (matching landing page) ── */
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem; /* 16px standard base */
  font-weight: 400;
  line-height: 1.5;
  color: rgb(var(--ts-ink-0));
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}

/* ── Heading Baseline ── */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.2;
  color: rgb(var(--ts-ink-0));
}

/* ── Font size scale matching landing page ── */
/* Landing page h1: clamp(2.1rem, 7vw, 4.5rem), section h2: text-4xl/5xl */
/* Dashboard pages use smaller sizes, but keep same rendering quality */

/* ── Monospace baseline (for Geist Mono) ── */
.font-mono, code, pre, kbd {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-feature-settings: "kern" 0, "liga" 0;
}

/* ── Modern Custom Scrollbar (Theme Aligned) ── */
* {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--ts-border-rgb) / 0.16) rgb(var(--ts-dark-950));
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(var(--ts-dark-950));
}

::-webkit-scrollbar-thumb {
  background: rgb(var(--ts-border-rgb) / 0.16);
  border-radius: 9999px;
  border: 2px solid rgb(var(--ts-dark-950));
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.7);
}

::-webkit-scrollbar-thumb:active {
  background: #2563eb;
}

::-webkit-scrollbar-corner {
  background: rgb(var(--ts-dark-950));
}
</style>
