import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const auth = NextAuth(authConfig).auth

export default auth(async function middleware(req) {
  const { nextUrl, auth } = req
  const isLoggedIn = !!auth?.user
  const userRole = auth?.user?.role

  // Route guards for role-based access
  const isHostRoute = nextUrl.pathname.startsWith('/host')
  const isModRoute = nextUrl.pathname.startsWith('/mod')

  if (isHostRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    // Any logged-in user can access /host/apply
    // Future: restrict other /host routes to HOST role
  }

  if (isModRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
