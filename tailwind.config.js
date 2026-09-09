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
      },
      boxShadow: {
        e1: 'var(--vl-elev-1)',
        e2: 'var(--vl-elev-2)',
        e3: 'var(--vl-elev-3)',
      },
    },
  },
  plugins: [],
}
