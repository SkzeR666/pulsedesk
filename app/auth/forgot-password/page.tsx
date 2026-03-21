"use client"

import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await sendPasswordReset(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel enviar o email.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Email enviado</h1>
        <p className="text-muted-foreground mt-2">
          Enviamos um link de recuperacao para <span className="text-foreground font-medium">{email}</span>
        </p>
        <Link href="/auth/sign-in">
          <Button variant="outline" className="w-full mt-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Esqueceu a senha?</h1>
        <p className="text-muted-foreground mt-2">
          Digite seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="h-4 w-4" /> : "Enviar link de recuperacao"}
        </Button>
      </form>

      <Link href="/auth/sign-in">
        <Button variant="ghost" className="w-full mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para login
        </Button>
      </Link>
    </div>
  )
}
