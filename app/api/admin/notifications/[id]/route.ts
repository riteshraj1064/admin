import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock notification data
    const mockNotification = {
      _id: id,
      title: "System Maintenance",
      message: "The system will be under maintenance from 2 AM to 4 AM tomorrow.",
      type: "warning",
      priority: "high",
      recipients: { type: "all" },
      sender: { id: "admin1", name: "Admin", role: "admin" },
      isRead: false,
      readBy: [],
      createdAt: "2024-01-20T00:00:00Z",
      isActive: true,
    }

    return NextResponse.json({ notification: mockNotification })
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()

    // Mock notification update
    const updatedNotification = {
      _id: id,
      ...data,
      sender: { id: "admin1", name: "Admin", role: "admin" },
      isRead: false,
      readBy: [],
      createdAt: "2024-01-20T00:00:00Z",
      isActive: true,
    }

    return NextResponse.json({ notification: updatedNotification })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock notification deletion
    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
