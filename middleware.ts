import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for token in cookies or headers
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")

  // If no token and trying to access protected route, redirect to login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  // Decode JWT to get user role (assumes JWT payload has 'role')
let userRole = null
if (token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      + '='.repeat((4 - base64Url.length % 4) % 4)
    const jsonPayload = atob(base64)  // Use atob instead of Buffer
    userRole = JSON.parse(jsonPayload).role
  } catch (e) {
    userRole = null
  }
}
  // Define teacher-restricted routes (example: only allow /dashboard/content-management for teacher)
const teacherAllowedRoutes = [
  "/dashboard", // <-- Add this line
  "/dashboard/categories",
  "/dashboard/daily-tests",
  "/dashboard/current-affairs",
  "/dashboard/live-tests",
  "/dashboard/questions",
  "/dashboard/test-series",
  "/dashboard/tests",
  
  // add more allowed teacher routes here
]

if (userRole === "teacher") {
  // Only allow exact matches or subroutes, but prevent redirect loop on /dashboard
  const isAllowed = teacherAllowedRoutes.some((route) => {
    if (route === "/dashboard") {
      // Allow only exact /dashboard, not all subroutes
      return pathname === "/dashboard"
    }
    return pathname.startsWith(route)
  })
  if (!isAllowed && pathname.startsWith("/dashboard")) {
    // Redirect to dashboard root for teachers
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
}

  // Admin has access to all routes
  // Other roles can be handled similarly

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
