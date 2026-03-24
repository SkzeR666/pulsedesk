import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("id", id)
    .eq("user_id", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, readAt: now })
}
