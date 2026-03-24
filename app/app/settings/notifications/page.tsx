"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { PageContent, PageSection } from "@/components/app/page-shell"
import { Bell, MessageSquare, CheckCircle } from "lucide-react"

const notificationSections = [
  {
    category: "Requests",
    icon: MessageSquare,
    itemIds: ["new-request", "assigned", "comment", "mention"],
  },
  {
    category: "Status",
    icon: CheckCircle,
    itemIds: ["resolved", "status-change", "priority-change"],
  },
  {
    category: "Workspace",
    icon: Bell,
    itemIds: ["new-member", "kb-update"],
  },
]

const labels: Record<string, string> = {
  "new-request": "Novo request criado",
  assigned: "Request atribuido a mim",
  comment: "Novo comentario",
  mention: "Mencionado em comentario",
  resolved: "Request resolvido",
  "status-change": "Mudanca de status",
  "priority-change": "Mudanca de prioridade",
  "new-member": "Novo membro no workspace",
  "kb-update": "Artigo interno atualizado",
}

export default function NotificationsPage() {
  const { notificationPreferences, saveNotificationPreferences } = useApp()
  const [draft, setDraft] = useState(notificationPreferences)
  const [isSaving, setIsSaving] = useState(false)

  const toggleItem = (id: string, channel: "email" | "push") => {
    setDraft((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [id]: {
          ...current.preferences[id],
          [channel]: !current.preferences[id]?.[channel],
        },
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveNotificationPreferences(draft)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageContent>
      <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Notificações</h1>
        <p className="text-muted-foreground mt-1">
          Configure como e quando voce recebe notificacoes.
        </p>
      </div>

      <div className="space-y-8">
        {notificationSections.map((section) => (
          <PageSection key={section.category} title={section.category}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="rounded-lg border border-border">
              <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-3 bg-secondary/50 text-xs font-medium text-muted-foreground">
                <span>Notificacao</span>
                <span className="text-center">Email</span>
                <span className="text-center">Push</span>
              </div>

              <div className="divide-y divide-border">
                {section.itemIds.map((id) => (
                  <div key={id} className="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-3 items-center">
                    <Label htmlFor={`${id}-email`} className="text-sm cursor-pointer">
                      {labels[id]}
                    </Label>
                    <div className="flex justify-center">
                      <Switch
                        id={`${id}-email`}
                        checked={Boolean(draft.preferences[id]?.email)}
                        onCheckedChange={() => toggleItem(id, "email")}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        id={`${id}-push`}
                        checked={Boolean(draft.preferences[id]?.push)}
                        onCheckedChange={() => toggleItem(id, "push")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PageSection>
        ))}
      </div>

      <Separator className="my-8" />

      <PageSection title="Resumo por email">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Resumo diario</p>
              <p className="text-sm text-muted-foreground">
                Receba um resumo das atividades do dia anterior
              </p>
            </div>
            <Switch
              checked={draft.dailyDigest}
              onCheckedChange={(checked) => setDraft((current) => ({ ...current, dailyDigest: checked }))}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Resumo semanal</p>
              <p className="text-sm text-muted-foreground">
                Receba um resumo das atividades da semana
              </p>
            </div>
            <Switch
              checked={draft.weeklyDigest}
              onCheckedChange={(checked) => setDraft((current) => ({ ...current, weeklyDigest: checked }))}
            />
          </div>
        </div>
      </PageSection>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Spinner className="h-4 w-4" /> : "Salvar preferencias"}
      </Button>
      </div>
    </PageContent>
  )
}
