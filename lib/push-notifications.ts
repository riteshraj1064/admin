import axiosInstance from "./axios"

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
  priority?: "low" | "medium" | "high"
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface SendPushRequest extends PushNotificationPayload {
  recipients: {
    type: "all" | "user" | "batch"
    userId?: string
    userIds?: string[]
  }
}

class PushNotificationManager {
  private vapidPublicKey: string
  private subscription: PushSubscription | null = null

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
  }

  // Initialize push notifications
  async init(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported")
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        this.subscription = existingSubscription as any
        return true
      }

      return false
    } catch (error) {
      console.error("Failed to initialize push notifications:", error)
      return false
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push notifications not supported")
    }

    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      })

      this.subscription = subscription as any

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription as any)

      return subscription as any
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      throw error
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      const success = await this.subscription.unsubscribe()
      if (success) {
        await this.removeSubscriptionFromServer()
        this.subscription = null
      }
      return success
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error)
      return false
    }
  }

  // Send push notification to specific user
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<any> {
    try {
      const response = await axiosInstance.post(`/push/user/${userId}`, payload)
      return response.data
    } catch (error) {
      console.error("Failed to send push notification to user:", error)
      throw error
    }
  }

  // Send push notification to all users
  async sendToAll(payload: PushNotificationPayload): Promise<any> {
    try {
      const response = await axiosInstance.post("/push/all", payload)
      return response.data
    } catch (error) {
      console.error("Failed to send push notification to all users:", error)
      throw error
    }
  }

  // Send push notification to batch of users
  async sendToBatch(userIds: string[], payload: PushNotificationPayload): Promise<any> {
    try {
      const response = await axiosInstance.post("/push/batch", {
        userIds,
        ...payload,
      })
      return response.data
    } catch (error) {
      console.error("Failed to send push notification to batch:", error)
      throw error
    }
  }

  // Send notification based on recipients configuration
  async sendNotification(request: SendPushRequest): Promise<any> {
    const { recipients, ...payload } = request

    switch (recipients.type) {
      case "all":
        return this.sendToAll(payload)

      case "user":
        if (!recipients.userId) {
          throw new Error("User ID is required for user-specific notifications")
        }
        return this.sendToUser(recipients.userId, payload)

      case "batch":
        if (!recipients.userIds || recipients.userIds.length === 0) {
          throw new Error("User IDs are required for batch notifications")
        }
        return this.sendToBatch(recipients.userIds, payload)

      default:
        throw new Error("Invalid recipient type")
    }
  }

  // Get current subscription status
  getSubscription(): PushSubscription | null {
    return this.subscription
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window
  }

  // Check if user has granted permission
  async getPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied"
    }
    return Notification.permission
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied"
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  // Helper methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await axiosInstance.post("/api/push/subscribe", {
        subscription: subscription,
      })
    } catch (error) {
      console.error("Failed to send subscription to server:", error)
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await axiosInstance.post("/api/push/unsubscribe")
    } catch (error) {
      console.error("Failed to remove subscription from server:", error)
    }
  }
}

export const pushNotificationManager = new PushNotificationManager()
