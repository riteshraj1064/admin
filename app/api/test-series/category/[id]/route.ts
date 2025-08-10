import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// GET /api/test-series/category/[id] - Get test series by category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/test-series/category/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test Series not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch test series by category")
    }

    const testSeries = await response.json()
    return NextResponse.json(testSeries)
  } catch (error) {
    console.error("Error fetching test series by category:", error)
    return NextResponse.json({ error: "Failed to fetch test series by category" }, { status: 500 })
  }
}
