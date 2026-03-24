"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InviteMemberModal } from "@/components/app/invite-member-modal"
import { PageContent } from "@/components/app/page-shell"
import { useApp } from "@/lib/app-context"
import { formatDate } from "@/lib/date-utils"
import { Search, UserPlus, MoreHorizontal, Mail, Shield, UserX, Users, Building2 } from "lucide-react"

export default function MembersPage() {
  const { users, teams, invitations, updateMemberRole, updateMemberTeam, removeMember, hasPermission } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const canManageMembers = hasPermission("manageMembers")

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.team.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, users]
  )

  const adminCount = users.filter((user) => user.role === "admin").length
  const pendingInvites = invitations.filter((invitation) => invitation.status === "pending").length

  return (
    <PageContent>
      <div className="mx-auto w-full max-w-6xl">
      <InviteMemberModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Membros</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros do workspace e convites.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/app/settings/teams">
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar setores
            </Link>
          </Button>
          <Button onClick={() => setIsInviteOpen(true)} disabled={!canManageMembers}>
            <UserPlus className="h-4 w-4 mr-2" />
            {canManageMembers ? "Convidar membro" : "Sem permissao para convidar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total de membros</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingInvites}</p>
              <p className="text-sm text-muted-foreground">Convites pendentes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar membros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_180px_150px_110px_48px] gap-4 px-4 py-3 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Membro</span>
          <span>Setor</span>
          <span>Entrou em</span>
          <span>Funcao</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filteredUsers.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_180px_150px_110px_48px] gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>

              {canManageMembers ? (
                <Select
                  value={member.teamId || "none"}
                  onValueChange={(value) => void updateMemberTeam(member.id, value === "none" ? null : value)}
                >
                  <SelectTrigger className="h-9 w-full">
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
              ) : (
                <span className="text-sm">{member.team || "Sem setor"}</span>
              )}

              <span className="text-sm text-muted-foreground">
                {formatDate(member.createdAt).split(",")[0]}
              </span>

              <Badge variant={member.role === "admin" ? "default" : "secondary"} className="w-fit">
                {member.role === "admin" ? "Admin" : "Membro"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!canManageMembers}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => void updateMemberRole(member.id, member.role === "admin" ? "member" : "admin")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {member.role === "admin" ? "Tornar membro" : "Tornar admin"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => void removeMember(member.id)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Remover do workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
      </div>
    </PageContent>
  )
}
