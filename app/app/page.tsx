"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { RequestList } from "@/components/app/request-list"
import { RequestDetail } from "@/components/app/request-detail"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NewViewModal } from "@/components/app/new-view-modal"
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
import { Search, X, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import type { Request } from "@/lib/types"
import { cn } from "@/lib/utils"

type StatusFilter = Request["status"] | "all"
type ScopeFilter = "all" | "mine" | "waiting" | "recent"

export default function InboxPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    requests,
    user,
    views,
    selectedRequestId,
    setSelectedRequestId,
    deleteView,
    hasPermission,
  } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(
    (searchParams.get("scope") as ScopeFilter | null) ?? "all"
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [showDetail, setShowDetail] = useState(false)
  const [isNewViewOpen, setIsNewViewOpen] = useState(false)
  const [editingViewId, setEditingViewId] = useState<string | null>(null)
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null)
  const canManageViews = hasPermission("manageViews")

  const activeViewId = searchParams.get("view") || views[0]?.id
  const activeView = views.find((view) => view.id === activeViewId) || views[0]
  const editingView = views.find((view) => view.id === editingViewId) ?? null
  const deletingView = views.find((view) => view.id === deletingViewId) ?? null

  const filterByView = (request: Request) => {
    if (!activeView) return true

    if (activeView.filter.status && !activeView.filter.status.includes(request.status)) return false
    if (activeView.filter.priority && !activeView.filter.priority.includes(request.priority)) return false
    if (activeView.filter.teamId && request.teamId !== activeView.filter.teamId) return false
    if (activeView.filter.assigneeId === "unassigned" && request.assigneeId !== null) return false
    if (
      activeView.filter.assigneeId &&
      activeView.filter.assigneeId !== "unassigned" &&
      request.assigneeId !== activeView.filter.assigneeId
    ) {
      return false
    }

    return true
  }

  const filteredRequests = useMemo(() => {
    const scopedRequests = requests.filter((request) => {
      if (scopeFilter === "mine") {
        return request.assigneeId === user?.id && request.status !== "resolved" && request.status !== "closed"
      }

      if (scopeFilter === "waiting") {
        return request.requesterId === user?.id && request.status === "waiting"
      }

      return true
    })

    const baseRequests =
      scopeFilter === "recent"
        ? [...scopedRequests]
            .filter((request) => request.assigneeId === user?.id || request.requesterId === user?.id)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10)
        : scopedRequests

    return baseRequests.filter((request) => {
      const matchesView = filterByView(request)
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      return matchesView && matchesSearch && matchesStatus
    })
  }, [requests, scopeFilter, searchQuery, statusFilter, user?.id, views, activeView])

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null

  useEffect(() => {
    const nextScope = (searchParams.get("scope") as ScopeFilter | null) ?? "all"
    setScopeFilter(nextScope)
  }, [searchParams])

  const handleSelect = (id: string) => {
    setSelectedRequestId(id)
    setShowDetail(true)
  }

  const getViewCount = (viewId: string) => {
    const view = views.find((item) => item.id === viewId)
    if (!view) return requests.length

    return requests.filter((request) => {
      if (view.filter.status && !view.filter.status.includes(request.status)) return false
      if (view.filter.priority && !view.filter.priority.includes(request.priority)) return false
      if (view.filter.teamId && request.teamId !== view.filter.teamId) return false
      if (view.filter.assigneeId === "unassigned" && request.assigneeId !== null) return false
      if (
        view.filter.assigneeId &&
        view.filter.assigneeId !== "unassigned" &&
        request.assigneeId !== view.filter.assigneeId
      ) {
        return false
      }
      return true
    }).length
  }

  const handleDeleteView = async () => {
    if (!deletingView) return

    const nextView = views.find((view) => view.id !== deletingView.id) ?? null
    await deleteView(deletingView.id)
    setDeletingViewId(null)

    if (activeViewId === deletingView.id) {
      router.push(nextView ? `/app?view=${nextView.id}` : "/app")
    }
  }

  const handleScopeChange = (value: ScopeFilter) => {
    setScopeFilter(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("scope")
    } else {
      params.set("scope", value)
    }
    router.push(params.toString() ? `/app?${params.toString()}` : "/app")
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    handleScopeChange("all")
  }

  return (
    <div className="flex h-dvh min-w-0">
      <NewViewModal open={isNewViewOpen} onOpenChange={setIsNewViewOpen} />
      <NewViewModal
        open={Boolean(editingView)}
        onOpenChange={(open) => !open && setEditingViewId(null)}
        initialView={editingView}
      />
      <AlertDialog open={Boolean(deletingView)} onOpenChange={(open) => !open && setDeletingViewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingView
                ? `O setor "${deletingView.name}" sera removido da workspace.`
                : "Este setor sera removido da workspace."}
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

      <section className="flex w-full flex-col border-r border-border/60 md:w-[420px]">
        <header className="shrink-0 bg-background px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-balance text-lg font-semibold tracking-tight">Inbox</h1>
              <p className="mt-0.5 text-pretty text-sm text-muted-foreground">
                {filteredRequests.length} requests
              </p>
            </div>
            <Badge variant="secondary" className="tabular-nums">
              {requests.length}
            </Badge>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {views.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {views.map((view) => {
                  const isActive = activeViewId === view.id
                  const count = getViewCount(view.id)

                  return (
                    <div
                      key={view.id}
                      className={cn(
                        "group flex shrink-0 items-center rounded-xl border px-2 py-1",
                        isActive
                          ? "border-border bg-background shadow-sm"
                          : "border-transparent bg-transparent hover:border-border/70 hover:bg-muted/30"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => router.push(`/app?view=${view.id}`)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm"
                      >
                        <span
                          className={cn(
                            "whitespace-nowrap",
                            isActive ? "font-medium text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {view.name}
                        </span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                          {count}
                        </span>
                      </button>

                      {canManageViews ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Acoes do setor ${view.name}`}
                              className={cn(
                                "ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground",
                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
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
                      ) : null}
                    </div>
                  )
                })}

                {canManageViews ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewViewOpen(true)}
                    className="shrink-0 rounded-xl border border-dashed"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Novo
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por titulo ou descricao..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Filtros
                </p>
                {scopeFilter !== "all" || statusFilter !== "all" || searchQuery ? (
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
                    Limpar
                  </Button>
                ) : null}
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Escopo</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: "all", label: "Todos" },
                      { value: "mine", label: "Meus" },
                      { value: "waiting", label: "Aguardando" },
                      { value: "recent", label: "Recentes" },
                    ] as const).map((item) => (
                      <Button
                        key={item.value}
                        type="button"
                        variant={scopeFilter === item.value ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-8 rounded-lg px-3",
                          scopeFilter === item.value
                            ? "bg-muted text-foreground"
                            : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/50 hover:text-foreground"
                        )}
                        onClick={() => handleScopeChange(item.value)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: "all", label: "Todos" },
                      { value: "open", label: "Abertos" },
                      { value: "in_progress", label: "Andamento" },
                      { value: "waiting", label: "Aguardando" },
                    ] as const).map((item) => (
                      <Button
                        key={item.value}
                        type="button"
                        variant={statusFilter === item.value ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-8 rounded-lg px-3",
                          statusFilter === item.value
                            ? "bg-muted text-foreground"
                            : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/50 hover:text-foreground"
                        )}
                        onClick={() => setStatusFilter(item.value as StatusFilter)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          <RequestList requests={filteredRequests} selectedId={selectedRequestId} onSelect={handleSelect} />
        </div>
      </section>

      <section className="hidden min-w-0 flex-1 md:flex">
        {selectedRequest ? (
          <div className="min-w-0 flex-1">
            <RequestDetail request={selectedRequest} />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <h2 className="text-balance text-base font-semibold">Selecione um request</h2>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                Abra um item na lista para ver detalhes e responder.
              </p>
            </div>
          </div>
        )}
      </section>

      {selectedRequest && showDetail ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-background">
            <button
              type="button"
              aria-label="Fechar detalhes"
              onClick={() => setShowDetail(false)}
              className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full overflow-hidden">
              <RequestDetail request={selectedRequest} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
