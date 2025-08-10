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
      isActive: false,
      isSuspended: true,
      image: "/placeholder.svg?height=32&width=32",
      createdAt: "2024-01-15T00:00:00Z",
      modifiedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      message: "User suspended successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error suspending user:", error)
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 })
  }
}
