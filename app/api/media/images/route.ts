import { NextRequest, NextResponse } from "next/server"
import { requireWorkspaceContext } from "@/lib/server/route-helpers"
import { uploadImageToCloudflare } from "@/lib/server/cloudflare-images"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspaceContext()
  if (error || !bundle) return error

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas imagens sao permitidas por enquanto." }, { status: 400 })
  }

  try {
    const upload = await uploadImageToCloudflare({
      file,
      folder: `workspaces/${bundle.workspace.id}/images`,
    })

    return NextResponse.json({
      ...upload,
      workspaceId: bundle.workspace.id,
    })
  } catch (uploadError) {
    return NextResponse.json(
      { error: uploadError instanceof Error ? uploadError.message : "Falha no upload." },
      { status: 400 }
    )
  }
}
