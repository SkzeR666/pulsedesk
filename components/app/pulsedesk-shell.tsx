"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
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
  Command,
} from "lucide-react"
import { Button, Chip, Input, Kbd, Tooltip } from "@heroui/react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher"
import { ProfileMenu } from "@/components/app/profile-menu"

type DockItem = { href: string; label: string; icon: React.ElementType; adminOnly?: boolean }

const dockItems: DockItem[] = [
  { href: "/app", label: "Inbox", icon: Inbox },
  { href: "/app/my-tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/app/views", label: "Setores", icon: LayoutGrid },
  { href: "/app/knowledge", label: "Artigos", icon: BookOpen },
  { href: "/app/chat", label: "Chat", icon: MessageSquareMore },
  { href: "/app/settings", label: "Config", icon: Settings },
  { href: "/platform", label: "Plataforma", icon: ShieldCheck, adminOnly: true },
]

function DockLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
}) {
  return (
    <Tooltip content={label} placement="top" delay={200}>
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-md border border-border bg-background",
          "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
          "outline-none focus-visible:ring-1 focus-visible:ring-ring",
          active && "bg-foreground text-background border-foreground"
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </Link>
    </Tooltip>
  )
}

export function PulseDeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { platformAdmin, setIsCommandBarOpen, setIsNewRequestOpen, user } = useApp()

  const visibleDockItems = useMemo(
    () => dockItems.filter((item) => (item.adminOnly ? Boolean(platformAdmin) : true)),
    [platformAdmin]
  )

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Top command surface (not navigation) */}
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="shrink-0">
            <WorkspaceSwitcher variant="topbar" />
          </div>

          <div className="min-w-0 flex-1">
            <Input
              size="sm"
              aria-label="Comandos e busca"
              placeholder="Comandos, tickets, artigos…"
              startContent={<Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              endContent={
                <div className="hidden items-center gap-2 md:flex">
                  <Chip radius="sm" variant="bordered" className="h-7 px-2 text-xs text-muted-foreground">
                    <Command className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    <Kbd keys={["command"]}>K</Kbd>
                  </Chip>
                </div>
              }
              onFocus={() => setIsCommandBarOpen(true)}
              onClick={() => setIsCommandBarOpen(true)}
              classNames={{
                inputWrapper: "bg-card border border-border shadow-none",
              }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="h-4 w-4" aria-hidden="true" />}
              onPress={() => setIsNewRequestOpen(true)}
            >
              Novo
            </Button>
            <ProfileMenu variant="topbar" user={user} />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-6">{children}</div>

      {/* Bottom dock: discovered navigation */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[min(520px,calc(100vw-24px))] -translate-x-1/2">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/95 p-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Tooltip content="Novo request" placement="top" delay={200}>
              <button
                type="button"
                aria-label="Novo request"
                onClick={() => setIsNewRequestOpen(true)}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground",
                  "outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
              >
                <Plus className="size-5" aria-hidden="true" />
              </button>
            </Tooltip>
            <Tooltip content="Comandos (⌘K)" placement="top" delay={200}>
              <button
                type="button"
                aria-label="Comandos"
                onClick={() => setIsCommandBarOpen(true)}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-md border border-border bg-background",
                  "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                  "outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
              >
                <Command className="size-5" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            {visibleDockItems.slice(0, 5).map((item) => {
              const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
              return <DockLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} />
            })}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {visibleDockItems.slice(5).map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href)
              return <DockLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

