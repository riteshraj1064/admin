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
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationModal } from "@/components/modals/notification-modal"
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
import { notificationsApi, type Notification } from "@/lib/api/notifications"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [pagination.page, typeFilter, priorityFilter, searchTerm])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsApi.getNotifications({
        page: pagination.page,
        limit: pagination.limit,
        type: typeFilter === "all" ? undefined : typeFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      })

      // Filter by search term on frontend for now
      let filteredNotifications = response.notifications
      if (searchTerm) {
        filteredNotifications = response.notifications.filter(
          (notification) =>
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setNotifications(filteredNotifications)
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await notificationsApi.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleView = (notification: Notification) => {
    setEditingNotification(notification)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingNotification(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (notification: Notification) => {
    setNotificationToDelete(notification)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!notificationToDelete) return

    setIsDeleting(true)
    try {
      await notificationsApi.deleteNotification(notificationToDelete._id)
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })
      fetchNotifications()
      fetchStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
      console.error("Error deleting notification:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setNotificationToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchNotifications()
    fetchStats()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getRecipientText = (recipients: Notification["recipients"]) => {
    switch (recipients.type) {
      case "all":
        return "All Users"
      case "role":
        return `Roles: ${recipients.roles?.join(", ") || "None"}`
      case "specific":
        return `${recipients.userIds?.length || 0} Users`
      default:
        return "Unknown"
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Send and manage notifications to users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={fetchNotifications}
            disabled={loading}
            className="w-full sm:w-auto bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.byPriority.high || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.byType.error || 0}</div>
          </CardContent>
        </Card>
      </div>



      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Recipients</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No notifications found</p>
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="min-w-[200px]">
                      <div className="font-medium truncate" title={notification.title}>
                        {notification.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1 sm:hidden">
                        {notification.message}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={`${getTypeColor(notification.type)} text-xs`}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(notification.type)}
                          <span className="capitalize">{notification.type}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">{getRecipientText(notification.recipients)}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">{new Date(notification.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(notification)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(notification)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(notification)}>
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        notification={editingNotification}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification "{notificationToDelete?.title}
              ".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
