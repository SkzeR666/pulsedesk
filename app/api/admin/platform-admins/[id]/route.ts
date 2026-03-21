import { NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/server/route-helpers"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePlatformAdmin()
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const admin = getSupabaseAdminClient()
  const { data: admins, error: adminsError } = await (admin.from as any)("platform_admins")
    .select("id, user_id, email")

  if (adminsError) {
    return NextResponse.json({ error: adminsError.message }, { status: 400 })
  }

  if ((admins ?? []).length <= 1) {
    return NextResponse.json({ error: "A plataforma precisa manter ao menos um admin global." }, { status: 400 })
  }

  const targetAdmin = (admins ?? []).find((entry: any) => entry.id === id)
  const currentEmail = auth.user.email?.toLowerCase() ?? ""

  if (
    targetAdmin &&
    (targetAdmin.user_id === auth.user.id || String(targetAdmin.email ?? "").toLowerCase() === currentEmail)
  ) {
    return NextResponse.json({ error: "Remova ou promova outro admin antes de revogar seu proprio acesso." }, { status: 400 })
  }

  const { error } = await (admin.from as any)("platform_admins").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
