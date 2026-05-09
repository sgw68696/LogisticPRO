import type { Config } from 'tailwindcss';

const config: Config = {
  // ...existing config
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050d1a',
          900: '#0a1628',
          800: '#0d1f38',
          700: '#112240',
        },
        cyan: {
          // already exists in Tailwind, but adding alias
          brand: '#0ea5e9',
        },
        indigo: {
          brand: '#6366f1',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0ea5e9, #6366f1)',
      },
      boxShadow: {
        'brand-glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'brand-glow-lg': '0 0 40px rgba(14, 165, 233, 0.25)',
      },
    },
  },
};

export default config;