"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { statusLabels, statusColors, priorityLabels } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/date-utils"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell, PageToolbar, SegmentedTabs } from "@/components/app/page-shell"
import { CheckSquare, ChevronRight, Clock } from "lucide-react"

type TabValue = "assigned" | "waiting" | "recent"

export default function MyTasksPage() {
  const router = useRouter()
  const { requests, user, users, teams, setSelectedRequestId } = useApp()
  const [activeTab, setActiveTab] = useState<TabValue>("assigned")

  if (!user) {
    return null
  }

  const assignedToMe = requests.filter(
    (request) =>
      request.assigneeId === user.id && request.status !== "resolved" && request.status !== "closed"
  )

  const waitingOnMe = requests.filter(
    (request) => request.requesterId === user.id && request.status === "waiting"
  )

  const recentlyUpdated = requests
    .filter((request) => request.assigneeId === user.id || request.requesterId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

  const tabs = [
    { value: "assigned" as const, label: "Atribuidos a mim", count: assignedToMe.length },
    { value: "waiting" as const, label: "Aguardando resposta", count: waitingOnMe.length },
    { value: "recent" as const, label: "Atualizados recentemente", count: recentlyUpdated.length },
  ]

  const displayedRequests =
    activeTab === "assigned" ? assignedToMe : activeTab === "waiting" ? waitingOnMe : recentlyUpdated

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId)
    router.push("/app")
  }

  return (
    <PageShell>
      <PageHeader
        title="Minhas tarefas"
        description="Veja o que esta com voce, o que depende de resposta e o que mudou recentemente."
        badge={<HeaderCountBadge>{displayedRequests.length}</HeaderCountBadge>}
      />

      <PageToolbar>
        <SegmentedTabs
          items={tabs.map((tab) => ({ value: tab.value, label: tab.label, count: tab.count }))}
          active={activeTab}
          onChange={(value) => setActiveTab(value as TabValue)}
        />
      </PageToolbar>

      <div className="flex-1 overflow-auto">
        {displayedRequests.length === 0 ? (
          <EmptyPanel
            icon={<CheckSquare className="h-6 w-6 text-muted-foreground" />}
            title="Nenhuma tarefa"
            description={
              activeTab === "assigned"
                ? "Voce nao tem requests atribuidos no momento."
                : activeTab === "waiting"
                  ? "Nenhum request aguardando sua resposta."
                  : "Nenhum request recente."
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {displayedRequests.map((request) => {
              const requester = users.find((item) => item.id === request.requesterId)
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">#{request.id.slice(0, 8)}</span>
                      <Badge className={`${statusColors[request.status]} border-0 text-xs`}>
                        {statusLabels[request.status]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {priorityLabels[request.priority]}
                      </Badge>
                    </div>
                    <p className="font-medium truncate">{request.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={requester?.avatar} />
                          <AvatarFallback className="text-[8px]">{requester?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        {requester?.name}
                      </span>
                      <span>{team?.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(request.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
