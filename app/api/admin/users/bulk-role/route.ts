import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    const { userIds, role } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 })
    }

    if (!["admin", "teacher", "student", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Mock response - replace with actual database update
    const updated = userIds.length

    return NextResponse.json({
      message: `${updated} users updated to ${role} role`,
      updated,
    })
  } catch (error) {
    console.error("Error bulk updating user roles:", error)
    return NextResponse.json({ error: "Failed to update user roles" }, { status: 500 })
  }
}
