import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }

    const categories = await response.json()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create category")
    }

    const category = await response.json()
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 400 },
    )
  }
}
