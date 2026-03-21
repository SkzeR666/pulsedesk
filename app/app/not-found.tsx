import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX, ArrowLeft, Home } from "lucide-react"

export default function AppNotFound() {
  return (
    <div className="flex h-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <SearchX className="h-5 w-5 text-muted-foreground" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Nao encontramos essa pagina</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteudo pode ter sido removido, movido ou esse link nao existe mais dentro do workspace.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/app">
              <Home className="mr-2 h-4 w-4" />
              Voltar para inbox
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app/knowledge">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver artigos internos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
