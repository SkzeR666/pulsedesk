"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/lib/app-context"
import {
  Bell,
  Building2,
  CreditCard,
  Palette,
  Settings,
  Shield,
  Users,
} from "lucide-react"

const settingsNav = [
  { icon: Settings, label: "Geral", href: "/app/settings" },
  { icon: Users, label: "Membros", href: "/app/settings/members", permission: "manageMembers" as const },
  { icon: Building2, label: "Setores", href: "/app/settings/teams", permission: "manageMembers" as const },
  { icon: Shield, label: "Permissoes", href: "/app/settings/permissions", permission: "manageSettings" as const },
  { icon: Palette, label: "Aparencia", href: "/app/settings/appearance" },
  { icon: Bell, label: "Notificacoes", href: "/app/settings/notifications" },
  { icon: CreditCard, label: "Faturamento", href: "/app/settings/billing", permission: "manageSettings" as const },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { hasPermission } = useApp()
  const visibleSettingsNav = settingsNav.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <div className="flex h-full">
      <div className="w-60 shrink-0 border-r border-border bg-muted/20 p-4">
        <div className="mb-5 px-3">
          <h2 className="text-base font-semibold">Configuracoes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ajustes da conta, operacao e workspace.</p>
        </div>
        <nav className="space-y-1">
          {visibleSettingsNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app/settings" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-background font-medium text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
