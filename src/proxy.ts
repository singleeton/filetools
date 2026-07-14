import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './lib/i18n/config'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const acceptLanguage = request.headers.get('Accept-Language') || ''
  const detectedLocale =
    locales.find((locale) =>
      acceptLanguage.toLowerCase().includes(locale),
    ) || defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${detectedLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Skip API routes, admin, Next internals, and any path with a file
    // extension (static assets in /public — images, fonts, txt, xml, ...).
    '/((?!api|admin|_next/static|_next/image|.*\\..*).*)',
  ],
}
