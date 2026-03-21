import { NextRequest, NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "Email obrigatorio." }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { data, error } = await (admin.from as any)("platform_admins")
    .upsert({ email }, { onConflict: "email" })
    .select()
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ platformAdmin: firstRow(data) })
}
