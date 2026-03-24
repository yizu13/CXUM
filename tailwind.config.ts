// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Añadimos 'Outfit' como nuestra fuente amigable
        outfit: ['Outfit', 'sans-serif'], 
      },
      // ... resto de tu configuración
    },
  },
  plugins: [],
}