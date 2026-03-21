import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

interface RouteContext {
  params: Promise<unknown>
}

function isMissingCommentsTable(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return message.includes("article_comments") && (message.includes("does not exist") || message.includes("schema cache"))
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = (await context.params) as { id: string }
  const supabase = await getSupabaseServerClient()

  const { data, error: fetchError } = await supabase
    .from("article_comments")
    .select("id, article_id, author_id, content, created_at, profiles(name, avatar_url)")
    .eq("article_id", id)
    .order("created_at", { ascending: true })

  if (fetchError) {
    if (isMissingCommentsTable(fetchError)) {
      return NextResponse.json([])
    }

    return NextResponse.json({ error: fetchError.message }, { status: 400 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = (await context.params) as { id: string }
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { data: articleRows, error: articleError } = await supabase
    .from("knowledge_articles")
    .select("id")
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .limit(1)

  if (articleError) {
    return NextResponse.json({ error: articleError.message }, { status: 400 })
  }

  if (!firstRow(articleRows)) {
    return NextResponse.json({ error: "Artigo nao encontrado." }, { status: 404 })
  }

  const { data, error: insertError } = await supabase
    .from("article_comments")
    .insert({
      article_id: id,
      author_id: bundle.authUser.id,
      content: body.content?.trim(),
    })
    .select("id, article_id, author_id, content, created_at, profiles(name, avatar_url)")
    .limit(1)

  if (insertError) {
    if (isMissingCommentsTable(insertError)) {
      return NextResponse.json(
        { error: "Comentarios de artigos ainda nao foram configurados no banco." },
        { status: 501 }
      )
    }

    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
