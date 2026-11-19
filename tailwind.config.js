/** @type {import('tailwindcss').Config} */
export default {
  // class strategy: keys off `.dark` on <html>, which ThemeContext already toggles.
  // Safe to add — nothing in src used `dark:` before this.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      // VibeLevel page tokens. Values resolve from CSS vars scoped to `.vl-page`
      // (see src/pages/VibeLevel.jsx), so these class names are inert elsewhere.
      // Alpha placeholder lets `/opacity` modifiers work (e.g. bg-brandSurf/40).
      colors: {
        bg:       'hsl(var(--vl-background) / <alpha-value>)',
        fg:       'hsl(var(--vl-foreground) / <alpha-value>)',
        card:     'hsl(var(--vl-card) / <alpha-value>)',
        muted:    'hsl(var(--vl-muted) / <alpha-value>)',
        mutedfg:  'hsl(var(--vl-muted-foreground) / <alpha-value>)',
        line:     'hsl(var(--vl-border) / <alpha-value>)',
        brand:    'hsl(var(--vl-brand) / <alpha-value>)',
        brandS:   'hsl(var(--vl-brand-strong) / <alpha-value>)',
        brandSurf:'hsl(var(--vl-brand-surface) / <alpha-value>)',
        iris:     'hsl(var(--vl-iris) / <alpha-value>)',
        irisS:    'hsl(var(--vl-iris-strong) / <alpha-value>)',
        irisSurf: 'hsl(var(--vl-iris-surface) / <alpha-value>)',
        azure:    'hsl(var(--vl-azure) / <alpha-value>)',
        azureSurf:'hsl(var(--vl-azure-surface) / <alpha-value>)',
        warn:     'hsl(var(--vl-warning) / <alpha-value>)',
        warnSurf: 'hsl(var(--vl-warning-surface) / <alpha-value>)',
        // Admin design system (copied from the restaurant app, ~/kavari-grand-rms/css/app.css). The values
        // live as CSS variables on `.adm` in index.css; these names only resolve inside the admin.
        ui: {
          bg: 'var(--bg)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)', 'surface-3': 'var(--surface-3)',
          border: 'var(--border)', 'border-strong': 'var(--border-strong)', text: 'var(--text)', 'text-2': 'var(--text-2)',
          muted: 'var(--muted)', subtle: 'var(--subtle)', primary: 'var(--primary)', brand: 'var(--brand)', ring: 'var(--ring)',
        },
        // Slate reads its channels from variables so `.adm-z` (the admin shell) can swap it for the zinc
        // palette; everywhere else the fallbacks are Tailwind's own slate values.
        slate: {
          50: 'rgb(var(--slate-50, 248 250 252) / <alpha-value>)',
          100: 'rgb(var(--slate-100, 241 245 249) / <alpha-value>)',
          200: 'rgb(var(--slate-200, 226 232 240) / <alpha-value>)',
          300: 'rgb(var(--slate-300, 203 213 225) / <alpha-value>)',
          400: 'rgb(var(--slate-400, 148 163 184) / <alpha-value>)',
          500: 'rgb(var(--slate-500, 100 116 139) / <alpha-value>)',
          600: 'rgb(var(--slate-600, 71 85 105) / <alpha-value>)',
          700: 'rgb(var(--slate-700, 51 65 85) / <alpha-value>)',
          800: 'rgb(var(--slate-800, 30 41 59) / <alpha-value>)',
          900: 'rgb(var(--slate-900, 15 23 42) / <alpha-value>)',
          950: 'rgb(var(--slate-950, 2 6 23) / <alpha-value>)',
        },
      },
      boxShadow: {
        e1: 'var(--vl-elev-1)',
        e2: 'var(--vl-elev-2)',
        e3: 'var(--vl-elev-3)',
        'ui-sm': 'var(--sh-sm)', ui: 'var(--sh)', 'ui-lg': 'var(--sh-lg)',
      },
      borderRadius: { 'ui-sm': 'var(--r-sm)', ui: 'var(--r)', 'ui-lg': 'var(--r-lg)' },
    },
  },
  plugins: [],
}
