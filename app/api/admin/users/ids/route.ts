import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock user IDs - replace with actual database query
    const mockIds = ["1", "2", "3", "4", "5"]

    return NextResponse.json({ ids: mockIds })
  } catch (error) {
    console.error("Error fetching user IDs:", error)
    return NextResponse.json({ error: "Failed to fetch user IDs" }, { status: 500 })
  }
}
