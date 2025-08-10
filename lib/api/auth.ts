import { authApiInstance } from "@/lib/axios"

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RequestOTPRequest {
  email: string
  name?: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
  name?: string
}

export const authApi = {
  // Request OTP
  requestOTP: async (data: RequestOTPRequest): Promise<{ message: string }> => {
    const response = await authApiInstance.post("/auth/request-otp", data)
    return response.data
  },

  // Verify OTP and login
  verifyOTP: async (data: VerifyOTPRequest): Promise<LoginResponse> => {
    const response = await authApiInstance.post("/auth/verify-otp", data)
    return response.data
  },

  // Logout (client-side token removal)
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        return userStr ? JSON.parse(userStr) : null
      } catch (error) {
        console.error("Error parsing user data:", error)
        return null
      }
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false

    try {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")

      if (!token || !userStr) return false

      // Try to parse user data to ensure it's valid
      const user = JSON.parse(userStr)
      return !!(token && user && user.id)
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    }
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    if (typeof window === "undefined") return false

    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return false

      const user = JSON.parse(userStr)
      return user?.role === "admin"
    } catch (error) {
      console.error("Admin check error:", error)
      return false
    }
  },
}
