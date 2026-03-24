import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DEFAULT_WORKSPACE_PERMISSION_SETTINGS } from "@/lib/constants"

function isIgnorablePlatformAdminError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return (
    message.includes("platform_admins") ||
    message.includes("column email does not exist") ||
    message.includes("column platform_admins.email does not exist") ||
    message.includes("could not find the 'email' column")
  )
}

function isLoggedOutAuthError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return (
    message.includes("user from sub claim in jwt does not exist") ||
    message.includes("auth session missing")
  )
}

function isIgnorableWorkspaceMessagesError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return message.includes("workspace_messages") && (message.includes("does not exist") || message.includes("schema cache"))
}

function isIgnorableWorkspacePermissionsError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return message.includes("workspace_role_permissions") && (message.includes("does not exist") || message.includes("schema cache"))
}

function isIgnorableNotificationsError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""
  return message.includes("notifications") && (message.includes("does not exist") || message.includes("schema cache"))
}

function getResolvedPermissionSettings(rows: any[] | null | undefined) {
  const adminRow = rows?.find((row) => row.role === "admin")
  const memberRow = rows?.find((row) => row.role === "member")

  return {
    admin: {
      manageMembers: adminRow?.manage_members ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageMembers,
      manageViews: adminRow?.manage_views ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageViews,
      manageKnowledge: adminRow?.manage_knowledge ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageKnowledge,
      manageSettings: adminRow?.manage_settings ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageSettings,
      updateRequests: adminRow?.update_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.updateRequests,
      viewAllRequests: adminRow?.view_all_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.viewAllRequests,
    },
    member: {
      manageMembers: memberRow?.manage_members ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageMembers,
      manageViews: memberRow?.manage_views ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageViews,
      manageKnowledge: memberRow?.manage_knowledge ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageKnowledge,
      manageSettings: memberRow?.manage_settings ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageSettings,
      updateRequests: memberRow?.update_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.updateRequests,
      viewAllRequests: memberRow?.view_all_requests ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.viewAllRequests,
    },
  }
}

function getLoggedOutBundle() {
  return {
    authUser: null,
    platformAdmin: false,
    user: null,
    workspace: null,
    users: [],
    teams: [],
    requests: [],
    comments: [],
    messages: [],
    articles: [],
    views: [],
    invitations: [],
    preferences: null,
    notificationPreferences: null,
    notifications: [],
    permissionSettings: DEFAULT_WORKSPACE_PERMISSION_SETTINGS,
  }
}

export async function getAppBundle() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    if (isLoggedOutAuthError(authError)) {
      await supabase.auth.signOut()
      return getLoggedOutBundle()
    }
    throw authError
  }

  if (!authUser) {
    return getLoggedOutBundle()
  }

  const normalizedEmail = authUser.email?.toLowerCase() ?? ""
  const allowedEmails = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  let platformAdmin = normalizedEmail !== "" && allowedEmails.includes(normalizedEmail)

  if (!platformAdmin) {
    const adminFilters = [`user_id.eq.${authUser.id}`]
    if (normalizedEmail) {
      adminFilters.push(`email.eq.${normalizedEmail}`)
    }

    const { data: platformAdminRows, error: platformAdminError } = await supabase
      .from("platform_admins")
      .select("id")
      .or(adminFilters.join(","))
      .limit(1)
      .returns<Array<{ id: string }>>()

    if (platformAdminError && !isIgnorablePlatformAdminError(platformAdminError)) {
      throw platformAdminError
    }

    platformAdmin = Boolean(platformAdminRows?.[0])
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, team_id, joined_at, workspaces(*)")
    .eq("user_id", authUser.id)
    .order("joined_at", { ascending: true })

  if (membershipsError) {
    throw membershipsError
  }

  const membership = memberships?.[0] ?? null

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .limit(1)

  if (profileError) {
    throw profileError
  }

  const profile = profileRows?.[0]

  if (!profile) {
    throw new Error("Profile not found for authenticated user")
  }

  if (!membership) {
    return {
      authUser,
      platformAdmin,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url,
        role: "member",
        team: "",
        teamId: null,
        createdAt: profile.created_at,
      },
      workspace: null,
      users: [],
      teams: [],
      requests: [],
      comments: [],
      messages: [],
      articles: [],
      views: [],
      invitations: [],
      preferences: null,
      notificationPreferences: null,
      notifications: [],
      permissionSettings: DEFAULT_WORKSPACE_PERMISSION_SETTINGS,
    }
  }

  const workspace: any = Array.isArray(membership.workspaces)
    ? membership.workspaces[0]
    : membership.workspaces

  const currentRole = membership.role === "admin" ? "admin" : "member"

  const { data: permissionRows, error: permissionsError } = await supabase
    .from("workspace_role_permissions")
    .select("*")
    .eq("workspace_id", workspace.id)

  if (permissionsError && !isIgnorableWorkspacePermissionsError(permissionsError)) {
    throw permissionsError
  }

  const permissionSettings = getResolvedPermissionSettings(
    isIgnorableWorkspacePermissionsError(permissionsError) ? [] : permissionRows
  )
  const canViewAllRequests = permissionSettings[currentRole].viewAllRequests

  const requestQuery = supabase
    .from("requests")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false })

  if (!canViewAllRequests) {
    requestQuery.or(`requester_id.eq.${authUser.id},assignee_id.eq.${authUser.id}`)
  }

  const [
    teamsResponse,
    membersResponse,
    requestsResponse,
    commentsResponse,
    messagesResponse,
    articlesResponse,
    viewsResponse,
    invitationsResponse,
    preferencesResponse,
    notificationsResponse,
    inboxResponse,
  ] = await Promise.all([
    supabase.from("teams").select("*").eq("workspace_id", workspace.id).order("name"),
    supabase
      .from("workspace_members")
      .select("user_id, role, team_id, joined_at, profiles(name, email, avatar_url)")
      .eq("workspace_id", workspace.id)
      .order("joined_at", { ascending: true }),
    requestQuery,
    supabase
      .from("request_comments")
      .select("*, requests!inner(workspace_id)")
      .eq("requests.workspace_id", workspace.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("workspace_messages")
      .select("id, workspace_id, author_id, content, created_at, profiles(name, avatar_url)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("knowledge_articles")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("saved_views")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("workspace_invitations")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", authUser.id)
      .limit(1),
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", authUser.id)
      .limit(1),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const responses = [
    teamsResponse,
    membersResponse,
    requestsResponse,
    commentsResponse,
    messagesResponse,
    articlesResponse,
    viewsResponse,
    invitationsResponse,
    preferencesResponse,
    notificationsResponse,
    inboxResponse,
  ]

  const firstError = responses.find((response) => {
    if (response === messagesResponse && isIgnorableWorkspaceMessagesError(response.error)) {
      return false
    }

    if (response === inboxResponse && isIgnorableNotificationsError(response.error)) {
      return false
    }

    return Boolean(response.error)
  })?.error
  if (firstError) {
    throw firstError
  }

  const resolvedTeams = teamsResponse.data ?? []
  const currentTeam = resolvedTeams.find((team: any) => team.id === membership.team_id)

  const visibleRequestIds = new Set((requestsResponse.data ?? []).map((request: any) => request.id))

  return {
    authUser,
    platformAdmin,
    profile,
    membership,
    user: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url,
      role: membership.role,
      team: currentTeam?.name ?? "",
      teamId: membership.team_id ?? null,
      createdAt: profile.created_at,
    },
    workspace,
    teams: resolvedTeams,
    users: membersResponse.data ?? [],
    requests: requestsResponse.data ?? [],
    comments: (commentsResponse.data ?? []).filter((comment: any) => visibleRequestIds.has(comment.request_id)),
    messages: isIgnorableWorkspaceMessagesError(messagesResponse.error) ? [] : messagesResponse.data ?? [],
    articles: articlesResponse.data ?? [],
    views: viewsResponse.data ?? [],
    invitations: invitationsResponse.data ?? [],
    preferences: preferencesResponse.data?.[0] ?? null,
    notificationPreferences: notificationsResponse.data?.[0] ?? null,
    notifications: isIgnorableNotificationsError(inboxResponse.error) ? [] : inboxResponse.data ?? [],
    permissionSettings,
  }
}
