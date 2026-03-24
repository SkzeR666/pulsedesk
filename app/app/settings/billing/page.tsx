"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/app-context"
import { PageContent, PageSection } from "@/components/app/page-shell"
import { CheckCircle2, FlaskConical, Shield, Sparkles, Zap } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    features: ["5 membros", "100 requests/mes", "1 GB de armazenamento", "Base interna basica"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 29",
    period: "por membro/mes",
    features: [
      "Membros ilimitados",
      "Requests ilimitados",
      "10 GB de armazenamento",
      "Base interna avancada",
      "Integracoes",
      "Suporte prioritario",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Personalizado",
    period: "contate vendas",
    features: ["Tudo do Pro", "SSO/SAML", "SLA garantido", "Onboarding dedicado", "Customizacoes"],
  },
]

export default function BillingPage() {
  const { workspace, user } = useApp()

  return (
    <PageContent>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Faturamento</h1>
          <p className="mt-1 text-muted-foreground">
            Billing e medicao automatica estao pausados durante a fase de testes.
          </p>
        </div>

        <div className="space-y-6">
          <PageSection title="Ambiente liberado">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <FlaskConical className="h-3.5 w-3.5" />
                    Uso por hora pausado
                  </div>
                  <h2 className="text-xl font-semibold">Workspace pronto para homologacao</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {workspace?.name ?? "Este workspace"} esta sem bloqueios de plano, sem leitura de consumo
                    para cobranca e com foco total em validacao operacional.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Sem limites ativos</Badge>
                  <Badge variant="secondary">Recursos liberados</Badge>
                  <Badge variant="secondary">Checkout pausado</Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-primary" />
                    Modo atual
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Operacao livre para testes internos e ajustes antes do billing real.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-primary" />
                    Acessos
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Permissoes de membro ampliadas para acelerar QA e homologacao com o time.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Futuro
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reativar medicao e checkout apenas quando a camada comercial entrar em producao.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button disabled>
                  {user?.role === "admin" ? "Billing pausado para testes" : "Somente admins gerenciam billing"}
                </Button>
              </div>
            </div>
          </PageSection>

          <Separator className="my-8" />

          <PageSection title="Planejamento futuro">
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-5 ${
                    plan.recommended ? "border-foreground bg-secondary/20" : "border-border"
                  }`}
                >
                  {plan.recommended ? <Badge className="mb-3">Referencia futura</Badge> : null}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mb-4 mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mb-5 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" disabled>
                    Disponivel quando billing entrar
                  </Button>
                </div>
              ))}
            </div>
          </PageSection>
        </div>
      </div>
    </PageContent>
  )
}
