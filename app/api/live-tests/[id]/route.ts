import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/live-tests/[id] - Get live test by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/live-tests/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Live test not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch live test")
    }

    const liveTest = await response.json()
    return NextResponse.json(liveTest)
  } catch (error) {
    console.error("Error fetching live test:", error)
    return NextResponse.json({ error: "Failed to fetch live test" }, { status: 500 })
  }
}

// PUT /api/live-tests/[id] - Update live test
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/live-tests/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Live test not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update live test")
    }

    const liveTest = await response.json()
    return NextResponse.json(liveTest)
  } catch (error) {
    console.error("Error updating live test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update live test" },
      { status: 400 },
    )
  }
}

// DELETE /api/live-tests/[id] - Delete live test
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/live-tests/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Live test not found" }, { status: 404 })
      }
      throw new Error("Failed to delete live test")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting live test:", error)
    return NextResponse.json({ error: "Failed to delete live test" }, { status: 500 })
  }
}
