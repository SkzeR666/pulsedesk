import { RequestPriority, RequestStatus, WorkspacePermissionSettings } from "@/lib/types"

export const DEFAULT_TEAM_OPTIONS = [
  { name: "Engineering", description: "Desenvolvimento e infraestrutura", icon: "code" },
  { name: "Design", description: "UI/UX e identidade visual", icon: "palette" },
  { name: "Product", description: "Produto e discovery", icon: "package" },
  { name: "Finance", description: "Financeiro e contabilidade", icon: "calculator" },
  { name: "HR", description: "Recursos humanos e cultura", icon: "users" },
  { name: "Operations", description: "Operacoes e logistica", icon: "settings" },
  { name: "Marketing", description: "Campanhas e crescimento", icon: "megaphone" },
]

export const DEFAULT_VIEW_DEFINITIONS = [
  { name: "Todos os Requests", icon: "inbox", filter: {}, isDefault: true },
  { name: "Nao Atribuidos", icon: "user-x", filter: { assigneeId: "unassigned" } },
  { name: "Urgentes", icon: "alert-circle", filter: { priority: ["urgent"] } },
  { name: "Resolvidos", icon: "check-circle", filter: { status: ["resolved", "closed"] } },
]

export const statusLabels: Record<RequestStatus, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Aguardando",
  resolved: "Resolvido",
  closed: "Fechado",
}

export const priorityLabels: Record<RequestPriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

export const statusColors: Record<RequestStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-zinc-100 text-zinc-600",
}

export const priorityColors: Record<RequestPriority, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

export const KNOWLEDGE_CATEGORIES = [
  "Onboarding",
  "Engineering",
  "Design",
  "Financeiro",
  "HR",
]

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  "new-request": { email: true, push: true },
  assigned: { email: true, push: true },
  comment: { email: false, push: true },
  mention: { email: true, push: true },
  resolved: { email: true, push: true },
  "status-change": { email: false, push: true },
  "priority-change": { email: false, push: true },
  "new-member": { email: false, push: false },
  "kb-update": { email: false, push: false },
}

export const notificationTypeLabels = {
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

export const DEFAULT_WORKSPACE_PERMISSION_SETTINGS: WorkspacePermissionSettings = {
  admin: {
    manageMembers: true,
    manageViews: true,
    manageKnowledge: true,
    manageSettings: true,
    updateRequests: true,
    viewAllRequests: true,
  },
  member: {
    manageMembers: true,
    manageViews: true,
    manageKnowledge: true,
    manageSettings: true,
    updateRequests: true,
    viewAllRequests: true,
  },
}
