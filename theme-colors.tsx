"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the color themes with money-themed colors
export const colorThemes = {
  money: {
    primary: "hsl(150, 60%, 30%)", // Money green
    primaryForeground: "hsl(0, 0%, 100%)",
    secondary: "hsl(45, 90%, 50%)", // Gold
    secondaryForeground: "hsl(0, 0%, 10%)",
    accent: "hsl(165, 80%, 40%)", // Mint
    accentForeground: "hsl(0, 0%, 100%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(150, 30%, 20%)",
    muted: "hsl(150, 20%, 95%)",
    mutedForeground: "hsl(150, 20%, 40%)",
    border: "hsl(150, 20%, 90%)",
    input: "hsl(150, 20%, 90%)",
    ring: "hsl(150, 60%, 30%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(150, 30%, 20%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    destructiveForeground: "hsl(0, 0%, 100%)",
    success: "hsl(142.1, 76.2%, 36.3%)",
    successForeground: "hsl(0, 0%, 100%)",
    warning: "hsl(45, 100%, 50%)",
    warningForeground: "hsl(0, 0%, 10%)",
    info: "hsl(200, 90%, 60%)",
    infoForeground: "hsl(0, 0%, 100%)",
    chartColors: [
      "#2e7d32",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
      "#f44336",
      "#9c27b0",
    ],
  },
  wealth: {
    primary: "hsl(45, 90%, 45%)", // Gold
    primaryForeground: "hsl(0, 0%, 10%)",
    secondary: "hsl(200, 70%, 50%)", // Blue
    secondaryForeground: "hsl(0, 0%, 100%)",
    accent: "hsl(25, 90%, 55%)", // Orange/Copper
    accentForeground: "hsl(0, 0%, 100%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(45, 30%, 25%)",
    muted: "hsl(45, 30%, 95%)",
    mutedForeground: "hsl(45, 20%, 50%)",
    border: "hsl(45, 30%, 90%)",
    input: "hsl(45, 30%, 90%)",
    ring: "hsl(45, 90%, 45%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(45, 30%, 25%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    destructiveForeground: "hsl(0, 0%, 100%)",
    success: "hsl(142.1, 76.2%, 36.3%)",
    successForeground: "hsl(0, 0%, 100%)",
    warning: "hsl(45, 100%, 50%)",
    warningForeground: "hsl(0, 0%, 10%)",
    info: "hsl(200, 90%, 60%)",
    infoForeground: "hsl(0, 0%, 100%)",
    chartColors: [
      "#ffd700",
      "#ffb700",
      "#ff9800",
      "#ff5722",
      "#f44336",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
    ],
  },
  crypto: {
    primary: "hsl(215, 90%, 50%)", // Bitcoin blue
    primaryForeground: "hsl(0, 0%, 100%)",
    secondary: "hsl(140, 80%, 40%)", // Crypto green
    secondaryForeground: "hsl(0, 0%, 100%)",
    accent: "hsl(30, 100%, 50%)", // Bitcoin orange
    accentForeground: "hsl(0, 0%, 10%)",
    background: "hsl(220, 20%, 10%)",
    foreground: "hsl(0, 0%, 95%)",
    muted: "hsl(220, 20%, 20%)",
    mutedForeground: "hsl(220, 20%, 70%)",
    border: "hsl(220, 20%, 25%)",
    input: "hsl(220, 20%, 25%)",
    ring: "hsl(215, 90%, 50%)",
    card: "hsl(220, 20%, 15%)",
    cardForeground: "hsl(0, 0%, 95%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    destructiveForeground: "hsl(0, 0%, 100%)",
    success: "hsl(142.1, 76.2%, 36.3%)",
    successForeground: "hsl(0, 0%, 100%)",
    warning: "hsl(45, 100%, 50%)",
    warningForeground: "hsl(0, 0%, 10%)",
    info: "hsl(200, 90%, 60%)",
    infoForeground: "hsl(0, 0%, 100%)",
    chartColors: [
      "#f7931a",
      "#627eea",
      "#3ab03e",
      "#b5b5b5",
      "#8dc351",
      "#2775ca",
      "#e84142",
      "#2b61d1",
      "#16c784",
      "#ea3943",
    ],
  },
  vibrant: {
    primary: "hsl(262, 80%, 50%)",
    primaryForeground: "hsl(0, 0%, 100%)",
    secondary: "hsl(180, 70%, 50%)",
    secondaryForeground: "hsl(0, 0%, 100%)",
    accent: "hsl(328, 85%, 70%)",
    accentForeground: "hsl(0, 0%, 100%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(262, 50%, 30%)",
    muted: "hsl(262, 30%, 95%)",
    mutedForeground: "hsl(262, 30%, 50%)",
    border: "hsl(262, 30%, 90%)",
    input: "hsl(262, 30%, 90%)",
    ring: "hsl(262, 80%, 50%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(262, 50%, 30%)",
    destructive: "hsl(350, 90%, 60%)",
    destructiveForeground: "hsl(0, 0%, 100%)",
    success: "hsl(160, 80%, 40%)",
    successForeground: "hsl(0, 0%, 100%)",
    warning: "hsl(40, 90%, 60%)",
    warningForeground: "hsl(0, 0%, 100%)",
    info: "hsl(200, 90%, 60%)",
    infoForeground: "hsl(0, 0%, 100%)",
    chartColors: [
      "#7c3aed",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#c026d3",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
      "#f43f5e",
    ],
  },
}

export type ColorTheme = keyof typeof colorThemes

// Create context
type ThemeContextType = {
  theme: ColorTheme
  setTheme: (theme: ColorTheme) => void
  colors: typeof colorThemes.money
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "money",
  setTheme: () => {},
  colors: colorThemes.money,
})

export const useThemeColors = () => useContext(ThemeContext)

// Provider component
export function ThemeColorsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>("money")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("colorTheme") as ColorTheme | null
    if (savedTheme && colorThemes[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("colorTheme", theme)

      // Apply CSS variables to :root
      const root = document.documentElement
      const themeColors = colorThemes[theme]

      Object.entries(themeColors).forEach(([key, value]) => {
        if (key !== "chartColors") {
          root.style.setProperty(`--${key}`, value)
        }
      })
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme,
    colors: colorThemes[theme],
  }

  // Only render children once mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

