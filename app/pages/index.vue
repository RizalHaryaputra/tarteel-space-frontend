<template>
  <div class="ts-root">

    <!-- ───────── nav · N5 Floating pill ───────── -->
    <nav class="ts-nav" aria-label="Primary" :class="{ 'ts-nav--scrolled': isScrolled }">
      <button class="ts-nav__brand" @click="scrollTo('beranda')" aria-label="Tarteel Space home">
        <img src="/logo.png" alt="" class="ts-nav__logo" aria-hidden="true" />
        <span class="ts-nav__brand-name">Tarteel<span class="ts-nav__brand-accent">Space</span></span>
      </button>
      <div class="ts-nav__links">
        <button class="ts-nav__link" @click="scrollTo('cara-kerja')">Cara Kerja</button>
        <button class="ts-nav__link" @click="scrollTo('fitur')">Fitur</button>
        <button class="ts-nav__link" @click="scrollTo('tentang')">Tentang</button>
      </div>
      <ClientOnly>
        <template v-if="authStore.isLoggedIn">
          <div class="ts-nav__user-wrap" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="ts-nav__user-btn"
              :aria-expanded="isDropdownOpen"
              aria-haspopup="true"
            >
              <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="ts-nav__avatar" alt="Avatar" />
              <span v-else class="ts-nav__avatar ts-nav__avatar--initials">{{ authStore.initials || '?' }}</span>
              <span class="ts-nav__user-name">{{ authStore.userName || 'Pengguna' }}</span>
            </button>
            <div v-if="isDropdownOpen" class="ts-dropdown" role="menu">
              <button
                class="ts-dropdown__item"
                role="menuitem"
                @click="navigateTo(authStore.isAdmin ? '/admin' : '/dashboard'); isDropdownOpen = false"
              >
                <svg class="ts-dropdown__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
                  <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
                </svg>
                {{ authStore.isAdmin ? 'Halaman Admin' : 'Dasbor' }}
              </button>
              <button
                class="ts-dropdown__item ts-dropdown__item--danger"
                role="menuitem"
                @click="authStore.logout(); navigateTo('/login')"
              >
                <svg class="ts-dropdown__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M10 3h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3M6 11l4-3-4-3M1 8h9"/>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <button class="ts-nav__link" @click="navigateTo('/login')">Masuk</button>
          <button class="ts-nav__cta" @click="navigateTo('/register')">Mulai Gratis</button>
        </template>
        <template #fallback>
          <div class="ts-nav__skeleton"></div>
        </template>
      </ClientOnly>
    </nav>

    <!-- ───────── hero · Marquee Hero + split diptych ───────── -->
    <section class="ts-hero" id="beranda">
      <div class="ts-container">

        <!-- live badge -->
        <div class="ts-hero__live" role="status" aria-live="polite">
          <span class="ts-live-dot" aria-hidden="true"></span>
          <span>DITENAGAI DEEP LEARNING · <strong>CNN</strong> · EVALUASI REAL-TIME</span>
        </div>

        <!-- split layout: headline left, art right -->
        <div class="ts-hero__layout">
          <div class="ts-hero__copy">
            <h1 class="ts-hero__h1">
              Sempurnakan Pelafalan<br>
              Hijaiyah<em class="ts-italic"> dengan benar</em>.
            </h1>
            <p class="ts-hero__sub">
              Tarteel Space mengevaluasi akurasi pelafalan huruf hijaiyah Anda secara real-time
              menggunakan teknologi Deep Learning — tanpa batasan waktu atau tempat.
            </p>
            <div class="ts-hero__ctas">
              <button class="ts-btn ts-btn--primary" @click="navigateTo('/dashboard/practice')">
                Mulai Latihan <span aria-hidden="true">→</span>
              </button>
              <button class="ts-btn ts-btn--ghost" @click="scrollTo('cara-kerja')">
                Lihat Cara Kerjanya
              </button>
            </div>
            <div class="ts-hero__fineprint">
              <span>gratis sepenuhnya</span>
              <span>langsung dari browser</span>
              <span>tanpa instal aplikasi</span>
            </div>
          </div>

          <!-- Tier-A pure-CSS art: Arabic evaluation card -->
          <aside class="ts-eval-card" aria-label="Pratinjau evaluasi pelafalan">
            <div class="ts-eval-card__head">
              <div>
                <div class="ts-eval-card__title">SESI-04212</div>
                <div class="ts-eval-card__meta">Ahmad Rizal · Makhraj Huruf</div>
              </div>
              <span class="ts-eval-card__tag">live · aktif</span>
            </div>
            <div class="ts-eval-card__letters">
              <div class="ts-eval-card__letter ts-eval-card__letter--correct">
                <span class="ts-eval-card__arabic">بَ</span>
                <span class="ts-eval-card__score">96%</span>
              </div>
              <div class="ts-eval-card__letter ts-eval-card__letter--correct">
                <span class="ts-eval-card__arabic">بِ</span>
                <span class="ts-eval-card__score">91%</span>
              </div>
              <div class="ts-eval-card__letter ts-eval-card__letter--improve">
                <span class="ts-eval-card__arabic">بُ</span>
                <span class="ts-eval-card__score">74%</span>
              </div>
              <div class="ts-eval-card__letter ts-eval-card__letter--correct">
                <span class="ts-eval-card__arabic">تَ</span>
                <span class="ts-eval-card__score">89%</span>
              </div>
            </div>
            <div class="ts-eval-card__total">
              <span>Akurasi sesi ini</span>
              <span class="ts-eval-card__num">88.5<small>%</small></span>
            </div>
            <div class="ts-eval-card__bar" aria-hidden="true">
              <i style="width: 88.5%"></i>
            </div>
            <div class="ts-eval-card__footnote">
              84 kelas hijaiyah · model CNN · 95% akurasi
            </div>
          </aside>
        </div>

        <!-- marquee strip -->
        <div class="ts-marquee" aria-hidden="true">
          <div class="ts-marquee__track">
            <span>REKAM · SUARA · ANDA</span>
            <span>EVALUASI · REAL-TIME</span>
            <span>PELAJARI · TAJWID · HIJAIYAH</span>
            <span>BERBASIS · CNN · AI</span>
            <span>AKURASI · INSTAN</span>
            <span>REKAM · SUARA · ANDA</span>
            <span>EVALUASI · REAL-TIME</span>
            <span>PELAJARI · TAJWID · HIJAIYAH</span>
            <span>BERBASIS · CNN · AI</span>
            <span>AKURASI · INSTAN</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ───────── cara kerja · step sequence ───────── -->
    <section class="ts-section" id="cara-kerja">
      <div class="ts-container">
        <div class="ts-section-head">
          <div>
            <span class="ts-eyebrow">◇ cara kerja</span>
            <h2 class="ts-section-head__title">Rekam, proses, terima — <em class="ts-italic">langsung</em>.</h2>
          </div>
          <p class="ts-section-head__desc">
            Tiga langkah sederhana untuk mulai mengevaluasi akurasi pelafalan hijaiyah Anda.
            Tidak perlu pengaturan rumit — cukup browser dan mikrofon.
          </p>
        </div>

        <div class="ts-steps">
          <div class="ts-step">
            <div class="ts-step__art ts-step-art--mic" aria-hidden="true">
              <div class="ts-step__art-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              </div>
              <div class="ts-step__art-bars" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
            </div>
            <div class="ts-step__body">
              <div class="ts-step__num">1.0</div>
              <h3 class="ts-step__title">Izinkan Mikrofon</h3>
              <p class="ts-step__desc">Berikan akses mikrofon pada peramban Anda. Tidak ada data suara yang disimpan di server — semua diproses lokal lalu dikirim sebagai fitur audio.</p>
            </div>
          </div>

          <div class="ts-step">
            <div class="ts-step__art ts-step-art--letter" aria-hidden="true">
              <div class="ts-step__art-letters">
                <span>ب</span><span>ت</span><span>ث</span><span>ج</span>
              </div>
              <div class="ts-step__art-cursor"></div>
            </div>
            <div class="ts-step__body">
              <div class="ts-step__num">2.0</div>
              <h3 class="ts-step__title">Lafalkan Huruf</h3>
              <p class="ts-step__desc">Pilih huruf hijaiyah yang ingin dilatih, lalu lafalkan dengan jelas sesuai kaidah makhraj dan tajwid. Sistem akan merekam dan menganalisis audio Anda.</p>
            </div>
          </div>

          <div class="ts-step">
            <div class="ts-step__art ts-step-art--result" aria-hidden="true">
              <div class="ts-step__art-score">88<small>%</small></div>
              <div class="ts-step__art-label">Sangat Baik</div>
            </div>
            <div class="ts-step__body">
              <div class="ts-step__num">3.0</div>
              <h3 class="ts-step__title">Terima Evaluasi</h3>
              <p class="ts-step__desc">Model CNN memproses spektrogram audio dan memberikan persentase akurasi secara instan beserta umpan balik untuk perbaikan pelafalan Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── stats ───────── -->
    <section class="ts-section" id="fitur">
      <div class="ts-container">
        <div class="ts-section-head">
          <div>
            <span class="ts-eyebrow">◇ model AI</span>
            <h2 class="ts-section-head__title">Angka yang <em class="ts-italic">tidak</em> perlu catatan kaki.</h2>
          </div>
          <p class="ts-section-head__desc">
            Dibangun dari penelitian Skripsi Teknologi Informasi dengan arsitektur CNN yang dilatih
            khusus untuk mengenali pola pelafalan huruf hijaiyah beserta harakatnya.
          </p>
        </div>

        <div class="ts-stats">
          <div class="ts-stats__card ts-stats__card--1">
            <div class="ts-stats__num">{{ Math.round(statAccuracy) }}<small>%</small></div>
            <div class="ts-stats__label">akurasi model CNN</div>
            <div class="ts-stats__note">Diuji pada dataset pelafalan hijaiyah dengan validasi silang.</div>
          </div>
          <div class="ts-stats__card ts-stats__card--2">
            <div class="ts-stats__num">{{ Math.round(statClasses) }}<small>kelas</small></div>
            <div class="ts-stats__label">kelas klasifikasi</div>
            <div class="ts-stats__note">28 huruf hijaiyah × 3 harakat (fathah, kasrah, dhommah).</div>
          </div>
          <div class="ts-stats__card ts-stats__card--3">
            <div class="ts-stats__num">&lt;1<small>dtk</small></div>
            <div class="ts-stats__label">waktu evaluasi</div>
            <div class="ts-stats__note">Dari rekaman suara hingga skor akurasi langsung dari browser.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── features ───────── -->
    <section class="ts-section">
      <div class="ts-container">
        <div class="ts-section-head">
          <div>
            <span class="ts-eyebrow">◇ fitur utama</span>
            <h2 class="ts-section-head__title">Meter, pelajari, pantau — <em class="ts-italic">lalu</em> ulangi.</h2>
          </div>
          <p class="ts-section-head__desc">
            Tiga fitur inti yang membuat Tarteel Space berbeda dari cara belajar hijaiyah konvensional.
          </p>
        </div>

        <div class="ts-features">
          <article class="ts-feature">
            <div class="ts-feature__art ts-feature-art--wave" aria-hidden="true">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="oklch(62% 0.19 250)" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="oklch(62% 0.19 250)" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path class="ts-wave-area" d="M0,70 C20,60 40,40 60,50 C80,60 100,30 120,40 C140,50 160,20 180,35 C200,50 220,25 240,30 C260,35 280,50 300,45 L300,100 L0,100 Z"/>
                <path class="ts-wave-line" d="M0,70 C20,60 40,40 60,50 C80,60 100,30 120,40 C140,50 160,20 180,35 C200,50 220,25 240,30 C260,35 280,50 300,45"/>
                <circle class="ts-wave-dot" cx="300" cy="45" r="5"/>
              </svg>
              <div class="ts-feature-art__label">88.5% AKURAT</div>
            </div>
            <h3 class="ts-feature__title">Evaluasi Audio Real-time</h3>
            <p class="ts-feature__desc">Algoritma Deep Learning memproses input suara dan memberikan persentase akurasi pelafalan secara instan berdasarkan kaidah tajwid yang benar.</p>
            <span class="ts-feature__link">Mulai latihan →</span>
          </article>

          <article class="ts-feature">
            <div class="ts-feature__art ts-feature-art--harakat" aria-hidden="true">
              <div class="ts-harakat-grid">
                <div class="ts-harakat-cell ts-harakat-cell--active">
                  <span class="ts-harakat-arabic">بَ</span>
                  <span class="ts-harakat-name">Fathah</span>
                </div>
                <div class="ts-harakat-cell">
                  <span class="ts-harakat-arabic">بِ</span>
                  <span class="ts-harakat-name">Kasrah</span>
                </div>
                <div class="ts-harakat-cell">
                  <span class="ts-harakat-arabic">بُ</span>
                  <span class="ts-harakat-name">Dhommah</span>
                </div>
              </div>
            </div>
            <h3 class="ts-feature__title">Mendukung Harakat Lengkap</h3>
            <p class="ts-feature__desc">Klasifikasi mencakup fathah, kasrah, dan dhommah untuk setiap huruf hijaiyah — total 84 kelas yang dikenali oleh model CNN kami.</p>
            <span class="ts-feature__link">Lihat daftar huruf →</span>
          </article>

          <article class="ts-feature">
            <div class="ts-feature__art ts-feature-art--progress" aria-hidden="true">
              <div class="ts-progress-bars">
                <div class="ts-progress-bar" style="--pct: 45%"><span>Sen</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 62%"><span>Sel</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 58%"><span>Rab</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 80%"><span>Kam</span><i></i></div>
                <div class="ts-progress-bar ts-progress-bar--today" style="--pct: 88%"><span>Jum</span><i></i></div>
              </div>
            </div>
            <h3 class="ts-feature__title">Laporan Kemajuan Harian</h3>
            <p class="ts-feature__desc">Pantau perkembangan akurasi pelafalan Anda dari hari ke hari. Dasbor menampilkan grafik skor 7 hari terakhir dan huruf yang perlu perbaikan.</p>
            <span class="ts-feature__link">Lihat dasbor →</span>
          </article>
        </div>
      </div>
    </section>

    <!-- ───────── about / tentang ───────── -->
    <section class="ts-section" id="tentang">
      <div class="ts-container">
        <div class="ts-about">
          <div class="ts-about__copy">
            <span class="ts-eyebrow">◇ tentang proyek</span>
            <h2 class="ts-about__title">
              Menyatukan tradisi dan <em class="ts-italic">teknologi modern</em>.
            </h2>
            <p class="ts-about__text">
              Tarteel Space berawal dari penelitian Skripsi Teknologi Informasi. Misi utamanya adalah
              mengembangkan alat bantu mandiri untuk pembelajaran pelafalan Al-Qur'an yang dapat
              diakses oleh siapa saja, kapan saja, dan di mana saja.
            </p>
            <p class="ts-about__text">
              Dengan arsitektur Convolutional Neural Network (CNN), sistem kami memproses spektrogram
              audio untuk mengenali pola pelafalan yang benar sesuai kaidah tajwid.
            </p>
            <div class="ts-about__actions">
              <button class="ts-btn ts-btn--primary" @click="navigateTo('/dashboard/practice')">
                Mulai Latihan <span aria-hidden="true">→</span>
              </button>
              <button class="ts-btn ts-btn--ghost" @click="scrollTo('cara-kerja')">
                Lihat Cara Kerja
              </button>
            </div>
          </div>

          <div class="ts-about__visual" aria-label="Visualisasi arsitektur model dan spektrogram audio">
            <!-- Rich CNN Pipeline & Spectrogram Visual -->
            <div class="ts-spec-console">
              <!-- Top header bar -->
              <div class="ts-spec-console__head">
                <div class="ts-spec-console__title-wrap">
                  <span class="ts-spec-console__badge">CNN · ARSITEKTUR</span>
                  <div class="ts-spec-console__title">Spektrogram Audio 2D</div>
                </div>
                <div class="ts-spec-console__status">
                  <span class="ts-live-dot" aria-hidden="true"></span>
                  <span>16 kHz · STFT Mel</span>
                </div>
              </div>

              <!-- Main spectrogram canvas / matrix -->
              <div class="ts-spec-view">
                <div class="ts-spec-y-axis">
                  <span>8k</span>
                  <span>4k</span>
                  <span>2k</span>
                  <span>0</span>
                </div>
                <div class="ts-spec-heatmap">
                  <div v-for="c in 24" :key="c" class="ts-spec-col">
                    <div
                      v-for="r in 12"
                      :key="r"
                      class="ts-spec-bin"
                      :style="getHeatmapStyle(c, r)"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Time axis -->
              <div class="ts-spec-x-axis">
                <span>0.0s</span>
                <span>0.2s</span>
                <span>0.4s</span>
                <span>0.6s</span>
                <span>0.8s</span>
              </div>

              <!-- CNN Pipeline mini-flow -->
              <div class="ts-spec-pipeline">
                <div class="ts-spec-pipe-node">
                  <span class="ts-spec-pipe-icon">〰</span>
                  <span>1. Audio WAV</span>
                </div>
                <span class="ts-spec-pipe-arrow">→</span>
                <div class="ts-spec-pipe-node ts-spec-pipe-node--active">
                  <span class="ts-spec-pipe-icon">▦</span>
                  <span>2. Mel-Spec</span>
                </div>
                <span class="ts-spec-pipe-arrow">→</span>
                <div class="ts-spec-pipe-node">
                  <span class="ts-spec-pipe-icon">☵</span>
                  <span>3. Conv2D</span>
                </div>
              </div>

              <!-- Bottom prediction result card -->
              <div class="ts-spec-result">
                <div class="ts-spec-result__letter">
                  <span class="ts-spec-result__char">بَ</span>
                  <span class="ts-spec-result__tag">Fathah</span>
                </div>
                <div class="ts-spec-result__info">
                  <div class="ts-spec-result__row">
                    <span class="ts-spec-result__label">Hasil Klasifikasi</span>
                    <span class="ts-spec-result__score">96.4% Akurat</span>
                  </div>
                  <div class="ts-spec-result__meter">
                    <div class="ts-spec-result__fill" style="width: 96.4%"></div>
                  </div>
                  <div class="ts-spec-result__meta">
                    Makhraj: Asy-Syafatain (Dua Bibir) · Benar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── cta panel ───────── -->
    <section class="ts-cta-section">
      <div class="ts-container">
        <div class="ts-cta-panel">
          <h2 class="ts-cta-panel__title">
            Sempurnakan bacaan Anda <em class="ts-italic">hari ini</em>.
          </h2>
          <p class="ts-cta-panel__sub">
            Daftarkan diri dan rasakan pengalaman belajar Al-Qur'an interaktif yang didukung
            oleh kecerdasan buatan. Gratis sepenuhnya, langsung dari browser Anda.
          </p>
          <div class="ts-cta-panel__actions">
            <button class="ts-btn ts-btn--primary" @click="navigateTo('/register')">
              Daftar Gratis <span aria-hidden="true">→</span>
            </button>
            <button class="ts-btn ts-btn--ghost" @click="navigateTo('/login')">
              Sudah punya akun
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── footer · Ft5 Statement ───────── -->
    <footer class="ts-footer">
      <div class="ts-container">
        <p class="ts-footer__statement">
          Tarteel Space adalah alat belajar bagi mereka yang ingin <em class="ts-italic">membaca</em> dengan benar.
        </p>
        <div class="ts-footer__row">
          <div class="ts-footer__col">
            <h5>Fitur</h5>
            <ul>
              <li><button @click="scrollTo('cara-kerja')">Cara Kerja</button></li>
              <li><button @click="scrollTo('fitur')">Fitur Utama</button></li>
              <li><button @click="navigateTo('/dashboard/practice')">Mulai Latihan</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <h5>Akun</h5>
            <ul>
              <li><button @click="navigateTo('/login')">Masuk</button></li>
              <li><button @click="navigateTo('/register')">Daftar</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <h5>Proyek</h5>
            <ul>
              <li><button @click="scrollTo('tentang')">Tentang</button></li>
              <li><a href="https://github.com/RizalHaryaputra/tarteel-space-frontend" target="_blank" rel="noopener">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div class="ts-footer__legal">
          <span class="ts-footer__wordmark">Tarteel Space</span>
          <span>© 2026 Tarteel Space Project · Proyek Skripsi Teknologi Informasi</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const authStore = useAuthStore()
const isDropdownOpen = ref(false)
const isScrolled = ref(false)
const dropdownRef = ref(null)

const statAccuracy = ref(0)
const statClasses = ref(0)

let ctx = null

useHead({
  title: 'Tarteel Space — Sempurnakan Pelafalan Al-Qur\'an dengan AI',
  meta: [
    { name: 'description', content: 'Evaluasi akurasi pelafalan huruf hijaiyah berbasis website dengan teknologi Deep Learning CNN. Gratis, langsung dari browser.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap' },
  ]
})

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

// Spectrogram 2D Heatmap simulation for Arabic vowel formant (بَ)
const getHeatmapStyle = (col, row) => {
  const inSound = col >= 3 && col <= 21
  if (!inSound) {
    return {
      background: 'oklch(15% 0.015 255)',
      opacity: '0.2',
    }
  }

  // Formant F1 (low-mid around row 8) & F2 (high around row 3)
  const distF1 = Math.abs(row - 8)
  const distF2 = Math.abs(row - 3)
  const timeEnvelope = Math.sin(((col - 3) / 18) * Math.PI)

  const intensity1 = Math.max(0, 1 - distF1 * 0.28) * timeEnvelope
  const intensity2 = Math.max(0, 1 - distF2 * 0.35) * timeEnvelope
  const noise = ((col * 17 + row * 29) % 20) / 100

  const total = Math.min(1, Math.max(0.08, intensity1 * 0.75 + intensity2 * 0.55 + noise * 0.2))

  const lightness = (18 + total * 58).toFixed(1)
  const chroma = (0.04 + total * 0.18).toFixed(3)
  const hue = (255 - total * 20).toFixed(1)

  return {
    background: `oklch(${lightness}% ${chroma} ${hue})`,
    opacity: Math.max(0.25, total).toFixed(2),
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)

  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // 1. Hero Entrance Animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    heroTl
      .from('.ts-nav', {
        y: -30,
        opacity: 0,
        duration: 0.8,
      })
      .from('.ts-hero__live', {
        y: 20,
        opacity: 0,
        duration: 0.6,
      }, '-=0.4')
      .from('.ts-hero__h1', {
        y: 35,
        opacity: 0,
        duration: 0.85,
      }, '-=0.4')
      .from('.ts-hero__sub', {
        y: 25,
        opacity: 0,
        duration: 0.7,
      }, '-=0.5')
      .from('.ts-hero__ctas .ts-btn', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      }, '-=0.5')
      .from('.ts-hero__fineprint span', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.08,
      }, '-=0.4')
      .from('.ts-eval-card', {
        x: 40,
        opacity: 0,
        rotate: 3,
        duration: 0.9,
      }, '-=0.8')
      .from('.ts-marquee', {
        opacity: 0,
        duration: 0.8,
      }, '-=0.4')

    // 2. Cara Kerja (Step Sequence) ScrollTrigger
    gsap.from('#cara-kerja .ts-section-head > *', {
      scrollTrigger: {
        trigger: '#cara-kerja',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
    })

    gsap.from('.ts-step', {
      scrollTrigger: {
        trigger: '.ts-steps',
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.85,
      stagger: 0.2,
      ease: 'power2.out',
    })

    // 3. Stats Section & Number Counter Roll
    gsap.from('#fitur .ts-section-head > *', {
      scrollTrigger: {
        trigger: '#fitur',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
    })

    gsap.from('.ts-stats__card', {
      scrollTrigger: {
        trigger: '.ts-stats',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 35,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      onStart: () => {
        const stats = { acc: 0, cls: 0 }
        gsap.to(stats, {
          acc: 95,
          cls: 84,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            statAccuracy.value = stats.acc
            statClasses.value = stats.cls
          },
        })
      },
    })

    // 4. Features Section Stagger
    gsap.from('.ts-feature', {
      scrollTrigger: {
        trigger: '.ts-features',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
    })

    // 5. Tentang Section
    gsap.from('.ts-about__copy > *', {
      scrollTrigger: {
        trigger: '#tentang',
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
      x: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
    })

    gsap.from('.ts-spec-console', {
      scrollTrigger: {
        trigger: '.ts-spec-console',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      x: 35,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
    })

    // 6. CTA Panel
    gsap.from('.ts-cta-panel', {
      scrollTrigger: {
        trigger: '.ts-cta-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      scale: 0.96,
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    })

    // 7. Footer
    gsap.from('.ts-footer', {
      scrollTrigger: {
        trigger: '.ts-footer',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  if (ctx) ctx.revert()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   Hallmark · macrostructure: Marquee Hero · tone: atmospheric · anchor hue: blue-indigo
   studied: yes · DNA-source: tally reference build
   nav: N5 Floating pill · footer: Ft5 Statement
   fonts: Geist + Geist Mono + Instrument Serif
   dark mode · blue palette preserved
   ═══════════════════════════════════════════════ */

/* ── tokens ── */
.ts-root {
  /* paper / ink — dark midnight, cool-blue tint */
  --color-paper-0: oklch(11% 0.012 255);   /* page background */
  --color-paper-1: oklch(15% 0.014 255);   /* card */
  --color-paper-2: oklch(19% 0.016 255);   /* elevated card */
  --color-paper-3: oklch(24% 0.014 255);   /* hairline tint */
  --color-ink-0: oklch(96% 0.006 255);     /* primary text */
  --color-ink-1: oklch(76% 0.010 255);     /* body */
  --color-ink-2: oklch(55% 0.012 255);     /* secondary */
  --color-ink-3: oklch(38% 0.010 255);     /* muted */

  /* accent — blue (preserving original palette intent) */
  --color-accent: oklch(62% 0.190 250);       /* primary blue */
  --color-accent-soft: oklch(76% 0.140 240);   /* soft sky blue */
  --color-accent-tint: oklch(22% 0.080 250);  /* dark blue tint for cards */
  --color-companion: oklch(70% 0.160 235);    /* vibrant cyan-blue/azure */
  --color-success: oklch(70% 0.150 150);
  --color-danger: oklch(64% 0.200 25);

  --color-focus: oklch(68% 0.200 250);

  /* rules */
  --rule-hair: 1px solid color-mix(in oklch, var(--color-ink-0) 8%, transparent);
  --rule-soft: 1px solid color-mix(in oklch, var(--color-ink-0) 14%, transparent);

  /* fonts */
  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --font-italic: "Instrument Serif", "Times New Roman", serif;

  /* type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.5rem;
  --text-3xl: 3.5rem;
  --text-4xl: clamp(2rem, 7vw, 4rem);
  --text-5xl: clamp(2.2rem, 9vw, 5rem);

  /* spacing — 4pt */
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 5rem;
  --space-4xl: 8rem;

  /* radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 999px;

  /* easings */
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 140ms;
  --dur-mid: 240ms;
  --dur-slow: 420ms;

  /* z-index scale */
  --z-base: 1;
  --z-raised: 10;
  --z-nav: 50;
  --z-dropdown: 60;

  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.55;
  color: var(--color-ink-0);
  background: var(--color-paper-0);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  min-height: 100vh;
  overflow-x: clip;
}

::selection {
  background: var(--color-accent);
  color: var(--color-paper-0);
}

/* ── layout ── */
.ts-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-inline: var(--space-xl);
}

.ts-italic {
  font-family: var(--font-italic);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--color-accent-soft);
}

.ts-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

/* ── nav · N5 floating pill ── */
.ts-nav {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 8px 6px 16px;
  background: color-mix(in oklch, var(--color-paper-1) 82%, transparent);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: var(--rule-soft);
  border-radius: var(--radius-pill);
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-ink-0) 6%, transparent) inset,
    0 8px 32px -12px rgba(0, 10, 60, 0.6);
  font-size: var(--text-sm);
  transition:
    box-shadow var(--dur-mid) var(--ease-out),
    background var(--dur-mid) var(--ease-out);
}

.ts-nav--scrolled {
  background: color-mix(in oklch, var(--color-paper-1) 92%, transparent);
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-ink-0) 8%, transparent) inset,
    0 12px 40px -16px rgba(0, 10, 60, 0.8);
}

.ts-nav__brand {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: var(--space-xs);
  background: none;
  border: none;
  color: var(--color-ink-0);
  cursor: pointer;
  padding: 0;
}

.ts-nav__logo {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
}

.ts-nav__brand-name { color: var(--color-ink-0); }
.ts-nav__brand-accent { color: var(--color-accent-soft); }

.ts-nav__links {
  display: flex;
  gap: 2px;
}

.ts-nav__link {
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  color: var(--color-ink-1);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  white-space: nowrap;
}

.ts-nav__link:hover { background: var(--color-paper-2); color: var(--color-ink-0); }
.ts-nav__link:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; border-radius: var(--radius-pill); }

.ts-nav__cta {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-paper-0);
  font-weight: 500;
  font-size: var(--text-sm);
  border: 1px solid var(--color-accent);
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}

.ts-nav__cta:hover { background: var(--color-accent-soft); border-color: var(--color-accent-soft); transform: translateY(-1px); }
.ts-nav__cta:active { transform: translateY(0); }
.ts-nav__cta:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

/* user dropdown */
.ts-nav__user-wrap {
  position: relative;
}

.ts-nav__user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  border-radius: var(--radius-pill);
  background: var(--color-paper-2);
  border: var(--rule-hair);
  cursor: pointer;
  color: var(--color-ink-0);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  transition: background var(--dur-fast) var(--ease-out);
}

.ts-nav__user-btn:hover { background: var(--color-paper-3); }

.ts-nav__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}

.ts-nav__avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  background: var(--color-accent-tint);
  color: var(--color-accent-soft);
}

.ts-nav__user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: var(--color-paper-1);
  border: var(--rule-soft);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 40px -16px rgba(0, 10, 60, 0.6);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.ts-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-ink-1);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}

.ts-dropdown__item:hover { background: var(--color-paper-2); color: var(--color-ink-0); }
.ts-dropdown__item--danger { color: var(--color-danger); }
.ts-dropdown__item--danger:hover { background: color-mix(in oklch, var(--color-danger) 12%, transparent); }

.ts-dropdown__icon {
  width: 14px;
  height: 14px;
  flex: none;
  opacity: 0.7;
}

.ts-nav__skeleton {
  width: 90px;
  height: 34px;
  background: var(--color-paper-2);
  border-radius: var(--radius-pill);
  animation: ts-pulse 1.5s ease-in-out infinite;
}

@keyframes ts-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@media (max-width: 760px) {
  .ts-nav__links { display: none; }
  .ts-nav { padding: 6px 8px 6px 12px; }
  .ts-nav__user-name { display: none; }
}

/* ── buttons ── */
.ts-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: var(--radius-pill);
  font-weight: 500;
  font-size: var(--text-base);
  font-family: var(--font-body);
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.ts-btn:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}

.ts-btn--primary {
  background: var(--color-accent);
  color: var(--color-paper-0);
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px -10px color-mix(in oklch, var(--color-accent) 50%, transparent);
}

.ts-btn--primary:hover { background: var(--color-accent-soft); border-color: var(--color-accent-soft); transform: translateY(-1px); }
.ts-btn--primary:active { transform: translateY(0); }

.ts-btn--ghost {
  background: transparent;
  color: var(--color-ink-0);
  border-color: var(--color-paper-3);
}

.ts-btn--ghost:hover { background: var(--color-paper-2); border-color: var(--color-paper-3); }

.ts-btn--light {
  background: var(--color-ink-0);
  color: var(--color-paper-0);
  border-color: var(--color-ink-0);
}

.ts-btn--light:hover { background: var(--color-accent); border-color: var(--color-accent); transform: translateY(-1px); }
.ts-btn--light:active { transform: translateY(0); }

.ts-btn--ghost-light {
  background: transparent;
  color: color-mix(in oklch, var(--color-ink-0) 75%, transparent);
  border-color: color-mix(in oklch, var(--color-ink-0) 20%, transparent);
}

.ts-btn--ghost-light:hover { background: color-mix(in oklch, var(--color-ink-0) 10%, transparent); }

/* ── hero ── */
.ts-hero {
  padding-top: 130px;
  padding-bottom: var(--space-3xl);
  position: relative;
  overflow: clip;
}

/* hairline grid background — DNA from tally */
.ts-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--color-ink-0) 5%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--color-ink-0) 5%, transparent) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 72%);
  pointer-events: none;
}

/* subtle blue radial behind hero */
.ts-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 500px at 25% 10%, color-mix(in oklch, var(--color-accent) 22%, transparent), transparent 65%),
    radial-gradient(700px 450px at 80% 20%, color-mix(in oklch, var(--color-companion) 18%, transparent), transparent 60%);
  pointer-events: none;
}

.ts-hero__live {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 12px;
  border: var(--rule-soft);
  background: var(--color-paper-1);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-1);
  position: relative;
  z-index: var(--z-base);
}

.ts-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-success);
  box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-success) 60%, transparent);
  animation: ts-live-pulse 1800ms var(--ease-in-out) infinite;
  flex: none;
}

@keyframes ts-live-pulse {
  0%   { box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-success) 60%, transparent); }
  70%  { box-shadow: 0 0 0 9px color-mix(in oklch, var(--color-success) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-success) 0%, transparent); }
}

.ts-hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: var(--space-3xl);
  align-items: center;
  margin-top: var(--space-xl);
  position: relative;
  z-index: var(--z-base);
}

@media (max-width: 980px) {
  .ts-hero__layout { grid-template-columns: 1fr; gap: var(--space-2xl); }
}

.ts-hero__h1 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-5xl);
  line-height: 0.97;
  letter-spacing: -0.03em;
  margin: 0.4em 0 0.2em;
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-hero__sub {
  font-size: var(--text-md);
  color: var(--color-ink-1);
  max-width: 50ch;
  margin: 0 0 var(--space-xl);
  line-height: 1.5;
}

.ts-hero__ctas {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  flex-wrap: wrap;
}

.ts-hero__fineprint {
  margin-top: var(--space-xl);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-2);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.ts-hero__fineprint span {
  display: inline-flex;
  align-items: center;
}

.ts-hero__fineprint span:not(:first-child)::before {
  content: "·";
  margin-right: var(--space-sm);
  color: var(--color-ink-3);
  font-weight: bold;
}

/* ── eval card (Tier-A pure-CSS art) ── */
.ts-eval-card {
  background: var(--color-paper-1);
  border: var(--rule-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-ink-0) 5%, transparent) inset,
    0 24px 60px -28px rgba(0, 10, 80, 0.7),
    0 4px 12px -4px rgba(0, 10, 80, 0.3);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  position: relative;
  transform: rotate(0.5deg);
  max-width: 420px;
  margin-left: auto;
}

.ts-eval-card::before {
  content: "";
  position: absolute;
  inset: -8px;
  border: 1px dashed color-mix(in oklch, var(--color-ink-0) 7%, transparent);
  border-radius: calc(var(--radius-lg) + 8px);
  pointer-events: none;
}

.ts-eval-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: var(--space-sm);
  border-bottom: var(--rule-hair);
}

.ts-eval-card__title { font-weight: 600; color: var(--color-ink-0); font-size: var(--text-base); }
.ts-eval-card__meta { font-size: var(--text-xs); color: var(--color-ink-2); margin-top: 2px; }

.ts-eval-card__tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-success);
  background: color-mix(in oklch, var(--color-success) 15%, transparent);
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.ts-eval-card__letters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-xs);
  padding: var(--space-md) 0;
  border-bottom: var(--rule-hair);
}

.ts-eval-card__letter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: var(--rule-hair);
}

.ts-eval-card__letter--correct { border-color: color-mix(in oklch, var(--color-success) 30%, transparent); }
.ts-eval-card__letter--improve { border-color: color-mix(in oklch, var(--color-danger) 30%, transparent); }

.ts-eval-card__arabic {
  font-family: var(--font-body);
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-eval-card__score {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--color-ink-2);
}

.ts-eval-card__letter--improve .ts-eval-card__score { color: var(--color-danger); }
.ts-eval-card__letter--correct .ts-eval-card__score { color: var(--color-success); }

.ts-eval-card__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: var(--space-sm);
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-ink-1);
}

.ts-eval-card__num {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-ink-0);
  letter-spacing: -0.01em;
}

.ts-eval-card__num small { font-size: 0.55em; font-weight: 400; }

.ts-eval-card__bar {
  height: 6px;
  background: var(--color-paper-3);
  border-radius: var(--radius-pill);
  margin-top: var(--space-md);
  overflow: hidden;
}

.ts-eval-card__bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-companion));
  border-radius: inherit;
}

.ts-eval-card__footnote {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-top: 8px;
}

/* ── marquee strip ── */
.ts-marquee {
  margin-top: var(--space-3xl);
  border-top: var(--rule-hair);
  border-bottom: var(--rule-hair);
  padding: var(--space-md) 0;
  overflow: hidden;
  position: relative;
  z-index: var(--z-base);
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

.ts-marquee__track {
  display: flex;
  gap: var(--space-3xl);
  animation: ts-marquee 36s linear infinite;
  width: max-content;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink-2);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.ts-marquee__track span { display: inline-flex; align-items: center; gap: var(--space-md); }
.ts-marquee__track span::after { content: "✦"; color: var(--color-accent); font-size: 0.7em; }

@keyframes ts-marquee {
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .ts-marquee__track { animation: none; }
  .ts-live-dot { animation: none; }
  .ts-nav__skeleton { animation: none; }
}

/* ── sections ── */
.ts-section {
  padding: var(--space-4xl) 0 var(--space-3xl);
  border-top: var(--rule-hair);
}

.ts-section-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: end;
  margin-bottom: var(--space-2xl);
}

@media (max-width: 760px) {
  .ts-section-head { grid-template-columns: 1fr; gap: var(--space-md); }
}

.ts-section-head__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  margin: var(--space-sm) 0 0;
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-section-head__desc {
  font-size: var(--text-md);
  color: var(--color-ink-1);
  max-width: 50ch;
  line-height: 1.5;
}

/* ── steps ── */
.ts-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ts-step {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-2xl);
  align-items: center;
  padding: var(--space-2xl) 0;
  border-bottom: var(--rule-hair);
}

.ts-step:last-child { border-bottom: none; }

@media (max-width: 880px) {
  .ts-step { grid-template-columns: 1fr; gap: var(--space-lg); }
}

.ts-step__art {
  height: 160px;
  border-radius: var(--radius-lg);
  background: var(--color-paper-1);
  border: var(--rule-hair);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex: none;
}

.ts-step__art-icon {
  width: 48px;
  height: 48px;
  color: var(--color-accent-soft);
  position: relative;
  z-index: 2;
}

.ts-step__art-icon svg { width: 100%; height: 100%; }

/* waveform bars for mic art */
.ts-step-art--mic .ts-step__art-bars {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.ts-step-art--mic .ts-step__art-bars i {
  display: block;
  width: 4px;
  border-radius: 2px;
  background: var(--color-accent);
  opacity: 0.6;
  animation: ts-bar 1.2s ease-in-out infinite;
}

.ts-step-art--mic .ts-step__art-bars i:nth-child(1) { height: 8px; animation-delay: 0ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(2) { height: 14px; animation-delay: 80ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(3) { height: 20px; animation-delay: 160ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(4) { height: 28px; animation-delay: 240ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(5) { height: 20px; animation-delay: 320ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(6) { height: 14px; animation-delay: 400ms; }
.ts-step-art--mic .ts-step__art-bars i:nth-child(7) { height: 8px; animation-delay: 480ms; }

@keyframes ts-bar {
  0%, 100% { transform: scaleY(1); opacity: 0.4; }
  50% { transform: scaleY(1.5); opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
  .ts-step-art--mic .ts-step__art-bars i { animation: none; }
}

/* letter selection art */
.ts-step-art--letter .ts-step__art-letters {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.ts-step-art--letter .ts-step__art-letters span {
  font-family: var(--font-body);
  font-size: 2rem;
  color: var(--color-ink-1);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: var(--rule-hair);
  line-height: 1;
  transition: all var(--dur-mid) var(--ease-out);
}

.ts-step-art--letter .ts-step__art-letters span:nth-child(2) {
  background: var(--color-accent-tint);
  border-color: color-mix(in oklch, var(--color-accent) 30%, transparent);
  color: var(--color-accent-soft);
  transform: scale(1.12);
}

.ts-step-art--letter .ts-step__art-cursor {
  width: 2px;
  height: 32px;
  background: var(--color-accent);
  border-radius: 1px;
  animation: ts-blink 1s step-end infinite;
  margin-left: -var(--space-xs);
}

@keyframes ts-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ts-step-art--letter .ts-step__art-cursor { animation: none; }
}

/* result art */
.ts-step-art--result {
  flex-direction: column;
  gap: var(--space-xs);
}

.ts-step__art-score {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--color-accent-soft);
  line-height: 1;
}

.ts-step__art-score small { font-size: 0.5em; font-weight: 400; }

.ts-step__art-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-success);
  background: color-mix(in oklch, var(--color-success) 14%, transparent);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.ts-step__body { display: flex; flex-direction: column; gap: var(--space-xs); }

.ts-step__num {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  color: var(--color-accent-soft);
  opacity: 0.7;
}

.ts-step__title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-ink-0);
}

.ts-step__desc {
  font-size: var(--text-md);
  color: var(--color-ink-1);
  margin: 0;
  max-width: 55ch;
  line-height: 1.55;
}

/* ── stats ── */
.ts-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

@media (max-width: 760px) { .ts-stats { grid-template-columns: 1fr; } }

.ts-stats__card {
  padding: var(--space-2xl) var(--space-xl);
  background: var(--color-paper-1);
  border: var(--rule-soft);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.ts-stats__card--1 { background: linear-gradient(160deg, color-mix(in oklch, var(--color-accent-tint) 80%, var(--color-paper-1)), var(--color-paper-1) 55%); }
.ts-stats__card--2 { background: linear-gradient(160deg, color-mix(in oklch, var(--color-companion) 18%, var(--color-paper-1)), var(--color-paper-1) 55%); }
.ts-stats__card--3 { background: linear-gradient(160deg, color-mix(in oklch, var(--color-paper-2) 80%, var(--color-paper-1)), var(--color-paper-1) 55%); }

.ts-stats__num {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 6vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  color: var(--color-ink-0);
}

.ts-stats__num small {
  font-size: 0.45em;
  font-weight: 500;
  color: var(--color-ink-1);
  margin-left: 4px;
}

.ts-stats__label {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: var(--text-xs);
  color: var(--color-ink-2);
  margin-top: var(--space-md);
}

.ts-stats__note {
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-ink-1);
  max-width: 28ch;
  line-height: 1.45;
}

/* ── features ── */
.ts-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

@media (max-width: 880px) { .ts-features { grid-template-columns: 1fr; } }

.ts-feature {
  background: var(--color-paper-1);
  border: var(--rule-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  transition: transform var(--dur-mid) var(--ease-out), box-shadow var(--dur-mid) var(--ease-out);
}

.ts-feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 60px -30px color-mix(in oklch, var(--color-accent) 30%, rgba(0, 10, 80, 0.5));
}

.ts-feature__art {
  height: 160px;
  border-radius: var(--radius-md);
  background: var(--color-paper-2);
  border: var(--rule-hair);
  position: relative;
  overflow: hidden;
}

/* wave art */
.ts-feature-art--wave svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ts-wave-area { fill: url(#wave-grad); }
.ts-wave-line { fill: none; stroke: var(--color-accent); stroke-width: 2; stroke-linecap: round; }
.ts-wave-dot { fill: var(--color-paper-1); stroke: var(--color-accent); stroke-width: 2; }

.ts-feature-art__label {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-success);
  background: color-mix(in oklch, var(--color-success) 14%, transparent);
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

/* harakat art */
.ts-feature-art--harakat {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ts-harakat-grid {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.ts-harakat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--rule-hair);
  background: var(--color-paper-1);
  transition: all var(--dur-mid) var(--ease-out);
}

.ts-harakat-cell--active {
  border-color: color-mix(in oklch, var(--color-accent) 35%, transparent);
  background: var(--color-accent-tint);
}

.ts-harakat-arabic {
  font-family: var(--font-body);
  font-size: 2rem;
  line-height: 1;
  color: var(--color-ink-0);
}

.ts-harakat-cell--active .ts-harakat-arabic { color: var(--color-accent-soft); }

.ts-harakat-name {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-2);
}

/* progress art */
.ts-feature-art--progress {
  display: flex;
  align-items: flex-end;
  padding: var(--space-md);
}

.ts-progress-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  height: 100px;
}

.ts-progress-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  height: 100%;
}

.ts-progress-bar span {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}

.ts-progress-bar i {
  display: block;
  width: 100%;
  height: var(--pct, 50%);
  background: color-mix(in oklch, var(--color-accent) 35%, var(--color-paper-3));
  border-radius: 3px 3px 0 0;
  font-style: normal;
}

.ts-progress-bar--today i {
  background: var(--color-accent);
  box-shadow: 0 0 12px -4px color-mix(in oklch, var(--color-accent) 60%, transparent);
}

.ts-feature__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-ink-0);
}

.ts-feature__desc {
  font-size: var(--text-sm);
  color: var(--color-ink-1);
  margin: 0;
  line-height: 1.55;
}

.ts-feature__link {
  margin-top: auto;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent-soft);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.ts-feature:hover .ts-feature__link { text-decoration: underline; }

/* ── about ── */
.ts-about {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
}

@media (max-width: 880px) {
  .ts-about { grid-template-columns: 1fr; }
}

.ts-about__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: flex-start;
}

.ts-about__actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.ts-about__title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: var(--space-xs) 0 0;
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-about__text {
  font-size: var(--text-md);
  color: var(--color-ink-1);
  max-width: 55ch;
  line-height: 1.55;
  margin: 0;
}

/* ── Rich CNN Pipeline & Spectrogram Console ── */
.ts-spec-console {
  background: var(--color-paper-1);
  border: var(--rule-soft);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-ink-0) 6%, transparent) inset,
    0 24px 60px -28px rgba(0, 10, 80, 0.7);
  position: relative;
}

.ts-spec-console__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: var(--space-xs);
  border-bottom: var(--rule-hair);
}

.ts-spec-console__badge {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent-soft);
}

.ts-spec-console__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink-0);
  letter-spacing: -0.01em;
  margin-top: 2px;
}

.ts-spec-console__status {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--color-ink-2);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-paper-2);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: var(--rule-hair);
}

/* Spectrogram 2D Heatmap View */
.ts-spec-view {
  display: flex;
  gap: var(--space-xs);
  align-items: stretch;
  background: var(--color-paper-0);
  padding: 12px;
  border-radius: var(--radius-md);
  border: var(--rule-hair);
}

.ts-spec-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-3);
  padding-right: 6px;
  border-right: 1px dashed color-mix(in oklch, var(--color-ink-0) 8%, transparent);
}

.ts-spec-heatmap {
  display: flex;
  gap: 3px;
  flex: 1;
  height: 120px;
  align-items: stretch;
}

.ts-spec-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.ts-spec-bin {
  flex: 1;
  border-radius: 1px;
  min-height: 2px;
  transition: opacity var(--dur-fast) var(--ease-out);
}

.ts-spec-x-axis {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-3);
  padding: 0 8px 0 28px;
  margin-top: -6px;
}

/* Pipeline Sequence */
.ts-spec-pipeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-paper-2);
  border-radius: var(--radius-md);
  border: var(--rule-hair);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-2);
}

.ts-spec-pipe-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ts-spec-pipe-node--active {
  color: var(--color-accent-soft);
  font-weight: 500;
}

.ts-spec-pipe-arrow {
  color: var(--color-ink-3);
  font-size: 10px;
}

/* Prediction Result Bar */
.ts-spec-result {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px 14px;
  background: var(--color-paper-0);
  border-radius: var(--radius-md);
  border: var(--rule-soft);
}

.ts-spec-result__letter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-tint);
  border: 1px solid color-mix(in oklch, var(--color-accent) 30%, transparent);
  flex: none;
}

.ts-spec-result__char {
  font-family: var(--font-body);
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-accent-soft);
}

.ts-spec-result__tag {
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-soft);
  margin-top: 1px;
}

.ts-spec-result__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ts-spec-result__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ts-spec-result__label {
  color: var(--color-ink-1);
  font-weight: 500;
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ts-spec-result__score {
  font-family: var(--font-mono);
  color: var(--color-success);
  font-weight: 600;
  font-size: 11px;
}

.ts-spec-result__meter {
  height: 4px;
  background: var(--color-paper-3);
  border-radius: 2px;
  overflow: hidden;
}

.ts-spec-result__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-success));
  border-radius: 2px;
}

.ts-spec-result__meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-2);
}

/* ── cta panel ── */
.ts-cta-section {
  padding: var(--space-3xl) 0 var(--space-4xl);
}

.ts-cta-panel {
  position: relative;
  background: var(--color-paper-1);
  color: var(--color-ink-0);
  border: var(--rule-soft);
  border-radius: var(--radius-xl);
  padding: var(--space-4xl) var(--space-2xl);
  text-align: center;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-ink-0) 6%, transparent) inset,
    0 30px 80px -30px rgba(0, 10, 60, 0.8);
}

.ts-cta-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 250px at 15% 105%, color-mix(in oklch, var(--color-accent) 30%, transparent), transparent 70%),
    radial-gradient(500px 220px at 85% -5%, color-mix(in oklch, var(--color-companion) 25%, transparent), transparent 70%);
  z-index: -1;
}

.ts-cta-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--color-ink-0) 7%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--color-ink-0) 7%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  z-index: -1;
}

.ts-cta-panel__title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
  margin: 0 0 var(--space-md);
  max-width: 18ch;
  margin-inline: auto;
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-cta-panel__title .ts-italic { color: var(--color-accent-soft); }

.ts-cta-panel__sub {
  color: var(--color-ink-1);
  max-width: 50ch;
  margin: 0 auto var(--space-xl);
  font-size: var(--text-md);
  line-height: 1.5;
}

.ts-cta-panel__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  flex-wrap: wrap;
}

/* ── footer ── */
.ts-footer {
  padding: var(--space-3xl) 0 var(--space-2xl);
  border-top: var(--rule-hair);
}

.ts-footer__statement {
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 4.5vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  max-width: 22ch;
  margin: 0 0 var(--space-2xl);
  color: var(--color-ink-0);
  font-style: normal;
}

.ts-footer__statement .ts-italic { color: var(--color-accent-soft); }

.ts-footer__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  border-top: var(--rule-hair);
  padding-top: var(--space-xl);
}

@media (max-width: 760px) { .ts-footer__row { grid-template-columns: 1fr 1fr; } }

.ts-footer__col h5 {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-ink-2);
  margin: 0 0 var(--space-sm);
}

.ts-footer__col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm); }

.ts-footer__col button,
.ts-footer__col a {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: var(--text-sm);
  font-family: var(--font-body);
  color: var(--color-ink-1);
  cursor: pointer;
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
  text-align: left;
}

.ts-footer__col button:hover,
.ts-footer__col a:hover { color: var(--color-ink-0); }

.ts-footer__legal {
  margin-top: var(--space-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-2);
  border-top: var(--rule-hair);
  padding-top: var(--space-md);
}

.ts-footer__wordmark {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.02em;
  font-size: var(--text-base);
  color: var(--color-ink-0);
}

@media (max-width: 760px) {
  .ts-footer__legal { flex-direction: column; gap: var(--space-sm); align-items: flex-start; }
}

/* ── focus ── */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* ── responsive coverage 320/375/414/768px ── */
@media (max-width: 414px) {
  .ts-container { padding-inline: var(--space-md); }
  .ts-hero__h1 { font-size: clamp(1.9rem, 9vw, 3.5rem); }
  .ts-eval-card { transform: none; }
  .ts-stats { grid-template-columns: 1fr; }
  .ts-features { grid-template-columns: 1fr; }
  .ts-footer__row { grid-template-columns: 1fr; }
  .ts-btn { white-space: nowrap; }
}
</style>