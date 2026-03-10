import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge-compatible middleware — no external imports, simple cookie check.
 * Actual auth verification happens in server components (dashboard layout).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase stores the session in cookies named sb-<project-ref>-auth-token
  const hasSession = request.cookies.getAll().some(c => c.name.includes('auth-token'))

  const protectedPaths = ['/dashboard', '/create', '/jobs', '/settings', '/credits', '/admin']
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
