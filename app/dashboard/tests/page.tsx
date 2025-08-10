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
  Wand2,
  Clock,
  Users,
  Target,
  Upload,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestModal } from "@/components/modals/test-modal"
import { GenerateTestModal } from "@/components/modals/generate-test-modal"
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
import { testsApi, type Test } from "@/lib/api/tests"
import { testSeriesApi, type TestSeries } from "@/lib/api/test-series"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"
import { ImportQuestionsModal } from "@/components/modals/import-questions-modal"

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredTestSeries, setFilteredTestSeries] = useState<TestSeries[]>([])
  const [filteredTests, setFilteredTests] = useState<Test[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [seriesFilter, setSeriesFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<Test | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTestData, setImportTestData] = useState<{ id: string; title: string } | null>(null)

  // Fetch tests, test series, and categories
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const [testsData, seriesData, categoriesData] = await Promise.all([
        testsApi.getAll(),
        testSeriesApi.getAll(),
        categoryApi.getAll(),
      ])
      setTests(testsData)
      setTestSeries(seriesData)
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

  // Filter test series based on selected category
  useEffect(() => {
    if (categoryFilter === "all") {
      setFilteredTestSeries(testSeries)
    } else {
      const filtered = testSeries.filter((series) => {
        const categoryId = typeof series.Category === "string" ? series.Category : series.Category?.id
        return categoryId === categoryFilter
      })
      setFilteredTestSeries(filtered)

      // Reset series filter if current selection is not in filtered list
      if (seriesFilter !== "all" && !filtered.some((series) => series.id === seriesFilter)) {
        setSeriesFilter("all")
      }
    }
  }, [categoryFilter, testSeries, seriesFilter])

  // Filter tests based on all criteria
  useEffect(() => {
    const filtered = tests.filter((test) => {
      const matchesSearch =
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === "all" ||
        (() => {
          // If category filter is set, check if test's series belongs to that category
          if (test.testSeries) {
            const testSeriesId = typeof test.testSeries === "string" ? test.testSeries : test.testSeries.id
            const series = testSeries.find((s) => s.id === testSeriesId)
            if (series) {
              const seriesCategoryId = typeof series.Category === "string" ? series.Category : series.Category?.id
              return seriesCategoryId === categoryFilter
            }
          }
          return categoryFilter === "all"
        })()

      const matchesDifficulty = difficultyFilter === "all" || test.difficulty?.toLowerCase() === difficultyFilter

      const matchesSeries =
        seriesFilter === "all" ||
        (typeof test.testSeries === "string" ? test.testSeries === seriesFilter : test.testSeries?.id === seriesFilter)

      return matchesSearch && matchesCategory && matchesDifficulty && matchesSeries
    })

    setFilteredTests(filtered)
  }, [tests, testSeries, searchTerm, categoryFilter, difficultyFilter, seriesFilter])

  const handleView = (test: Test) => {
    setEditingTest(test)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (test: Test) => {
    setEditingTest(test)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingTest(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleGenerate = () => {
    setIsGenerateModalOpen(true)
  }

  const handleDelete = (test: Test) => {
    setTestToDelete(test)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testToDelete) return

    try {
      setIsDeleting(true)
      await testsApi.delete(testToDelete.id!)

      toast({
        title: "Test deleted",
        description: `${testToDelete.title} has been deleted successfully.`,
      })

      await fetchData()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete test"

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

  const getSeriesName = (series: string | TestSeries | undefined) => {
    if (!series) return "No Series"
    if (typeof series === "string") {
      const foundSeries = testSeries.find((s) => s.id === series)
      return foundSeries ? `${foundSeries.icon} ${foundSeries.title}` : "Unknown Series"
    }
    return `${series.icon} ${series.title}`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? `${category.icon} ${category.name}` : "Unknown"
  }

  const handleImportQuestions = (test: Test) => {
    setImportTestData({ id: test._id! || test.id!, title: test.title })
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
            <Skeleton className="h-10 w-40" />
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
        <h2 className="text-3xl font-bold tracking-tight">Tests</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleGenerate}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Test
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Test
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
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

        <Select value={seriesFilter} onValueChange={setSeriesFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Test Series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Series</SelectItem>
            {filteredTestSeries.map((series) => (
              <SelectItem key={series.id} value={series.id}>
                {series.icon} {series.title}
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
          {filteredTests.length} of {tests.length} tests
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Test Series</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || seriesFilter !== "all"
                    ? "No tests found matching your filters."
                    : "No tests found. Create your first test to get started."}
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
                    <Badge variant="outline" className="text-xs">
                      {test.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[150px] truncate">{getSeriesName(test.testSeries)}</div>
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
                    <Badge
                      variant={
                        test.difficulty === "Hard"
                          ? "destructive"
                          : test.difficulty === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {test.difficulty}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleImportQuestions(test)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(test)}
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

      {/* Test Modal */}
      <TestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        test={editingTest}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Generate Test Modal */}
      <GenerateTestModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test "{testToDelete?.title}" and may affect
              user progress and results.
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
        testType="test"
        testTitle={importTestData?.title || ""}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
