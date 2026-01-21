/**
 * Notification Service
 * Handles email and push notifications for the application
 */

export type NotificationType = 
  | 'occupancy_alert' 
  | 'revenue_alert' 
  | 'system_alert' 
  | 'report_ready'
  | 'custom'

export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface EmailNotificationOptions {
  to: string
  subject: string
  body: string
  htmlBody?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

export interface PushNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: Record<string, any>
  requireInteraction?: boolean
  silent?: boolean
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private notificationListeners: Array<(notification: Notification) => void> = []

  private constructor() {
    this.loadNotifications()
    this.setupPeriodicChecks()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('app-notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      this.notifications = []
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('app-notifications', JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  private setupPeriodicChecks(): void {
    // Check for alerts every 5 minutes
    setInterval(() => {
      this.checkForAlerts()
    }, 5 * 60 * 1000)
  }

  /**
   * Check for system alerts based on current data
   */
  async checkForAlerts(): Promise<void> {
    // In a real application, this would check actual data
    // For now, we'll simulate some alerts
    const mockAlerts = [
      {
        type: 'occupancy_alert' as NotificationType,
        title: 'Hohe Belegungsrate',
        message: 'Die Belegungsrate liegt über 90%',
        priority: 'medium' as NotificationPriority
      },
      {
        type: 'revenue_alert' as NotificationType,
        title: 'Umsatzwachstum',
        message: 'Umsatz ist um 15% gestiegen im Vergleich zum Vorjahr',
        priority: 'low' as NotificationPriority
      }
    ]

    for (const alert of mockAlerts) {
      // Check if similar alert already exists recently
      const recentAlert = this.notifications.find(n => 
        n.type === alert.type && 
        Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000 // Within 24 hours
      )

      if (!recentAlert) {
        await this.createNotification({
          ...alert,
          id: this.generateId(),
          timestamp: new Date(),
          read: false
        })
      }
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create a new notification
   */
  async createNotification(notification: Omit<Notification, 'id'> & { id?: string }): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: notification.id || this.generateId(),
      timestamp: notification.timestamp || new Date(),
      read: notification.read || false
    }

    this.notifications.unshift(newNotification)
    this.saveNotifications()
    
    // Notify listeners
    this.notificationListeners.forEach(listener => listener(newNotification))

    // Send actual notifications based on user settings
    await this.sendActualNotifications(newNotification)

    return newNotification
  }

  /**
   * Send actual notifications (email/push) based on user settings
   */
  private async sendActualNotifications(notification: Notification): Promise<void> {
    // In a real application, this would:
    // 1. Check user notification preferences
    // 2. Send email if enabled
    // 3. Send push notification if enabled and permission granted
    
    console.log('Would send notification:', notification)
    
    // Mock implementation
    if (this.shouldSendEmail(notification)) {
      await this.sendEmailNotification({
        to: 'user@example.com', // Would come from user profile
        subject: notification.title,
        body: notification.message,
        htmlBody: `<p>${notification.message}</p>`
      })
    }

    if (this.shouldSendPush(notification)) {
      await this.sendPushNotification({
        title: notification.title,
        body: notification.message,
        icon: '/notification-icon.png',
        data: { notificationId: notification.id }
      })
    }
  }

  private shouldSendEmail(notification: Notification): boolean {
    // Check user preferences from settings
    const settings = this.getUserSettings()
    return settings.emailAlerts && 
           (notification.priority === 'high' || 
            (notification.priority === 'medium' && settings.emailForMediumAlerts) ||
            notification.type === 'system_alert')
  }

  private shouldSendPush(notification: Notification): boolean {
    // Check user preferences and browser permission
    const settings = this.getUserSettings()
    const hasPermission = this.checkPushPermission()
    
    return settings.browserNotifications && 
           hasPermission &&
           (notification.priority === 'high' || 
            (notification.priority === 'medium' && settings.pushForMediumAlerts))
  }

  private getUserSettings(): any {
    // In a real app, this would get from SettingsContext
    try {
      const stored = localStorage.getItem('app-settings')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to get user settings:', error)
    }
    
    return {
      emailAlerts: true,
      browserNotifications: false,
      emailForMediumAlerts: true,
      pushForMediumAlerts: false
    }
  }

  private checkPushPermission(): boolean {
    // Check if browser supports notifications and permission is granted
    if (!('Notification' in window)) {
      return false
    }
    
    return Notification.permission === 'granted'
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  /**
   * Send email notification (mock implementation)
   */
  async sendEmailNotification(options: EmailNotificationOptions): Promise<boolean> {
    console.log('Mock email sent:', options)
    // In a real application, this would integrate with an email service
    // like SendGrid, AWS SES, etc.
    return true
  }

  /**
   * Send push notification
   */
  async sendPushNotification(options: PushNotificationOptions): Promise<boolean> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        silent: options.silent
      }

      // Note: 'image' is not part of the standard NotificationOptions
      // Some browsers support it, but TypeScript doesn't include it
      // We'll omit it for compatibility

      const notification = new Notification(options.title, notificationOptions)

      notification.onclick = () => {
        window.focus()
        notification.close()
        
        if (options.data?.notificationId) {
          this.markAsRead(options.data.notificationId)
        }
      }

      return true
    } catch (error) {
      console.error('Failed to send push notification:', error)
      return false
    }
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read)
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.saveNotifications()
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.saveNotifications()
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = []
    this.saveNotifications()
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(listener: (notification: Notification) => void): () => void {
    this.notificationListeners.push(listener)
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener)
    }
  }

  /**
   * Create a test notification
   */
  async createTestNotification(type: NotificationType = 'system_alert'): Promise<Notification> {
    const testNotifications: Record<NotificationType, Omit<Notification, 'id' | 'timestamp' | 'read'>> = {
      occupancy_alert: {
        type: 'occupancy_alert',
        title: 'Test: Hohe Belegungsrate',
        message: 'Dies ist eine Testbenachrichtigung für Belegungsalarme.',
        priority: 'medium'
      },
      revenue_alert: {
        type: 'revenue_alert',
        title: 'Test: Umsatzänderung',
        message: 'Dies ist eine Testbenachrichtigung für Umsatzalarme.',
        priority: 'low'
      },
      system_alert: {
        type: 'system_alert',
        title: 'Test: Systembenachrichtigung',
        message: 'Dies ist eine Testbenachrichtigung für Systemalarme.',
        priority: 'high'
      },
      report_ready: {
        type: 'report_ready',
        title: 'Test: Bericht bereit',
        message: 'Ihr monatlicher Bericht ist jetzt verfügbar.',
        priority: 'low',
        actionUrl: '/reports'
      },
      custom: {
        type: 'custom',
        title: 'Test: Benutzerdefinierte Benachrichtigung',
        message: 'Dies ist eine benutzerdefinierte Testbenachrichtigung.',
        priority: 'medium'
      }
    }

    return this.createNotification({
      ...testNotifications[type],
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    })
  }
}

export default NotificationService.getInstance()
