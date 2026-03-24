'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Inbox,
    CheckSquare,
    LayoutGrid,
    BookOpen,
    MessageSquareMore,
    Settings,
    Plus,
    Search,
    LogOut
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const navItems = [
    { icon: Inbox, label: "Inbox", href: "/app" },
    { icon: CheckSquare, label: "Minhas tarefas", href: "/app/my-tasks" },
    { icon: LayoutGrid, label: "Setores", href: "/app/views" },
    { icon: MessageSquareMore, label: "Chat geral", href: "/app/chat" },
    { icon: BookOpen, label: "Artigos internos", href: "/app/knowledge" },
    { icon: Settings, label: "Configurações", href: "/app/settings" },
]

export function NeoDock() {
    const pathname = usePathname()
    const { setIsCommandBarOpen, setIsNewRequestOpen, signOut } = useApp()

    return (
        <TooltipProvider>
            <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden">
                <div className="flex items-center gap-1 rounded-xl border border-border bg-background/95 p-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 pr-2 mr-1 border-r border-border/60">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsNewRequestOpen(true)}
                                    aria-label="Novo request"
                                    className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Novo Request</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsCommandBarOpen(true)}
                                    aria-label="Buscar"
                                    className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Buscar (⌘K)</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))

                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        <Link href={item.href}>
                                            <div
                                                className={`relative inline-flex size-10 items-center justify-center rounded-lg transition-colors ${
                                                    isActive
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                                aria-label={item.label}
                                            >
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </nav>

                    {/* Exit */}
                    <div className="pl-2 ml-1 border-l border-border/60">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => void signOut()}
                                    aria-label="Sair"
                                    className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Sair</TooltipContent>
                        </Tooltip>
                    </div>

                </div>
            </div>
        </TooltipProvider>
    )
}
