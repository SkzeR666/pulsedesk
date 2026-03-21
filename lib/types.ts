export type AppRole = "admin" | "member"

export type RequestStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed"

export type RequestPriority = "low" | "medium" | "high" | "urgent"
export type WorkspacePermissionKey =
  | "manageMembers"
  | "manageViews"
  | "manageKnowledge"
  | "manageSettings"
  | "updateRequests"
  | "viewAllRequests"

export interface RolePermissions {
  manageMembers: boolean
  manageViews: boolean
  manageKnowledge: boolean
  manageSettings: boolean
  updateRequests: boolean
  viewAllRequests: boolean
}

export interface WorkspacePermissionSettings {
  admin: RolePermissions
  member: RolePermissions
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: AppRole
  team: string
  teamId: string | null
  createdAt: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  logoUrl: string | null
  createdAt: string
}

export interface Team {
  id: string
  workspaceId: string
  name: string
  description: string
  icon: string
  memberCount: number
}

export interface Request {
  id: string
  workspaceId: string
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  requesterId: string
  assigneeId: string | null
  teamId: string
  tags: string[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  requestId: string
  authorId: string
  content: string
  createdAt: string
}

export interface WorkspaceMessage {
  id: string
  workspaceId: string
  authorId: string
  content: string
  createdAt: string
  authorName: string
  authorAvatar?: string
}

export interface View {
  id: string
  workspaceId: string
  name: string
  icon: string
  filter: {
    status?: RequestStatus[]
    priority?: RequestPriority[]
    teamId?: string
    assigneeId?: string
  }
  isDefault?: boolean
}

export interface KnowledgeArticle {
  id: string
  workspaceId: string
  title: string
  content: string
  category: string
  authorId: string
  createdAt: string
  updatedAt: string
  views: number
}

export interface ArticleComment {
  id: string
  articleId: string
  authorId: string
  content: string
  createdAt: string
}

export interface Invitation {
  id: string
  workspaceId: string
  email: string
  role: AppRole
  teamId: string | null
  token: string
  status: "pending" | "accepted" | "revoked"
  createdAt: string
}

export interface UserPreferences {
  theme: string
  accentColor: string
  sidebarDensity: string
}

export interface NotificationPreferences {
  preferences: Record<string, { email: boolean; push: boolean }>
  dailyDigest: boolean
  weeklyDigest: boolean
}

export interface WaitlistLead {
  id: string
  email: string
  source: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AdminAccessCode {
  id: string
  code: string
  label: string
  kind: "workspace_admin"
  maxUses: number
  usedCount: number
  active: boolean
  expiresAt: string | null
  note: string
  createdAt: string
  updatedAt: string
}
