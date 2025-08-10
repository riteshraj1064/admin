"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're in the browser
        if (typeof window === "undefined") {
          setIsLoading(false)
          return
        }

        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")

        console.log("Auth check - Token:", !!token)
        console.log("Auth check - User:", !!userStr)

        if (!token || !userStr) {
          console.log("No token or user, redirecting to login")
          router.replace("/login")
          setIsLoading(false)
          return
        }

        let user
        try {
          user = JSON.parse(userStr)
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          setIsLoading(false)
          return
        }

        console.log("Parsed user:", user)
        console.log("User role:", user?.role)

        if (!user || user.role !== "admin" && user.role !== "teacher") {
          console.log("User is not admin, redirecting to login")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          setIsLoading(false)
          return
        }

        console.log("User is authenticated admin")
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.replace("/login")
        setIsLoading(false)
      }
    }

    // Check auth immediately and also set a timeout as fallback
    checkAuth()

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log("Auth check timeout, forcing completion")
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(fallbackTimeout)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
