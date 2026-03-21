import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageSettings")
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { error: updateError, data } = await supabase
    .from("workspaces")
    .update({
      name: body.name,
      description: body.description ?? "",
    })
    .eq("id", bundle.workspace.id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
