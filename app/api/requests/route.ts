import { NextRequest, NextResponse } from "next/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { createNotifications } from "@/lib/server/notifications"
import { firstRow } from "@/lib/server/supabase-results"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const body = await request.json()
  const supabase = await getSupabaseServerClient()
  const isWorkspaceAdmin = bundle.user?.role === "admin"
  const inheritedTeamId = bundle.user?.teamId ?? bundle.membership?.team_id ?? null

  if (!isWorkspaceAdmin && !inheritedTeamId) {
    return NextResponse.json(
      { error: "Seu usuario precisa estar vinculado a um setor para abrir requests." },
      { status: 400 }
    )
  }

  const { error: insertError, data } = await supabase
    .from("requests")
    .insert({
      workspace_id: bundle.workspace.id,
      title: body.title,
      description: body.description ?? "",
      status: "open",
      priority: isWorkspaceAdmin ? body.priority ?? "medium" : "medium",
      requester_id: bundle.authUser.id,
      assignee_id: isWorkspaceAdmin ? body.assigneeId ?? null : null,
      team_id: isWorkspaceAdmin ? body.teamId : inheritedTeamId,
      tags: isWorkspaceAdmin ? body.tags ?? [] : [],
    })
    .select()
    .limit(1)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  const createdRequest = firstRow(data)

  const { data: memberRows, error: membersError } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", bundle.workspace.id)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 400 })
  }

  const adminIds = (memberRows ?? [])
    .filter((member: any) => member.role === "admin")
    .map((member: any) => member.user_id)

  await createNotifications(
    bundle.workspace.id,
    [
      ...adminIds.map((userId) => ({
        userId,
        type: "new-request" as const,
        title: "Novo request criado",
        body: `${bundle.user?.name ?? "Alguem"} abriu "${createdRequest?.title ?? body.title}".`,
        link: "/app",
        entityType: "request" as const,
        entityId: createdRequest?.id ?? null,
        metadata: { requestId: createdRequest?.id ?? null },
      })),
      ...(createdRequest?.assignee_id
        ? [
            {
              userId: createdRequest.assignee_id,
              type: "assigned" as const,
              title: "Um request foi atribuido a voce",
              body: createdRequest.title,
              link: "/app",
              entityType: "request" as const,
              entityId: createdRequest.id,
              metadata: { requestId: createdRequest.id },
            },
          ]
        : []),
    ],
    bundle.authUser.id
  )

  return NextResponse.json(createdRequest)
}
