interface OpenRouterMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

export async function createOpenRouterChatCompletion(messages: OpenRouterMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY nao configurada.")
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://pulsedesk.app",
      "X-Title": process.env.APP_NAME || "PulseDesk",
    },
    body: JSON.stringify({
      model: DEFAULT_OPENROUTER_MODEL,
      messages,
      temperature: 0.2,
    }),
  })

  const data = (await response.json().catch(() => null)) as OpenRouterResponse | { error?: { message?: string } } | null

  if (!response.ok) {
    const message =
      data && "error" in data && data.error?.message
        ? data.error.message
        : "Falha ao consultar o OpenRouter."

    throw new Error(message)
  }

  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("O OpenRouter nao retornou um resumo.")
  }

  return content
}
