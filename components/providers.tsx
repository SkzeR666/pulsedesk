'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AppProvider } from '@/lib/app-context'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AppProvider>
                {children}
                <Toaster richColors position="top-right" />
            </AppProvider>
        </NextThemesProvider>
    )
}
