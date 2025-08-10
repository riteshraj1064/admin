"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === "undefined") {
          setIsChecking(false)
          return
        }

        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")

        console.log("Login page - Token:", !!token)
        console.log("Login page - User:", !!userStr)

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            console.log("Login page - Parsed user:", user)

            if (user && user.role === "admin") {
              console.log("User already authenticated, redirecting to dashboard")
              router.replace("/dashboard")
              return
            }
          } catch (parseError) {
            console.error("Failed to parse user data on login page:", parseError)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        }

        setIsChecking(false)
      } catch (error) {
        console.error("Login page auth check error:", error)
        setIsChecking(false)
      }
    }

    checkAuth()

    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      console.log("Login page auth check timeout")
      setIsChecking(false)
    }, 2000)

    return () => clearTimeout(fallbackTimeout)
  }, [router])

  const handleLoginSuccess = () => {
    console.log("Login success, redirecting to dashboard")
    // Use router.push instead of window.location.href for better Next.js integration
    router.push("/dashboard")
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
