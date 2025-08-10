import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function POST(request: NextRequest, { params }: { params: { testType: string; testId: string } }) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${API_BASE_URL}/questions/import/${params.testType}/${params.testId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error importing questions:", error)
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 })
  }
}
