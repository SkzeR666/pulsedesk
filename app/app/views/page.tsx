"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewViewModal } from "@/components/app/new-view-modal"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell } from "@/components/app/page-shell"
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
          title="Views"
          description="Colecoes salvas para acompanhar listas filtradas com menos atrito."
          badge={<HeaderCountBadge>0 salvas</HeaderCountBadge>}
          actions={
            canManageViews ? (
              <Button variant="outline" onClick={() => setIsNewViewOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="ml-2">Nova view</span>
              </Button>
            ) : null
          }
        />

        <EmptyPanel
          icon={<LayoutGrid className="h-6 w-6 text-muted-foreground" />}
          title="Nenhuma view salva"
          description="Crie a primeira view para organizar seus requests."
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
            <AlertDialogTitle>Excluir view</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingView
                ? `A view "${deletingView.name}" sera removida da workspace.`
                : "Essa view sera removida da workspace."}
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
        title="Views"
        description="Colecoes salvas para acompanhar listas filtradas com menos atrito."
        badge={<HeaderCountBadge>{views.length} salvas</HeaderCountBadge>}
        actions={
          canManageViews ? (
            <Button variant="outline" onClick={() => setIsNewViewOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">Nova view</span>
            </Button>
          ) : null
        }
      />

      <div className="flex min-h-0 flex-1">
      <div className="w-72 border-r border-border overflow-auto shrink-0 bg-background">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-medium text-foreground">Colecoes</p>
          <p className="mt-1 text-xs text-muted-foreground">Views salvas para triagem rapida.</p>
        </div>

        <div className="space-y-1 px-3 py-3">
          {views.map((view) => {
            const Icon = viewIcons[view.icon] || LayoutGrid
            const count = filterRequests(view.id).length
            const isActive = activeViewId === view.id

            return (
              <div
                key={view.id}
                className={`group flex items-center gap-2 border px-2 py-1.5 transition-colors ${
                  isActive
                    ? "border-border bg-muted/40"
                    : "border-transparent hover:border-border/70 hover:bg-muted/20"
                }`}
              >
                <button
                  onClick={() => router.push(`/app/views?view=${view.id}`)}
                  className={`flex min-w-0 flex-1 items-center justify-between gap-3 px-1 py-1 text-sm ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center border ${
                      isActive ? "border-border bg-background text-foreground" : "border-border/70 bg-muted/10 text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                    <span className="truncate font-medium">{view.name}</span>
                  </span>
                  <span className={`min-w-6 text-right text-xs tabular-nums ${isActive ? "text-foreground/80" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>

                {canManageViews && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-md ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingViewId(view.id)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingViewId(view.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{activeView.name}</h2>
            <Badge variant="secondary" className="rounded-md">{filteredRequests.length} requests</Badge>
          </div>
          {canManageViews && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingViewId(activeView.id)}>
                <Pencil className="h-4 w-4" />
                <span className="ml-2">Editar</span>
              </Button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto">
          {filteredRequests.length === 0 ? (
            <EmptyPanel
              icon={<LayoutGrid className="h-6 w-6 text-muted-foreground" />}
              title="Nenhum request"
              description="Nao ha requests nesta view no momento."
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => {
                const requester = users.find((user) => user.id === request.requesterId)
                const assignee = request.assigneeId
                  ? users.find((user) => user.id === request.assigneeId)
                  : null
                const team = teams.find((item) => item.id === request.teamId)

                return (
                  <button
                    key={request.id}
                    onClick={() => handleRequestClick(request.id)}
                    className="flex items-center gap-4 w-full px-6 py-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={`w-1.5 h-12 rounded-full shrink-0 ${
                        request.priority === "urgent"
                          ? "bg-red-500"
                          : request.priority === "high"
                            ? "bg-orange-400"
                            : request.priority === "medium"
                              ? "bg-blue-400"
                              : "bg-zinc-300"
                      }`}
                    />

                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={requester?.avatar} />
                      <AvatarFallback>{requester?.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${statusColors[request.status]} border-0 text-xs`}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{request.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{requester?.name}</span>
                        <span>{team?.name}</span>
                        {assignee && <span>{assignee.name}</span>}
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(request.updatedAt)}
                    </span>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </PageShell>
  )
}
