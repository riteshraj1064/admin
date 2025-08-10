"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield, ArrowRight } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import type { AxiosError } from "axios"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      await authApi.requestOTP({ email, name })
      setOtpSent(true)
      setStep("otp")
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to send OTP"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return

    setIsLoading(true)

    try {
      const response = await authApi.verifyOTP({ email, otp, name })

      console.log("OTP verification response:", response)

      // Check if user is admin
      if (response.user.role !== "admin" && response.user.role !== "teacher") {
        toast({
          title: "Access Denied",
          description: "Only administrators can access this dashboard.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Store token and user data
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      document.cookie = `token=${response.token}; max-age=3600; path=/;  samesite=strict`

      console.log("Stored token:", localStorage.getItem("token"))
      console.log("Stored user:", localStorage.getItem("user"))

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      })

      // Call success callback immediately
      onLoginSuccess()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to verify OTP"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      await authApi.requestOTP({ email, name })
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    setOtp("")
    setOtpSent(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
            <Shield className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        <CardDescription className="text-center">
          {step === "email"
            ? "Enter your admin email to receive a verification code"
            : "Enter the 6-digit code sent to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
              <div className="text-sm text-muted-foreground text-center">
                Code sent to: <span className="font-medium">{email}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Verify & Login
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Button type="button" variant="ghost" onClick={handleBackToEmail} className="p-0 h-auto">
                ← Back to email
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="p-0 h-auto"
              >
                Resend Code
              </Button>
            </div>
          </form>
        )}

        <div className="text-xs text-center text-muted-foreground mt-4">
          Only administrators can access this dashboard. If you don't have admin access, please contact your system
          administrator.
        </div>
      </CardContent>
    </Card>
  )
}
