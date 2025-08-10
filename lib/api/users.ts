import { authApiInstance } from "@/lib/axios"

export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin" | "teacher" | "student"
  isActive: boolean
  isSuspended: boolean
  image?: string
  createdAt: string
  modifiedAt?: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
}

export interface GetUsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

export interface UserActionResponse {
  message: string
  user: User
}

export interface BulkActionResponse {
  message: string
  updated: number
}

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const response = await authApiInstance.get("/admin/users", { params })
    return response.data
  },

  // Get user by ID
  getUserById: async (id: string): Promise<{ user: User }> => {
    const response = await authApiInstance.get(`/admin/user/${id}`)
    return response.data
  },

  // Activate user
  activateUser: async (id: string): Promise<UserActionResponse> => {
    const response = await authApiInstance.patch(`/admin/user/${id}/activate`)
    return response.data
  },

  // Suspend user
  suspendUser: async (id: string): Promise<UserActionResponse> => {
    const response = await authApiInstance.patch(`/admin/user/${id}/suspend`)
    return response.data
  },

  // Update user role
  updateUserRole: async (id: string, role: string): Promise<UserActionResponse> => {
    const response = await authApiInstance.patch(`/admin/user/${id}/role`, { role })
    return response.data
  },

  // Get all user IDs
  getUserIds: async (): Promise<{ ids: string[] }> => {
    const response = await authApiInstance.get("/admin/users/ids")
    return response.data
  },

  // Bulk activate users
  bulkActivateUsers: async (userIds: string[]): Promise<BulkActionResponse> => {
    const response = await authApiInstance.patch("/admin/users/bulk-activate", { userIds })
    return response.data
  },

  // Bulk suspend users
  bulkSuspendUsers: async (userIds: string[]): Promise<BulkActionResponse> => {
    const response = await authApiInstance.patch("/admin/users/bulk-suspend", { userIds })
    return response.data
  },

  // Bulk update role
  bulkUpdateRole: async (userIds: string[], role: string): Promise<BulkActionResponse> => {
    const response = await authApiInstance.patch("/admin/users/bulk-role", { userIds, role })
    return response.data
  },

  // Send email to users
  sendEmail: async (userIds: string[], subject: string, message: string): Promise<{ message: string }> => {
    const response = await authApiInstance.post("/admin/users/send-email", {
      userIds,
      subject,
      message,
    })
    return response.data
  },

  // Export users
  exportUsers: async (
    format: "csv" | "excel",
    filters: { role?: string; status?: string; search?: string } = {},
  ): Promise<Blob> => {
    const response = await authApiInstance.get("/admin/users/export", {
      params: { format, ...filters },
      responseType: "blob",
    })
    return response.data
  },
}
