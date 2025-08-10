import api from "@/lib/axios"

export interface Question {
  id?: string
  text: {
    en: string
    hi: string
  }
  options: {
    en: string[]
    hi: string[]
  }
  explanation: {
    en: string
    hi: string
  }
  correctAnswer: string
  subject: string
  topic: string
  exam: string[]
  previousYear: boolean
  year: number[]
  difficulty: "easy" | "medium" | "hard"
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ImportQuestionsRequest {
  file: File
  testId: string
  testType: "test" | "live" | "daily"
}

export const questionsApi = {
  // Get all questions
  getAll: async (): Promise<Question[]> => {
    const response = await api.get("/questions")
    return response.data
  },

  // Get question by ID
  getById: async (id: string): Promise<Question> => {
    const response = await api.get(`/questions/${id}`)
    return response.data
  },

  // Create new question
  create: async (data: Omit<Question, "id" | "createdAt" | "updatedAt">): Promise<Question> => {
    const response = await api.post("/questions", data)
    return response.data
  },

  // Update question
  update: async (id: string, data: Partial<Question>): Promise<Question> => {
    const response = await api.put(`/questions/${id}`, data)
    return response.data
  },

  // Delete question
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/questions/${id}`)
    return response.data
  },

  // Import questions from CSV/Excel
  importFromFile: async (
    testId: string,
    testType: string,
    file: File,
  ): Promise<{ message: string; questions: Question[] }> => {
    const formData = new FormData()
    formData.append("file", file)
console.log(testType, testId)
    const response = await api.post(`/questions/import/${testType}/${testId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}
