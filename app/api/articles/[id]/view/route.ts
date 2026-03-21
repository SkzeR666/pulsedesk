import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { error: rpcError } = await supabase.rpc("increment_article_views", {
    article_id: id,
  })

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
