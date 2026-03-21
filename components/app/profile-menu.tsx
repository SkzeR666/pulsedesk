"use client"

import Link from "next/link"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { User, LogOut, Sun, ChevronUp, HelpCircle } from "lucide-react"

interface ProfileMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
  } | null
  compact?: boolean
}

export function ProfileMenu({ user, compact = false }: ProfileMenuProps) {
  const { signOut } = useApp()

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="group flex h-14 w-full items-center justify-center rounded-xl px-2 hover:bg-sidebar-accent transition-all duration-200">
                <Avatar className="h-11 w-11 ring-2 ring-sidebar-accent shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-sm font-medium">{user.name[0]}</AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {user.name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <button className="group flex items-center gap-3 w-full p-2 rounded-xl hover:bg-sidebar-accent transition-all duration-200">
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-accent shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-sm font-medium">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:text-foreground group-data-[state=open]:rotate-180" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-64 rounded-xl p-2 mb-2">
        <div className="px-2 py-3 border-b border-border mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-muted">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link href="/app/settings" className="flex items-center gap-3 p-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Meu perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link href="/app/settings/appearance" className="flex items-center gap-3 p-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <span>Aparencia</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-xl cursor-pointer">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span>Ajuda e suporte</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          onClick={() => void signOut()}
        >
          <div className="flex items-center gap-3 p-2">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
