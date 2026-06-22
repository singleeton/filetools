import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './lib/i18n/config'

export function middleware(request: NextRequest) {
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
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
