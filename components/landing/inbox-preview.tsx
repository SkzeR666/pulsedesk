"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Inbox,
  CheckSquare,
  LayoutGrid,
  BookOpen,
  Settings,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react"

const mockRequests = [
  {
    id: 1,
    title: "Configurar novo ambiente de staging",
    requester: { name: "Carlos M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
    status: "in_progress",
    priority: "high",
    team: "Engineering",
    time: "2h",
    selected: true,
  },
  {
    id: 2,
    title: "Bug no sistema de login",
    requester: { name: "Marina C.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina" },
    status: "open",
    priority: "urgent",
    team: "Engineering",
    time: "30m",
    selected: false,
  },
  {
    id: 3,
    title: "Onboarding novo desenvolvedor",
    requester: { name: "Ana S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
    status: "open",
    priority: "urgent",
    team: "HR",
    time: "1h",
    selected: false,
  },
  {
    id: 4,
    title: "Revisar orçamento Q2",
    requester: { name: "Pedro O.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" },
    status: "waiting",
    priority: "high",
    team: "Finance",
    time: "1d",
    selected: false,
  },
  {
    id: 5,
    title: "Atualizar design do dashboard",
    requester: { name: "Ana S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
    status: "open",
    priority: "medium",
    team: "Design",
    time: "2d",
    selected: false,
  },
]

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
}

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Aguardando",
  resolved: "Resolvido",
}

const priorityColors: Record<string, string> = {
  low: "border-zinc-300",
  medium: "border-blue-400",
  high: "border-orange-400",
  urgent: "border-red-500",
}

export function InboxPreview() {
  return (
    <div className="flex h-[500px] bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-3 flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2 py-2 mb-3">
          <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
            <span className="text-background font-bold text-xs">P</span>
          </div>
          <span className="font-semibold text-sm">PulseDesk</span>
        </div>

        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-foreground text-background text-sm font-medium mb-3">
          <Plus className="h-4 w-4" />
          Novo Request
        </button>

        <NavItem icon={Inbox} label="Inbox" active count={5} />
        <NavItem icon={CheckSquare} label="Minhas Tarefas" count={3} />
        <NavItem icon={LayoutGrid} label="Views" />
        <NavItem icon={BookOpen} label="Knowledge" />

        <div className="mt-auto">
          <NavItem icon={Settings} label="Configurações" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold">Inbox</h1>
            <Badge variant="secondary" className="text-xs">
              5 abertos
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
              <Search className="h-4 w-4" />
              Buscar
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
              Filtros
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
          <TabItem label="Todos" active />
          <TabItem label="Abertos" />
          <TabItem label="Em Progresso" />
          <TabItem label="Aguardando" />
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-auto">
          {mockRequests.map((request) => (
            <div
              key={request.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors ${
                request.selected ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <div className={`w-1 h-10 rounded-full ${priorityColors[request.priority]}`} />
              <Avatar className="h-8 w-8">
                <AvatarImage src={request.requester.avatar} />
                <AvatarFallback>{request.requester.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{request.title}</p>
                <p className="text-xs text-muted-foreground">
                  {request.requester.name} · {request.team}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                {statusLabels[request.status]}
              </span>
              <span className="text-xs text-muted-foreground w-8 text-right">{request.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  count,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  count?: number
}) {
  return (
    <button
      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors ${
        active ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  )
}

function TabItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        active ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
