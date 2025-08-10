"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, RefreshCw, Loader2, Languages } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuestionModal } from "@/components/modals/question-modal"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { questionsApi, type Question } from "@/lib/api/questions"
import type { AxiosError } from "axios"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Get unique values for filters
  const subjects = Array.from(new Set(questions.map((q) => q.subject).filter(Boolean)))
  const exams = Array.from(new Set(questions.flatMap((q) => q.exam || []).filter(Boolean)))

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setIsRefreshing(true)
      const data = await questionsApi.getAll()
      setQuestions(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load questions"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error fetching questions:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // Filter questions based on all criteria
  useEffect(() => {
    const filtered = questions.filter((question) => {
      const matchesSearch =
        question.text.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.text.hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.topic.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubject = subjectFilter === "all" || question.subject === subjectFilter
      const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter
      const matchesExam = examFilter === "all" || (question.exam && question.exam.includes(examFilter))
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && question.isActive) ||
        (statusFilter === "inactive" && !question.isActive)

      return matchesSearch && matchesSubject && matchesDifficulty && matchesExam && matchesStatus
    })

    setFilteredQuestions(filtered)
  }, [questions, searchTerm, subjectFilter, difficultyFilter, examFilter, statusFilter])

  const handleView = (question: Question) => {
    setEditingQuestion(question)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingQuestion(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (question: Question) => {
    setQuestionToDelete(question)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!questionToDelete) return

    try {
      setIsDeleting(true)
      await questionsApi.delete(questionToDelete.id!)

      toast({
        title: "Question deleted",
        description: "The question has been deleted successfully.",
      })

      await fetchQuestions()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete question"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchQuestions()
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-md border">
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Languages className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Questions</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchQuestions} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam} value={exam}>
                {exam}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Exams</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-20">Language</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ||
                  subjectFilter !== "all" ||
                  difficultyFilter !== "all" ||
                  examFilter !== "all" ||
                  statusFilter !== "all"
                    ? "No questions found matching your filters."
                    : "No questions found. Create your first question to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question) => (
                <TableRow key={question.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="max-w-[300px]">
                      <div className="font-medium truncate" title={question.text.en}>
                        {question.text.en}
                      </div>
                      {question.text.hi && (
                        <div className="text-xs text-muted-foreground truncate" title={question.text.hi}>
                          {question.text.hi}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {question.subject || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{question.topic || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.exam && question.exam.length > 0 ? (
                        question.exam.slice(0, 2).map((exam) => (
                          <Badge key={exam} variant="secondary" className="text-xs">
                            {exam}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                      {question.exam && question.exam.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{question.exam.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span className="ml-1 text-xs">{question.text.hi ? "EN/HI" : "EN"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={question.isActive ? "default" : "secondary"}>
                      {question.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(question)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(question)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(question)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={editingQuestion}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question and remove it from all associated
              tests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
