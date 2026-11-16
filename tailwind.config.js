/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0056b3',
        'primary-dark': '#003d80',
        secondary: '#ff9f43',
        ink: '#1a1a2e',
        canvas: '#f0f2f5',
        card: '#ffffff',
        line: '#e0e0e0',
        success: '#2e7d32',
        'success-bg': '#e8f5e9',
        danger: '#c62828',
        'danger-bg': '#fdecea',
        warning: '#e65100',
        'warning-bg': '#fff3e0',
        info: '#1565c0',
        'info-bg': '#e3f2fd',
        muted: '#6b7280',
        'admin-accent': '#1a2f5a',
        firebase: '#3ecf8e',
        'firebase-dark': '#1a9a67',
        'firebase-bg': '#e8faf3'
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 5px rgba(0,0,0,0.07)',
        pop: '0 10px 32px rgba(0,0,0,0.22)'
      },
      borderRadius: {
        xl2: '14px'
      }
    }
  },
  plugins: []
}
