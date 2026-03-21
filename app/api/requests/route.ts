import { NextRequest, NextResponse } from "next/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { error: insertError, data } = await supabase
    .from("requests")
    .insert({
      workspace_id: bundle.workspace.id,
      title: body.title,
      description: body.description ?? "",
      status: body.status ?? "open",
      priority: body.priority ?? "medium",
      requester_id: bundle.authUser.id,
      assignee_id: body.assigneeId ?? null,
      team_id: body.teamId,
      tags: body.tags ?? [],
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
