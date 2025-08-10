import api from "@/lib/axios"

export interface TestSeries {
  id?: string
  title: string
  description: string
  Category: string | Category // ObjectId or populated Category
  totalTests: number
  isPremium: boolean
  duration: string
  features: string[]
  difficulty: string
  estimatedHours: number
  icon: string
  freeTestsCount: number
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string[]
}

export const testSeriesApi = {
  // Get all test series
  getAll: async (): Promise<TestSeries[]> => {
    const response = await api.get("/test-series")
    return response.data
  },

  // Get test series by ID
  getById: async (id: string): Promise<TestSeries> => {
    const response = await api.get(`/test-series/${id}`)
    return response.data
  },

  // Get test series by category
  getByCategory: async (categoryId: string): Promise<TestSeries[]> => {
    const response = await api.get(`/test-series/category/${categoryId}`)
    return response.data
  },

  // Create new test series
  create: async (data: Omit<TestSeries, "id" | "createdAt" | "updatedAt">): Promise<TestSeries> => {
    const response = await api.post("/test-series", data)
    return response.data
  },

  // Update test series
  update: async (id: string, data: Partial<TestSeries>): Promise<TestSeries> => {
    const response = await api.put(`/test-series/${id}`, data)
    return response.data
  },

  // Delete test series
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/test-series/${id}`)
    return response.data
  },
}
