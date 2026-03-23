"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { Sparkles, Send, Users, AlertTriangle } from "lucide-react"

const priorities = [
  { value: "low", label: "Baixa", color: "bg-zinc-100 text-zinc-600" },
  { value: "medium", label: "Media", color: "bg-blue-100 text-blue-600" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-600" },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-600" },
] as const

export function NewRequestModal() {
  const { isNewRequestOpen, setIsNewRequestOpen, addRequest, user, teams } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [teamId, setTeamId] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const isWorkspaceAdmin = user?.role === "admin"
  const inheritedTeam = user?.teamId ? teams.find((team) => team.id === user.teamId) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)

    await addRequest({
      title,
      description,
      status: "open",
      priority: isWorkspaceAdmin ? priority : "medium",
      requesterId: user.id,
      assigneeId: null,
      teamId: isWorkspaceAdmin ? teamId : user.teamId ?? "",
      tags: [],
    })

    setTitle("")
    setDescription("")
    setTeamId("")
    setPriority("medium")
    setIsLoading(false)
    setIsNewRequestOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle("")
      setDescription("")
      setTeamId("")
      setPriority("medium")
    }
    setIsNewRequestOpen(open)
  }

  return (
    <Dialog open={isNewRequestOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[680px]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Novo request</DialogTitle>
              <DialogDescription>
                {isWorkspaceAdmin
                  ? "Abra um request com setor, prioridade e contexto inicial."
                  : "Abra um request rapido com titulo e o que aconteceu."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Titulo</Label>
            <Input
              id="title"
              placeholder="Descreva brevemente o request..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Descricao</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais sobre o request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          {isWorkspaceAdmin ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Equipe
                  </Label>
                  <Select value={teamId} onValueChange={setTeamId} required>
                    <SelectTrigger className="rounded-lg h-11 w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} className="rounded-lg">
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    Prioridade
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                    <SelectTrigger className="rounded-lg h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="rounded-lg">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${p.color.split(" ")[0].replace("100", "500")}`} />
                            {p.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">Setor</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {inheritedTeam?.name ?? user?.team ?? "Nao vinculado"}
              </p>
            </div>
          )}
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewRequestOpen(false)}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title || (!isWorkspaceAdmin && !user?.teamId) || (isWorkspaceAdmin && !teamId)}
              className="rounded-lg min-w-[140px]"
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Criar Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
