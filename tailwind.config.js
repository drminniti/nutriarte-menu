/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Nutriarte – tierra/pastel/verde natural
        brand: {
          50:  '#f5f0e8',
          100: '#ece0d0',
          200: '#d9c2a3',
          300: '#c5a376',
          400: '#b28759',
          500: '#9a6d41',   // tierra principal
          600: '#7d5633',
          700: '#614028',
          800: '#452d1d',
          900: '#2c1c10',
        },
        sage: {
          50:  '#f2f7f0',
          100: '#e0edd9',
          200: '#c1dab3',
          300: '#9fc68a',
          400: '#7db166',
          500: '#5d9a47',   // verde sage principal
          600: '#497a38',
          700: '#375c2b',
          800: '#253e1d',
          900: '#152410',
        },
        cream: {
          50:  '#fdfaf4',
          100: '#faf4e6',
          200: '#f5e9cd',
          300: '#efdbaf',
          400: '#e8cc90',
          500: '#e0bc70',   // crema/trigo
        },
        // Fondos y neutros
        surface: {
          DEFAULT: '#faf8f3',
          card:    '#ffffff',
          muted:   '#f0ede6',
        },
        text: {
          primary:   '#2c1c10',
          secondary: '#614028',
          muted:     '#9a8070',
          inverse:   '#fdfaf4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(44,28,16,0.08)',
        'card-hover': '0 8px 32px rgba(44,28,16,0.15)',
        'elevated': '0 16px 48px rgba(44,28,16,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
