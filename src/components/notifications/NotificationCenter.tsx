import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, ExternalLink, AlertCircle, TrendingUp, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NotificationService, { type Notification, type NotificationType } from '@/services/NotificationService'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  occupancy_alert: <AlertCircle className="h-4 w-4" />,
  revenue_alert: <TrendingUp className="h-4 w-4" />,
  system_alert: <Settings className="h-4 w-4" />,
  report_ready: <FileText className="h-4 w-4" />,
  custom: <Bell className="h-4 w-4" />
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
}

interface NotificationCenterProps {
  maxNotifications?: number
  showMarkAllAsRead?: boolean
  showClearAll?: boolean
}

export function NotificationCenter({ 
  maxNotifications = 20, 
  showMarkAllAsRead = true,
  showClearAll = true 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load initial notifications
    updateNotifications()

    // Subscribe to new notifications
    const unsubscribe = NotificationService.subscribe((newNotification) => {
      updateNotifications()
    })

    // Check for new alerts periodically
    const interval = setInterval(() => {
      NotificationService.checkForAlerts()
    }, 60 * 1000) // Every minute

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const updateNotifications = () => {
    const allNotifications = NotificationService.getNotifications()
    const unread = NotificationService.getUnreadNotifications()
    
    setNotifications(allNotifications.slice(0, maxNotifications))
    setUnreadCount(unread.length)
  }

  const handleMarkAsRead = (notificationId: string) => {
    NotificationService.markAsRead(notificationId)
    updateNotifications()
  }

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead()
    updateNotifications()
  }

  const handleDelete = (notificationId: string) => {
    NotificationService.deleteNotification(notificationId)
    updateNotifications()
  }

  const handleClearAll = () => {
    NotificationService.clearAll()
    updateNotifications()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: de 
    })
  }

  if (notifications.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Keine Benachrichtigungen</h3>
            <p className="text-muted-foreground">
              Sie haben derzeit keine Benachrichtigungen.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} neu
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showMarkAllAsRead && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 gap-1"
              >
                <Check className="h-3 w-3" />
                Alle als gelesen markieren
              </Button>
            )}
            {showClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 gap-1 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Alle löschen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                  notification.read ? 'opacity-75' : 'bg-muted/30'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.read ? 'bg-muted' : 'bg-primary/10'
                  }`}>
                    {notificationIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${priorityColors[notification.priority]}`}
                      >
                        {notification.priority === 'high' ? 'Hoch' : 
                         notification.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = notification.actionUrl!
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Öffnen
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {notification.read ? 'Gelesen' : 'Als gelesen markieren'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border" />
        
        <div className="p-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // In a real app, this would navigate to a notifications page
              console.log('View all notifications')
            }}
          >
            Alle Benachrichtigungen anzeigen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
