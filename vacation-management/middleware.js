import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // Rutas que requieren roles específicos
    const adminRoutes = ['/settings', '/admin']
    const hrRoutes = ['/employees', '/reports', '/sync']
    const managerRoutes = ['/approvals', '/team']

    // Verificar acceso a rutas de admin
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(token?.role)) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }

    // Verificar acceso a rutas de HR
    if (hrRoutes.some(route => pathname.startsWith(route))) {
      if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(token?.role)) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }

    // Verificar acceso a rutas de manager
    if (managerRoutes.some(route => pathname.startsWith(route))) {
      if (!['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'].includes(token?.role)) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/requests/:path*',
    '/approvals/:path*',
    '/calendar/:path*',
    '/team/:path*',
    '/employees/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/sync/:path*',
    '/admin/:path*'
  ]
}
