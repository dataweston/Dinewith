export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL('/', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token = { ...token, id: user.id, role: (user as any).role }
      }

      return token
    },
    async session({ session, token }: any) {
      if (token) {
        const { id, role } = token as { id: string; role?: string }
        const { user } = session

        session = { ...session, user: { ...user, id, role } }
      }

      return session
    }
  },
  providers: [] as any
} as const
