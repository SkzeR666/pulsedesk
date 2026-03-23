import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

function normalizeAssigneeFilter(value: unknown) {
  if (value === "unassigned") {
    return null
  }

  return value ?? null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("manageViews")
  if (error || !bundle) return error

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { data, error: updateError } = await supabase
    .from("saved_views")
    .update({
      name: body.name,
      icon: body.icon,
      team_id: body.teamId ?? null,
      statuses: body.statuses ?? [],
      priorities: body.priorities ?? [],
      assignee_filter: normalizeAssigneeFilter(body.assigneeId),
    })
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  const updatedView = firstRow(data)
  if (!updatedView) {
    return NextResponse.json({ error: "View nao encontrada." }, { status: 404 })
  }

  return NextResponse.json(updatedView)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("manageViews")
  if (error || !bundle) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data, error: deleteError } = await supabase
    .from("saved_views")
    .delete()
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .select("id")
    .limit(1)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  if (!firstRow(data)) {
    return NextResponse.json({ error: "View nao encontrada." }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
