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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { X, Loader2, Plus } from "lucide-react"
import { testSeriesApi, type TestSeries } from "@/lib/api/test-series"
import { categoryApi, type Category } from "@/lib/api/categories"
import type { AxiosError } from "axios"

interface TestSeriesModalProps {
  isOpen: boolean
  onClose: () => void
  testSeries?: TestSeries | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function TestSeriesModal({ isOpen, onClose, testSeries, mode, onSuccess }: TestSeriesModalProps) {
  const [formData, setFormData] = useState<Omit<TestSeries, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    Category: "",
    totalTests: 0,
    isPremium: false,
    duration: "",
    features: [],
    difficulty: "Medium",
    estimatedHours: 0,
    icon: "",
    freeTestsCount: 0,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const { toast } = useToast()

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await categoryApi.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (testSeries && isOpen) {
      setFormData({
        title: testSeries.title || "",
        description: testSeries.description || "",
        Category: typeof testSeries.Category === "string" ? testSeries.Category : testSeries.Category?.id || "",
        totalTests: testSeries.totalTests || 0,
        isPremium: testSeries.isPremium || false,
        duration: testSeries.duration || "",
        features: testSeries.features || [],
        difficulty: testSeries.difficulty || "Medium",
        estimatedHours: testSeries.estimatedHours || 0,
        icon: testSeries.icon || "",
        freeTestsCount: testSeries.freeTestsCount || 0,
      })
    } else if (!testSeries && isOpen) {
      setFormData({
        title: "",
        description: "",
        Category: "",
        totalTests: 0,
        isPremium: false,
        duration: "",
        features: [],
        difficulty: "Medium",
        estimatedHours: 0,
        icon: "",
        freeTestsCount: 0,
      })
    }
  }, [testSeries, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    setIsLoading(true)

    try {
      let result: TestSeries

      if (mode === "create") {
        result = await testSeriesApi.create(formData)
        toast({
          title: "Test Series created",
          description: `${formData.title} has been created successfully.`,
        })
      } else {
        result = await testSeriesApi.update(testSeries!.id!, formData)
        toast({
          title: "Test Series updated",
          description: `${formData.title} has been updated successfully.`,
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

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  const removeFeature = (featureToRemove: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((feature) => feature !== featureToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Test Series"
      case "edit":
        return "Edit Test Series"
      case "view":
        return "View Test Series"
      default:
        return "Test Series"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new test series to your platform."
      case "edit":
        return "Make changes to the test series here."
      case "view":
        return "Test series details and information."
      default:
        return ""
    }
  }

  const selectedCategory = categories.find((cat) => cat.id === formData.Category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-slate-300 border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">{getTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={mode === "view"}
                placeholder="Enter test series title"
                className="w-full"
              />
            </div>

            {/* Category and Icon Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select
                  value={formData.Category}
                  onValueChange={(value) => setFormData({ ...formData, Category: value })}
                  disabled={mode === "view" || loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedCategory.icon} {selectedCategory.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium">
                  Icon
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📚"
                    disabled={mode === "view"}
                    className="flex-1"
                  />
                  {formData.icon && (
                    <div className="flex items-center justify-center w-10 h-10 text-xl border rounded-lg bg-muted/30">
                      {formData.icon}
                    </div>
                  )}
                </div>
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
                placeholder="Enter test series description"
                className="w-full resize-none"
              />
            </div>

            {/* Numbers Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalTests" className="text-sm font-medium">
                  Total Tests *
                </Label>
                <Input
                  id="totalTests"
                  type="number"
                  value={formData.totalTests}
                  onChange={(e) => setFormData({ ...formData, totalTests: Number.parseInt(e.target.value) || 0 })}
                  required
                  disabled={mode === "view"}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeTestsCount" className="text-sm font-medium">
                  Free Tests
                </Label>
                <Input
                  id="freeTestsCount"
                  type="number"
                  value={formData.freeTestsCount}
                  onChange={(e) => setFormData({ ...formData, freeTestsCount: Number.parseInt(e.target.value) || 0 })}
                  disabled={mode === "view"}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours" className="text-sm font-medium">
                  Estimated Hours
                </Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: Number.parseInt(e.target.value) || 0 })}
                  disabled={mode === "view"}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Duration and Difficulty Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  disabled={mode === "view"}
                  placeholder="e.g., 3 hours, 180 minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center space-x-3">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                disabled={mode === "view"}
              />
              <Label htmlFor="isPremium" className="text-sm font-medium">
                Premium Test Series
              </Label>
            </div>

            {/* Features Field */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Features</Label>

              {mode !== "view" && (
                <div className="flex space-x-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a feature"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addFeature} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="min-h-[60px] p-3 border rounded-lg bg-muted/20">
                {formData.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                        <span className="text-sm">{feature}</span>
                        {mode !== "view" && (
                          <X
                            className="w-4 h-4 cursor-pointer hover:text-destructive transition-colors"
                            onClick={() => removeFeature(feature)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 text-sm text-muted-foreground">
                    No features added yet
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
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : mode === "create" ? "Create Series" : "Update Series"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
