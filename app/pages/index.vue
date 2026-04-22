<template>
    <div class="min-h-screen bg-dark-950 text-white font-sans selection:bg-primary-500/30 selection:text-primary-400 relative overflow-hidden">
        <!-- Background Ambient Glow -->
        <div class="absolute inset-0 bg-hero-glow pointer-events-none z-0"></div>

        <nav class="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center gap-3 relative z-10 cursor-pointer" @click="scrollTo('beranda')">
                    <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <span class="text-dark-950 font-bold text-xl">T</span>
                    </div>
                    <span class="font-bold text-xl tracking-tight text-white hidden sm:block">Tarteel <span class="text-primary-400">Space</span></span>
                </div>

                <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400 relative z-10">
                    <button @click="scrollTo('cara-kerja')" class="hover:text-primary-400 transition-colors">Cara Kerja</button>
                    <button @click="scrollTo('fitur')" class="hover:text-primary-400 transition-colors">Fitur</button>
                    <button @click="scrollTo('tentang')" class="hover:text-primary-400 transition-colors">Tentang</button>
                </div>

                <div class="flex items-center gap-4 relative z-10">
                    <button class="text-sm font-semibold px-4 py-2 text-slate-300 hover:text-primary-400 transition-colors hidden sm:block">
                        Masuk
                    </button>
                    <button class="text-sm font-semibold bg-primary-500 text-dark-950 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                        Daftar
                    </button>
                </div>
            </div>
        </nav>

        <section id="beranda" class="pt-32 pb-20 px-6 relative z-10">
            <div class="max-w-7xl mx-auto text-center mt-12 md:mt-20">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold mb-8 border border-primary-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    POWERED BY DEEP LEARNING (CNN)
                </div>
                <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
                    Sempurnakan Pelafalan <br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
                        Hijaiyah Anda Secara Akurat
                    </span>
                </h1>
                <p class="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
                    Tarteel Space menggunakan kecerdasan buatan untuk mengevaluasi akurasi pelafalan Al-Qur'an Anda
                    secara real-time, memberikan koreksi instan tanpa batas ruang dan waktu.
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button class="w-full sm:w-auto px-8 py-4 bg-primary-500 text-dark-950 rounded-2xl font-bold text-lg hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2">
                        Mulai Latihan Sekarang
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button class="w-full sm:w-auto px-8 py-4 bg-dark-900 border border-dark-800 text-slate-300 rounded-2xl font-bold text-lg hover:bg-dark-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 group">
                        <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        Lihat Demo Video
                    </button>
                </div>
            </div>
        </section>

        <!-- CARA KERJA -->
        <section id="cara-kerja" class="py-24 px-6 relative z-10">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-20">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">Bagaimana Cara Kerjanya?</h2>
                    <p class="text-slate-400 text-lg max-w-2xl mx-auto">Tiga langkah mudah untuk mulai mengevaluasi dan menyempurnakan pelafalan hijaiyah Anda.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <!-- Connecting Line -->
                    <div class="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-dark-800 z-0">
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
                    </div>

                    <!-- Step 1 -->
                    <div class="relative z-10 flex flex-col items-center text-center group">
                        <div class="w-24 h-24 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mb-8 group-hover:border-primary-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all relative">
                            <div class="absolute inset-2 rounded-full bg-dark-950 border border-dark-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🎙️
                            </div>
                            <div class="absolute -bottom-3 w-8 h-8 rounded-full bg-primary-500 text-dark-950 font-bold flex items-center justify-center border-4 border-dark-950">1</div>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Izinkan Mikrofon</h3>
                        <p class="text-slate-400 leading-relaxed">Berikan akses mikrofon pada peramban Anda untuk mulai merekam suara.</p>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative z-10 flex flex-col items-center text-center group">
                        <div class="w-24 h-24 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mb-8 group-hover:border-primary-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all relative">
                            <div class="absolute inset-2 rounded-full bg-dark-950 border border-dark-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🗣️
                            </div>
                            <div class="absolute -bottom-3 w-8 h-8 rounded-full bg-primary-500 text-dark-950 font-bold flex items-center justify-center border-4 border-dark-950">2</div>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Mulai Melafalkan</h3>
                        <p class="text-slate-400 leading-relaxed">Pilih huruf hijaiyah dan lafalkan dengan jelas sesuai dengan tajwid.</p>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative z-10 flex flex-col items-center text-center group">
                        <div class="w-24 h-24 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mb-8 group-hover:border-primary-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all relative">
                            <div class="absolute inset-2 rounded-full bg-dark-950 border border-dark-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                ✨
                            </div>
                            <div class="absolute -bottom-3 w-8 h-8 rounded-full bg-primary-500 text-dark-950 font-bold flex items-center justify-center border-4 border-dark-950">3</div>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Terima Evaluasi</h3>
                        <p class="text-slate-400 leading-relaxed">AI kami memproses suara dan memberikan persentase akurasi secara instan.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- FITUR -->
        <section id="fitur" class="py-24 px-6 relative z-10 border-t border-dark-800/50 bg-dark-900/20">
            <div class="max-w-7xl mx-auto">
                <div class="mb-16 text-center md:text-left">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">Fitur Utama</h2>
                    <p class="text-slate-400 text-lg">Teknologi canggih di balik perjalanan belajar Anda.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
                    <!-- Feature 1: Real-time Analysis -->
                    <div class="md:col-span-2 md:row-span-2 bg-dark-900 border border-dark-800 rounded-[2rem] p-8 flex flex-col justify-between hover:border-primary-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)] transition-all group overflow-hidden relative">
                        <!-- Glow effect on hover -->
                        <div class="absolute -inset-px bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none"></div>
                        
                        <div class="relative z-10">
                            <div class="w-14 h-14 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mb-6 text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Evaluasi Audio Real-time</h3>
                            <p class="text-slate-400 leading-relaxed text-lg">
                                Algoritma Deep Learning kami memproses input suara Anda dan memberikan persentase
                                akurasi pelafalan secara instan berdasarkan kaidah tajwid yang benar.
                            </p>
                        </div>
                        <div class="mt-8 bg-dark-950 rounded-2xl p-6 border border-dark-800 group-hover:border-primary-500/30 transition-colors relative z-10">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-xs font-bold text-slate-500 tracking-wider">ANALYSIS STATE</span>
                                <span class="text-xs font-bold text-primary-400 flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
                                    88.5% ACCURATE
                                </span>
                            </div>
                            <div class="w-full bg-dark-800 h-2.5 rounded-full overflow-hidden">
                                <div class="bg-gradient-to-r from-primary-600 to-primary-400 h-full w-[88.5%] rounded-full relative">
                                    <div class="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full" style="background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2: Harakat Support -->
                    <div class="md:col-span-2 bg-gradient-to-br from-primary-600 to-cyan-700 rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-primary-600/20">
                        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div class="relative z-10">
                            <h3 class="text-2xl font-bold mb-3 text-white">Mendukung Harakat Lengkap</h3>
                            <p class="text-primary-100 opacity-90 text-lg">Klasifikasi mencakup Fathah, Kasrah, dan Dhommah
                                untuk setiap huruf hijaiyah.</p>
                        </div>
                        <div class="flex gap-3 mt-6 relative z-10">
                            <span class="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl text-xl font-bold border border-white/20 shadow-inner">بَ</span>
                            <span class="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl text-xl font-bold border border-white/20 shadow-inner">بِ</span>
                            <span class="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl text-xl font-bold border border-white/20 shadow-inner">بُ</span>
                        </div>
                        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>
                    </div>

                    <!-- Feature 3: Progress Report -->
                    <div class="bg-dark-900 border border-dark-800 rounded-[2rem] p-8 hover:border-primary-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 class="font-bold mb-2 text-xl text-white relative z-10">Laporan Kemajuan</h3>
                        <p class="text-sm text-slate-400 relative z-10">Pantau grafik perkembangan harian.</p>
                        <div class="mt-8 flex items-end justify-between gap-1.5 h-16 relative z-10">
                            <div class="w-full bg-dark-800 group-hover:bg-primary-500/20 transition-colors h-[30%] rounded-t-sm"></div>
                            <div class="w-full bg-dark-800 group-hover:bg-primary-500/40 transition-colors h-[50%] rounded-t-sm"></div>
                            <div class="w-full bg-dark-800 group-hover:bg-primary-500/60 transition-colors h-[80%] rounded-t-sm"></div>
                            <div class="w-full bg-dark-800 group-hover:bg-primary-500/80 transition-colors h-[60%] rounded-t-sm"></div>
                            <div class="w-full bg-primary-500 h-[95%] rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>
                    </div>

                    <!-- Feature 4: Web Access -->
                    <div class="bg-dark-950 border border-dark-800 rounded-[2rem] p-8 hover:border-primary-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all group">
                        <h3 class="font-bold mb-2 text-xl text-white">Akses Website</h3>
                        <p class="text-sm text-slate-400">Latih pelafalan langsung dari browser Anda.</p>
                        <div class="mt-8 flex justify-center">
                            <div class="relative flex items-center justify-center">
                                <div class="w-14 h-14 border-2 border-dark-800 rounded-full"></div>
                                <div class="absolute w-14 h-14 border-2 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-400 absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- TENTANG -->
        <section id="tentang" class="py-24 px-6 relative z-10 border-t border-dark-800/50">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-col lg:flex-row items-center gap-16">
                    <div class="w-full lg:w-1/2">
                        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-800 text-slate-300 text-xs font-bold mb-6 border border-dark-700">
                            TENTANG PROYEK INI
                        </div>
                        <h2 class="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            Menyatukan Tradisi dan <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">Teknologi Modern</span>
                        </h2>
                        <p class="text-slate-400 text-lg mb-6 leading-relaxed">
                            Tarteel Space berawal dari sebuah penelitian Skripsi Teknologi Informasi. Misi utama proyek ini adalah mengembangkan alat bantu mandiri untuk pembelajaran pelafalan Al-Qur'an yang dapat diakses oleh siapa saja, kapan saja, dan di mana saja.
                        </p>
                        <p class="text-slate-400 text-lg mb-8 leading-relaxed">
                            Dengan memanfaatkan arsitektur Convolutional Neural Network (CNN), sistem kami memproses spektrogram audio untuk mengenali pola pelafalan yang benar sesuai dengan kaidah tajwid.
                        </p>
                        
                        <div class="flex gap-4">
                            <div class="px-6 py-4 bg-dark-900 border border-dark-800 rounded-2xl flex-1 hover:border-primary-500/30 transition-colors">
                                <h4 class="text-3xl font-extrabold text-white mb-1">95<span class="text-primary-400">%</span></h4>
                                <p class="text-sm text-slate-500 font-medium">Akurasi Model</p>
                            </div>
                            <div class="px-6 py-4 bg-dark-900 border border-dark-800 rounded-2xl flex-1 hover:border-primary-500/30 transition-colors">
                                <h4 class="text-3xl font-extrabold text-white mb-1">84</h4>
                                <p class="text-sm text-slate-500 font-medium">Kelas Hijaiyah</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="w-full lg:w-1/2 relative mt-10 lg:mt-0">
                        <div class="aspect-square max-w-md mx-auto relative group">
                            <!-- Glow -->
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary-600/30 to-cyan-500/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
                            
                            <!-- Card Graphic -->
                            <div class="absolute inset-4 bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-[3rem] overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500 z-10 shadow-2xl shadow-dark-950/50">
                                <div class="p-6 md:p-8 h-full flex flex-col">
                                    <div class="flex gap-2 mb-6">
                                        <div class="w-3 h-3 rounded-full bg-slate-700"></div>
                                        <div class="w-3 h-3 rounded-full bg-slate-700"></div>
                                        <div class="w-3 h-3 rounded-full bg-slate-700"></div>
                                    </div>
                                    <div class="flex-1 bg-dark-950 rounded-2xl border border-dark-800 p-5 relative overflow-hidden flex flex-col justify-end">
                                        <div class="absolute top-0 left-0 w-full h-full opacity-20 flex items-end gap-1.5 px-5 pb-5">
                                            <div class="w-1/6 bg-primary-500 h-[30%] rounded-t-sm"></div>
                                            <div class="w-1/6 bg-primary-500 h-[50%] rounded-t-sm"></div>
                                            <div class="w-1/6 bg-primary-500 h-[40%] rounded-t-sm"></div>
                                            <div class="w-1/6 bg-primary-500 h-[80%] rounded-t-sm"></div>
                                            <div class="w-1/6 bg-primary-500 h-[60%] rounded-t-sm"></div>
                                            <div class="w-1/6 bg-primary-400 h-[95%] rounded-t-sm shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                                        </div>
                                        <div class="relative z-10 bg-dark-900/90 backdrop-blur-sm border border-dark-800 rounded-xl p-4">
                                            <p class="text-xs text-primary-400 font-mono mb-2">import tensorflow as tf</p>
                                            <p class="text-xs text-slate-300 font-mono mb-2">model = CNN_Architecture()</p>
                                            <p class="text-xs text-slate-300 font-mono mb-2">audio = load_spectrogram()</p>
                                            <p class="text-xs text-primary-400 font-mono">predict(audio) -> "Sangat Baik"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA SECTION -->
        <section class="py-24 px-6 relative z-10">
            <div class="max-w-5xl mx-auto bg-gradient-to-br from-dark-900 to-dark-950 border border-dark-800 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary-900/5 group">
                <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-primary-500/20 transition-colors duration-700"></div>
                <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
                
                <h2 class="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">Siap Menyempurnakan Bacaan Anda?</h2>
                <p class="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
                    Bergabunglah sekarang dan rasakan pengalaman belajar Al-Qur'an interaktif yang didukung oleh kecerdasan buatan. Tanpa biaya, langsung dari browser Anda.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <button class="px-8 py-4 bg-primary-500 text-dark-950 rounded-2xl font-bold text-lg hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                        Mulai Latihan Sekarang
                    </button>
                    <button class="px-8 py-4 bg-dark-950 border border-dark-700 text-white rounded-2xl font-bold text-lg hover:bg-dark-800 hover:border-dark-600 transition-all active:scale-95">
                        Pelajari Lebih Lanjut
                    </button>
                </div>
            </div>
        </section>

        <footer class="py-12 border-t border-dark-800 bg-dark-950 text-center px-6 relative z-10">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-2 cursor-pointer" @click="scrollTo('beranda')">
                    <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-dark-950 font-bold">T
                    </div>
                    <span class="font-bold text-white tracking-tight">Tarteel <span class="text-primary-400">Space</span></span>
                </div>
                <p class="text-sm text-slate-500">&copy; 2026 Tarteel Space Project. Proyek Skripsi Teknologi Informasi.
                </p>
                <div class="flex gap-4">
                    <div class="w-10 h-10 bg-dark-900 border border-dark-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-dark-800 hover:text-primary-400 transition-colors cursor-pointer font-bold">
                        in
                    </div>
                    <div class="w-10 h-10 bg-dark-900 border border-dark-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-dark-800 hover:text-primary-400 transition-colors cursor-pointer font-bold">
                        gh
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
// Gunakan useHead jika Anda ingin menambahkan SEO meta tags
useHead({
    title: 'Tarteel Space - Sempurnakan Pelafalan Al-Qur\'an dengan AI',
    meta: [
        { name: 'description', content: 'Evaluasi akurasi pelafalan huruf hijaiyah berbasis website dengan teknologi Deep Learning.' }
    ]
})

// Fungsi untuk scroll halus
const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}
</script>

<style scoped>
/* Transisi scroll yang halus sudah ditangani oleh fungsi scrollTo, 
   tapi kita simpan untuk default browser behavior jika ada tag <a> */
html {
    scroll-behavior: smooth;
}

@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>