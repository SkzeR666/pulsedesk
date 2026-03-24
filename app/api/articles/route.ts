import { NextRequest, NextResponse } from "next/server"
import { normalizeCategoryInput } from "@/lib/knowledge-categories"
import { createNotifications } from "@/lib/server/notifications"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageKnowledge")
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()
  const { data: teamRows } = await supabase
    .from("teams")
    .select("name")
    .eq("workspace_id", bundle.workspace.id)
  const category = normalizeCategoryInput(
    String(body.category ?? ""),
    (teamRows ?? []).map((team: any) => team.name)
  )

  const { error: insertError, data } = await supabase
    .from("knowledge_articles")
    .insert({
      workspace_id: bundle.workspace.id,
      title: body.title?.trim(),
      category,
      content: body.content?.trim(),
      author_id: bundle.authUser.id,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  const article = firstRow(data)

  const { data: memberRows, error: membersError } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", bundle.workspace.id)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 400 })
  }

  await createNotifications(
    bundle.workspace.id,
    (memberRows ?? []).map((member: any) => ({
      userId: member.user_id,
      type: "kb-update" as const,
      title: "Artigo interno publicado",
      body: article?.title ?? body.title,
      link: "/app/knowledge",
      entityType: "article" as const,
      entityId: article?.id ?? null,
      metadata: { articleId: article?.id ?? null },
    })),
    bundle.authUser.id
  )

  return NextResponse.json(article)
}
