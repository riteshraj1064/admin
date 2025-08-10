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
  Heart,
  MessageCircle,
  Calendar,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrentAffairModal } from "@/components/modals/current-affair-modal"
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
import { currentAffairsApi, type CurrentAffair } from "@/lib/api/current-affairs"
import type { AxiosError } from "axios"

export default function CurrentAffairsPage() {
  const [currentAffairs, setCurrentAffairs] = useState<CurrentAffair[]>([])
  const [filteredAffairs, setFilteredAffairs] = useState<CurrentAffair[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [engagementFilter, setEngagementFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingAffair, setEditingAffair] = useState<CurrentAffair | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [affairToDelete, setAffairToDelete] = useState<CurrentAffair | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch current affairs
  const fetchCurrentAffairs = async () => {
    try {
      setIsRefreshing(true)
      const data = await currentAffairsApi.getAll()
      setCurrentAffairs(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load current affairs"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error fetching current affairs:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCurrentAffairs()
  }, [])

  // Get date category for filtering
  const getDateCategory = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) return "week"
    if (diffDays <= 30) return "month"
    return "older"
  }

  // Get engagement level
  const getEngagementLevel = (affair: CurrentAffair) => {
    const totalEngagement = affair.likes + (affair.comments?.length || 0)
    if (totalEngagement >= 50) return "high"
    if (totalEngagement >= 10) return "medium"
    return "low"
  }

  // Filter current affairs based on all criteria
  useEffect(() => {
    const filtered = currentAffairs.filter((affair) => {
      const matchesSearch =
        affair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affair.summary.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = dateFilter === "all" || getDateCategory(affair.date) === dateFilter

      const matchesEngagement = engagementFilter === "all" || getEngagementLevel(affair) === engagementFilter

      return matchesSearch && matchesDate && matchesEngagement
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredAffairs(filtered)
  }, [currentAffairs, searchTerm, dateFilter, engagementFilter])

  const handleView = (affair: CurrentAffair) => {
    setEditingAffair(affair)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (affair: CurrentAffair) => {
    setEditingAffair(affair)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingAffair(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (affair: CurrentAffair) => {
    setAffairToDelete(affair)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!affairToDelete) return

    try {
      setIsDeleting(true)
      const id = affairToDelete._id || affairToDelete.id
      if (!id) throw new Error("Current affair ID not found")

      await currentAffairsApi.delete(id)

      toast({
        title: "Current Affair deleted",
        description: `${affairToDelete.title} has been deleted successfully.`,
      })

      await fetchCurrentAffairs()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete current affair"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAffairToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchCurrentAffairs()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getEngagementBadge = (affair: CurrentAffair) => {
    const level = getEngagementLevel(affair)
    switch (level) {
      case "high":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">None</Badge>
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
        <h2 className="text-3xl font-bold tracking-tight">Current Affairs</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchCurrentAffairs} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="older">Older</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engagementFilter} onValueChange={setEngagementFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Engagement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredAffairs.length} of {currentAffairs.length} articles
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="w-20">Likes</TableHead>
              <TableHead className="w-20">Comments</TableHead>
              <TableHead className="w-24">Engagement</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm || dateFilter !== "all" || engagementFilter !== "all"
                    ? "No current affairs found matching your filters."
                    : "No current affairs found. Create your first article to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAffairs.map((affair) => (
                <TableRow key={affair._id || affair.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium max-w-[250px] truncate" title={affair.title}>
                      {affair.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{formatDate(affair.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate text-sm text-muted-foreground" title={affair.summary}>
                      {affair.summary}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span className="text-sm">{affair.likes}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <MessageCircle className="w-3 h-3 text-blue-500" />
                      <span className="text-sm">{affair.comments?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getEngagementBadge(affair)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(affair)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(affair)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(affair)}
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

      {/* Current Affair Modal */}
      <CurrentAffairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentAffair={editingAffair}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the current affair article "
              {affairToDelete?.title}" and all associated likes and comments.
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
