'use client'

import { RouterProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AppProvider } from '@/lib/app-context'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    return (
        <RouterProvider navigate={router.push}>
            <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <AppProvider>
                    {children}
                    <Toaster richColors position="top-right" />
                </AppProvider>
            </NextThemesProvider>
        </RouterProvider>
    )
}
