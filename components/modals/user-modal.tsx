"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Shield, Mail, Calendar, Activity, UserCheck, UserX, Loader2 } from "lucide-react"
import { usersApi, type User as UserType } from "@/lib/api/users"
import axiosInstance from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
  onSuccess?: () => void
}

export function UserModal({ open, onOpenChange, userId, onSuccess }: UserModalProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && userId) {
      fetchUser()
      fetchAnalytics(userId)
    }
  }, [open, userId])

  const fetchAnalytics = async (userId: string) => {
    setAnalytics(null)
    setAnalyticsLoading(true)
    try {
      const { data } = await axiosInstance.get(`/result/${userId}/analytics`)
      setAnalytics(data)
    } catch (error) {
      setAnalytics(null)
      // Optionally toast error
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchUser = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await usersApi.getUserById(userId)
      setUser(response.user)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (newRole: string) => {
    if (!user) return

    setUpdating(true)
    try {
      const response = await usersApi.updateUserRole(user._id, newRole)
      setUser(response.user)
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
      console.error("Error updating role:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusUpdate = async (action: "activate" | "suspend") => {
    if (!user) return

    setUpdating(true)
    try {
      const response =
        action === "activate" ? await usersApi.activateUser(user._id) : await usersApi.suspendUser(user._id)

      setUser(response.user)
      toast({
        title: "Success",
        description: response.message,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
      console.error(`Error ${action}ing user:`, error)
    } finally {
      setUpdating(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "teacher":
        return "default"
      case "student":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (user: UserType) => {
    if (user.isSuspended) return "destructive"
    if (!user.isActive) return "secondary"
    return "default"
  }

  const getStatusText = (user: UserType) => {
    if (user.isSuspended) return "Suspended"
    if (!user.isActive) return "Inactive"
    return "Active"
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-2xl w-full max-w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 mx-2 sm:mx-auto rounded-xl p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
    <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs sm:text-sm">
              Permissions
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <CardTitle className="text-lg sm:text-xl">{user.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="break-all">{user.email}</span>
                    </CardDescription>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                      <Badge variant={getRoleColor(user.role)} className="text-xs">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <Badge variant={getStatusColor(user)} className="text-xs">
                        {getStatusText(user)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm font-mono break-all">{user._id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Join Date</Label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {user.modifiedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Modified</Label>
                    <p className="text-sm">{new Date(user.modifiedAt).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Role & Permissions
                </CardTitle>
                <CardDescription className="text-sm">Manage user role and account status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm">
                    User Role
                  </Label>
                  <Select value={user.role} onValueChange={handleRoleUpdate} disabled={updating}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm">Account Status</Label>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Account Active</p>
                      <p className="text-xs text-muted-foreground">User can access the platform</p>
                    </div>
                    <Switch
                      checked={user.isActive && !user.isSuspended}
                      disabled={updating}
                      onCheckedChange={(checked) => handleStatusUpdate(checked ? "activate" : "suspend")}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("activate")}
                    disabled={updating || (user.isActive && !user.isSuspended)}
                    className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("suspend")}
                    disabled={updating || user.isSuspended}
                    className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  >
                    {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserX className="h-4 w-4 mr-2" />}
                    Suspend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5" />
                  User Activity & Analytics
                </CardTitle>
                <CardDescription className="text-sm">Recent activity and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>Loading analytics...</span>
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Tests</Label>
                        <div className="text-lg font-bold">{analytics.overview?.totalTests ?? '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Questions</Label>
                        <div className="text-lg font-bold">{analytics.overview?.totalQuestions ?? '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Avg Score</Label>
                        <div className="text-lg font-bold">{analytics.overview?.avgScore ?? '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Rank</Label>
                        <div className="text-lg font-bold">{analytics.overview?.rank ?? '-'}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Strongest Subject</Label>
                      <div className="font-medium">{analytics.overview?.strongestSubject ?? '-'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Weakest Subject</Label>
                      <div className="font-medium">{analytics.overview?.weakestSubject ?? '-'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Recent Scores</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analytics.recentScores?.length ? analytics.recentScores.map((score: number, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-muted rounded text-xs font-mono">{score}</span>
                        )) : <span>-</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Subjects</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                        {analytics.subjects?.length ? analytics.subjects.map((sub: any, idx: number) => (
                          <div key={idx} className="p-2 border rounded bg-muted/30">
                            <div className="font-semibold">{sub.name}</div>
                            <div className="text-xs">Score: {sub.score}</div>
                            <div className="text-xs">Tests: {sub.tests}</div>
                            <div className="text-xs">Time: {sub.timeSpent} min</div>
                          </div>
                        )) : <span>-</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Weekly Progress</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analytics.weeklyProgress?.length ? analytics.weeklyProgress.map((w: any, idx: number) => (
                          <div key={idx} className="p-2 border rounded bg-muted/30 text-xs">
                            <div className="font-semibold">{w.day}</div>
                            <div>Score: {w.score}</div>
                            <div>Tests: {w.tests}</div>
                            <div>Time: {w.time}</div>
                          </div>
                        )) : <span>-</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Monthly Goal</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-1 bg-muted rounded text-xs">Target: {analytics.monthlyGoal?.target ?? '-'}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs">Completed: {analytics.monthlyGoal?.completed ?? '-'}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs">Remaining: {analytics.monthlyGoal?.remaining ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
