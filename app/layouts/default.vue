<template>
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
        <nav class="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col p-4 space-y-4">
            <div class="h-12 w-full bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                T-AI
            </div>
            <div class="flex-1 space-y-2">
                <NuxtLink to="/" class="flex items-center p-3 rounded-lg hover:bg-slate-100 group">
                    <div class="w-6 h-6 bg-slate-200 rounded group-hover:bg-emerald-100"></div>
                    <span class="ml-3 hidden lg:block">Dashboard</span>
                </NuxtLink>
                <NuxtLink to="/practice" class="flex items-center p-3 rounded-lg hover:bg-slate-100 group">
                    <div class="w-6 h-6 bg-slate-200 rounded group-hover:bg-emerald-100"></div>
                    <span class="ml-3 hidden lg:block">Latihan</span>
                </NuxtLink>
            </div>
        </nav>

        <main class="flex-1 p-6 lg:p-10 overflow-y-auto">
            <header class="mb-8 flex justify-between items-center">
                <h1 class="text-2xl font-bold">Ruang Latihan</h1>
                <div class="w-10 h-10 bg-slate-300 rounded-full"></div>
            </header>

            <slot />
        </main>
    </div>
</template>