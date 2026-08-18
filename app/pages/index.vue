<template>
  <div class="ts-root bg-dark-950 text-ink-0 font-sans selection:bg-primary-500 selection:text-dark-950 min-h-screen overflow-x-clip antialiased">

    <!-- ───────── nav · N5 Floating pill ───────── -->
    <nav class="ts-nav" aria-label="Primary" :class="{ 'ts-nav--scrolled': isScrolled }">
      <button class="ts-nav__brand flex items-center gap-2 mr-2 bg-none border-none cursor-pointer p-0 text-ink-0 font-display font-semibold text-sm tracking-tight" @click="scrollTo('beranda')" aria-label="Tarteel Space home">
        <img src="/logo.png" alt="" class="w-[22px] h-[22px] rounded-[5px] object-contain" aria-hidden="true" />
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
            >
              <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-[26px] h-[26px] rounded-full object-cover shrink-0" alt="Avatar" />
              <span v-else class="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-semibold bg-primary-950 text-primary-400 shrink-0">{{ authStore.initials || '?' }}</span>
              <span class="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{{ authStore.userName || 'Pengguna' }}</span>
            </button>
            <div v-if="isDropdownOpen" class="ts-dropdown" role="menu">
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
          <div class="w-[90px] h-[34px] bg-dark-850 rounded-full animate-pulse"></div>
        </template>
      </ClientOnly>
    </nav>

    <!-- ───────── hero · Marquee Hero + split diptych ───────── -->
    <section class="ts-hero pt-24 sm:pt-[130px] pb-12 sm:pb-20 relative overflow-clip" id="beranda">
      <div class="ts-container max-w-[1240px] mx-auto px-4 sm:px-6 w-full">

        <!-- live badge -->
        <div class="ts-hero__live inline-flex items-center gap-2 py-1 sm:py-1.5 px-3 sm:px-3.5 border border-white/10 bg-dark-900 rounded-full font-mono text-[11px] sm:text-xs text-ink-1 relative z-10 max-w-full" role="status" aria-live="polite">
          <span class="ts-live-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
          <span class="truncate sm:overflow-visible">DITENAGAI DEEP LEARNING · <strong class="font-semibold text-ink-0">CNN</strong> · REAL-TIME</span>
        </div>

        <!-- split layout: headline left, art right -->
        <div class="ts-hero__layout grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-8 sm:gap-12 lg:gap-20 items-center mt-6 sm:mt-8 relative z-10">
          <div class="ts-hero__copy">
            <h1 class="ts-hero__h1 font-display font-semibold text-[clamp(2.1rem,7vw,4.5rem)] leading-[1.02] tracking-tight my-3 sm:my-4 text-ink-0">
              Sempurnakan Pelafalan<br>
              Hijaiyah<em class="ts-italic font-serif italic text-primary-400 font-normal ml-1.5 sm:ml-2">dengan benar.</em>
            </h1>
            <p class="ts-hero__sub text-sm sm:text-base md:text-lg text-ink-1 max-w-[50ch] mb-6 sm:mb-8 leading-relaxed">
              Tarteel Space mengevaluasi akurasi pelafalan huruf hijaiyah Anda secara real-time
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
            <span class="inline-flex items-center gap-3">EVALUASI · REAL-TIME</span>
            <span class="inline-flex items-center gap-3">PELAJARI · TAJWID · HIJAIYAH</span>
            <span class="inline-flex items-center gap-3">BERBASIS · CNN · AI</span>
            <span class="inline-flex items-center gap-3">AKURASI · INSTAN</span>
            <span class="inline-flex items-center gap-3">REKAM · SUARA · ANDA</span>
            <span class="inline-flex items-center gap-3">EVALUASI · REAL-TIME</span>
            <span class="inline-flex items-center gap-3">PELAJARI · TAJWID · HIJAIYAH</span>
            <span class="inline-flex items-center gap-3">BERBASIS · CNN · AI</span>
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
              Rekam, proses, terima — <em class="ts-italic font-serif italic text-primary-400 font-normal">langsung</em>.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Tiga langkah sederhana untuk mulai mengevaluasi akurasi pelafalan hijaiyah Anda.
            Tidak perlu pengaturan rumit — cukup browser dan mikrofon.
          </p>
        </div>

        <div class="ts-steps flex flex-col">
          <div class="ts-step">
            <div class="ts-step__art ts-step-art--mic" aria-hidden="true">
              <div class="w-12 h-12 text-primary-400 relative z-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              </div>
              <div class="ts-step__art-bars absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1" aria-hidden="true">
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 8px; animation-delay: 0ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 14px; animation-delay: 80ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 20px; animation-delay: 160ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 28px; animation-delay: 240ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 20px; animation-delay: 320ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 14px; animation-delay: 400ms;"></i>
                <i class="w-1 rounded-sm bg-primary-500 opacity-60 animate-bar" style="height: 8px; animation-delay: 480ms;"></i>
              </div>
            </div>
            <div class="ts-step__body flex flex-col gap-1.5">
              <div class="ts-step__num font-mono text-xs tracking-wider text-primary-400 opacity-70">1.0</div>
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Izinkan Mikrofon</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Berikan akses mikrofon pada peramban Anda. Tidak ada data suara yang disimpan di server — semua diproses lokal lalu dikirim sebagai fitur audio.</p>
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
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Lafalkan Huruf</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Pilih huruf hijaiyah yang ingin dilatih, lalu lafalkan dengan jelas sesuai kaidah makhraj dan tajwid. Sistem akan merekam dan menganalisis audio Anda.</p>
            </div>
          </div>

          <div class="ts-step">
            <div class="ts-step__art ts-step-art--result flex flex-col gap-2" aria-hidden="true">
              <div class="font-display text-5xl font-semibold tracking-tight text-primary-400 leading-none">88<small class="text-2xl font-normal">%</small></div>
              <div class="font-mono text-xs tracking-wider uppercase text-emerald-400 bg-emerald-500/15 py-1 px-3 rounded-full">Sangat Baik</div>
            </div>
            <div class="ts-step__body flex flex-col gap-1.5">
              <div class="ts-step__num font-mono text-xs tracking-wider text-primary-400 opacity-70">3.0</div>
              <h3 class="ts-step__title font-display text-2xl font-semibold tracking-tight text-ink-0">Terima Evaluasi</h3>
              <p class="ts-step__desc text-base text-ink-1 max-w-[55ch] leading-relaxed">Model CNN memproses spektrogram audio dan memberikan persentase akurasi secara instan beserta umpan balik untuk perbaikan pelafalan Anda.</p>
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
              Angka yang <em class="ts-italic font-serif italic text-primary-400 font-normal">tidak</em> perlu catatan kaki.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Dibangun dari penelitian Skripsi Teknologi Informasi dengan arsitektur CNN yang dilatih
            khusus untuk mengenali pola pelafalan huruf hijaiyah beserta harakatnya.
          </p>
        </div>

        <div class="ts-stats grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="ts-stats__card ts-stats__card--1">
            <div class="ts-stats__num">{{ Math.round(statAccuracy) }}<small class="text-[0.45em] font-medium text-ink-1 ml-1">%</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">akurasi model CNN</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">Diuji pada dataset pelafalan hijaiyah dengan validasi silang.</div>
          </div>
          <div class="ts-stats__card ts-stats__card--2">
            <div class="ts-stats__num">{{ Math.round(statClasses) }}<small class="text-[0.45em] font-medium text-ink-1 ml-1">kelas</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">kelas klasifikasi</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">28 huruf hijaiyah × 3 harakat (fathah, kasrah, dhommah).</div>
          </div>
          <div class="ts-stats__card ts-stats__card--3">
            <div class="ts-stats__num">&lt;1<small class="text-[0.45em] font-medium text-ink-1 ml-1">dtk</small></div>
            <div class="ts-stats__label font-mono uppercase tracking-wider text-xs text-ink-2 mt-4">waktu evaluasi</div>
            <div class="ts-stats__note text-sm text-ink-1 max-w-[28ch] leading-relaxed mt-2">Dari rekaman suara hingga skor akurasi langsung dari browser.</div>
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
              Meter, pelajari, pantau — <em class="ts-italic font-serif italic text-primary-400 font-normal">lalu</em> ulangi.
            </h2>
          </div>
          <p class="ts-section-head__desc text-base md:text-lg text-ink-1 max-w-[50ch] leading-relaxed">
            Tiga fitur inti yang membuat Tarteel Space berbeda dari cara belajar hijaiyah konvensional.
          </p>
        </div>

        <div class="ts-features grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <article class="ts-feature">
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
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Evaluasi Audio Real-time</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Algoritma Deep Learning memproses input suara dan memberikan persentase akurasi pelafalan secara instan berdasarkan kaidah tajwid yang benar.</p>
            <span class="ts-feature__link">Mulai latihan →</span>
          </article>

          <article class="ts-feature">
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
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Mendukung Harakat Lengkap</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Klasifikasi mencakup fathah, kasrah, dan dhommah untuk setiap huruf hijaiyah — total 84 kelas yang dikenali oleh model CNN kami.</p>
            <span class="ts-feature__link">Lihat daftar huruf →</span>
          </article>

          <article class="ts-feature">
            <div class="ts-feature__art ts-feature-art--progress flex items-end p-4" aria-hidden="true">
              <div class="ts-progress-bars flex items-end gap-1.5 w-full h-[100px]">
                <div class="ts-progress-bar" style="--pct: 45%"><span>Sen</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 62%"><span>Sel</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 58%"><span>Rab</span><i></i></div>
                <div class="ts-progress-bar" style="--pct: 80%"><span>Kam</span><i></i></div>
                <div class="ts-progress-bar ts-progress-bar--today" style="--pct: 88%"><span>Jum</span><i></i></div>
              </div>
            </div>
            <h3 class="ts-feature__title font-display text-xl font-semibold tracking-tight text-ink-0">Laporan Kemajuan Harian</h3>
            <p class="ts-feature__desc text-sm text-ink-1 leading-relaxed">Pantau perkembangan akurasi pelafalan Anda dari hari ke hari. Dasbor menampilkan grafik skor 7 hari terakhir dan huruf yang perlu perbaikan.</p>
            <span class="ts-feature__link">Lihat dasbor →</span>
          </article>
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
              Menyatukan tradisi dan <em class="ts-italic font-serif italic text-primary-400 font-normal">teknologi modern</em>.
            </h2>
            <p class="ts-about__text text-base md:text-lg text-ink-1 max-w-[55ch] leading-relaxed">
              Tarteel Space berawal dari penelitian Skripsi Teknologi Informasi. Misi utamanya adalah
              mengembangkan alat bantu mandiri untuk pembelajaran pelafalan Al-Qur'an yang dapat
              diakses oleh siapa saja, kapan saja, dan di mana saja.
            </p>
            <p class="ts-about__text text-base md:text-lg text-ink-1 max-w-[55ch] leading-relaxed">
              Dengan arsitektur Convolutional Neural Network (CNN), sistem kami memproses spektrogram
              audio untuk mengenali pola pelafalan yang benar sesuai kaidah tajwid.
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
                  <span class="font-mono text-[10px] tracking-wider uppercase text-primary-400 block">CNN · ARSITEKTUR</span>
                  <div class="font-display text-base font-semibold text-ink-0 tracking-tight mt-0.5">Spektrogram Audio 2D</div>
                </div>
                <div class="ts-spec-console__status font-mono text-[10px] text-ink-2 flex items-center gap-1.5 bg-dark-850 px-2.5 py-1 rounded-full border border-white/5">
                  <span class="ts-live-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
                  <span>16 kHz · STFT Mel</span>
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
                  <span>2. Mel-Spec</span>
                </div>
                <span class="text-ink-3 text-[10px]">→</span>
                <div class="flex items-center gap-1.5">
                  <span>☵</span>
                  <span>3. Conv2D</span>
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

    <!-- ───────── footer · Ft5 Statement ───────── -->
    <footer class="ts-footer pt-16 pb-12 border-t border-white/5">
      <div class="ts-container max-w-[1240px] mx-auto px-6 w-full">
        <p class="ts-footer__statement font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight max-w-[22ch] mb-12 text-ink-0">
          Tarteel Space adalah alat belajar bagi mereka yang ingin <em class="ts-italic font-serif italic text-primary-400 font-normal">membaca</em> dengan benar.
        </p>
        <div class="ts-footer__row grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 pt-8">
          <div class="ts-footer__col">
            <h5 class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Fitur</h5>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('cara-kerja')">Cara Kerja</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('fitur')">Fitur Utama</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/dashboard/practice')">Mulai Latihan</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <h5 class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Akun</h5>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/login')">Masuk</button></li>
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="navigateTo('/register')">Daftar</button></li>
            </ul>
          </div>
          <div class="ts-footer__col">
            <h5 class="font-mono text-xs font-semibold uppercase tracking-wider text-ink-2 mb-3">Proyek</h5>
            <ul class="flex flex-col gap-2 list-none p-0 m-0">
              <li><button class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150" @click="scrollTo('tentang')">Tentang</button></li>
              <li><a href="https://github.com/RizalHaryaputra/tarteel-space-frontend" target="_blank" rel="noopener" class="text-sm text-ink-1 hover:text-ink-0 transition-colors duration-150">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div class="ts-footer__legal mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 font-mono text-xs text-ink-2 border-t border-white/5 pt-4">
          <span class="font-display font-semibold tracking-tight text-base text-ink-0">Tarteel Space</span>
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
    // 1. Hero Entrance Animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    heroTl
      .from('.ts-nav', {
        y: -30,
        opacity: 0,
        duration: 0.8,
        clearProps: 'y,opacity',
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
        y: 30,
        opacity: 0,
        duration: 0.9,
        clearProps: 'all',
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
/* ── N5 Floating Nav Pill (Ultra-Frosted Glassmorphism) ── */
.ts-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 14px;
  border-radius: 9999px;
  background: rgba(13, 16, 23, 0.6);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset, 0 16px 36px -8px rgba(0, 5, 20, 0.6), 0 0 20px -4px rgba(37, 99, 235, 0.15);
  transition: background 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

@media (max-width: 640px) {
  .ts-nav {
    top: 14px;
  }
}

.ts-nav--scrolled {
  background: rgba(13, 16, 23, 0.78);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.16) inset, 0 20px 48px -10px rgba(0, 0, 0, 0.8), 0 0 24px -4px rgba(37, 99, 235, 0.22);
}

.ts-nav__link {
  padding: 8px 12px;
  border-radius: 9999px;
  color: #a8b3cf;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 150ms ease, color 150ms ease;
  white-space: nowrap;
}

.ts-nav__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f4f6fb;
}

.ts-nav__cta {
  padding: 8px 16px;
  border-radius: 9999px;
  background: #2563eb;
  color: #0b0d11;
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid #2563eb;
  cursor: pointer;
  white-space: nowrap;
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
  background: #60a5fa;
  border-color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -6px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(96, 165, 250, 0.4);
}
.ts-nav__cta:active { transform: translateY(0); }

/* User dropdown button */
.ts-nav__user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  border-radius: 9999px;
  background: #1a202c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  color: #f4f6fb;
  font-size: 0.875rem;
  transition: background 150ms ease;
}

.ts-nav__user-btn:hover { background: #242c3d; }

.ts-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 16px 40px -16px rgba(0, 10, 60, 0.6);
  overflow: hidden;
  z-index: 60;
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
  color: #a8b3cf;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.ts-dropdown__item:hover { background: #1a202c; color: #f4f6fb; }
.ts-dropdown__item--danger { color: #f87171; }
.ts-dropdown__item--danger:hover { background: rgba(239, 68, 68, 0.15); }

@media (max-width: 760px) {
  .ts-nav__links { display: none; }
  .ts-nav { padding: 6px 8px 6px 12px; }
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
  color: #0b0d11;
  border-color: #2563eb;
  box-shadow: 0 8px 24px -10px rgba(37, 99, 235, 0.5);
}

.ts-btn--primary:hover {
  background: #60a5fa;
  border-color: #60a5fa;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -10px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(96, 165, 250, 0.4);
}

.ts-btn--ghost {
  background: transparent;
  color: #f4f6fb;
  border-color: #242c3d;
}

.ts-btn--ghost:hover {
  background: #1a202c;
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -10px rgba(0, 10, 60, 0.4);
}

/* ── Hero Hairline Grid & Radials ── */
.ts-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(244, 246, 251, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(244, 246, 251, 0.04) 1px, transparent 1px);
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
  color: #414d6b;
  font-weight: bold;
}

/* ── Eval Card ── */
.ts-eval-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 24px 60px -28px rgba(0, 10, 80, 0.7), 0 4px 12px -4px rgba(0, 10, 80, 0.3);
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
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 32px 80px -24px rgba(0, 10, 80, 0.85), 0 0 0 1px rgba(37, 99, 235, 0.3), 0 0 40px -10px rgba(37, 99, 235, 0.2);
}

.ts-eval-card::before {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px dashed rgba(244, 246, 251, 0.07);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2), 0 12px 32px -12px rgba(0, 10, 80, 0.5);
  }
}

/* ── Stats Cards ── */
.ts-stats__card {
  padding: 3rem 2rem;
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.28), 0 24px 60px -20px rgba(37, 99, 235, 0.45);
}

.ts-stats__card:hover::after { opacity: 1; transform: scaleX(1); }
.ts-stats__card:hover .ts-stats__num { text-shadow: 0 0 24px rgba(96, 165, 250, 0.4); }

.ts-stats__card--1 { background: linear-gradient(160deg, rgba(12, 26, 48, 0.8), #13171f 55%); }
.ts-stats__card--2 { background: linear-gradient(160deg, rgba(56, 189, 248, 0.15), #13171f 55%); }
.ts-stats__card--3 { background: linear-gradient(160deg, rgba(26, 32, 44, 0.8), #13171f 55%); }

.ts-stats__num {
  font-family: 'Geist', sans-serif;
  font-size: clamp(2.6rem, 6vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  color: #f4f6fb;
  transition: text-shadow 350ms ease-out;
}

/* ── Features ── */
.ts-feature {
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-feature::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 90% 90% at 50% -15%, rgba(37, 99, 235, 0.22), transparent 75%);
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.ts-feature:hover {
  transform: translateY(-7px);
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3), 0 28px 70px -22px rgba(37, 99, 235, 0.45);
}

.ts-feature:hover::before { opacity: 1; transform: scale(1.1); }
.ts-feature:hover .ts-feature__art { transform: scale(1.03); box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.4); }

.ts-feature__art {
  height: 160px;
  border-radius: 12px;
  background: #1a202c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-wave-area { fill: url(#wave-grad); }
.ts-wave-line { fill: none; stroke: #2563eb; stroke-width: 2; stroke-linecap: round; }
.ts-wave-dot { fill: #13171f; stroke: #2563eb; stroke-width: 2; }

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

.ts-harakat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #13171f;
  transition: all 250ms ease;
}

.ts-harakat-cell--active {
  border-color: rgba(37, 99, 235, 0.35);
  background: #0c1a30;
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
  color: #414d6b;
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
  color: #60a5fa;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: gap 300ms ease, color 300ms ease;
}

.ts-feature:hover .ts-feature__link { gap: 8px; text-decoration: underline; }

/* ── Rich CNN Pipeline & Spectrogram Console ── */
.ts-spec-console {
  background: #13171f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 24px 60px -28px rgba(0, 10, 80, 0.7);
  position: relative;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ts-spec-console:hover {
  transform: translateY(-5px);
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 32px 80px -24px rgba(0, 10, 80, 0.85), 0 0 0 1px rgba(37, 99, 235, 0.22);
}

/* ── CTA Panel ── */
.ts-cta-panel {
  position: relative;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 30px 80px -30px rgba(0, 10, 60, 0.8);
}

.ts-cta-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 250px at 15% 105%, rgba(37, 99, 235, 0.3), transparent 70%),
    radial-gradient(500px 220px at 85% -5%, rgba(56, 189, 248, 0.25), transparent 70%);
  z-index: -1;
}

.ts-cta-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(244, 246, 251, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(244, 246, 251, 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 90%);
  z-index: -1;
}
</style>