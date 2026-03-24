"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MyTasksPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/app?scope=mine")
  }, [router])

  return null
}
