import { NextRequest, NextResponse } from "next/server"
import { firstRow } from "@/lib/server/supabase-results"
import { requireSupabaseUser } from "@/lib/server/route-helpers"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

interface InvitationRow {
  email: string
  team_id: string | null
  workspace_id: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const { token } = await params
  const admin = getSupabaseAdminClient()

  const { data: invitationRows, error: invitationError } = await (admin.from as any)("workspace_invitations")
    .select("email, team_id, workspace_id")
    .eq("token", token)
    .eq("status", "pending")
    .limit(1)

  const invitation = firstRow(invitationRows as InvitationRow[] | null | undefined)

  if (invitationError) {
    return NextResponse.json({ error: invitationError.message }, { status: 400 })
  }

  if (!invitation) {
    return NextResponse.json({ error: "Convite invalido ou expirado." }, { status: 404 })
  }

  if (String(user.email ?? "").trim().toLowerCase() !== String(invitation.email ?? "").trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Entre com o mesmo email que recebeu o convite para ver os detalhes." },
      { status: 403 }
    )
  }

  const [{ data: workspaceRows, error: workspaceError }, { data: teams, error: teamsError }] = await Promise.all([
    (admin.from as any)("workspaces").select("id, name").eq("id", invitation.workspace_id).limit(1),
    (admin.from as any)("teams")
      .select("id, name, description")
      .eq("workspace_id", invitation.workspace_id)
      .order("name"),
  ])

  const workspace = firstRow(workspaceRows as Array<{ id: string; name: string }> | null | undefined)

  if (workspaceError || teamsError) {
    return NextResponse.json(
      { error: workspaceError?.message ?? teamsError?.message ?? "Falha ao carregar convite." },
      { status: 400 }
    )
  }

  return NextResponse.json({
    invitation: {
      teamId: invitation.team_id,
      workspaceId: invitation.workspace_id,
      workspaceName: workspace?.name ?? "Workspace",
      teams: teams ?? [],
    },
  })
}
