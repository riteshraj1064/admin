import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// POST /api/current-affairs/[id]/comment - Add comment to current affair
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/current-affairs/${params.id}/comment`, {
      method: "POST",
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
      throw new Error(errorData.error || "Failed to add comment")
    }

    const currentAffair = await response.json()
    return NextResponse.json(currentAffair)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add comment" },
      { status: 400 },
    )
  }
}
