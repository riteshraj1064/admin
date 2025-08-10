import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// POST /api/live-tests/[id]/questions - Add questions to live test
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/live-tests/${params.id}/questions`, {
      method: "POST",
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
      throw new Error(errorData.error || "Failed to add questions to live test")
    }

    const liveTest = await response.json()
    return NextResponse.json(liveTest)
  } catch (error) {
    console.error("Error adding questions to live test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add questions to live test" },
      { status: 400 },
    )
  }
}
