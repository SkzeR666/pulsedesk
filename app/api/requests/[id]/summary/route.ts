import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { firstRow } from "@/lib/server/supabase-results"
import { createOpenRouterChatCompletion } from "@/lib/server/openrouter"

function parseSummaryPayload(rawSummary: string) {
  const normalized = rawSummary
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  const parsed = JSON.parse(normalized) as {
    summary?: string
    suggestedReplies?: string[]
  }

  return {
    summary:
      parsed.summary?.trim() ||
      "Este ticket ainda tem pouco contexto registrado, entao vale complementar a descricao para facilitar o atendimento.",
    suggestedReplies: (parsed.suggestedReplies ?? [])
      .map((reply) => reply.trim())
      .filter(Boolean)
      .slice(0, 3),
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: requestRows, error: requestError } = await supabase
    .from("requests")
    .select("id, title, description, status, priority, requester_id, assignee_id, workspace_id")
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

  const canViewRequest =
    bundle.user?.role === "admin" ||
    currentRequest.requester_id === bundle.authUser.id ||
    currentRequest.assignee_id === bundle.authUser.id ||
    bundle.permissionSettings?.[bundle.user?.role === "admin" ? "admin" : "member"]?.viewAllRequests

  if (!canViewRequest) {
    return NextResponse.json({ error: "Voce nao pode acessar este request." }, { status: 403 })
  }

  const { data: commentRows, error: commentsError } = await supabase
    .from("request_comments")
    .select("content, created_at, author_id")
    .eq("request_id", id)
    .order("created_at", { ascending: true })

  if (commentsError) {
    return NextResponse.json({ error: commentsError.message }, { status: 400 })
  }

  const authorIds = Array.from(new Set((commentRows ?? []).map((comment) => comment.author_id).filter(Boolean)))
  let authorNameById = new Map<string, string>()

  if (authorIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", authorIds)

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 400 })
    }

    authorNameById = new Map((profileRows ?? []).map((profile) => [profile.id, profile.name ?? "Membro"]))
  }

  const commentsTranscript = (commentRows ?? [])
    .map((comment) => {
      return `- ${authorNameById.get(comment.author_id) ?? "Membro"} (${comment.created_at}): ${comment.content}`
    })
    .join("\n")

  try {
    const summary = await createOpenRouterChatCompletion([
      {
        role: "system",
        content:
          'Voce ajuda times internos de suporte em portugues do Brasil. Responda apenas JSON valido, sem markdown, sem crases e sem texto extra. Formato obrigatorio: {"summary":"...","suggestedReplies":["...","...","..."]}. O campo summary deve ser um paragrafo natural, claro e curto. As respostas sugeridas devem ser prontas para colar no ticket, soar humanas e objetivas.',
      },
      {
        role: "user",
        content: [
          `Titulo: ${currentRequest.title}`,
          `Descricao: ${currentRequest.description || "Sem descricao."}`,
          `Status: ${currentRequest.status}`,
          `Prioridade: ${currentRequest.priority}`,
          commentsTranscript ? `Comentarios:\n${commentsTranscript}` : "Comentarios: nenhum",
        ].join("\n\n"),
      },
    ])

    return NextResponse.json({ summary: parseSummaryPayload(summary) })
  } catch (summaryError) {
    return NextResponse.json(
      {
        error:
          summaryError instanceof Error
            ? summaryError.message
            : "Nao foi possivel resumir este ticket.",
      },
      { status: 500 }
    )
  }
}
