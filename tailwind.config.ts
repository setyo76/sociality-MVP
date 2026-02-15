import type { Config } from "tailwindcss";

const config: Config = {
  // Perbaikan 1: Di Tailwind v3.x ke atas, gunakan string "class", bukan array ["class"]
  darkMode: "class", 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sf-pro)", "system-ui", "sans-serif"],
      },
      colors: {
        // Perbaikan 2: Semua catatan warna di bawah ini sekarang menggunakan tanda komentar yang benar (//)
        background: "hsl(var(--background))", // #09090b (Zinc 950)
        foreground: "hsl(var(--foreground))", // #fafafa (Zinc 50)
        card: "hsl(var(--card))",              // #18181b (Zinc 900)
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",   // #7c3aed (Violet 600)
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // #27272a (Zinc 800)
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",     // #27272a
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",       // #27272a
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;