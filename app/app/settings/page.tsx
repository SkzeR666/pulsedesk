"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { Building2, Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, teams, workspace, updateWorkspace, updateProfile, refreshData, hasPermission } = useApp()
  const canManageWorkspace = hasPermission("manageSettings")
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState("")
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [teamId, setTeamId] = useState("")
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name)
      setWorkspaceDescription(workspace.description)
    }
  }, [workspace])

  useEffect(() => {
    if (user) {
      setDisplayName(user.name)
      setEmail(user.email)
      setTeamId(user.teamId ?? "none")
    }
  }, [user])

  if (!user || !workspace) {
    return null
  }

  const handleWorkspaceSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canManageWorkspace) return
    setIsSavingWorkspace(true)
    setError("")
    try {
      await updateWorkspace({ name: workspaceName, description: workspaceDescription })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar o workspace.")
    } finally {
      setIsSavingWorkspace(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/media/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel enviar a foto.")
      }

      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel enviar a foto.")
    } finally {
      event.target.value = ""
      setIsUploadingAvatar(false)
    }
  }

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsSavingWorkspace(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/media/workspace-logo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel enviar o logo.")
      }

      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel enviar o logo.")
    } finally {
      event.target.value = ""
      setIsSavingWorkspace(false)
    }
  }

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setError("")
    try {
      await updateProfile({ name: displayName, email, teamId: teamId === "none" ? null : teamId })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar o perfil.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="max-w-3xl p-6">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Configuracoes Gerais</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu perfil e, se voce for admin, as configuracoes do workspace.
        </p>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Workspace</h2>

        <form className="space-y-6 rounded-xl border border-border bg-card p-6" onSubmit={handleWorkspaceSubmit}>
          <div className="flex items-start gap-4">
            {workspace.logoUrl ? (
              <img
                src={workspace.logoUrl}
                alt={workspace.name}
                className="h-16 w-16 rounded-xl border border-border object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={!canManageWorkspace || isSavingWorkspace}
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSavingWorkspace ? "Enviando logo..." : "Alterar logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Use uma imagem quadrada para o workspace ficar mais consistente no app.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-name">Nome do workspace</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={!canManageWorkspace}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Descricao</Label>
            <Textarea
              id="workspace-description"
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              rows={3}
              disabled={!canManageWorkspace}
            />
          </div>

          <Button disabled={isSavingWorkspace || !canManageWorkspace}>
            {canManageWorkspace
              ? isSavingWorkspace
                ? <Spinner className="h-4 w-4" />
                : "Salvar alteracoes"
              : "Sem permissao para editar o workspace"}
          </Button>
        </form>
      </section>

      <Separator className="my-8" />

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Seu Perfil</h2>

        <form className="space-y-6 rounded-xl border border-border bg-card p-6" onSubmit={handleProfileSubmit}>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingAvatar ? "Enviando foto..." : "Alterar foto"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Envie JPG, PNG ou WEBP para atualizar seu avatar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nome de exibicao</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Setor</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Sem setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem setor</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Seu proprio setor pode ser atualizado aqui sem sair do perfil.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Funcao</Label>
            <Input value={user.role === "admin" ? "Administrador" : "Membro"} disabled />
          </div>

          <Button disabled={isSavingProfile}>
            {isSavingProfile ? <Spinner className="h-4 w-4" /> : "Salvar alteracoes"}
          </Button>
        </form>
      </section>
    </div>
  )
}
