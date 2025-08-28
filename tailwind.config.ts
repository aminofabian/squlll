import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#246a59',
        'primary': '#246a59',
        'primary-dark': '#1a4c40',
        'primary-light': '#2d8570',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        destructive: 'var(--destructive)',
      },
      fontFamily: {
        'outfit': ['var(--font-outfit)', 'sans-serif'],
        'sans': ['var(--font-outfit)', 'var(--font-geist-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config 