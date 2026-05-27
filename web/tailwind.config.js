/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5F5F",     // Vibrant Salmon-Coral
          secondary: "#3A86FF",   // Culinary Blue
          tertiary: "#38B000",    // Fresh Organic Green
          background: "#FAF9F5",  // Light Linen Paper
          charcoal: "#0F172A",    // Deep text/dark background
          warmSurface: "#F5F3EC", // Sunken paper container
        }
      },
      fontFamily: {
        headline: ["Outfit", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        label: ["Inter", "sans-serif"]
      },
      borderRadius: {
        'brand': '0.75rem',       // Soft custom roundness
      },
      boxShadow: {
        'premium': '0 8px 30px rgb(0 0 0 / 0.04)',
        'premium-hover': '0 20px 40px rgb(0 0 0 / 0.08)',
        'card': '0 2px 12px rgb(15 23 42 / 0.04)',
      }
    },
  },
  plugins: [],
}
