import { NextRequest, NextResponse } from "next/server"
import { createNotifications, extractMentionedUserIds } from "@/lib/server/notifications"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireSupabaseUser, requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { user, error: userError } = await requireSupabaseUser()
  if (userError || !user) return userError

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { data: requestRows, error: requestError } = await supabase
    .from("requests")
    .select("id, title, requester_id, assignee_id")
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .limit(1)

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 400 })
  }

  const requestRow = firstRow(requestRows)
  if (!requestRow) {
    return NextResponse.json({ error: "Request nao encontrado." }, { status: 404 })
  }

  const { error: insertError, data } = await supabase
    .from("request_comments")
    .insert({
      request_id: id,
      author_id: user.id,
      content: body.content,
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  const comment = firstRow(data)

  const { data: memberRows, error: membersError } = await supabase
    .from("workspace_members")
    .select("user_id, profiles(name, email)")
    .eq("workspace_id", bundle.workspace.id)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 400 })
  }

  const workspaceUsers = (memberRows ?? []).map((member: any) => ({
    id: member.user_id,
    name: member.profiles?.name ?? "",
    email: member.profiles?.email ?? "",
  }))

  const recipients = new Set<string>([requestRow.requester_id, requestRow.assignee_id].filter(Boolean))
  const mentionedUserIds = extractMentionedUserIds(String(body.content ?? ""), workspaceUsers)

  await createNotifications(
    bundle.workspace.id,
    [
      ...[...recipients].map((userId) => ({
        userId,
        type: "comment" as const,
        title: "Novo comentario em request",
        body: requestRow.title,
        link: "/app",
        entityType: "comment" as const,
        entityId: comment?.id ?? null,
        metadata: { requestId: requestRow.id, commentId: comment?.id ?? null },
      })),
      ...mentionedUserIds.map((userId) => ({
        userId,
        type: "mention" as const,
        title: "Voce foi mencionado em um comentario",
        body: requestRow.title,
        link: "/app",
        entityType: "comment" as const,
        entityId: comment?.id ?? null,
        metadata: { requestId: requestRow.id, commentId: comment?.id ?? null },
      })),
    ],
    user.id
  )

  return NextResponse.json(comment)
}
