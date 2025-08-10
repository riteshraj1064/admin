import api from "@/lib/axios"

export interface Category {
  id?: string
  name: string
  description: string
  icon: string
  color: string[]
  testsCount?: number
  status?: string
}

export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories")
    return response.data
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Create new category
  create: async (data: Omit<Category, "id">): Promise<Category> => {
    const response = await api.post("/categories", data)
    return response.data
  },

  // Update category
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  // Delete category
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}
