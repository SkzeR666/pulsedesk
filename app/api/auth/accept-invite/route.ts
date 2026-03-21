import { NextRequest, NextResponse } from "next/server"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

interface InvitationRow {
  id: string
  email: string
  team_id: string | null
  workspace_id: string
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const body = await request.json()
  const token = String(body.token ?? "").trim()
  const name = String(body.name ?? "").trim()
  const requestedTeamId = body.teamId ? String(body.teamId) : null

  if (!token || !name) {
    return NextResponse.json({ error: "Dados incompletos para aceitar o convite." }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { data: invitationRows, error: invitationError } = await (admin.from as any)("workspace_invitations")
    .select("id, email, team_id, workspace_id")
    .eq("token", token)
    .eq("status", "pending")
    .limit(1)

  const invitation = firstRow(invitationRows as InvitationRow[] | null | undefined)

  if (invitationError) {
    return NextResponse.json({ error: invitationError.message }, { status: 400 })
  }

  if (!invitation) {
    return NextResponse.json({ error: "Convite invalido ou ja utilizado." }, { status: 400 })
  }

  if (String(user.email ?? "").trim().toLowerCase() !== String(invitation.email ?? "").trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Entre com o mesmo email que recebeu o convite para continuar." },
      { status: 403 }
    )
  }

  const teamId = invitation.team_id ?? requestedTeamId ?? null

  if (!teamId) {
    return NextResponse.json({ error: "Selecione um setor para continuar." }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()

  try {
    const { data: workspaceId, error: acceptError } = await supabase.rpc("accept_workspace_invitation", {
      invitation_token: token,
      selected_team_id: teamId,
    })

    if (acceptError) {
      throw acceptError
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        name,
        onboarding_completed: true,
      })
      .eq("id", user.id)

    if (profileError) {
      throw profileError
    }

    return NextResponse.json({
      ok: true,
      workspaceId: workspaceId ?? invitation.workspace_id,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel concluir o convite." },
      { status: 400 }
    )
  }
}
