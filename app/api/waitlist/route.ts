import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const email = String(body.email ?? "").trim().toLowerCase()
  const source = String(body.source ?? "landing").trim().toLowerCase()
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {}

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalido." }, { status: 400 })
  }

  if (source.length > 50) {
    return NextResponse.json({ error: "Origem invalida." }, { status: 400 })
  }

  if (JSON.stringify(metadata).length > 2000) {
    return NextResponse.json({ error: "Metadata excede o limite permitido." }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { error, data } = await (admin.from as any)("waitlist_leads")
    .upsert(
      {
        email,
        source,
        metadata,
      },
      { onConflict: "email" }
    )
    .select()
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
