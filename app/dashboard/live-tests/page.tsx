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
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveTestModal } from "@/components/modals/live-test-modal"
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
import { liveTestsApi, type LiveTest } from "@/lib/api/live-tests"
import type { AxiosError } from "axios"
import { ImportQuestionsModal } from "@/components/modals/import-questions-modal"

export default function LiveTestsPage() {
  const [liveTests, setLiveTests] = useState<LiveTest[]>([])
  const [filteredTests, setFilteredTests] = useState<LiveTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingTest, setEditingTest] = useState<LiveTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<LiveTest | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTestData, setImportTestData] = useState<{ id: string; title: string } | null>(null)

  // Fetch live tests
  const fetchLiveTests = async () => {
    try {
      setIsRefreshing(true)
      const data = await liveTestsApi.getAll()
      setLiveTests(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load live tests"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error fetching live tests:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLiveTests()
  }, [])

  // Get test status
  const getTestStatus = (test: LiveTest) => {
    const now = new Date()
    const startTime = new Date(test.startTime)
    const endTime = new Date(test.endTime)

    if (now < startTime) return "upcoming"
    if (now >= startTime && now <= endTime) return "live"
    return "completed"
  }

  // Filter tests based on all criteria
  useEffect(() => {
    const filtered = liveTests.filter((test) => {
      const matchesSearch =
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())

      const testStatus = getTestStatus(test)
      const matchesStatus = statusFilter === "all" || testStatus === statusFilter

      const matchesDifficulty = difficultyFilter === "all" || test.difficulty?.toLowerCase() === difficultyFilter

      return matchesSearch && matchesStatus && matchesDifficulty
    })

    // Sort by start time (upcoming first, then live, then completed)
    filtered.sort((a, b) => {
      const statusA = getTestStatus(a)
      const statusB = getTestStatus(b)

      if (statusA === statusB) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }

      const statusOrder = { upcoming: 0, live: 1, completed: 2 }
      return statusOrder[statusA] - statusOrder[statusB]
    })

    setFilteredTests(filtered)
  }, [liveTests, searchTerm, statusFilter, difficultyFilter])

  const handleView = (test: LiveTest) => {
    setEditingTest(test)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (test: LiveTest) => {
    setEditingTest(test)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingTest(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (test: LiveTest) => {
    setTestToDelete(test)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testToDelete) return

    try {
      setIsDeleting(true)
      const id = testToDelete._id || testToDelete.id
      if (!id) throw new Error("Test ID not found")

      await liveTestsApi.delete(id)

      toast({
        title: "Live Test deleted",
        description: `${testToDelete.title} has been deleted successfully.`,
      })

      await fetchLiveTests()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete live test"

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
    fetchLiveTests()
  }

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (test: LiveTest) => {
    const status = getTestStatus(test)

    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Upcoming
          </Badge>
        )
      case "live":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
            <Play className="w-3 h-3" />
            Live
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const handleImportQuestions = (test: LiveTest) => {
    const testId = test._id || test.id
    if (testId) {
      setImportTestData({ id: testId, title: test.title })
      setIsImportModalOpen(true)
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
        <h2 className="text-3xl font-bold tracking-tight">Live Tests</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchLiveTests} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Live Test
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search live tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
          {filteredTests.length} of {liveTests.length} tests
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead className="w-20">Duration</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-20">Attempts</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || difficultyFilter !== "all"
                    ? "No live tests found matching your filters."
                    : "No live tests found. Schedule your first live test to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
                <TableRow key={test._id || test.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium max-w-[200px] truncate" title={test.title}>
                      {test.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {test.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(test)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{formatDateTime(test.startTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{formatDateTime(test.endTime)}</span>
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

      {/* Live Test Modal */}
      <LiveTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        liveTest={editingTest}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the live test "{testToDelete?.title}" and may
              affect student registrations and results.
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
        testType="live"
        testTitle={importTestData?.title || ""}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
