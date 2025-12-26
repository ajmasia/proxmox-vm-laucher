/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Catppuccin colors (all use CSS variables for theme switching)
        ctp: {
          base: 'rgb(var(--ctp-base) / <alpha-value>)',
          mantle: 'rgb(var(--ctp-mantle) / <alpha-value>)',
          crust: 'rgb(var(--ctp-crust) / <alpha-value>)',
          surface0: 'rgb(var(--ctp-surface0) / <alpha-value>)',
          surface1: 'rgb(var(--ctp-surface1) / <alpha-value>)',
          surface2: 'rgb(var(--ctp-surface2) / <alpha-value>)',
          overlay0: 'rgb(var(--ctp-overlay0) / <alpha-value>)',
          overlay1: 'rgb(var(--ctp-overlay1) / <alpha-value>)',
          overlay2: 'rgb(var(--ctp-overlay2) / <alpha-value>)',
          subtext0: 'rgb(var(--ctp-subtext0) / <alpha-value>)',
          subtext1: 'rgb(var(--ctp-subtext1) / <alpha-value>)',
          text: 'rgb(var(--ctp-text) / <alpha-value>)',
          // Accent colors (Latte in light, Mocha in dark)
          green: 'rgb(var(--ctp-green) / <alpha-value>)',
          yellow: 'rgb(var(--ctp-yellow) / <alpha-value>)',
          blue: 'rgb(var(--ctp-blue) / <alpha-value>)',
          lavender: 'rgb(var(--ctp-lavender) / <alpha-value>)',
          mauve: 'rgb(var(--ctp-mauve) / <alpha-value>)',
          red: 'rgb(var(--ctp-red) / <alpha-value>)',
          peach: 'rgb(var(--ctp-peach) / <alpha-value>)',
          teal: 'rgb(var(--ctp-teal) / <alpha-value>)',
          pink: 'rgb(var(--ctp-pink) / <alpha-value>)',
          sky: 'rgb(var(--ctp-sky) / <alpha-value>)',
          sapphire: 'rgb(var(--ctp-sapphire) / <alpha-value>)',
          maroon: 'rgb(var(--ctp-maroon) / <alpha-value>)',
          rosewater: 'rgb(var(--ctp-rosewater) / <alpha-value>)',
          flamingo: 'rgb(var(--ctp-flamingo) / <alpha-value>)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
