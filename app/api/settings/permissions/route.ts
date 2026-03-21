import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_WORKSPACE_PERMISSION_SETTINGS } from "@/lib/constants"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspaceAdmin } from "@/lib/server/route-helpers"

function resolvePermissions(row: any) {
  return {
    admin: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin,
    member: {
      manageMembers: row?.manage_members ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageMembers,
      manageViews: row?.manage_views ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageViews,
      manageKnowledge: row?.manage_knowledge ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageKnowledge,
      manageSettings: row?.manage_settings ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageSettings,
      updateRequests: row?.update_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.updateRequests,
      viewAllRequests: row?.view_all_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.viewAllRequests,
    },
  }
}

export async function PATCH(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceAdmin()
  if (error || !bundle) return error

  const body = await request.json()
  if (body.role !== "member") {
    return NextResponse.json({ error: "Somente as permissoes do papel membro podem ser editadas agora." }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const payload = {
    workspace_id: bundle.workspace.id,
    role: "member",
    manage_members: Boolean(body.manageMembers),
    manage_views: Boolean(body.manageViews),
    manage_knowledge: Boolean(body.manageKnowledge),
    manage_settings: Boolean(body.manageSettings),
    update_requests: Boolean(body.updateRequests),
    view_all_requests: Boolean(body.viewAllRequests),
  }

  const { error: upsertError } = await supabase.from("workspace_role_permissions").upsert(payload)

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 })
  }

  const { data, error: fetchError } = await supabase
    .from("workspace_role_permissions")
    .select("*")
    .eq("workspace_id", bundle.workspace.id)
    .eq("role", "member")
    .limit(1)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 })
  }

  return NextResponse.json({
    permissionSettings: resolvePermissions(data?.[0]),
  })
}
