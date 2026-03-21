import { NextRequest, NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePlatformAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const { id } = await params
  const admin = getSupabaseAdminClient()

  const { data, error } = await (admin.from as any)("admin_access_codes")
    .update({
      active: Boolean(body.active),
    })
    .eq("id", id)
    .select()
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ code: firstRow(data) })
}
