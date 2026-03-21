import {
  DEFAULT_TEAM_OPTIONS,
  DEFAULT_VIEW_DEFINITIONS,
  DEFAULT_WORKSPACE_PERMISSION_SETTINGS,
} from "@/lib/constants"
import { firstRow } from "@/lib/server/supabase-results"

interface BootstrapWorkspaceParams {
  supabase: any
  authUserId: string
  workspaceName: string
  displayName: string
}

interface WorkspaceRow {
  id: string
}

export async function bootstrapWorkspaceForUser({
  supabase,
  authUserId,
  workspaceName,
  displayName,
}: BootstrapWorkspaceParams) {
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      description: `Workspace interno da ${workspaceName}`,
      created_by: authUserId,
    })
    .select()
    .limit(1)

  const createdWorkspace = firstRow(workspace as WorkspaceRow[] | null | undefined)

  if (workspaceError || !createdWorkspace) {
    throw workspaceError
  }

  const { data: createdTeams, error: teamsError } = await supabase
    .from("teams")
    .insert(
      DEFAULT_TEAM_OPTIONS.map((team) => ({
        workspace_id: createdWorkspace.id,
        name: team.name,
        description: team.description,
        icon: team.icon,
      }))
    )
    .select()

  if (teamsError) {
    throw teamsError
  }

  const defaultTeamId = createdTeams?.[0]?.id ?? null

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: createdWorkspace.id,
    user_id: authUserId,
    role: "admin",
    team_id: defaultTeamId,
  })

  if (memberError) {
    throw memberError
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: displayName,
      onboarding_completed: false,
    })
    .eq("id", authUserId)

  if (profileError) {
    throw profileError
  }

  const teamViews = (createdTeams ?? []).slice(0, 4).map((team: any) => ({
    workspace_id: createdWorkspace.id,
    name: team.name,
    icon: team.icon,
    team_id: team.id,
    statuses: [],
    priorities: [],
    is_default: false,
  }))

  const seedViews = [
    ...DEFAULT_VIEW_DEFINITIONS.map((view) => ({
      workspace_id: createdWorkspace.id,
      name: view.name,
      icon: view.icon,
      team_id: null,
      statuses: view.filter.status ?? [],
      priorities: view.filter.priority ?? [],
      assignee_filter: view.filter.assigneeId ?? null,
      is_default: view.isDefault ?? false,
    })),
    ...teamViews,
  ]

  const { error: viewsError } = await supabase.from("saved_views").insert(seedViews)
  if (viewsError) {
    throw viewsError
  }

  const { error: permissionsError } = await supabase.from("workspace_role_permissions").insert([
    {
      workspace_id: createdWorkspace.id,
      role: "admin",
      manage_members: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageMembers,
      manage_views: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageViews,
      manage_knowledge: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageKnowledge,
      manage_settings: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.manageSettings,
      update_requests: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.updateRequests,
      view_all_requests: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.admin.viewAllRequests,
    },
    {
      workspace_id: createdWorkspace.id,
      role: "member",
      manage_members: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageMembers,
      manage_views: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageViews,
      manage_knowledge: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageKnowledge,
      manage_settings: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.manageSettings,
      update_requests: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.updateRequests,
      view_all_requests: DEFAULT_WORKSPACE_PERMISSION_SETTINGS.member.viewAllRequests,
    },
  ])

  if (permissionsError) {
    throw permissionsError
  }

  return {
    workspace: createdWorkspace,
    createdTeams: createdTeams ?? [],
    defaultTeamId,
  }
}
