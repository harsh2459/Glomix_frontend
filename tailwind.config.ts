import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './stores/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '65': '260px',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        // Brand tokens — all resolve to theme.css variables
        brand: {
          bg:      'var(--bg)',
          alt:     'var(--bg-alt)',
          muted:   'var(--bg-muted)',
          surface: 'var(--surface)',
          text:    'var(--text)',
          sub:     'var(--text-sub)',
          faint:   'var(--text-faint)',
          accent:  'var(--accent)',
          ink:     'var(--ink)',
        },
        // Keep legacy aliases for pages that still use them
        primary: 'var(--ink)',
        surface: 'var(--surface)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:   'var(--radius-sm)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl':'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        deep: 'var(--shadow-deep)',
      },
    },
  },
  plugins: [],
};

export default config;
