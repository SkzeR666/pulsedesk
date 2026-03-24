"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/lib/app-context"
import {
  Bell,
  Building2,
  Palette,
  Settings,
  Shield,
  Users,
} from "lucide-react"

const settingsNav = [
  { icon: Settings, label: "Geral", href: "/app/settings", category: "Conta" },
  { icon: Palette, label: "Aparencia", href: "/app/settings/appearance", category: "Conta" },
  { icon: Bell, label: "Notificacoes", href: "/app/settings/notifications", category: "Conta" },
  { icon: Users, label: "Membros", href: "/app/settings/members", permission: "manageMembers" as const, category: "Workspace" },
  { icon: Building2, label: "Setores", href: "/app/settings/teams", permission: "manageMembers" as const, category: "Workspace" },
  { icon: Shield, label: "Permissoes", href: "/app/settings/permissions", permission: "manageSettings" as const, category: "Workspace" },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { hasPermission } = useApp()
  const visibleSettingsNav = settingsNav.filter((item) => !item.permission || hasPermission(item.permission))
  const groups = [
    { title: "Conta", items: visibleSettingsNav.filter((item) => item.category === "Conta") },
    { title: "Workspace", items: visibleSettingsNav.filter((item) => item.category === "Workspace") },
  ]

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-border bg-background p-4">
        <div className="mb-5 px-3">
          <h2 className="text-base font-semibold">Configuracoes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ajustes da conta e operacao do workspace.</p>
        </div>
        <nav className="space-y-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{group.title}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/app/settings" && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
