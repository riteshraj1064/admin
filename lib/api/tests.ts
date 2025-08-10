import api from "@/lib/axios"

export interface Test {
  id?: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  difficulty: string
  category: string
  testSeries?: string | TestSeries // ObjectId or populated TestSeries
  questions: string[] // Array of Question ObjectIds
  attempts: number
  avgScore: number
  completedUsers: string[]
  createdAt?: string
  updatedAt?: string
  isNegativeMarking:boolean
  negativeMarkingFactor:number
  isPremium:boolean

}

export interface TestSeries {
  id: string
  title: string
  description: string
  Category: string
  icon: string
}

export interface GenerateTestRequest {
  subject?: string
  topic?: string
  exam?: string | string[]
  difficulty?: string
  previousYear?: boolean
  year?: string | string[]
  totalQuestions?: number
  title: string
  description?: string
  duration?: number
  testSeries?: string
}

export interface GenerateTestResponse {
  message: string
  totalAvailable: number
  test: Test
}

export const testsApi = {
  // Get all tests
  getAll: async (): Promise<Test[]> => {
    const response = await api.get("/tests")
    return response.data
  },

  // Get test by ID
  getById: async (id: string, lang = "en"): Promise<Test> => {
    const response = await api.get(`/tests/${id}?lang=${lang}`)
    return response.data
  },

  // Get tests by test series
  getBySeries: async (seriesId: string): Promise<Test[]> => {
    const response = await api.get(`/tests/testseries/${seriesId}`)
    return response.data
  },

  // Create new test
  create: async (data: Omit<Test, "id" | "createdAt" | "updatedAt">): Promise<Test> => {
    const response = await api.post("/tests", data)
    return response.data
  },

  // Generate test from question bank
  generateFromBank: async (data: GenerateTestRequest): Promise<GenerateTestResponse> => {
    const response = await api.post("/tests/generate", data)
    return response.data
  },

  // Update test
  update: async (id: string, data: Partial<Test>): Promise<Test> => {
    const response = await api.put(`/tests/${id}`, data)
    return response.data
  },

  // Delete test
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tests/${id}`)
    return response.data
  },
}
