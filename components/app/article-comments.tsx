"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { MediaUploadButton } from "@/components/app/media-upload-button"
import { ArticleContent } from "@/components/app/article-content"
import { formatDistanceToNow } from "@/lib/date-utils"

interface ArticleCommentRecord {
  id: string
  article_id: string
  author_id: string
  content: string
  created_at: string
  profiles?: {
    name?: string
    avatar_url?: string | null
  } | null
}

interface ArticleCommentsProps {
  articleId: string
}

export function ArticleComments({ articleId }: ArticleCommentsProps) {
  const [comments, setComments] = useState<ArticleCommentRecord[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadComments = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/articles/${articleId}/comments`)
        const data = await response.json().catch(() => [])

        if (!response.ok) {
          throw new Error(data?.error ?? "Nao foi possivel carregar os comentarios.")
        }

        if (active) {
          setComments(Array.isArray(data) ? data : [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os comentarios.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadComments()

    return () => {
      active = false
    }
  }, [articleId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Nao foi possivel publicar o comentario.")
      }

      setComments((current) => [...current, data])
      setContent("")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel publicar o comentario.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Comentarios internos</h2>
          <p className="text-sm text-muted-foreground">
            Registre contexto, links e observacoes sobre este artigo.
          </p>
        </div>
        <div className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comentario" : "comentarios"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Adicione uma observacao interna, contexto ou proximo passo..."
          rows={4}
          className="resize-y"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Use comentarios para complementar o artigo sem editar o corpo principal.
          </p>
          <div className="flex items-center gap-2">
            <MediaUploadButton
              onUploaded={({ url, filename }) =>
                setContent((current) => `${current.trim()}${current.trim() ? "\n\n" : ""}![${filename}](${url})`)
              }
              label="Imagem"
            />
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting && <Spinner className="mr-2 h-4 w-4" />}
              Comentar
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-4 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" />
          Carregando comentarios...
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          Nenhum comentario ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-card px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url ?? undefined} alt={comment.profiles?.name} />
                    <AvatarFallback>{comment.profiles?.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{comment.profiles?.name ?? "Membro"}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(comment.created_at)}</p>
                  </div>
                </div>
              </div>
              <ArticleContent content={comment.content} className="space-y-3 text-sm leading-6" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
