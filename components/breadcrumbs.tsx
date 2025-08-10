"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    return { href, label }
  })

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href} className="hover:text-foreground">
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
