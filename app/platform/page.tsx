"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  KeyRound,
  Mail,
  Ticket,
  Users,
} from "lucide-react"

interface PlatformBundle {
  stats: {
    totalLeads: number
    totalCodes: number
    activeCodes: number
    totalRedemptions: number
    totalWorkspaces: number
    totalUsers: number
    pendingInvites: number
  }
  codes: Array<{
    id: string
    code: string
    label: string
    note: string
    max_uses: number
    used_count: number
    active: boolean
    expires_at: string | null
    created_at: string
    redemptions: Array<{
      id: string
      redeemed_email: string
      redeemed_at: string
    }>
  }>
  leads: Array<{
    id: string
    email: string
    source: string
    created_at: string
  }>
  workspaces: Array<{
    id: string
    name: string
    status: "active" | "suspended"
    created_at: string
    memberCount: number
    pendingInvites: number
    owner: {
      id: string
      name: string
      email: string
      accountStatus: "active" | "suspended"
    } | null
  }>
  users: Array<{
    membershipId: string
    workspaceId: string
    id: string
    role: "admin" | "member"
    joinedAt: string
    name: string
    email: string
    accountStatus: "active" | "suspended"
  }>
  invitations: Array<{
    id: string
    email: string
    role: "admin" | "member"
    status: "pending" | "accepted" | "revoked"
    workspace_id: string
    created_at: string
  }>
  platformAdmins: Array<{
    id: string
    email: string
    created_at: string
  }>
}

async function parseResponse(response: Response) {
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error ?? "Falha na operacao.")
  }
  return payload
}

export default function PlatformPage() {
  const router = useRouter()
  const { loading, isAuthenticated, platformAdmin, authUser } = useApp()
  const [data, setData] = useState<PlatformBundle | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [label, setLabel] = useState("Workspace admin")
  const [maxUses, setMaxUses] = useState("1")
  const [expiresAt, setExpiresAt] = useState("")
  const [note, setNote] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  const loadData = useCallback(async () => {
    setIsFetching(true)
    setError("")

    try {
      const response = await fetch("/api/admin/bootstrap", { cache: "no-store" })
      setData(await parseResponse(response))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar a area da plataforma.")
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace("/auth/sign-in")
      return
    }
    if (!platformAdmin) {
      router.replace("/app")
      return
    }
    void loadData()
  }, [isAuthenticated, loadData, loading, platformAdmin, router])

  const runAction = useCallback(
    async (task: () => Promise<void>) => {
      setIsSubmitting(true)
      setError("")
      try {
        await task()
        await loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel concluir a acao.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [loadData]
  )

  const handleCreateCode = async (event: React.FormEvent) => {
    event.preventDefault()
    await runAction(async () => {
      const response = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          maxUses: Number(maxUses),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          note,
        }),
      })
      await parseResponse(response)
      setNote("")
      setExpiresAt("")
      setMaxUses("1")
    })
  }

  const workspaceNameById = useMemo(
    () => new Map((data?.workspaces ?? []).map((workspace) => [workspace.id, workspace.name])),
    [data?.workspaces]
  )

  const overviewCards = useMemo(
    () => [
      { label: "Workspaces", value: data?.stats.totalWorkspaces ?? 0, icon: Building2 },
      { label: "Usuarios", value: data?.stats.totalUsers ?? 0, icon: Users },
      { label: "Convites pendentes", value: data?.stats.pendingInvites ?? 0, icon: Mail },
      { label: "Leads", value: data?.stats.totalLeads ?? 0, icon: Ticket },
      { label: "Codigos ativos", value: data?.stats.activeCodes ?? 0, icon: KeyRound },
      { label: "Redemptions", value: data?.stats.totalRedemptions ?? 0, icon: CheckCircle2 },
    ],
    [data]
  )

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao app
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-3">Platform Admin</h1>
            <p className="text-muted-foreground mt-2">
              Controle global do produto, dos workspaces e dos acessos da plataforma.
            </p>
          </div>
          <Badge variant="secondary" className="h-fit">
            {authUser?.email}
          </Badge>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="overview">Visao geral</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="invitations">Convites</TabsTrigger>
            <TabsTrigger value="codes">Codigos</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="admins">Platform admins</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <Card key={card.label}>
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <CardDescription>{card.label}</CardDescription>
                      <card.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-3xl">{card.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ultimos workspaces</CardTitle>
                  <CardDescription>Empresas criadas recentemente na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.workspaces.slice(0, 5).map((workspace) => (
                    <div key={workspace.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workspace.memberCount} membros · {workspace.owner?.email ?? "Sem owner"}
                        </div>
                      </div>
                      <Badge variant={workspace.status === "active" ? "default" : "secondary"}>
                        {workspace.status === "active" ? "Ativo" : "Suspenso"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ativacoes recentes</CardTitle>
                  <CardDescription>Fundadores que criaram workspace usando codigo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.codes.flatMap((code) =>
                    code.redemptions.map((redemption) => (
                      <div key={redemption.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{redemption.redeemed_email}</div>
                          <div className="text-sm text-muted-foreground">
                            {code.code} · {code.label}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(redemption.redeemed_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ).slice(0, 5)}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workspaces">
            <Card>
              <CardHeader>
                <CardTitle>Workspaces</CardTitle>
                <CardDescription>Gerencie todas as empresas e suspenda acessos quando necessario.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Convites</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.workspaces.map((workspace) => (
                      <TableRow key={workspace.id}>
                        <TableCell>
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(workspace.created_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{workspace.owner?.email ?? "Sem owner"}</TableCell>
                        <TableCell>{workspace.memberCount}</TableCell>
                        <TableCell>{workspace.pendingInvites}</TableCell>
                        <TableCell>
                          <Badge variant={workspace.status === "active" ? "default" : "secondary"}>
                            {workspace.status === "active" ? "Ativo" : "Suspenso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() =>
                              void runAction(async () => {
                                const response = await fetch(`/api/admin/workspaces/${workspace.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    status: workspace.status === "active" ? "suspended" : "active",
                                  }),
                                })
                                await parseResponse(response)
                              })
                            }
                          >
                            {workspace.status === "active" ? "Suspender" : "Reativar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>Visao global de quem esta dentro de cada workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.membershipId}>
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>{workspaceNameById.get(user.workspaceId) ?? "Workspace"}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={user.accountStatus === "active" ? "default" : "secondary"}>
                            {user.accountStatus === "active" ? "Ativo" : "Suspenso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() =>
                              void runAction(async () => {
                                const response = await fetch(`/api/admin/users/${user.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    accountStatus:
                                      user.accountStatus === "active" ? "suspended" : "active",
                                  }),
                                })
                                await parseResponse(response)
                              })
                            }
                          >
                            {user.accountStatus === "active" ? "Suspender" : "Reativar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Convites</CardTitle>
                <CardDescription>Monitore invites pendentes, aceitos e revogados.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(invitation.created_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{workspaceNameById.get(invitation.workspace_id) ?? "Workspace"}</TableCell>
                        <TableCell>{invitation.role}</TableCell>
                        <TableCell>
                          <Badge variant={invitation.status === "pending" ? "default" : "secondary"}>
                            {invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {invitation.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() =>
                                void runAction(async () => {
                                  const response = await fetch(
                                    `/api/admin/invitations/${invitation.id}`,
                                    {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: "revoked" }),
                                    }
                                  )
                                  await parseResponse(response)
                                })
                              }
                            >
                              Revogar
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem acao</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar codigo</CardTitle>
                  <CardDescription>
                    Libera a criacao do workspace principal para um founder/admin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Rotulo</Label>
                      <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Numero de usos</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min={1}
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiresAt">Expira em</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Observacoes</Label>
                      <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner className="h-4 w-4" /> : "Gerar codigo"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Codigos emitidos</CardTitle>
                  <CardDescription>Visao completa dos codigos da plataforma e seu uso real.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Codigo</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead className="text-right">Acao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <div className="font-medium">{code.code}</div>
                            <div className="text-xs text-muted-foreground">{code.label}</div>
                          </TableCell>
                          <TableCell>
                            {code.used_count}/{code.max_uses}
                          </TableCell>
                          <TableCell>
                            <Badge variant={code.active ? "default" : "secondary"}>
                              {code.active ? "Ativo" : "Pausado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {code.expires_at ? new Date(code.expires_at).toLocaleString() : "Sem prazo"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() =>
                                void runAction(async () => {
                                  const response = await fetch(`/api/admin/codes/${code.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ active: !code.active }),
                                  })
                                  await parseResponse(response)
                                })
                              }
                            >
                              {code.active ? "Pausar" : "Reativar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads</CardTitle>
                <CardDescription>Emails capturados pela landing e origens de entrada.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>{new Date(lead.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Novo platform admin</CardTitle>
                  <CardDescription>Conceda acesso global a outro operador da plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void runAction(async () => {
                        const response = await fetch("/api/admin/platform-admins", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: adminEmail }),
                        })
                        await parseResponse(response)
                        setAdminEmail("")
                      })
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="operacoes@empresa.com"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner className="h-4 w-4" /> : "Adicionar admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admins da plataforma</CardTitle>
                  <CardDescription>Quem pode acessar esta area global do SaaS.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Desde</TableHead>
                        <TableHead className="text-right">Acao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.platformAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.email}</TableCell>
                          <TableCell>{new Date(admin.created_at).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() =>
                                void runAction(async () => {
                                  const response = await fetch(
                                    `/api/admin/platform-admins/${admin.id}`,
                                    { method: "DELETE" }
                                  )
                                  await parseResponse(response)
                                })
                              }
                            >
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
