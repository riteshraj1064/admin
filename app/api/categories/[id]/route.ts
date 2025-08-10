import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.20.10.3:5000/api"

// GET /api/categories/[id] - Get category by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch category")
    }

    const category = await response.json()
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/categories/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update category")
    }

    const category = await response.json()
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update category" },
      { status: 400 },
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/categories/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      throw new Error("Failed to delete category")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
