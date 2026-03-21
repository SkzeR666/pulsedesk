"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { RequestList } from "@/components/app/request-list"
import { RequestDetail } from "@/components/app/request-detail"
import { RequestEmptyState } from "@/components/app/request-empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EmptyPanel,
  HeaderCountBadge,
  PageHeader,
  PageShell,
  PageToolbar,
  SegmentedTabs,
} from "@/components/app/page-shell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, SlidersHorizontal, Inbox, Clock, CheckCircle, Loader2, Sparkles } from "lucide-react"
import type { Request } from "@/lib/types"

type StatusFilter = Request["status"] | "all"
type PriorityFilter = Request["priority"] | "all"

export default function InboxPage() {
  const { requests, selectedRequestId, setSelectedRequestId } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Get selected request
  const selectedRequest = filteredRequests.find((r) => r.id === selectedRequestId) ?? null

  // Keep the detail panel in sync with the active filtered list.
  useEffect(() => {
    if (filteredRequests.length === 0) {
      if (selectedRequestId) {
        setSelectedRequestId(null)
      }
      return
    }

    const stillVisible = filteredRequests.some((request) => request.id === selectedRequestId)
    if (!selectedRequestId || !stillVisible) {
      setSelectedRequestId(filteredRequests[0].id)
    }
  }, [selectedRequestId, filteredRequests, setSelectedRequestId])

  const openCount = requests.filter((r) => r.status === "open").length
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length
  const waitingCount = requests.filter((r) => r.status === "waiting").length

  const statusTabs = [
    { value: "all", label: "Todos", count: requests.length, icon: Inbox },
    { value: "open", label: "Abertos", count: openCount, icon: Sparkles },
    { value: "in_progress", label: "Em Progresso", count: inProgressCount, icon: Loader2 },
    { value: "waiting", label: "Aguardando", count: waitingCount, icon: Clock },
  ]

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all"

  return (
    <PageShell>
      <PageHeader
        title="Inbox"
        description="Gerencie todos os requests da operacao em um fluxo unico."
        badge={<HeaderCountBadge>{filteredRequests.length} visiveis</HeaderCountBadge>}
        actions={
          <>
          <div className={`relative transition-all duration-300 ${isSearchFocused ? "w-80" : "w-64"}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? "text-foreground" : "text-muted-foreground"}`} />
            <Input
              placeholder="Buscar requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 h-10 rounded-xl border-muted bg-muted/50 focus:bg-background transition-all"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-10 rounded-xl transition-all ${
                  hasActiveFilters
                    ? "border-primary/50 bg-accent/20 text-foreground hover:bg-accent/30"
                    : ""
                }`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 border-primary/20 bg-background/80 px-1.5 text-foreground">
                    {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prioridade
              </div>
              {[
                { value: "all", label: "Todas" },
                { value: "urgent", label: "Urgente" },
                { value: "high", label: "Alta" },
                { value: "medium", label: "Media" },
                { value: "low", label: "Baixa" },
              ].map((item) => (
                <DropdownMenuCheckboxItem
                  key={item.value}
                  checked={priorityFilter === item.value}
                  onCheckedChange={() => setPriorityFilter(item.value as PriorityFilter)}
                  className="rounded-lg"
                >
                  {item.label}
                </DropdownMenuCheckboxItem>
              ))}
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => { setStatusFilter("all"); setPriorityFilter("all") }}
                    className="rounded-lg text-muted-foreground"
                  >
                    Limpar filtros
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        }
      />

      <PageToolbar>
        <SegmentedTabs
          items={statusTabs.map((tab) => ({
            value: tab.value,
            label: tab.label,
            count: tab.count,
            icon: <tab.icon className={`h-4 w-4 ${tab.value === "in_progress" && statusFilter === tab.value ? "animate-spin" : ""}`} />,
          }))}
          active={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
        />
      </PageToolbar>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-[420px] border-r border-border overflow-hidden flex flex-col shrink-0 bg-muted/20">
          <RequestList
            requests={filteredRequests}
            selectedId={selectedRequestId}
            onSelect={setSelectedRequestId}
          />
        </div>

        {/* Request Detail */}
        <div className="flex-1 overflow-hidden bg-background">
          {selectedRequest ? (
            <RequestDetail request={selectedRequest} />
          ) : (
            (filteredRequests.length === 0 ? (
              <EmptyPanel
                icon={<Inbox className="h-6 w-6 text-muted-foreground" />}
                title="Nenhum request encontrado"
                description="Ajuste busca ou filtros para encontrar o que voce precisa."
              />
            ) : (
              <RequestEmptyState />
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}
