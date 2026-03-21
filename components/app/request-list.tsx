"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApp } from "@/lib/app-context"
import type { Request } from "@/lib/types"
import { statusLabels, statusColors } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/date-utils"
import { Inbox, MessageSquare, Paperclip } from "lucide-react"

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
    <div className="flex-1 overflow-auto">
      {requests.map((request, index) => {
        const requester = users.find((user) => user.id === request.requesterId)
        const team = teams.find((item) => item.id === request.teamId)
        const isSelected = selectedId === request.id
        const hasAttachments = request.attachments && request.attachments.length > 0

        return (
          <button
            key={request.id}
            onClick={() => onSelect(request.id)}
            style={{ animationDelay: `${index * 30}ms` }}
            className={`group relative flex items-start gap-3 w-full p-4 text-left border-b border-border/50 transition-all duration-200 animate-fade-in opacity-0 ${
              isSelected 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/80"
            }`}
          >
            {/* Selection indicator */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-all duration-200 ${
              isSelected ? "bg-foreground" : "bg-transparent group-hover:bg-muted-foreground/30"
            }`} />

            {/* Priority indicator */}
            <div
              className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ring-4 transition-all ${
                request.priority === "urgent"
                  ? "bg-red-500 ring-red-500/20"
                  : request.priority === "high"
                    ? "bg-orange-500 ring-orange-500/20"
                    : request.priority === "medium"
                      ? "bg-blue-500 ring-blue-500/20"
                      : "bg-zinc-400 ring-zinc-400/20"
              }`}
            />

            {/* Requester avatar */}
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background shadow-sm">
              <AvatarImage src={requester?.avatar} alt={requester?.name} />
              <AvatarFallback className="text-xs font-medium">{requester?.name?.[0]}</AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium truncate transition-colors ${isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                  {request.title}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                  {formatDistanceToNow(request.updatedAt)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {request.description}
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${statusColors[request.status]}`}>
                  {statusLabels[request.status]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {requester?.name}
                </span>
                {hasAttachments && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
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
