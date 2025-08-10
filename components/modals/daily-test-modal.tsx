"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { dailyTestsApi, type DailyTest } from "@/lib/api/daily-tests"
import { categoryApi, type Category } from "@/lib/api/categories"
import { Loader2, Calendar, Clock, Users, Target } from "lucide-react"
import type { AxiosError } from "axios"

interface DailyTestModalProps {
  isOpen: boolean
  onClose: () => void
  dailyTest: DailyTest | null
  mode: "create" | "edit" | "view"
  onSuccess: () => void
}

export function DailyTestModal({ isOpen, onClose, dailyTest, mode, onSuccess }: DailyTestModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    totalQuestions: 10,
    difficulty: "medium" as "easy" | "medium" | "hard",
    category: "",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (dailyTest && (mode === "edit" || mode === "view")) {
      setFormData({
        title: dailyTest.title || "",
        description: dailyTest.description || "",
        duration: dailyTest.duration || 60,
        totalQuestions: dailyTest.totalQuestions || 10,
        difficulty: dailyTest.difficulty || "medium",
        category: typeof dailyTest.category === "string" ? dailyTest.category : dailyTest.category?.id || "",
      })
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        duration: 60,
        totalQuestions: 10,
        difficulty: "medium",
        category: "",
      })
    }
  }, [dailyTest, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required.",
        variant: "destructive",
      })
      return
    }

    if (formData.duration <= 0) {
      toast({
        title: "Validation Error",
        description: "Duration must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (formData.totalQuestions <= 0) {
      toast({
        title: "Validation Error",
        description: "Total questions must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (mode === "create") {
        await dailyTestsApi.create({
          ...formData,
          questions: [],
          attempts: 0,
          avgScore: 0,
        })
        toast({
          title: "Daily test created",
          description: "The daily test has been created successfully.",
        })
      } else {
        await dailyTestsApi.update(dailyTest!.id!, formData)
        toast({
          title: "Daily test updated",
          description: "The daily test has been updated successfully.",
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || `Failed to ${mode} daily test`

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? `${category.icon} ${category.name}` : "Unknown Category"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl w-full max-w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 mx-2 sm:mx-auto rounded-xl p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {mode === "create" ? "Create Daily Test" : mode === "edit" ? "Edit Daily Test" : "Daily Test Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new daily test for students."
              : mode === "edit"
                ? "Update the daily test details."
                : "View daily test information and statistics."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "view" && dailyTest && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyTest.attempts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Avg Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyTest.avgScore.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyTest.duration}m</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyTest.totalQuestions}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter daily test title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              {mode === "view" ? (
                <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                  <span className="text-sm">{getCategoryName(formData.category)}</span>
                </div>
              ) : (
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter daily test description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={mode === "view"}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="60"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalQuestions">Total Questions *</Label>
              <Input
                id="totalQuestions"
                type="number"
                min="1"
                placeholder="10"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: Number.parseInt(e.target.value) || 0 })}
                disabled={mode === "view"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              {mode === "view" ? (
                <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                  <Badge className={`capitalize ${getDifficultyColor(formData.difficulty)}`}>
                    {formData.difficulty}
                  </Badge>
                </div>
              ) : (
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {mode !== "view" && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Daily Test" : "Update Daily Test"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
