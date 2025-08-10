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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wand2, X } from "lucide-react"
import { testsApi, type GenerateTestRequest } from "@/lib/api/tests"
import { testSeriesApi, type TestSeries } from "@/lib/api/test-series"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

interface GenerateTestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function GenerateTestModal({ isOpen, onClose, onSuccess }: GenerateTestModalProps) {
  const [formData, setFormData] = useState<GenerateTestRequest>({
    subject: "",
    topic: "",
    exam: "",
    difficulty: "Medium",
    previousYear: false,
    year: "",
    totalQuestions: 20,
    title: "",
    description: "",
    duration: 60,
    testSeries: "none",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [filteredTestSeries, setFilteredTestSeries] = useState<TestSeries[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Updated default value to be a non-empty string
  const [examList, setExamList] = useState<string[]>([])
  const [yearList, setYearList] = useState<string[]>([])
  const [examInput, setExamInput] = useState("")
  const [yearInput, setYearInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const { toast } = useToast()

  // Load categories and test series
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return

      try {
        setLoadingData(true)
        const [categoriesData, testSeriesData] = await Promise.all([categoryApi.getAll(), testSeriesApi.getAll()])
        setCategories(categoriesData)
        setTestSeries(testSeriesData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load categories and test series",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [isOpen, toast])

  // Filter test series based on selected category
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const filtered = testSeries.filter((series) => {
        const categoryId = typeof series.Category === "string" ? series.Category : series.Category?.id
        return categoryId === selectedCategory
      })
      setFilteredTestSeries(filtered)
    } else {
      setFilteredTestSeries(testSeries)
    }

    // Reset test series selection if current selection is not in filtered list
    if (formData.testSeries && selectedCategory && selectedCategory !== "all") {
      const isCurrentSeriesInCategory = testSeries.some((series) => {
        const categoryId = typeof series.Category === "string" ? series.Category : series.Category?.id
        return series.id === formData.testSeries && categoryId === selectedCategory
      })

      if (!isCurrentSeriesInCategory) {
        setFormData((prev) => ({ ...prev, testSeries: "" }))
      }
    }
  }, [selectedCategory, testSeries, formData.testSeries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const requestData = {
        ...formData,
        exam: examList.length > 0 ? examList : undefined,
        year: yearList.length > 0 ? yearList : undefined,
      }

      const result = await testsApi.generateFromBank(requestData)

      toast({
        title: "Test generated successfully",
        description: `Generated test with ${result.test.totalQuestions} questions from ${result.totalAvailable} available questions.`,
      })

      onSuccess?.()
      onClose()
      resetForm()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string; message: string }>
      const errorMessage =
        axiosError.response?.data?.error || axiosError.response?.data?.message || "Failed to generate test"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      subject: "",
      topic: "",
      exam: "",
      difficulty: "Medium",
      previousYear: false,
      year: "",
      totalQuestions: 20,
      title: "",
      description: "",
      duration: 60,
      testSeries: "none",
    })
    setSelectedCategory("all")
    setExamList([])
    setYearList([])
    setExamInput("")
    setYearInput("")
  }

  const addExam = () => {
    if (examInput.trim() && !examList.includes(examInput.trim())) {
      setExamList([...examList, examInput.trim()])
      setExamInput("")
    }
  }

  const removeExam = (examToRemove: string) => {
    setExamList(examList.filter((exam) => exam !== examToRemove))
  }

  const addYear = () => {
    if (yearInput.trim() && !yearList.includes(yearInput.trim())) {
      setYearList([...yearList, yearInput.trim()])
      setYearInput("")
    }
  }

  const removeYear = (yearToRemove: string) => {
    setYearList(yearList.filter((year) => year !== yearToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: "exam" | "year") => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (type === "exam") {
        addExam()
      } else {
        addYear()
      }
    }
  }

  const getCategoryName = (category: string | Category) => {
    if (typeof category === "string") {
      const cat = categories.find((c) => c.id === category)
      return cat ? `${cat.icon} ${cat.name}` : "Unknown"
    }
    return category ? `${category.icon} ${category.name}` : "Unknown"
  }

  const selectedTestSeries = filteredTestSeries.find((series) => series.id === formData.testSeries)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Wand2 className="mr-2 h-5 w-5" />
            Generate Test from Question Bank
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a test by selecting questions from the question bank based on your criteria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            {/* Test Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Test Details</h3>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Test Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter test title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Enter test description"
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalQuestions" className="text-sm font-medium">
                    Total Questions *
                  </Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, totalQuestions: Number.parseInt(e.target.value) || 20 })
                    }
                    required
                    min="1"
                    max="100"
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
                    min="1"
                  />
                </div>
              </div>

              {/* Category and Test Series Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category (Filter Test Series)
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loadingData}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testSeries" className="text-sm font-medium">
                    Test Series
                  </Label>
                  <Select
                    value={formData.testSeries}
                    onValueChange={(value) => setFormData({ ...formData, testSeries: value })}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Loading..." : "Select test series (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Test Series</SelectItem>
                      {filteredTestSeries.map((series) => (
                        <SelectItem key={series.id} value={series.id}>
                          <div className="flex items-center space-x-2">
                            <span>{series.icon}</span>
                            <span>{series.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTestSeries && (
                    <div className="text-xs text-muted-foreground">
                      Category: {getCategoryName(selectedTestSeries.Category)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question Criteria */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Question Selection Criteria</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Physics, Mathematics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-medium">
                    Topic
                  </Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Mechanics, Algebra"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty Level
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Difficulty</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exams */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Exams</Label>
                <div className="flex space-x-2">
                  <Input
                    value={examInput}
                    onChange={(e) => setExamInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "exam")}
                    placeholder="Enter exam name (e.g., JEE, NEET)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addExam} size="sm" variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {examList.map((exam, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {exam}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeExam(exam)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Previous Year Questions */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="previousYear"
                    checked={formData.previousYear}
                    onCheckedChange={(checked) => setFormData({ ...formData, previousYear: checked })}
                  />
                  <Label htmlFor="previousYear" className="text-sm font-medium">
                    Include Previous Year Questions Only
                  </Label>
                </div>

                {formData.previousYear && (
                  <div className="space-y-3 ml-6">
                    <Label className="text-sm font-medium">Years</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, "year")}
                        placeholder="Enter year (e.g., 2023, 2022)"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addYear} size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {yearList.map((year, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-2">
                          {year}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeYear(year)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Generating..." : "Generate Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
