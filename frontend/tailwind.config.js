/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#312E81",      // Deep Indigo
        secondary: "#2563EB",    // Royal Blue
        accent: "#14B8A6",       // Teal
        bgSoft: "#F8FAFC",       // Soft White
        card: "#FFFFFF",         // White
        mainText: "#0F172A",     // Dark Slate
        subText: "#64748B",      // Slate Gray
        success: "#22C55E",      // Green
      },
    },
  },
  plugins: [],
};