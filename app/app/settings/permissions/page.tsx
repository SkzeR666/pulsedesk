"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/lib/app-context"
import type { RolePermissions, WorkspacePermissionKey } from "@/lib/types"
import {
  CheckCircle2,
  Edit,
  Eye,
  Shield,
  Trash2,
  Users,
  ArrowRight,
  Building2,
  UserCog,
} from "lucide-react"

const roles = [
  {
    id: "admin",
    name: "Administrador",
    description: "Gerencia a empresa, os membros e a configuracao do workspace.",
  },
  {
    id: "member",
    name: "Membro",
    description: "Opera o suporte do dia a dia dentro do workspace ao qual foi vinculado.",
  },
]

const permissions = [
  { id: "manageMembers", label: "Gerenciar membros e convites", icon: Users, admin: true, member: false },
  { id: "manageViews", label: "Criar e manter views salvas", icon: Eye, admin: true, member: true },
  { id: "manageKnowledge", label: "Criar artigos internos", icon: Edit, admin: true, member: true },
  { id: "manageSettings", label: "Editar configuracoes do workspace", icon: Shield, admin: true, member: false },
  { id: "updateRequests", label: "Atualizar requests e ownership", icon: Trash2, admin: true, member: true },
  { id: "viewAllRequests", label: "Ver requests do workspace", icon: Eye, admin: true, member: true },
] satisfies Array<{ id: WorkspacePermissionKey; label: string; icon: any; admin: boolean; member: boolean }>

export default function PermissionsPage() {
  const { user, users, permissionSettings, saveRolePermissions } = useApp()
  const adminCount = users.filter((member) => member.role === "admin").length
  const memberCount = users.filter((member) => member.role === "member").length
  const isWorkspaceAdmin = user?.role === "admin"
  const memberPermissions = permissionSettings.member
  const isSavingAllowed = isWorkspaceAdmin

  const handlePermissionChange = async (permission: WorkspacePermissionKey, checked: boolean) => {
    if (!isWorkspaceAdmin) return

    const nextPermissions: RolePermissions = {
      ...memberPermissions,
      [permission]: checked,
    }

    await saveRolePermissions("member", nextPermissions)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Permissoes</h1>
        <p className="text-muted-foreground mt-1">Controle o que membros comuns conseguem fazer no workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Seu papel atual</div>
          <div className="mt-2">
            <Badge>{user?.role === "admin" ? "Administrador" : "Membro"}</Badge>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Admins ativos</div>
          <div className="mt-2 text-2xl font-semibold">{adminCount}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Membros ativos</div>
          <div className="mt-2 text-2xl font-semibold">{memberCount}</div>
        </div>
      </div>

      <div className="space-y-8">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Shield className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <Badge variant={role.id === "admin" ? "default" : "secondary"}>
                  {role.id === "admin" ? "Sistema" : "Editavel"}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {permissions.map((permission) => {
                const Icon = permission.icon
                const enabled = role.id === "admin" ? permission.admin : memberPermissions[permission.id]

                return (
                  <div key={permission.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{permission.label}</span>
                    </div>
                    {role.id === "admin" ? (
                      <div className="flex items-center gap-2 text-sm shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Permitido
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted-foreground">
                          {enabled ? "Permitido" : "Restrito"}
                        </span>
                        <Switch
                          checked={enabled}
                          disabled={!isSavingAllowed}
                          onCheckedChange={(checked) => void handlePermissionChange(permission.id, checked)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      {isWorkspaceAdmin && (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Link href="/app/settings/members" className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
            <div className="flex items-center justify-between">
              <UserCog className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Mexer nos acessos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Troque roles, setores e remova membros do workspace.
            </p>
          </Link>

          <Link href="/app/settings/teams" className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
            <div className="flex items-center justify-between">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Gerenciar setores</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie, renomeie e apague os setores reais da operacao.
            </p>
          </Link>

          <Link href="/platform" className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Admin da plataforma</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesso global da plataforma continua separado da gestao do workspace.
            </p>
          </Link>
        </div>
      )}

      {isWorkspaceAdmin && (
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <div className="mb-3 text-sm text-muted-foreground">
            As alteracoes acima salvam na hora e ja mudam o comportamento real do app para membros.
          </div>
          <Button asChild variant="outline">
            <Link href="/app/settings/members">Abrir gestao de membros</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
