import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/live-tests - Get all live tests
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/live-tests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch live tests")
    }

    const liveTests = await response.json()
    return NextResponse.json(liveTests)
  } catch (error) {
    console.error("Error fetching live tests:", error)
    return NextResponse.json({ error: "Failed to fetch live tests" }, { status: 500 })
  }
}

// POST /api/live-tests - Create new live test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/live-tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create live test")
    }

    const liveTest = await response.json()
    return NextResponse.json(liveTest, { status: 201 })
  } catch (error) {
    console.error("Error creating live test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create live test" },
      { status: 400 },
    )
  }
}
