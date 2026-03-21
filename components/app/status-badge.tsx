'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  className?: string
}

const statusConfig = {
  new: {
    label: 'Novo',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-600',
  },
  'in-progress': {
    label: 'Em Progresso',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    dotColor: 'bg-yellow-600',
  },
  resolved: {
    label: 'Resolvido',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    dotColor: 'bg-green-600',
  },
  closed: {
    label: 'Fechado',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-600',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <div className={cn('h-2 w-2 rounded-full', config.dotColor)} />
      {config.label}
    </div>
  )
}
