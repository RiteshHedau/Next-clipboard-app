import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Redirect to login if accessing a protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to home if accessing login/signup with valid token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/profile/:path*',
  ]
}