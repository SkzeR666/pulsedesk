"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Tag,
  User,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Send,
} from "lucide-react"

const comments = [
  {
    id: 1,
    author: { name: "Ana Silva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
    content: "Já iniciei a configuração do Kubernetes. Deve estar pronto até amanhã.",
    time: "2h atrás",
  },
  {
    id: 2,
    author: { name: "Carlos Mendes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
    content: "Ótimo! Precisamos também configurar as variáveis de ambiente do Stripe.",
    time: "1h atrás",
  },
]

export function RequestDetailPreview() {
  return (
    <div className="flex h-[500px] bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground font-mono">#R-001</span>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Em Progresso</Badge>
              </div>
              <h1 className="text-xl font-semibold">Configurar novo ambiente de staging</h1>
            </div>
            <Button size="sm" className="shrink-0">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Resolver
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Precisamos de um novo ambiente de staging para testes do projeto Alpha. Deve incluir banco de dados, cache Redis e conexão com serviços externos.
          </p>
        </div>

        {/* Timeline / Comments */}
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium mb-4">Atividade</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary/50">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Adicionar comentário...</span>
            </div>
            <Button size="sm" variant="secondary">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 border-l border-border p-4 shrink-0">
        <div className="space-y-5">
          {/* Requester */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Solicitante</span>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <span className="text-sm">Carlos Mendes</span>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsável</span>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="text-sm">Ana Silva</span>
            </div>
          </div>

          {/* Priority */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</span>
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Alta</span>
            </div>
          </div>

          {/* Team */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equipe</span>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Engineering</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</span>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs">
                <Tag className="h-3 w-3" />
                infraestrutura
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs">
                <Tag className="h-3 w-3" />
                devops
              </span>
            </div>
          </div>

          {/* Created */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Criado em</span>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">15 Mar 2024, 14:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
