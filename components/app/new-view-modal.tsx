"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

interface NewViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: ViewFormData) => void
}

interface ViewFormData {
  name: string
  icon: string
  teamId: string | null
  statuses: string[]
  priorities: string[]
}

const icons = [
  { value: "inbox", label: "Inbox" },
  { value: "user-x", label: "Nao atribuido" },
  { value: "alert-circle", label: "Alerta" },
  { value: "check-circle", label: "Check" },
  { value: "code", label: "Codigo" },
  { value: "palette", label: "Paleta" },
  { value: "calculator", label: "Calculadora" },
  { value: "users", label: "Usuarios" },
]

const statuses = [
  { value: "open", label: "Aberto" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "waiting", label: "Aguardando" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Fechado" },
]

const priorities = [
  { value: "urgent", label: "Urgente" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baixa" },
]

export function NewViewModal({
  open,
  onOpenChange,
  onSubmit,
}: NewViewModalProps) {
  const { createView, teams } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ViewFormData>({
    name: "",
    icon: "inbox",
    teamId: null,
    statuses: [],
    priorities: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await createView(formData)

    onSubmit?.(formData)
    setIsSubmitting(false)
    setFormData({ name: "", icon: "inbox", teamId: null, statuses: [], priorities: [] })
    onOpenChange(false)
  }

  const toggleStatus = (status: string) => {
    setFormData((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }))
  }

  const togglePriority = (priority: string) => {
    setFormData((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }))
  }

  const isValid = formData.name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Nova View</DialogTitle>
          <DialogDescription>
            Crie uma view personalizada com filtros especificos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="view-name">Nome</Label>
            <Input
              id="view-name"
              placeholder="Ex: Meus urgentes"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="view-icon">Icone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData({ ...formData, icon: value })
                }
              >
                <SelectTrigger id="view-icon" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="view-team">Time (opcional)</Label>
              <Select
                value={formData.teamId || "all"}
                onValueChange={(value) =>
                  setFormData({ ...formData, teamId: value === "all" ? null : value })
                }
              >
                <SelectTrigger id="view-team" className="h-11 w-full">
                  <SelectValue placeholder="Todos os times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os times</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-3">
              {statuses.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.statuses.includes(status.value)}
                    onCheckedChange={() => toggleStatus(status.value)}
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Label>Prioridade</Label>
            <div className="flex flex-wrap gap-3">
              {priorities.map((priority) => (
                <label
                  key={priority.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.priorities.includes(priority.value)}
                    onCheckedChange={() => togglePriority(priority.value)}
                  />
                  <span className="text-sm">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              Criar view
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
