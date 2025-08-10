import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { role } = await request.json()

    if (!["admin", "teacher", "student", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Mock response - replace with actual database update
    const updatedUser = {
      _id: id,
      name: "John Doe",
      email: "john.doe@example.com",
      role,
      isActive: true,
      isSuspended: false,
      image: "/placeholder.svg?height=32&width=32",
      createdAt: "2024-01-15T00:00:00Z",
      modifiedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}
