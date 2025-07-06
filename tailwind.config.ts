import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#003366',
          gold: '#D4AF37',
          light: '#f8f9fa',
          dark: '#0d2c5a'
        },
      },
      boxShadow: {
        'subtle': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
