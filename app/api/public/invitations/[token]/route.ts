import { NextRequest, NextResponse } from "next/server"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

interface InvitationRow {
  email: string
  team_id: string | null
  workspace_id: string
}

interface WorkspaceRow {
  id: string
  name: string
}

interface TeamRow {
  id: string
  name: string
}

function maskEmail(email: string) {
  const normalized = String(email ?? "").trim().toLowerCase()
  const [local, domain] = normalized.split("@")
  if (!local || !domain) return "email protegido"

  const visibleLocal = local.length <= 2 ? `${local[0] ?? ""}*` : `${local.slice(0, 2)}***`
  const [domainName, ...domainTail] = domain.split(".")
  const visibleDomain = `${domainName.slice(0, 2)}***${domainTail.length ? `.${domainTail.join(".")}` : ""}`
  return `${visibleLocal}@${visibleDomain}`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = getSupabaseAdminClient()

  const { data: invitationRows, error: invitationError } = await (admin.from as any)("workspace_invitations")
    .select("id, email, role, team_id, workspace_id, status")
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

  const [{ data: workspaceRows, error: workspaceError }, { data: teamRows, error: teamError }] =
    await Promise.all([
      (admin.from as any)("workspaces").select("id, name").eq("id", invitation.workspace_id).limit(1),
      invitation.team_id
        ? (admin.from as any)("teams")
            .select("id, name")
            .eq("id", invitation.team_id)
            .eq("workspace_id", invitation.workspace_id)
            .limit(1)
        : Promise.resolve({ data: [], error: null }),
    ])

  const workspace = firstRow(workspaceRows as WorkspaceRow[] | null | undefined)
  const lockedTeam = firstRow(teamRows as TeamRow[] | null | undefined)

  if (workspaceError || teamError) {
    return NextResponse.json(
      { error: workspaceError?.message ?? teamError?.message ?? "Falha ao carregar convite." },
      { status: 400 }
    )
  }

  return NextResponse.json({
    invitation: {
      emailHint: maskEmail(invitation.email),
      teamId: invitation.team_id,
      lockedTeamName: lockedTeam?.name ?? null,
      workspaceId: invitation.workspace_id,
      workspaceName: workspace?.name ?? "Workspace",
    },
  })
}
