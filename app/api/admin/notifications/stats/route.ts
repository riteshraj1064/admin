import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock stats data
    const stats = {
      total: 25,
      active: 20,
      byType: {
        info: 10,
        success: 8,
        warning: 5,
        error: 2,
      },
      byPriority: {
        low: 8,
        medium: 12,
        high: 5,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    return NextResponse.json({ error: "Failed to fetch notification stats" }, { status: 500 })
  }
}
