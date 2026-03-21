"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react"

export default function TeamsPage() {
  const { teams, requests, createTeam, updateTeam, deleteTeam, hasPermission } = useApp()
  const canManageTeams = hasPermission("manageSettings")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busyTeamId, setBusyTeamId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const requestCountByTeam = useMemo(
    () =>
      requests.reduce<Record<string, number>>((acc, request) => {
        acc[request.teamId] = (acc[request.teamId] ?? 0) + 1
        return acc
      }, {}),
    [requests]
  )

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canManageTeams || !name.trim()) return

    setIsSubmitting(true)
    setError("")

    try {
      await createTeam({ name: name.trim(), description: description.trim() })
      setName("")
      setDescription("")
    } catch (teamError) {
      setError(teamError instanceof Error ? teamError.message : "Nao foi possivel criar o setor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (teamId: string, currentName: string, currentDescription: string) => {
    setEditingId(teamId)
    setDraftName(currentName)
    setDraftDescription(currentDescription)
    setError("")
  }

  const handleSave = async (teamId: string) => {
    if (!canManageTeams || !draftName.trim()) return

    setBusyTeamId(teamId)
    setError("")

    try {
      await updateTeam(teamId, {
        name: draftName.trim(),
        description: draftDescription.trim(),
      })
      setEditingId(null)
      setDraftName("")
      setDraftDescription("")
    } catch (teamError) {
      setError(teamError instanceof Error ? teamError.message : "Nao foi possivel salvar o setor.")
    } finally {
      setBusyTeamId(null)
    }
  }

  const handleDelete = async (teamId: string) => {
    if (!canManageTeams) return

    setBusyTeamId(teamId)
    setError("")

    try {
      await deleteTeam(teamId)
      if (editingId === teamId) {
        setEditingId(null)
      }
    } catch (teamError) {
      setError(teamError instanceof Error ? teamError.message : "Nao foi possivel apagar o setor.")
    } finally {
      setBusyTeamId(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Setores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Os setores iniciais sao so um ponto de partida. O admin do workspace pode criar, renomear e apagar conforme a operacao real da empresa.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-right">
          <div className="text-xs text-muted-foreground">Setores ativos</div>
          <div className="text-2xl font-semibold">{teams.length}</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Novo setor</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie uma estrutura propria para onboarding, convites e roteamento dos requests.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Nome</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Customer Success"
                disabled={!canManageTeams}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Descricao</Label>
              <Textarea
                id="team-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Escopo, rotina ou tipo de atendimento desse setor."
                rows={5}
                disabled={!canManageTeams}
              />
            </div>

            <Button type="submit" disabled={!canManageTeams || !name.trim() || isSubmitting} className="w-full">
              {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              Criar setor
            </Button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Estrutura atual</h2>
          </div>

          <div className="divide-y divide-border">
            {teams.map((team) => {
              const requestCount = requestCountByTeam[team.id] ?? 0
              const isEditing = editingId === team.id
              const isBusy = busyTeamId === team.id

              return (
                <div key={team.id} className="px-5 py-5">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`team-${team.id}-name`}>Nome</Label>
                        <Input
                          id={`team-${team.id}-name`}
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`team-${team.id}-description`}>Descricao</Label>
                        <Textarea
                          id={`team-${team.id}-description`}
                          value={draftDescription}
                          onChange={(event) => setDraftDescription(event.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                        <Button type="button" onClick={() => void handleSave(team.id)} disabled={!draftName.trim() || isBusy}>
                          {isBusy && <Spinner className="mr-2 h-4 w-4" />}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {team.description || "Sem descricao ainda."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {team.memberCount} membros
                          </Badge>
                          <Badge variant="secondary">{requestCount} requests</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(team.id, team.name, team.description)}
                          disabled={!canManageTeams}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDelete(team.id)}
                          disabled={!canManageTeams || isBusy}
                          className="text-destructive hover:text-destructive"
                        >
                          {isBusy ? <Spinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Apagar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
