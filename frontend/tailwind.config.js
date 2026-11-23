/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        brand: {
          50: "#EEF0FA",
          100: "#DCDFF8",
          200: "#B8BDF1",
          300: "#959CE9",
          400: "#8170F5",
          500: "#5945E8",
          600: "#4D39D9",
          700: "#402EBE",
          800: "#3323A0",
          900: "#24177F",
          950: "#130A4A",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        // Strict surface palette from prompt
        canvas: {
          light: "#F6F7FB",
          dark: "#0B1020",
        },
        panel: {
          light: "#FFFFFF",
          dark: "#151D30",
        },
        sidebar: {
          light: "#10182B",
          dark: "#080D19",
        },
        content: {
          mainLight: "#172033",
          mainDark: "#F1F3FA",
          mutedLight: "#68758B",
          mutedDark: "#A0ABC0",
        },
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(89, 69, 232, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 2px 8px 0 rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
