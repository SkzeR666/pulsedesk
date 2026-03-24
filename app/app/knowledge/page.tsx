"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/app-context"
import { formatDistanceToNow } from "@/lib/date-utils"
import { NewArticleModal } from "@/components/app/new-article-modal"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell, PageToolbar } from "@/components/app/page-shell"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, BookOpen, Eye, Clock, ChevronRight, FileText, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

function getArticlePreview(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default function KnowledgePage() {
  const { articles, users, teams, hasPermission, refreshData } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [renamedCategory, setRenamedCategory] = useState("")
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const canManageKnowledge = hasPermission("manageKnowledge")

  const categories = useMemo(
    () => [
      { id: "all", label: "Todos" },
      ...Array.from(
        new Set([
          ...teams.map((team) => team.name.trim()),
          ...articles.map((article) => article.category.trim()),
        ].filter(Boolean))
      )
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .map((category) => ({ id: category, label: category })),
    ],
    [articles, teams]
  )

  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesSearch =
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === "all" || article.category === activeCategory
        return matchesSearch && matchesCategory
      }),
    [activeCategory, articles, searchQuery]
  )

  const renameCategory = async () => {
    const nextCategory = renamedCategory.trim()
    if (!editingCategory || !nextCategory) return

    setIsSavingCategory(true)
    try {
      const response = await fetch("/api/articles/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousCategory: editingCategory,
          nextCategory,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel renomear a categoria.")
      }

      await refreshData()
      setActiveCategory(nextCategory)
      setEditingCategory(null)
      setRenamedCategory("")
      toast("Categoria atualizada")
    } catch (error) {
      toast("Erro ao atualizar categoria", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingCategory(false)
    }
  }

  const deleteCategory = async () => {
    if (!deletingCategory) return

    setIsSavingCategory(true)
    try {
      const response = await fetch("/api/articles/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: deletingCategory,
          fallbackCategory: "Geral",
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel excluir a categoria.")
      }

      await refreshData()
      if (activeCategory === deletingCategory) {
        setActiveCategory("all")
      }
      setDeletingCategory(null)
      toast("Categoria removida")
    } catch (error) {
      toast("Erro ao excluir categoria", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingCategory(false)
    }
  }

  return (
    <PageShell>
      <NewArticleModal open={isNewArticleOpen} onOpenChange={setIsNewArticleOpen} />
      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null)
            setRenamedCategory("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear categoria</DialogTitle>
            <DialogDescription>
              Atualiza essa categoria em todos os artigos do workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={renamedCategory}
              onChange={(e) => setRenamedCategory(e.target.value)}
              placeholder="Novo nome da categoria"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void renameCategory()} disabled={!renamedCategory.trim() || isSavingCategory}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deletingCategory)} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Os artigos dessa categoria serao movidos para "Geral".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteCategory()} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Artigos internos"
        description="Base interna com procedimentos, dicas e referencias do workspace."
        badge={<HeaderCountBadge>{filteredArticles.length} artigos</HeaderCountBadge>}
        actions={
          <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-72 pl-9"
            />
          </div>
          <Button
            size="lg"
            className="h-10 px-4"
            onClick={() => setIsNewArticleOpen(true)}
            disabled={!canManageKnowledge}
          >
            <Plus className="h-4 w-4 mr-2" />
            {canManageKnowledge ? "Novo artigo interno" : "Sem permissao para criar"}
          </Button>
          </>
        }
      />

      <PageToolbar>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            const count =
              category.id === "all"
                ? articles.length
                : articles.filter((article) => article.category === category.id).length

            return (
              <div
                key={category.id}
                className={cn(
                  "group flex items-center rounded-lg",
                  isActive
                    ? "bg-background ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <span>{category.label}</span>
                  <span className={cn("rounded-md px-1.5 py-0.5 text-xs", isActive ? "bg-muted" : "bg-muted/60")}>
                    {count}
                  </span>
                </button>

                {canManageKnowledge && category.id !== "all" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Acoes da categoria ${category.label}`}
                        className={cn(
                          "mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCategory(category.id)
                          setRenamedCategory(category.label)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingCategory(category.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            )
          })}
        </div>
      </PageToolbar>

      <div className="flex-1 overflow-auto">
        {filteredArticles.length === 0 ? (
          <EmptyPanel
            icon={<BookOpen className="h-6 w-6 text-muted-foreground" />}
            title="Nenhum artigo encontrado"
            description="Tente ajustar sua busca ou filtros."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 md:p-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => {
              const author = users.find((user) => user.id === article.authorId)
              const preview = getArticlePreview(article.content)

              return (
                <Link
                  key={article.id}
                  href={`/app/knowledge/${article.id}`}
                  className="group flex min-h-[220px] flex-col rounded-xl bg-muted/20 p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-muted/40 p-1.5">
                        <FileText className="h-4 w-4 text-foreground" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <h3 className="mb-3 text-lg font-medium group-hover:text-foreground transition-colors">
                    {article.title}
                  </h3>

                  <p className="mb-6 whitespace-pre-wrap text-sm leading-6 text-muted-foreground line-clamp-3">
                    {preview}
                  </p>

                  <div className="flex items-center justify-between mt-auto text-xs text-muted-foreground">
                    <span>por {author?.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(article.updatedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
