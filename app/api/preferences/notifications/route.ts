import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { error: upsertError, data } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      preferences: body.preferences,
      daily_digest: body.dailyDigest,
      weekly_digest: body.weeklyDigest,
    })
    .select()
    .limit(1)

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
