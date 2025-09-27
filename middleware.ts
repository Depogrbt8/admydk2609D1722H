import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API rotaları ve login sayfası için kontrol yapma
  if (
    pathname.startsWith('/api/') ||
    pathname === '/' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Admin paneli veya ilgili rotalar için authentication kontrolü
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/ayarlar') ||
    pathname.startsWith('/dis-apiler') ||
    pathname.startsWith('/email') ||
    pathname.startsWith('/apiler') ||
    pathname.startsWith('/kampanyalar') ||
    pathname.startsWith('/kullanici') ||
    pathname.startsWith('/sistem') ||
    pathname.startsWith('/raporlar') ||
    pathname.startsWith('/istatistikler') ||
    pathname.startsWith('/rezervasyonlar') ||
    pathname.startsWith('/ucuslar') ||
    pathname.startsWith('/odemeler') ||
    pathname.startsWith('/dashboard')
  ) {
    // Token kontrolü
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Token yoksa login sayfasına yönlendir
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grbt8-admin-secret-2024') as any
      
      if (!decoded || decoded.role !== 'admin') {
        // Geçersiz token veya admin değil
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Token geçerli, devam et
      const response = NextResponse.next()

      // Temel güvenlik
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

      // Sıkı Content Security Policy (admin panel odaklı)
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.github.com https://www.grbt8.store https://anasite.grbt8.store",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')

      response.headers.set('Content-Security-Policy', csp)

      return response

    } catch (error) {
      // Token geçersiz
      console.log('Token doğrulama hatası:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
