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
import { WorkspaceSwitcher } from "./workspace-switcher"
import { ProfileMenu } from "./profile-menu"

const mainNavItems = [
  { icon: Inbox, label: "Inbox", href: "/app" },
  { icon: CheckSquare, label: "Minhas Tarefas", href: "/app/my-tasks" },
  { icon: LayoutGrid, label: "Views", href: "/app/views" },
  { icon: MessageSquareMore, label: "Chat geral", href: "/app/chat" },
  { icon: BookOpen, label: "Artigos internos", href: "/app/knowledge" },
]

const bottomNavItems = [
  { icon: Settings, label: "Configuracoes", href: "/app/settings" },
]

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
          className={`group flex h-14 w-full items-center justify-center rounded-xl px-2 transition-all duration-200 ${
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          }`}
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
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
                className="group flex h-14 w-full items-center justify-center rounded-xl bg-muted/50 px-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
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
                className="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-2 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Plus className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Novo request
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setIsNewRequestOpen(true)}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Novo Request</span>
          </button>
        )}
      </div>

      <nav className={`flex-1 ${compact ? "px-3" : "px-4"}`}>
        <ul className={compact ? "space-y-3" : "space-y-1"}>
          {mainNavItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
            const count = getCounts(item.href)

            return (
              <li key={item.href} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in opacity-0">
                {compact ? (
                  <NavRailItem href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
                      {item.label}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
                          isActive ? "border border-border bg-background/80 text-foreground" : "bg-muted"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={`${compact ? "px-3 pb-4" : "px-4 pb-4"} flex flex-col gap-5`}>
        <ul className={compact ? "space-y-3" : "space-y-1"}>
          {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                {compact ? (
                  <NavRailItem href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
          {platformAdmin && (
            <li>
              {compact ? (
                <NavRailItem
                  href="/platform"
                  icon={ShieldCheck}
                  label="Admin Area"
                  isActive={pathname.startsWith("/platform")}
                />
              ) : (
                <Link
                  href="/platform"
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    pathname.startsWith("/platform")
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Area
                </Link>
              )}
            </li>
          )}
        </ul>

        <div className="border-t border-border pt-4">
          <ProfileMenu user={user} compact={compact} />
        </div>
      </div>
    </aside>
  )
}
