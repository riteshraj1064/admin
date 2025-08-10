import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-tests/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching daily test:", error)
    return NextResponse.json({ error: "Failed to fetch daily test" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/daily-tests/${params.id}`, {
      method: "PUT",
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
    console.error("Error updating daily test:", error)
    return NextResponse.json({ error: "Failed to update daily test" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-tests/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error deleting daily test:", error)
    return NextResponse.json({ error: "Failed to delete daily test" }, { status: 500 })
  }
}
