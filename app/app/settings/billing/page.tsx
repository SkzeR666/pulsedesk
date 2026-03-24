"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/app-context"
import { PageContent, PageSection } from "@/components/app/page-shell"
import { CreditCard, Users, FileText, Zap, CheckCircle2, Shield } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    features: ["5 membros", "100 requests/mes", "1 GB de armazenamento", "Base interna basica"],
    current: true,
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
  const { users, requests, articles, workspace, user } = useApp()
  const memberUsage = users.length
  const requestUsage = requests.length
  const storageUsage = Math.min(100, articles.length * 5)
  const adminCount = users.filter((member) => member.role === "admin").length
  const usageHealth =
    memberUsage > 5 || requestUsage > 100 ? "Acima da referencia do plano Free." : "Dentro da faixa operacional atual."

  return (
    <PageContent>
      <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Faturamento</h1>
        <p className="text-muted-foreground mt-1">
          Painel operacional do workspace. Billing automatico ainda nao esta conectado, mas os consumos abaixo usam dados reais.
        </p>
      </div>

      <div className="space-y-6">
      <PageSection title="Plano atual">
        <div className="rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Zap className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Free</h3>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workspace?.name ?? "Workspace"} esta operando na camada padrao do produto.
                </p>
              </div>
            </div>
            <Button disabled>{user?.role === "admin" ? "Checkout ainda nao conectado" : "Somente admins podem contratar"}</Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                Membros
              </div>
              <p className="text-2xl font-bold">{memberUsage} / 5</p>
              <Progress value={Math.min(100, (memberUsage / 5) * 100)} className="mt-2 h-2" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                Requests
              </div>
              <p className="text-2xl font-bold">{requestUsage} / 100</p>
              <Progress value={Math.min(100, requestUsage)} className="mt-2 h-2" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                Base de conhecimento
              </div>
              <p className="text-2xl font-bold">{articles.length} artigos</p>
              <Progress value={storageUsage} className="mt-2 h-2" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Admins do workspace
              </div>
              <div className="mt-2 text-2xl font-semibold">{adminCount}</div>
            </div>
            <div className="rounded-lg border border-border p-4 md:col-span-2">
              <div className="text-sm font-medium">Saude operacional</div>
              <p className="mt-2 text-sm text-muted-foreground">{usageHealth}</p>
            </div>
          </div>
        </div>
      </PageSection>

      <Separator className="my-8" />

      <PageSection title="Planos">
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border p-6 ${plan.recommended ? "border-foreground bg-secondary/30" : "border-border"}`}
            >
              {plan.recommended && <Badge className="mb-4">Recomendado</Badge>}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? "outline" : plan.recommended ? "default" : "outline"}
                className="w-full"
                disabled
              >
                {plan.current ? "Plano atual" : "Disponivel quando billing entrar"}
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
