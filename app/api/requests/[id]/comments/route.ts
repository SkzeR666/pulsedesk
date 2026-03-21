import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser, requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { user, error: userError } = await requireSupabaseUser()
  if (userError || !user) return userError

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { error: insertError, data } = await supabase
    .from("request_comments")
    .insert({
      request_id: id,
      author_id: user.id,
      content: body.content,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
