import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/current-affairs - Get all current affairs
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/current-affairs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch current affairs")
    }

    const currentAffairs = await response.json()
    return NextResponse.json(currentAffairs)
  } catch (error) {
    console.error("Error fetching current affairs:", error)
    return NextResponse.json({ error: "Failed to fetch current affairs" }, { status: 500 })
  }
}

// POST /api/current-affairs - Create new current affair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/current-affairs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create current affair")
    }

    const currentAffair = await response.json()
    return NextResponse.json(currentAffair, { status: 201 })
  } catch (error) {
    console.error("Error creating current affair:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create current affair" },
      { status: 400 },
    )
  }
}
