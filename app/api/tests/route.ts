import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/tests - Get all tests
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tests")
    }

    const tests = await response.json()
    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}

// POST /api/tests - Create new test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create test")
    }

    const test = await response.json()
    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create test" },
      { status: 400 },
    )
  }
}
