import { NextRequest, NextResponse } from "next/server"
import { requireWorkspacePermission } from "@/lib/server/route-helpers"
import { uploadImageToCloudflare } from "@/lib/server/cloudflare-images"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { bundle, error } = await requireWorkspacePermission("manageSettings")
  if (error || !bundle) return error

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas imagens sao permitidas." }, { status: 400 })
  }

  try {
    const upload = await uploadImageToCloudflare({
      file,
      folder: `workspaces/${bundle.workspace.id}/logo`,
    })

    const supabase = await getSupabaseServerClient()
    const { error: workspaceError } = await supabase
      .from("workspaces")
      .update({ logo_url: upload.url })
      .eq("id", bundle.workspace.id)

    if (workspaceError) {
      return NextResponse.json({ error: workspaceError.message }, { status: 400 })
    }

    return NextResponse.json(upload)
  } catch (uploadError) {
    return NextResponse.json(
      { error: uploadError instanceof Error ? uploadError.message : "Falha no upload do logo." },
      { status: 400 }
    )
  }
}
