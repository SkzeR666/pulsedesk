import { NextRequest, NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

function generateAccessCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const segment = (size: number) =>
    Array.from({ length: size }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

  return `PD-${segment(4)}-${segment(4)}`
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin()
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const label = String(body.label ?? "").trim() || "Workspace admin"
  const note = String(body.note ?? "").trim()
  const maxUses = Math.max(1, Number(body.maxUses ?? 1))
  const expiresAt = body.expiresAt ? String(body.expiresAt) : null

  const admin = getSupabaseAdminClient()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateAccessCode()
    const { data, error } = await (admin.from as any)("admin_access_codes")
      .insert({
        code,
        label,
        note,
        max_uses: maxUses,
        expires_at: expiresAt,
        created_by: auth.user.id,
      })
      .select()
      .limit(1)

    if (!error) {
      return NextResponse.json({ code: firstRow(data) })
    }
  }

  return NextResponse.json({ error: "Nao foi possivel gerar um codigo unico." }, { status: 500 })
}
