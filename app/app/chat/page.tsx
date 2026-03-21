"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { MediaUploadButton } from "@/components/app/media-upload-button"
import { ArticleContent } from "@/components/app/article-content"
import { useApp } from "@/lib/app-context"
import { formatDistanceToNow } from "@/lib/date-utils"
import { MessageSquareMore, Send } from "lucide-react"

export default function WorkspaceChatPage() {
  const { workspace, user, messages, addGlobalMessage } = useApp()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupedMessages = useMemo(() => messages, [messages])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await addGlobalMessage(content.trim())
      setContent("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
            <MessageSquareMore className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Chat geral</h1>
            <p className="text-sm text-muted-foreground">
              Canal unico do workspace {workspace?.name} para recados, alinhamentos rapidos e contexto compartilhado.
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {groupedMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-xl border border-dashed border-border px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
                <MessageSquareMore className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="text-base font-semibold">Comece a conversa</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use esse canal como o grupao interno da empresa para deixar contexto visivel para todo mundo.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {groupedMessages.map((message) => {
              const isOwnMessage = message.authorId === user?.id

              return (
                <article
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="mt-1 h-9 w-9">
                      <AvatarImage src={message.authorAvatar} alt={message.authorName} />
                      <AvatarFallback>{message.authorName[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-2xl ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{message.authorName}</span>
                      <span>{formatDistanceToNow(message.createdAt)}</span>
                    </div>
                    <div
                      className={`rounded-xl border px-4 py-3 ${
                        isOwnMessage
                          ? "border-primary/20 bg-primary/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <ArticleContent content={message.content} className="space-y-3 text-sm leading-6" />
                    </div>
                  </div>

                  {isOwnMessage && (
                    <Avatar className="mt-1 h-9 w-9">
                      <AvatarImage src={message.authorAvatar ?? user?.avatar} alt={message.authorName} />
                      <AvatarFallback>{message.authorName[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border px-6 py-4">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva para todo o workspace..."
            rows={3}
            className="min-h-[110px] resize-y"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Markdown, links, imagens e trechos de codigo funcionam aqui tambem.
            </p>
            <div className="flex items-center gap-2">
              <MediaUploadButton
                onUploaded={({ url, filename }) =>
                  setContent((current) => `${current.trim()}${current.trim() ? "\n\n" : ""}![${filename}](${url})`)
                }
                label="Imagem"
              />
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
