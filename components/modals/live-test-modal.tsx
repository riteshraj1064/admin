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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Calendar, Clock, Users, Target } from "lucide-react"
import { liveTestsApi, type LiveTest, type CreateLiveTestRequest } from "@/lib/api/live-tests"
import type { AxiosError } from "axios"

interface LiveTestModalProps {
  isOpen: boolean
  onClose: () => void
  liveTest?: LiveTest | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function LiveTestModal({ isOpen, onClose, liveTest, mode, onSuccess }: LiveTestModalProps) {
  const [formData, setFormData] = useState<CreateLiveTestRequest>({
    title: "",
    category: "",
    difficulty: "Medium",
    startTime: "",
    endTime: "",
    duration: 60,
    questions: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (liveTest && isOpen) {
      const startTime = new Date(liveTest.startTime)
      const endTime = new Date(liveTest.endTime)

      setFormData({
        title: liveTest.title || "",
        category: liveTest.category || "",
        difficulty: liveTest.difficulty || "Medium",
        startTime: startTime.toISOString().slice(0, 16), // Format for datetime-local input
        endTime: endTime.toISOString().slice(0, 16),
        duration: liveTest.duration || 60,
        questions: liveTest.questions || [],
      })
    } else if (!liveTest && isOpen) {
      // Set default start time to current time + 1 hour
      const now = new Date()
      const startTime = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // +1 hour from start

      setFormData({
        title: "",
        category: "",
        difficulty: "Medium",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        duration: 60,
        questions: [],
      })
    }
  }, [liveTest, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    // Validate dates
    const startDate = new Date(formData.startTime)
    const endDate = new Date(formData.endTime)
    const now = new Date()

    if (startDate <= now) {
      toast({
        title: "Invalid Start Time",
        description: "Start time must be in the future.",
        variant: "destructive",
      })
      return
    }

    if (endDate <= startDate) {
      toast({
        title: "Invalid End Time",
        description: "End time must be after start time.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let result: LiveTest

      const submitData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      }

      if (mode === "create") {
        result = await liveTestsApi.create(submitData)
        toast({
          title: "Live Test created",
          description: `${formData.title} has been created successfully.`,
        })
      } else {
        const id = liveTest?._id || liveTest?.id
        if (!id) throw new Error("Live test ID not found")

        result = await liveTestsApi.update(id, submitData)
        toast({
          title: "Live Test updated",
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

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Live Test"
      case "edit":
        return "Edit Live Test"
      case "view":
        return "View Live Test"
      default:
        return "Live Test"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Schedule a new live test for students."
      case "edit":
        return "Make changes to the live test here."
      case "view":
        return "Live test details and information."
      default:
        return ""
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTestStatus = () => {
    if (!liveTest) return null

    const now = new Date()
    const startTime = new Date(liveTest.startTime)
    const endTime = new Date(liveTest.endTime)

    if (now < startTime) return { status: "Upcoming", color: "bg-blue-500" }
    if (now >= startTime && now <= endTime) return { status: "Live", color: "bg-green-500" }
    return { status: "Completed", color: "bg-gray-500" }
  }

  const testStatus = getTestStatus()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-300 border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {getTitle()}
            {testStatus && mode === "view" && (
              <span className={`ml-auto px-2 py-1 text-xs text-white rounded-full ${testStatus.color}`}>
                {testStatus.status}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Test Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={mode === "view"}
                placeholder="Enter live test title"
                className="w-full"
              />
            </div>

            {/* Category and Difficulty Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={mode === "view"}
                  placeholder="e.g., Physics, Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty *
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

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  disabled={mode === "view"}
                  className="w-full"
                />
                {mode === "view" && (
                  <div className="text-xs text-muted-foreground">{formatDateTime(formData.startTime)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  disabled={mode === "view"}
                  className="w-full"
                />
                {mode === "view" && (
                  <div className="text-xs text-muted-foreground">{formatDateTime(formData.endTime)}</div>
                )}
              </div>
            </div>

            {/* Duration Field */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration (minutes) *
              </Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 60 })}
                required
                disabled={mode === "view"}
                placeholder="60"
                min="1"
                className="w-full md:w-48"
              />
            </div>

            {/* Statistics (View Mode Only) */}
            {mode === "view" && liveTest && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{liveTest.attempts || 0}</div>
                    <div className="text-xs text-muted-foreground">Attempts</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{liveTest.questions?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{liveTest.duration}m</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : mode === "create" ? "Create Live Test" : "Update Live Test"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
