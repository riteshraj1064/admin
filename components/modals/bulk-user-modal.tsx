"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Shield, UserCheck, UserX, Loader2 } from "lucide-react"
import { usersApi } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"

interface BulkUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUserIds: string[]
  selectedUserCount: number
  onSuccess?: () => void
}

export function BulkUserModal({
  open,
  onOpenChange,
  selectedUserIds,
  selectedUserCount,
  onSuccess,
}: BulkUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [bulkRole, setBulkRole] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const { toast } = useToast()

  const handleBulkActivate = async () => {
    setLoading(true)
    try {
      const response = await usersApi.bulkActivateUsers(selectedUserIds)
      toast({
        title: "Success",
        description: `${response.updated} users activated successfully`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate users",
        variant: "destructive",
      })
      console.error("Error activating users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkSuspend = async () => {
    setLoading(true)
    try {
      const response = await usersApi.bulkSuspendUsers(selectedUserIds)
      toast({
        title: "Success",
        description: `${response.updated} users suspended successfully`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend users",
        variant: "destructive",
      })
      console.error("Error suspending users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkRoleUpdate = async () => {
    if (!bulkRole) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await usersApi.bulkUpdateRole(selectedUserIds, bulkRole)
      toast({
        title: "Success",
        description: `${response.updated} users updated to ${bulkRole} role`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      })
      console.error("Error updating roles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await usersApi.sendEmail(selectedUserIds, emailSubject, emailMessage)
      toast({
        title: "Success",
        description: `Email sent to ${selectedUserCount} users`,
      })
      setEmailSubject("")
      setEmailMessage("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
      console.error("Error sending email:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-slate-300 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk User Actions
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedUserCount} selected
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="status" className="text-xs sm:text-sm">
              Status
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">
              Roles
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm">
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5" />
                  Update User Status
                </CardTitle>
                <CardDescription className="text-sm">Activate or suspend multiple users at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={handleBulkActivate}
                    disabled={loading}
                    className="h-auto p-4 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserCheck className="h-6 w-6" />}
                    <span className="font-medium">Activate Users</span>
                    <span className="text-xs opacity-90">Enable access for {selectedUserCount} users</span>
                  </Button>
                  <Button
                    onClick={handleBulkSuspend}
                    disabled={loading}
                    className="h-auto p-4 flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserX className="h-6 w-6" />}
                    <span className="font-medium">Suspend Users</span>
                    <span className="text-xs opacity-90">Disable access for {selectedUserCount} users</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Update User Roles
                </CardTitle>
                <CardDescription className="text-sm">Change the role for multiple users simultaneously</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-role" className="text-sm">
                    Select New Role
                  </Label>
                  <Select value={bulkRole} onValueChange={setBulkRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleBulkRoleUpdate}
                  disabled={loading || !bulkRole}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update {selectedUserCount} Users to {bulkRole || "Selected"} Role
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  Send Email
                </CardTitle>
                <CardDescription className="text-sm">Send an email to all selected users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject" className="text-sm">
                    Subject
                  </Label>
                  <Input
                    id="email-subject"
                    placeholder="Enter email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-message" className="text-sm">
                    Message
                  </Label>
                  <Textarea
                    id="email-message"
                    placeholder="Enter your message here..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={6}
                    className="w-full resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendEmail}
                  disabled={loading || !emailSubject.trim() || !emailMessage.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Send Email to {selectedUserCount} Users
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
