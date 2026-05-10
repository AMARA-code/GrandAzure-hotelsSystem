import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        "background":  "hsl(var(--background))",
        "foreground":  "hsl(var(--foreground))",
        "card":        "hsl(var(--card))",
        "popover":     "hsl(var(--popover))",
        "primary":     "hsl(var(--primary))",
        "secondary":   "hsl(var(--secondary))",
        "muted":       "hsl(var(--muted))",
        "accent":      "hsl(var(--accent))",
        "destructive": "hsl(var(--destructive))",
      },
      borderColor: {
        "border": "hsl(var(--border))",
        "input":  "hsl(var(--input))",
        "ring":   "hsl(var(--ring))",
      },
      textColor: {
        "foreground":              "hsl(var(--foreground))",
        "card-foreground":         "hsl(var(--card-foreground))",
        "popover-foreground":      "hsl(var(--popover-foreground))",
        "primary-foreground":      "hsl(var(--primary-foreground))",
        "secondary-foreground":    "hsl(var(--secondary-foreground))",
        "muted-foreground":        "hsl(var(--muted-foreground))",
        "accent-foreground":       "hsl(var(--accent-foreground))",
        "destructive-foreground":  "hsl(var(--destructive-foreground))",
      },
      colors: {
        // ── Brand primary — Terracotta/Burnt Orange ──────────────────────
        // SCALE SHIFTED: azure-600/700 are now visible warm terracotta,
        // NOT the dark burnt brown that was showing across the site.
        azure: {
          50:  "#FDF8F2",
          100: "#FBF0E3",
          200: "#F5D9BA",
          300: "#ECBC89",
          400: "#E09A58",
          500: "#D4722A",  // ← homepage primary
          600: "#C4621A",  // ← hover / deeper accent
          700: "#B85E1E",  // ← text on light bg — warm, readable
          800: "#944A15",  // ← strong text only
          900: "#70370E",  // ← darkest
        },

        // ── Warm neutrals (page/section backgrounds, borders) ────────────
        // Renamed from "slate" → "warm" so Tailwind's built-in
        // slate-* utilities stay at their default cool-gray values.
        // Use `warm-50`, `warm-100` etc. instead of `slate-*` in your
        // dashboard components for background tints.
        warm: {
          50:  "#FAFAF7",   // page background  (matches HomeLanding)
          100: "#F7F4EF",   // alternate section bg
          200: "#F0EDE8",   // subtle dividers
          300: "#E7E3DC",   // borders
          400: "#C7AB8A",   // muted borders
          500: "#A88666",   // muted text
          600: "#8C6A4F",   // secondary text
          700: "#70503C",   // body text
          800: "#593F31",   // strong text
          900: "#1C1917",   // foreground / dark CTA bg
        },

        // ── Accent — Amber/Gold (use sparingly for highlights only) ──────
        gold: {
          50:  "#FDF8F3",
          100: "#FBF0E3",
          200: "#F5D9BA",
          300: "#ECBC89",
          400: "#E09A58",
          500: "#D4722A",
          600: "#C4621A",
          700: "#B85E1E",
          800: "#944A15",
          900: "#70370E",
        },

        // ── Semantic colours ─────────────────────────────────────────────
        emerald: {
          50:  "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        amber: {
          50:  "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        rose: {
          50:  "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
        },

        // ── Loyalty / VIP purple ─────────────────────────────────────────
        violet: {
          50:  "#f5f3ff",
          500: "#8b5cf6",
          600: "#7c3aed",
        },

        // ── Pastel card palettes (match HomeLanding room/review cards) ───
        // Gives you named utilities like bg-card-terra, border-card-blue etc.
        "card-terra":  "#FFF4ED",
        "card-blue":   "#EFF6FF",
        "card-green":  "#F0FDF4",
        "card-purple": "#FDF4FF",
        "card-orange": "#FFF7ED",
        "card-sky":    "#F0F9FF",
      },

      fontFamily: {
        sans:    ["var(--font-inter)",     "sans-serif"],
        display: ["var(--font-playfair)",  "serif"],
      },

      boxShadow: {
        "premium":    "0 4px 24px -2px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
        "premium-lg": "0 8px 40px -4px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.06)",
        "premium-xl": "0 20px 60px -8px rgba(0,0,0,0.15), 0 8px 24px -4px rgba(0,0,0,0.08)",
        "gold":       "0 4px 24px -2px rgba(212,114,42,0.22)",
        "azure":      "0 4px 24px -2px rgba(212,114,42,0.25)",
        "card":       "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)",
      },

      borderRadius: {
        "xl":  "12px",
        "2xl": "16px",
        "3xl": "24px",
      },

      backgroundImage: {
        "gradient-azure":   "linear-gradient(135deg, #D4722A 0%, #944A15 100%)",
        "gradient-gold":    "linear-gradient(135deg, #ECBC89 0%, #D4722A 100%)",
        "gradient-premium": "linear-gradient(135deg, #D4722A 0%, #8b5cf6 50%, #d97706 100%)",
        "gradient-card":    "linear-gradient(145deg, #ffffff 0%, #fdfaf6 100%)",
        "gradient-hero":    "linear-gradient(135deg, #FDF8F3 0%, #FBF0E3 100%)",
      },

      animation: {
        "fade-in":       "fadeIn 0.5s ease-out",
        "slide-up":      "slideUp 0.4s ease-out",
        "slide-in-right":"slideInRight 0.3s ease-out",
        "float":         "float 3s ease-in-out infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "pulse-gold":    "pulseGold 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn:       { from: { opacity: "0" },                              to: { opacity: "1" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        float:        { "0%,100%": { transform: "translateY(0)" },           "50%": { transform: "translateY(-8px)" } },
        shimmer:      { from: { backgroundPosition: "-200% 0" },             to:   { backgroundPosition: "200% 0" } },
        pulseGold:    { "0%,100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.4)" }, "50%": { boxShadow: "0 0 0 8px rgba(245,158,11,0)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;