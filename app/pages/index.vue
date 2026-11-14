<template>
  <div class="ts-root bg-dark-950 text-ink-0 font-sans selection:bg-primary-500 selection:text-dark-950 min-h-screen overflow-x-clip antialiased">

    <!-- ───────── nav · N5 Floating pill ───────── -->
    <nav class="ts-nav" aria-label="Primary" :class="{ 'ts-nav--scrolled': isScrolled }">
      <button class="ts-nav__brand flex items-center gap-1.5 sm:gap-2 mr-0.5 sm:mr-2 bg-none border-none cursor-pointer p-0 text-ink-0 font-display font-semibold text-[13px] sm:text-sm tracking-tight shrink-0 whitespace-nowrap" @click="scrollTo('beranda')" aria-label="Tarteel Space home">
        <img src="/logo.png" alt="" width="22" height="22" fetchpriority="high" class="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[5px] object-contain" aria-hidden="true" />
        <span class="text-ink-0">Tarteel<span class="text-primary-400">Space</span></span>
      </button>
      <div class="ts-nav__links flex gap-0.5">
        <button class="ts-nav__link" @click="scrollTo('cara-kerja')">Cara Kerja</button>
        <button class="ts-nav__link" @click="scrollTo('fitur')">Fitur</button>
        <button class="ts-nav__link" @click="scrollTo('tentang')">Tentang</button>
      </div>
      <ClientOnly>
        <template v-if="authStore.isLoggedIn">
          <div class="ts-nav__user-wrap relative" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="ts-nav__user-btn"
              :aria-expanded="isDropdownOpen"
              aria-haspopup="true"
              :title="authStore.userName || 'Profil Pengguna'"
              :aria-label="authStore.userName || 'Menu Profil Pengguna'"
            >
              <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-7 h-7 rounded-full object-cover shrink-0" alt="Avatar" />
              <span v-else class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-primary-950 text-primary-400 border border-primary-500/30 shrink-0">{{ authStore.initials || '?' }}</span>
            </button>
            <div v-if="isDropdownOpen" class="ts-dropdown" role="menu">
              <!-- User Info Header -->
              <div class="px-3.5 py-2.5 border-b border-white/10 mb-1">
                <p class="font-sans text-xs font-semibold text-ink-0 truncate">{{ authStore.userName || 'Pengguna' }}</p>
                <p class="font-mono text-[10px] text-primary-400 uppercase tracking-wider mt-0.5">{{ authStore.isAdmin ? 'Admin' : 'Pengguna' }}</p>
              </div>
              <button
                class="ts-dropdown__item"
                role="menuitem"
                @click="navigateTo(authStore.isAdmin ? '/admin' : '/dashboard'); isDropdownOpen = false"
              >
                <svg class="w-3.5 h-3.5 shrink-0 opacity-70" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
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
                <svg class="w-3.5 h-3.5 shrink-0 opacity-70" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
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
          <div class="w-[34px] h-[34px] bg-dark-850 rounded-full animate-pulse"></div>
        </template>
      </ClientOnly>
      <span class="h-4 w-px bg-white/10 mx-0 sm:mx-0.5 shrink-0" aria-hidden="true"></span>
      <ThemeToggle size="sm" />
    </nav>

    <!-- ───────── main landmark ───────── -->
    <main id="main-content">

    <!-- ───────── hero · Marquee Hero + split diptych ───────── -->
    <section class="ts-hero pt-24 sm:pt-[130px] pb-12 sm:pb-20 relative overflow-clip" id="beranda">
      <div class="ts-container max-w-[1240px] mx-auto px-4 sm:px-6 w-full">

        <!-- live badge -->
        <div class="ts-hero__live inline-flex items-center gap-2 py-1 sm:py-1.5 px-3 sm:px-3.5 border border-white/10 bg-dark-900 rounded-full font-mono text-[11px] sm:text-xs text-ink-1 relative z-10 max-w-full" role="status" aria-live="polite">
          <span class="ts-live-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
          <span class="truncate sm:overflow-visible">DITENAGAI DEEP LEARNING · <strong class="font-semibold text-ink-0">CNN</strong> · MFCC</span>
        </div>

        <!-- split layout: headline left, art right -->
        <div class="ts-hero__layout grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-8 sm:gap-12 lg:gap-20 items-center mt-6 sm:mt-8 relative z-10">
          <div class="ts-hero__copy">
            <h1 class="ts-hero__h1 font-display font-semibold text-[clamp(2.1rem,7vw,4.5rem)] leading-[1.02] tracking-tight my-3 sm:my-4 text-ink-0">
              Sempurnakan Pelafalan<br>
              Hijaiyah<em class="ts-italic font-serif italic text-primary-400 font-normal ml-1.5 sm:ml-2">dengan benar.</em>
            </h1>
            <p class="ts-hero__sub text-sm sm:text-base md:text-lg text-ink-1 max-w-[50ch] mb-6 sm:mb-8 leading-relaxed">
              Tarteel Space mengevaluasi akurasi pelafalan huruf hijaiyah Anda secara langsung
              menggunakan teknologi Deep Learning — tanpa batasan waktu atau tempat.
            </p>
            <div class="ts-hero__ctas flex gap-3 items-center flex-wrap">
              <button class="ts-btn ts-btn--primary" @click="navigateTo('/dashboard/practice')">
                Mulai Latihan <span aria-hidden="true">→</span>
              </button>
              <button class="ts-btn ts-btn--ghost" @click="scrollTo('cara-kerja')">
                Lihat Cara Kerja
              </button>
            </div>
            <div class="ts-hero__fineprint mt-10 sm:mt-12 font-mono text-[11px] sm:text-xs text-ink-2">
              <span>gratis sepenuhnya</span>
              <span>langsung dari browser</span>
              <span>tanpa instal aplikasi</span>
            </div>
          </div>

          <!-- Arabic evaluation card (Hallmark Style Line-Item Sheet) -->
          <aside class="ts-eval-card" aria-label="Pratinjau evaluasi pelafalan">
            <div class="ts-eval-card__head flex justify-between items-start pb-3.5 sm:pb-4 border-b border-white/10">
              <div>
                <div class="font-mono font-bold text-ink-0 text-base sm:text-lg tracking-tight">SESI-04212</div>
                <div class="font-mono text-[11px] sm:text-xs text-ink-2 mt-0.5 sm:mt-1">Ahmad Rizal · Pelafalan Hijaiyah</div>
              </div>
              <span class="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-emerald-400 bg-emerald-500/15 py-1 px-2.5 rounded-full font-medium">EVALUASI · LIVE</span>
            </div>

            <div class="ts-eval-card__rows py-3.5 sm:py-4 border-b border-white/10 flex flex-col gap-2 sm:gap-2.5">
              <div class="flex justify-between items-center font-mono text-xs sm:text-sm gap-2">
                <span class="text-ink-1 truncate">Huruf <strong class="text-ink-0 font-normal">بَ (Ba · Fathah)</strong></span>
                <span class="text-ink-0 font-semibold tracking-tight shrink-0">96.4%</span>
              </div>
              <div class="flex justify-between items-center font-mono text-xs sm:text-sm gap-2">
                <span class="text-ink-1 truncate">Huruf <strong class="text-ink-0 font-normal">تِ (Ta · Kasrah)</strong></span>
                <span class="text-ink-0 font-semibold tracking-tight shrink-0">91.2%</span>
              </div>
              <div class="flex justify-between items-center font-mono text-xs sm:text-sm gap-2">
                <span class="text-ink-1 truncate">Huruf <strong class="text-ink-0 font-normal">ثُ (Tsa · Dhommah)</strong></span>
                <span class="text-ink-0 font-semibold tracking-tight shrink-0">88.5%</span>
              </div>
              <div class="flex justify-between items-center font-mono text-xs sm:text-sm text-emerald-400 gap-2">
                <span class="truncate">Kesesuaian Makhraj</span>
                <span class="font-semibold tracking-tight shrink-0">Sangat Baik</span>
              </div>
            </div>

            <div class="ts-eval-card__total flex justify-between items-baseline pt-3.5 sm:pt-4 mt-0.5">
              <span class="font-mono text-xs sm:text-sm text-ink-1">Total Akurasi Sesi</span>
              <span class="font-mono font-bold text-2xl sm:text-3xl lg:text-4xl text-ink-0 tracking-tight">88.5<small class="text-[0.65em] font-normal text-ink-1 ml-0.5">%</small></span>
            </div>
            
            <div class="ts-eval-card__bar h-2 bg-dark-800 rounded-full mt-3.5 sm:mt-4 overflow-hidden" aria-hidden="true">
              <i class="block h-full bg-gradient-to-r from-primary-500 via-primary-azure to-emerald-400 rounded-full" style="width: 88.5%"></i>
            </div>
            
            <div class="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-ink-3 mt-2.5 sm:mt-3 flex justify-between items-center">
              <span>84 KELAS HIJAIYAH</span>
              <span>MODEL CNN 95% AKURASI</span>
            </div>
          </aside>
        </div>

        <!-- marquee strip -->
        <div class="ts-marquee w-full overflow-hidden border-y border-white/5 py-3 sm:py-4 mt-12 sm:mt-20 relative z-10" aria-hidden="true">
          <div class="ts-marquee__track flex gap-12 font-mono text-sm text-ink-2 uppercase tracking-[0.18em] whitespace-nowrap animate-marquee">
            <span class="inline-flex items-center gap-3">REKAM · SUARA · ANDA</span>
            <span class="inline-flex items-center gap-3">EVALUASI · CEPAT</span>
            <span class="inline-flex items-center gap-3">PELAJARI · TAJWID · HIJAIYAH</span>
            <span class="inline-flex items-center gap-3">BERBASIS · CNN · MFCC</span>
            <span class="inline-flex items-center gap-3">AKURASI · INSTAN</span>
            <span class="inline-flex items-center gap-3">REKAM · SUARA · ANDA</span>
            <span class="inline-flex items-center gap-3">EVALUASI · CEPAT</span>
            <span class="inline-flex items-center gap-3">PELAJARI · TAJWID · HIJAIYAH</span>
            <span class="inline-flex items-center gap-3">BERBASIS · CNN · MFCC</span>
            <span class="inline-flex items-center gap-3">AKURASI · INSTAN</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ───────── cara kerja · step sequence ───────── -->
    <section class="ts-section py-24 border-t border-white/5" id="cara-kerja">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <div class="ts-section-head grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end mb-12">
          <div>
            <span class="ts-eyebrow font-mono text-xs tracking-[0.15em] uppercase text-primary-400 block mb-2">◇ cara kerja</span>
            <h2 class="ts-section-head__title font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-0">
              Simak, lafalkan, evaluasi — <em class="ts-italic font-serif italic text-primary-400 font-normal">terarah</em>.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Tiga langkah terstruktur untuk menyempurnakan pelafalan hijaiyah Anda — mulai dari menyimak contoh Syaikh hingga evaluasi AI dengan kontrol validasi.
          </p>
        </div>

        <div class="ts-steps flex flex-col">
          <div class="ts-step">
            <div class="ts-step__art ts-step-art--audio flex flex-col items-center justify-center gap-2 relative" aria-hidden="true">
              <div class="w-12 h-12 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 ml-0.5">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-primary-300 bg-primary-950/80 px-2.5 py-0.5 rounded-full border border-primary-500/30">Audio Syaikh</span>
              <div class="ts-step__art-bars absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 opacity-70" aria-hidden="true">
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 6px; animation-delay: 0ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 12px; animation-delay: 80ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 16px; animation-delay: 160ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 22px; animation-delay: 240ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 16px; animation-delay: 320ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 12px; animation-delay: 400ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 6px; animation-delay: 480ms;"></i>
              </div>
            </div>
            <div class="ts-step__body flex flex-col gap-1.5">
              <div class="ts-step__num font-mono text-xs tracking-wider text-primary-400 opacity-70">1.0</div>
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Simak Contoh Syaikh</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Pilih target huruf hijaiyah dan dengarkan audio contoh pelafalan makhraj dari Syaikh / Ustadz agar Anda memiliki acuan bacaan yang fasih dan benar sebelum berlatih.</p>
            </div>
          </div>

          <div class="ts-step">
            <div class="ts-step__art ts-step-art--letter" aria-hidden="true">
              <div class="ts-step__art-letters flex gap-3 items-center">
                <span class="text-3xl text-ink-1 py-1 px-2.5 rounded-lg border border-white/10">ب</span>
                <span class="text-3xl text-primary-400 py-1 px-2.5 rounded-lg border border-primary-500/30 bg-primary-950 scale-110">ت</span>
                <span class="text-3xl text-ink-1 py-1 px-2.5 rounded-lg border border-white/10">ث</span>
                <span class="text-3xl text-ink-1 py-1 px-2.5 rounded-lg border border-white/10">ج</span>
              </div>
              <div class="w-0.5 h-8 bg-primary-500 rounded-sm animate-blink -ml-2"></div>
            </div>
            <div class="ts-step__body flex flex-col gap-1.5">
              <div class="ts-step__num font-mono text-xs tracking-wider text-primary-400 opacity-70">2.0</div>
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Lafalkan & Rekam Suara</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Aktifkan mikrofon lalu lafalkan huruf hijaiyah sesuai makhraj dan harakat. Sistem merekam dan langsung mengekstrak spektrogram suara Anda untuk dianalisis.</p>
            </div>
          </div>

          <div class="ts-step">
            <div class="ts-step__art ts-step-art--result flex flex-col items-center justify-center gap-2 relative p-4" aria-hidden="true">
              <div class="flex items-baseline gap-2">
                <div class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-primary-400 leading-none">88<small class="text-xl sm:text-2xl font-normal">%</small></div>
              </div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1">
                <div class="font-mono text-[10px] tracking-wider uppercase text-emerald-400 bg-emerald-500/15 py-0.5 px-2.5 rounded-full border border-emerald-500/30">Sangat Baik</div>
              </div>
            </div>
            <div class="ts-step__body flex flex-col gap-1.5">
              <div class="ts-step__num font-mono text-xs tracking-wider text-primary-400 opacity-70">3.0</div>
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Terima Evaluasi & Laporkan</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Model CNN menyajikan skor akurasi pelafalan Anda. Jika merasa hasil prediksi AI keliru, Anda dapat mengirim laporan keluhan langsung untuk membantu menyempurnakan model.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── stats ───────── -->
    <section class="ts-section py-24 border-t border-white/5" id="fitur">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <div class="ts-section-head grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end mb-12">
          <div>
            <span class="ts-eyebrow font-mono text-xs tracking-[0.15em] uppercase text-primary-400 block mb-2">◇ model AI</span>
            <h2 class="ts-section-head__title font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-0">
              Performa model yang <em class="ts-italic font-serif italic text-primary-400 font-normal">terukur & terus diuji</em>.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Dikembangkan dalam penelitian Skripsi Program Studi Teknologi Informasi, memanfaatkan ekstraksi fitur MFCC dan arsitektur CNN yang dilatih khusus untuk mengenali karakteristik makhraj 84 kelas hijaiyah secara objektif.
          </p>
        </div>

        <div class="ts-stats grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="ts-stats__card ts-stats__card--1">
            <div class="ts-stats__num">{{ Math.round(statAccuracy) }}<small class="text-[0.45em] font-medium text-ink-1 ml-1">%</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">akurasi model CNN</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">Diuji pada dataset pelafalan hijaiyah berbasis fitur MFCC.</div>
          </div>
          <div class="ts-stats__card ts-stats__card--2">
            <div class="ts-stats__num">{{ Math.round(statClasses) }}<small class="text-[0.45em] font-medium text-ink-1 ml-1">kelas</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">kelas klasifikasi</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">28 huruf hijaiyah × 3 harakat (fathah, kasrah, dhommah).</div>
          </div>
          <div class="ts-stats__card ts-stats__card--3">
            <div class="ts-stats__num">&lt;1<small class="text-[0.45em] font-medium text-ink-1 ml-1">dtk</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">waktu evaluasi</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">Inferensi model hingga tampil di browser.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── features ───────── -->
    <section class="ts-section py-24 border-t border-white/5">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <div class="ts-section-head grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end mb-12">
          <div>
            <span class="ts-eyebrow font-mono text-xs tracking-[0.15em] uppercase text-primary-400 block mb-2">◇ fitur utama</span>
            <h2 class="ts-section-head__title font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-0">
              Latih, evaluasi, pantau — <em class="ts-italic font-serif italic text-primary-400 font-normal">berkelanjutan</em>.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Fitur pendukung pembelajaran mandiri untuk membantu Anda mengasah ketepatan pelafalan hijaiyah secara terstruktur, objektif, dan terukur.
          </p>
        </div>

        <div class="ts-features grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <NuxtLink to="/dashboard/practice" class="ts-feature">
            <div class="ts-feature__art ts-feature-art--wave" aria-hidden="true">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2563eb" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path class="ts-wave-area" d="M0,70 C20,60 40,40 60,50 C80,60 100,30 120,40 C140,50 160,20 180,35 C200,50 220,25 240,30 C260,35 280,50 300,45 L300,100 L0,100 Z"/>
                <path class="ts-wave-line" d="M0,70 C20,60 40,40 60,50 C80,60 100,30 120,40 C140,50 160,20 180,35 C200,50 220,25 240,30 C260,35 280,50 300,45"/>
                <circle class="ts-wave-dot" cx="300" cy="45" r="5"/>
              </svg>
              <div class="ts-feature-art__label">88.5% AKURAT</div>
            </div>
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Evaluasi Pelafalan Berbasis MFCC & CNN</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Ekstraksi fitur koefisien MFCC dan model Deep Learning CNN memproses sinyal audio Anda untuk menyajikan estimasi akurasi pelafalan secara instan.</p>
            <span class="ts-feature__link">Mulai latihan →</span>
          </NuxtLink>

          <NuxtLink to="/dashboard/practice" class="ts-feature">
            <div class="ts-feature__art ts-feature-art--harakat flex items-center justify-center" aria-hidden="true">
              <div class="ts-harakat-grid flex gap-3 items-center">
                <div class="ts-harakat-cell ts-harakat-cell--active">
                  <span class="ts-harakat-arabic font-display text-3xl text-primary-400">بَ</span>
                  <span class="ts-harakat-name font-mono text-[10px] tracking-wider uppercase text-ink-2">Fathah</span>
                </div>
                <div class="ts-harakat-cell">
                  <span class="ts-harakat-arabic font-display text-3xl text-ink-0">بِ</span>
                  <span class="ts-harakat-name font-mono text-[10px] tracking-wider uppercase text-ink-2">Kasrah</span>
                </div>
                <div class="ts-harakat-cell">
                  <span class="ts-harakat-arabic font-display text-3xl text-ink-0">بُ</span>
                  <span class="ts-harakat-name font-mono text-[10px] tracking-wider uppercase text-ink-2">Dhommah</span>
                </div>
              </div>
            </div>
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Cakupan 84 Target Kelas Huruf Hijaiyah Berharakat</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Mencakup seluruh 28 huruf hijaiyah dalam tiga harakat utama (fathah, kasrah, dan dhommah) untuk bimbingan latihan makhraj yang komprehensif.</p>
            <span class="ts-feature__link">Lihat daftar huruf →</span>
          </NuxtLink>

          <NuxtLink to="/dashboard" class="ts-feature">
            <div class="ts-feature__art ts-feature-art--progress flex items-end p-4" aria-hidden="true">
              <div class="ts-progress-bars flex items-end gap-1.5 w-full h-[100px]">
                <div class="ts-progress-bar" style="--pct: 45%"><span>Sen</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 62%"><span>Sel</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 58%"><span>Rab</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 80%"><span>Kam</span><i></i></div>
                <div class="ts-progress-bar ts-progress-bar--today" style="--pct: 88%"><span>Jum</span><i></i></div>
              </div>
            </div>
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Dasbor Riwayat & Pemantauan Latihan</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Pantau perkembangan skor harian Anda. Dasbor mencatat riwayat latihan secara otomatis sehingga memudahkan evaluasi huruf-huruf yang masih perlu ditingkatkan.</p>
            <span class="ts-feature__link">Lihat dasbor →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ───────── about / tentang ───────── -->
    <section class="ts-section py-24 border-t border-white/5" id="tentang">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <div class="ts-about grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div class="ts-about__copy flex flex-col gap-4 items-start">
            <span class="ts-eyebrow font-mono text-xs tracking-[0.15em] uppercase text-primary-400 block mb-1">◇ tentang proyek</span>
            <h2 class="ts-about__title font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-0">
              Menyatukan pelatihan pelafalan dan <em class="ts-italic font-serif italic text-primary-400 font-normal">teknologi modern</em>.
            </h2>
            <p class="ts-about__text text-base md:text-lg text-ink-1 max-w-[55ch] leading-relaxed">
              Tarteel Space diteliti dan dikembangkan oleh <a href="https://rizalharyaputra.my.id" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 font-semibold underline underline-offset-4 decoration-primary-500/40 hover:decoration-primary-400 transition-colors">Rizal Haryaputra</a> dalam rangka penelitian Skripsi Program Studi Teknologi Informasi, Universitas Negeri Yogyakarta (UNY). Proyek ini bertujuan menyediakan media latihan mandiri yang terukur, objektif, dan dapat diakses fleksibel langsung melalui peramban web.
            </p>
            <p class="ts-about__text text-base md:text-lg text-ink-1 max-w-[55ch] leading-relaxed">
              Dengan memadukan ekstraksi fitur audio Mel-Frequency Cepstral Coefficients (MFCC) dan arsitektur Convolutional Neural Network (CNN), sistem mengevaluasi kemiripan pelafalan pengguna terhadap audio referensi makhraj yang fasih — hadir sebagai pendamping latihan mandiri tanpa mengesampingkan pentingnya bimbingan talaqqi bersama guru/asatidz.
            </p>
            <div class="ts-about__actions flex gap-3 items-center flex-wrap mt-4">
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
              <div class="ts-spec-console__head flex justify-between items-start pb-2 border-b border-white/5">
                <div class="ts-spec-console__title-wrap">
                  <span class="font-mono text-[10px] tracking-wider uppercase text-primary-400 block">PIPELINE · MFCC & CNN</span>
                  <div class="font-display text-base font-semibold text-ink-0 tracking-tight mt-0.5">Spektrogram Fitur MFCC</div>
                </div>
                <div class="ts-spec-console__status font-mono text-[10px] text-ink-2 flex items-center gap-1.5 bg-dark-850 px-2.5 py-1 rounded-full border border-white/5">
                  <span class="ts-live-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
                  <span>16 kHz · Fitur MFCC</span>
                </div>
              </div>

              <!-- Main spectrogram canvas / matrix -->
              <div class="ts-spec-view flex gap-2 items-stretch bg-dark-950 p-3 rounded-xl border border-white/5">
                <div class="ts-spec-y-axis flex flex-col justify-between font-mono text-[9px] text-ink-3 pr-2 border-r border-dashed border-white/10">
                  <span>8k</span>
                  <span>4k</span>
                  <span>2k</span>
                  <span>0</span>
                </div>
                <div class="ts-spec-heatmap flex gap-1 flex-1 h-[120px] items-stretch">
                  <div v-for="c in 24" :key="c" class="flex flex-col gap-0.5 flex-1">
                    <div
                      v-for="r in 12"
                      :key="r"
                      class="flex-1 rounded-[1px] min-h-[2px] transition-opacity duration-150"
                      :style="getHeatmapStyle(c, r)"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Time axis -->
              <div class="ts-spec-x-axis flex justify-between font-mono text-[9px] text-ink-3 px-2 pl-7 -mt-1.5">
                <span>0.0s</span>
                <span>0.2s</span>
                <span>0.4s</span>
                <span>0.6s</span>
                <span>0.8s</span>
              </div>

              <!-- CNN Pipeline mini-flow -->
              <div class="ts-spec-pipeline flex items-center justify-between gap-1.5 p-2 px-3 bg-dark-850 rounded-xl border border-white/5 font-mono text-[11px] text-ink-2">
                <div class="flex items-center gap-1.5">
                  <span>〰</span>
                  <span>1. Audio WAV</span>
                </div>
                <span class="text-ink-3 text-[10px]">→</span>
                <div class="flex items-center gap-1.5 text-primary-400 font-medium">
                  <span>▦</span>
                  <span>2. Fitur MFCC</span>
                </div>
                <span class="text-ink-3 text-[10px]">→</span>
                <div class="flex items-center gap-1.5">
                  <span>☵</span>
                  <span>3. Klasifikasi CNN</span>
                </div>
              </div>

              <!-- Bottom prediction result card -->
              <div class="ts-spec-result flex items-center gap-4 p-3 bg-dark-950 rounded-xl border border-white/10">
                <div class="ts-spec-result__letter flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-primary-950 border border-primary-500/30 shrink-0">
                  <span class="font-display text-xl text-primary-400 leading-none">بَ</span>
                  <span class="font-mono text-[8px] tracking-wider uppercase text-primary-400 mt-0.5">Fathah</span>
                </div>
                <div class="ts-spec-result__info flex flex-col gap-1 flex-1 min-w-0">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-ink-1 font-mono uppercase text-[11px] tracking-wider font-medium">Hasil Klasifikasi</span>
                    <span class="font-mono text-emerald-400 font-semibold text-[11px]">96.4% Akurat</span>
                  </div>
                  <div class="h-1 bg-dark-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full" style="width: 96.4%"></div>
                  </div>
                  <div class="font-mono text-[10px] text-ink-2">
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
    <section class="ts-cta-section py-24">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <div class="ts-cta-panel relative bg-dark-900 text-ink-0 border border-white/10 rounded-3xl p-12 md:p-20 text-center overflow-hidden shadow-2xl">
          <h2 class="ts-cta-panel__title font-display text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-4 max-w-[18ch] mx-auto text-ink-0">
            Sempurnakan bacaan Anda <em class="ts-italic font-serif italic text-primary-400 font-normal">hari ini</em>.
          </h2>
          <p class="ts-cta-panel__sub text-base md:text-lg text-ink-1 max-w-[50ch] mx-auto mb-8 leading-relaxed">
            Daftarkan diri dan rasakan pengalaman belajar Al-Qur'an interaktif yang didukung
            oleh kecerdasan buatan. Gratis sepenuhnya, langsung dari browser Anda.
          </p>
          <div class="ts-cta-panel__actions flex gap-3 justify-center flex-wrap">
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
    </main>

    <!-- ───────── footer · Ft5 Statement ───────── -->
    <footer class="ts-footer pt-16 pb-12 border-t border-white/5">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <p class="ts-footer__statement font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight max-w-[22ch] mb-12 text-ink-0">
          Tarteel Space adalah alat belajar bagi mereka yang ingin <em class="ts-italic font-serif italic text-primary-400 font-normal">membaca</em> dengan benar.
        </p>
        <div class="ts-footer__row grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 pt-8">
          <div class="ts-footer__col">
            <p class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Fitur</p>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('cara-kerja')">Cara Kerja</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('fitur')">Fitur Utama</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/dashboard/practice')">Mulai Latihan</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <p class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Akun</p>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/login')">Masuk</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/register')">Daftar</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <p class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Proyek</p>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('tentang')">Tentang</button></li>
              <li><a href="https://github.com/RizalHaryaputra/tarteel-space-frontend" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository Tarteel Space Frontend" class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150">GitHub Frontend</a></li>
              <li><a href="https://github.com/RizalHaryaputra/tarteel-space-api" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository Tarteel Space Backend" class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150">GitHub Backend</a></li>
            </ul>
          </div>
        </div>
        <div class="ts-footer__legal mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 font-mono text-xs text-ink-2 border-t border-white/5 pt-4">
          <span class="font-display font-semibold tracking-tight text-base text-ink-0">Tarteel Space</span>
          <span>© 2026 Tarteel Space · Diteliti & Dikembangkan oleh <a href="https://rizalharyaputra.my.id" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-2">Rizal Haryaputra</a> (UNY)</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const isDropdownOpen = ref(false)
const isScrolled = ref(false)
const dropdownRef = ref(null)

const statAccuracy = ref(0)
const statClasses = ref(0)

let ctx = null

useHead({
  title: 'Tarteel Space — Sempurnakan Pelafalan Al-Qur\'an dengan AI',
  link: [
    { rel: 'canonical', href: 'https://tarteelspace.web.id/' },
  ]
})

useSeoMeta({
  title: 'Tarteel Space — Sempurnakan Pelafalan Al-Qur\'an dengan AI',
  description: 'Tarteel Space mengevaluasi akurasi pelafalan huruf hijaiyah Anda secara langsung menggunakan teknologi Deep Learning — tanpa batasan waktu atau tempat.',
  ogTitle: 'Tarteel Space — Sempurnakan Pelafalan Al-Qur\'an dengan AI',
  ogDescription: 'Evaluasi akurasi pelafalan huruf hijaiyah secara langsung dari browser dengan teknologi AI & Deep Learning.',
  ogImage: 'https://tarteelspace.web.id/logo.png',
  ogUrl: 'https://tarteelspace.web.id/',
  ogType: 'website',
  ogSiteName: 'Tarteel Space',
  ogLocale: 'id_ID',
  twitterCard: 'summary',
  twitterTitle: 'Tarteel Space — Sempurnakan Pelafalan Al-Qur\'an dengan AI',
  twitterDescription: 'Evaluasi akurasi pelafalan huruf hijaiyah dan kaidah tajwid secara langsung berbasis Deep Learning.',
  twitterImage: 'https://tarteelspace.web.id/logo.png',
})

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

let isScrolling = false
const handleScroll = () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 60
      isScrolling = false
    })
    isScrolling = true
  }
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
      background: '#13171f',
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
    // 1. Hero Entrance Animation (Dioptimasi agar LCP mobile instan & tidak tertunda)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    heroTl
      .from('.ts-nav', {
        y: -20,
        opacity: 0,
        duration: 0.6,
        clearProps: 'all',
      })
      .from('.ts-hero__live', {
        y: 15,
        opacity: 0,
        duration: 0.5,
      }, '-=0.3')
      // Catatan: Tidak menyetel opacity: 0 pada .ts-hero__h1 agar Largest Contentful Paint (LCP)
      // langsung terhitung instan (~1.0s) pada SSR paint pertama tanpa menunggu animasi selesai.
      .from('.ts-hero__h1', {
        y: 20,
        duration: 0.6,
        clearProps: 'transform',
      }, '-=0.3')
      .from('.ts-hero__sub', {
        y: 15,
        duration: 0.5,
        clearProps: 'transform',
      }, '-=0.3')
      .from('.ts-hero__ctas .ts-btn', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
      }, '-=0.3')
      .from('.ts-hero__fineprint span', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.06,
      }, '-=0.3')
      .from('.ts-eval-card', {
        y: 25,
        duration: 0.7,
        clearProps: 'all',
      }, '-=0.5')
      .from('.ts-marquee', {
        opacity: 0,
        duration: 0.6,
      }, '-=0.3')

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
          acc: 85,
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
/* ── N5 Floating Nav Pill (Ultra-Frosted Glassmorphism) ── */
.ts-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  width: max-content;
  max-width: calc(100vw - 24px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 14px;
  border-radius: 9999px;
  background: var(--ts-nav-bg);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid var(--ts-nav-border);
  box-shadow: var(--ts-nav-shadow);
  transition: background 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.ts-nav--scrolled {
  background: var(--ts-nav-bg-scrolled);
  border-color: var(--ts-nav-border-scrolled);
  box-shadow: var(--ts-nav-shadow-scrolled);
}

.ts-nav__link {
  padding: 8px 12px;
  border-radius: 9999px;
  color: rgb(var(--ts-ink-1));
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 150ms ease, color 150ms ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.ts-nav__link:hover {
  background: rgb(var(--ts-border-rgb) / 0.08);
  color: rgb(var(--ts-ink-0));
}

.ts-nav__cta {
  padding: 8px 16px;
  border-radius: 9999px;
  background: #2563eb;
  color: var(--ts-btn-primary-text);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid #2563eb;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px -6px rgba(37, 99, 235, 0.5);
  transition: transform 250ms ease, background 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
}

.ts-nav__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.22) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.ts-nav__cta:hover::before { transform: translateX(100%); }
.ts-nav__cta:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -6px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(96, 165, 250, 0.4);
}
.ts-nav__cta:active { transform: translateY(0); }

@media (max-width: 640px) {
  .ts-nav {
    top: 12px;
    gap: 4px;
    padding: 4px 5px 4px 10px;
  }
  .ts-nav__link {
    padding: 5px 6px;
    font-size: 0.75rem;
  }
  .ts-nav__cta {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
}

/* User dropdown button (Avatar-only) */
.ts-nav__user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 9999px;
  background: rgb(var(--ts-dark-850));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.12);
  cursor: pointer;
  color: rgb(var(--ts-ink-0));
  transition: all 150ms ease;
}

.ts-nav__user-btn:hover {
  background: rgb(var(--ts-dark-800));
  border-color: rgba(37, 99, 235, 0.4);
  transform: scale(1.05);
}

.ts-nav__user-btn:active {
  transform: scale(0.95);
}

.ts-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 40px -16px rgba(0, 10, 60, 0.35);
  overflow: hidden;
  z-index: 60;
  padding: 4px;
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
  color: rgb(var(--ts-ink-1));
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.ts-dropdown__item:hover { background: rgb(var(--ts-dark-850)); color: rgb(var(--ts-ink-0)); }
.ts-dropdown__item--danger { color: #e11d48; }
:root:not(.light) .ts-dropdown__item--danger { color: #f87171; }
.ts-dropdown__item--danger:hover { background: rgba(239, 68, 68, 0.12); }

@media (max-width: 760px) {
  .ts-nav__links { display: none; }
}

/* ── Buttons ── */
.ts-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 1rem;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  transition: transform 250ms ease, background 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
}

.ts-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.18) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.ts-btn:hover::before { transform: translateX(100%); }

.ts-btn--primary {
  background: #2563eb;
  color: var(--ts-btn-primary-text);
  border-color: #2563eb;
  box-shadow: 0 8px 24px -10px rgba(37, 99, 235, 0.5);
}

.ts-btn--primary:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -10px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(96, 165, 250, 0.4);
}

.ts-btn--ghost {
  background: transparent;
  color: rgb(var(--ts-ink-0));
  border-color: rgb(var(--ts-dark-800));
}

.ts-btn--ghost:hover {
  background: rgb(var(--ts-dark-850));
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.2);
}

/* ── Hero Hairline Grid & Radials ── */
.ts-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgb(var(--ts-ink-0) / 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(var(--ts-ink-0) / 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 72%);
  pointer-events: none;
}

.ts-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 500px at 25% 10%, rgba(37, 99, 235, 0.22), transparent 65%),
    radial-gradient(700px 450px at 80% 20%, rgba(56, 189, 248, 0.18), transparent 60%);
  pointer-events: none;
}

:global(html.light) .ts-hero::after {
  background:
    radial-gradient(900px 500px at 25% 10%, rgba(37, 99, 235, 0.10), transparent 65%),
    radial-gradient(700px 450px at 80% 20%, rgba(56, 189, 248, 0.12), transparent 60%);
}

.ts-hero__fineprint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.85rem;
}

.ts-hero__fineprint span {
  display: inline-flex;
  align-items: center;
}

.ts-hero__fineprint span:not(:last-child)::after {
  content: "·";
  margin-left: 0.85rem;
  color: rgb(var(--ts-ink-3));
  font-weight: bold;
}

/* ── Eval Card ── */
.ts-eval-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.1);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 1px 0 rgb(var(--ts-border-rgb) / 0.05) inset, 0 24px 60px -28px rgba(0, 10, 80, 0.35), 0 4px 12px -4px rgba(0, 10, 80, 0.18);
  font-family: 'Geist Mono', monospace;
  font-size: 0.875rem;
  position: relative;
  box-sizing: border-box;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 1024px) {
  .ts-eval-card {
    margin-left: auto;
    margin-right: 0;
    padding: 1.5rem;
  }
  .ts-eval-card:hover {
    transform: translateY(-6px);
  }
}

.ts-eval-card:hover {
  box-shadow: 0 1px 0 rgb(var(--ts-border-rgb) / 0.08) inset, 0 32px 80px -24px rgba(37, 99, 235, 0.28), 0 0 0 1px rgba(37, 99, 235, 0.3), 0 0 40px -10px rgba(37, 99, 235, 0.15);
}

.ts-eval-card::before {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px dashed rgb(var(--ts-ink-0) / 0.08);
  border-radius: 26px;
  pointer-events: none;
}

/* ── Steps (Clean Editorial Layout) ── */
.ts-step {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  align-items: center;
  padding: 2.5rem 0;
  border-bottom: 1px solid rgb(var(--ts-border-rgb) / 0.06);
  position: relative;
}

.ts-step:last-child { border-bottom: none; }

@media (max-width: 880px) {
  .ts-step {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 0;
  }
}

.ts-step__art {
  height: 160px;
  border-radius: 20px;
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex: none;
  transition: border-color 300ms ease, box-shadow 300ms ease;
}

@media (hover: hover) {
  .ts-step:hover .ts-step__art {
    border-color: rgba(37, 99, 235, 0.35);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2), 0 12px 32px -12px rgba(37, 99, 235, 0.2);
  }
}

/* ── Stats Cards ── */
.ts-stats__card {
  padding: 3rem 2rem;
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.1);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-stats__card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2563eb, transparent);
  opacity: 0;
  transform: scaleX(0.4);
  transition: opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-stats__card:hover {
  transform: translateY(-6px);
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.28), 0 24px 60px -20px rgba(37, 99, 235, 0.25);
}

.ts-stats__card:hover::after { opacity: 1; transform: scaleX(1); }
.ts-stats__card:hover .ts-stats__num { text-shadow: 0 0 24px rgba(37, 99, 235, 0.25); }

.ts-stats__card--1 { background: linear-gradient(160deg, rgb(var(--ts-primary-950) / 0.8), rgb(var(--ts-dark-900)) 55%); }
.ts-stats__card--2 { background: linear-gradient(160deg, rgba(56, 189, 248, 0.15), rgb(var(--ts-dark-900)) 55%); }
.ts-stats__card--3 { background: linear-gradient(160deg, rgb(var(--ts-dark-850) / 0.8), rgb(var(--ts-dark-900)) 55%); }

.ts-stats__num {
  font-family: 'Geist', sans-serif;
  font-size: clamp(2.6rem, 6vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  color: rgb(var(--ts-ink-0));
  transition: text-shadow 350ms ease-out;
}

/* ── Features ── */
.ts-feature {
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.1);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-feature::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 90% 90% at 50% -15%, rgba(37, 99, 235, 0.16), transparent 75%);
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.ts-feature:hover {
  transform: translateY(-7px);
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.25), 0 28px 70px -22px rgba(37, 99, 235, 0.25);
}

.ts-feature:hover::before { opacity: 1; transform: scale(1.1); }
.ts-feature:hover .ts-feature__art { transform: scale(1.03); box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.15); }

.ts-feature__art {
  height: 160px;
  border-radius: 12px;
  background: rgb(var(--ts-dark-850));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.08);
  position: relative;
  overflow: hidden;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-wave-area { fill: url(#wave-grad); }
.ts-wave-line { fill: none; stroke: #2563eb; stroke-width: 2; stroke-linecap: round; }
.ts-wave-dot { fill: rgb(var(--ts-dark-900)); stroke: #2563eb; stroke-width: 2; }

.ts-feature-art__label {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  padding: 3px 8px;
  border-radius: 9999px;
}

:global(html.light) .ts-feature-art__label {
  color: #059669;
  background: rgba(16, 185, 129, 0.16);
}

.ts-harakat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgb(var(--ts-border-rgb) / 0.08);
  background: rgb(var(--ts-dark-900));
  transition: all 250ms ease;
}

.ts-harakat-cell--active {
  border-color: rgba(37, 99, 235, 0.35);
  background: rgb(var(--ts-primary-950));
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
  font-family: 'Geist Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--ts-ink-3));
}

.ts-progress-bar i {
  display: block;
  width: 100%;
  height: var(--pct, 50%);
  background: rgba(37, 99, 235, 0.35);
  border-radius: 3px 3px 0 0;
}

.ts-progress-bar--today i {
  background: #2563eb;
  box-shadow: 0 0 12px -4px rgba(37, 99, 235, 0.6);
}

.ts-feature__link {
  margin-top: auto;
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--ts-primary-400));
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: gap 300ms ease, color 300ms ease;
}

.ts-feature:hover .ts-feature__link { gap: 8px; text-decoration: underline; }

/* ── Rich CNN Pipeline & Spectrogram Console ── */
.ts-spec-console {
  background: rgb(var(--ts-dark-900));
  border: 1px solid rgb(var(--ts-border-rgb) / 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 0 rgb(var(--ts-border-rgb) / 0.06) inset, 0 24px 60px -28px rgba(0, 10, 80, 0.35);
  position: relative;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-spec-console:hover {
  transform: translateY(-5px);
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 1px 0 rgb(var(--ts-border-rgb) / 0.08) inset, 0 32px 80px -24px rgba(37, 99, 235, 0.28), 0 0 0 1px rgba(37, 99, 235, 0.22);
}

/* ── CTA Panel ── */
.ts-cta-panel {
  position: relative;
  box-shadow: 0 1px 0 rgb(var(--ts-border-rgb) / 0.06) inset, 0 30px 80px -30px rgba(37, 99, 235, 0.22);
}

.ts-cta-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 250px at 15% 105%, rgba(37, 99, 235, 0.22), transparent 70%),
    radial-gradient(500px 220px at 85% -5%, rgba(56, 189, 248, 0.18), transparent 70%);
  z-index: -1;
}

.ts-cta-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgb(var(--ts-ink-0) / 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(var(--ts-ink-0) / 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  z-index: -1;
}
</style>