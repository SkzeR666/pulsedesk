import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("manageMembers")
  if (error || !bundle) return error

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()
  const nextRole = body.role === "admin" ? "admin" : "member"
  const teamId = body.teamId === undefined ? undefined : body.teamId ?? null

  if (body.role !== undefined && id === bundle.authUser.id && nextRole !== "admin") {
    const adminCount = bundle.users.filter((member: any) => member.role === "admin").length
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "O ultimo admin do workspace nao pode perder acesso administrativo." },
        { status: 400 }
      )
    }
  }

  if (
    teamId &&
    !bundle.teams.some((team: any) => team.id === teamId)
  ) {
    return NextResponse.json({ error: "Setor invalido para este workspace." }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (body.role !== undefined) {
    payload.role = nextRole
  }
  if (body.teamId !== undefined) {
    payload.team_id = teamId
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nenhuma alteracao informada." }, { status: 400 })
  }

  const { error: updateError, data } = await supabase
    .from("workspace_members")
    .update(payload)
    .eq("workspace_id", bundle.workspace.id)
    .eq("user_id", id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("manageMembers")
  if (error || !bundle) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()

  if (id === bundle.authUser.id) {
    const adminCount = bundle.users.filter((member: any) => member.role === "admin").length
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "O ultimo admin do workspace nao pode ser removido." },
        { status: 400 }
      )
    }
  }

  const { error: deleteError } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", bundle.workspace.id)
    .eq("user_id", id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
