"use client"

import { useRouter } from "next/navigation"
import { Bell, CheckCheck } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

interface NotificationsMenuProps {
  compact?: boolean
}

export function NotificationsMenu({ compact = false }: NotificationsMenuProps) {
  const router = useRouter()
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedRequestId,
  } = useApp()

  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  const handleOpen = async (notificationId: string, link: string | null, requestId?: string) => {
    await markNotificationRead(notificationId)

    if (requestId) {
      setSelectedRequestId(requestId)
    }

    router.push(link ?? "/app")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={cn(
            compact ? "h-14 w-full rounded-xl" : "w-full justify-between rounded-xl px-3 py-2.5",
            "relative"
          )}
        >
          <span className={cn("flex items-center gap-3", compact && "justify-center")}>
            <Bell className="h-4 w-4" />
            {!compact ? <span className="text-sm">Notificacoes</span> : null}
          </span>
          {unreadCount > 0 ? (
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground",
                compact ? "absolute right-3 top-3 h-5" : "h-5"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notificacoes</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} nao lidas` : "Tudo em dia"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void markAllNotificationsRead()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Ler tudo
          </Button>
        </div>

        <ScrollArea className="max-h-[420px]">
          <div className="divide-y divide-border">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const requestId = String(notification.metadata?.requestId ?? "") || undefined

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleOpen(notification.id, notification.link, requestId)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors hover:bg-muted/40",
                      !notification.readAt && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          notification.readAt ? "bg-muted" : "bg-primary"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium leading-5">{notification.title}</p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt)}
                          </span>
                        </div>
                        {notification.body ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {notification.body}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium">Nenhuma notificacao ainda</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quando algo importante acontecer, vai aparecer aqui.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
