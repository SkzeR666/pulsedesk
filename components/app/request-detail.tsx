"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
  Send,
  RotateCcw,
  Calendar,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RequestDetailProps {
  request: Request
}

interface RequestSummary {
  summary: string
  suggestedReplies: string[]
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
  const [summary, setSummary] = useState<RequestSummary | null>(null)
  const [summaryError, setSummaryError] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

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

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setSummaryError("")

    try {
      const response = await fetch(`/api/requests/${request.id}/summary`, { method: "POST" })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel resumir este ticket.")
      }

      setSummary(data?.summary ?? null)
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Nao foi possivel resumir este ticket.")
    } finally {
      setIsSummarizing(false)
    }
  }

  useEffect(() => {
    setSummary(null)
    setSummaryError("")
    setIsSummarizing(false)
    setShowSuggestions(true)
  }, [request.id])

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 bg-background px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono text-[11px] tabular-nums">
                #{request.id.slice(0, 8)}
              </Badge>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
                  statusColors[request.status]
                )}
              >
                {statusLabels[request.status]}
              </span>
            </div>
            <h1 className="mt-2 text-balance text-xl font-semibold tracking-tight md:text-2xl">
              {request.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={requester?.avatar} alt={requester?.name ?? "Usuário"} />
                  <AvatarFallback>{requester?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="truncate">{requester?.name}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">{formatDate(request.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!isResolved ? (
              <Button type="button" onClick={handleResolve}>
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Resolver
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={handleReopen}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Reabrir
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main column */}
            <div className="min-w-0 space-y-8">
              <section>
                <h2 className="text-sm font-semibold">Descrição</h2>
                <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
                  {request.description || "Nenhum dado capturado no briefing."}
                </p>
              </section>

              <Separator />

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                      <h2 className="text-sm font-semibold">Resumo IA</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gere um resumo rápido do contexto e sugestões de resposta.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSummarize()}
                    disabled={isSummarizing}
                    className="shrink-0"
                  >
                    {isSummarizing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {summary ? "Atualizar" : "Gerar"}
                  </Button>
                </div>

                {summaryError ? (
                  <div className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {summaryError}
                  </div>
                ) : null}

                {summary ? (
                  <div className="mt-4 space-y-4">
                    <div className="text-sm leading-6 text-foreground/90">{summary.summary}</div>
                    {showSuggestions && summary.suggestedReplies?.length ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Sugestões</p>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setShowSuggestions(false)}>
                            Ocultar
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          {summary.suggestedReplies.map((text, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setComment(text)}
                              className="rounded-md bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <Separator />

              <section>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Atividade</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{requestComments.length} comentários</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {requestComments.map((c) => {
                    const author = users.find((u) => u.id === c.authorId)
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={author?.avatar} alt={author?.name ?? "Usuário"} />
                          <AvatarFallback>{author?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-medium">{author?.name}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDistanceToNow(c.createdAt)}
                            </span>
                          </div>
                          <div className="mt-2 rounded-md bg-muted/30 px-3 py-2">
                            <ArticleContent content={c.content} className="text-sm text-foreground/90" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar column */}
            <aside className="space-y-4">
              <div className="rounded-lg bg-muted/20 p-4">
                <h2 className="text-sm font-semibold">Campos</h2>
                <div className="mt-3 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <Select value={request.status} onValueChange={handleStatusChange} disabled={!canChangeStatus}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Prioridade</p>
                    <Select value={request.priority} onValueChange={handlePriorityChange} disabled={!canChangePriority}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {priorityLabels[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Responsável</p>
                    <Select
                      value={request.assigneeId ?? "unassigned"}
                      onValueChange={handleAssigneeChange}
                      disabled={!canChangeAssignee}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sem responsável</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 md:px-6">
          <div className="flex items-end gap-2 rounded-lg bg-muted/20 p-2">
            <Textarea
              placeholder="Escreva uma resposta..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[44px] resize-none border-0 bg-transparent px-2 py-2 focus-visible:ring-0"
            />
            <div className="flex items-center gap-1 pb-1 pr-1">
              <MediaUploadButton
                onUploaded={() => {}}
                label=""
                variant="ghost"
                className="h-9 w-9 px-0"
              />
              <Button
                type="button"
                onClick={handleSubmitComment}
                disabled={!comment.trim() || isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
