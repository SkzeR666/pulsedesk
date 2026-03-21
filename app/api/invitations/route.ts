import { NextRequest, NextResponse } from "next/server"
import { getAppUrl } from "@/lib/app-url"
import { getEmailSenderConfig, getResendClient } from "@/lib/email/resend"
import {
  renderWorkspaceInviteEmail,
  renderWorkspaceInviteText,
} from "@/lib/email/templates"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageMembers")
  if (error || !bundle) return error

  const body = await request.json()
  const token = globalThis.crypto.randomUUID()
  const supabase = await getSupabaseServerClient()
  const normalizedEmail = String(body.email ?? "").trim().toLowerCase()

  const { error: insertError, data } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: bundle.workspace.id,
      email: normalizedEmail,
      role: body.role ?? "member",
      team_id: body.teamId ?? null,
      token,
      invited_by: bundle.authUser.id,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  const invitation = firstRow(data)
  const team = (bundle.teams ?? []).find((item: any) => item.id === (body.teamId ?? null))
  const inviteLink = `${getAppUrl(request.nextUrl.origin)}/auth/accept-invite?token=${token}`
  const resend = getResendClient()
  let emailDelivered = false
  let deliveryError: string | null = null

  if (!resend) {
    deliveryError = "RESEND_API_KEY nao configurada."
  } else {
    try {
      const sender = getEmailSenderConfig()
      const roleLabel = body.role === "admin" ? "Administrador" : "Membro"
      const teamName = team?.name ?? "Time nao definido"

      const response = await resend.emails.send({
        from: sender.from,
        to: [normalizedEmail],
        replyTo: sender.replyTo ? [sender.replyTo] : undefined,
        subject: `Convite para entrar no ${bundle.workspace.name}`,
        html: renderWorkspaceInviteEmail({
          inviteeEmail: normalizedEmail,
          inviterName: bundle.user?.name ?? "Equipe PulseDesk",
          workspaceName: bundle.workspace.name,
          teamName,
          roleLabel,
          inviteLink,
        }),
        text: renderWorkspaceInviteText({
          inviterName: bundle.user?.name ?? "Equipe PulseDesk",
          workspaceName: bundle.workspace.name,
          teamName,
          roleLabel,
          inviteLink,
        }),
      })

      if (response.error) {
        deliveryError = response.error.message
      } else {
        emailDelivered = true
      }
    } catch (error) {
      deliveryError = error instanceof Error ? error.message : "Falha ao enviar convite por email."
    }
  }

  return NextResponse.json({
    invitation,
    emailDelivered,
    deliveryError,
  })
}
