"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ViewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const view = searchParams.get("view")
    router.replace(view ? `/app?view=${view}` : "/app")
  }, [router, searchParams])

  return null
}
