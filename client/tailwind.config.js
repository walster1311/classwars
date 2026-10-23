/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        classroom: {
          dark: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          accent: '#4f46e5',
          teal: '#0d9488',
          amber: '#d97706',
          rose: '#e11d48'
        }
      },
    },
  },
  plugins: [],
};
