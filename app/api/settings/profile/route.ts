import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(request: NextRequest) {
  const { supabase, user, error } = await requireSupabaseUser()
  if (error || !user) return error

  const body = await request.json()
  const nextName = String(body.name ?? "").trim()
  const nextEmail = String(body.email ?? "").trim().toLowerCase()
  const nextTeamId = body.teamId === undefined ? undefined : body.teamId ?? null
  const nextAvatarUrl = body.avatarUrl === undefined ? undefined : String(body.avatarUrl ?? "").trim() || null

  if (!nextName || !nextEmail) {
    return NextResponse.json({ error: "Nome e email sao obrigatorios." }, { status: 400 })
  }

  const { error: authError } = await supabase.auth.updateUser({
    email: nextEmail,
    data: { name: nextName },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (body.teamId !== undefined) {
    const { data: membershipRows, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)

    const membership = firstRow(membershipRows)

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 })
    }

    if (!membership) {
      return NextResponse.json({ error: "Membro do workspace nao encontrado." }, { status: 404 })
    }

    if (nextTeamId) {
      const { data: teamRows, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("id", nextTeamId)
        .eq("workspace_id", membership.workspace_id)
        .limit(1)

      if (teamError) {
        return NextResponse.json({ error: teamError.message }, { status: 400 })
      }

      if (!firstRow(teamRows)) {
        return NextResponse.json({ error: "Setor invalido para este workspace." }, { status: 400 })
      }
    }

    const { error: memberUpdateError } = await supabase
      .from("workspace_members")
      .update({ team_id: nextTeamId })
      .eq("user_id", user.id)
      .eq("workspace_id", membership.workspace_id)

    if (memberUpdateError) {
      return NextResponse.json({ error: memberUpdateError.message }, { status: 400 })
    }
  }

  if (body.avatarUrl !== undefined) {
    const { error: avatarError } = await supabase
      .from("profiles")
      .update({ avatar_url: nextAvatarUrl })
      .eq("id", user.id)

    if (avatarError) {
      return NextResponse.json({ error: avatarError.message }, { status: 400 })
    }
  }

  const { error: profileError, data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .limit(1)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
