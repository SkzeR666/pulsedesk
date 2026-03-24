"use client"

import { useMemo, useState } from "react"
import { useApp } from "@/lib/app-context"
import { RequestList } from "@/components/app/request-list"
import { RequestDetail } from "@/components/app/request-detail"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import type { Request } from "@/lib/types"
import { cn } from "@/lib/utils"

type StatusFilter = Request["status"] | "all"
type PriorityFilter = Request["priority"] | "all"

export default function InboxPage() {
  const { requests, selectedRequestId, setSelectedRequestId } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [showDetail, setShowDetail] = useState(false)

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [priorityFilter, requests, searchQuery, statusFilter])

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) ?? null

  const handleSelect = (id: string) => {
    setSelectedRequestId(id)
    setShowDetail(true)
  }

  return (
    <div className="flex h-dvh min-w-0">
      {/* Left: list */}
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {([
                { value: "all", label: "Todos" },
                { value: "open", label: "Abertos" },
                { value: "in_progress", label: "Em andamento" },
              ] as const).map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={statusFilter === item.value ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "px-2.5",
                    statusFilter === item.value && "bg-muted text-foreground"
                  )}
                  onClick={() => setStatusFilter(item.value as StatusFilter)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          <RequestList requests={filteredRequests} selectedId={selectedRequestId} onSelect={handleSelect} />
        </div>
      </section>

      {/* Right: detail */}
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

      {/* Mobile detail overlay (preserva comportamento atual de abrir/fechar) */}
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
