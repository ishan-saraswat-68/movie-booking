/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED', // Neon Purple
        accent: '#22D3EE',  // Cyan Glow
        dark: '#0B0F1A',    // Deep Navy
        card: '#111827',    // Surface Cards
        muted: '#94A3B8',   // Slate Blue/Grey
        light: '#E2E8F0',   // Light Text
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
