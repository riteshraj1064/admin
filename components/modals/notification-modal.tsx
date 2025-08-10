"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Users, AlertTriangle, Info, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { notificationsApi, type Notification, type CreateNotificationRequest } from "@/lib/api/notifications"
import { usersApi, type User } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"
import { pushNotificationManager } from "@/lib/push-notifications"

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification?: Notification | null
  mode: "create" | "edit" | "view"
  onSuccess?: () => void
}

export function NotificationModal({ open, onOpenChange, notification, mode, onSuccess }: NotificationModalProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateNotificationRequest>({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    recipients: {
      type: "all",
    },
    data: {
      url: ""
    }
  })
  const [sendPushNotification, setSendPushNotification] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchUsers()
      if (notification && (mode === "edit" || mode === "view")) {
        setFormData({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          recipients: notification.recipients,
          expiresAt: notification.expiresAt,
          data: notification.data || { url: "" },
        })
        if (notification.recipients.userIds) {
          setSelectedUsers(notification.recipients.userIds)
        }
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          message: "",
          type: "info",
          priority: "medium",
          recipients: {
            type: "all",
          },
          data: { url: "" },
        })
        setSelectedUsers([])
      }
    }
  }, [open, notification, mode])

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers({ limit: 1000 })
      setUsers(response.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        recipients: {
          ...formData.recipients,
          userIds: formData.recipients.type === "specific" ? selectedUsers : undefined,
        },
        data: {
          url: formData.data?.url || ""
        }
      }

      if (mode === "create") {
        await notificationsApi.createNotification(submitData)
        toast({
          title: "Success",
          description: "Notification created successfully",
        })
      } else {
        await notificationsApi.updateNotification(notification!._id, submitData)
        toast({
          title: "Success",
          description: "Notification updated successfully",
        })
      }

      onSuccess?.()
      onOpenChange(false)

      // After successful notification creation/update, send push notification
      if (sendPushNotification) {
        try {
          const pushPayload = {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            priority: formData.priority,
            data: { notificationId: notification?._id || "new" },
          }

          if (formData.recipients.type === "all") {
            await pushNotificationManager.sendToAll(pushPayload)
          } else if (formData.recipients.type === "specific" && selectedUsers.length > 0) {
            await pushNotificationManager.sendToBatch(selectedUsers, pushPayload)
          }

          toast({
            title: "Success",
            description: "Push notification sent successfully",
          })
        } catch (error) {
          console.error("Failed to send push notification:", error)
          toast({
            title: "Warning",
            description: "Notification created but push notification failed",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} notification`,
        variant: "destructive",
      })
      console.error(`Error ${mode}ing notification:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-4xl w-full max-w-full max-h-[90vh] bg-white dark:bg-slate-900 overflow-y-auto mx-2 sm:mx-auto rounded-xl p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="h-5 w-5" />
            {mode === "create" ? "Create Notification" : mode === "edit" ? "Edit Notification" : "Notification Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                Content
              </TabsTrigger>
              <TabsTrigger value="recipients" className="text-xs sm:text-sm">
                Recipients
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={mode === "view"}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Info
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Success
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Warning
                        </div>
                      </SelectItem>
                      <SelectItem value="error">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Error
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires" className="text-sm">
                    Expires At (Optional)
                  </Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                    disabled={mode === "view"}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={mode === "view"}
                  required
                  rows={6}
                  className="w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm">
                  URL (optional)
                </Label>
                <Input
                  id="url"
                  placeholder="Enter URL (e.g. /tabs/series)"
                  value={formData.data?.url || ""}
                  onChange={(e) => setFormData({ ...formData, data: { ...formData.data, url: e.target.value } })}
                  disabled={mode === "view"}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">This URL will be sent with the notification data.</p>
              </div>

              {mode === "view" && notification && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg border ${getTypeColor(notification.type)}`}>
                      <div className="flex items-start gap-3">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                          </div>
                          <p className="text-sm">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>From: {notification.sender.name}</span>
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Select Recipients
                  </CardTitle>
                  <CardDescription className="text-sm">Choose who will receive this notification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Recipient Type</Label>
                    <Select
                      value={formData.recipients.type}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          recipients: { ...formData.recipients, type: value },
                        })
                      }
                      disabled={mode === "view"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="role">By Role</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.recipients.type === "role" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Select Roles</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["admin", "teacher", "student", "user"].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={role}
                              checked={formData.recipients.roles?.includes(role) || false}
                              onCheckedChange={(checked) => {
                                const currentRoles = formData.recipients.roles || []
                                const newRoles = checked
                                  ? [...currentRoles, role]
                                  : currentRoles.filter((r) => r !== role)
                                setFormData({
                                  ...formData,
                                  recipients: { ...formData.recipients, roles: newRoles },
                                })
                              }}
                              disabled={mode === "view"}
                            />
                            <Label htmlFor={role} className="text-sm capitalize">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.recipients.type === "specific" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Select Users ({selectedUsers.length} selected)</Label>
                      <ScrollArea className="h-64 border rounded-md p-2 sm:p-4">
                        <div className="space-y-2">
                          {users.map((user) => (
                            <div key={user._id} className="flex items-center space-x-2">
                              <Checkbox
                                id={user._id}
                                checked={selectedUsers.includes(user._id)}
                                onCheckedChange={(checked) => handleUserSelect(user._id, checked as boolean)}
                                disabled={mode === "view"}
                              />
                              <Label htmlFor={user._id} className="flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{user.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pushNotification"
                        checked={sendPushNotification}
                        onCheckedChange={(checked) => setSendPushNotification(checked as boolean)}
                        disabled={mode === "view"}
                      />
                      <Label htmlFor="pushNotification" className="text-sm">
                        Send as push notification
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Users will receive a real-time push notification on their devices
                    </p>
                  </div>

                  {mode === "view" && notification && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Recipients Summary</h4>
                      <div className="text-sm text-muted-foreground">
                        {notification.recipients.type === "all" && "All users will receive this notification"}
                        {notification.recipients.type === "role" &&
                          `Users with roles: ${notification.recipients.roles?.join(", ")}`}
                        {notification.recipients.type === "specific" &&
                          `${notification.recipients.userIds?.length || 0} specific users selected`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "create" ? "Create Notification" : "Update Notification"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
