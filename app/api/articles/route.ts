import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageKnowledge")
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { error: insertError, data } = await supabase
    .from("knowledge_articles")
    .insert({
      workspace_id: bundle.workspace.id,
      title: body.title?.trim(),
      category: body.category?.trim(),
      content: body.content?.trim(),
      author_id: bundle.authUser.id,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
