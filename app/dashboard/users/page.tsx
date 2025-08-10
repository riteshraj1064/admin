"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, Edit, Trash2, Shield, Users, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usersApi, type User } from "@/lib/api/users"
import { UserModal } from "@/components/modals/user-modal"
import { BulkUserModal } from "@/components/modals/bulk-user-modal"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, roleFilter, statusFilter, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await usersApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setUsers(response.users)
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "activate" | "suspend" | "view") => {
    if (action === "view") {
      setSelectedUserId(userId)
      setUserModalOpen(true)
      return
    }

    try {
      if (action === "activate") {
        await usersApi.activateUser(userId)
        toast({
          title: "Success",
          description: "User activated successfully",
        })
      } else {
        await usersApi.suspendUser(userId)
        toast({
          title: "Success",
          description: "User suspended successfully",
        })
      }
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
      console.error(`Error ${action}ing user:`, error)
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user._id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleExport = async (format: "csv" | "excel") => {
    try {
      const blob = await usersApi.exportUsers(format, {
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users.${format === "csv" ? "csv" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `Users exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      })
      console.error("Error exporting users:", error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "teacher":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "student":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (user: User) => {
    if (user.isSuspended) return "bg-red-100 text-red-800 border-red-200"
    if (!user.isActive) return "bg-gray-100 text-gray-800 border-gray-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusText = (user: User) => {
    if (user.isSuspended) return "Suspended"
    if (!user.isActive) return "Inactive"
    return "Active"
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedUsers.length > 0 && (
            <Button
              onClick={() => setBulkModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Bulk Actions ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {users.filter((u) => u.isActive && !u.isSuspended).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{users.filter((u) => u.isSuspended).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">User</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={(checked) => handleSelectUser(user._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden break-all">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="break-all">{user.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={`${getRoleColor(user.role)} text-xs`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`${getStatusColor(user)} text-xs`}>{getStatusText(user)}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction(user._id, "view")}>
                            <Edit className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isSuspended || !user.isActive ? (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user._id, "activate")}
                              className="text-green-600"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleUserAction(user._id, "suspend")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
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
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* Modals */}
      <UserModal open={userModalOpen} onOpenChange={setUserModalOpen} userId={selectedUserId} onSuccess={fetchUsers} />

      <BulkUserModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedUserIds={selectedUsers}
        selectedUserCount={selectedUsers.length}
        onSuccess={() => {
          fetchUsers()
          setSelectedUsers([])
        }}
      />
    </div>
  )
}
