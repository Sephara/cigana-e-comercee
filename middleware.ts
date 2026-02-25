import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware MÍNIMO para teste – sem redirect por domínio, sem forçar HTTPS, sem HSTS.
 * Quando o site abrir, você pode restaurar a versão com segurança (redirect para domínio + HTTPS).
 */
const ADMIN_LOGIN = '/admin/login'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Só protege /admin (exceto login)
  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
