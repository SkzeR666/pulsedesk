"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { KNOWLEDGE_CATEGORIES } from "@/lib/constants"
import type { KnowledgeArticle } from "@/lib/types"
import { ArticleContent } from "@/components/app/article-content"
import { MediaUploadButton } from "@/components/app/media-upload-button"
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  ImagePlus,
  Sparkles,
} from "lucide-react"

interface ArticleFormData {
  title: string
  category: string
  content: string
}

interface NewArticleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article?: KnowledgeArticle | null
}

const emptyForm = {
  title: "",
  category: "",
  content: "",
}

const articleTemplates = [
  {
    id: "procedimento",
    label: "Procedimento",
    content: `## Objetivo
Explique rapidamente o que este procedimento resolve.

## Quando usar
- Caso 1
- Caso 2

## Passo a passo
1. Primeiro passo
2. Segundo passo
3. Validacao final

## Observacoes
- Limite importante
- Link util
`,
  },
  {
    id: "checklist",
    label: "Checklist",
    content: `## Checklist
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## Dono
Responsavel pela rotina.

## Frequencia
Diaria, semanal ou sob demanda.
`,
  },
  {
    id: "faq",
    label: "FAQ",
    content: `## Perguntas frequentes

### Pergunta 1
Resposta objetiva.

### Pergunta 2
Resposta objetiva.

### Links relacionados
- [Documento interno](https://pulsedesk.app)
`,
  },
]

export function NewArticleModal({ open, onOpenChange, article = null }: NewArticleModalProps) {
  const { createArticle, updateArticle } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [formData, setFormData] = useState<ArticleFormData>(emptyForm)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isEditing = Boolean(article)

  const appendImageMarkdown = ({ url, filename }: { url: string; filename: string }) => {
    insertSnippet(`![${filename}](${url})`)
    setActiveTab("editor")
  }

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current

    if (!textarea) {
      setFormData((current) => ({
        ...current,
        content: `${current.content}${current.content ? "\n\n" : ""}${snippet}`,
      }))
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = formData.content
    const before = currentValue.slice(0, start)
    const selected = currentValue.slice(start, end)
    const after = currentValue.slice(end)
    const nextSnippet = snippet.includes("{{selection}}")
      ? snippet.replace("{{selection}}", selected || "texto")
      : snippet
    const joinBefore = before && !before.endsWith("\n") ? "\n\n" : ""
    const joinAfter = after && !after.startsWith("\n") ? "\n\n" : ""
    const nextValue = `${before}${joinBefore}${nextSnippet}${joinAfter}${after}`

    setFormData((current) => ({
      ...current,
      content: nextValue,
    }))

    requestAnimationFrame(() => {
      const cursor = before.length + joinBefore.length + nextSnippet.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const applyTemplate = (template: string) => {
    setFormData((current) => ({
      ...current,
      content: current.content.trim() ? current.content : template,
    }))
  }

  useEffect(() => {
    if (!open) return

    setFormData(
      article
        ? {
            title: article.title,
            category: article.category,
            content: article.content,
          }
        : emptyForm
    )
    setActiveTab("editor")
  }, [article, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.category || !formData.content) return

    setIsSubmitting(true)

    try {
      if (article) {
        await updateArticle(article.id, formData)
      } else {
        await createArticle(formData)
      }

      setFormData(emptyForm)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const helperLines = useMemo(
    () => [
      "Use #, ## e ### para titulos.",
      "Use [texto](https://link.com) para links clicaveis.",
      "Use `codigo` ou blocos com ```linguagem para trechos tecnicos.",
      "Suba imagens no proprio editor para enriquecer o artigo.",
    ],
    []
  )

  const isValid = formData.title.trim() && formData.category && formData.content.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] overflow-hidden p-0 sm:max-w-6xl">
        <div className="flex min-h-0 flex-1 flex-col">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{isEditing ? "Editar artigo interno" : "Novo artigo interno"}</DialogTitle>
          <DialogDescription>
            Escreva procedimentos, dicas e referencias internas em um formato mais completo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-2">
              <Label htmlFor="article-title">Titulo</Label>
              <Input
                id="article-title"
                placeholder="Ex: Como abrir acesso temporario para fornecedor"
                value={formData.title}
                onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((current) => ({ ...current, category: value }))}
              >
                <SelectTrigger id="article-category" className="h-11 w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Escrever</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),320px]">
                <div className="space-y-2">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="article-content">Conteudo</Label>
                      <MediaUploadButton onUploaded={appendImageMarkdown} label="Enviar imagem" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("# {{selection}}")}>
                        <Heading1 className="mr-2 h-4 w-4" />
                        Titulo
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("## {{selection}}")}>
                        <Heading2 className="mr-2 h-4 w-4" />
                        Secao
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("- {{selection}}")}>
                        <List className="mr-2 h-4 w-4" />
                        Lista
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("1. {{selection}}")}>
                        <ListOrdered className="mr-2 h-4 w-4" />
                        Passos
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("> {{selection}}")}>
                        <Quote className="mr-2 h-4 w-4" />
                        Destaque
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("```bash\n{{selection}}\n```")}>
                        <Code2 className="mr-2 h-4 w-4" />
                        Codigo
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("[{{selection}}](https://)")}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Link
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => insertSnippet("![descricao](https://)")}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Imagem
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    id="article-content"
                    placeholder="Descreva o passo a passo, adicione links e organize com markdown..."
                    value={formData.content}
                    onChange={(e) => setFormData((current) => ({ ...current, content: e.target.value }))}
                    rows={18}
                    className="min-h-[360px] resize-y font-mono text-sm leading-6"
                  />
                </div>

                <aside className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <h3 className="text-sm font-semibold">Estruturas prontas</h3>
                    <div className="mt-3 grid gap-2">
                      {articleTemplates.map((template) => (
                        <Button
                          key={template.id}
                          type="button"
                          variant="outline"
                          className="justify-start"
                          onClick={() => applyTemplate(template.content)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {template.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">Atalhos uteis</h3>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    {helperLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-md border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
                    Exemplo rapido:
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-5 text-foreground">
{`## Passos
- Abra o painel
- Gere a credencial

\`\`\`bash
pnpm build
\`\`\`

[Guia interno](https://intranet.exemplo.com)

[Documentacao interna](https://intranet.exemplo.com)`}
                    </pre>
                  </div>
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="min-h-[360px] rounded-lg border border-border bg-card p-6">
                <ArticleContent content={formData.content} />
              </div>
            </TabsContent>
          </Tabs>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {isEditing ? "Salvar alteracoes" : "Publicar artigo"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
