"use client"

import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { AppSidebar } from "@/components/app/sidebar"
import { AppearanceSync } from "@/components/app/appearance-sync"
import { CommandBar } from "@/components/app/command-bar"
import { NewRequestModal } from "@/components/app/new-request-modal"

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { setIsCommandBarOpen, loading, isAuthenticated, workspace, onboardingCompleted } =
    useApp()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandBarOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [setIsCommandBarOpen])

  if (loading || !isAuthenticated || !workspace || !onboardingCompleted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppearanceSync />
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
      <CommandBar />
      <NewRequestModal />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>
}
