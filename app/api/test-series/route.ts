import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/test-series - Get all test series
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/test-series`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch test series")
    }

    const testSeries = await response.json()
    return NextResponse.json(testSeries)
  } catch (error) {
    console.error("Error fetching test series:", error)
    return NextResponse.json({ error: "Failed to fetch test series" }, { status: 500 })
  }
}

// POST /api/test-series - Create new test series
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/test-series`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create test series")
    }

    const testSeries = await response.json()
    return NextResponse.json(testSeries, { status: 201 })
  } catch (error) {
    console.error("Error creating test series:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create test series" },
      { status: 400 },
    )
  }
}
