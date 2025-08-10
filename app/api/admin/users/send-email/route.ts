import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userIds, subject, message } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 })
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    // Mock email sending - replace with actual email service
    console.log(`Sending email to ${userIds.length} users:`, { subject, message })

    return NextResponse.json({
      message: `Email sent to ${userIds.length} users successfully`,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
