import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    const { userIds } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 })
    }

    // Mock response - replace with actual database update
    const updated = userIds.length

    return NextResponse.json({
      message: `${updated} users activated successfully`,
      updated,
    })
  } catch (error) {
    console.error("Error bulk activating users:", error)
    return NextResponse.json({ error: "Failed to activate users" }, { status: 500 })
  }
}
