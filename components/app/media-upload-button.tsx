"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ImagePlus } from "lucide-react"

interface MediaUploadButtonProps {
  onUploaded: (payload: { url: string; filename: string }) => void
  label?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm"
}

export function MediaUploadButton({
  onUploaded,
  label = "Enviar imagem",
  variant = "outline",
  size = "sm",
}: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    setUploading(true)

    try {
      const response = await fetch("/api/media/images", {
        method: "POST",
        body: formData,
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Falha ao enviar imagem.")
      }

      onUploaded({
        url: data.url,
        filename: data.filename ?? file.name,
      })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Falha ao enviar imagem.")
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Spinner className="mr-2 h-4 w-4" /> : <ImagePlus className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </>
  )
}
