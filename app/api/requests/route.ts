import { NextRequest, NextResponse } from "next/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()
  const isWorkspaceAdmin = bundle.user?.role === "admin"
  const inheritedTeamId = bundle.user?.teamId ?? bundle.membership?.team_id ?? null

  if (!isWorkspaceAdmin && !inheritedTeamId) {
    return NextResponse.json(
      { error: "Seu usuario precisa estar vinculado a um setor para abrir requests." },
      { status: 400 }
    )
  }

  const { error: insertError, data } = await supabase
    .from("requests")
    .insert({
      workspace_id: bundle.workspace.id,
      title: body.title,
      description: body.description ?? "",
      status: "open",
      priority: isWorkspaceAdmin ? body.priority ?? "medium" : "medium",
      requester_id: bundle.authUser.id,
      assignee_id: isWorkspaceAdmin ? body.assigneeId ?? null : null,
      team_id: isWorkspaceAdmin ? body.teamId : inheritedTeamId,
      tags: isWorkspaceAdmin ? body.tags ?? [] : [],
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
