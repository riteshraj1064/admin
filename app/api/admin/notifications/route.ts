import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const priority = searchParams.get("priority")

    // Mock notifications data
    const mockNotifications = [
      {
        _id: "1",
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
      },
      {
        _id: "2",
        title: "New Feature Released",
        message: "We've added a new quiz feature to help you practice better.",
        type: "success",
        priority: "medium",
        recipients: { type: "role", roles: ["student"] },
        sender: { id: "admin1", name: "Admin", role: "admin" },
        isRead: false,
        readBy: [],
        createdAt: "2024-01-19T00:00:00Z",
        isActive: true,
      },
    ]

    // Apply filters
    let filteredNotifications = mockNotifications
    if (type) {
      filteredNotifications = filteredNotifications.filter((n) => n.type === type)
    }
    if (priority) {
      filteredNotifications = filteredNotifications.filter((n) => n.priority === priority)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

    return NextResponse.json({
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      page,
      totalPages: Math.ceil(filteredNotifications.length / limit),
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Mock notification creation
    const newNotification = {
      _id: Date.now().toString(),
      ...data,
      sender: { id: "admin1", name: "Admin", role: "admin" },
      isRead: false,
      readBy: [],
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    return NextResponse.json({ notification: newNotification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
