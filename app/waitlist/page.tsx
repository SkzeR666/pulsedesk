"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Sparkles,
  Copy,
  Check,
  Users,
  Clock,
  Zap
} from "lucide-react"

type WaitlistStep = "email" | "info" | "confirmed"

export default function WaitlistPage() {
  const router = useRouter()
  const [step, setStep] = useState<WaitlistStep>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [position, setPosition] = useState(0)
  const [error, setError] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError("")
    setStep("info")
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "waitlist-page",
          metadata: {
            name,
            company,
            teamSize,
          },
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel entrar na waitlist.")
      }

      setReferralCode(`PD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
      setPosition(Math.floor(Math.random() * 50) + 128)
      setStep("confirmed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar na waitlist.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://pulsedesk.com/waitlist?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit group">
          <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">P</span>
          </div>
          <span className="font-semibold">PulseDesk</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Email Step */}
          {step === "email" && (
            <div className="space-y-8">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Acesso antecipado
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight">
                  Entre para a waitlist
                </h1>
                <p className="text-muted-foreground mt-3">
                  Vagas limitadas. Receba seu codigo de acesso exclusivo.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de trabalho</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base group">
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    127 na fila
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    ~2 dias de espera
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Ja tem um codigo?{" "}
                <Link href="/auth/sign-up" className="text-foreground hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          )}

          {/* Info Step */}
          {step === "info" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Quase la!
                </h1>
                <p className="text-muted-foreground mt-3">
                  Mais algumas informacoes para personalizar seu acesso.
                </p>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como devemos te chamar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Tamanho do time</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1-10", "11-50", "51-200", "200+"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          teamSize === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base group mt-6"
                  disabled={isLoading || !teamSize}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Processando...
                    </span>
                  ) : (
                    <>
                      Entrar na waitlist
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <button 
                onClick={() => setStep("email")}
                className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            </div>
          )}

          {/* Confirmed Step */}
          {step === "confirmed" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-background" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Voce esta na lista!
                </h1>
                <p className="text-muted-foreground mt-3">
                  Enviaremos seu codigo de acesso para <span className="text-foreground font-medium">{email}</span> em breve.
                </p>
              </div>

              {/* Position card */}
              <div className="p-6 rounded-2xl border border-border bg-secondary/30">
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Sua posicao na fila</div>
                  <div className="text-5xl font-bold tracking-tight">#{position}</div>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{position - Math.floor(Math.random() * 20)}</div>
                    <div className="text-muted-foreground">a sua frente</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="font-semibold">~{Math.ceil(position / 50)} dias</div>
                    <div className="text-muted-foreground">estimativa</div>
                  </div>
                </div>
              </div>

              {/* Referral section */}
              <div className="p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Pule a fila</div>
                    <div className="text-sm text-muted-foreground">Convide amigos e avance posicoes</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={`pulsedesk.com/waitlist?ref=${referralCode}`}
                    readOnly
                    className="h-11 bg-secondary border-0 text-sm"
                  />
                  <Button 
                    variant="outline" 
                    className="h-11 shrink-0"
                    onClick={copyReferralCode}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Cada amigo que entrar com seu link te avanca 5 posicoes
                </p>
              </div>

              {/* What's next */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Enquanto isso:</div>
                <div className="space-y-2">
                  {[
                    { icon: "1", text: "Fique de olho no email para seu codigo" },
                    { icon: "2", text: "Compartilhe seu link para pular a fila" },
                    { icon: "3", text: "Siga @pulsedesk para novidades" },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                        {item.icon}
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  Voltar para o site
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
