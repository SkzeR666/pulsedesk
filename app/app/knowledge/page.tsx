"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/app-context"
import { KNOWLEDGE_CATEGORIES } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/date-utils"
import { NewArticleModal } from "@/components/app/new-article-modal"
import { EmptyPanel, HeaderCountBadge, PageHeader, PageShell, PageToolbar, SegmentedTabs } from "@/components/app/page-shell"
import { Search, BookOpen, Eye, Clock, ChevronRight, FileText, Plus } from "lucide-react"

const categories = [{ id: "all", label: "Todos" }, ...KNOWLEDGE_CATEGORIES.map((item) => ({ id: item, label: item }))]

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
  const { articles, users, hasPermission } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false)
  const canManageKnowledge = hasPermission("manageKnowledge")

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

  return (
    <PageShell>
      <NewArticleModal open={isNewArticleOpen} onOpenChange={setIsNewArticleOpen} />

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
        <SegmentedTabs
          items={categories.map((category) => ({
            value: category.id,
            label: category.label,
            count:
              category.id === "all"
                ? articles.length
                : articles.filter((article) => article.category === category.id).length,
          }))}
          active={activeCategory}
          onChange={setActiveCategory}
        />
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
