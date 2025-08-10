"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, RefreshCw, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestSeriesModal } from "@/components/modals/test-series-modal"
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
import { testSeriesApi, type TestSeries } from "@/lib/api/test-series"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

export default function TestSeriesPage() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [premiumFilter, setPremiumFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingTestSeries, setEditingTestSeries] = useState<TestSeries | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testSeriesToDelete, setTestSeriesToDelete] = useState<TestSeries | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch test series and categories
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const [testSeriesData, categoriesData] = await Promise.all([testSeriesApi.getAll(), categoryApi.getAll()])
      setTestSeries(testSeriesData)
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

  // Filter test series
  const filteredTestSeries = testSeries.filter((series) => {
    const matchesSearch =
      series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" ||
      (typeof series.Category === "string"
        ? series.Category === categoryFilter
        : series.Category?.id === categoryFilter)

    const matchesDifficulty = difficultyFilter === "all" || series.difficulty?.toLowerCase() === difficultyFilter

    const matchesPremium =
      premiumFilter === "all" || (premiumFilter === "premium" ? series.isPremium : !series.isPremium)

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPremium
  })

  const handleView = (series: TestSeries) => {
    setEditingTestSeries(series)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (series: TestSeries) => {
    setEditingTestSeries(series)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingTestSeries(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (series: TestSeries) => {
    setTestSeriesToDelete(series)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testSeriesToDelete) return

    try {
      setIsDeleting(true)
      await testSeriesApi.delete(testSeriesToDelete.id!)

      toast({
        title: "Test Series deleted",
        description: `${testSeriesToDelete.title} has been deleted successfully.`,
      })

      await fetchData()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete test series"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTestSeriesToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchData()
  }

  const getCategoryName = (category: string | Category) => {
    if (typeof category === "string") {
      const cat = categories.find((c) => c.id === category)
      return cat ? `${cat.icon} ${cat.name}` : "Unknown"
    }
    return category ? `${category.icon} ${category.name}` : "Unknown"
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
        <h2 className="text-3xl font-bold tracking-tight">Test Series</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Test Series
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test series..."
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

        <Select value={premiumFilter} onValueChange={setPremiumFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredTestSeries.length} of {testSeries.length} series
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-20">Tests</TableHead>
              <TableHead className="w-24">Duration</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-20">Type</TableHead>
              <TableHead className="w-20">Hours</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestSeries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || premiumFilter !== "all"
                    ? "No test series found matching your filters."
                    : "No test series found. Create your first test series to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTestSeries.map((series) => (
                <TableRow key={series.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="text-xl flex items-center justify-center">{series.icon || "📚"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-[200px] truncate" title={series.title}>
                      {series.title}
                    </div>
                    {series.description && (
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={series.description}>
                        {series.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getCategoryName(series.Category)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="text-xs">
                        {series.totalTests}
                      </Badge>
                      {series.freeTestsCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">{series.freeTestsCount} free</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{series.duration || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        series.difficulty === "Hard"
                          ? "destructive"
                          : series.difficulty === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {series.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={series.isPremium ? "default" : "outline"}>
                      {series.isPremium ? "Premium" : "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">{series.estimatedHours || 0}h</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(series)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(series)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(series)}
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

      {/* Test Series Modal */}
      <TestSeriesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testSeries={editingTestSeries}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test series "{testSeriesToDelete?.title}"
              and may affect associated tests and user progress.
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
