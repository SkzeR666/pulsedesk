// Mock data for PulseDesk

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "member"
  team: string
  createdAt: string
}

export interface Request {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  requesterId: string
  assigneeId: string | null
  teamId: string
  tags: string[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  requestId: string
  authorId: string
  content: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  description: string
  memberCount: number
  icon: string
}

export interface View {
  id: string
  name: string
  icon: string
  filter: {
    status?: Request["status"][]
    priority?: Request["priority"][]
    teamId?: string
    assigneeId?: string
  }
  isDefault?: boolean
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  createdAt: string
  updatedAt: string
  views: number
}

// Users
export const users: User[] = [
  {
    id: "u1",
    name: "Ana Silva",
    email: "ana@empresa.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    role: "admin",
    team: "Engineering",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "u2",
    name: "Carlos Mendes",
    email: "carlos@empresa.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    role: "member",
    team: "Design",
    createdAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "u3",
    name: "Marina Costa",
    email: "marina@empresa.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
    role: "member",
    team: "Finance",
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "u4",
    name: "Pedro Oliveira",
    email: "pedro@empresa.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    role: "member",
    team: "HR",
    createdAt: "2024-02-10T11:00:00Z",
  },
  {
    id: "u5",
    name: "Julia Santos",
    email: "julia@empresa.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
    role: "admin",
    team: "Engineering",
    createdAt: "2024-01-10T08:00:00Z",
  },
]

// Teams
export const teams: Team[] = [
  { id: "t1", name: "Engineering", description: "Desenvolvimento e infraestrutura", memberCount: 12, icon: "code" },
  { id: "t2", name: "Design", description: "UI/UX e identidade visual", memberCount: 5, icon: "palette" },
  { id: "t3", name: "Finance", description: "Financeiro e contabilidade", memberCount: 4, icon: "calculator" },
  { id: "t4", name: "HR", description: "Recursos humanos e cultura", memberCount: 3, icon: "users" },
  { id: "t5", name: "Operations", description: "Operações e logística", memberCount: 6, icon: "settings" },
]

// Requests
export const requests: Request[] = [
  {
    id: "r1",
    title: "Configurar novo ambiente de staging",
    description: "Precisamos de um novo ambiente de staging para testes do projeto Alpha. Deve incluir banco de dados, cache Redis e conexão com serviços externos.",
    status: "in_progress",
    priority: "high",
    requesterId: "u2",
    assigneeId: "u1",
    teamId: "t1",
    tags: ["infraestrutura", "devops"],
    createdAt: "2024-03-15T14:00:00Z",
    updatedAt: "2024-03-16T10:30:00Z",
  },
  {
    id: "r2",
    title: "Atualizar design do dashboard",
    description: "O dashboard atual precisa de uma atualização visual para seguir o novo design system. Incluir novos componentes de gráficos.",
    status: "open",
    priority: "medium",
    requesterId: "u1",
    assigneeId: "u2",
    teamId: "t2",
    tags: ["design", "dashboard"],
    createdAt: "2024-03-14T09:00:00Z",
    updatedAt: "2024-03-14T09:00:00Z",
  },
  {
    id: "r3",
    title: "Revisar orçamento Q2",
    description: "Precisamos revisar o orçamento do segundo trimestre e aprovar as novas contratações planejadas.",
    status: "waiting",
    priority: "high",
    requesterId: "u4",
    assigneeId: "u3",
    teamId: "t3",
    tags: ["orçamento", "aprovação"],
    createdAt: "2024-03-13T11:00:00Z",
    updatedAt: "2024-03-15T16:00:00Z",
  },
  {
    id: "r4",
    title: "Onboarding novo desenvolvedor",
    description: "Preparar documentação e acessos para o novo desenvolvedor que começa segunda-feira.",
    status: "open",
    priority: "urgent",
    requesterId: "u1",
    assigneeId: "u4",
    teamId: "t4",
    tags: ["onboarding", "acessos"],
    createdAt: "2024-03-16T08:00:00Z",
    updatedAt: "2024-03-16T08:00:00Z",
  },
  {
    id: "r5",
    title: "Bug no sistema de login",
    description: "Usuários estão reportando erro 500 ao tentar fazer login com SSO. Parece estar relacionado ao timeout do provider.",
    status: "in_progress",
    priority: "urgent",
    requesterId: "u3",
    assigneeId: "u5",
    teamId: "t1",
    tags: ["bug", "auth", "urgente"],
    createdAt: "2024-03-16T07:30:00Z",
    updatedAt: "2024-03-16T11:00:00Z",
  },
  {
    id: "r6",
    title: "Criar templates de email",
    description: "Desenvolver novos templates de email para campanhas de marketing seguindo a nova identidade visual.",
    status: "resolved",
    priority: "low",
    requesterId: "u5",
    assigneeId: "u2",
    teamId: "t2",
    tags: ["email", "marketing"],
    createdAt: "2024-03-10T14:00:00Z",
    updatedAt: "2024-03-14T17:00:00Z",
  },
  {
    id: "r7",
    title: "Solicitar acesso ao AWS",
    description: "Preciso de acesso ao console AWS para configurar os novos serviços de backend.",
    status: "open",
    priority: "medium",
    requesterId: "u5",
    assigneeId: null,
    teamId: "t1",
    tags: ["acessos", "aws"],
    createdAt: "2024-03-16T09:00:00Z",
    updatedAt: "2024-03-16T09:00:00Z",
  },
  {
    id: "r8",
    title: "Aprovar despesas de viagem",
    description: "Submissão de despesas da conferência React Summit para reembolso.",
    status: "waiting",
    priority: "low",
    requesterId: "u1",
    assigneeId: "u3",
    teamId: "t3",
    tags: ["despesas", "reembolso"],
    createdAt: "2024-03-12T10:00:00Z",
    updatedAt: "2024-03-13T14:00:00Z",
  },
]

// Comments
export const comments: Comment[] = [
  {
    id: "c1",
    requestId: "r1",
    authorId: "u1",
    content: "Já iniciei a configuração do Kubernetes. Deve estar pronto até amanhã.",
    createdAt: "2024-03-15T15:00:00Z",
  },
  {
    id: "c2",
    requestId: "r1",
    authorId: "u2",
    content: "Ótimo! Precisamos também configurar as variáveis de ambiente do Stripe.",
    createdAt: "2024-03-15T15:30:00Z",
  },
  {
    id: "c3",
    requestId: "r5",
    authorId: "u5",
    content: "Identifiquei o problema. O timeout do SSO estava configurado para 5s, aumentei para 30s.",
    createdAt: "2024-03-16T09:00:00Z",
  },
  {
    id: "c4",
    requestId: "r5",
    authorId: "u3",
    content: "Testei aqui e está funcionando. Podemos marcar como resolvido?",
    createdAt: "2024-03-16T10:30:00Z",
  },
  {
    id: "c5",
    requestId: "r3",
    authorId: "u3",
    content: "Aguardando aprovação do diretor financeiro.",
    createdAt: "2024-03-14T11:00:00Z",
  },
]

// Views
export const views: View[] = [
  { id: "v1", name: "Todos os Requests", icon: "inbox", filter: {}, isDefault: true },
  { id: "v2", name: "Não Atribuídos", icon: "user-x", filter: { assigneeId: "unassigned" } },
  { id: "v3", name: "Engineering", icon: "code", filter: { teamId: "t1" } },
  { id: "v4", name: "Design", icon: "palette", filter: { teamId: "t2" } },
  { id: "v5", name: "Finance", icon: "calculator", filter: { teamId: "t3" } },
  { id: "v6", name: "HR", icon: "users", filter: { teamId: "t4" } },
  { id: "v7", name: "Urgentes", icon: "alert-circle", filter: { priority: ["urgent"] } },
  { id: "v8", name: "Resolvidos", icon: "check-circle", filter: { status: ["resolved", "closed"] } },
]

// Knowledge Base Articles
export const articles: KnowledgeArticle[] = [
  {
    id: "a1",
    title: "Como solicitar acesso ao sistema",
    content: "Este guia explica o processo de solicitação de acessos aos diferentes sistemas da empresa...",
    category: "Onboarding",
    authorId: "u4",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-03-01T14:00:00Z",
    views: 234,
  },
  {
    id: "a2",
    title: "Política de reembolso de despesas",
    content: "Todas as despesas devem ser submetidas em até 30 dias após a data do gasto...",
    category: "Financeiro",
    authorId: "u3",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-02-20T11:00:00Z",
    views: 189,
  },
  {
    id: "a3",
    title: "Guia de uso do Git Flow",
    content: "Este documento descreve as práticas de branching e merge adotadas pela equipe de desenvolvimento...",
    category: "Engineering",
    authorId: "u1",
    createdAt: "2024-02-10T14:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
    views: 456,
  },
  {
    id: "a4",
    title: "Design System - Componentes",
    content: "Documentação dos componentes do design system com exemplos de uso e variações...",
    category: "Design",
    authorId: "u2",
    createdAt: "2024-02-15T16:00:00Z",
    updatedAt: "2024-03-12T09:00:00Z",
    views: 321,
  },
  {
    id: "a5",
    title: "Processo de férias e ausências",
    content: "Como solicitar férias, folgas e comunicar ausências ao time de RH...",
    category: "HR",
    authorId: "u4",
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-02-28T15:00:00Z",
    views: 567,
  },
]

// Helper functions
export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getRequestById(id: string): Request | undefined {
  return requests.find((r) => r.id === id)
}

export function getCommentsByRequestId(requestId: string): Comment[] {
  return comments.filter((c) => c.requestId === requestId)
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

export function getRequestsByStatus(status: Request["status"]): Request[] {
  return requests.filter((r) => r.status === status)
}

export function getRequestsByAssignee(assigneeId: string): Request[] {
  return requests.filter((r) => r.assigneeId === assigneeId)
}

export function getUnassignedRequests(): Request[] {
  return requests.filter((r) => r.assigneeId === null)
}

// Current user (mock logged in user)
export const currentUser = users[0] // Ana Silva - Admin

// Status labels
export const statusLabels: Record<Request["status"], string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Aguardando",
  resolved: "Resolvido",
  closed: "Fechado",
}

// Priority labels
export const priorityLabels: Record<Request["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
}

// Status colors
export const statusColors: Record<Request["status"], string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-zinc-100 text-zinc-600",
}

// Priority colors
export const priorityColors: Record<Request["priority"], string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}
