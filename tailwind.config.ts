import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Zecamo brand */
        "zecamo-bg":           "#0A0F1F",
        "zecamo-surface":      "#0F1730",
        "zecamo-primary":      "#2B5BFF",
        "zecamo-primary-hover":"#3F6FFF",
        "zecamo-text-muted":   "#8B95B0",
        "zecamo-border":       "rgba(255,255,255,0.06)",
        /* shadcn compat via CSS vars */
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border:   "hsl(var(--border))",
        input:    "hsl(var(--input))",
        ring:     "hsl(var(--ring))",
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "'Space Grotesk'", "Inter", "sans-serif"],
        mono:    ["var(--font-mono)", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg:  "var(--radius-lg)",
        md:  "var(--radius-md)",
        DEFAULT: "var(--radius)",
        sm:  "var(--radius-sm)",
      },
    },
  },
  plugins: [],
};
export default config;
