"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  Clock,
  Users,
  Target,
  Calendar,
  Upload,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DailyTestModal } from "@/components/modals/daily-test-modal"
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
import { dailyTestsApi, type DailyTest } from "@/lib/api/daily-tests"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"
import { ImportQuestionsModal } from "@/components/modals/import-questions-modal"

export default function DailyTestsPage() {
  const [dailyTests, setDailyTests] = useState<DailyTest[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredTests, setFilteredTests] = useState<DailyTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingTest, setEditingTest] = useState<DailyTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<DailyTest | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTestData, setImportTestData] = useState<{ id: string; title: string } | null>(null)

  // Fetch daily tests and categories
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const [testsData, categoriesData] = await Promise.all([dailyTestsApi.getAll(), categoryApi.getAll()])
      setDailyTests(testsData.results)
      setCategories(categoriesData)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load data"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter tests based on all criteria
  useEffect(() => {
    const filtered = dailyTests.filter((test) => {
      const matchesSearch =
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === "all" ||
        (typeof test.category === "string" ? test.category === categoryFilter : test.category?.id === categoryFilter)

      const matchesDifficulty = difficultyFilter === "all" || test.difficulty === difficultyFilter

      return matchesSearch && matchesCategory && matchesDifficulty
    })

    setFilteredTests(filtered)
  }, [dailyTests, searchTerm, categoryFilter, difficultyFilter])

  const handleView = (test: DailyTest) => {
    setEditingTest(test)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (test: DailyTest) => {
    setEditingTest(test)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingTest(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (test: DailyTest) => {
    setTestToDelete(test)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testToDelete) return

    try {
      setIsDeleting(true)
      await dailyTestsApi.delete(testToDelete.id!)

      toast({
        title: "Daily test deleted",
        description: `${testToDelete.title} has been deleted successfully.`,
      })

      await fetchData()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete daily test"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTestToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchData()
  }

  const getCategoryName = (category: string | Category) => {
    if (typeof category === "string") {
      const foundCategory = categories.find((c) => c.id === category)
      return foundCategory ? `${foundCategory.icon} ${foundCategory.name}` : "Unknown Category"
    }
    return `${category.icon} ${category.name}`
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

  const handleImportQuestions = (test: DailyTest) => {
    console.log(test)
    setImportTestData({ id: test._id!, title: test.title })
    setIsImportModalOpen(true)
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
          <Calendar className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Daily Tests</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Daily Test
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search daily tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
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

        <div className="text-sm text-muted-foreground">
          {filteredTests.length} of {dailyTests.length} tests
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-20">Questions</TableHead>
              <TableHead className="w-20">Duration</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-20">Attempts</TableHead>
              <TableHead className="w-20">Avg Score</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all"
                    ? "No daily tests found matching your filters."
                    : "No daily tests found. Create your first daily test to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
                <TableRow key={test.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium max-w-[200px] truncate" title={test.title}>
                      {test.title}
                    </div>
                    {test.description && (
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={test.description}>
                        {test.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[150px] truncate">{getCategoryName(test.category)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Badge variant="secondary" className="text-xs">
                        {test.totalQuestions}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{test.duration}m</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${getDifficultyColor(test.difficulty)}`}>{test.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{test.attempts}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{test.avgScore.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(test)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(test)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(test)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImportQuestions(test)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Questions
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

      {/* Daily Test Modal */}
      <DailyTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dailyTest={editingTest}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the daily test "{testToDelete?.title}" and may
              affect user progress and results.
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

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        testId={importTestData?.id || ""}
        testType="daily"
        testTitle={importTestData?.title || ""}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
