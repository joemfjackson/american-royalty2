import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D6C08A',
          light: '#E8D9B0',
          dark: '#B8A06A',
        },
        royal: {
          DEFAULT: '#6F2DBD',
          light: '#8B4FD4',
          dark: '#5A1FA3',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          card: '#111111',
          border: '#1E1E1E',
        },
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'sans-serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
