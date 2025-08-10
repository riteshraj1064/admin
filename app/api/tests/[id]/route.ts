import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// GET /api/tests/[id] - Get test by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const response = await fetch(`${API_BASE_URL}/tests/${params.id}?lang=${lang}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch test")
    }

    const test = await response.json()
    return NextResponse.json(test)
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 })
  }
}

// PUT /api/tests/[id] - Update test
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/tests/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update test")
    }

    const test = await response.json()
    return NextResponse.json(test)
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update test" },
      { status: 400 },
    )
  }
}

// DELETE /api/tests/[id] - Delete test
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/tests/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }
      throw new Error("Failed to delete test")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 })
  }
}
