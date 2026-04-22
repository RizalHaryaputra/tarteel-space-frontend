import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                // Warna Background Gelap Premium
                dark: {
                    950: '#020617', // Latar belakang utama (Very dark slate)
                    900: '#0f172a', // Latar belakang kartu (Dark slate)
                    800: '#1e293b', // Border halus
                },
                // Warna Aksen Biru
                primary: {
                    400: '#60a5fa', // Biru terang (Glow/Text)
                    500: '#3b82f6', // Biru utama (Button)
                    600: '#2563eb', // Biru gelap (Hover)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'hero-glow': 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
            }
        }
    }
}