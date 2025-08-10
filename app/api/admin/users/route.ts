import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    // Mock data - replace with actual database query
    const mockUsers = [
      {
        _id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "student",
        isActive: true,
        isSuspended: false,
        image: "/placeholder.svg?height=32&width=32",
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        _id: "2",
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        role: "teacher",
        isActive: true,
        isSuspended: false,
        image: "/placeholder.svg?height=32&width=32",
        createdAt: "2024-01-10T00:00:00Z",
      },
      {
        _id: "3",
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        role: "admin",
        isActive: true,
        isSuspended: false,
        image: "/placeholder.svg?height=32&width=32",
        createdAt: "2023-12-01T00:00:00Z",
      },
    ]

    // Apply filters
    let filteredUsers = mockUsers
    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      )
    }
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }
    if (status) {
      if (status === "active") {
        filteredUsers = filteredUsers.filter((user) => user.isActive && !user.isSuspended)
      } else if (status === "inactive") {
        filteredUsers = filteredUsers.filter((user) => !user.isActive)
      } else if (status === "suspended") {
        filteredUsers = filteredUsers.filter((user) => user.isSuspended)
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      totalPages: Math.ceil(filteredUsers.length / limit),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
