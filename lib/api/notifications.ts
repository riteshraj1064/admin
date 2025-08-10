import { authApiInstance } from "@/lib/axios"

export interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  recipients: {
    type: "all" | "role" | "specific"
    userIds?: string[]
    roles?: string[]
  }
  sender: {
    id: string
    name: string
    role: string
  }
  isRead: boolean
  readBy: string[]
  createdAt: string
  expiresAt?: string
  isActive: boolean
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  recipients: {
    type: "all" | "role" | "specific"
    userIds?: string[]
    roles?: string[]
  }
  expiresAt?: string
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
  type?: string
  priority?: string
  isActive?: boolean
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  totalPages: number
}

export const notificationsApi = {
  // Get all notifications
  getNotifications: async (params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> => {
    const response = await authApiInstance.get("/push")
    return response.data
  },

  // Get notification by ID
  getNotificationById: async (id: string): Promise<{ notification: Notification }> => {
    const response = await authApiInstance.get(`/admin/notifications/${id}`)
    return response.data
  },

  // Create notification
  createNotification: async (data: CreateNotificationRequest): Promise<{ notification: Notification }> => {
    const response = await authApiInstance.post("/push/send", data)
    return response.data
  },

  // Update notification
  updateNotification: async (
    id: string,
    data: Partial<CreateNotificationRequest>,
  ): Promise<{ notification: Notification }> => {
    const response = await authApiInstance.put(`/admin/notifications/${id}`, data)
    return response.data
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await authApiInstance.delete(`/push/${id}`)
    return response.data
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ message: string }> => {
    const response = await authApiInstance.patch(`/admin/notifications/${id}/read`)
    return response.data
  },

  // Get notification statistics
  getStats: async (): Promise<{
    total: number
    active: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  }> => {
    const response = await authApiInstance.get("/push/stats")
    return response.data
  },
}
