import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageSettings")
  if (error || !bundle) return error

  const body = await request.json()
  const name = String(body.name ?? "").trim()
  const description = String(body.description ?? "").trim()

  if (!name) {
    return NextResponse.json({ error: "Informe o nome do setor." }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data, error: insertError } = await supabase
    .from("teams")
    .insert({
      workspace_id: bundle.workspace.id,
      name,
      description,
      icon: "users",
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
