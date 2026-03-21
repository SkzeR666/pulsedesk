import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { firstRow } from "@/lib/server/supabase-results"
import { bootstrapWorkspaceForUser } from "@/lib/server/workspace-bootstrap"

function normalizeAccessCode(value: string) {
  return value.trim().toUpperCase()
}

interface AccessCodeRow {
  id: string
  expires_at: string | null
  used_count: number
  max_uses: number
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const name = String(body.name ?? "").trim()
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
  const password = String(body.password ?? "")
  const workspaceName = String(body.workspaceName ?? "").trim()
  const accessCode = normalizeAccessCode(String(body.accessCode ?? ""))

  if (!name || !email || !password || !workspaceName || !accessCode) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatorios." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { data: codeRows, error: codeError } = await (admin.from as any)("admin_access_codes")
    .select("*")
    .eq("code", accessCode)
    .eq("kind", "workspace_admin")
    .eq("active", true)
    .limit(1)

  const codeRow = firstRow(codeRows as AccessCodeRow[] | null | undefined)

  if (codeError) {
    return NextResponse.json({ error: codeError.message }, { status: 400 })
  }

  if (!codeRow) {
    return NextResponse.json({ error: "Codigo invalido ou indisponivel." }, { status: 400 })
  }

  if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Esse codigo expirou." }, { status: 400 })
  }

  if ((codeRow.used_count ?? 0) >= codeRow.max_uses) {
    return NextResponse.json({ error: "Esse codigo ja atingiu o limite de uso." }, { status: 400 })
  }

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? "Nao foi possivel criar a conta." },
      { status: 400 }
    )
  }

  try {
    const bootstrapResult = await bootstrapWorkspaceForUser({
      supabase: admin,
      authUserId: createdUser.user.id,
      workspaceName,
      displayName: name,
    })

    const { error: redemptionError } = await (admin.from as any)("admin_access_code_redemptions").insert({
      access_code_id: codeRow.id,
      user_id: createdUser.user.id,
      workspace_id: bootstrapResult.workspace.id,
      redeemed_email: email,
    })

    if (redemptionError) {
      throw redemptionError
    }

    return NextResponse.json({
      ok: true,
      workspaceId: bootstrapResult.workspace.id,
    })
  } catch (error) {
    await admin.auth.admin.deleteUser(createdUser.user.id)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel ativar o workspace." },
      { status: 400 }
    )
  }
}
