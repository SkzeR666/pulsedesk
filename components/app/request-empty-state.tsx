"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Inbox, Plus, Sparkles } from "lucide-react"

export function RequestEmptyState() {
  const { setIsNewRequestOpen } = useApp()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="absolute -right-2 -top-2 w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Nenhum request selecionado</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Selecione um request na lista ao lado para ver os detalhes, 
          ou crie um novo request para comecar.
        </p>
        
        <Button onClick={() => setIsNewRequestOpen(true)} className="rounded-xl shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Criar novo request
        </Button>
      </div>
    </div>
  )
}
