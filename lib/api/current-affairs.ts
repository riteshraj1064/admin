import api from "@/lib/axios"

export interface Comment {
  id?: string
  user: string
  text: string
}

export interface CurrentAffair {
  id?: string
  title: string
  summary: string
  date: string
  likes: number
  comments: Comment[]
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

export const currentAffairsApi = {
  // Get all current affairs
  getAll: async (): Promise<CurrentAffair[]> => {
    const response = await api.get("/current-affairs")
    return response.data
  },

  // Get current affair by ID
  getById: async (id: string): Promise<CurrentAffair> => {
    const response = await api.get(`/current-affairs/${id}`)
    return response.data
  },

  // Create new current affair
  create: async (
    data: Omit<CurrentAffair, "id" | "likes" | "comments" | "createdBy" | "createdAt" | "updatedAt">,
  ): Promise<CurrentAffair> => {
    const response = await api.post("/current-affairs", data)
    return response.data
  },

  // Update current affair
  update: async (id: string, data: Partial<CurrentAffair>): Promise<CurrentAffair> => {
    const response = await api.put(`/current-affairs/${id}`, data)
    return response.data
  },

  // Delete current affair
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/current-affairs/${id}`)
    return response.data
  },

  // Add like
  addLike: async (id: string): Promise<CurrentAffair> => {
    const response = await api.post(`/current-affairs/${id}/like`)
    return response.data
  },

  // Add comment
  addComment: async (id: string, comment: { user: string; text: string }): Promise<CurrentAffair> => {
    const response = await api.post(`/current-affairs/${id}/comment`, comment)
    return response.data
  },
}
