import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// POST /api/tests/generate - Generate test from question bank
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/tests/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.message || "Failed to generate test")
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error generating test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate test" },
      { status: 400 },
    )
  }
}
