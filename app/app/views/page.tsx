"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewViewModal } from "@/components/app/new-view-modal"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell } from "@/components/app/page-shell"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { statusLabels, statusColors } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/date-utils"
import {
  LayoutGrid,
  Inbox,
  UserX,
  Code,
  Palette,
  Calculator,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const viewIcons: Record<string, React.ElementType> = {
  inbox: Inbox,
  "user-x": UserX,
  code: Code,
  palette: Palette,
  calculator: Calculator,
  users: Users,
  "alert-circle": AlertCircle,
  "check-circle": CheckCircle,
}

export default function ViewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { requests, views, users, teams, setSelectedRequestId, deleteView, hasPermission } = useApp()
  const [isNewViewOpen, setIsNewViewOpen] = useState(false)
  const [editingViewId, setEditingViewId] = useState<string | null>(null)
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null)
  const canManageViews = hasPermission("manageViews")

  const activeViewId = searchParams.get("view") || views[0]?.id
  const activeView = views.find((view) => view.id === activeViewId) || views[0]
  const editingView = views.find((view) => view.id === editingViewId) ?? null
  const deletingView = views.find((view) => view.id === deletingViewId) ?? null

  const filterRequests = (viewId: string) => {
    const view = views.find((item) => item.id === viewId)
    if (!view) return requests

    return requests.filter((request) => {
      if (view.filter.status && !view.filter.status.includes(request.status)) return false
      if (view.filter.priority && !view.filter.priority.includes(request.priority)) return false
      if (view.filter.teamId && request.teamId !== view.filter.teamId) return false
      if (view.filter.assigneeId === "unassigned" && request.assigneeId !== null) return false
      return true
    })
  }

  const filteredRequests = activeView ? filterRequests(activeView.id) : []

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId)
    router.push("/app")
  }

  const handleDeleteView = async () => {
    if (!deletingView) return

    const nextView = views.find((view) => view.id !== deletingView.id) ?? null
    await deleteView(deletingView.id)
    setDeletingViewId(null)

    if (activeViewId === deletingView.id) {
      router.push(nextView ? `/app/views?view=${nextView.id}` : "/app/views")
    }
  }

  if (views.length === 0) {
    return (
      <PageShell>
        <NewViewModal open={isNewViewOpen} onOpenChange={setIsNewViewOpen} />

        <PageHeader
          title="Setores"
          description="Coleções salvas para acompanhar listas filtradas por setor ou critério."
          badge={<HeaderCountBadge>0 salvas</HeaderCountBadge>}
          actions={
            canManageViews ? (
              <Button variant="outline" onClick={() => setIsNewViewOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="ml-2">Novo setor</span>
              </Button>
            ) : null
          }
        />

        <EmptyPanel
          icon={<LayoutGrid className="h-6 w-6 text-muted-foreground" />}
          title="Nenhum setor salvo"
          description="Crie o primeiro setor para organizar seus requests."
        />
      </PageShell>
    )
  }

  if (!activeView) {
    return null
  }

  return (
    <PageShell>
      <NewViewModal open={isNewViewOpen} onOpenChange={setIsNewViewOpen} />
      <NewViewModal open={Boolean(editingView)} onOpenChange={(open) => !open && setEditingViewId(null)} initialView={editingView} />
      <AlertDialog open={Boolean(deletingView)} onOpenChange={(open) => !open && setDeletingViewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingView
                ? `O setor "${deletingView.name}" será removido da workspace.`
                : "Este setor será removido da workspace."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeleteView()} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Setores"
        description="Coleções salvas para acompanhar listas filtradas por setor ou critério."
        badge={<HeaderCountBadge>{views.length} salvas</HeaderCountBadge>}
        actions={
          canManageViews ? (
            <Button variant="outline" onClick={() => setIsNewViewOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">Novo setor</span>
            </Button>
          ) : null
        }
      />

      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <aside className="w-72 shrink-0 border-r border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-medium text-foreground">Coleções</p>
            <p className="mt-1 text-xs text-muted-foreground">Setores salvos para triagem rápida.</p>
          </div>

          <div className="h-[calc(100dvh-220px)] overflow-auto p-2">
            <ul className="space-y-1">
              {views.map((view) => {
                const Icon = viewIcons[view.icon] || LayoutGrid
                const count = filterRequests(view.id).length
                const isActive = activeViewId === view.id

                return (
                  <li key={view.id} className="group">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5",
                        isActive ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <button
                        onClick={() => router.push(`/app/views?view=${view.id}`)}
                        className={cn(
                          "flex min-w-0 flex-1 items-center justify-between gap-3 text-left text-sm",
                          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-md border",
                              isActive ? "border-border bg-background text-foreground" : "border-border/70 bg-background text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </span>
                          <span className="truncate font-medium">{view.name}</span>
                        </span>
                        <span className="min-w-6 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
                      </button>

                      {canManageViews && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Ações do setor"
                              className={cn("h-8 w-8 rounded-md", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingViewId(view.id)}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingViewId(view.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <header className="shrink-0 border-b border-border bg-background px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-balance text-lg font-semibold">{activeView.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {filteredRequests.length} requests neste setor
                </p>
              </div>
              {canManageViews ? (
                <Button variant="outline" size="sm" onClick={() => setEditingViewId(activeView.id)}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </Button>
              ) : null}
            </div>
          </header>

          <div className="min-h-0 overflow-auto">
            {filteredRequests.length === 0 ? (
              <EmptyPanel
                icon={<LayoutGrid className="h-6 w-6 text-muted-foreground" />}
                title="Nenhum request"
                description="Não há requests neste setor no momento."
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredRequests.map((request) => {
                  const requester = users.find((user) => user.id === request.requesterId)
                  const assignee = request.assigneeId ? users.find((user) => user.id === request.assigneeId) : null
                  const team = teams.find((item) => item.id === request.teamId)

                  return (
                    <button
                      key={request.id}
                      onClick={() => handleRequestClick(request.id)}
                      className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40"
                    >
                      <div
                        className={cn(
                          "h-12 w-1.5 shrink-0 rounded-full",
                          request.priority === "urgent"
                            ? "bg-destructive"
                            : request.priority === "high"
                              ? "bg-orange-500"
                              : request.priority === "medium"
                                ? "bg-blue-500"
                                : "bg-muted-foreground"
                        )}
                        aria-hidden="true"
                      />

                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={requester?.avatar} alt={requester?.name ?? "Usuário"} />
                        <AvatarFallback>{requester?.name?.[0]}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(statusColors[request.status], "border-0 text-xs")}>
                            {statusLabels[request.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">
                            #{request.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-medium">{request.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="truncate">{requester?.name}</span>
                          {team?.name ? <span className="truncate">{team.name}</span> : null}
                          {assignee ? <span className="truncate">resp. {assignee.name}</span> : null}
                        </div>
                      </div>

                      <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground md:flex">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatDistanceToNow(request.updatedAt)}
                      </span>

                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
