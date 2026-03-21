"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  Users,
  Zap,
  BookOpen,
  Filter,
  MessageSquare,
  Search,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Command,
  ArrowUpRight,
} from "lucide-react"
import { InboxPreview } from "@/components/landing/inbox-preview"
import { RequestDetailPreview } from "@/components/landing/request-detail-preview"

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = duration / end
    
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) clearInterval(timer)
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value, duration])
  
  return <span>{count}</span>
}

function TypewriterText({ text, delay = 100 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, delay])
  
  return (
    <span>
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "landing",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao entrar na waitlist")
      }

      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 
            ? "bg-background/80 backdrop-blur-xl border-b border-border" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">PulseDesk</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="#product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Produto
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Precos
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button size="sm" className="group">
                  Entrar na waitlist
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
                Recursos
              </Link>
              <Link href="#product" className="block text-sm text-muted-foreground hover:text-foreground">
                Produto
              </Link>
              <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">
                Precos
              </Link>
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/auth/sign-in">
                  <Button variant="outline" size="sm" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/waitlist">
                  <Button size="sm" className="w-full">
                    Entrar na waitlist
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30"
            style={{
              background: "radial-gradient(ellipse at center, hsl(var(--foreground) / 0.08) 0%, transparent 70%)",
              transform: `translateX(-50%) translateY(${scrollY * 0.1}px)`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-sm mb-8 animate-fade-in"
            >
              <Sparkles className="h-4 w-4" />
              <span>Acesso antecipado por convite</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
              <span className="block">Requests internos.</span>
              <span className="block mt-2 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                Finalmente resolvidos.
              </span>
            </h1>

            <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              O helpdesk interno para times que querem clareza, velocidade e colaboracao real.
            </p>

            {/* CTA */}
            <form
              onSubmit={handleWaitlistSubmit}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto"
            >
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-base sm:flex-1 sm:min-w-[320px]"
              />
              <Button type="submit" size="lg" className="h-14 px-8 text-base group w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Quero acesso antecipado"}
                {!isSubmitting && (
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </form>

            {/* Social proof mini */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span><AnimatedCounter value={127} /> na waitlist</span>
              </div>
            </div>
          </div>

          {/* Hero Product Preview */}
          <div 
            className="mt-20 relative"
            style={{
              transform: `perspective(1000px) rotateX(${Math.min(scrollY * 0.02, 5)}deg)`,
              transition: "transform 0.1s ease-out"
            }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-foreground/5 to-transparent rounded-2xl blur-3xl" />
            
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    app.pulsedesk.com
                  </div>
                </div>
              </div>
              <InboxPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "87%", label: "menos tempo buscando requests" },
              { value: "3x", label: "mais rapido para resolver" },
              { value: "100%", label: "visibilidade do time" },
              { value: "0", label: "requests perdidos" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Recursos</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Construido para times que se importam
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada feature pensada para eliminar friccao e aumentar visibilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 - Large */}
            <div className="lg:col-span-2 group rounded-2xl border border-border bg-card p-8 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-foreground">
                  <Inbox className="h-6 w-6 text-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Inbox inteligente</h3>
                  <p className="text-muted-foreground mt-2 text-lg">
                    Split view poderosa. Veja a lista e detalhes lado a lado. Filtre por status, prioridade, equipe - instantaneamente.
                  </p>
                </div>
              </div>
              <div className="mt-8 rounded-xl border border-border overflow-hidden bg-secondary/30 p-6">
                <div className="flex items-center gap-3">
                  {["Novo", "Em Progresso", "Aguardando", "Resolvido"].map((status, i) => (
                    <span
                      key={status}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer ${
                        i === 0 ? "bg-foreground text-background" : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="p-3 rounded-xl bg-foreground w-fit">
                <Command className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold text-xl mt-6">Command Bar</h3>
              <p className="text-muted-foreground mt-2">
                Navegue, busque, crie - tudo com o teclado. Fluxo ininterrupto.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <kbd className="px-2 py-1 bg-background rounded border border-border text-xs font-mono">Cmd</kbd>
                  <span className="text-muted-foreground">+</span>
                  <kbd className="px-2 py-1 bg-background rounded border border-border text-xs font-mono">K</kbd>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="p-3 rounded-xl bg-foreground w-fit">
                <Users className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold text-xl mt-6">Colaboracao real</h3>
              <p className="text-muted-foreground mt-2">
                Comentarios, mencoes, timeline completa. Todos na mesma pagina.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="p-3 rounded-xl bg-foreground w-fit">
                <Filter className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold text-xl mt-6">Views customizadas</h3>
              <p className="text-muted-foreground mt-2">
                Cada equipe com sua visao. Engineering, Design, Ops - filtros salvos.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="p-3 rounded-xl bg-foreground w-fit">
                <BookOpen className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold text-xl mt-6">Knowledge Base</h3>
              <p className="text-muted-foreground mt-2">
                Documentacao centralizada. Reduza requests repetidos.
              </p>
            </div>

            {/* Feature 6 - Wide */}
            <div className="md:col-span-2 lg:col-span-3 group rounded-2xl border border-border bg-gradient-to-br from-foreground to-foreground/90 text-background p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-2xl">Workspace privado por empresa</h3>
                  <p className="mt-3 text-background/70 text-lg">
                    Entrada apenas por convite. Seu time, suas regras. Admin controla quem entra, quem faz o que.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {["Convites por email", "Roles customizaveis", "SSO em breve"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-background/10 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-background/10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center">
                      <span className="text-foreground font-bold text-2xl">P</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Walkthrough */}
      <section id="product" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Produto</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Interface que respira
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Design limpo. Foco no conteudo. Cada pixel pensado para clareza.
            </p>
          </div>

          {/* Inbox Preview */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-foreground">
                <Inbox className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Inbox</h3>
                <p className="text-muted-foreground">
                  Central de comando. Todos requests. Zero ruido.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              <InboxPreview />
            </div>
          </div>

          {/* Request Detail Preview */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-foreground">
                <MessageSquare className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Request Detail</h3>
                <p className="text-muted-foreground">
                  Timeline, comentarios, acoes. Tudo em um lugar.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              <RequestDetailPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Antes vs Depois
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              De caos para clareza em um dia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
              <h3 className="font-semibold text-xl text-destructive mb-6">Sem PulseDesk</h3>
              <ul className="space-y-4">
                {[
                  "Requests perdidos no Slack",
                  "Planilhas desatualizadas",
                  "Notion confuso",
                  "Emails ignorados",
                  "Ninguem sabe quem e responsavel",
                  "Coisas caem no limbo",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-8">
              <h3 className="font-semibold text-xl mb-6">Com PulseDesk</h3>
              <ul className="space-y-4">
                {[
                  "Tudo em um lugar so",
                  "Status sempre atualizado",
                  "Knowledge base organizada",
                  "Comunicacao centralizada",
                  "Ownership claro",
                  "Nada e esquecido",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-foreground text-background p-12 sm:p-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)`
              }} />
            </div>

            <div className="relative text-center">
              <Badge className="mb-6 bg-background/10 text-background border-background/20">
                Acesso por convite
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Entre para a waitlist
              </h2>
              <p className="mt-4 text-xl text-background/70 max-w-xl mx-auto">
                Vagas limitadas. Receba um codigo de acesso exclusivo quando liberarmos seu lugar.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-background/40 text-base"
                  />
                  <Button 
                    type="submit"
                    variant="secondary" 
                    size="lg"
                    className="h-14 px-8 w-full sm:w-auto shrink-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <>
                        Quero acesso
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-background" />
                  </div>
                  <p className="text-xl font-medium">Voce esta na lista!</p>
                  <p className="text-background/70">Enviaremos seu codigo de acesso em breve.</p>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Onboarding exclusivo
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Acesso vitalicio ao plano early
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Canal direto com founders
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
              <span className="font-semibold">PulseDesk</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contato</Link>
            </div>

            <p className="text-sm text-muted-foreground">
              2024 PulseDesk. Feito com foco.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
