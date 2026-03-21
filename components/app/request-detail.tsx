"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { MediaUploadButton } from "@/components/app/media-upload-button"
import { ArticleContent } from "@/components/app/article-content"
import type { Request } from "@/lib/types"
import { statusLabels, statusColors, priorityLabels } from "@/lib/constants"
import { formatDate, formatDistanceToNow } from "@/lib/date-utils"
import {
  CheckCircle2,
  Clock,
  Tag,
  User,
  MessageSquare,
  Send,
  MoreHorizontal,
  RotateCcw,
  XCircle,
  Paperclip,
  Hash,
  Users,
  Calendar,
  ArrowUpRight,
} from "lucide-react"

interface RequestDetailProps {
  request: Request
}

const statuses: Request["status"][] = ["open", "in_progress", "waiting", "resolved", "closed"]
const priorities: Request["priority"][] = ["low", "medium", "high", "urgent"]

const priorityColors: Record<Request["priority"], string> = {
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
}

export function RequestDetail({ request }: RequestDetailProps) {
  const { updateRequest, addComment, user, users, teams, comments, hasPermission } = useApp()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return null
  }

  const isWorkspaceAdmin = user.role === "admin"
  const canUpdateRequests =
    hasPermission("updateRequests") &&
    (isWorkspaceAdmin || request.requesterId === user.id || request.assigneeId === user.id)
  const isResolved = request.status === "resolved" || request.status === "closed"
  const canChangeStatus = canUpdateRequests && (isWorkspaceAdmin || !isResolved)
  const canChangeAssignee = hasPermission("updateRequests") && isWorkspaceAdmin
  const canChangePriority = hasPermission("updateRequests") && isWorkspaceAdmin

  const requester = users.find((item) => item.id === request.requesterId)
  const assignee = request.assigneeId ? users.find((item) => item.id === request.assigneeId) : null
  const team = teams.find((item) => item.id === request.teamId)
  const requestComments = comments.filter((item) => item.requestId === request.id)

  const handleStatusChange = (status: Request["status"]) => {
    void updateRequest(request.id, { status })
  }

  const handlePriorityChange = (priority: Request["priority"]) => {
    void updateRequest(request.id, { priority })
  }

  const handleAssigneeChange = (assigneeId: string) => {
    void updateRequest(request.id, { assigneeId: assigneeId === "unassigned" ? null : assigneeId })
  }

  const handleResolve = () => {
    void updateRequest(request.id, { status: "resolved" })
  }

  const handleReopen = () => {
    void updateRequest(request.id, { status: "open" })
  }

  const handleSubmitComment = async () => {
    if (!comment.trim()) return
    setIsSubmitting(true)
    try {
      await addComment(request.id, comment.trim())
      setComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border shrink-0 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
                  <Hash className="h-3 w-3" />
                  {request.id}
                </span>
                <Badge className={`${statusColors[request.status]} border-0 shadow-sm`}>
                  {statusLabels[request.status]}
                </Badge>
                <Badge className={`${priorityColors[request.priority]} border-0`}>
                  {priorityLabels[request.priority]}
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold text-balance tracking-tight">{request.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isResolved ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReopen}
                  className="rounded-xl"
                  disabled={!isWorkspaceAdmin}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reabrir
                </Button>
              ) : (
                <Button size="sm" onClick={handleResolve} className="rounded-xl shadow-sm" disabled={!canChangeStatus}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolver
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="rounded-xl">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("closed")}
                    className="rounded-lg"
                    disabled={!canChangeStatus}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Fechar request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-8 py-6 border-b border-border shrink-0">
          <p className="text-muted-foreground leading-relaxed">
            {request.description || "Sem descricao."}
          </p>
          
          {/* Attachments Preview */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {request.attachments.length} anexo(s)
              </span>
              {request.attachments.map((attachment, i) => (
                <button
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs hover:bg-muted/80 transition-colors"
                >
                  {attachment}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline / Comments */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Atividade</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {requestComments.length}
            </span>
          </div>
          
          {requestComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum comentario ainda</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Seja o primeiro a comentar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requestComments.map((c, index) => {
                const author = users.find((item) => item.id === c.authorId)
                return (
                  <div 
                    key={c.id} 
                    className="flex gap-4 animate-fade-in opacity-0"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                        <AvatarImage src={author?.avatar} alt={author?.name} />
                        <AvatarFallback className="text-xs">{author?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      {index < requestComments.length - 1 && (
                        <div className="absolute left-1/2 top-10 bottom-0 w-px bg-border -translate-x-1/2 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{author?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(c.createdAt)}
                        </span>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3 text-sm">
                        <ArticleContent content={c.content} className="space-y-3 text-sm leading-6" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-8 py-4 border-t border-border shrink-0 bg-muted/30">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Escreva um comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="resize-none rounded-xl border-muted bg-background"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <MediaUploadButton
                    onUploaded={({ url, filename }) =>
                      setComment((current) => `${current.trim()}${current.trim() ? "\n\n" : ""}![${filename}](${url})`)
                    }
                    label="Imagem"
                    variant="ghost"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmitting}
                  className="rounded-xl shadow-sm"
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-border p-6 overflow-auto shrink-0 bg-muted/20">
        <div className="space-y-6">
          {/* Status */}
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "0ms" }}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <Select value={request.status} onValueChange={handleStatusChange} disabled={!canChangeStatus}>
              <SelectTrigger className="mt-2 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="rounded-lg">
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requester */}
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "50ms" }}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Solicitante
            </label>
            <div className="flex items-center gap-3 mt-2 p-2 rounded-xl bg-background border border-border">
              <Avatar className="h-8 w-8">
                <AvatarImage src={requester?.avatar} alt={requester?.name} />
                <AvatarFallback className="text-xs">{requester?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{requester?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{requester?.email}</p>
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Responsavel
            </label>
            <Select
              value={request.assigneeId || "unassigned"}
              onValueChange={handleAssigneeChange}
              disabled={!canChangeAssignee}
            >
              <SelectTrigger className="mt-2 rounded-xl">
                <SelectValue placeholder="Nao atribuido" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="unassigned" className="rounded-lg">Nao atribuido</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="rounded-lg">
                    <span className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback className="text-[10px]">{u.name[0]}</AvatarFallback>
                      </Avatar>
                      {u.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Prioridade
            </label>
            <Select value={request.priority} onValueChange={handlePriorityChange} disabled={!canChangePriority}>
              <SelectTrigger className="mt-2 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {priorities.map((p) => (
                  <SelectItem key={p} value={p} className="rounded-lg">
                    {priorityLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Equipe
            </label>
            <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-background border border-border">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{team?.name}</span>
            </div>
          </div>

          {/* Tags */}
          {request.tags.length > 0 && (
            <div className="animate-fade-in opacity-0" style={{ animationDelay: "250ms" }}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tags
              </label>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {request.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-medium"
                  >
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="animate-fade-in opacity-0 pt-4 border-t border-border space-y-3" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Criado
              </span>
              <span className="text-xs font-medium">
                {formatDate(request.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Atualizado
              </span>
              <span className="text-xs font-medium">
                {formatDate(request.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
