"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [workspaceName, setWorkspaceName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const destination = await signUp({ name, email, password, workspaceName, accessCode })
      router.push(destination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a conta.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="text-muted-foreground mt-2">
          Ative o workspace da sua empresa com o codigo recebido
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="email">Email de trabalho</Label>
          <Input
            id="email"
            type="email"
            placeholder="ana@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-code">Codigo de acesso</Label>
          <Input
            id="access-code"
            type="text"
            placeholder="PD-ABCD-1234"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            required
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace">Nome do workspace</Label>
          <Input
            id="workspace"
            type="text"
            placeholder="Minha Empresa"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              Criar conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">Ao criar sua conta voce tera:</p>
        <ul className="space-y-2">
          {[
            "Criacao do workspace principal da empresa",
            "Convites para membros entrarem por invite",
            "Base pronta para operar suporte interno",
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Ja tem uma conta?{" "}
        <Link href="/auth/sign-in" className="text-foreground hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
