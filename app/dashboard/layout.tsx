"use client"

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNavbar />
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
