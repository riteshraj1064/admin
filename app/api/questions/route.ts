import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch questions")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
