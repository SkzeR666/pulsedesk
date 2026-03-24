'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Settings,
  Users,
  Shield,
  Palette,
  Bell,
} from 'lucide-react'

const settingsLinks = [
  {
    label: 'Configurações da Workspace',
    href: '/app/settings',
    icon: Settings,
  },
  {
    label: 'Membros',
    href: '/app/settings/members',
    icon: Users,
  },
  {
    label: 'Permissões',
    href: '/app/settings/permissions',
    icon: Shield,
  },
  {
    label: 'Aparência',
    href: '/app/settings/appearance',
    icon: Palette,
  },
  {
    label: 'Notificações',
    href: '/app/settings/notifications',
    icon: Bell,
  },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {settingsLinks.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-background-interactive text-foreground font-medium'
                : 'text-foreground-muted hover:bg-background-interactive hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
