"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Inbox,
  CheckSquare,
  LayoutGrid,
  BookOpen,
  MessageSquareMore,
  Settings,
  ShieldCheck,
  Plus,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { ProfileMenu } from "./profile-menu"

const workNavItems = [
  { icon: Inbox, label: "Inbox", href: "/app" },
  { icon: CheckSquare, label: "Minhas tarefas", href: "/app/my-tasks" },
  { icon: LayoutGrid, label: "Setores", href: "/app/views" },
]

const collabNavItems = [{ icon: MessageSquareMore, label: "Chat geral", href: "/app/chat" }]

const knowledgeNavItems = [{ icon: BookOpen, label: "Artigos internos", href: "/app/knowledge" }]

const systemNavItems = [{ icon: Settings, label: "Configurações", href: "/app/settings" }]

function NavRailItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: typeof Inbox
  label: string
  isActive: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          aria-label={label}
          className={`group flex h-14 w-full items-center justify-center rounded-xl px-2 transition-all duration-200 ${
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, platformAdmin, preferences, setIsCommandBarOpen, setIsNewRequestOpen, requests } = useApp()
  const compact = preferences.sidebarDensity === "compact"

  const openRequestsCount = requests.filter((r) => r.status === "open" || r.status === "in_progress").length
  const myTasksCount = requests.filter(
    (r) => r.assigneeId === user?.id && r.status !== "resolved" && r.status !== "closed"
  ).length

  const getCounts = (href: string) => {
    if (href === "/app") return openRequestsCount
    if (href === "/app/my-tasks") return myTasksCount
    return undefined
  }

  const sections = [
    { title: "Trabalho", items: workNavItems },
    { title: "Comunicação", items: collabNavItems },
    { title: "Conhecimento", items: knowledgeNavItems },
    { title: "Sistema", items: systemNavItems },
  ] as const

  return (
    <aside
      className={`${compact ? "w-[88px]" : "w-60"} flex shrink-0 flex-col border-r border-border bg-sidebar transition-all`}
    >
      <div className={compact ? "px-3 pt-3 pb-3" : "p-4"}>
        <WorkspaceSwitcher compact={compact} />
      </div>

      <div className={compact ? "px-3 pb-3" : "px-4 pb-2"}>
        {compact ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCommandBarOpen(true)}
                aria-label="Buscar"
                className="group flex h-14 w-full items-center justify-center rounded-xl bg-muted/50 px-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Buscar
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setIsCommandBarOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
          >
            <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="hidden h-5 select-none items-center gap-1 rounded-md border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        )}
      </div>

      <div className={compact ? "px-3 pb-5" : "px-4 pb-4"}>
        {compact ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsNewRequestOpen(true)}
                aria-label="Novo request"
                className="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-2 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Novo request
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setIsNewRequestOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Novo Request</span>
          </button>
        )}
      </div>

      <nav className={`flex-1 ${compact ? "px-3" : "px-4"} overflow-auto`}>
        <div className={compact ? "space-y-6" : "space-y-5"}>
          {sections.map((section) => (
            <div key={section.title}>
              {!compact ? (
                <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{section.title}</p>
              ) : null}
              <ul className={compact ? "space-y-3" : "space-y-1"}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
                  const count = getCounts(item.href)
                  return (
                    <li key={item.href}>
                      {compact ? (
                        <NavRailItem href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
                      ) : (
                        <Link
                          href={item.href}
                          className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                          </span>
                          {count !== undefined && count > 0 ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                                isActive ? "border border-border bg-background/80 text-foreground" : "bg-muted"
                              }`}
                            >
                              {count}
                            </span>
                          ) : null}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          {platformAdmin ? (
            <div>
              {!compact ? (
                <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">Admin</p>
              ) : null}
              <ul className={compact ? "space-y-3" : "space-y-1"}>
                <li>
                  {compact ? (
                    <NavRailItem
                      href="/platform"
                      icon={ShieldCheck}
                      label="Plataforma"
                      isActive={pathname.startsWith("/platform")}
                    />
                  ) : (
                    <Link
                      href="/platform"
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        pathname.startsWith("/platform")
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Plataforma
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </nav>

      <div className={`${compact ? "px-3 pb-4" : "px-4 pb-4"} flex flex-col gap-5`}>
        <div className="border-t border-border pt-4">
          <ProfileMenu user={user} compact={compact} />
        </div>
      </div>
    </aside>
  )
}
