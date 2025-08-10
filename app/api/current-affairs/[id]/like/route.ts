import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// POST /api/current-affairs/[id]/like - Add like to current affair
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/current-affairs/${params.id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Current affair not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to add like")
    }

    const currentAffair = await response.json()
    return NextResponse.json(currentAffair)
  } catch (error) {
    console.error("Error adding like:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add like" }, { status: 400 })
  }
}
