/** @type {import('tailwindcss').Config} */
module.exports = {
  // Cette section 'content' est VITALE. Elle dit à Tailwind où trouver vos classes.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scanne tous les fichiers JS, JSX, TS, TSX dans 'src'
    "./public/index.html",       // Scanne aussi votre fichier HTML principal
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}