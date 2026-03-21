"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { applyAppearanceToDocument } from "@/components/app/appearance-sync"
import { useApp } from "@/lib/app-context"
import { Monitor, Moon, Sun, Check } from "lucide-react"

const themes = [
  { id: "system", label: "Sistema", icon: Monitor, description: "Segue as configuracoes do sistema" },
  { id: "light", label: "Claro", icon: Sun, description: "Tema claro padrao" },
  { id: "dark", label: "Escuro", icon: Moon, description: "Tema escuro para baixa luminosidade" },
]

const accentColors = [
  { id: "blue", color: "bg-blue-500", label: "Azul" },
  { id: "purple", color: "bg-purple-500", label: "Roxo" },
  { id: "green", color: "bg-emerald-500", label: "Verde" },
  { id: "orange", color: "bg-orange-500", label: "Laranja" },
  { id: "pink", color: "bg-pink-500", label: "Rosa" },
]

export default function AppearancePage() {
  const { preferences, savePreferences } = useApp()
  const { resolvedTheme, setTheme: setActiveTheme } = useTheme()
  const [theme, setTheme] = useState(preferences.theme)
  const [accentColor, setAccentColor] = useState(preferences.accentColor)
  const [sidebarDensity, setSidebarDensity] = useState(preferences.sidebarDensity)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTheme(preferences.theme)
    setAccentColor(preferences.accentColor)
    setSidebarDensity(preferences.sidebarDensity)
  }, [preferences])

  useEffect(() => {
    setActiveTheme(theme)
    applyAppearanceToDocument({ accentColor, sidebarDensity })
  }, [accentColor, setActiveTheme, sidebarDensity, theme])

  useEffect(() => {
    return () => {
      setActiveTheme(preferences.theme)
      applyAppearanceToDocument({
        accentColor: preferences.accentColor,
        sidebarDensity: preferences.sidebarDensity,
      })
    }
  }, [preferences.accentColor, preferences.sidebarDensity, preferences.theme, setActiveTheme])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await savePreferences({ theme, accentColor, sidebarDensity })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    theme !== preferences.theme ||
    accentColor !== preferences.accentColor ||
    sidebarDensity !== preferences.sidebarDensity

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Aparencia</h1>
        <p className="text-muted-foreground mt-1">Personalize a aparencia do PulseDesk.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tema ativo agora: {theme === "system" ? `Sistema (${resolvedTheme === "dark" ? "escuro" : "claro"})` : theme === "dark" ? "Escuro" : "Claro"}
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Tema</h2>
        <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
        {themes.map((item) => (
          <Label
            key={item.id}
            htmlFor={item.id}
            className={`flex flex-col items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
              theme === item.id
                ? "border-primary bg-accent/20 text-foreground shadow-[0_0_0_1px_var(--color-primary)]"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
              <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
              <div className={`rounded-full p-3 ${theme === item.id ? "bg-background" : "bg-secondary"}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Cor de destaque</h2>
        <div className="flex items-center gap-3">
          {accentColors.map((color) => (
            <button
              type="button"
              key={color.id}
              onClick={() => setAccentColor(color.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${color.color} transition-transform ${
                accentColor === color.id
                  ? "scale-110 ring-2 ring-[color:var(--primary)] ring-offset-2 ring-offset-background"
                  : "hover:scale-105"
              }`}
              title={color.label}
            >
              {accentColor === color.id && <Check className="h-5 w-5 text-white" />}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Densidade da sidebar</h2>
        <RadioGroup value={sidebarDensity} onValueChange={setSidebarDensity} className="space-y-2">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="compact" id="compact" />
            <Label htmlFor="compact" className="cursor-pointer">
              <span className="font-medium">Compacta</span>
              <p className="text-xs text-muted-foreground">Menos espacamento, mais itens visiveis</p>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="comfortable" id="comfortable" />
            <Label htmlFor="comfortable" className="cursor-pointer">
              <span className="font-medium">Confortavel</span>
              <p className="text-xs text-muted-foreground">Espacamento padrao</p>
            </Label>
          </div>
        </RadioGroup>
      </section>

      <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
        {isSaving ? <Spinner className="h-4 w-4" /> : hasChanges ? "Salvar preferencias" : "Preferencias atualizadas"}
      </Button>
    </div>
  )
}
