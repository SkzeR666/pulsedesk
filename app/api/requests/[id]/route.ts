import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspacePermission("updateRequests")
  if (error || !bundle) return error

  const { id } = await params
  const body = await request.json()
  const supabase = await getSupabaseServerClient()

  const { data: requestRows, error: requestError } = await supabase
    .from("requests")
    .select("id, requester_id, assignee_id, workspace_id, status")
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .limit(1)

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 400 })
  }

  const currentRequest = firstRow(requestRows)
  if (!currentRequest) {
    return NextResponse.json({ error: "Request nao encontrado." }, { status: 404 })
  }

  const isWorkspaceAdmin = bundle.user?.role === "admin"
  const canTouchRequest =
    isWorkspaceAdmin ||
    currentRequest.requester_id === bundle.authUser.id ||
    currentRequest.assignee_id === bundle.authUser.id

  if (!canTouchRequest) {
    return NextResponse.json({ error: "Voce nao pode atualizar este request." }, { status: 403 })
  }

  const payload: Record<string, unknown> = {}
  const isResolvedRequest =
    currentRequest.status === "resolved" || currentRequest.status === "closed"

  if (body.status !== undefined) {
    const nextStatus = String(body.status)
    const isReopening = isResolvedRequest && nextStatus !== "resolved" && nextStatus !== "closed"

    if (!isWorkspaceAdmin && isReopening) {
      return NextResponse.json({ error: "Somente admins podem reabrir requests." }, { status: 403 })
    }

    payload.status = body.status
  }

  if (body.priority !== undefined) {
    if (!isWorkspaceAdmin) {
      return NextResponse.json({ error: "Somente admins podem alterar a prioridade." }, { status: 403 })
    }

    payload.priority = body.priority
  }

  if (body.title !== undefined) {
    if (!isWorkspaceAdmin) {
      return NextResponse.json({ error: "Somente admins podem editar o titulo." }, { status: 403 })
    }

    payload.title = body.title
  }

  if (body.description !== undefined) {
    if (!isWorkspaceAdmin) {
      return NextResponse.json({ error: "Somente admins podem editar a descricao." }, { status: 403 })
    }

    payload.description = body.description
  }

  if (body.tags !== undefined) {
    if (!isWorkspaceAdmin) {
      return NextResponse.json({ error: "Somente admins podem editar as tags." }, { status: 403 })
    }

    payload.tags = body.tags
  }

  if (body.assigneeId !== undefined) {
    if (!isWorkspaceAdmin) {
      return NextResponse.json({ error: "Somente admins podem alterar o responsavel." }, { status: 403 })
    }

    const nextAssigneeId = body.assigneeId ?? null

    if (nextAssigneeId) {
      const { data: memberRows, error: memberError } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", bundle.workspace.id)
        .eq("user_id", String(nextAssigneeId))
        .limit(1)

      if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 400 })
      }

      if (!firstRow(memberRows)) {
        return NextResponse.json({ error: "Responsavel invalido para este workspace." }, { status: 400 })
      }
    }

    payload.assignee_id = nextAssigneeId
  }

  const { error: updateError, data } = await supabase
    .from("requests")
    .update(payload)
    .eq("id", id)
    .eq("workspace_id", bundle.workspace.id)
    .select()
    .limit(1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(firstRow(data))
}
