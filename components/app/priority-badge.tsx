'use client'

import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  className?: string
}

const priorityConfig = {
  low: {
    label: 'Baixa',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  medium: {
    label: 'Média',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  high: {
    label: 'Alta',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  urgent: {
    label: 'Urgente',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </div>
  )
}
