"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User as AuthUser } from "@supabase/supabase-js"
import { toast } from "sonner"
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
  NotificationItem,
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
  assigneeId?: string | null
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
  notifications: NotificationItem[]
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
  updateView: (id: string, payload: CreateViewPayload) => Promise<void>
  deleteView: (id: string) => Promise<void>
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
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
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

function mapNotification(notification: any): NotificationItem {
  return {
    id: notification.id,
    userId: notification.user_id,
    workspaceId: notification.workspace_id,
    type: notification.type,
    title: notification.title,
    body: notification.body ?? "",
    link: notification.link ?? null,
    entityType: notification.entity_type ?? null,
    entityId: notification.entity_id ?? null,
    metadata: notification.metadata ?? {},
    readAt: notification.read_at ?? null,
    createdAt: notification.created_at,
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [activeView, setActiveView] = useState("inbox")
  const realtimeRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasBootstrappedNotificationsRef = useRef(false)
  const previousUnreadIdsRef = useRef<string[]>([])

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
    setNotifications([])
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
        setNotifications([])
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

      setNotifications((bundle.notifications ?? []).map(mapNotification))

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

  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeRefreshTimeoutRef.current) {
      clearTimeout(realtimeRefreshTimeoutRef.current)
    }

    realtimeRefreshTimeoutRef.current = setTimeout(() => {
      void refreshData().catch(() => {
        clearWorkspaceData()
      })
    }, 250)
  }, [clearWorkspaceData, refreshData])

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
    } = supabase.auth.onAuthStateChange((event: string) => {
      if (!["INITIAL_SESSION", "SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
        return
      }

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
      if (realtimeRefreshTimeoutRef.current) {
        clearTimeout(realtimeRefreshTimeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [clearWorkspaceData, refreshData, supabase])

  useEffect(() => {
    if (!authUser || !workspace?.id) {
      return
    }

    const channel = supabase
      .channel(`workspace-sync:${workspace.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${authUser.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_messages",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "request_comments",
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_articles",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "saved_views",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_invitations",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_role_permissions",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspaces",
          filter: `id=eq.${workspace.id}`,
        },
        scheduleRealtimeRefresh
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [authUser, scheduleRealtimeRefresh, supabase, workspace?.id])

  useEffect(() => {
    if (!authUser || !workspace?.id) {
      return
    }

    const intervalId = setInterval(() => {
      void refreshData().catch(() => {
        clearWorkspaceData()
      })
    }, 15000)

    return () => clearInterval(intervalId)
  }, [authUser, clearWorkspaceData, refreshData, workspace?.id])

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

  useEffect(() => {
    const unreadIds = notifications
      .filter((notification) => !notification.readAt)
      .map((notification) => notification.id)

    if (!hasBootstrappedNotificationsRef.current) {
      hasBootstrappedNotificationsRef.current = true
      previousUnreadIdsRef.current = unreadIds
      return
    }

    const previousUnreadIds = new Set(previousUnreadIdsRef.current)
    const newUnreadNotifications = notifications.filter(
      (notification) => !notification.readAt && !previousUnreadIds.has(notification.id)
    )

    for (const notification of newUnreadNotifications.slice(0, 3)) {
      toast(notification.title, {
        description: notification.body || "Voce tem uma nova atualizacao.",
      })
    }

    previousUnreadIdsRef.current = unreadIds
  }, [notifications])

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
      const createdRequest = await apiRequest<any>("/api/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setRequests((current) => [mapRequest(createdRequest), ...current])
      await refreshData()
    },
    [refreshData]
  )

  const updateRequest = useCallback(
    async (id: string, updates: Partial<Request>) => {
      const updatedRequest = await apiRequest<any>(`/api/requests/${id}`, {
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
      const mappedRequest = mapRequest(updatedRequest)
      setRequests((current) =>
        current.map((request) => (request.id === id ? mappedRequest : request))
      )
      await refreshData()
    },
    [refreshData]
  )

  const addComment = useCallback(
    async (requestId: string, content: string) => {
      const createdComment = await apiRequest<any>(`/api/requests/${requestId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      setComments((current) => [...current, mapComment(createdComment)])
      await refreshData()
    },
    [refreshData]
  )

  const createArticle = useCallback(
    async (payload: CreateArticlePayload) => {
      const createdArticle = await apiRequest<any>("/api/articles", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setArticles((current) => [mapArticle(createdArticle), ...current])
      await refreshData()
    },
    [refreshData]
  )

  const createView = useCallback(
    async (payload: CreateViewPayload) => {
      const createdView = await apiRequest<any>("/api/views", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setViews((current) => [...current, mapView(createdView)])
    },
    []
  )

  const updateView = useCallback(
    async (id: string, payload: CreateViewPayload) => {
      const updatedView = await apiRequest<any>(`/api/views/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      const mappedView = mapView(updatedView)
      setViews((current) => current.map((view) => (view.id === id ? mappedView : view)))
    },
    []
  )

  const deleteView = useCallback(
    async (id: string) => {
      await apiRequest(`/api/views/${id}`, {
        method: "DELETE",
      })
      setViews((current) => current.filter((view) => view.id !== id))
    },
    []
  )

  const updateArticle = useCallback(
    async (id: string, payload: CreateArticlePayload) => {
      const updatedArticle = await apiRequest<any>(`/api/articles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      const mappedArticle = mapArticle(updatedArticle)
      setArticles((current) =>
        current.map((article) => (article.id === id ? mappedArticle : article))
      )
      await refreshData()
    },
    [refreshData]
  )

  const deleteArticle = useCallback(
    async (id: string) => {
      await apiRequest(`/api/articles/${id}`, {
        method: "DELETE",
      })
      setArticles((current) => current.filter((article) => article.id !== id))
    },
    []
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
      const createdMessage = await apiRequest<any>("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      setMessages((current) => [...current, mapWorkspaceMessage(createdMessage)])
    },
    []
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

  const markNotificationRead = useCallback(async (id: string) => {
    await apiRequest(`/api/notifications/${id}`, {
      method: "PATCH",
    })
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
          : notification
      )
    )
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await apiRequest("/api/notifications", {
      method: "PATCH",
    })
    const now = new Date().toISOString()
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? now,
      }))
    )
  }, [])

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
        notifications,
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
        updateView,
        deleteView,
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
        markNotificationRead,
        markAllNotificationsRead,
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
