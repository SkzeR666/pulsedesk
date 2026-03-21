"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { loading, authUser, platformAdmin, workspace, teams, user, completeOnboarding } = useApp()
  const [displayName, setDisplayName] = useState("")
  const [teamId, setTeamId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name)
    }

    if (user?.teamId) {
      setTeamId(user.teamId)
    }
  }, [user])

  useEffect(() => {
    if (loading) return
    if (!authUser) {
      router.replace("/auth/sign-in")
      return
    }
    if (!workspace) {
      if (platformAdmin) {
        router.replace("/platform")
      }
      return
    }
  }, [authUser, loading, platformAdmin, router, workspace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      await completeOnboarding({ displayName, teamId })
      router.push("/app")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel concluir o onboarding.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Nenhum workspace vinculado</h1>
          <p className="text-muted-foreground mt-2">
            Entre por um convite do seu admin ou use um codigo valido para criar o workspace da
            empresa.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Complete seu perfil</h1>
        <p className="text-muted-foreground mt-2">
          Falta so o basico para entrar em {workspace.name}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Setor</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione seu setor" />
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSaving || !displayName || !teamId}>
            {isSaving ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                Entrar no app
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
