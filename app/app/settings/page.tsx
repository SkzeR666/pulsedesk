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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
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
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Configuracoes</h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Gerencie seu perfil e, se voce for admin, as configuracoes do workspace.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue={canManageWorkspace ? "workspace" : "profile"} className="space-y-5">
          <TabsList className="h-auto w-full justify-start rounded-xl bg-muted/60 p-1">
            {canManageWorkspace ? (
              <TabsTrigger value="workspace" className="min-w-32 px-4 py-2">
                Workspace
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="profile" className="min-w-32 px-4 py-2">
              Seu perfil
            </TabsTrigger>
          </TabsList>

          {canManageWorkspace ? (
            <TabsContent value="workspace">
              <section className="mb-2">
                <h2 className="text-base font-semibold">Workspace</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nome, descricao e identidade visual do seu workspace.
                </p>

                <form className="mt-4 space-y-6 rounded-lg border border-border bg-card p-4 md:p-6" onSubmit={handleWorkspaceSubmit}>
                  <div className="flex items-start gap-4">
                    {workspace.logoUrl ? (
                      <img
                        src={workspace.logoUrl}
                        alt={workspace.name}
                        className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-secondary">
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
                        <Upload className="mr-2 h-4 w-4" />
                        {isSavingWorkspace ? "Enviando logo..." : "Alterar logo"}
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
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

                  <Button className="h-10" disabled={isSavingWorkspace || !canManageWorkspace}>
                    {canManageWorkspace
                      ? isSavingWorkspace
                        ? <Spinner className="h-4 w-4" />
                        : "Salvar alteracoes"
                      : "Sem permissao para editar o workspace"}
                  </Button>
                </form>
              </section>
            </TabsContent>
          ) : null}

          <TabsContent value="profile">
            <section className="mb-2">
              <h2 className="text-base font-semibold">Seu perfil</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atualize suas informacoes pessoais e preferencias basicas.
              </p>

              <form className="mt-4 space-y-6 rounded-lg border border-border bg-card p-4 md:p-6" onSubmit={handleProfileSubmit}>
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
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploadingAvatar ? "Enviando foto..." : "Alterar foto"}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
