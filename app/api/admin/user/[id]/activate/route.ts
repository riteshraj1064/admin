import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock response - replace with actual database update
    const updatedUser = {
      _id: id,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "student",
      isActive: true,
      isSuspended: false,
      image: "/placeholder.svg?height=32&width=32",
      createdAt: "2024-01-15T00:00:00Z",
      modifiedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      message: "User activated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error activating user:", error)
    return NextResponse.json({ error: "Failed to activate user" }, { status: 500 })
  }
}
