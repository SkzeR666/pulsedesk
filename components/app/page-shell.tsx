"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col bg-background">{children}</div>
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-6 border-b border-border px-6 py-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  )
}

export function HeaderCountBadge({ children }: { children: ReactNode }) {
  return (
    <Badge variant="secondary" className="h-6 rounded-md px-2.5 text-xs font-medium">
      {children}
    </Badge>
  )
}

export function PageToolbar({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/20 px-6 py-3">{children}</div>
}

export function SegmentedTabs({
  items,
  active,
  onChange,
}: {
  items: Array<{ value: string; label: string; count?: number; icon?: ReactNode }>
  active: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = active === item.value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-background text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span className={`rounded-md px-1.5 py-0.5 text-xs ${isActive ? "bg-muted" : "bg-muted/60"}`}>
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted/40">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
