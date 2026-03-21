"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { NewArticleModal } from "@/components/app/new-article-modal"
import { ArticleComments } from "@/components/app/article-comments"
import { ArticleContent } from "@/components/app/article-content"
import { useApp } from "@/lib/app-context"
import { formatDate } from "@/lib/date-utils"
import { ArrowLeft, Clock, Eye, BookOpen, PencilLine, Trash2 } from "lucide-react"

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

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

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { articles, users, refreshData, user, deleteArticle, loading } = useApp()
  const trackedViewId = useRef<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false)
  const article = articles.find((item) => item.id === id)

  useEffect(() => {
    if (!article || trackedViewId.current === id) return
    trackedViewId.current = id
    void fetch(`/api/articles/${id}/view`, { method: "POST" }).then(() => refreshData())
  }, [article, id, refreshData])

  useEffect(() => {
    if (loading || article || hasAttemptedRedirect) return
    setHasAttemptedRedirect(true)
    router.replace("/app/knowledge")
  }, [article, hasAttemptedRedirect, loading, router])

  if (!article) {
    return null
  }

  const author = users.find((user) => user.id === article.authorId)
  const canManageArticle = user?.id === article.authorId || user?.role === "admin"
  const relatedArticles = articles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .slice(0, 3)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    try {
      await deleteArticle(article.id)
      router.push("/app/knowledge")
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Nao foi possivel excluir o artigo.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <NewArticleModal open={isEditOpen} onOpenChange={setIsEditOpen} article={article} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <Link href="/app/knowledge">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para artigos
          </Button>
        </Link>
        {canManageArticle && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <PencilLine className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir artigo interno?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao remove o artigo da base interna. Use isso apenas quando o conteudo nao fizer mais sentido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Excluindo..." : "Excluir artigo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-4">{article.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author?.avatar} alt={author?.name} />
                  <AvatarFallback>{author?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span>{author?.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Atualizado em {formatDate(article.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views} visualizacoes
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <ArticleContent content={article.content} />
          </div>

          {deleteError && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {deleteError}
            </div>
          )}

          <div className="mt-12 border-t border-border pt-8">
            <ArticleComments articleId={article.id} />
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-lg font-semibold mb-4">Artigos Relacionados</h2>
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/app/knowledge/${related.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all"
                  >
                    <div className="p-1.5 rounded-md bg-secondary">
                      <BookOpen className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{related.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getArticlePreview(related.content)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
