import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/test-series/[id] - Get test series by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/test-series/${params.id}`, {
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
      throw new Error("Failed to fetch test series")
    }

    const testSeries = await response.json()
    return NextResponse.json(testSeries)
  } catch (error) {
    console.error("Error fetching test series:", error)
    return NextResponse.json({ error: "Failed to fetch test series" }, { status: 500 })
  }
}

// PUT /api/test-series/[id] - Update test series
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/test-series/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test Series not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update test series")
    }

    const testSeries = await response.json()
    return NextResponse.json(testSeries)
  } catch (error) {
    console.error("Error updating test series:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update test series" },
      { status: 400 },
    )
  }
}

// DELETE /api/test-series/[id] - Delete test series
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/test-series/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test Series not found" }, { status: 404 })
      }
      throw new Error("Failed to delete test series")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting test series:", error)
    return NextResponse.json({ error: "Failed to delete test series" }, { status: 500 })
  }
}
