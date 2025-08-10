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
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function CategoryModal({ isOpen, onClose, category, mode, onSuccess }: CategoryModalProps) {
  const [formData, setFormData] = useState<Omit<Category, "id">>({
    name: "",
    description: "",
    icon: "",
    color: [],
  })
  const [colorInput, setColorInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "",
        color: category.color || [],
      })
    } else if (!category && isOpen) {
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: [],
      })
    }
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    setIsLoading(true)

    try {
      let result: Category

      if (mode === "create") {
        result = await categoryApi.create(formData)
        toast({
          title: "Category created",
          description: `${formData.name} has been created successfully.`,
        })
      } else {
        result = await categoryApi.update(category!.id!, formData)
        toast({
          title: "Category updated",
          description: `${formData.name} has been updated successfully.`,
        })
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addColor = () => {
    if (colorInput.trim() && !formData.color.includes(colorInput.trim())) {
      setFormData({
        ...formData,
        color: [...formData.color, colorInput.trim()],
      })
      setColorInput("")
    }
  }

  const removeColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      color: formData.color.filter((color) => color !== colorToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addColor()
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Category"
      case "edit":
        return "Edit Category"
      case "view":
        return "View Category"
      default:
        return "Category"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new category to organize your tests."
      case "edit":
        return "Make changes to the category here."
      case "view":
        return "Category details and information."
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-300 border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">{getTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={mode === "view"}
                placeholder="Enter category name"
                className="w-full"
              />
            </div>

            {/* Icon Field */}
            <div className="space-y-2">
              <Label htmlFor="icon" className="text-sm font-medium">
                Icon
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎯"
                  disabled={mode === "view"}
                  className="flex-1"
                />
                {formData.icon && (
                  <div className="flex items-center justify-center w-12 h-12 text-2xl border rounded-lg bg-muted/30">
                    {formData.icon}
                  </div>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={mode === "view"}
                placeholder="Enter category description"
                className="w-full resize-none"
              />
            </div>

            {/* Colors Field */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Colors</Label>

              {mode !== "view" && (
                <div className="flex space-x-2">
                  <Input
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter color (e.g., #3B82F6, blue, red)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addColor} size="sm" variant="outline" className="px-4 bg-transparent">
                    Add
                  </Button>
                </div>
              )}

              <div className="min-h-[60px] p-3 border rounded-lg bg-muted/20">
                {formData.color.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.color.map((color, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1 bg-background border"
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium">{color}</span>
                        {mode !== "view" && (
                          <X
                            className="w-4 h-4 cursor-pointer hover:text-destructive transition-colors"
                            onClick={() => removeColor(color)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 text-sm text-muted-foreground">
                    No colors added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
