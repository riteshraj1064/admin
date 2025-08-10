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
import { Loader2, Newspaper, Heart, MessageCircle, Calendar } from "lucide-react"
import { currentAffairsApi, type CurrentAffair, type CreateCurrentAffairRequest } from "@/lib/api/current-affairs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { AxiosError } from "axios"

interface CurrentAffairModalProps {
  isOpen: boolean
  onClose: () => void
  currentAffair?: CurrentAffair | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function CurrentAffairModal({ isOpen, onClose, currentAffair, mode, onSuccess }: CurrentAffairModalProps) {
  const [formData, setFormData] = useState<CreateCurrentAffairRequest>({
    title: "",
    summary: "",
    date: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (currentAffair && isOpen) {
      setFormData({
        title: currentAffair.title || "",
        summary: currentAffair.summary || "",
        date: currentAffair.date || "",
      })
    } else if (!currentAffair && isOpen) {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        title: "",
        summary: "",
        date: today,
      })
    }
  }, [currentAffair, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    setIsLoading(true)

    try {
      let result: CurrentAffair

      if (mode === "create") {
        result = await currentAffairsApi.create(formData)
        toast({
          title: "Current Affair created",
          description: `${formData.title} has been created successfully.`,
        })
      } else {
        const id = currentAffair?._id || currentAffair?.id
        if (!id) throw new Error("Current affair ID not found")

        result = await currentAffairsApi.update(id, formData)
        toast({
          title: "Current Affair updated",
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
        return "Create Current Affair"
      case "edit":
        return "Edit Current Affair"
      case "view":
        return "View Current Affair"
      default:
        return "Current Affair"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new current affair article for students."
      case "edit":
        return "Make changes to the current affair article."
      case "view":
        return "Current affair details and engagement metrics."
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-slate-300 border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Newspaper className="mr-2 h-5 w-5" />
            {getTitle()}
          </DialogTitle>
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
                placeholder="Enter current affair title"
                className="w-full"
              />
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={mode === "view"}
                className="w-full md:w-48"
              />
              {mode === "view" && formData.date && (
                <div className="text-xs text-muted-foreground">{formatDate(formData.date)}</div>
              )}
            </div>

            {/* Summary Field */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-sm font-medium">
                Summary *
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
                disabled={mode === "view"}
                placeholder="Enter detailed summary of the current affair"
                className="w-full resize-none"
                rows={6}
              />
              <div className="text-xs text-muted-foreground text-right">{formData.summary.length} characters</div>
            </div>

            {/* Engagement Stats (View Mode Only) */}
            {mode === "view" && currentAffair && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Engagement Statistics</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">{currentAffair.likes || 0}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{currentAffair.comments?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {currentAffair.comments && currentAffair.comments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-md font-medium">Recent Comments</h4>
                      <ScrollArea className="h-48 w-full border rounded-lg p-3">
                        <div className="space-y-3">
                          {currentAffair.comments.map((comment, index) => (
                            <div key={comment._id || index} className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {comment.user}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground pl-2 border-l-2 border-muted">
                                {comment.text}
                              </p>
                              {index < currentAffair.comments.length - 1 && <Separator className="my-2" />}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Creation Info */}
                  {currentAffair.createdAt && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Created: {new Date(currentAffair.createdAt).toLocaleString()}</span>
                    </div>
                  )}
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
                {isLoading ? "Saving..." : mode === "create" ? "Create Article" : "Update Article"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
