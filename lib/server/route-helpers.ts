import { NextResponse } from "next/server"
import { DEFAULT_WORKSPACE_PERMISSION_SETTINGS } from "@/lib/constants"
import { getAppBundle } from "@/lib/server/app-bundle"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { WorkspacePermissionKey } from "@/lib/types"

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

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function requireSupabaseUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error && isLoggedOutAuthError(error)) {
    return { error: apiError("Unauthorized", 401), supabase, user: null }
  }

  if (error || !user) {
    return { error: apiError("Unauthorized", 401), supabase, user: null }
  }

  return { supabase, user, error: null }
}

export async function getIsPlatformAdmin() {
  const { supabase, user, error } = await requireSupabaseUser()
  if (error || !user) {
    return { error, isPlatformAdmin: false, supabase, user: null as typeof user }
  }

  const email = user.email?.toLowerCase() ?? ""
  const allowedEmails = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  if (email && allowedEmails.includes(email)) {
    return { error: null, isPlatformAdmin: true, supabase, user }
  }

  const adminFilters = [`user_id.eq.${user.id}`]
  if (email) {
    adminFilters.push(`email.eq.${email}`)
  }

  const { data, error: adminError } = await supabase
    .from("platform_admins")
    .select("id")
    .or(adminFilters.join(","))
    .limit(1)
    .returns<Array<{ id: string }>>()

  if (adminError && !isIgnorablePlatformAdminError(adminError)) {
    return { error: apiError(adminError.message, 500), isPlatformAdmin: false, supabase, user }
  }

  return { error: null, isPlatformAdmin: Boolean(data?.[0]), supabase, user }
}

export async function requirePlatformAdmin() {
  const result = await getIsPlatformAdmin()

  if (result.error) {
    return { error: result.error, supabase: result.supabase, user: result.user }
  }

  if (!result.isPlatformAdmin || !result.user) {
    return {
      error: apiError("Forbidden", 403),
      supabase: result.supabase,
      user: result.user,
    }
  }

  return result
}

export async function requireWorkspaceContext() {
  const bundle = await getAppBundle()

  if (!bundle.authUser) {
    return { error: apiError("Unauthorized", 401), bundle: null }
  }

  if (!bundle.workspace) {
    return { error: apiError("Workspace not found", 404), bundle: null }
  }

  return { bundle, error: null }
}

export async function requireWorkspaceAdmin() {
  const result = await requireWorkspaceContext()

  if (result.error || !result.bundle) {
    return result
  }

  const role = result.bundle.user?.role ?? result.bundle.membership?.role

  if (role !== "admin") {
    return { error: apiError("Forbidden", 403), bundle: null }
  }

  return result
}

export function hasWorkspacePermission(bundle: any, permission: WorkspacePermissionKey) {
  const role = bundle.user?.role ?? bundle.membership?.role ?? "member"
  const settings = bundle.permissionSettings ?? DEFAULT_WORKSPACE_PERMISSION_SETTINGS
  return Boolean(settings[role]?.[permission])
}

export async function requireWorkspacePermission(permission: WorkspacePermissionKey) {
  const result = await requireWorkspaceContext()

  if (result.error || !result.bundle) {
    return result
  }

  if (!hasWorkspacePermission(result.bundle, permission)) {
    return { error: apiError("Forbidden", 403), bundle: null }
  }

  return result
}
