"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User as AuthUser } from "@supabase/supabase-js"
import {
  DEFAULT_WORKSPACE_PERMISSION_SETTINGS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/constants"
import { getClientAppUrl } from "@/lib/app-url"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type {
  Comment,
  Invitation,
  KnowledgeArticle,
  NotificationPreferences,
  Request,
  Team,
  User,
  UserPreferences,
  View,
  RolePermissions,
  WorkspacePermissionKey,
  WorkspacePermissionSettings,
  WorkspaceMessage,
  Workspace,
} from "@/lib/types"

interface SignUpPayload {
  name: string
  email: string
  password: string
  workspaceName: string
  accessCode: string
}

interface InvitePayload {
  email: string
  role: "admin" | "member"
  teamId: string | null
}

interface InviteMemberResult {
  emailDelivered: boolean
  deliveryError: string | null
}

interface CreateTeamPayload {
  name: string
  description: string
}

interface CreateRequestPayload {
  title: string
  description: string
  status: Request["status"]
  priority: Request["priority"]
  requesterId: string
  assigneeId: string | null
  teamId: string
  tags: string[]
}

interface CreateViewPayload {
  name: string
  icon: string
  teamId: string | null
  statuses: string[]
  priorities: string[]
}

interface CreateArticlePayload {
  title: string
  category: string
  content: string
}

interface CompleteOnboardingPayload {
  displayName: string
  teamId: string
}

interface AcceptInvitationPayload {
  token: string
  name: string
  teamId: string | null
}

interface AppContextType {
  authUser: AuthUser | null
  platformAdmin: boolean
  onboardingCompleted: boolean
  user: User | null
  workspace: Workspace | null
  users: User[]
  teams: Team[]
  requests: Request[]
  comments: Comment[]
  messages: WorkspaceMessage[]
  articles: KnowledgeArticle[]
  views: View[]
  invitations: Invitation[]
  permissionSettings: WorkspacePermissionSettings
  preferences: UserPreferences
  notificationPreferences: NotificationPreferences
  loading: boolean
  isAuthenticated: boolean
  selectedRequestId: string | null
  setSelectedRequestId: (id: string | null) => void
  isCommandBarOpen: boolean
  setIsCommandBarOpen: (open: boolean) => void
  isNewRequestOpen: boolean
  setIsNewRequestOpen: (open: boolean) => void
  activeView: string
  setActiveView: (view: string) => void
  refreshData: () => Promise<any>
  signIn: (email: string, password: string) => Promise<string>
  signUp: (payload: SignUpPayload) => Promise<string>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  completeOnboarding: (payload: CompleteOnboardingPayload) => Promise<void>
  acceptInvitation: (payload: AcceptInvitationPayload) => Promise<string>
  addRequest: (payload: CreateRequestPayload) => Promise<void>
  updateRequest: (id: string, updates: Partial<Request>) => Promise<void>
  addComment: (requestId: string, content: string) => Promise<void>
  createArticle: (payload: CreateArticlePayload) => Promise<void>
  updateArticle: (id: string, payload: CreateArticlePayload) => Promise<void>
  deleteArticle: (id: string) => Promise<void>
  createView: (payload: CreateViewPayload) => Promise<void>
  inviteMember: (payload: InvitePayload) => Promise<InviteMemberResult>
  updateWorkspace: (payload: { name: string; description: string }) => Promise<void>
  updateProfile: (payload: { name: string; email: string; teamId?: string | null }) => Promise<void>
  updateAvatar: (avatarUrl: string) => Promise<void>
  updateMemberRole: (memberId: string, role: "admin" | "member") => Promise<void>
  updateMemberTeam: (memberId: string, teamId: string | null) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  createTeam: (payload: CreateTeamPayload) => Promise<void>
  updateTeam: (id: string, payload: CreateTeamPayload) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
  addGlobalMessage: (content: string) => Promise<void>
  saveRolePermissions: (role: "member", payload: RolePermissions) => Promise<void>
  hasPermission: (permission: WorkspacePermissionKey) => boolean
  savePreferences: (payload: Partial<UserPreferences>) => Promise<void>
  saveNotificationPreferences: (payload: NotificationPreferences) => Promise<void>
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  accentColor: "blue",
  sidebarDensity: "comfortable",
}

const defaultNotificationPreferences: NotificationPreferences = {
  preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  dailyDigest: false,
  weeklyDigest: true,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function mapWorkspace(workspace: any): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description ?? "",
    logoUrl: workspace.logo_url ?? null,
    createdAt: workspace.created_at,
  }
}

function mapTeam(team: any, memberCount: number): Team {
  return {
    id: team.id,
    workspaceId: team.workspace_id,
    name: team.name,
    description: team.description ?? "",
    icon: team.icon ?? "users",
    memberCount,
  }
}

function mapUser(member: any, teamName: string): User {
  return {
    id: member.user_id,
    name: member.profiles?.name ?? "Usuario",
    email: member.profiles?.email ?? "",
    avatar: member.profiles?.avatar_url ?? undefined,
    role: member.role,
    team: teamName,
    teamId: member.team_id ?? null,
    createdAt: member.joined_at,
  }
}

function mapRequest(request: any): Request {
  return {
    id: request.id,
    workspaceId: request.workspace_id,
    title: request.title,
    description: request.description ?? "",
    status: request.status,
    priority: request.priority,
    requesterId: request.requester_id,
    assigneeId: request.assignee_id,
    teamId: request.team_id,
    tags: request.tags ?? [],
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  }
}

function mapComment(comment: any): Comment {
  return {
    id: comment.id,
    requestId: comment.request_id,
    authorId: comment.author_id,
    content: comment.content,
    createdAt: comment.created_at,
  }
}

function mapWorkspaceMessage(message: any): WorkspaceMessage {
  return {
    id: message.id,
    workspaceId: message.workspace_id,
    authorId: message.author_id,
    content: message.content,
    createdAt: message.created_at,
    authorName: message.profiles?.name ?? "Membro",
    authorAvatar: message.profiles?.avatar_url ?? undefined,
  }
}

function mapArticle(article: any): KnowledgeArticle {
  return {
    id: article.id,
    workspaceId: article.workspace_id,
    title: article.title,
    content: article.content,
    category: article.category,
    authorId: article.author_id,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    views: article.views ?? 0,
  }
}

function mapView(view: any): View {
  const isUnassignedView =
    !view.assignee_filter && view.team_id == null && view.icon === "user-x" && view.name === "Nao Atribuidos"

  return {
    id: view.id,
    workspaceId: view.workspace_id,
    name: view.name,
    icon: view.icon,
    filter: {
      status: view.statuses?.length ? view.statuses : undefined,
      priority: view.priorities?.length ? view.priorities : undefined,
      teamId: view.team_id ?? undefined,
      assigneeId: isUnassignedView ? "unassigned" : view.assignee_filter ?? undefined,
    },
    isDefault: view.is_default,
  }
}

function mapInvitation(invitation: any): Invitation {
  return {
    id: invitation.id,
    workspaceId: invitation.workspace_id,
    email: invitation.email,
    role: invitation.role,
    teamId: invitation.team_id,
    token: invitation.token,
    status: invitation.status,
    createdAt: invitation.created_at,
  }
}

async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed")
  }

  return data as T
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [platformAdmin, setPlatformAdmin] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [messages, setMessages] = useState<WorkspaceMessage[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [views, setViews] = useState<View[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [permissionSettings, setPermissionSettings] =
    useState<WorkspacePermissionSettings>(DEFAULT_WORKSPACE_PERMISSION_SETTINGS)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences)
  const [loading, setLoading] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [activeView, setActiveView] = useState("inbox")

  const clearWorkspaceData = useCallback(() => {
    setPlatformAdmin(false)
    setOnboardingCompleted(false)
    setUser(null)
    setWorkspace(null)
    setUsers([])
    setTeams([])
    setRequests([])
    setComments([])
    setMessages([])
    setArticles([])
    setViews([])
    setInvitations([])
    setPermissionSettings(DEFAULT_WORKSPACE_PERMISSION_SETTINGS)
    setPreferences(defaultPreferences)
    setNotificationPreferences(defaultNotificationPreferences)
    setSelectedRequestId(null)
  }, [])

  const applyBundle = useCallback(
    (bundle: any) => {
      setAuthUser(bundle.authUser)
      setPlatformAdmin(Boolean(bundle.platformAdmin))
      setOnboardingCompleted(Boolean(bundle.profile?.onboarding_completed ?? bundle.user?.onboardingCompleted))

      if (!bundle.authUser) {
        clearWorkspaceData()
        return bundle
      }

      if (!bundle.workspace) {
        setUser(bundle.user)
        setWorkspace(null)
        setUsers([])
        setTeams([])
        setRequests([])
        setComments([])
        setMessages([])
        setArticles([])
        setViews([])
        setInvitations([])
        setPermissionSettings(DEFAULT_WORKSPACE_PERMISSION_SETTINGS)
        setPreferences(defaultPreferences)
        setNotificationPreferences(defaultNotificationPreferences)
        return bundle
      }

      const teamRows: any[] = bundle.teams ?? []
      const memberRows: any[] = bundle.users ?? []
      const teamCountMap = memberRows.reduce((acc: Record<string, number>, member: any) => {
        if (member.team_id) {
          acc[member.team_id] = (acc[member.team_id] ?? 0) + 1
        }
        return acc
      }, {})

      const mappedTeams = teamRows.map((team: any) => mapTeam(team, teamCountMap[team.id] ?? 0))
      const teamNameById = new Map<string, string>(mappedTeams.map((team) => [team.id, team.name]))
      const mappedUsers = memberRows.map((member: any) =>
        mapUser(member, member.team_id ? teamNameById.get(member.team_id) ?? "" : "")
      )

      setWorkspace(mapWorkspace(bundle.workspace))
      setTeams(mappedTeams)
      setUsers(mappedUsers)
      setRequests((bundle.requests ?? []).map(mapRequest))
      setComments((bundle.comments ?? []).map(mapComment))
      setMessages((bundle.messages ?? []).map(mapWorkspaceMessage))
      setArticles((bundle.articles ?? []).map(mapArticle))
      setViews((bundle.views ?? []).map(mapView))
      setInvitations((bundle.invitations ?? []).map(mapInvitation))
      setPermissionSettings(bundle.permissionSettings ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS)

      if (bundle.preferences) {
        setPreferences({
          theme: bundle.preferences.theme,
          accentColor: bundle.preferences.accent_color,
          sidebarDensity: bundle.preferences.sidebar_density,
        })
      } else {
        setPreferences(defaultPreferences)
      }

      if (bundle.notificationPreferences) {
        setNotificationPreferences({
          preferences: {
            ...DEFAULT_NOTIFICATION_PREFERENCES,
            ...(bundle.notificationPreferences.preferences ?? {}),
          },
          dailyDigest: bundle.notificationPreferences.daily_digest,
          weeklyDigest: bundle.notificationPreferences.weekly_digest,
        })
      } else {
        setNotificationPreferences(defaultNotificationPreferences)
      }

      const currentMember = memberRows.find((member: any) => member.user_id === bundle.authUser.id)

      if (bundle.profile && currentMember) {
        setUser({
          id: bundle.profile.id,
          name: bundle.profile.name,
          email: bundle.profile.email,
          avatar: bundle.profile.avatar_url ?? undefined,
          role: currentMember.role,
          team: currentMember.team_id ? teamNameById.get(currentMember.team_id) ?? "" : "",
          teamId: currentMember.team_id ?? null,
          createdAt: bundle.profile.created_at,
        })
      }

      return bundle
    },
    [clearWorkspaceData]
  )

  const refreshData = useCallback(async () => {
    try {
      const bundle = await apiRequest<any>("/api/bootstrap")
      return applyBundle(bundle)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed"
      if (
        message.includes("User from sub claim in JWT does not exist") ||
        message.includes("Auth session missing")
      ) {
        await supabase.auth.signOut()
        const loggedOutBundle = {
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
          permissionSettings: DEFAULT_WORKSPACE_PERMISSION_SETTINGS,
          preferences: null,
          notificationPreferences: null,
        }
        return applyBundle(loggedOutBundle)
      }
      throw error
    }
  }, [applyBundle, supabase])

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        await refreshData()
      } catch {
        clearWorkspaceData()
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshData()
        .catch(() => {
          clearWorkspaceData()
        })
        .finally(() => {
          if (active) {
            setLoading(false)
          }
        })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshData, supabase])

  useEffect(() => {
    if (loading) return

    if (!authUser && pathname.startsWith("/app")) {
      router.replace("/auth/sign-in")
      return
    }

    if (authUser && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
      router.replace(
        workspace
          ? onboardingCompleted
            ? "/app"
            : "/onboarding"
          : platformAdmin
            ? "/platform"
            : "/onboarding"
      )
      return
    }

    if (authUser && workspace && !onboardingCompleted && pathname.startsWith("/app")) {
      router.replace("/onboarding")
      return
    }

    if (authUser && !workspace && pathname.startsWith("/app")) {
      router.replace(platformAdmin ? "/platform" : "/onboarding")
    }
  }, [authUser, loading, onboardingCompleted, pathname, platformAdmin, router, workspace])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw error
      }
      const bundle = await refreshData()
      if (bundle?.profile?.account_status === "suspended") {
        await supabase.auth.signOut()
        throw new Error("Sua conta esta suspensa. Fale com o administrador da plataforma.")
      }
      if (bundle?.workspace?.status === "suspended") {
        await supabase.auth.signOut()
        throw new Error("Esse workspace esta suspenso no momento.")
      }
      if (bundle?.workspace && !bundle?.profile?.onboarding_completed) return "/onboarding"
      if (bundle?.workspace) return "/app"
      if (bundle?.platformAdmin) return "/platform"
      return "/onboarding"
    },
    [refreshData, supabase]
  )

  const signUp = useCallback(
    async ({ name, email, password, workspaceName, accessCode }: SignUpPayload) => {
      await apiRequest("/api/auth/admin-sign-up", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          workspaceName,
          accessCode,
        }),
      })

      return signIn(email, password)
    },
    [signIn]
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    clearWorkspaceData()
    setAuthUser(null)
    router.push("/")
  }, [clearWorkspaceData, router, supabase])

  const sendPasswordReset = useCallback(
    async (email: string) => {
      const redirectTo = getClientAppUrl("/auth/reset-password")

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        throw error
      }
    },
    [supabase]
  )

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        throw error
      }
    },
    [supabase]
  )

  const completeOnboarding = useCallback(
    async ({ displayName, teamId }: CompleteOnboardingPayload) => {
      if (!authUser || !workspace) {
        throw new Error("Nenhum workspace ativo para concluir o onboarding.")
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: displayName, onboarding_completed: true })
        .eq("id", authUser.id)

      if (profileError) {
        throw profileError
      }

      const { error: membershipError } = await supabase
        .from("workspace_members")
        .update({ team_id: teamId })
        .eq("workspace_id", workspace.id)
        .eq("user_id", authUser.id)

      if (membershipError) {
        throw membershipError
      }

      await refreshData()
    },
    [authUser, refreshData, supabase, workspace]
  )

  const acceptInvitation = useCallback(
    async ({ token, name, teamId }: AcceptInvitationPayload) => {
      await apiRequest("/api/auth/accept-invite", {
        method: "POST",
        body: JSON.stringify({
          token,
          name,
          teamId,
        }),
      })

      const bundle = await refreshData()
      if (bundle?.workspace && !bundle?.profile?.onboarding_completed) return "/onboarding"
      if (bundle?.workspace) return "/app"
      if (bundle?.platformAdmin) return "/platform"
      return "/onboarding"
    },
    [refreshData]
  )

  const addRequest = useCallback(
    async (payload: CreateRequestPayload) => {
      await apiRequest("/api/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateRequest = useCallback(
    async (id: string, updates: Partial<Request>) => {
      await apiRequest(`/api/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: updates.status,
          priority: updates.priority,
          assigneeId: updates.assigneeId,
          title: updates.title,
          description: updates.description,
          tags: updates.tags,
        }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const addComment = useCallback(
    async (requestId: string, content: string) => {
      await apiRequest(`/api/requests/${requestId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const createArticle = useCallback(
    async (payload: CreateArticlePayload) => {
      await apiRequest("/api/articles", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const createView = useCallback(
    async (payload: CreateViewPayload) => {
      await apiRequest("/api/views", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateArticle = useCallback(
    async (id: string, payload: CreateArticlePayload) => {
      await apiRequest(`/api/articles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const deleteArticle = useCallback(
    async (id: string) => {
      await apiRequest(`/api/articles/${id}`, {
        method: "DELETE",
      })
      await refreshData()
    },
    [refreshData]
  )

  const inviteMember = useCallback(
    async ({ email, role, teamId }: InvitePayload) => {
      const response = await apiRequest<InviteMemberResult>("/api/invitations", {
        method: "POST",
        body: JSON.stringify({ email, role, teamId }),
      })
      await refreshData()
      return response
    },
    [refreshData]
  )

  const updateWorkspace = useCallback(
    async ({ name, description }: { name: string; description: string }) => {
      await apiRequest("/api/settings/workspace", {
        method: "PATCH",
        body: JSON.stringify({ name, description }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateProfile = useCallback(
    async ({ name, email, teamId }: { name: string; email: string; teamId?: string | null }) => {
      await apiRequest("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, email, teamId }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      await apiRequest("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: user?.name,
          email: user?.email,
          teamId: user?.teamId ?? null,
          avatarUrl,
        }),
      })
      await refreshData()
    },
    [refreshData, user?.email, user?.name, user?.teamId]
  )

  const updateMemberRole = useCallback(
    async (memberId: string, role: "admin" | "member") => {
      await apiRequest(`/api/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateMemberTeam = useCallback(
    async (memberId: string, teamId: string | null) => {
      await apiRequest(`/api/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ teamId }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const removeMember = useCallback(
    async (memberId: string) => {
      await apiRequest(`/api/members/${memberId}`, {
        method: "DELETE",
      })
      await refreshData()
    },
    [refreshData]
  )

  const createTeam = useCallback(
    async (payload: CreateTeamPayload) => {
      await apiRequest("/api/teams", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const updateTeam = useCallback(
    async (id: string, payload: CreateTeamPayload) => {
      await apiRequest(`/api/teams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      await refreshData()
    },
    [refreshData]
  )

  const deleteTeam = useCallback(
    async (id: string) => {
      await apiRequest(`/api/teams/${id}`, {
        method: "DELETE",
      })
      await refreshData()
    },
    [refreshData]
  )

  const addGlobalMessage = useCallback(
    async (content: string) => {
      await apiRequest("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      await refreshData()
    },
    [refreshData]
  )

  const saveRolePermissions = useCallback(
    async (role: "member", payload: RolePermissions) => {
      const response = await apiRequest<{ permissionSettings: WorkspacePermissionSettings }>("/api/settings/permissions", {
        method: "PATCH",
        body: JSON.stringify({ role, ...payload }),
      })
      setPermissionSettings(response.permissionSettings)
    },
    []
  )

  const hasPermission = useCallback(
    (permission: WorkspacePermissionKey) => {
      const role = user?.role === "admin" ? "admin" : "member"
      return permissionSettings[role][permission]
    },
    [permissionSettings, user?.role]
  )

  const savePreferences = useCallback(
    async (payload: Partial<UserPreferences>) => {
      const nextPreferences = { ...preferences, ...payload }
      await apiRequest("/api/preferences/appearance", {
        method: "PATCH",
        body: JSON.stringify(nextPreferences),
      })
      setPreferences(nextPreferences)
    },
    [preferences]
  )

  const saveNotificationPreferences = useCallback(
    async (payload: NotificationPreferences) => {
      await apiRequest("/api/preferences/notifications", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setNotificationPreferences(payload)
    },
    []
  )

  return (
    <AppContext.Provider
      value={{
        authUser,
        platformAdmin,
        onboardingCompleted,
        user,
        workspace,
        users,
        teams,
        requests,
        comments,
        messages,
        articles,
        views,
        invitations,
        permissionSettings,
        preferences,
        notificationPreferences,
        loading,
        isAuthenticated: Boolean(authUser),
        selectedRequestId,
        setSelectedRequestId,
        isCommandBarOpen,
        setIsCommandBarOpen,
        isNewRequestOpen,
        setIsNewRequestOpen,
        activeView,
        setActiveView,
        refreshData,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        updatePassword,
        completeOnboarding,
        acceptInvitation,
        addRequest,
        updateRequest,
        addComment,
        createArticle,
        updateArticle,
        deleteArticle,
        createView,
        inviteMember,
        updateWorkspace,
        updateProfile,
        updateAvatar,
        updateMemberRole,
        updateMemberTeam,
        removeMember,
        createTeam,
        updateTeam,
        deleteTeam,
        addGlobalMessage,
        saveRolePermissions,
        hasPermission,
        savePreferences,
        saveNotificationPreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
