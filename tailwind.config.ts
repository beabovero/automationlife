import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          green:   '#00ff41',
          dim:     '#00cc33',
          dark:    '#003b00',
          glow:    '#00ffaa',
          cyan:    '#00d4ff',
          purple:  '#a855f7',
          bg:      '#000000',
          surface: '#050505',
          card:    '#0a0a0a',
          border:  'rgba(0,255,65,0.15)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'matrix-fall':    'matrix-fall 20s linear infinite',
        'glitch':         'glitch 3s infinite',
        'glitch-fast':    'glitch 0.8s infinite',
        'pulse-green':    'pulse-green 2s ease-in-out infinite',
        'pulse-cyan':     'pulse-cyan 2s ease-in-out infinite',
        'scan':           'scan 6s linear infinite',
        'flicker':        'flicker 4s infinite',
        'type':           'type 2s steps(40) forwards',
        'blink':          'blink 1s step-end infinite',
        'slide-up':       'slide-up 0.5s ease forwards',
        'slide-in-right': 'slide-in-right 0.4s ease forwards',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
      },
      keyframes: {
        'matrix-fall': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%,100%': { clipPath: 'inset(0 0 100% 0)', transform: 'translate(0)' },
          '5%':  { clipPath: 'inset(10% 0 60% 0)', transform: 'translate(-2px, 2px)' },
          '10%': { clipPath: 'inset(40% 0 40% 0)', transform: 'translate(2px, -2px)' },
          '15%': { clipPath: 'inset(70% 0 10% 0)', transform: 'translate(-1px, 1px)' },
          '20%': { clipPath: 'inset(0 0 100% 0)', transform: 'translate(0)' },
        },
        'pulse-green': {
          '0%,100%': { boxShadow: '0 0 5px #00ff41, 0 0 10px rgba(0,255,65,0.3)' },
          '50%':     { boxShadow: '0 0 20px #00ff41, 0 0 40px rgba(0,255,65,0.5), 0 0 60px rgba(0,255,65,0.2)' },
        },
        'pulse-cyan': {
          '0%,100%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px rgba(0,212,255,0.3)' },
          '50%':     { boxShadow: '0 0 20px #00d4ff, 0 0 40px rgba(0,212,255,0.5)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100vh)', opacity: '0.3' },
          '50%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(100vh)', opacity: '0.3' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '92%':     { opacity: '1' },
          '93%':     { opacity: '0.4' },
          '94%':     { opacity: '1' },
          '96%':     { opacity: '0.6' },
          '97%':     { opacity: '1' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%,100%': { textShadow: '0 0 10px #00ff41, 0 0 20px rgba(0,255,65,0.5)' },
          '50%':     { textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41, 0 0 60px rgba(0,255,65,0.3)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'grid-matrix': `linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid-matrix': '40px 40px',
      },
    },
  },
  plugins: [],
}

export default config
