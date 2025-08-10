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
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Target, BookOpen, Clock } from "lucide-react"
import { dailyTestsApi, type DailyTest } from "@/lib/api/daily-tests"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

interface DailyTestModalProps {
  isOpen: boolean
  onClose: () => void
  dailyTest?: DailyTest | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function DailyTestModal({ isOpen, onClose, dailyTest, mode, onSuccess }: DailyTestModalProps) {
  const [formData, setFormData] = useState<Omit<DailyTest, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    duration: 60,
    totalQuestions: 10,
    difficulty: "medium",
    category: "",
    questions: [],
    attempts: 0,
    avgScore: 0,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const { toast } = useToast()

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await categoryApi.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (dailyTest && isOpen) {
      setFormData({
        title: dailyTest.title || "",
        description: dailyTest.description || "",
        duration: dailyTest.duration || 60,
        totalQuestions: dailyTest.totalQuestions || 10,
        difficulty: dailyTest.difficulty || "medium",
        category: typeof dailyTest.category === "string" ? dailyTest.category : dailyTest.category?.id || "",
        questions: dailyTest.questions || [],
        attempts: dailyTest.attempts || 0,
        avgScore: dailyTest.avgScore || 0,
      })
    } else if (!dailyTest && isOpen) {
      setFormData({
        title: "",
        description: "",
        duration: 60,
        totalQuestions: 10,
        difficulty: "medium",
        category: "",
        questions: [],
        attempts: 0,
        avgScore: 0,
      })
    }
  }, [dailyTest, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    setIsLoading(true)

    try {
      let result: DailyTest

      if (mode === "create") {
        result = await dailyTestsApi.create(formData)
        toast({
          title: "Daily test created",
          description: `${formData.title} has been created successfully.`,
        })
      } else {
        result = await dailyTestsApi.update(dailyTest!.id!, formData)
        toast({
          title: "Daily test updated",
          description: `${formData.title} has been updated successfully.`,
        })
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Daily Test"
      case "edit":
        return "Edit Daily Test"
      case "view":
        return "View Daily Test"
      default:
        return "Daily Test"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new daily test to your platform."
      case "edit":
        return "Make changes to the daily test here."
      case "view":
        return "Daily test details and information."
      default:
        return ""
    }
  }

  const selectedCategory = categories.find((cat) => cat.id === formData.category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-500 border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">{getTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Test Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={mode === "view"}
                placeholder="Enter daily test title"
                className="w-full"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                disabled={mode === "view"}
                placeholder="Enter daily test description"
                className="w-full resize-none"
              />
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={mode === "view" || loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedCategory.icon} {selectedCategory.name}
                </div>
              )}
            </div>

            {/* Numbers Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalQuestions" className="text-sm font-medium">
                  Total Questions *
                </Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: Number.parseInt(e.target.value) || 0 })}
                  required
                  disabled={mode === "view"}
                  placeholder="10"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 60 })}
                  required
                  disabled={mode === "view"}
                  placeholder="60"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty *
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setFormData({ ...formData, difficulty: value })}
                  disabled={mode === "view"}
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
              </div>
            </div>

            {/* Statistics (View Mode Only) */}
            {mode === "view" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{formData.attempts}</div>
                    <div className="text-xs text-muted-foreground">Attempts</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{formData.avgScore.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{formData.questions.length}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Info Card */}
            {mode !== "view" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Daily Test Info</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Daily tests are designed for regular practice. Questions will be populated from the selected
                  category's question bank.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : mode === "create" ? "Create Test" : "Update Test"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
