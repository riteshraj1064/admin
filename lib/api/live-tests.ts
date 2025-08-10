import api from "@/lib/axios"

export interface LiveTest {
  id?: string
  _id?: string
  title: string
  category: string
  attempts: number
  difficulty: string
  startTime: string | Date
  endTime: string | Date
  duration: number
  questions: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateLiveTestRequest {
  title: string
  category: string
  difficulty: string
  startTime: string | Date
  endTime: string | Date
  duration: number
  questions?: string[]
}

export interface AddQuestionsRequest {
  questionIds: string[]
}

export const liveTestsApi = {
  // Get all live tests
  getAll: async (): Promise<LiveTest[]> => {
    const response = await api.get("/live-tests")
    return response.data
  },

  // Get live test by ID
  getById: async (id: string): Promise<LiveTest> => {
    const response = await api.get(`/live-tests/${id}`)
    return response.data
  },

  // Create new live test
  create: async (data: CreateLiveTestRequest): Promise<LiveTest> => {
    const response = await api.post("/live-tests", data)
    return response.data
  },

  // Update live test
  update: async (id: string, data: Partial<LiveTest>): Promise<LiveTest> => {
    const response = await api.put(`/live-tests/${id}`, data)
    return response.data
  },

  // Delete live test
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/live-tests/${id}`)
    return response.data
  },

  // Add questions to live test
  addQuestions: async (id: string, data: AddQuestionsRequest): Promise<LiveTest> => {
    const response = await api.post(`/live-tests/${id}/questions`, data)
    return response.data
  },
}
