import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        seiva: {
          // Brandbook oficial
          'dark':    '#283618',   // Verde escuro principal
          'medium':  '#606c38',   // Verde médio (primary CTA)
          'cream':   '#FEFAE0',   // Creme/off-white (fundo, destaque claro)
          // Extras harmonizados
          'light':   '#dde5b6',   // Verde claro (hover, badges)
          'muted':   '#a3b18a',   // Verde apagado (texto secundário)
          'ink':     '#1a2310',   // Quase preto (texto principal)
        }
      },
      fontFamily: {
        display: ['Georgia', 'Playfair Display', 'serif'],
        body:    ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':  '0 4px 24px 0 rgba(40,54,24,0.08)',
        'card-hover': '0 8px 40px 0 rgba(40,54,24,0.16)',
        'glow':  '0 0 40px 0 rgba(96,108,56,0.24)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
