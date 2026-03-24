import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"

export async function PATCH() {
  const { user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const supabase = await getSupabaseServerClient()
  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, readAt: now })
}
