"use client"

import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/lib/app-context"
import { NeoDock } from "@/components/app/neo-dock"
import { usePathname } from "next/navigation"
import { AppearanceSync } from "@/components/app/appearance-sync"
import { CommandBar } from "@/components/app/command-bar"
import { NewRequestModal } from "@/components/app/new-request-modal"
import { AppSidebar } from "@/components/app/sidebar"

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { setIsCommandBarOpen, loading, isAuthenticated, workspace, onboardingCompleted } =
    useApp()
  const pathname = usePathname()

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
      <div className="flex h-dvh items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh bg-background text-foreground">
      <AppearanceSync />

      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <main className="min-w-0 flex-1">
        {/* key keeps route-level UI state isolated without affecting behavior */}
        <div key={pathname} className="h-dvh overflow-hidden">
          {children}
        </div>
      </main>

      <NeoDock />
      <CommandBar />
      <NewRequestModal />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>
}
