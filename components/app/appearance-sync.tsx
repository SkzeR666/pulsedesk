"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useApp } from "@/lib/app-context"

export const accentVariableMap: Record<string, Record<string, string>> = {
  blue: {
    "--primary": "oklch(0.58 0.2 259)",
    "--accent": "oklch(0.58 0.2 259)",
    "--ring": "oklch(0.58 0.2 259)",
    "--sidebar-primary": "oklch(0.58 0.2 259)",
  },
  purple: {
    "--primary": "oklch(0.6 0.23 305)",
    "--accent": "oklch(0.6 0.23 305)",
    "--ring": "oklch(0.6 0.23 305)",
    "--sidebar-primary": "oklch(0.6 0.23 305)",
  },
  green: {
    "--primary": "oklch(0.65 0.2 150)",
    "--accent": "oklch(0.65 0.2 150)",
    "--ring": "oklch(0.65 0.2 150)",
    "--sidebar-primary": "oklch(0.65 0.2 150)",
  },
  orange: {
    "--primary": "oklch(0.72 0.19 55)",
    "--accent": "oklch(0.72 0.19 55)",
    "--ring": "oklch(0.72 0.19 55)",
    "--sidebar-primary": "oklch(0.72 0.19 55)",
  },
  pink: {
    "--primary": "oklch(0.66 0.23 356)",
    "--accent": "oklch(0.66 0.23 356)",
    "--ring": "oklch(0.66 0.23 356)",
    "--sidebar-primary": "oklch(0.66 0.23 356)",
  },
}

export function applyAppearanceToDocument({
  accentColor,
  sidebarDensity,
}: {
  accentColor: string
  sidebarDensity: string
}) {
  const root = document.documentElement
  root.dataset.accentColor = accentColor
  root.dataset.sidebarDensity = sidebarDensity

  const accentVariables = accentVariableMap[accentColor] ?? accentVariableMap.blue
  for (const [key, value] of Object.entries(accentVariables)) {
    root.style.setProperty(key, value)
  }
}

export function AppearanceSync() {
  const { preferences } = useApp()
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(preferences.theme)
  }, [preferences.theme, setTheme])

  useEffect(() => {
    applyAppearanceToDocument({
      accentColor: preferences.accentColor,
      sidebarDensity: preferences.sidebarDensity,
    })
  }, [preferences.accentColor, preferences.sidebarDensity])

  return null
}
