"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getClientAppUrl } from "@/lib/app-url"
import { useApp } from "@/lib/app-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Mail, ShieldCheck, Users } from "lucide-react"

interface InvitationLookup {
  invitation: {
    emailHint: string
    teamId: string | null
    lockedTeamName?: string | null
    workspaceId: string
    workspaceName: string
    teams?: Array<{ id: string; name: string; description: string }>
  }
}

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { acceptInvitation, authUser, refreshData } = useApp()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isSendingAccessLink, setIsSendingAccessLink] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [teamId, setTeamId] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [lookup, setLookup] = useState<InvitationLookup | null>(null)

  const token = searchParams.get("token") ?? ""

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!token) {
        setError("Convite invalido.")
        setIsFetching(false)
        return
      }

      try {
        const response = await fetch(`/api/public/invitations/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? "Nao foi possivel carregar o convite.")
        }

        if (!active) return

        setLookup(data)
        if (data.invitation.teamId) {
          setTeamId(data.invitation.teamId)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Nao foi possivel carregar o convite.")
        }
      } finally {
        if (active) {
          setIsFetching(false)
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [token])

  const invitation = lookup?.invitation ?? null
  const lockedTeam = invitation?.teamId ?? null
  const selectedTeamName = useMemo(
    () =>
      invitation?.teams?.find((team) => team.id === (lockedTeam || teamId))?.name ??
      invitation?.lockedTeamName ??
      "",
    [invitation?.teams, invitation?.lockedTeamName, lockedTeam, teamId]
  )

  useEffect(() => {
    if (!authUser) return
    setEmail(authUser.email ?? "")
  }, [authUser])

  useEffect(() => {
    if (!authUser || !token) return

    let active = true

    const loadProtectedDetails = async () => {
      try {
        const response = await fetch(`/api/auth/invitations/${token}`, { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? "Nao foi possivel validar seu convite.")
        }

        if (!active) return

        setLookup((current) =>
          current
            ? {
                invitation: {
                  ...current.invitation,
                  ...data.invitation,
                },
              }
            : data
        )
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Nao foi possivel validar seu convite.")
        }
      }
    }

    void refreshData().catch(() => undefined)
    void loadProtectedDetails()

    return () => {
      active = false
    }
  }, [authUser, refreshData, token])

  const handleSendAccessLink = async () => {
    if (!email || !token) return

    setIsSendingAccessLink(true)
    setError("")
    setNotice("")

    try {
      const redirectTo =
        getClientAppUrl(`/auth/accept-invite?token=${encodeURIComponent(token)}`)

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      })

      if (otpError) {
        throw otpError
      }

      setNotice("Enviamos um link seguro para esse email. Abra o link e volte para concluir o acesso.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel enviar o link de acesso.")
    } finally {
      setIsSendingAccessLink(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    setIsLoading(true)
    setError("")

    try {
      const destination = await acceptInvitation({
        token,
        name,
        teamId: lockedTeam ?? teamId,
      })
      router.push(destination)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nao foi possivel concluir o convite agora."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Entrar no workspace</h1>
        <p className="text-muted-foreground mt-2">
          {invitation
            ? `Entre com o email convidado para acessar ${invitation.workspaceName}`
            : "Validando seu convite"}
        </p>
        {invitation && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(invitation.emailHint[0] ?? "P").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{invitation.emailHint}</span>
          </div>
        )}
      </div>

      {isFetching ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-5 w-5" />
        </div>
      ) : !authUser ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Esse convite agora so pode ser aceito por quem comprovar acesso ao email convidado.
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email convidado</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-emerald-600">{notice}</p>}

          <Button type="button" className="w-full" disabled={isSendingAccessLink || !email} onClick={() => void handleSendAccessLink()}>
            {isSendingAccessLink ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                Enviar link seguro
                <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Voce esta autenticado como <strong>{authUser.email}</strong>. O acesso so sera liberado se esse email for o mesmo do convite.
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ana Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label>Setor</Label>
            {lockedTeam ? (
              <Input value={selectedTeamName} disabled />
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione seu setor" />
                </SelectTrigger>
                <SelectContent>
                  {(invitation?.teams ?? []).map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading || !invitation || !name || (!lockedTeam && !teamId)}>
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                Entrar no workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm flex justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
