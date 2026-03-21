import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("manageSettings")
  if (error || !bundle) return error

  const { id } = await params
  const body = await request.json()
  const name = String(body.name ?? "").trim()
  const description = String(body.description ?? "").trim()

  if (!name) {
    return NextResponse.json({ error: "Informe o nome do setor." }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data, error: updateError } = await supabase
    .from("teams")
    .update({
      name,
      description,
    })
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
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
  const { bundle, error } = await requireWorkspacePermission("manageSettings")
  if (error || !bundle) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const admin = getSupabaseAdminClient()

  const [{ count: requestCount, error: requestError }, { count: inviteCount, error: inviteError }] =
    await Promise.all([
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", bundle.workspace.id)
        .eq("team_id", id),
      supabase
        .from("workspace_invitations")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", bundle.workspace.id)
        .eq("team_id", id)
        .eq("status", "pending"),
    ])

  if (requestError || inviteError) {
    return NextResponse.json(
      { error: requestError?.message ?? inviteError?.message ?? "Nao foi possivel validar o setor." },
      { status: 400 }
    )
  }

  if ((requestCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "Esse setor ainda possui requests vinculados. Realoque esses requests antes de apagar." },
      { status: 400 }
    )
  }

  if ((inviteCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "Esse setor ainda possui convites pendentes. Revogue ou aceite os convites antes de apagar." },
      { status: 400 }
    )
  }

  const { error: deleteError } = await admin
    .from("teams")
    .delete()
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
