"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, RefreshCw, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CategoryModal } from "@/components/modals/category-modal"
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
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch categories from API using Axios
  const fetchCategories = async () => {
    try {
      setIsRefreshing(true)
      const data = await categoryApi.getAll()
      setCategories(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to load categories"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleView = (category: Category) => {
    setEditingCategory(category)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      await categoryApi.delete(categoryToDelete.id!)

      toast({
        title: "Category deleted",
        description: `${categoryToDelete.name} has been deleted successfully.`,
      })

      // Refresh categories list
      await fetchCategories()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to delete category"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    fetchCategories() // Refresh the list after successful create/update
  }

  const handleRefresh = () => {
    fetchCategories()
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
        <Skeleton className="h-10 w-80" />
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
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32">Colors</TableHead>
              <TableHead className="w-20">Tests</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No categories found matching your search."
                    : "No categories found. Create your first category to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="text-2xl flex items-center justify-center">{category.icon || "📁"}</div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate" title={category.description}>
                      {category.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {category.color?.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {category.color?.length > 3 && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          +{category.color.length - 3}
                        </div>
                      )}
                      {(!category.color || category.color.length === 0) && (
                        <span className="text-xs text-muted-foreground">No colors</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {category.testsCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.status === "active" ? "default" : "secondary"}>
                      {category.status || "active"}
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
                        <DropdownMenuItem onClick={() => handleView(category)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(category)}
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

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{categoryToDelete?.name}" and may
              affect associated tests.
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
