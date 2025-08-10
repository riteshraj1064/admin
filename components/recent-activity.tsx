"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    user: "John Doe",
    action: "completed JEE Main Mock Test #5",
    time: "2 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JD",
  },
  {
    user: "Sarah Wilson",
    action: "started NEET Biology Series",
    time: "5 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SW",
  },
  {
    user: "Mike Johnson",
    action: "achieved 95% in Physics Test",
    time: "10 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MJ",
  },
  {
    user: "Emily Davis",
    action: "registered for Premium plan",
    time: "15 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "ED",
  },
  {
    user: "Alex Brown",
    action: "completed Chemistry Mock Test",
    time: "20 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "AB",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="text-xs text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}
