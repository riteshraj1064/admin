import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// GET /api/tests/testseries/[id] - Get tests by test series
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/testseries/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Tests not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch tests by series")
    }

    const tests = await response.json()
    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching tests by series:", error)
    return NextResponse.json({ error: "Failed to fetch tests by series" }, { status: 500 })
  }
}
