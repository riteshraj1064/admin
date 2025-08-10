"use client"

import { useState, useEffect } from "react"
import { categoryApi, type Category } from "@/lib/api/categories"
import { useToast } from "@/hooks/use-toast"
import type { AxiosError } from "axios"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await categoryApi.getAll()
      setCategories(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load categories"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (data: Omit<Category, "id">) => {
    try {
      const newCategory = await categoryApi.create(data)
      setCategories((prev) => [...prev, newCategory])
      toast({
        title: "Category created",
        description: `${data.name} has been created successfully.`,
      })
      return newCategory
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to create category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const updatedCategory = await categoryApi.update(id, data)
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)))
      toast({
        title: "Category updated",
        description: `Category has been updated successfully.`,
      })
      return updatedCategory
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to update category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryApi.delete(id)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
