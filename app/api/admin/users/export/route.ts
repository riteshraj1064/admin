import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    // Mock CSV data - replace with actual data export
    const csvData = `Name,Email,Role,Status,Join Date
John Doe,john.doe@example.com,student,active,2024-01-15
Sarah Wilson,sarah.wilson@example.com,teacher,active,2024-01-10
Mike Johnson,mike.johnson@example.com,admin,active,2023-12-01`

    const blob = new Blob([csvData], { type: "text/csv" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=users.${format === "csv" ? "csv" : "xlsx"}`,
      },
    })
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json({ error: "Failed to export users" }, { status: 500 })
  }
}
