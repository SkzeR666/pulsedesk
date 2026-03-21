import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("updateRequests")
  if (error || !bundle) return error

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const payload: Record<string, unknown> = {}
  if (body.status !== undefined) payload.status = body.status
  if (body.priority !== undefined) payload.priority = body.priority
  if (body.assigneeId !== undefined) payload.assignee_id = body.assigneeId
  if (body.title !== undefined) payload.title = body.title
  if (body.description !== undefined) payload.description = body.description
  if (body.tags !== undefined) payload.tags = body.tags

  const { error: updateError, data } = await supabase
    .from("requests")
    .update(payload)
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
