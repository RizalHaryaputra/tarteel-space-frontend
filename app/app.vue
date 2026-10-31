<script setup>
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Background gelap di root agar tidak ada white flash */
html,
body {
  background-color: #0b0d11;
  margin: 0;
  padding: 0;
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
  color: #f4f6fb;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}

/* ── Heading Baseline ── */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.2;
  color: #f4f6fb;
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
  scrollbar-color: rgba(255, 255, 255, 0.16) #0b0d11;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0b0d11;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  border: 2px solid #0b0d11;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.7);
}

::-webkit-scrollbar-thumb:active {
  background: #2563eb;
}

::-webkit-scrollbar-corner {
  background: #0b0d11;
}
</style>
