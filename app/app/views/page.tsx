"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewViewModal } from "@/components/app/new-view-modal"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell } from "@/components/app/page-shell"
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
  const { requests, views, users, teams, setSelectedRequestId } = useApp()
  const [isNewViewOpen, setIsNewViewOpen] = useState(false)

  const activeViewId = searchParams.get("view") || views[0]?.id
  const activeView = views.find((view) => view.id === activeViewId) || views[0]

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

  if (!activeView) {
    return null
  }

  return (
    <PageShell>
      <NewViewModal open={isNewViewOpen} onOpenChange={setIsNewViewOpen} />

      <PageHeader
        title="Views"
        description="Colecoes salvas para acompanhar listas filtradas com menos atrito."
        badge={<HeaderCountBadge>{views.length} salvas</HeaderCountBadge>}
        actions={
          <Button variant="outline" onClick={() => setIsNewViewOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Nova view</span>
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1">
      <div className="w-64 border-r border-border p-4 overflow-auto shrink-0 bg-muted/20">
        <div className="space-y-1.5">
          {views.map((view) => {
            const Icon = viewIcons[view.icon] || LayoutGrid
            const count = filterRequests(view.id).length

            return (
              <button
                key={view.id}
                onClick={() => router.push(`/app/views?view=${view.id}`)}
                className={`flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activeViewId === view.id
                    ? "bg-background font-medium ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {view.name}
                </span>
                <span className="text-xs opacity-70">{count}</span>
              </button>
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
