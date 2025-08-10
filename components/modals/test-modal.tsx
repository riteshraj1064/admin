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
import { Loader2, Users, Target, BookOpen } from "lucide-react"
import { testsApi, type Test } from "@/lib/api/tests"
import { testSeriesApi, type TestSeries } from "@/lib/api/test-series"
import type { AxiosError } from "axios"

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
  test?: Test | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function TestModal({ isOpen, onClose, test, mode, onSuccess }: TestModalProps) {
  const [formData, setFormData] = useState<Omit<Test, "id" | "createdAt" | "updatedAt"> & { isPremium: boolean; isNegativeMarking: boolean; negativeMarkingFactor: number }>({
    title: "",
    description: "",
    duration: 60,
    totalQuestions: 0,
    difficulty: "Medium",
    category: "",
    testSeries: "",
    questions: [],
    attempts: 0,
    avgScore: 0,
    completedUsers: [],
    isPremium: false,
    isNegativeMarking: false,
    negativeMarkingFactor: 0,
  })
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSeries, setLoadingSeries] = useState(false)
  const { toast } = useToast()

  // Load test series
  useEffect(() => {
    const loadTestSeries = async () => {
      try {
        setLoadingSeries(true)
        const data = await testSeriesApi.getAll()
        setTestSeries(data)
      } catch (error) {
        console.error("Error loading test series:", error)
      } finally {
        setLoadingSeries(false)
      }
    }

    if (isOpen) {
      loadTestSeries()
    }
  }, [isOpen])

  useEffect(() => {
    if (test && isOpen) {
      setFormData({
        title: test.title || "",
        description: test.description || "",
        duration: test.duration || 60,
        totalQuestions: test.totalQuestions || 0,
        difficulty: test.difficulty || "Medium",
        category: test.category || "",
        testSeries: typeof test.testSeries === "string" ? test.testSeries : test.testSeries?.id || "",
        questions: test.questions || [],
        attempts: test.attempts || 0,
        avgScore: test.avgScore || 0,
        completedUsers: test.completedUsers || [],
        isPremium: test.isPremium ?? false,
        isNegativeMarking: test.isNegativeMarking ?? false,
        negativeMarkingFactor: test.negativeMarkingFactor ?? 0,
      })
    } else if (!test && isOpen) {
      setFormData({
        title: "",
        description: "",
        duration: 60,
        totalQuestions: 0,
        difficulty: "Medium",
        category: "",
        testSeries: "none",
        questions: [],
        attempts: 0,
        avgScore: 0,
        completedUsers: [],
        isPremium: false,
        isNegativeMarking: false,
        negativeMarkingFactor: 0,
      })
    }
  }, [test, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    setIsLoading(true)

    try {
      let result: Test

      if (mode === "create") {
        result = await testsApi.create(formData)
        toast({
          title: "Test created",
          description: `${formData.title} has been created successfully.`,
        })
      } else {
        result = await testsApi.update(test!.id!, formData)
        toast({
          title: "Test updated",
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
        return "Create Test"
      case "edit":
        return "Edit Test"
      case "view":
        return "View Test"
      default:
        return "Test"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new test to your platform."
      case "edit":
        return "Make changes to the test here."
      case "view":
        return "Test details and information."
      default:
        return ""
    }
  }

  const selectedSeries = testSeries.find((series) => series.id === formData.testSeries)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[600px] w-full max-w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border shadow-xl rounded-xl p-2 sm:p-4">
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
                placeholder="Enter test title"
                className="w-full"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={mode === "view"}
                placeholder="Enter test description"
                className="w-full resize-none"
              />
            </div>

            {/* Test Series and Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testSeries" className="text-sm font-medium">
                  Test Series
                </Label>
                <Select
                  value={formData.testSeries}
                  onValueChange={(value) => setFormData({ ...formData, testSeries: value })}
                  disabled={mode === "view" || loadingSeries}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSeries ? "Loading..." : "Select test series"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Test Series</SelectItem>
                    {testSeries.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        <div className="flex items-center space-x-2">
                          <span>{series.icon}</span>
                          <span>{series.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSeries && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedSeries.icon} {selectedSeries.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={mode === "view"}
                  placeholder="e.g., Physics, Mathematics"
                />
              </div>
            </div>

            {/* Numbers Row, Premium, Negative Marking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  placeholder="0"
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
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-start justify-center gap-1 pt-6">
                <Label htmlFor="isPremium" className="text-sm font-medium flex items-center gap-2">
                  <Input
                    id="isPremium"
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    disabled={mode === "view"}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Premium
                </Label>
                <span className="text-xs text-muted-foreground">Is this a premium test?</span>
              </div>

              <div className="flex flex-col items-start justify-center gap-1 pt-6">
                <Label htmlFor="isNegativeMarking" className="text-sm font-medium flex items-center gap-2">
                  <Input
                    id="isNegativeMarking"
                    type="checkbox"
                    checked={formData.isNegativeMarking}
                    onChange={(e) => setFormData({ ...formData, isNegativeMarking: e.target.checked })}
                    disabled={mode === "view"}
                    className="w-4 h-4 accent-red-600"
                  />
                  Negative Marking
                </Label>
                <span className="text-xs text-muted-foreground">Enable negative marking for this test.</span>
              </div>

              <div className="flex flex-col items-start justify-center gap-1 pt-6">
                <Label htmlFor="negativeMarkingFactor" className="text-sm font-medium">
                  Negative Marking Factor
                </Label>
                <Input
                  id="negativeMarkingFactor"
                  type="number"
                  value={formData.negativeMarkingFactor}
                  onChange={(e) => setFormData({ ...formData, negativeMarkingFactor: Number.parseFloat(e.target.value) || 0 })}
                  required={formData.isNegativeMarking}
                  disabled={mode === "view" || !formData.isNegativeMarking}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-24 sm:w-32"
                />
                <span className="text-xs text-muted-foreground">Set to 0 for no negative marking.</span>
              </div>
            </div>

            {/* Statistics (View Mode Only) */}
            {mode === "view" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 p-4 bg-muted/20 rounded-lg">
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
                    <div className="text-sm font-medium">{formData.completedUsers.length}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium mr-2">Premium:</Label>
                  <span className={`text-xs font-semibold ${formData.isPremium ? "text-green-600" : "text-gray-500"}`}>
                    {formData.isPremium ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium mr-2">Negative Marking:</Label>
                  <span className={`text-xs font-semibold ${formData.isNegativeMarking ? "text-red-600" : "text-gray-500"}`}>
                    {formData.isNegativeMarking ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium mr-2">Neg. Marking Factor:</Label>
                  <span className="text-xs font-semibold">{formData.negativeMarkingFactor}</span>
                </div>
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
