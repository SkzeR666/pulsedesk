import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageViews")
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()
  const assigneeFilter = body.assigneeId === "unassigned" ? null : body.assigneeId ?? null

  const { error: insertError, data } = await supabase
    .from("saved_views")
    .insert({
      workspace_id: bundle.workspace.id,
      name: body.name,
      icon: body.icon,
      team_id: body.teamId,
      statuses: body.statuses ?? [],
      priorities: body.priorities ?? [],
      assignee_filter: assigneeFilter,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
