import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { hasWorkspacePermission, requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

interface RouteContext {
  params: Promise<unknown>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = (await context.params) as { id: string }
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { data: articleRows, error: articleError } = await supabase
    .from("knowledge_articles")
    .select("id, author_id")
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .limit(1)

  if (articleError) {
    return NextResponse.json({ error: articleError.message }, { status: 400 })
  }

  const article = firstRow(articleRows)
  if (!article) {
    return NextResponse.json({ error: "Artigo nao encontrado." }, { status: 404 })
  }

  const canManage =
    hasWorkspacePermission(bundle, "manageKnowledge") &&
    (article.author_id === bundle.authUser.id || bundle.user?.role === "admin")
  if (!canManage) {
    return NextResponse.json({ error: "Voce nao pode editar este artigo." }, { status: 403 })
  }

  const { data, error: updateError } = await supabase
    .from("knowledge_articles")
    .update({
      title: body.title?.trim(),
      category: body.category?.trim(),
      content: body.content?.trim(),
    })
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = (await context.params) as { id: string }
  const supabase = await getSupabaseServerClient()
  const admin = getSupabaseAdminClient()

  const { data: articleRows, error: articleError } = await supabase
    .from("knowledge_articles")
    .select("id, author_id")
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .limit(1)

  if (articleError) {
    return NextResponse.json({ error: articleError.message }, { status: 400 })
  }

  const article = firstRow(articleRows)
  if (!article) {
    return NextResponse.json({ error: "Artigo nao encontrado." }, { status: 404 })
  }

  const canManage =
    hasWorkspacePermission(bundle, "manageKnowledge") &&
    (article.author_id === bundle.authUser.id || bundle.user?.role === "admin")
  if (!canManage) {
    return NextResponse.json({ error: "Voce nao pode excluir este artigo." }, { status: 403 })
  }

  const { error: deleteError } = await admin
    .from("knowledge_articles")
    .delete()
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
