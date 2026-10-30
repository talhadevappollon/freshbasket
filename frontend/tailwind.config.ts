import type { Config } from "tailwindcss";

const FRESH_SCALE = {
  50: '#f3f7f3', 100: '#e7efe6', 200: '#cde0cc', 300: '#a5cca4', 400: '#6db26c', 500: '#478f45',
  600: '#3a7538', 700: '#2e5d2d', 800: '#254724', 900: '#1d361c', 950: '#101e10',
};
const BRAND_SCALE = {
  50: '#fdf2f1', 100: '#fce4e4', 200: '#f9c9c8', 300: '#f69a98', 400: '#f44d48', 500: '#d4261e',
  600: '#b20f0b', 700: '#950d09', 800: '#750d0a', 900: '#570c0a', 950: '#2e0605',
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // class names live in data helpers too (e.g. the category tones in src/data/homeCatalogue.ts)
    "./src/data/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Brand palette, sampled from the Fresh House logo: leaf green #478f45 and apple red #b20f0b.
        // `fresh` is the primary green. 500 is the exact logo green (icons, large shapes); 600+ pass AA
        // contrast under white text, so buttons use 600/700.
        fresh: FRESH_SCALE,
        // `brand` is the accent red (600 is the exact logo red): sale badges, basket count, key highlights.
        brand: BRAND_SCALE,
        star: '#f5b014', // review stars keep a conventional gold
        // The storefront was built with a rainbow of default Tailwind hues. Pointing those families at the
        // two brand colours re-themes every existing class at once: cool/green hues -> logo green,
        // warm/purple hues -> logo red. (amber/yellow -> green too; stars use the dedicated `star` gold.)
        emerald: FRESH_SCALE, green: FRESH_SCALE, amber: FRESH_SCALE, yellow: FRESH_SCALE, teal: FRESH_SCALE, sky: FRESH_SCALE, blue: FRESH_SCALE, cyan: FRESH_SCALE, lime: FRESH_SCALE,
        rose: BRAND_SCALE, red: BRAND_SCALE, pink: BRAND_SCALE, fuchsia: BRAND_SCALE, purple: BRAND_SCALE, violet: BRAND_SCALE, indigo: BRAND_SCALE, orange: BRAND_SCALE,
      },
      // Tailwind v3 has no xs / 2xs shadows (they were added in v4) – the codebase uses both.
      boxShadow: {
        '2xs': '0 1px 0 0 rgb(15 23 42 / 0.04)',
        xs: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        glow: '0 10px 40px -10px rgb(22 163 74 / 0.45)',
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)',
        'card-hover': '0 2px 4px rgb(15 23 42 / 0.05), 0 24px 48px -16px rgb(15 23 42 / 0.22)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        menuIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(34, 197, 94, 0.45)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bump: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        slideProgress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out forwards',
        'menu-in': 'menuIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.2s ease-out both',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 3.5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s infinite',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        bump: 'bump 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        kenburns: 'kenburns 8s ease-out both',
        'slide-progress': 'slideProgress 5.5s linear both',
      },
    },
  },
  plugins: [],
};
export default config;
