"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Inbox, Plus, Sparkles } from "lucide-react"

export function RequestEmptyState() {
  const { setIsNewRequestOpen } = useApp()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted/40">
            <Inbox className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <h2 className="text-balance text-base font-semibold">Nenhum request selecionado</h2>
        <p className="mt-2 text-pretty text-sm text-muted-foreground leading-6">
          Selecione um request na lista ao lado para ver os detalhes, 
          ou crie um novo request para comecar.
        </p>
        
        <Button onClick={() => setIsNewRequestOpen(true)} className="mt-5 h-10">
          <Plus className="h-4 w-4 mr-2" />
          Criar novo request
        </Button>
      </div>
    </div>
  )
}
