import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock user data - replace with actual database query
    const mockUser = {
      _id: id,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "student",
      isActive: true,
      isSuspended: false,
      image: "/placeholder.svg?height=32&width=32",
      createdAt: "2024-01-15T00:00:00Z",
      modifiedAt: "2024-01-20T00:00:00Z",
    }

    return NextResponse.json({ user: mockUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}
