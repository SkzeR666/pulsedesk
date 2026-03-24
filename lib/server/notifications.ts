import { DEFAULT_NOTIFICATION_PREFERENCES, notificationTypeLabels } from "@/lib/constants"
import type { NotificationType } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

interface NotificationRecipient {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string | null
  entityType?: "request" | "comment" | "article" | "workspace" | "member"
  entityId?: string | null
  metadata?: Record<string, unknown>
}

export function extractMentionedUserIds(content: string, users: Array<{ id: string; email?: string; name?: string }>) {
  const normalized = content.toLowerCase()
  const mentioned = new Set<string>()

  for (const user of users) {
    const emailToken = user.email?.split("@")[0]?.toLowerCase()
    const nameTokens = (user.name ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    if (emailToken && normalized.includes(`@${emailToken}`)) {
      mentioned.add(user.id)
      continue
    }

    if (nameTokens.some((token) => token.length >= 3 && normalized.includes(`@${token}`))) {
      mentioned.add(user.id)
    }
  }

  return [...mentioned]
}

async function getPushEnabledUserIds(userIds: string[], type: NotificationType) {
  if (userIds.length === 0) {
    return []
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await (supabase.from as any)("notification_preferences")
    .select("user_id, preferences")
    .in("user_id", userIds)

  if (error) {
    throw error
  }

  const enabled = new Set<string>()
  const seen = new Set<string>()

  for (const row of (data as Array<{ user_id: string; preferences: Record<string, unknown> }> | null) ?? []) {
    seen.add(row.user_id)
    const mergedPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(row.preferences ?? {}),
    } as Record<string, { push?: boolean }>

    if (mergedPreferences[type]?.push ?? false) {
      enabled.add(row.user_id)
    }
  }

  for (const userId of userIds) {
    if (!seen.has(userId) && DEFAULT_NOTIFICATION_PREFERENCES[type]?.push) {
      enabled.add(userId)
    }
  }

  return [...enabled]
}

export async function createNotifications(
  workspaceId: string,
  recipients: NotificationRecipient[],
  actorUserId?: string,
  options?: { includeActor?: boolean }
) {
  const deduped = new Map<string, NotificationRecipient>()

  for (const recipient of recipients) {
    if (!recipient.userId) {
      continue
    }

    if (!options?.includeActor && recipient.userId === actorUserId) {
      continue
    }

    const key = [
      recipient.userId,
      recipient.type,
      recipient.entityType ?? "",
      recipient.entityId ?? "",
      recipient.title,
    ].join(":")

    if (!deduped.has(key)) {
      deduped.set(key, recipient)
    }
  }

  const rows = [...deduped.values()]
  if (rows.length === 0) {
    return
  }

  const typeByUser = new Map<string, NotificationType[]>()
  for (const row of rows) {
    const current = typeByUser.get(row.userId) ?? []
    current.push(row.type)
    typeByUser.set(row.userId, current)
  }

  const enabledUserIds = new Set<string>()
  for (const [userId, types] of typeByUser.entries()) {
    const enabledTypes = await Promise.all(types.map((type) => getPushEnabledUserIds([userId], type)))
    if (enabledTypes.some((list) => list.includes(userId))) {
      enabledUserIds.add(userId)
    }
  }

  const payload = rows
    .filter((row) => enabledUserIds.has(row.userId))
    .map((row) => ({
      user_id: row.userId,
      workspace_id: workspaceId,
      type: row.type,
      title: row.title || notificationTypeLabels[row.type],
      body: row.body ?? "",
      link: row.link ?? null,
      entity_type: row.entityType ?? null,
      entity_id: row.entityId ?? null,
      metadata: row.metadata ?? {},
    }))

  if (payload.length === 0) {
    return
  }

  const admin = getSupabaseAdminClient()
  const { error } = await (admin.from as any)("notifications").insert(payload)

  if (error) {
    throw error
  }
}
