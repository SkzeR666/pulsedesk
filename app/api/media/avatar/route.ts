import { NextRequest, NextResponse } from "next/server"
import { requireSupabaseUser } from "@/lib/server/route-helpers"
import { uploadImageToCloudflare } from "@/lib/server/cloudflare-images"

export async function POST(request: NextRequest) {
  const { supabase, user, error } = await requireSupabaseUser()
  if (error || !user) return error

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
      folder: `profiles/${user.id}/avatar`,
    })

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: upload.url })
      .eq("id", user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json(upload)
  } catch (uploadError) {
    return NextResponse.json(
      { error: uploadError instanceof Error ? uploadError.message : "Falha no upload do avatar." },
      { status: 400 }
    )
  }
}
