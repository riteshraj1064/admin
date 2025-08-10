import api from "@/lib/axios"

export interface DailyTest {
  id?: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  difficulty: "easy" | "medium" | "hard"
  category: string | Category
  questions: string[]
  attempts: number
  avgScore: number
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export const dailyTestsApi = {
  // Get all daily tests
  getAll: async (): Promise<DailyTest[]> => {
    const response = await api.get("/daily-tests")
    return response.data
  },

  // Get daily test by ID
  getById: async (id: string): Promise<DailyTest> => {
    const response = await api.get(`/daily-tests/${id}`)
    return response.data
  },

  // Create new daily test
  create: async (data: Omit<DailyTest, "id" | "createdAt" | "updatedAt">): Promise<DailyTest> => {
    const response = await api.post("/daily-tests", data)
    return response.data
  },

  // Update daily test
  update: async (id: string, data: Partial<DailyTest>): Promise<DailyTest> => {
    const response = await api.put(`/daily-tests/${id}`, data)
    return response.data
  },

  // Delete daily test
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/daily-tests/${id}`)
    return response.data
  },
}
