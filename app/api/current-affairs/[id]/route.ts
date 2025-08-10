import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/current-affairs/[id] - Get current affair by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/current-affairs/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Current affair not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch current affair")
    }

    const currentAffair = await response.json()
    return NextResponse.json(currentAffair)
  } catch (error) {
    console.error("Error fetching current affair:", error)
    return NextResponse.json({ error: "Failed to fetch current affair" }, { status: 500 })
  }
}

// PUT /api/current-affairs/[id] - Update current affair
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/current-affairs/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Current affair not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update current affair")
    }

    const currentAffair = await response.json()
    return NextResponse.json(currentAffair)
  } catch (error) {
    console.error("Error updating current affair:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update current affair" },
      { status: 400 },
    )
  }
}

// DELETE /api/current-affairs/[id] - Delete current affair
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/current-affairs/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Current affair not found" }, { status: 404 })
      }
      throw new Error("Failed to delete current affair")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting current affair:", error)
    return NextResponse.json({ error: "Failed to delete current affair" }, { status: 500 })
  }
}
