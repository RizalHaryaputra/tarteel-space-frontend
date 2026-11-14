import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        "./app/**/*.{js,vue,ts}",
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
                // Background & Surface Palette (driven by CSS variables)
                dark: {
                    950: 'rgb(var(--ts-dark-950) / <alpha-value>)', // Main page background (Paper-0)
                    900: 'rgb(var(--ts-dark-900) / <alpha-value>)', // Card background (Paper-1)
                    850: 'rgb(var(--ts-dark-850) / <alpha-value>)', // Elevated card (Paper-2)
                    800: 'rgb(var(--ts-dark-800) / <alpha-value>)', // Hairline borders & subtle elements (Paper-3)
                },
                // Ink / Text Palette
                ink: {
                    0: 'rgb(var(--ts-ink-0) / <alpha-value>)', // Primary heading & text
                    1: 'rgb(var(--ts-ink-1) / <alpha-value>)', // Body text
                    2: 'rgb(var(--ts-ink-2) / <alpha-value>)', // Secondary / metadata text
                    3: 'rgb(var(--ts-ink-3) / <alpha-value>)', // Muted text & subtle borders
                },
                // Accent Blue Palette
                primary: {
                    DEFAULT: '#2563eb',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: 'rgb(var(--ts-primary-400) / <alpha-value>)', // Soft sky blue (text/glow)
                    500: '#2563eb', // Primary blue (buttons/accents)
                    600: '#1d4ed8', // Hover blue
                    700: '#1e40af',
                    800: '#1e3a8a',
                    900: '#172554',
                    950: 'rgb(var(--ts-primary-950) / <alpha-value>)', // Blue tint for cards/badges
                    azure: '#38bdf8', // Companion cyan/azure blue
                }
            },
            fontFamily: {
                sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['Geist Mono', 'ui-monospace', 'monospace'],
                serif: ['Instrument Serif', 'Times New Roman', 'serif'],
            },
            animation: {
                'marquee': 'marquee 36s linear infinite',
                'live-pulse': 'livePulse 1800ms cubic-bezier(0.65, 0, 0.35, 1) infinite',
                'bar': 'barDance 1.2s ease-in-out infinite',
                'blink': 'blinkCursor 1s step-end infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                livePulse: {
                    '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.6)' },
                    '70%': { boxShadow: '0 0 0 9px rgba(16, 185, 129, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                },
                barDance: {
                    '0%, 100%': { transform: 'scaleY(1)', opacity: '0.4' },
                    '50%': { transform: 'scaleY(1.5)', opacity: '0.9' },
                },
                blinkCursor: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                }
            }
        }
    }
}