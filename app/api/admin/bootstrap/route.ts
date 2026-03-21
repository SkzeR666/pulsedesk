import { NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/server/route-helpers"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

interface ProfileSummaryRow {
  id: string
  name: string
  email: string
  account_status: "active" | "suspended"
}

export async function GET() {
  const { error } = await requirePlatformAdmin()
  if (error) return error

  const admin = getSupabaseAdminClient()

  const [
    codesResponse,
    redemptionsResponse,
    leadsResponse,
    workspacesResponse,
    membersResponse,
    profilesResponse,
    invitationsResponse,
    platformAdminsResponse,
  ] = await Promise.all([
    (admin.from as any)("admin_access_codes").select("*").order("created_at", { ascending: false }),
    (admin.from as any)("admin_access_code_redemptions")
      .select("id, access_code_id, redeemed_email, redeemed_at, workspace_id")
      .order("redeemed_at", { ascending: false }),
    (admin.from as any)("waitlist_leads").select("*").order("created_at", { ascending: false }),
    (admin.from as any)("workspaces").select("*").order("created_at", { ascending: false }),
    (admin.from as any)("workspace_members")
      .select("id, workspace_id, user_id, role, team_id, joined_at")
      .order("joined_at", { ascending: false }),
    (admin.from as any)("profiles").select("id, name, email, account_status"),
    (admin.from as any)("workspace_invitations")
      .select("*")
      .order("created_at", { ascending: false }),
    (admin.from as any)("platform_admins").select("id, email, created_at").order("created_at", { ascending: false }),
  ])

  const firstError = [
    codesResponse,
    redemptionsResponse,
    leadsResponse,
    workspacesResponse,
    membersResponse,
    profilesResponse,
    invitationsResponse,
    platformAdminsResponse,
  ].find(
    (response) => response.error
  )?.error

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 400 })
  }

  const codes = (codesResponse.data ?? []).map((code: any) => ({
    ...code,
    redemptions: (redemptionsResponse.data ?? []).filter(
      (redemption: any) => redemption.access_code_id === code.id
    ),
  }))

  const workspaceMembers = membersResponse.data ?? []
  const profilesById = new Map<string, ProfileSummaryRow>(
    ((profilesResponse.data ?? []) as ProfileSummaryRow[]).map((profile) => [profile.id, profile])
  )
  const workspaces = (workspacesResponse.data ?? []).map((workspace: any) => {
    const members = workspaceMembers.filter((member: any) => member.workspace_id === workspace.id)
    const owner =
      members.find((member: any) => member.role === "admin" && member.user_id === workspace.created_by) ??
      members.find((member: any) => member.role === "admin") ??
      null
    const ownerProfile = owner ? profilesById.get(owner.user_id) : null

    return {
      ...workspace,
      memberCount: members.length,
      pendingInvites: (invitationsResponse.data ?? []).filter(
        (invitation: any) =>
          invitation.workspace_id === workspace.id && invitation.status === "pending"
      ).length,
      owner: owner
        ? {
            id: owner.user_id,
            name: ownerProfile?.name ?? "Usuario",
            email: ownerProfile?.email ?? "",
            accountStatus: ownerProfile?.account_status ?? "active",
          }
        : null,
    }
  })

  const users = workspaceMembers.map((member: any) => ({
    membershipId: member.id,
    workspaceId: member.workspace_id,
    id: member.user_id,
    role: member.role,
    joinedAt: member.joined_at,
    name: profilesById.get(member.user_id)?.name ?? "Usuario",
    email: profilesById.get(member.user_id)?.email ?? "",
    accountStatus: profilesById.get(member.user_id)?.account_status ?? "active",
  }))

  return NextResponse.json({
    stats: {
      totalLeads: leadsResponse.data?.length ?? 0,
      totalCodes: codes.length,
      activeCodes: codes.filter((code: any) => code.active).length,
      totalRedemptions: redemptionsResponse.data?.length ?? 0,
      totalWorkspaces: workspaces.length,
      totalUsers: users.length,
      pendingInvites:
        (invitationsResponse.data ?? []).filter((invitation: any) => invitation.status === "pending")
          .length ?? 0,
    },
    codes,
    leads: leadsResponse.data ?? [],
    workspaces,
    users,
    invitations: invitationsResponse.data ?? [],
    platformAdmins: platformAdminsResponse.data ?? [],
  })
}
