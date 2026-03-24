import { NextRequest, NextResponse } from "next/server"
import { normalizeCategoryInput } from "@/lib/knowledge-categories"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"

export async function PATCH(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageKnowledge")
  if (error || !bundle) return error

  const body = await request.json()
  const previousCategory = String(body.previousCategory ?? "").trim()
  const supabase = await getSupabaseServerClient()
  const { data: teamRows } = await supabase
    .from("teams")
    .select("name")
    .eq("workspace_id", bundle.workspace.id)
  const nextCategory = normalizeCategoryInput(
    String(body.nextCategory ?? ""),
    (teamRows ?? []).map((team: any) => team.name)
  )

  if (!previousCategory || !nextCategory) {
    return NextResponse.json({ error: "Categorias invalidas." }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from("knowledge_articles")
    .update({ category: nextCategory })
    .eq("workspace_id", bundle.workspace.id)
    .eq("category", previousCategory)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageKnowledge")
  if (error || !bundle) return error

  const body = await request.json()
  const category = String(body.category ?? "").trim()
  const supabase = await getSupabaseServerClient()
  const { data: teamRows } = await supabase
    .from("teams")
    .select("name")
    .eq("workspace_id", bundle.workspace.id)
  const fallbackCategory = normalizeCategoryInput(
    String(body.fallbackCategory ?? "Geral"),
    (teamRows ?? []).map((team: any) => team.name)
  )

  if (!category || !fallbackCategory) {
    return NextResponse.json({ error: "Categorias invalidas." }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from("knowledge_articles")
    .update({ category: fallbackCategory })
    .eq("workspace_id", bundle.workspace.id)
    .eq("category", category)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
