import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight proxy — checks for Supabase session cookie to protect routes.
 * Actual auth verification happens in server components (dashboard layout).
 * We avoid importing @supabase/ssr here to keep the edge runtime compatible.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for any Supabase auth cookie (named sb-*-auth-token)
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
