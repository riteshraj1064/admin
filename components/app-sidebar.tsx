"use client"

import type * as React from "react"
import {
  BookOpen,
  BarChart3,
  Users,
  Settings,
  FolderOpen,
  FileText,
  HelpCircle,
  Trophy,
  LayoutDashboard,
  Calendar,
  Newspaper,
  CalendarDays,
  Bell,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        {
          title: "Categories",
          url: "/dashboard/categories",
          icon: FolderOpen,
        },
        {
          title: "Test Series",
          url: "/dashboard/test-series",
          icon: BookOpen,
        },
        {
          title: "Tests",
          url: "/dashboard/tests",
          icon: FileText,
        },
        {
          title: "Live Tests",
          url: "/dashboard/live-tests",
          icon: Calendar,
        },
        {
          title: "Daily Tests",
          url: "/dashboard/daily-tests",
          icon: CalendarDays,
        },
        {
          title: "Questions",
          url: "/dashboard/questions",
          icon: HelpCircle,
        },
        {
          title: "Current Affairs",
          url: "/dashboard/current-affairs",
          icon: Newspaper,
        },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: Bell,
        },
        {
          title: "Results",
          url: "/dashboard/results",
          icon: Trophy,
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Analytics",
          url: "/dashboard/analytics",
          icon: BarChart3,
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  // Get user role from localStorage (client-side only)
  let userRole: string | null = null
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user")
      userRole = userStr ? JSON.parse(userStr).role : null
    } catch {
      userRole = null
    }
  }

  // If teacher, only show Content Management group
  const navGroups = userRole === "teacher"
    ? data.navMain.filter((group) => group.title === "Content Management")
    : data.navMain

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">TestPrep Admin</span>
            <span className="truncate text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">© 2024 TestPrep Platform</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
