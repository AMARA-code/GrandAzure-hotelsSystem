import type { Config } from "tailwindcss";

const config: Config = {  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        "background": "hsl(var(--background))",
        "foreground": "hsl(var(--foreground))",
        "card": "hsl(var(--card))",
        "popover": "hsl(var(--popover))",
        "primary": "hsl(var(--primary))",
        "secondary": "hsl(var(--secondary))",
        "muted": "hsl(var(--muted))",
        "accent": "hsl(var(--accent))",
        "destructive": "hsl(var(--destructive))",
      },
      borderColor: {
        "border": "hsl(var(--border))",
        "input": "hsl(var(--input))",
        "ring": "hsl(var(--ring))",
      },
      textColor: {
        "foreground": "hsl(var(--foreground))",
        "card-foreground": "hsl(var(--card-foreground))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },
      colors: {
        // Primary — Deep Azure Blue
        azure: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7dc8fb",
          400: "#38aaf5",
          500: "#0e8ee6",
          600: "#026fc4",
          700: "#0358a0",
          800: "#074c84",
          900: "#0c406d",
        },
        // Accent — Warm Gold
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Success — Emerald
        emerald: {
          50:  "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        // Warning — Amber
        amber: {
          50:  "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Danger — Rose
        rose: {
          50:  "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
        },
        // Neutral — Cream Pastel (global base)
        slate: {
          50:  "#fdfaf6",
          100: "#f7f1e8",
          200: "#eee3d4",
          300: "#dfcdb5",
          400: "#c7ab8a",
          500: "#a88666",
          600: "#8c6a4f",
          700: "#70503c",
          800: "#593f31",
          900: "#463226",
        },
        // Purple — for loyalty/VIP
        violet: {
          50:  "#f5f3ff",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        "premium":    "0 4px 24px -2px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
        "premium-lg": "0 8px 40px -4px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.06)",
        "premium-xl": "0 20px 60px -8px rgba(0,0,0,0.15), 0 8px 24px -4px rgba(0,0,0,0.08)",
        "gold":       "0 4px 24px -2px rgba(245,158,11,0.25)",
        "azure":      "0 4px 24px -2px rgba(14,142,230,0.25)",
        "card":       "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)",
      },
      borderRadius: {
        "xl":  "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      backgroundImage: {
        "gradient-azure": "linear-gradient(135deg, #0e8ee6 0%, #0358a0 100%)",
        "gradient-gold":  "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
        "gradient-premium": "linear-gradient(135deg, #0e8ee6 0%, #8b5cf6 50%, #d97706 100%)",
        "gradient-card":  "linear-gradient(145deg, #ffffff 0%, #fdfaf6 100%)",
      },
      animation: {
        "fade-in":      "fadeIn 0.5s ease-out",
        "slide-up":     "slideUp 0.4s ease-out",
        "slide-in-right":"slideInRight 0.3s ease-out",
        "float":        "float 3s ease-in-out infinite",
        "shimmer":      "shimmer 2s linear infinite",
        "pulse-gold":   "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: "0" },                    to: { opacity: "1" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        float:        { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:      { from: { backgroundPosition: "-200% 0" },   to: { backgroundPosition: "200% 0" } },
        pulseGold:    { "0%,100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.4)" }, "50%": { boxShadow: "0 0 0 8px rgba(245,158,11,0)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;