/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'keycap': '0 2px 0 0 rgba(15, 23, 42, 0.14), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'keycap-dark': '0 2px 0 0 rgba(2, 6, 23, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'card-subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.07), 0 4px 10px -6px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
