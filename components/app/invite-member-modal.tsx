"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const { teams, inviteMember, user } = useApp()
  const isWorkspaceAdmin = user?.role === "admin"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [teamId, setTeamId] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [warningMessage, setWarningMessage] = useState("")

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isWorkspaceAdmin || !email || !teamId) return

    setIsSubmitting(true)
    try {
      const response = await inviteMember({ email, role, teamId })
      setSuccessMessage(
        response.emailDelivered
          ? `Convite enviado por email para ${email}.`
          : `Convite criado para ${email}.`
      )
      setWarningMessage(
        response.emailDelivered
          ? ""
          : response.deliveryError ||
              "O convite foi salvo, mas o email nao saiu. Configure o Resend e tente reenviar."
      )
      setEmail("")
      setTeamId("")
      setRole("member")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Convide novos membros para o workspace por email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="flex flex-col">
          <div className="space-y-5 px-6 py-5">
            {!isWorkspaceAdmin && (
              <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                Somente administradores podem emitir convites para este workspace.
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Convite criado</p>
                  <p className="text-muted-foreground">{successMessage}</p>
                </div>
              </div>
            )}

            {warningMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                <div>
                  <p className="font-medium text-amber-50">Entrega pendente</p>
                  <p className="text-amber-100/80">{warningMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (successMessage) {
                    setSuccessMessage("")
                  }
                  if (warningMessage) {
                    setWarningMessage("")
                  }
                }}
                disabled={!isWorkspaceAdmin}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invite-team">Setor</Label>
                <Select value={teamId} onValueChange={setTeamId} disabled={!isWorkspaceAdmin}>
                  <SelectTrigger id="invite-team" className="h-11 w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Funcao</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as "admin" | "member")}
                  disabled={!isWorkspaceAdmin}
                >
                  <SelectTrigger id="invite-role" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              O membro cria a conta pelo fluxo de convite e entra vinculado ao workspace no setor escolhido.
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              O convite fica salvo mesmo se o email nao sair.
            </p>
            <Button
              type="submit"
              disabled={!isWorkspaceAdmin || !email || !teamId || isSubmitting}
              className="min-w-40"
            >
              {isSubmitting ? (
                <Spinner className="mr-2" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Enviar convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
