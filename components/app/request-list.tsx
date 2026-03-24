"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApp } from "@/lib/app-context"
import type { Request } from "@/lib/types"
import { statusLabels, statusColors } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/date-utils"
import { Inbox, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface RequestListProps {
  requests: Request[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RequestList({ requests, selectedId, onSelect }: RequestListProps) {
  const { users, teams } = useApp()

  if (requests.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhum request encontrado</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Tente ajustar os filtros</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      {requests.map((request, index) => {
        const requester = users.find((user) => user.id === request.requesterId)
        const team = teams.find((item) => item.id === request.teamId)
        const isSelected = selectedId === request.id
        const hasAttachments = request.attachments && request.attachments.length > 0

        return (
          <button
            key={request.id}
            onClick={() => onSelect(request.id)}
            className={cn(
              "group relative flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors",
              isSelected ? "bg-accent/40" : "hover:bg-muted/40"
            )}
          >
            <div
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full",
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

            {/* Requester avatar */}
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={requester?.avatar} alt={requester?.name ?? "Usuário"} />
              <AvatarFallback className="text-xs font-medium">{requester?.name?.[0]}</AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {request.title}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                  {formatDistanceToNow(request.updatedAt)}
                </span>
              </div>
              
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {request.description}
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
                    statusColors[request.status]
                  )}
                >
                  {statusLabels[request.status]}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {requester?.name}
                </span>
                {hasAttachments && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Paperclip className="h-3 w-3" aria-hidden="true" />
                    {request.attachments?.length}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
