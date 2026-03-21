"use client"

import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Settings } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/app-context"

interface WorkspaceSwitcherProps {
  compact?: boolean
}

export function WorkspaceSwitcher({ compact = false }: WorkspaceSwitcherProps) {
  const { workspace } = useApp()

  if (!workspace) {
    return null
  }

  const workspaceMark = workspace.logoUrl ? (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl bg-card ${
        compact ? "relative h-full w-full p-0" : "relative h-9 w-9 p-0"
      }`}
    >
      <Image
        src={workspace.logoUrl}
        alt={workspace.name}
        fill
        sizes={compact ? "88px" : "36px"}
        className={compact ? "object-cover" : "object-contain p-2"}
      />
    </div>
  ) : (
    <div
      className={`flex items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background shadow-sm ring-1 ring-foreground/10 transition-transform group-hover:scale-105 ${
        compact ? "h-full w-full" : "h-9 w-9"
      }`}
    >
      {workspace.name[0]?.toUpperCase() ?? "W"}
    </div>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="group flex h-14 w-full items-center justify-center overflow-hidden rounded-xl hover:bg-sidebar-accent transition-all duration-200">
                {workspaceMark}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {workspace.name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <button className="group flex items-center gap-3 w-full p-2 rounded-xl hover:bg-sidebar-accent transition-all duration-200">
            {workspaceMark}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{workspace.name}</p>
              <p className="text-xs text-muted-foreground">Workspace ativo</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:text-foreground group-data-[state=open]:rotate-180" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Workspace
        </div>
        <div className="px-2 py-2">
          <p className="text-sm font-medium truncate">{workspace.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{workspace.description || "Sem descricao"}</p>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link href="/app/settings" className="flex items-center gap-3 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm">Configuracoes do workspace</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
