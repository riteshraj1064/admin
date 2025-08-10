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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { questionsApi, type Question } from "@/lib/api/questions"
import { Loader2, Plus, X, Languages, CheckCircle } from "lucide-react"
import type { AxiosError } from "axios"

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  question: Question | null
  mode: "create" | "edit" | "view"
  onSuccess: () => void
}

export function QuestionModal({ isOpen, onClose, question, mode, onSuccess }: QuestionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [examTags, setExamTags] = useState<string[]>([])
  const [yearTags, setYearTags] = useState<number[]>([])
  const [newExam, setNewExam] = useState("")
  const [newYear, setNewYear] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    text: { en: "", hi: "" },
    options: { en: ["", "", "", ""], hi: ["", "", "", ""] },
    explanation: { en: "", hi: "" },
    correctAnswer: "",
    subject: "",
    topic: "",
    exam: [] as string[],
    previousYear: false,
    year: [] as number[],
    difficulty: "medium" as "easy" | "medium" | "hard",
    isActive: true,
  })

  useEffect(() => {
    if (question && (mode === "edit" || mode === "view")) {
      setFormData({
        text: question.text || { en: "", hi: "" },
        options: question.options || { en: ["", "", "", ""], hi: ["", "", "", ""] },
        explanation: question.explanation || { en: "", hi: "" },
        correctAnswer: question.correctAnswer || "",
        subject: question.subject || "",
        topic: question.topic || "",
        exam: question.exam || [],
        previousYear: question.previousYear || false,
        year: question.year || [],
        difficulty: question.difficulty || "medium",
        isActive: question.isActive !== undefined ? question.isActive : true,
      })
      setExamTags(question.exam || [])
      setYearTags(question.year || [])
    } else {
      // Reset form for create mode
      setFormData({
        text: { en: "", hi: "" },
        options: { en: ["", "", "", ""], hi: ["", "", "", ""] },
        explanation: { en: "", hi: "" },
        correctAnswer: "",
        subject: "",
        topic: "",
        exam: [],
        previousYear: false,
        year: [],
        difficulty: "medium",
        isActive: true,
      })
      setExamTags([])
      setYearTags([])
    }
  }, [question, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    // Validation
    if (!formData.text.en.trim()) {
      toast({
        title: "Validation Error",
        description: "English question text is required.",
        variant: "destructive",
      })
      return
    }

    if (formData.options.en.some((opt) => !opt.trim())) {
      toast({
        title: "Validation Error",
        description: "All English options are required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.correctAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Correct answer is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const questionData = {
        ...formData,
        exam: examTags,
        year: yearTags,
      }

      if (mode === "create") {
        await questionsApi.create(questionData)
        toast({
          title: "Question created",
          description: "The question has been created successfully.",
        })
      } else {
        await questionsApi.update(question!.id!, questionData)
        toast({
          title: "Question updated",
          description: "The question has been updated successfully.",
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || `Failed to ${mode} question`

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addExamTag = () => {
    if (newExam.trim() && !examTags.includes(newExam.trim())) {
      setExamTags([...examTags, newExam.trim()])
      setNewExam("")
    }
  }

  const removeExamTag = (exam: string) => {
    setExamTags(examTags.filter((e) => e !== exam))
  }

  const addYearTag = () => {
    const year = Number.parseInt(newYear)
    if (year && !yearTags.includes(year)) {
      setYearTags([...yearTags, year])
      setNewYear("")
    }
  }

  const removeYearTag = (year: number) => {
    setYearTags(yearTags.filter((y) => y !== year))
  }

  const updateOption = (lang: "en" | "hi", index: number, value: string) => {
    const newOptions = { ...formData.options }
    newOptions[lang][index] = value
    setFormData({ ...formData, options: newOptions })
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {mode === "create" ? "Create Question" : mode === "edit" ? "Edit Question" : "Question Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new question with English and Hindi translations."
              : mode === "edit"
                ? "Update the question details and translations."
                : "View question details and translations."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "view" && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Question Status</p>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? "Active" : "Inactive"} • Created with bilingual support
                </p>
              </div>
            </div>
          )}

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Question Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question-en">Question (English) *</Label>
                  <Textarea
                    id="question-en"
                    placeholder="Enter question in English..."
                    value={formData.text.en}
                    onChange={(e) => setFormData({ ...formData, text: { ...formData.text, en: e.target.value } })}
                    disabled={mode === "view"}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-hi">Question (Hindi)</Label>
                  <Textarea
                    id="question-hi"
                    placeholder="प्रश्न हिंदी में दर्ज करें..."
                    value={formData.text.hi}
                    onChange={(e) => setFormData({ ...formData, text: { ...formData.text, hi: e.target.value } })}
                    disabled={mode === "view"}
                    rows={3}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <Label>Options *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">English Options</h4>
                    {formData.options.en.map((option, index) => (
                      <div key={index} className="space-y-1">
                        <Label htmlFor={`option-en-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                        <Input
                          id={`option-en-${index}`}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => updateOption("en", index, e.target.value)}
                          disabled={mode === "view"}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Hindi Options</h4>
                    {formData.options.hi.map((option, index) => (
                      <div key={index} className="space-y-1">
                        <Label htmlFor={`option-hi-${index}`}>विकल्प {String.fromCharCode(65 + index)}</Label>
                        <Input
                          id={`option-hi-${index}`}
                          placeholder={`विकल्प ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => updateOption("hi", index, e.target.value)}
                          disabled={mode === "view"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label htmlFor="correct-answer">Correct Answer *</Label>
                <Input
                  id="correct-answer"
                  placeholder="Enter the correct answer..."
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  disabled={mode === "view"}
                  required
                />
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="explanation-en">Explanation (English)</Label>
                  <Textarea
                    id="explanation-en"
                    placeholder="Explain the answer in English..."
                    value={formData.explanation.en}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: { ...formData.explanation, en: e.target.value } })
                    }
                    disabled={mode === "view"}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation-hi">Explanation (Hindi)</Label>
                  <Textarea
                    id="explanation-hi"
                    placeholder="उत्तर की व्याख्या हिंदी में करें..."
                    value={formData.explanation.hi}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: { ...formData.explanation, hi: e.target.value } })
                    }
                    disabled={mode === "view"}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              {/* Subject and Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Science"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={mode === "view"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Algebra, Physics"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              {/* Exam Tags */}
              <div className="space-y-2">
                <Label>Exam Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {examTags.map((exam) => (
                    <Badge key={exam} variant="secondary" className="flex items-center gap-1">
                      {exam}
                      {mode !== "view" && <X className="h-3 w-3 cursor-pointer" onClick={() => removeExamTag(exam)} />}
                    </Badge>
                  ))}
                </div>
                {mode !== "view" && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add exam (e.g., SSC, UPSC)"
                      value={newExam}
                      onChange={(e) => setNewExam(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExamTag())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addExamTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Year Tags */}
              <div className="space-y-2">
                <Label>Year Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {yearTags.map((year) => (
                    <Badge key={year} variant="outline" className="flex items-center gap-1">
                      {year}
                      {mode !== "view" && <X className="h-3 w-3 cursor-pointer" onClick={() => removeYearTag(year)} />}
                    </Badge>
                  ))}
                </div>
                {mode !== "view" && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add year (e.g., 2023)"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addYearTag())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addYearTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                {mode === "view" ? (
                  <Badge className={`capitalize ${getDifficultyColor(formData.difficulty)}`}>
                    {formData.difficulty}
                  </Badge>
                ) : (
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setFormData({ ...formData, difficulty: value })
                    }
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

              {/* Previous Year Question */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="previous-year"
                  checked={formData.previousYear}
                  onCheckedChange={(checked) => setFormData({ ...formData, previousYear: checked })}
                  disabled={mode === "view"}
                />
                <Label htmlFor="previous-year">Previous Year Question</Label>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={mode === "view"}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </TabsContent>
          </Tabs>

          {mode !== "view" && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Question" : "Update Question"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
