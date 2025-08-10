import { type NextRequest, NextResponse } from "next/server"

const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://172.20.10.3:3000"

// POST /api/auth/verify-otp - Verify OTP and login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${AUTH_API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to verify OTP")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify OTP" },
      { status: 400 },
    )
  }
}
