"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useApp } from "@/lib/app-context"
import {
  Inbox,
  CheckSquare,
  LayoutGrid,
  BookOpen,
  MessageSquareMore,
  Settings,
  Plus,
  FileText,
  Users,
} from "lucide-react"

const pages = [
  { icon: Inbox, label: "Inbox", href: "/app" },
  { icon: CheckSquare, label: "Minhas Tarefas", href: "/app/my-tasks" },
  { icon: LayoutGrid, label: "Views", href: "/app/views" },
  { icon: MessageSquareMore, label: "Chat geral", href: "/app/chat" },
  { icon: BookOpen, label: "Artigos internos", href: "/app/knowledge" },
  { icon: Settings, label: "Configuracoes", href: "/app/settings" },
  { icon: Users, label: "Membros", href: "/app/settings/members" },
]

export function CommandBar() {
  const router = useRouter()
  const {
    isCommandBarOpen,
    setIsCommandBarOpen,
    setIsNewRequestOpen,
    setSelectedRequestId,
    requests,
    articles,
    views,
    users,
  } = useApp()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!isCommandBarOpen) {
      setSearch("")
    }
  }, [isCommandBarOpen])

  const handleSelect = (action: () => void) => {
    action()
    setIsCommandBarOpen(false)
  }

  const filteredRequests = useMemo(
    () =>
      requests
        .filter((request) => request.title.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5),
    [requests, search]
  )

  const filteredArticles = useMemo(
    () =>
      articles
        .filter((article) => article.title.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 3),
    [articles, search]
  )

  const filteredViews = useMemo(
    () => views.filter((view) => view.name.toLowerCase().includes(search.toLowerCase())),
    [search, views]
  )

  return (
    <CommandDialog open={isCommandBarOpen} onOpenChange={setIsCommandBarOpen}>
      <CommandInput placeholder="Buscar requests, paginas, artigos..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Acoes rapidas">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                setIsNewRequestOpen(true)
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar novo request
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {search && filteredRequests.length > 0 && (
          <>
            <CommandGroup heading="Requests">
              {filteredRequests.map((request) => {
                const requester = users.find((user) => user.id === request.requesterId)
                return (
                  <CommandItem
                    key={request.id}
                    onSelect={() =>
                      handleSelect(() => {
                        setSelectedRequestId(request.id)
                        router.push("/app")
                      })
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{request.title}</p>
                      <p className="text-xs text-muted-foreground">por {requester?.name}</p>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {search && filteredArticles.length > 0 && (
          <>
            <CommandGroup heading="Artigos internos">
              {filteredArticles.map((article) => (
                <CommandItem
                  key={article.id}
                  onSelect={() =>
                    handleSelect(() => {
                      router.push(`/app/knowledge/${article.id}`)
                    })
                  }
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.category}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {search && filteredViews.length > 0 && (
          <>
            <CommandGroup heading="Views">
              {filteredViews.map((view) => (
                <CommandItem
                  key={view.id}
                  onSelect={() =>
                    handleSelect(() => {
                      router.push(`/app/views?view=${view.id}`)
                    })
                  }
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {view.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Paginas">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() =>
                handleSelect(() => {
                  router.push(page.href)
                })
              }
            >
              <page.icon className="mr-2 h-4 w-4" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
