"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import {
  Inbox,
  CheckSquare,
  LayoutGrid,
  BookOpen,
  MessageSquareMore,
  Settings,
  Plus,
  Search,
  Command,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher"
import { ProfileMenu } from "@/components/app/profile-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type NavItem = { icon: React.ElementType; label: string; href: string; adminOnly?: boolean }

const navItems: NavItem[] = [
  { icon: Inbox, label: "Inbox", href: "/app" },
  { icon: CheckSquare, label: "Minhas tarefas", href: "/app/my-tasks" },
  { icon: LayoutGrid, label: "Setores", href: "/app/views" },
  { icon: MessageSquareMore, label: "Chat geral", href: "/app/chat" },
  { icon: BookOpen, label: "Artigos internos", href: "/app/knowledge" },
  { icon: Settings, label: "Configurações", href: "/app/settings" },
  { icon: ShieldCheck, label: "Plataforma", href: "/platform", adminOnly: true },
]

function RailLink({
  href,
  label,
  icon: Icon,
  active,
  expanded,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  expanded: boolean
}) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          aria-label={label}
          className={cn(
            "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm",
            "outline-none focus-visible:ring-1 focus-visible:ring-ring",
            active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          )}
        >
          <Icon className="size-[18px] shrink-0" aria-hidden="true" />
          <span
            className={cn(
              "min-w-0 truncate",
              expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0"
            )}
          >
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      {!expanded ? <TooltipContent side="right">{label}</TooltipContent> : null}
    </Tooltip>
  )
}

export function OperationalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, platformAdmin, setIsCommandBarOpen, setIsNewRequestOpen } = useApp()
  const [expanded, setExpanded] = useState(false)

  const visibleNav = useMemo(
    () => navItems.filter((item) => (item.adminOnly ? Boolean(platformAdmin) : true)),
    [platformAdmin]
  )

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Edge reveal zone (not a classic sidebar; it only exists when summoned) */}
      <div
        className="fixed inset-y-0 left-0 z-40 w-5"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-40 flex flex-col",
          "rounded-lg border border-border bg-background/95",
          "shadow-sm",
          expanded ? "w-[248px]" : "w-14"
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className={cn("flex items-center gap-2 p-2.5", expanded ? "justify-between" : "justify-center")}>
          <div className={cn("min-w-0", expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0")}>
            <WorkspaceSwitcher compact={true} variant="sidebar" />
          </div>
          <div className={cn("flex items-center gap-1", expanded ? "opacity-100" : "opacity-100")}>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Buscar"
                  onClick={() => setIsCommandBarOpen(true)}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-md",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  <Search className="size-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Buscar (⌘K)</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Criar request"
                  onClick={() => setIsNewRequestOpen(true)}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Novo request</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={() => setIsCommandBarOpen(true)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm",
              "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              "outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
          >
            <Command className="size-[18px] shrink-0" aria-hidden="true" />
            <span className={cn("min-w-0 truncate", expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0")}>
              Comandos e navegação
            </span>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-auto px-2 pb-2">
          <div className="space-y-1">
            {visibleNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
              return (
                <RailLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                  expanded={expanded}
                />
              )
            })}
          </div>
        </nav>

        <div className="border-t border-border p-2">
          <div className={cn(expanded ? "opacity-100" : "opacity-100")}>
            <ProfileMenu user={user} compact={!expanded} variant="sidebar" />
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-6">
        {children}
      </div>
    </div>
  )
}

