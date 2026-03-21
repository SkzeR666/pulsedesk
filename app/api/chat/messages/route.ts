import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const body = await request.json()
  const content = String(body.content ?? "").trim()

  if (!content) {
    return NextResponse.json({ error: "Escreva uma mensagem antes de enviar." }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data, error: insertError } = await supabase
    .from("workspace_messages")
    .insert({
      workspace_id: bundle.workspace.id,
      author_id: bundle.authUser.id,
      content,
    })
    .select("id, workspace_id, author_id, content, created_at, profiles(name, avatar_url)")
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
